// Leveled Reading Helper Script

// 1. Phonics Dictionary for Pre-loaded Books

// 2. Pre-loaded Leveled Books

function isCompleteBook(book) {
    if (!book) return false;
    if (typeof book.id !== "string" || book.id.includes("mock") || book.id.includes("kebab-case")) {
        return false;
    }
    if (!book.title || !book.level || !book.thumbnail) {
        return false;
    }
    if (!book.pages || !Array.isArray(book.pages) || book.pages.length === 0) {
        return false;
    }
    return book.pages.every(p => p && typeof p.text === "string" && p.text.trim() !== "" && typeof p.image === "string" && p.image.trim() !== "");
}

// State variables
let books = PRELOADED_BOOKS.filter(isCompleteBook);
let activeBook = books[0] || null;
let activePageIndex = 0;
let selectedWordElement = null;
let currentUtterance = null;
let isPageReading = false;
let currentSpokenWords = [];

// Initialize local storage custom books
function loadCustomBooks() {
    try {
        const stored = localStorage.getItem("freethings_custom_books");
        if (stored) {
            const customBooks = JSON.parse(stored);
            // Append custom books that are valid
            customBooks.forEach(cb => {
                if (!cb) return;
                // Prepend or append. Let's append them.
                if (isCompleteBook(cb) && !books.some(b => b && b.id === cb.id)) {
                    books.push(cb);
                }
            });
        }
    } catch (e) {
        console.error("Error loading custom books from localStorage:", e);
    }
}

// 3. Phonics Heuristic Splitting
function getPhonicParts(word) {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length <= 1) return { parts: [cleanWord], tip: `"${cleanWord}" makes its individual sound.` };

    // Check dictionary
    if (PHONICS_DICTIONARY[cleanWord]) {
        return PHONICS_DICTIONARY[cleanWord];
    }

    // Heuristic: Onset-Rime or Syllable splitting
    const vowels = 'aeiouy';
    let vowelIndices = [];
    for (let i = 0; i < cleanWord.length; i++) {
        if (vowels.includes(cleanWord[i])) {
            vowelIndices.push(i);
        }
    }

    if (vowelIndices.length === 0) {
        return { parts: [cleanWord], tip: `"${cleanWord}" has no vowels.` };
    }

    // Group consecutive vowels
    let vowelGroups = [];
    let currentGroup = [vowelIndices[0]];
    for (let i = 1; i < vowelIndices.length; i++) {
        if (vowelIndices[i] === vowelIndices[i-1] + 1) {
            currentGroup.push(vowelIndices[i]);
        } else {
            vowelGroups.push(currentGroup);
            currentGroup = [vowelIndices[i]];
        }
    }
    vowelGroups.push(currentGroup);

    // If only one vowel group, do Onset-Rime split
    if (vowelGroups.length === 1) {
        const firstVowelIdx = vowelGroups[0][0];
        if (firstVowelIdx === 0) {
            return { parts: [cleanWord], tip: `"${cleanWord}" starts with a vowel sound.` };
        }
        const onset = cleanWord.substring(0, firstVowelIdx);
        const rime = cleanWord.substring(firstVowelIdx);
        return { 
            parts: [onset, rime], 
            tip: `"${onset}" makes the starting consonant sound. "${rime}" makes the ending vowel sound.` 
        };
    }

    // Multiple vowel groups: split into syllables
    let parts = [];
    let startIdx = 0;
    for (let g = 0; g < vowelGroups.length - 1; g++) {
        const currentVowelEnd = vowelGroups[g][vowelGroups[g].length - 1];
        const nextVowelStart = vowelGroups[g+1][0];
        const consonantsCount = nextVowelStart - currentVowelEnd - 1;
        
        let splitIdx;
        if (consonantsCount === 1) {
            splitIdx = currentVowelEnd + 1; // ti-ger
        } else if (consonantsCount >= 2) {
            splitIdx = currentVowelEnd + 1 + Math.floor(consonantsCount / 2); // hap-py
        } else {
            splitIdx = currentVowelEnd + 1; // ne-on
        }
        
        parts.push(cleanWord.substring(startIdx, splitIdx));
        startIdx = splitIdx;
    }
    parts.push(cleanWord.substring(startIdx));
    
    return {
        parts: parts,
        tip: `"${cleanWord}" is split into syllables: ${parts.join(' - ')}.`
    };
}

