import base64
import gc
import json
import os
import re
import sys
import time

import requests
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


OPENROUTER_IMAGE_API = "https://openrouter.ai/api/v1/images"
# flux.2-flex is confirmed available on /api/v1/images and supports input_references (max 8)
FLUX_MODEL = "black-forest-labs/flux.2-flex"
STYLE_SUFFIX = "Ensure it looks like a whimsical children's book watercolor illustration with a white background."


def _encode_image_b64(image_path: str) -> str:
    """Read a local image file and return a base64 data URL."""
    ext = os.path.splitext(image_path)[1].lstrip(".").lower()
    mime = "image/jpeg" if ext in ("jpg", "jpeg") else f"image/{ext}"
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    return f"data:{mime};base64,{b64}"


def _strip_sd_weights(prompt: str) -> str:
    """Remove Stable Diffusion weighting syntax, e.g. (dragon:1.5) -> dragon."""
    return re.sub(r'\(([^)]+):[0-9.]+\)', r'\1', prompt).strip()


def _is_moderation_error(error_body: object) -> bool:
    """Return True if the API error is a content moderation hit."""
    text = str(error_body).lower()
    return 'moderat' in text


def _is_retryable_error(status_code: int) -> bool:
    """Return True for transient HTTP errors worth retrying (rate-limit, server errors)."""
    return status_code == 429 or status_code >= 500


def _generate_image(openrouter_key: str, prompt: str, reference_image_path: str | None,
                    max_retries: int = 3, backoff_base: float = 2.0) -> bytes:
    """
    Call the OpenRouter Image API (POST /api/v1/images) and return raw image bytes.

    Retry strategy:
      - Transient errors (429, 5xx, timeout): exponential backoff, up to max_retries.
      - Moderation hits (400 "Request Moderated"): retry with progressively simpler prompts:
          1st retry  → strip SD weighting syntax  (e.g. "(dragon:1.5)" → "dragon")
          2nd retry  → use bare original prompt with no style suffix
      - Other 4xx: fail immediately (bad request, auth, etc.).

    Uses the exact schema from https://openrouter.ai/docs/api/api-reference/images/create-images:
      input_references: [{ "type": "image_url", "image_url": { "url": "..." } }]
      Response: { "data": [{ "b64_json": "..." }] }
    """
    headers = {
        "Authorization": f"Bearer {openrouter_key}",
        "Content-Type": "application/json",
    }

    # Build a sequence of prompts to try: enhanced → stripped weights → bare prompt
    prompt_candidates = [
        f"{prompt}. {STYLE_SUFFIX}",
        f"{_strip_sd_weights(prompt)}. {STYLE_SUFFIX}",
        prompt,  # bare fallback — no enhancement, no suffix
    ]

    last_error: Exception | None = None

    for attempt in range(max_retries):
        # Pick a progressively simpler prompt on moderation retries
        current_prompt = prompt_candidates[min(attempt, len(prompt_candidates) - 1)]

        payload: dict = {
            "model": FLUX_MODEL,
            "prompt": current_prompt,
        }

        if reference_image_path and os.path.exists(reference_image_path):
            payload["input_references"] = [
                {"type": "image_url", "image_url": {"url": _encode_image_b64(reference_image_path)}}
            ]

        if attempt > 0:
            print(f"  Retry {attempt}/{max_retries - 1}: prompt='{current_prompt[:80]}...'")

        try:
            response = requests.post(
                OPENROUTER_IMAGE_API, headers=headers, json=payload, timeout=120
            )
        except requests.exceptions.Timeout as e:
            last_error = e
            wait = backoff_base ** attempt
            print(f"  Timeout on attempt {attempt + 1}, retrying in {wait:.0f}s...")
            time.sleep(wait)
            continue

        if response.ok:
            data = response.json()
            b64_json = data["data"][0]["b64_json"]
            return base64.b64decode(b64_json)

        # Parse error body
        try:
            error_body = response.json()
        except Exception:
            error_body = response.text

        last_error = RuntimeError(f"HTTP {response.status_code}: {error_body}")

        if _is_moderation_error(error_body):
            print(f"  Content moderated on attempt {attempt + 1}, retrying with simpler prompt...")
            continue  # immediately retry with next (simpler) prompt candidate

        if _is_retryable_error(response.status_code):
            wait = backoff_base ** attempt
            print(f"  HTTP {response.status_code} on attempt {attempt + 1}, retrying in {wait:.0f}s...")
            time.sleep(wait)
            continue

        # Non-retryable 4xx error (bad schema, auth, etc.) — fail fast
        raise last_error

    raise last_error or RuntimeError("Image generation failed after all retries")


