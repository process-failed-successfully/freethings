import os
import subprocess
import sys

def install_and_import(package):
    try:
        __import__(package)
    except ImportError:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def main():
    install_and_import("huggingface_hub")
    from huggingface_hub import snapshot_download, hf_hub_download

    print("=== Pre-pulling models to ~/.cache/huggingface ===")

    # 1. Qwen 0.5B Instruct LLM
    print("\n1. Pulling Qwen/Qwen2.5-0.5B-Instruct...")
    snapshot_download(
        repo_id="Qwen/Qwen2.5-0.5B-Instruct",
        ignore_patterns=["*.msgpack", "*.h5", "*.ot"]
    )

    # 2. Local Stable Diffusion Model
    local_model = os.environ.get("LOCAL_MODEL", "runwayml/stable-diffusion-v1-5")
    print(f"\n2. Pulling local image generation model: {local_model}...")
    snapshot_download(
        repo_id=local_model,
        ignore_patterns=["*.msgpack", "*.h5", "*.ot", "*.ckpt", "*.safetensors"]
    )
    if local_model == "runwayml/stable-diffusion-v1-5":
        snapshot_download(
            repo_id=local_model,
            allow_patterns=["*fp16*"]
        )

    # 3. IP-Adapter weights
    print("\n3. Pulling IP-Adapter weights (h94/IP-Adapter)...")
    # We only need the specific files for SD 1.5 and SDXL models
    hf_hub_download(repo_id="h94/IP-Adapter", subfolder="models", filename="ip-adapter_sd15.bin")
    hf_hub_download(repo_id="h94/IP-Adapter", subfolder="sdxl_models", filename="ip-adapter_sdxl.bin")


    # 4. CLIP Vision Model for IP-Adapter
    print("\n4. Pulling CLIP Vision Model (laion/CLIP-ViT-H-14-laion2B-s32B-b79K)...")
    snapshot_download(
        repo_id="laion/CLIP-ViT-H-14-laion2B-s32B-b79K",
        ignore_patterns=["*.msgpack", "*.h5", "*.ot"]
    )

    print("\n=== All models pre-pulled successfully! ===")


if __name__ == "__main__":
    main()