// 4. Render Books list in library
function renderBooksList(filterLevel = "all") {
    const listEl = document.getElementById("books-list");
    listEl.innerHTML = "";

    const filtered = books.filter(b => filterLevel === "all" || b.level === filterLevel);

    if (filtered.length === 0) {
        listEl.innerHTML = `<p class="book-words" style="padding: 1rem; text-align: center;"></p>`;
        listEl.querySelector('p').textContent = `No books found in Level ${filterLevel}.`;
        return;
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach(book => {
        if (!book) return;
        const item = document.createElement("button");
        item.className = `book-item ${book.id === activeBook.id ? "active" : ""}`;
        item.id = `book-item-${book.id}`;
        
        // Use standard SVG placeholder if image path does not exist
        const thumbSrc = book.thumbnail || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23ccc'><rect width='100' height='100'/></svg>`;

        item.innerHTML = `
            <img class="book-thumbnail" src="" alt="">
            <div class="book-meta">
                <span class="book-title"></span>
                <div class="book-details">
                    <span class="level-tag"></span>
                    <span class="book-words"></span>
                </div>
            </div>
        `;

        const img = item.querySelector('.book-thumbnail');
        img.src = thumbSrc;
        img.alt = `${book.title} Cover`;
        img.onerror = () => {
            img.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%232563eb'><rect width='100' height='100'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='30'>📖</text></svg>`;
        };

        item.querySelector('.book-title').textContent = book.title;
        const levelTag = item.querySelector('.level-tag');
        levelTag.classList.add(`level-${book.level.toLowerCase()}`);
        levelTag.textContent = `Level ${book.level}`;
        item.querySelector('.book-words').textContent = `${book.wordsCount} words`;

        item.addEventListener("click", () => {
            selectBook(book.id);
        });

        fragment.appendChild(item);
    });
    listEl.appendChild(fragment);
}

// 5. Select and Display Book
function selectBook(bookId) {
    const book = books.find(b => b && b.id === bookId);
    if (!book) return;

    activeBook = book;
    activePageIndex = 0;
    
    // Highlight in list
    document.querySelectorAll(".book-item").forEach(item => item.classList.remove("active"));
    const selectedItem = document.getElementById(`book-item-${bookId}`);
    if (selectedItem) selectedItem.classList.add("active");

    // Close any open phonics panel
    closePhonicsPanel();
    stopReading();

    loadPage();
}

// Load current page
function loadPage() {
    if (!activeBook || !activeBook.pages || activeBook.pages.length === 0) return;

    const page = activeBook.pages[activePageIndex];
    
    // Update Header
    document.getElementById("current-book-title").textContent = activeBook.title;
    
    const lvlBadge = document.getElementById("current-book-level");
    lvlBadge.className = `level-badge level-${activeBook.level.toLowerCase()}`;
    lvlBadge.textContent = `Level ${activeBook.level}`;

    // Update Image
    const imgLoader = document.getElementById("image-loader");
    const imgEl = document.getElementById("page-image");
    
    imgLoader.classList.add("show");
    imgEl.style.opacity = "0.2";

    // Set source
    if (page.image) {
        imgEl.src = page.image;
        imgEl.alt = `${activeBook.title} - Page ${activePageIndex + 1}`;
    } else {
        // Fallback SVG if no image
        imgEl.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23eff6ff'><rect width='100' height='100'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='%232563eb' font-family='Quicksand' font-weight='bold' font-size='10'>📖 Page ${activePageIndex + 1}</text></svg>`;
    }

    imgEl.onload = () => {
        imgLoader.classList.remove("show");
        imgEl.style.opacity = "1";
    };
    
    imgEl.onerror = () => {
        imgLoader.classList.remove("show");
        imgEl.style.opacity = "1";
        imgEl.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23eff6ff'><rect width='100' height='100'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='%232563eb' font-family='Quicksand' font-weight='bold' font-size='8'>📖 Image Missing</text></svg>`;
    };

    // Render interactive text
    renderInteractiveText(page.text);

    // Update progress bar
    const totalPages = activeBook.pages.length;
    document.getElementById("progress-text").textContent = `Page ${activePageIndex + 1} of ${totalPages}`;
    document.getElementById("progress-fill").style.width = `${((activePageIndex + 1) / totalPages) * 100}%`;

    // Enable/disable navigation buttons
    document.getElementById("btn-prev").disabled = activePageIndex === 0;
    document.getElementById("btn-next").disabled = activePageIndex === totalPages - 1;

    // Add red cross for local development tagging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const illustrationBox = document.getElementById("illustration-box");
        const existingBtn = illustrationBox.querySelector('.tag-replace-btn');
        if (existingBtn) existingBtn.remove();

        const tagBtn = document.createElement('button');
        tagBtn.className = 'tag-replace-btn';
        tagBtn.innerHTML = '&#10060;';
        tagBtn.title = 'Flag image for replacement';
        tagBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fetch('/api/tag-replace', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({book_id: activeBook.id, page_index: activePageIndex})
            })
            .then(r => {
                if (r.ok) {
                    tagBtn.style.opacity = '0.5';
                    tagBtn.title = 'Flagged for replacement';
                }
            });
        });
        illustrationBox.appendChild(tagBtn);
    }
}

