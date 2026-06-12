# Reading Helper Developer Guide & Instructions

This document provides instructions for future AI agents and developers to modify, test, or extend the **Leveled Reading Helper** tool.

---

## 🛠️ Tool Architecture

The Leveled Reading Helper is a client-side JavaScript educational application consisting of:
1. **[index.html](file:///home/luke/repos/freethings/tools/reading-helper/index.html)**: Sets up the visual structure (Level tabs, book selector, reading canvas, phonics analysis card, custom story creator, and controls).
2. **[styles.css](file:///home/luke/repos/freethings/tools/reading-helper/styles.css)**: Implements visual styling, themes (Light, Cream, Blue, Green, Dark), and `@media print` layouts for printing pages cleanly as physical sheets.
3. **[script.js](file:///home/luke/repos/freethings/tools/reading-helper/script.js)**: Contains the books database, phonics dictionary, interactive text renderer, speech synthesis engine (TTS with word boundaries), and custom story creation save routines.

---

## 📖 Extension Guide: Adding a New Book

To add a new leveled book to the preloaded library:

1. **Place Images**: Put 512x512 PNG illustrations in [images/](file:///home/luke/repos/freethings/tools/reading-helper/images/). Style should be a consistent children's book style (watercolor illustration, bright pastel colors, white background).
2. **Edit `script.js`**:
   Add a new book object to the `PRELOADED_BOOKS` array in [script.js](file:///home/luke/repos/freethings/tools/reading-helper/script.js#L75):
   ```javascript
   {
       id: "unique-book-id",
       title: "Book Title",
       level: "A", // "A", "B", "C", or "D"
       wordsCount: 15, // Total count of words
       thumbnail: "images/book_cover_image.png",
       pages: [
           { text: "Sentence on page 1.", image: "images/book_image_1.png" },
           { text: "Sentence on page 2.", image: "images/book_image_2.png" }
       ]
   }
   ```
3. **Check Word Vocabulary**: Ensure any new vocabulary words are either added to the `PHONICS_DICTIONARY` map (described below) or verify that the heuristic correctly breaks them down.

---

## 🗣️ Extension Guide: Expanding the Phonics Dictionary

To improve decoding support for specific words, add entries to `PHONICS_DICTIONARY` in [script.js](file:///home/luke/repos/freethings/tools/reading-helper/script.js#L4):

```javascript
"word": { 
    parts: ["phoneme1", "phoneme2", ...], 
    tip: "Explanation of how the sounds blend or silent letters."
}
```
- **Example (Simple Onset-Rime)**: `"cat": { parts: ["c", "at"], tip: "'c' makes the hard /k/ sound. 'at' makes the short /at/ sound." }`
- **Example (Multi-Syllable)**: `"happy": { parts: ["hap", "py"], tip: "Two parts: 'hap' and 'py'. The 'y' makes a long /ee/ sound." }`

*If a word is missing from the dictionary, the application automatically falls back to an algorithmic onset-rime/syllable-splitting heuristic.*

---

## 🧠 Phonics Heuristic Algorithm

The `getPhonicParts(word)` function in [script.js](file:///home/luke/repos/freethings/tools/reading-helper/script.js#L143) performs the fallback:
- **Single-syllable (1 vowel group)**: Splits into Onset (leading consonants) and Rime (vowel + remaining letters). E.g. `flat` ➜ `["fl", "at"]`.
- **Multi-syllable (multiple vowel groups)**: Breaks into syllables by analyzing consonants between vowel clusters (following V-CV and VC-CV rules). E.g. `sister` ➜ `["sis", "ter"]`.

---

## 🎙️ Speech Synthesis & Boundaries

The read-aloud functionality uses the browser's Web Speech API (`SpeechSynthesisUtterance`):
- **Phonetic Speaking**: Utterances are queued for each phonic part, pausing briefly, before speaking the complete word.
- **Word-by-word Page Highlighting**: Uses the `onboundary` event (with `event.name === 'word'`). It matches the character index of the spoken audio stream to the DOM `span.word[data-word-index]` elements, adding a `.speaking` highlight class dynamically.

---

## 🧪 Testing and Verification

Before committing changes:
1. **Local Test Server**: Run `make serve` or `npm run dev` and navigate to `http://localhost:8000/tools/reading-helper/`.
2. **Check Navigation**: Ensure that:
   - Selecting a book loads the cover page and illustration.
   - Click next/prev updates progress and pagination correctly.
   - Clicking words triggers the phonic panels.
   - Read Aloud highlights words in real-time.
   - Printing the page displays a clean, vertical page-by-page layout without sidebar controls.
3. **Verify Links**: Run `make check` from the project root to ensure no broken relative links are introduced.