def main(manifest_path='/workspace/books_manifest.json', workspace_root='/workspace', local=False):
    images_dir = os.path.join(workspace_root, 'images')
    os.makedirs(images_dir, exist_ok=True)

    if not os.path.exists(manifest_path):
        print(f"Manifest not found at {manifest_path}. Please create it to define books and prompts.")
        return

    with open(manifest_path, 'r', encoding='utf-8') as f:
        books = json.load(f)

    # -------------------------------------------------------------------------
    # Phase 1: LLM Prompt Enhancement (local Qwen 0.5B)
    # Only load if there are pages that actually need generating.
    # -------------------------------------------------------------------------
    missing_pages = []
    for book in books:
        for idx, page in enumerate(book.get('pages', [])):
            if not page.get('image'):
                continue
            output_path = os.path.join(workspace_root, page['image'])
            if not os.path.exists(output_path) or page.get('replace') is True:
                missing_pages.append((book, idx, page))

    if missing_pages:
        print(f"Found {len(missing_pages)} missing page images. Loading Qwen/Qwen2.5-0.5B-Instruct into VRAM...")
        model_name = "Qwen/Qwen2.5-0.5B-Instruct"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto",
        )

        system_msg = "You are an expert prompt engineer for image generation."
        for book, idx, page in missing_pages:
            original_prompt = page.get('prompt', '')
            user_msg = (
                "Given the image prompt below, output ONLY a JSON object with two fields:\n"
                "  weight_tag: the most visually important subject as a weighting token, e.g. \"(troll:1.5)\" or \"(green snot:1.5)\".\n"
                "  ip_adapter_scale: 0.6 for normal scenes with the main character, 0.3 for heavy action, "
                "0.0 if the main character is completely ABSENT.\n"
                "Do NOT rewrite or repeat the full prompt. Output ONLY valid JSON.\n"
                'Example: {"weight_tag": "(snotty troll:1.5)", "ip_adapter_scale": 0.6}\n\n'
                f"Prompt: {original_prompt}"
            )
            messages = [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ]
            text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

            with torch.no_grad():
                generated_ids = model.generate(
                    **model_inputs,
                    max_new_tokens=64,  # weight_tag + scale only needs very few tokens
                    do_sample=False,
                    pad_token_id=tokenizer.eos_token_id,
                )
            generated_ids = [
                output_ids[len(input_ids):]
                for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
            ]
            output = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

            weight_tag = ""
            ip_adapter_scale = 0.6
            try:
                start = output.find('{')
                end = output.rfind('}')
                if start != -1 and end != -1 and end > start:
                    result = json.loads(output[start:end + 1])
                else:
                    result = json.loads(output)
                weight_tag = result.get('weight_tag', '')
                ip_adapter_scale = float(result.get('ip_adapter_scale', 0.6))
            except Exception:
                pass  # keep defaults; original prompt used as-is

            # Build enhanced prompt by appending the weight tag to the VERBATIM original.
            # The LLM never touches the prompt text, so hallucination cannot corrupt it.
            if weight_tag:
                enhanced_prompt = f"{original_prompt} {weight_tag}"
            else:
                enhanced_prompt = original_prompt

            page['enhanced_prompt'] = enhanced_prompt
            page['ip_adapter_scale'] = ip_adapter_scale
            print(f"Enhanced prompt for {book.get('id')} page {idx + 1}: '{enhanced_prompt}' (scale: {ip_adapter_scale})")

        del model
        del tokenizer
        torch.cuda.empty_cache()
        gc.collect()
        print("LLM unloaded. Proceeding to image generation.")

    # -------------------------------------------------------------------------
    # Phase 2: Image Generation (OpenRouter vs Local diffusers)
    # -------------------------------------------------------------------------
    local_pipe = None
    openrouter_key = None

    if local:
        if missing_pages:
            local_model = os.environ.get("LOCAL_MODEL", "runwayml/stable-diffusion-v1-5")
            print(f"Loading local text-to-image model ({local_model}) into VRAM...")
            from diffusers import FluxPipeline, StableDiffusionXLPipeline, StableDiffusionPipeline
            from transformers import CLIPVisionModelWithProjection

            if "FLUX" in local_model or "flux" in local_model:
                local_pipe = FluxPipeline.from_pretrained(
                    local_model,
                    torch_dtype=torch.bfloat16,
                )
                local_pipe.enable_model_cpu_offload()
            elif "xl" in local_model.lower():
                # Load CLIP vision model required by IP-Adapter for feature projection
                image_encoder = CLIPVisionModelWithProjection.from_pretrained(
                    "laion/CLIP-ViT-H-14-laion2B-s32B-b79K",
                    torch_dtype=torch.float16,
                )
                local_pipe = StableDiffusionXLPipeline.from_pretrained(
                    local_model,
                    image_encoder=image_encoder,
                    torch_dtype=torch.float16,
                    variant="fp16",
                    use_safetensors=True,
                ).to("cuda")
            else:
                # Load CLIP vision model required by IP-Adapter for feature projection
                image_encoder = CLIPVisionModelWithProjection.from_pretrained(
                    "laion/CLIP-ViT-H-14-laion2B-s32B-b79K",
                    torch_dtype=torch.float16,
                )
                local_pipe = StableDiffusionPipeline.from_pretrained(
                    local_model,
                    image_encoder=image_encoder,
                    torch_dtype=torch.float16,
                ).to("cuda")

            # Load IP-Adapter weights for style consistency across pages (SDXL/SD1.5 only)
            if "FLUX" not in local_model and "flux" not in local_model:
                try:
                    print("Loading IP-Adapter weights for local style consistency...")
                    if "xl" in local_model.lower():
                        local_pipe.load_ip_adapter(
                            "h94/IP-Adapter",
                            subfolder="sdxl_models",
                            weight_name="ip-adapter_sdxl.bin"
                        )
                    else:
                        local_pipe.load_ip_adapter(
                            "h94/IP-Adapter",
                            subfolder="models",
                            weight_name="ip-adapter_sd15.bin"
                        )
                except Exception as e:
                    print(f"Warning: Could not load local IP-Adapter: {e}. Local generation will fall back to text-only prompts.")
    else:
        openrouter_key = os.environ.get("OPENROUTER_API_KEY")
        if not openrouter_key:
            print("Error: OPENROUTER_API_KEY environment variable is missing! Cannot generate images via OpenRouter.")
            sys.exit(1)

    generated_any = False

    for book in books:
        book_id = book.get('id')
        pages = book.get('pages', [])
        last_generated_path = None  # Tracks the previous page image for reference

        for idx, page in enumerate(pages):
            target_image = page.get('image')
            if not target_image:
                continue

            output_path = os.path.join(workspace_root, target_image)
            if os.path.exists(output_path) and page.get('replace') is not True:
                # Track this existing page as the previous one for the next page
                last_generated_path = output_path
                continue

            prompt = page.get('prompt')
            if not prompt:
                continue

            enhanced_prompt = page.get('enhanced_prompt', prompt)

            if local:
                print(f"Generating image locally for {book_id} page {idx + 1} using {local_pipe.__class__.__name__}: '{enhanced_prompt}'")

                try:
                    local_model = os.environ.get("LOCAL_MODEL", "runwayml/stable-diffusion-v1-5")
                    if "FLUX" in local_model or "flux" in local_model:
                        pipe_kwargs = {
                            "prompt": f"{enhanced_prompt}. {STYLE_SUFFIX}",
                            "num_inference_steps": 4,   # schnell = 4 steps
                            "height": 1024,
                            "width": 1024,
                        }
                    else:
                        steps = 1 if "turbo" in local_model else 30
                        guidance = 0.0 if "turbo" in local_model else 7.5

                        # Prepare pipeline arguments
                        pipe_kwargs = {
                            "prompt": f"{enhanced_prompt}. {STYLE_SUFFIX}",
                            "num_inference_steps": steps,
                            "guidance_scale": guidance,
                        }

                        # Load and pass reference image to IP-Adapter if available
                        if last_generated_path and os.path.exists(last_generated_path):
                            # Only use IP-Adapter if it was successfully loaded
                            if hasattr(local_pipe, "set_ip_adapter_scale"):
                                from diffusers.utils import load_image
                                ref_img = load_image(last_generated_path)
                                pipe_kwargs["ip_adapter_image"] = ref_img
                                # Set IP-Adapter scale (returned by Qwen, defaulting to 0.6)
                                scale = page.get("ip_adapter_scale", 0.6)
                                local_pipe.set_ip_adapter_scale(scale)
                                print(f"  Using local reference image (IP-Adapter): {last_generated_path} (scale: {scale})")

                    # Run local pipeline
                    result_img = local_pipe(**pipe_kwargs).images[0]
                    result_img.save(output_path)
                    print(f"Saved: {output_path}")
                    last_generated_path = output_path
                    generated_any = True
                except Exception as e:
                    print(f"Failed to generate image locally for {book_id} page {idx + 1}: {e}")

            else:
                ref_desc = f"(ref: page {idx})" if last_generated_path else "(no reference — first page)"
                print(f"Generating image for {book_id} page {idx + 1} via OpenRouter (Flux) {ref_desc}: '{enhanced_prompt}'")
                try:
                    image_bytes = _generate_image(
                        openrouter_key=openrouter_key,
                        prompt=enhanced_prompt,
                        reference_image_path=last_generated_path,
                    )
                    with open(output_path, 'wb') as f:
                        f.write(image_bytes)
                    print(f"Saved: {output_path}")
                    last_generated_path = output_path
                    generated_any = True
                except Exception as e:
                    print(f"Failed to generate image for {book_id} page {idx + 1}: {e}")

    # Unload local pipe if used
    if local_pipe is not None:
        del local_pipe
        torch.cuda.empty_cache()
        gc.collect()
        print("Local SD pipeline unloaded.")

    # -------------------------------------------------------------------------
    # Clean up: remove replace flags so we don't re-generate on next run
    # -------------------------------------------------------------------------
    manifest_updated = False
    for book in books:
        for page in book.get('pages', []):
            if page.get('replace') is True:
                del page['replace']
                manifest_updated = True

    if manifest_updated:
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(books, f, indent=4, ensure_ascii=False)
        print("Cleaned up replace flags from manifest.")

    if not generated_any:
        print("All book images are up to date. Nothing to generate.")
    else:
        print("Image generation complete.")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--manifest-path', default='/workspace/books_manifest.json')
    parser.add_argument('--workspace-root', default='/workspace')
    parser.add_argument('--local', action='store_true', help='Generate images locally using diffusers')
    args = parser.parse_args()
    main(manifest_path=args.manifest_path, workspace_root=args.workspace_root, local=args.local)