// 6. Render interactive clickable words
function renderInteractiveText(text) {
    const textContainer = document.getElementById("story-text");
    textContainer.innerHTML = "";
    currentSpokenWords = [];

    // Split text by spaces but preserve punctuation
    // We split by word boundary with regex to extract words and punctuation/spaces separately
    const tokens = text.split(/(\s+)/);

    const fragment = document.createDocumentFragment();
    tokens.forEach(token => {
        if (token.trim() === "") {
            // It's a space
            const spaceEl = document.createElement("span");
            spaceEl.className = "word-space";
            spaceEl.innerHTML = token.replace(/ /g, "&nbsp;");
            fragment.appendChild(spaceEl);
        } else {
            // It's a word with potential punctuation
            // Separate punctuation from word characters
            const wordMatch = token.match(/^([a-zA-Z'-]+)([^a-zA-Z'-]*)$/);
            
            if (wordMatch) {
                const wordCore = wordMatch[1];
                const punctuation = wordMatch[2];

                const wordSpan = document.createElement("span");
                wordSpan.className = "word";
                wordSpan.textContent = wordCore;
                
                // Track word index for TTS highlighting
                const wordIndex = currentSpokenWords.length;
                wordSpan.setAttribute("data-word-index", wordIndex);
                currentSpokenWords.push({ word: wordCore, element: wordSpan });

                // Event listener for click
                wordSpan.addEventListener("click", (e) => {
                    e.stopPropagation();
                    selectWord(wordCore, wordSpan);
                });

                fragment.appendChild(wordSpan);

                if (punctuation) {
                    const punctEl = document.createElement("span");
                    punctEl.className = "word-space";
                    punctEl.textContent = punctuation;
                    fragment.appendChild(punctEl);
                }
            } else {
                // Fallback for non-alphabetic tokens
                const fallbackSpan = document.createElement("span");
                fallbackSpan.className = "word-space";
                fallbackSpan.textContent = token;
                fragment.appendChild(fallbackSpan);
            }
        }
    });
    textContainer.appendChild(fragment);
}

