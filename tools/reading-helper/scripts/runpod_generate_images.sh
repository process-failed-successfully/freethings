#!/usr/bin/env bash
set -euo pipefail

# tools/reading-helper/scripts/runpod_generate_images.sh
# Orchestrates a RunPod Community GPU pod to generate images using Flux.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOCAL_MODEL="${LOCAL_MODEL:-black-forest-labs/FLUX.1-schnell}"

# Pod ID variable to be used in trap
POD_ID=""

# Ensure pod is terminated on exit
cleanup() {
  if [ -n "$POD_ID" ]; then
    echo "Cleaning up pod $POD_ID..."
    runpodctl pod remove "$POD_ID" 2>/dev/null || true
    echo "Pod terminated, billing stopped."
  fi
}
trap cleanup EXIT

echo "Creating RunPod community GPU pod..."
# Attempt to create an RTX 4090 pod, fallback to RTX 3090 if needed.
POD_JSON=$(runpodctl pod create \
  --cloud-type COMMUNITY \
  --image "runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04" \
  --gpu-id "NVIDIA GeForce RTX 4090" \
  --container-disk-in-gb 80 \
  --name "reading-helper-flux" \
  --ssh \
  --ports "22/tcp" 2>/dev/null) || \
POD_JSON=$(runpodctl pod create \
  --cloud-type COMMUNITY \
  --image "runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04" \
  --gpu-id "NVIDIA GeForce RTX 3090" \
  --container-disk-in-gb 80 \
  --name "reading-helper-flux" \
  --ssh \
  --ports "22/tcp")

POD_ID=$(echo "$POD_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Pod ID: $POD_ID"

echo "Waiting for pod SSH to become ready..."
while true; do
  SSH_JSON=$(runpodctl ssh info "$POD_ID" 2>/dev/null || echo '{}')
  if echo "$SSH_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'command' in d else 1)" 2>/dev/null; then
    SSH_CMD=$(echo "$SSH_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['command'])")
    break
  fi
  echo "  Not ready yet, retrying in 10s..."
  sleep 10
done

# Extract host and port from the command string
SSH_HOST=$(echo "$SSH_CMD" | grep -oP '(?<=@)[^ ]+')
SSH_PORT=$(echo "$SSH_CMD" | grep -oP '(?<=-p )\d+')
SSH_KEY="$HOME/.runpod/ssh/runpodctl-key"
SSH_OPTS="-o StrictHostKeyChecking=no -i $SSH_KEY"
echo "SSH ready at $SSH_HOST:$SSH_PORT"

echo "Installing Python dependencies on pod..."
ssh $SSH_OPTS -p "$SSH_PORT" "root@$SSH_HOST" bash << 'REMOTE'
pip install -q --no-cache-dir \
  "diffusers>=0.30.0" \
  "transformers>=4.45.0" \
  "accelerate>=0.34.0" \
  "sentencepiece" \
  "safetensors" \
  "huggingface_hub" \
  "Pillow" \
  "opencv-python-headless" \
  "requests"
REMOTE

echo "Syncing files to pod..."
# Create workspace and images dir on pod
ssh $SSH_OPTS -p "$SSH_PORT" "root@$SSH_HOST" "mkdir -p /workspace/images"

rsync -av -e "ssh $SSH_OPTS -p $SSH_PORT" \
  "$REPO_ROOT/tools/reading-helper/scripts/generate_images.py" \
  "$REPO_ROOT/tools/reading-helper/books_manifest.json" \
  "root@$SSH_HOST:/workspace/"

# Send existing images so we skip already-generated ones
if [ -d "$REPO_ROOT/tools/reading-helper/images/" ]; then
  rsync -av -e "ssh $SSH_OPTS -p $SSH_PORT" \
    "$REPO_ROOT/tools/reading-helper/images/" \
    "root@$SSH_HOST:/workspace/images/"
fi

echo "Running image generation (LOCAL_MODEL=$LOCAL_MODEL)..."
# Pass HF_TOKEN if available
HF_ENV=""
if [ -n "${HF_TOKEN:-}" ]; then
  HF_ENV="HF_TOKEN=$HF_TOKEN"
fi

ssh $SSH_OPTS -p "$SSH_PORT" "root@$SSH_HOST" \
  LOCAL_MODEL="$LOCAL_MODEL" $HF_ENV \
  bash -c 'cd /workspace && python3 generate_images.py \
    --manifest-path /workspace/books_manifest.json \
    --workspace-root /workspace \
    --local'

echo "Pulling generated images back to local..."
rsync -av -e "ssh $SSH_OPTS -p $SSH_PORT" \
  "root@$SSH_HOST:/workspace/images/" \
  "$REPO_ROOT/tools/reading-helper/images/"

echo "Generation process complete. Trap will now terminate the pod."
