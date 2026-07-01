#!/usr/bin/env python3
"""
Generate a new children's book using the locally cached Qwen/Qwen2.5-0.5B-Instruct
model via HuggingFace transformers to automatically balance the reading-helper
library across levels A, B, and C.

This script:
  1. Loads the existing library from data.js and books_manifest.json.
  2. Determines which level (A/B/C) has the fewest books.
  3. Prompts Qwen to generate a new book for that level.
  4. Appends the new book to both books_manifest.json and data.js.
  5. Calls generate_images.py and generate_phonics.py to create missing assets.
"""

import json
import os
import re
import subprocess
import sys

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MANIFEST_PATH = "tools/reading-helper/books_manifest.json"
DATA_JS_PATH = "tools/reading-helper/data.js"
WORKSPACE_ROOT = "tools/reading-helper"
IMAGES_SCRIPT = "tools/reading-helper/scripts/generate_images.py"
PHONICS_SCRIPT = "tools/reading-helper/scripts/generate_phonics.py"

MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"

TIER_PARAMS = {
    "A": {
        "description": "Level A: very simple 2-5 word sentences, 4 pages, total word count around 15-20",
        "max_words": 20,
        "target_pages": 4,
    },
    "B": {
        "description": "Level B: simple short sentences, 4-5 pages, total word count around 25-35",
        "max_words": 35,
        "target_pages": 5,
    },
    "C": {
        "description": "Level C: slightly longer simple sentences, 5-6 pages, total word count around 40-55",
        "max_words": 55,
        "target_pages": 6,
    },
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def load_manifest():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_existing_ids(manifest):
    return {book["id"] for book in manifest}


def count_levels():
    """Count how many books exist for levels A, B, and C in data.js."""
    with open(DATA_JS_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    levels = re.findall(r'level:\s*"([A-D])"', content)
    counts = {"A": 0, "B": 0, "C": 0}
    for lvl in levels:
        if lvl in counts:
            counts[lvl] += 1
    return counts


def determine_target_level():
    counts = count_levels()
    print(f"Existing book counts by level: {counts}")
    target = min(counts, key=counts.get)
    print(f"Target level (fewest books): {target}")
    return target


def build_prompt(level):
    params = TIER_PARAMS[level]
    return f"""You are a children's book author specializing in funny, slightly crude humor for kids ages 4-7.
Generate a new book for reading level {level} with these constraints:
- {params['description']}
- Total word count must not exceed {params['max_words']} words.
- Target approximately {params['target_pages']} pages.

The book should have kid-friendly crude humor themes like: farting, burping, snot, mud, poo, slime, smelly things, silly animals, or yucky bugs. Make it funny and relatable for young readers.

Return ONLY a single valid JSON object with this exact structure:
{{
  "id": "kebab-case-unique-id",
  "title": "Book Title",
  "level": "{level}",
  "wordsCount": 0,
  "base_image": "id_1.png",
  "thumbnail": "images/id_1.png",
  "pages": [
    {{
      "text": "Sentence text here.",
      "image": "images/id_1.png",
      "prompt": "Detailed image generation prompt describing the scene, characters, and action. Include style: whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters, simple details"
    }}
  ]
}}

Rules:
- id must be unique across all books, lowercase, kebab-case (e.g., 'snotty-troll', 'dragon-burp').
- title should be catchy and funny.
- Each page needs: text (the sentence), image (path like images/{{id}}_1.png), and prompt (detailed image generation prompt).
- Image paths MUST follow the exact pattern images/{{id}}_{{page_number}}.png starting from 1.
- The wordsCount field can be 0; it will be calculated automatically.
- Do NOT include any explanations, markdown formatting, or text outside the JSON object.
"""


def generate_book_with_qwen(prompt):
    print(f"Loading {MODEL_NAME}...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float16,
        device_map="auto",
        trust_remote_code=True,
    )

    messages = [
        {"role": "system", "content": "You are a helpful assistant that outputs valid JSON only."},
        {"role": "user", "content": prompt},
    ]

    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

    print("Generating book with Qwen...")
    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=512,
        do_sample=True,
        temperature=0.7,
        top_p=0.9,
    )

    generated_ids = [
        output_ids[len(input_ids):]
        for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]

    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return response


def extract_json(text):
    """Remove markdown fences and extract the outermost JSON object."""
    text = re.sub(r"```(?:json)?\s*", "", text)
    text = text.replace("```", "").strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in LLM response")
    return json.loads(text[start:end + 1])


def normalize_book(book_data, existing_ids):
    """Validate and normalize the LLM-generated book."""
    raw_id = book_data.get("id", "").strip().lower()
    if not raw_id:
        raise ValueError("Generated book is missing 'id'")

    # Ensure unique id
    book_id = raw_id
    counter = 1
    while book_id in existing_ids:
        book_id = f"{raw_id}-{counter}"
        counter += 1

    title = book_data.get("title", "Untitled").strip()
    level = book_data.get("level", "A").strip().upper()

    # Normalize pages
    raw_pages = book_data.get("pages", [])
    if not raw_pages:
        raise ValueError("Generated book has no pages")

    pages = []
    for idx, page in enumerate(raw_pages, start=1):
        text = str(page.get("text", "")).strip()
        image = f"images/{book_id}_{idx}.png"
        prompt = str(page.get("prompt", "")).strip()
        if not prompt:
            prompt = (
                f"A scene from the children's book '{title}', "
                "whimsical children's book watercolor illustration, bright pastel colors, "
                "white background, cute friendly characters, simple details"
            )
        pages.append({"text": text, "image": image, "prompt": prompt})

    # Compute wordsCount from actual text
    words_count = sum(
        len(re.findall(r"[a-zA-Z]+", p["text"])) for p in pages
    )

    return {
        "id": book_id,
        "title": title,
        "level": level,
        "wordsCount": words_count,
        "thumbnail": f"images/{book_id}_1.png",
        "base_image": f"{book_id}_1.png",
        "pages": pages,
    }


def append_to_manifest(book):
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    manifest_book = {
        "id": book["id"],
        "title": book["title"],
        "base_image": book["base_image"],
        "pages": [{"image": p["image"], "prompt": p["prompt"]} for p in book["pages"]],
    }
    manifest.append(manifest_book)

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=4, ensure_ascii=False)