// 7. Select a word and open Phonics Panel
function selectWord(word, element) {
    // Clear previous active word
    if (selectedWordElement) {
        selectedWordElement.classList.remove("active");
    }

    selectedWordElement = element;
    element.classList.add("active");

    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    const data = getPhonicParts(cleanWord);

    // Update Phonics Panel
    document.getElementById("target-word").textContent = word;
    
    // Render split displaying colored parts
    const splitDisplay = document.getElementById("phonics-split-display");
    splitDisplay.innerHTML = "";
    
    data.parts.forEach((part, idx) => {
        const partSpan = document.createElement("span");
        
        // Apply class depending on part length/type
        if (data.parts.length === 2) {
            partSpan.className = `phonic-part ${idx === 0 ? "onset" : "rime"}`;
        } else {
            // Multi-syllable or single letter
            const isVowelPart = 'aeiouy'.includes(part[0]);
            partSpan.className = `phonic-part ${isVowelPart ? "vowel" : "consonant"}`;
        }
        
        partSpan.textContent = part;
        
        // Clicking individual phonics parts pronounces just that sound
        partSpan.addEventListener("click", (e) => {
            e.stopPropagation();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            const phoneticSound = getPhoneticSound(part);
            playPhonicAudio(part, phoneticSound, 1.0); // Speak part
        });

        splitDisplay.appendChild(partSpan);
    });

    document.getElementById("phonics-tip-text").textContent = data.tip;
    document.getElementById("phonics-card").classList.remove("hide");

    // Scroll to phonics panel smoothly
    document.getElementById("phonics-card").scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Instantly speak the word phonetically first!
    speakWordPhonetic(cleanWord, data.parts);
}

function closePhonicsPanel() {
    document.getElementById("phonics-card").classList.add("hide");
    if (selectedWordElement) {
        selectedWordElement.classList.remove("active");
        selectedWordElement = null;
    }
}

// Phonetic sound helper to avoid letter names (like "see" for "c")
function getPhoneticSound(part) {
    if (part.length === 1 && !'aeiouy'.includes(part)) {
        // Changed 'kuh' to 'cuh' to avoid 'koo' pronunciation
        const phoneHelpers = {
            'b': 'buh', 'c': 'cuh', 'd': 'duh', 'f': 'fuh', 'g': 'guh', 'h': 'huh',
            'j': 'juh', 'k': 'cuh', 'l': 'luh', 'm': 'muh', 'n': 'nuh', 'p': 'puh',
            'q': 'kwuh', 'r': 'ruh', 's': 'suh', 't': 'tuh', 'v': 'vuh', 'w': 'wuh',
            'x': 'ks', 'z': 'zuh'
        };
        return phoneHelpers[part] || part;
    }
    return part;
}

// 8. Text-to-Speech Engine (Legacy TTS Removed)
function speakText(text, rate = 0.8) {
    console.log("Legacy TTS disabled. Could not speak:", text);
}

// Play pre-generated audio for a phonetic part or word
async function playPhonicAudio(part, fallbackTtsPart, rate) {
    return new Promise((resolve) => {
        const speedInput = parseFloat(document.getElementById("tts-speed").value) || 1.0;
        const adjustedRate = rate * speedInput;
        
        const audio = new Audio(`audio/${part}.wav`);
        audio.playbackRate = adjustedRate;
        
        audio.onended = resolve;
        audio.onerror = () => resolve(); // No TTS fallback
        
        audio.play().catch(e => resolve());
    });
}

// Phonetic Speaking: speaks parts first, pauses, then speaks the whole word
async function speakWordPhonetic(word, parts) {

    // We queue the utterances or play WAVs sequentially
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const ttsPart = getPhoneticSound(part);
        await playPhonicAudio(part, ttsPart, 1.0);
        
        // Small pause between parts
        await new Promise(r => setTimeout(r, 200));
    }

    // Finally speak the full word using our high-quality audio
    await playPhonicAudio(word, word, 1.0);
}

let pageAudio = null;
let highlightInterval = null;

