---
name: generate-funny-books
description: Guides the generation of humorous, leveled children's books with crude humor (4-10 pages) for the Reading Helper app.
---

# Generate Funny Books Skill

This skill provides comprehensive instructions for generating, designing, and integrating humorous children's books into the **Leveled Reading Helper** app. It utilizes the local AI generation pipelines (`make generate-images` and `make generate-audio`) to automatically handle character-consistent illustration generation and text-to-speech audio synthesis.

---

## 🎯 Objectives

When a user requests to add or generate a new funny book:
1. **Choose ONE funny crude humor scenario** (e.g., *only* about a dog farting, *only* about stepping in poo, or *only* about a yucky bug/slime). Do not combine multiple scenarios into one book.
2. **Propose the book concept first**: Before generating any illustrations or writing code, outline the book concept (Title, Level, Page-by-Page text and illustration prompts) to the user and obtain explicit approval to proceed.
3. Write a story with **4 to 10 pages**.
4. Align the text to a specific reading level (**A, B, C, or D**) using vocabulary controls.
5. Use **playful crude humor** (examples include farts, mud/poo mishaps, yucky food, funny faces) suitable for young children. (Note: The specific phrases in the prompt are examples only; write original stories based on them).
6. Integrate the new book into `script.js`, populate the `PHONICS_DICTIONARY`, and add the new book's image prompts to `books_manifest.json`.
7. Generate ONLY the base reference image using `generate_image`, then orchestrate the local `make` targets to generate the rest of the images and audio.

---

## 📖 Pedagogical Level Controls

Keep page text strictly within these bounds:

### Level A: Emergent (4-5 pages)
*   **Format**: 1 short sentence per page.
*   **Vocabulary**: Simple CVC words (dog, cat, pop, poo) and basic sight words (the, a, see, is, on, my, oh).
*   **Repetition**: High sentence pattern repetition.

### Level B: Early Emergent (5-6 pages)
*   **Format**: 1-2 simple sentences per page.
*   **Vocabulary**: Simple sight words, simple verbs, repetitive phrases.

### Level C: Early Reader (6-8 pages)
*   **Format**: 2-3 sentences per page.
*   **Vocabulary**: Introduction of consonant blends (frog, green, smell) and basic punctuation.

### Level D: Transitioning Reader (6-10 pages)
*   **Format**: 3-4 sentences per page.
*   **Vocabulary**: Richer descriptors, dialogue, compound words, and simple plots.

---

## 💨 Humor Guidelines (Kid-Friendly Crude Humor)

Keep the humor lighthearted, surprising, and silly.
*   **Farts**: Focus on sound and surprise (e.g., "TOOT!", "plop", "loud noise").
*   **Stepping in Poo/Mud**: Focus on the squishiness and cleaning up (e.g., "Splat!", "yucky shoe", "bubbles in the bath").
*   **Yucky things**: Slime, yucky bugs, green broccoli, funny smelling cheeses, mud pies.
*   *Avoid*: Overly graphic descriptions, bodily functions that cross into genuinely gross or offensive topics. Keep it innocent and cartoonish.

---

## 🛠️ Step-by-Step Integration

### Step 1: Suggest Book Outline
Suggest the Title, Level, and text for all pages first in the chat. Wait for user approval before moving to Step 2.

### Step 2: Update Codebase (`script.js` & Phonics)
Add the book object to `PRELOADED_BOOKS` in `tools/reading-helper/script.js`:
```javascript
{
    id: "dog-fart",
    title: "The Smelly Dog",
    level: "A",
    wordsCount: 22,
    thumbnail: "images/dog_fart_1.png",
    pages: [
        { text: "See the dog.", image: "images/dog_fart_1.png" },
        // ...
    ]
}
```
Add entries for any new or unique words to `PHONICS_DICTIONARY` in `script.js`.

### Step 3: Update `books_manifest.json`
Append the new book to `tools/reading-helper/books_manifest.json` to prepare it for the AI image generation pipeline.
Provide a highly descriptive prompt for each page.
*   **Style Prefix**: Always prefix image generation prompts with:
    `"Whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters, simple details, ..."`

```json
{
    "id": "dog-fart",
    "title": "The Smelly Dog",
    "base_image": "dog_fart_1.png",
    "pages": [
        {
            "image": "images/dog_fart_1.png",
            "prompt": "A cute fluffy dog sitting, whimsical children's book watercolor illustration, bright pastel colors, white background"
        }
    ]
}
```

### Step 4: Generate the Base Image
Use the `generate_image` tool to create the illustration for the **first page ONLY** (this serves as the character reference for IP-Adapter):
*   `ImageName` format: `[story_id]_1` (e.g., `dog_fart_1`).
*   Save the file to: [tools/reading-helper/images/](file:///home/luke/repos/freethings/tools/reading-helper/images/) by running a copy command in bash immediately after generation:
    ```bash
    cp <artifact_path>/[story_id]_1_*.png tools/reading-helper/images/[story_id]_1.png
    ```
*   Do NOT generate the remaining pages manually; they will be handled by the local SDXL pipeline.

### Step 5: Run Local AI Generation Pipelines
Execute the Makefile targets to automatically generate the remaining images (using the base image as an IP-Adapter reference) and missing phonics audio files:
```bash
make generate-images
make generate-audio
```

### Step 6: Verify
Inform the user that the background generation pipelines have started, and wait for them to complete. No further manual image generation is necessary!
