FROM pytorch/pytorch:2.4.0-cuda12.1-cudnn9-runtime

WORKDIR /workspace

# Install espeak-ng for kokoro phonemization
RUN apt-get update && apt-get install -y espeak-ng && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir "transformers<4.48.0" soundfile "datasets==2.19.0" scipy sentencepiece kokoro

CMD ["python", "/workspace/scripts/generate_phonics.py"]