// Read whole page aloud with simulated highlighting using full-sentence AI audio
function readPageAloud() {
    if (isPageReading) {
        stopReading();
        return;
    }

    const pageText = activeBook.pages[activePageIndex].text;
    if (!pageText) return;

    stopReading();
    isPageReading = true;
    
    const readBtn = document.getElementById("btn-read-aloud");
    readBtn.innerHTML = `<i class="fas fa-pause"></i> Pause`;
    readBtn.classList.add("active");

    const speedInput = parseFloat(document.getElementById("tts-speed").value) || 1.0;
    
    pageAudio = new Audio(`audio/page_${activeBook.id}_${activePageIndex}.wav`);
    pageAudio.playbackRate = speedInput;
    
    // Setup pseudo-highlighting
    const wordsCount = currentSpokenWords.length;

    pageAudio.ontimeupdate = () => {
        if (!pageAudio || isNaN(pageAudio.duration) || pageAudio.duration === 0 || wordsCount === 0) return;
        
        const progress = pageAudio.currentTime / pageAudio.duration;
        let wordIndex = Math.floor(progress * wordsCount);
        if (wordIndex >= wordsCount) wordIndex = wordsCount - 1;
        
        currentSpokenWords.forEach((ws, i) => {
            if (i === wordIndex) {
                ws.element.classList.add("speaking");
            } else {
                ws.element.classList.remove("speaking");
            }
        });
    };

    pageAudio.onended = () => {
        stopReading();
    };
    
    pageAudio.onerror = () => {
        console.error("Failed to load page audio");
        stopReading();
    };

    pageAudio.play().catch(e => {
        console.error("Play failed", e);
        stopReading();
    });
}

function stopReading() {
    isPageReading = false;
    
    if (pageAudio) {
        pageAudio.pause();
        pageAudio = null;
    }

    if (highlightInterval) {
        clearInterval(highlightInterval);
        highlightInterval = null;
    }
    
    const readBtn = document.getElementById("btn-read-aloud");
    if (readBtn) {
        readBtn.innerHTML = `<i class="fas fa-volume-up"></i> Read Page`;
        readBtn.classList.remove("active");
    }

    // Remove all highlights
    currentSpokenWords.forEach(ws => {
        ws.element.classList.remove("speaking");
    });
}

// 9. Custom Story Creator Logic
let creatorPages = [{ text: "" }];

function renderPagesCreator() {
    const listEl = document.getElementById("pages-creator-list");
    listEl.innerHTML = "";

    const fragment = document.createDocumentFragment();
    creatorPages.forEach((page, idx) => {
        const pageCard = document.createElement("div");
        pageCard.className = "page-editor-card";
        
        pageCard.innerHTML = `
            <div class="page-editor-header">
                <span class="page-num-title">Page ${idx + 1}</span>
                <div class="header-actions"></div>
            </div>
            <textarea class="form-textarea page-text-input" placeholder="Type page text here... e.g. See the train go."></textarea>
        `;

        if (creatorPages.length > 1) {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn-remove-page';
            removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remove';
            removeBtn.onclick = () => removeCreatorPage(idx);
            pageCard.querySelector('.header-actions').appendChild(removeBtn);
        }

        // Live update model
        const textarea = pageCard.querySelector("textarea");
        textarea.dataset.index = idx;
        textarea.value = page.text;
        textarea.addEventListener("input", (e) => {
            creatorPages[idx].text = e.target.value;
        });

        fragment.appendChild(pageCard);
    });
    listEl.appendChild(fragment);
}

window.removeCreatorPage = function(index) {
    creatorPages.splice(index, 1);
    renderPagesCreator();
};

function addNewCreatorPage() {
    creatorPages.push({ text: "" });
    renderPagesCreator();
}

