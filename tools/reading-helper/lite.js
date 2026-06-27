// Minimal iPad-focused logic
let activeBook = null;
let activePageIndex = 0;
let currentSpokenWords = [];
let pageAudio = null;
let highlightInterval = null;

const views = {
    home: document.getElementById('home-view'),
    read: document.getElementById('read-view')
};

function init() {
    renderLibrary('A'); // Default to easiest level
    
    // Setup filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderLibrary(e.target.dataset.level);
        });
    });
    
    document.getElementById('btn-back').addEventListener('click', goHome);
    document.getElementById('btn-prev').addEventListener('click', prevPage);
    document.getElementById('btn-next').addEventListener('click', nextPage);
    document.getElementById('btn-read-aloud').addEventListener('click', toggleReadAloud);

    // Touch swipe gestures for page navigation
    let touchStartX = 0;
    let touchEndX = 0;
    const readView = document.getElementById('read-view');
    
    readView.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    readView.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            nextPage();
        } else if (touchEndX > touchStartX + threshold) {
            prevPage();
        }
    }, { passive: true });
}

function renderLibrary(levelFilter = 'A') {
    const grid = document.getElementById('book-grid');
    grid.innerHTML = '';
    
    const filteredBooks = PRELOADED_BOOKS.filter(b => b.level === levelFilter);
    
    if (filteredBooks.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 40px; font-size: 1.5rem; color: #7f8c8d;';
        emptyMsg.textContent = 'No books available for this level yet.';
        grid.appendChild(emptyMsg);
        return;
    }

    filteredBooks.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <img class="book-thumbnail">
            <h3 class="book-title"></h3>
            <span class="book-level"></span>
        `;

        const img = card.querySelector('.book-thumbnail');
        img.src = book.thumbnail;
        img.alt = book.title;

        card.querySelector('.book-title').textContent = book.title;
        card.querySelector('.book-level').textContent = `Level ${book.level}`;

        card.addEventListener('click', () => openBook(book));
        grid.appendChild(card);
    });
}

function openBook(book) {
    activeBook = book;
    activePageIndex = 0;
    
    document.getElementById('book-title').textContent = book.title;
    
    views.home.classList.remove('active');
    views.read.classList.add('active');
    
    renderPage();
}

function goHome() {
    stopAudio();
    views.read.classList.remove('active');
    views.home.classList.add('active');
    activeBook = null;
}

function renderPage() {
    stopAudio();
    
    const page = activeBook.pages[activePageIndex];
    const imgEl = document.getElementById('page-img');
    
    // Ensure image has a positioned wrapper for the red cross
    let wrapper = imgEl.parentElement;
    if (!wrapper || !wrapper.classList.contains('page-img-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'page-img-wrapper';
        imgEl.parentNode.insertBefore(wrapper, imgEl);
        wrapper.appendChild(imgEl);
    }
    
    imgEl.src = page.image;
    document.getElementById('page-indicator').textContent = `${activePageIndex + 1} / ${activeBook.pages.length}`;
    
    document.getElementById('btn-prev').disabled = activePageIndex === 0;
    
    const textContainer = document.getElementById('page-text');
    textContainer.innerHTML = '';
    currentSpokenWords = [];
    
    const words = page.text.split(' ');
    words.forEach(word => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        
        span.addEventListener('click', () => playWordAudio(word, span));
        
        textContainer.appendChild(span);
        textContainer.appendChild(document.createTextNode(' '));
        
        currentSpokenWords.push({ word: word, element: span });
    });
    
    // Add red cross for local development tagging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const existingBtn = wrapper.querySelector('.tag-replace-btn');
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
        wrapper.appendChild(tagBtn);
    }
}

function prevPage() {
    if (activePageIndex > 0) {
        activePageIndex--;
        renderPage();
    }
}

function nextPage() {
    if (activePageIndex < activeBook.pages.length - 1) {
        activePageIndex++;
        renderPage();
    } else {
        goHome();
    }
}

// Audio System
function stopAudio() {
    if (pageAudio) {
        pageAudio.pause();
        pageAudio = null;
    }
    if (highlightInterval) {
        clearInterval(highlightInterval);
        highlightInterval = null;
    }
    currentSpokenWords.forEach(ws => ws.element.classList.remove('speaking'));
    
    const btn = document.getElementById('btn-read-aloud');
    btn.innerHTML = '<i class="fas fa-volume-up"></i>';
}

function playWordAudio(rawWord, element) {
    stopAudio();
    
    const cleanWord = rawWord.toLowerCase().replace(/[^a-z]/g, '');
    if (!cleanWord) return;
    
    element.classList.add('speaking');
    
    const audio = new Audio(`audio/${cleanWord}.wav`);
    audio.onended = () => element.classList.remove('speaking');
    audio.onerror = () => element.classList.remove('speaking');
    audio.play().catch(e => {
        console.error("Word play failed", e);
        element.classList.remove('speaking');
    });
}

function toggleReadAloud() {
    if (pageAudio) {
        stopAudio();
        return;
    }
    
    const btn = document.getElementById('btn-read-aloud');
    btn.innerHTML = '<i class="fas fa-pause"></i>';
    
    pageAudio = new Audio(`audio/page_${activeBook.id}_${activePageIndex}.wav`);
    
    const wordsCount = currentSpokenWords.length;
    let currentWordIndex = 0;
    
    pageAudio.onplay = () => {
        let duration = pageAudio.duration;
        if (isNaN(duration) || duration === 0) duration = 3.0;
        
        const safeDuration = Math.max(duration, 0.5);
        const intervalMs = (safeDuration * 1000) / wordsCount;
        
        if (wordsCount > 0) {
            currentSpokenWords[0].element.classList.add('speaking');
            currentWordIndex = 1;
        }
        
        highlightInterval = setInterval(() => {
            if (currentWordIndex < wordsCount) {
                currentSpokenWords.forEach(ws => ws.element.classList.remove('speaking'));
                currentSpokenWords[currentWordIndex].element.classList.add('speaking');
                currentWordIndex++;
            } else {
                clearInterval(highlightInterval);
            }
        }, intervalMs);
    };
    
    pageAudio.onended = stopAudio;
    pageAudio.onerror = stopAudio;
    pageAudio.play().catch(e => {
        console.error("Page play failed", e);
        stopAudio();
    });
}

document.addEventListener('DOMContentLoaded', init);