def js_str(s):
    """Escape a string for safe use inside JavaScript double quotes."""
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def update_data_js(book):
    with open(DATA_JS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    pages_js = ",\n            ".join(
        f'{{ text: {js_str(p["text"])}, image: "{p["image"]}" }}'
        for p in book["pages"]
    )

    book_js = f"""    {{
        id: "{book['id']}",
        title: "{book['title']}",
        level: "{book['level']}",
        wordsCount: {book['wordsCount']},
        thumbnail: "{book['thumbnail']}",
        pages: [
            {pages_js}
        ]
    }}"""

    stripped = content.rstrip()
    closing_idx = stripped.rfind("];")
    if closing_idx == -1:
        raise ValueError("Could not find the closing '];' of PRELOADED_BOOKS in data.js")

    last_brace = stripped.rfind("}", 0, closing_idx)
    if last_brace == -1:
        raise ValueError("Could not find the last '}' before '];' in data.js")

    # Insert new book with a trailing comma on the previous last entry
    new_content = stripped[:last_brace + 1] + ",\n" + book_js + "\n];"

    with open(DATA_JS_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)


def run_asset_generation():
    in_docker = os.environ.get("IN_DOCKER") == "1"
    python_bin = sys.executable if in_docker else ("tools/reading-helper/venv/bin/python" if os.path.exists("tools/reading-helper/venv/bin/python") else sys.executable)
    print("Running image generation script...")
    result = subprocess.run(
        [
            python_bin,
            IMAGES_SCRIPT,
            "--manifest-path", MANIFEST_PATH,
            "--workspace-root", WORKSPACE_ROOT,
        ]
    )
    if result.returncode != 0:
        print("Warning: Image generation script exited with an error.")

    print("Running phonics audio generation script...")
    result = subprocess.run([python_bin, PHONICS_SCRIPT])
    if result.returncode != 0:
        print("Warning: Phonics generation script exited with an error.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("Reading Helper — Automatic Book Generator")
    print("=" * 60)

    manifest = load_manifest()
    existing_ids = get_existing_ids(manifest)

    target_level = determine_target_level()
    prompt = build_prompt(target_level)

    print(f"\nGenerating a Level {target_level} book with {MODEL_NAME}...")
    raw_response = generate_book_with_qwen(prompt)

    print("\nParsing LLM response...")
    try:
        book_data = extract_json(raw_response)
    except Exception as e:
        print(f"Failed to parse JSON from LLM response: {e}")
        print("\n--- Raw LLM response ---")
        print(raw_response)
        print("--- End of response ---")
        sys.exit(1)

    print("Normalizing and validating generated book...")
    try:
        book = normalize_book(book_data, existing_ids)
    except ValueError as e:
        print(f"Book validation failed: {e}")
        sys.exit(1)

    print(
        f"Generated: '{book['title']}' "
        f"(id={book['id']}, level={book['level']}, words={book['wordsCount']}, pages={len(book['pages'])})"
    )

    print("\nUpdating books_manifest.json...")
    append_to_manifest(book)

    print("Updating data.js...")
    update_data_js(book)

    print("\nTriggering asset generation...")
    run_asset_generation()

    print("\nAll done! New book added successfully.")


if __name__ == "__main__":
    main()