function saveCustomStory() {
    const titleEl = document.getElementById("custom-title");
    const title = titleEl.value.trim();
    const level = document.getElementById("custom-level").value;

    if (!title) {
        alert("Please enter a title for your custom book.");
        titleEl.focus();
        return;
    }

    // Filter empty pages
    const validPages = creatorPages.filter(p => p.text.trim() !== "");
    if (validPages.length === 0) {
        alert("Please write some text on at least one page.");
        return;
    }

    // Calculate total word count
    let totalWords = 0;
    validPages.forEach(p => {
        const wordList = p.text.trim().split(/\s+/).filter(w => w !== "");
        totalWords += wordList.length;
    });

    const newBookId = `custom-${Date.now()}`;
    const customBook = {
        id: newBookId,
        title: title,
        level: level,
        wordsCount: totalWords,
        thumbnail: "", // Fallback SVG Cover will be rendered
        pages: validPages.map((vp, index) => {
            return {
                text: vp.text.trim(),
                image: "" // No custom image, will fallback to generic placeholder SVG
            };
        })
    };

    // Save to list
    books.push(customBook);

    // Save to localStorage
    try {
        const stored = localStorage.getItem("freethings_custom_books");
        let currentCustoms = stored ? JSON.parse(stored) : [];
        currentCustoms.push(customBook);
        localStorage.setItem("freethings_custom_books", JSON.stringify(currentCustoms));
    } catch (e) {
        console.error("Error saving custom book to localStorage:", e);
    }

    // Clean creator state
    titleEl.value = "";
    creatorPages = [{ text: "" }];

    // Re-render and load this book
    renderBooksList();
    selectBook(newBookId);

    // Toggle Panels back to Reading Canvas
    document.getElementById("custom-creator-card").classList.add("hide");
    document.getElementById("book-canvas").classList.remove("remove-mode");
    document.getElementById("book-canvas").classList.remove("hide");
    document.getElementById("library-card").classList.remove("hide");
    document.getElementById("settings-card").classList.remove("hide");
    document.getElementById("creator-promo").classList.remove("hide");
}

