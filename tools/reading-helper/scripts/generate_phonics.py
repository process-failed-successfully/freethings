import os
import re
import sys

try:
    import numpy as np
    import soundfile as sf
    import torch
    from kokoro import KPipeline
except ImportError as e:
    print(f"Warning: Phonics dependencies (kokoro, numpy, etc.) not installed: {e}")
    print("Skipping phonics generation (requires Python < 3.13).")
    sys.exit(0)


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
    # Add a period to force a definitive stop and prevent stuttering on short words
    if not res.endswith('.'):
        res += '.'
    return res

def parse_phonics_dictionary(content):
    # Find PHONICS_DICTIONARY block
    dict_match = re.search(r'const\s+PHONICS_DICTIONARY\s*=\s*\{(.*?)\};', content, re.DOTALL)
    if not dict_match:
        return {}
    
    dict_content = dict_match.group(1)
    phonics_dict = {}
    
    # Match: "key": { parts: [parts_list]
    entry_pattern = r'(?:"|\'|`)([^"\'`\s]+)(?:"|\'|`)\s*:\s*\{\s*parts:\s*\[(.*?)\]'
    entries = re.findall(entry_pattern, dict_content)
    for key, parts_str in entries:
        parts = re.findall(r'(?:"|\'|`)([^"\'`\s]+)(?:"|\'|`)', parts_str)
        phonics_dict[key.lower()] = parts
        
    return phonics_dict

def get_phonic_parts(word, phonics_dictionary):
    clean_word = re.sub(r'[^a-z]', '', word.lower())
    if len(clean_word) <= 1:
        return [clean_word]
    
    if clean_word in phonics_dictionary:
        return phonics_dictionary[clean_word]
        
    vowels = 'aeiouy'
    vowel_indices = [i for i, char in enumerate(clean_word) if char in vowels]
    
    if not vowel_indices:
        return [clean_word]
        
    # Group consecutive vowels
    vowel_groups = []
    current_group = [vowel_indices[0]]
    for idx in vowel_indices[1:]:
        if idx == current_group[-1] + 1:
            current_group.append(idx)
        else:
            vowel_groups.append(current_group)
            current_group = [idx]
    vowel_groups.append(current_group)
    
    if len(vowel_groups) == 1:
        first_vowel_idx = vowel_groups[0][0]
        if first_vowel_idx == 0:
            return [clean_word]
        onset = clean_word[:first_vowel_idx]
        rime = clean_word[first_vowel_idx:]
        return [onset, rime]
        
    parts = []
    start_idx = 0
    for g in range(len(vowel_groups) - 1):
        current_vowel_end = vowel_groups[g][-1]
        next_vowel_start = vowel_groups[g+1][0]
        consonants_count = next_vowel_start - current_vowel_end - 1
        
        if consonants_count == 1:
            split_idx = current_vowel_end + 1
        elif consonants_count >= 2:
            split_idx = current_vowel_end + 1 + consonants_count // 2
        else:
            split_idx = current_vowel_end + 1
            
        parts.append(clean_word[start_idx:split_idx])
        start_idx = split_idx
    parts.append(clean_word[start_idx:])
    return parts

def main():
    if os.path.exists('/workspace/data.js'):
        script_path = '/workspace/data.js'
        audio_dir = '/workspace/audio'
    else:
        # Local development paths relative to this script
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        script_path = os.path.join(base_dir, 'data.js')
        audio_dir = os.path.join(base_dir, 'audio')
        
    os.makedirs(audio_dir, exist_ok=True)

    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Parse dictionary for heuristic lookups
    phonics_dictionary = parse_phonics_dictionary(content)

    parts = set()
    
    # 1. Add all parts from PHONICS_DICTIONARY
    matches = re.findall(r'parts:\s*\[(.*?)\]', content)
    for m in matches:
        words = re.findall(r'"([^"]+)"', m)
        for w in words:
            parts.add(w)

    # 2. Add all keys from PHONICS_DICTIONARY
    word_matches = re.findall(r'"([^"]+)":\s*\{\s*parts:', content)
    for w in word_matches:
        parts.add(w)

    # 3. Extract full page texts for natural reading
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

    # 4. Extract and split all words from the pages
    for page in page_texts:
        words = re.findall(r"[a-zA-Z'-]+", page['text'])
        for w in words:
            clean_word = re.sub(r'[^a-z]', '', w.lower())
            if clean_word:
                parts.add(clean_word)
                for part in get_phonic_parts(clean_word, phonics_dictionary):
                    parts.add(part)

    missing_parts = [p for p in parts if not os.path.exists(os.path.join(audio_dir, f"{p}.wav"))]
    missing_pages = [p for p in page_texts if not os.path.exists(os.path.join(audio_dir, p['filename']))]

    if not missing_parts and not missing_pages:
        print("All phonics and page audio files are up to date.")
        return

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    print("Loading Kokoro-82M model...")
    pipeline = KPipeline(lang_code='a', device=device)

    if missing_parts:
        print(f"Missing audio for {len(missing_parts)} parts.")
        for part in sorted(missing_parts):
            text = get_phonetic_sound(part)
            print(f"Generating audio for '{part}' (spoken as '{text}')")
            
            generator = pipeline(text, voice="af_sarah", speed=1)
            audio_segments = [audio for _, _, audio in generator]
            if audio_segments:
                combined = np.concatenate(audio_segments)
                output_path = os.path.join(audio_dir, f"{part}.wav")
                sf.write(output_path, combined, samplerate=24000)

    if missing_pages:
        print(f"Missing audio for {len(missing_pages)} pages.")
        for p in missing_pages:
            text = p['text']
            print(f"Generating page audio for '{p['filename']}'")
            
            generator = pipeline(text, voice="af_sarah", speed=1)
            audio_segments = [audio for _, _, audio in generator]
            if audio_segments:
                combined = np.concatenate(audio_segments)
                output_path = os.path.join(audio_dir, p['filename'])
                sf.write(output_path, combined, samplerate=24000)
    
    print("Generation complete.")

if __name__ == "__main__":
    main()
