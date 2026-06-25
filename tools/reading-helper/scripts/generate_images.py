import os
import json
import gc
import torch
from diffusers import AutoPipelineForText2Image, DDIMScheduler
from diffusers.utils import load_image
from PIL import Image
from transformers import AutoModelForCausalLM, AutoTokenizer


def main(manifest_path='/workspace/books_manifest.json', workspace_root='/workspace'):
    images_dir = os.path.join(workspace_root, 'images')
    os.makedirs(images_dir, exist_ok=True)

    if not os.path.exists(manifest_path):
        print(f"Manifest not found at {manifest_path}. Please create it to define books and prompts.")
        return

    with open(manifest_path, 'r', encoding='utf-8') as f:
        books = json.load(f)

    # Phase 1: LLM Prompt Enhancement
    # Scan for missing pages to determine if we need to load the LLM
    missing_pages = []
    for book in books:
        pages = book.get('pages', [])
        for idx, page in enumerate(pages):
            target_image = page.get('image')
            if not target_image:
                continue
            output_path = os.path.join(workspace_root, target_image)
            if not os.path.exists(output_path) or page.get('replace') == True:
                missing_pages.append((book, idx, page))

    if missing_pages:
        print(f"Found {len(missing_pages)} missing page images. Loading Qwen/Qwen2.5-0.5B-Instruct into VRAM...")
        model_name = "Qwen/Qwen2.5-0.5B-Instruct"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto"
        )

        system_msg = "You are an expert prompt engineer for Stable Diffusion XL."
        for book, idx, page in missing_pages:
            original_prompt = page.get('prompt', '')
            user_msg = (
                "Rewrite the ENTIRE original prompt below, keeping all original details exactly as they are, but append weighting syntax to the end using the ACTUAL subject of the scene (e.g. (three knights:1.5) or (green snot:1.5)). Do NOT literally write the word 'keyword'! "
                "Also output an ip_adapter_scale. Use 0.6 for normal scenes featuring the main character. Use 0.3 for heavy action. Use 0.0 if the main character is completely ABSENT from the scene to completely disable character bleeding! "
                'Output valid JSON: {"enhanced_prompt": "A green dragon standing in the woods (green dragon:1.5)", "ip_adapter_scale": 0.6}\n\n'
                f"Prompt: {original_prompt}"
            )
            messages = [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg}
            ]
            text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

            with torch.no_grad():
                generated_ids = model.generate(
                    **model_inputs,
                    max_new_tokens=256,
                    do_sample=False,
                    pad_token_id=tokenizer.eos_token_id
                )
            generated_ids = [
                output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
            ]
            output = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

            try:
                start = output.find('{')
                end = output.rfind('}')
                if start != -1 and end != -1 and end > start:
                    result = json.loads(output[start:end + 1])
                else:
                    result = json.loads(output)
                enhanced_prompt = result.get('enhanced_prompt', original_prompt)
                ip_adapter_scale = float(result.get('ip_adapter_scale', 0.6))
            except Exception:
                enhanced_prompt = original_prompt
                ip_adapter_scale = 0.6

            page['enhanced_prompt'] = enhanced_prompt
            page['ip_adapter_scale'] = ip_adapter_scale
            print(f"Enhanced prompt for {book.get('id')} page {idx + 1}: '{enhanced_prompt}' (scale: {ip_adapter_scale})")

        # Aggressively unload the LLM to free VRAM for SDXL
        del model
        del tokenizer
        torch.cuda.empty_cache()
        gc.collect()
        print("LLM unloaded. VRAM cleared for SDXL.")

    # Phase 2: OpenRouter Flux Generation
    import requests
    import sys

    openrouter_key = os.environ.get("OPENROUTER_API_KEY")
    
    generated_any = False

    for book in books:
        book_id = book.get('id')
        pages = book.get('pages', [])
        
        for idx, page in enumerate(pages):
            target_image = page.get('image')
            if not target_image:
                continue

            output_path = os.path.join(workspace_root, target_image)
            if os.path.exists(output_path) and page.get('replace') != True:
                continue

            prompt = page.get('prompt')
            if not prompt:
                continue

            if not openrouter_key:
                print("Error: OPENROUTER_API_KEY environment variable is missing! Cannot generate images via OpenRouter.")
                sys.exit(1)

            enhanced_prompt = page.get('enhanced_prompt', prompt)
            print(f"Generating image for {book_id} page {idx + 1} via OpenRouter (Flux): '{enhanced_prompt}'")

            headers = {
                "Authorization": f"Bearer {openrouter_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "black-forest-labs/flux-1.1-pro",
                "messages": [
                    {"role": "user", "content": f"{enhanced_prompt}. Ensure it looks like a whimsical children's book watercolor illustration with a white background."}
                ],
                "modalities": ["image"]
            }

            try:
                response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                
                # OpenRouter returns the image URL in the assistant message content (often as markdown or a raw URL)
                # or within an 'images' array.
                content = data['choices'][0]['message'].get('content', '')
                img_url = content
                
                if not content and 'images' in data['choices'][0]['message']:
                    img_url = data['choices'][0]['message']['images'][0]['image_url']['url']
                elif "![" in content:
                    import re
                    match = re.search(r'!\[.*?\]\((.*?)\)', content)
                    if match:
                        img_url = match.group(1)

                print(f"Downloading image from OpenRouter...")
                img_resp = requests.get(img_url.strip())
                img_resp.raise_for_status()
                
                with open(output_path, 'wb') as f:
                    f.write(img_resp.content)
                    
                print(f"Saved: {output_path}")
                generated_any = True
            except Exception as e:
                print(f"Failed to generate/download image: {e}")

    # Clean up replace flags from manifest to prevent infinite regeneration loops
    manifest_updated = False
    for book in books:
        for page in book.get('pages', []):
            if page.get('replace') == True:
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
    main()