// 10. Event Listeners & Initializations
document.addEventListener("DOMContentLoaded", () => {
    // 1. Load Custom Books from localStorage
    loadCustomBooks();

    // 2. Render initial list
    renderBooksList();

    // 3. Select first book
    if (books.length > 0) {
        selectBook(books[0].id);
    }

    // 4. Level Tabs filter
    document.getElementById("level-tabs").addEventListener("click", (e) => {
        if (e.target.classList.contains("level-tab")) {
            document.querySelectorAll(".level-tab").forEach(tab => tab.classList.remove("active"));
            e.target.classList.add("active");
            
            const level = e.target.getAttribute("data-level");
            renderBooksList(level);
        }
    });

    // 5. Navigation buttons
    document.getElementById("btn-prev").addEventListener("click", () => {
        if (activePageIndex > 0) {
            activePageIndex--;
            closePhonicsPanel();
            stopReading();
            loadPage();
        }
    });

    document.getElementById("btn-next").addEventListener("click", () => {
        if (activeBook && activePageIndex < activeBook.pages.length - 1) {
            activePageIndex++;
            closePhonicsPanel();
            stopReading();
            loadPage();
        }
    });

    // 6. Settings controls
    // Font selector
    const fontSelect = document.getElementById("font-family-select");
    const textBox = document.getElementById("text-box");
    
    fontSelect.addEventListener("change", (e) => {
        const font = e.target.value;
        if (font === "'OpenDyslexic', sans-serif") {
            textBox.classList.add("font-dyslexic");
            textBox.style.fontFamily = "";
        } else {
            textBox.classList.remove("font-dyslexic");
            textBox.style.fontFamily = font;
        }
        localStorage.setItem("freethings_reader_font", font);
    });

    // Text Size
    const sizeSelect = document.getElementById("text-size-select");
    sizeSelect.addEventListener("change", (e) => {
        const size = e.target.value;
        textBox.className = `text-box size-${size}`;
        if (fontSelect.value === "'OpenDyslexic', sans-serif") {
            textBox.classList.add("font-dyslexic");
        }
        localStorage.setItem("freethings_reader_size", size);
    });

    // Theme Picker
    const themePicker = document.getElementById("theme-picker");
    themePicker.addEventListener("click", (e) => {
        if (e.target.classList.contains("theme-btn")) {
            document.querySelectorAll(".theme-btn").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");

            const theme = e.target.getAttribute("data-theme");
            // Remove previous themes
            document.body.className = "";
            if (theme !== "light") {
                document.body.classList.add(`theme-${theme}`);
            }
            localStorage.setItem("freethings_reader_theme", theme);
        }
    });

    // TTS Speed
    const ttsSpeedInput = document.getElementById("tts-speed");
    const speedDisplay = document.getElementById("speed-display");
    ttsSpeedInput.addEventListener("input", (e) => {
        const val = e.target.value;
        speedDisplay.textContent = `${val}x`;
        localStorage.setItem("freethings_reader_speed", val);
    });

    // Load saved settings
    const savedFont = localStorage.getItem("freethings_reader_font");
    if (savedFont) {
        fontSelect.value = savedFont;
        fontSelect.dispatchEvent(new Event("change"));
    }

    const savedSize = localStorage.getItem("freethings_reader_size");
    if (savedSize) {
        sizeSelect.value = savedSize;
        sizeSelect.dispatchEvent(new Event("change"));
    }

    const savedTheme = localStorage.getItem("freethings_reader_theme");
    if (savedTheme) {
        const targetBtn = themePicker.querySelector(`[data-theme="${savedTheme}"]`);
        if (targetBtn) targetBtn.click();
    }

    const savedSpeed = localStorage.getItem("freethings_reader_speed");
    if (savedSpeed) {
        ttsSpeedInput.value = savedSpeed;
        speedDisplay.textContent = `${savedSpeed}x`;
    }

    // 7. TTS buttons
    document.getElementById("btn-read-aloud").addEventListener("click", readPageAloud);
    document.getElementById("speak-phonetic-btn").addEventListener("click", () => {
        const wordText = document.getElementById("target-word").textContent;
        const cleanWord = wordText.toLowerCase().replace(/[^a-z]/g, '');
        const data = getPhonicParts(cleanWord);
        speakWordPhonetic(cleanWord, data.parts);
    });
    document.getElementById("speak-hint-btn").addEventListener("click", () => {
        const hintText = document.getElementById("phonics-tip-text").textContent;
        speakText(hintText, 0.8);
    });

    // 8. Close Phonics panel
    document.getElementById("close-phonics-btn").addEventListener("click", closePhonicsPanel);
    
    // Close phonics if clicked outside
    document.addEventListener("click", (e) => {
        const phonicsCard = document.getElementById("phonics-card");
        const canvasCard = document.getElementById("book-canvas");
        if (!phonicsCard.classList.contains("hide") && !phonicsCard.contains(e.target) && !canvasCard.contains(e.target)) {
            closePhonicsPanel();
        }
    });

    // 9. Printing helper
    document.getElementById("btn-print").addEventListener("click", () => {
        window.print();
    });

    // 10. Open/Close Custom Book Creator panel
    const creatorPromo = document.getElementById("creator-promo");
    const openCreatorBtn = document.getElementById("open-creator-btn");
    const backToLibraryBtn = document.getElementById("btn-back-to-library");
    const bookCanvas = document.getElementById("book-canvas");
    const customCreatorCard = document.getElementById("custom-creator-card");
    const libraryCard = document.getElementById("library-card");
    const settingsCard = document.getElementById("settings-card");

    openCreatorBtn.addEventListener("click", () => {
        stopReading();
        closePhonicsPanel();
        
        // Render empty pages creator
        creatorPages = [{ text: "" }];
        renderPagesCreator();
        
        // Toggle UI panels
        bookCanvas.classList.add("hide");
        libraryCard.classList.add("hide");
        settingsCard.classList.add("hide");
        creatorPromo.classList.add("hide");
        customCreatorCard.classList.remove("hide");
        
        // Scroll to editor
        customCreatorCard.scrollIntoView({ behavior: 'smooth' });
    });

    backToLibraryBtn.addEventListener("click", () => {
        customCreatorCard.classList.add("hide");
        bookCanvas.classList.remove("hide");
        libraryCard.classList.remove("hide");
        settingsCard.classList.remove("hide");
        creatorPromo.classList.remove("hide");
    });

    // 11. Add Page / Save Custom Story
    document.getElementById("btn-add-page-creator").addEventListener("click", addNewCreatorPage);
    document.getElementById("btn-save-custom-story").addEventListener("click", saveCustomStory);
});
