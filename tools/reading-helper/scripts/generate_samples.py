import os
import torch
import soundfile as sf
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset
from kokoro import KPipeline

def get_phonetic_sound(part):
    phone_helpers = {
        'b': 'buh', 'c': 'cuh', 'd': 'duh', 'f': 'fuh', 'g': 'guh', 'h': 'huh',
        'j': 'juh', 'k': 'cuh', 'l': 'luh', 'm': 'muh', 'n': 'nuh', 'p': 'puh',
        'q': 'kwuh', 'r': 'ruh', 's': 'suh', 't': 'tuh', 'v': 'vuh', 'w': 'wuh',
        'x': 'ks', 'y': 'ee', 'z': 'zuh',
        # Digraphs
        'th': 'thuh', 'sh': 'shh', 'ch': 'chuh', 'wh': 'wuh', 'ph': 'fuh',
        # L-blends
        'bl': 'bluh', 'cl': 'cluh', 'fl': 'fluh', 'gl': 'gluh', 'pl': 'pluh', 'sl': 'sluh',
        # R-blends
        'br': 'bruh', 'cr': 'cruh', 'dr': 'druh', 'fr': 'fruh', 'gr': 'gruh', 'pr': 'pruh', 'tr': 'truh',
        # S-blends
        'sk': 'skuh', 'sm': 'smuh', 'sn': 'snuh', 'sp': 'spuh', 'st': 'stuh', 'sw': 'swuh',
        # 3-letter blends
        'spl': 'spluh', 'str': 'struh', 'scr': 'scruh', 'spr': 'spruh',
        # Endings
        'nd': 'und', 'nt': 'unt', 'nk': 'unk', 'ng': 'ing', 'mp': 'ump',
    }
    res = phone_helpers.get(part, part)
    # Add a period to force a definitive stop and prevent SpeechT5 from stuttering on short words
    if not res.endswith('.'):
        res += '.'
    return res

def main():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    # Setup directories
    os.makedirs("/workspace/samples/speecht5/phonics", exist_ok=True)
    os.makedirs("/workspace/samples/kokoro", exist_ok=True)

    # Texts for "The Yucky Shoe"
    texts = [
        "I walk in the grass.",
        "I have new red shoes.",
        "Splat! I stepped in poo.",
        "Look at my shoe. It is very yucky!",
        "Now my shoe gets a wash."
    ]

    # Phonics parts used in "The Yucky Shoe"
    phonics_parts = [
        "w", "alk", "gr", "ass", "sh", "oes", "spl", "at", 
        "stepp", "ed", "p", "oo", "oe", "yuck", "y", "ver", "ash"
    ]

    # --- 1. SpeechT5 (Current Model) ---
    print("Loading SpeechT5...")
    processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
    model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts").to(device)
    vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan").to(device)
    
    print("Loading speaker embeddings...")
    embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation", trust_remote_code=True)
    
    target_speaker = "cmu_us_clb_arctic"
    speaker_idx = 7306
    for i, x in enumerate(embeddings_dataset):
        if target_speaker in x["filename"]:
            speaker_idx = i
            break
    speaker_embeddings = torch.tensor(embeddings_dataset[speaker_idx]["xvector"]).unsqueeze(0).to(device)

    print("Generating SpeechT5 page samples...")
    for i, text in enumerate(texts):
        inputs = processor(text=text, return_tensors="pt").to(device)
        speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)
        output_path = f"/workspace/samples/speecht5/page_{i}.wav"
        sf.write(output_path, speech.cpu().numpy(), samplerate=16000)
        print(f"Saved: {output_path}")

    print("Generating SpeechT5 phonics samples...")
    for part in phonics_parts:
        text = get_phonetic_sound(part)
        inputs = processor(text=text, return_tensors="pt").to(device)
        speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)
        output_path = f"/workspace/samples/speecht5/phonics/{part}.wav"
        sf.write(output_path, speech.cpu().numpy(), samplerate=16000)
        print(f"Saved: {output_path}")

    # --- 2. Kokoro-82M (Candidate Model) ---
    print("Loading Kokoro-82M...")
    pipeline = KPipeline(lang_code='a', device=device)
    
    voices = ["af_sarah", "af_bella", "am_adam"]
    for voice in voices:
        voice_dir = f"/workspace/samples/kokoro/{voice}"
        phonics_dir = f"{voice_dir}/phonics"
        os.makedirs(phonics_dir, exist_ok=True)
        
        print(f"Generating Kokoro page samples with voice '{voice}'...")
        for i, text in enumerate(texts):
            generator = pipeline(text, voice=voice, speed=1)
            for j, (_, _, audio) in enumerate(generator):
                output_path = f"{voice_dir}/page_{i}.wav"
                sf.write(output_path, audio, 24000)
                print(f"Saved: {output_path}")

        print(f"Generating Kokoro phonics samples with voice '{voice}'...")
        for part in phonics_parts:
            text = get_phonetic_sound(part)
            generator = pipeline(text, voice=voice, speed=1)
            for j, (_, _, audio) in enumerate(generator):
                output_path = f"{phonics_dir}/{part}.wav"
                sf.write(output_path, audio, 24000)
                print(f"Saved: {output_path}")

    print("Sample generation complete.")

if __name__ == "__main__":
    main()
