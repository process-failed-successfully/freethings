import os
import re
import soundfile as sf
import torch
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset

def get_phonetic_sound(part):
    phone_helpers = {
        'b': 'buh', 'c': 'cuh', 'd': 'duh', 'f': 'fuh', 'g': 'guh', 'h': 'huh',
        'j': 'juh', 'k': 'cuh', 'l': 'luh', 'm': 'muh', 'n': 'nuh', 'p': 'puh',
        'q': 'kwuh', 'r': 'ruh', 's': 'suh', 't': 'tuh', 'v': 'vuh', 'w': 'wuh',
        'x': 'ks', 'z': 'zuh',
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
    script_path = '/workspace/data.js'
    audio_dir = '/workspace/audio'
    os.makedirs(audio_dir, exist_ok=True)

    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()

    parts = set()
    matches = re.findall(r'parts:\s*\[(.*?)\]', content)
    for m in matches:
        words = re.findall(r'"([^"]+)"', m)
        for w in words:
            parts.add(w)

    # Also extract the full words (keys) from the dictionary
    word_matches = re.findall(r'"([^"]+)":\s*\{\s*parts:', content)
    for w in word_matches:
        parts.add(w)

    # Extract full page texts for natural reading
    book_id = None
    page_idx = 0
    page_texts = []
    for line in content.split('\n'):
        match_id = re.search(r'id:\s*"([^"]+)"', line)
        if match_id:
            book_id = match_id.group(1)
            page_idx = 0
        match_text = re.search(r'text:\s*([\'"`])(.*?)\1', line)
        if match_text and book_id:
            page_texts.append({
                'filename': f"page_{book_id}_{page_idx}.wav",
                'text': match_text.group(2)
            })
            page_idx += 1

    missing_parts = [p for p in parts if not os.path.exists(os.path.join(audio_dir, f"{p}.wav"))]
    missing_pages = [p for p in page_texts if not os.path.exists(os.path.join(audio_dir, p['filename']))]

    if not missing_parts and not missing_pages:
        print("All phonics and page audio files are up to date.")
        return

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    print("Loading models (this might take a minute on first run)...")
    processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
    model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts").to(device)
    vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan").to(device)

    print("Loading speaker embeddings...")
    embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation", trust_remote_code=True)
    
    # Find a much clearer, non-breathy voice (clb is a clear female voice, bdl is a clear male voice)
    target_speaker = "cmu_us_clb_arctic"
    speaker_idx = 7306 # fallback to default
    
    for i, x in enumerate(embeddings_dataset):
        if target_speaker in x["filename"]:
            speaker_idx = i
            break
            
    print(f"Using speaker index {speaker_idx} ({target_speaker})")
    speaker_embeddings = torch.tensor(embeddings_dataset[speaker_idx]["xvector"]).unsqueeze(0).to(device)

    if missing_parts:
        print(f"Missing audio for {len(missing_parts)} parts.")
        for part in missing_parts:
            text = get_phonetic_sound(part)
            print(f"Generating audio for '{part}' (spoken as '{text}')")
            
            inputs = processor(text=text, return_tensors="pt").to(device)
            speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)
            
            output_path = os.path.join(audio_dir, f"{part}.wav")
            sf.write(output_path, speech.cpu().numpy(), samplerate=16000)

    if missing_pages:
        print(f"Missing audio for {len(missing_pages)} pages.")
        for p in missing_pages:
            text = p['text']
            print(f"Generating page audio for '{p['filename']}'")
            inputs = processor(text=text, return_tensors="pt").to(device)
            speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)
            
            output_path = os.path.join(audio_dir, p['filename'])
            sf.write(output_path, speech.cpu().numpy(), samplerate=16000)
    
    print("Generation complete.")

if __name__ == "__main__":
    main()
