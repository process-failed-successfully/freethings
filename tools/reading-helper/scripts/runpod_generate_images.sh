#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RH_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
POD_NAME="reading-helper-$(date +%s)"
IMAGE="runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04"
CONTAINER_DISK_GB=80

echo "Creating RunPod community GPU pod..."
POD_JSON=$(runpodctl pod create \
  --name "$POD_NAME" \
  --image "$IMAGE" \
  --gpu-id "NVIDIA GeForce RTX 4090" \
  --cloud-type COMMUNITY \
  --public-ip \
  --ports 22/tcp \
  --container-disk-in-gb "$CONTAINER_DISK_GB" 2>/dev/null || true)

POD_ID=""
if [ -n "$POD_JSON" ]; then
  POD_ID=$(echo "$POD_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)
fi

if [ -z "$POD_ID" ]; then
  echo "RTX 4090 unavailable or creation failed, trying RTX 3090..."
  POD_JSON=$(runpodctl pod create \
    --name "$POD_NAME" \
    --image "$IMAGE" \
    --gpu-id "NVIDIA GeForce RTX 3090" \
    --cloud-type COMMUNITY \
    --public-ip \
    --ports 22/tcp \
    --container-disk-in-gb "$CONTAINER_DISK_GB" 2>/dev/null || true)
  if [ -n "$POD_JSON" ]; then
    POD_ID=$(echo "$POD_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)
  fi
fi

if [ -z "$POD_ID" ]; then
  echo "Failed to create RunPod pod with any GPU type."
  exit 1
fi

echo "Created pod $POD_ID"

cleanup() {
  echo "Cleaning up RunPod pod $POD_ID..."
  runpodctl pod remove "$POD_ID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Waiting for pod $POD_ID SSH to be ready..."
IP=""
PORT=""
SSH_KEY_PATH=""
for i in $(seq 1 60); do
  SSH_INFO=$(runpodctl ssh info "$POD_ID" 2>/dev/null || true)
  if [ -n "$SSH_INFO" ]; then
    IP=$(echo "$SSH_INFO" | python3 -c "import json,sys; print(json.load(sys.stdin).get('ip',''))" 2>/dev/null || true)
    PORT=$(echo "$SSH_INFO" | python3 -c "import json,sys; print(json.load(sys.stdin).get('port',''))" 2>/dev/null || true)
    SSH_KEY_PATH=$(echo "$SSH_INFO" | python3 -c "import json,sys; print(json.load(sys.stdin).get('ssh_key',{}).get('path',''))" 2>/dev/null || true)
    if [ -n "$IP" ] && [ -n "$PORT" ]; then
      echo "Pod SSH ready: $IP:$PORT"
      break
    fi
  fi
  echo "  Pod not ready yet (attempt $i/60)..."
  sleep 10
done

if [ -z "$IP" ] || [ -z "$PORT" ]; then
  echo "Timed out waiting for pod SSH to be ready."
  exit 1
fi

if [ -n "$SSH_KEY_PATH" ]; then
  SSH_OPTS="-i $SSH_KEY_PATH -p $PORT -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
else
  SSH_OPTS="-p $PORT -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
fi
RSYNC_SSH="ssh $SSH_OPTS"

echo "Installing dependencies on the pod..."
ssh $SSH_OPTS root@"$IP" "apt-get update && apt-get install -y rsync && pip install -q \"diffusers<0.32.0\" \"transformers<4.48.0\" accelerate sentencepiece safetensors huggingface_hub Pillow opencv-python-headless requests"

echo "Syncing files to the pod..."
mkdir -p "$RH_DIR/images"
rsync -avz -e "$RSYNC_SSH" "$SCRIPT_DIR/generate_images.py" root@"$IP":/workspace/
rsync -avz -e "$RSYNC_SSH" "$RH_DIR/books_manifest.json" root@"$IP":/workspace/
rsync -avz -e "$RSYNC_SSH" "$RH_DIR/images/" root@"$IP":/workspace/images/

LOCAL_MODEL="${LOCAL_MODEL:-black-forest-labs/FLUX.1-schnell}"
HF_TOKEN="${HF_TOKEN:-}"

echo "Running image generation on the pod using model $LOCAL_MODEL..."
ssh $SSH_OPTS root@"$IP" "cd /workspace && HF_TOKEN='$HF_TOKEN' LOCAL_MODEL='$LOCAL_MODEL' python3 generate_images.py --local"

echo "Pulling generated images back..."
rsync -avz -e "$RSYNC_SSH" root@"$IP":/workspace/images/ "$RH_DIR/images/"
rsync -avz -e "$RSYNC_SSH" root@"$IP":/workspace/books_manifest.json "$RH_DIR/books_manifest.json"

echo "RunPod image generation complete."
