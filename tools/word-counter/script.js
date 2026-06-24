// Word Counter Tool
document.addEventListener('DOMContentLoaded', function() {
    const textArea = document.getElementById('text-input');
    const wordCount = document.getElementById('word-count');
    const charCount = document.getElementById('char-count');
    const charCountNoSpaces = document.getElementById('char-no-spaces');
    const sentenceCount = document.getElementById('sentence-count');
    const paragraphCount = document.getElementById('paragraph-count');
    const readingTime = document.getElementById('reading-time');
    const statCards = document.querySelectorAll('.stat-card');

    function updateCounts() {
        const text = textArea.value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const charNoSpaces = text.replace(/\s/g, '').length;
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);

        wordCount.textContent = words.length;
        charCount.textContent = text.length;
        charCountNoSpaces.textContent = charNoSpaces;
        sentenceCount.textContent = sentences.length;
        paragraphCount.textContent = paragraphs.length;
        readingTime.textContent = Math.ceil(words.length / 200) + ' min';

        const copyBtn = document.getElementById('copy-stats-btn');
        if (copyBtn) {
            copyBtn.disabled = text.length === 0;
        }

        if (text.length > 0) {
            statCards.forEach(card => {
                card.classList.remove('updated');
                void card.offsetWidth; // Trigger reflow
                card.classList.add('updated');
            });
        }
    }

    textArea.addEventListener('input', updateCounts);
    updateCounts();

    window.clearText = () => { textArea.value = ''; updateCounts(); textArea.focus(); };
    window.pasteText = () => { navigator.clipboard.readText().then(t => { textArea.value += t; updateCounts(); }); };

    window.copyStats = () => {
        const stats = [
            `Characters: ${charCount.textContent}`,
            `Characters (no spaces): ${charCountNoSpaces.textContent}`,
            `Words: ${wordCount.textContent}`,
            `Sentences: ${sentenceCount.textContent}`,
            `Paragraphs: ${paragraphCount.textContent}`,
            `Reading Time: ${readingTime.textContent}`
        ].join('\n');

        const btn = document.getElementById('copy-stats-btn');
        const originalHtml = btn.innerHTML;

        navigator.clipboard.writeText(stats).then(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.classList.remove('copied');
            }, 2000);
        });
    };

    window.toggleFAQ = (el) => {
        const item = el.parentElement;
        const isActive = item.classList.toggle('active');
        el.setAttribute('aria-expanded', isActive);
    };

    window.loadExample = (type) => {
        const ex = {
            short: 'Social media post example. #wordcounter',
            medium: 'This is a medium length paragraph for testing. It has multiple sentences to verify the sentence counting logic works as expected.',
            long: 'This is a longer text designed to test multi-sentence and multi-paragraph statistics.\n\nIt features multiple paragraphs to ensure that the paragraph counter correctly identifies the structure of the text.\n\nFinal paragraph for completeness.',
            technical: 'const countWords = (text) => {\n  return text.trim().split(/\\s+/).length;\n};'
        };
        textArea.value = ex[type] || '';
        updateCounts();
    };

    // Keyboard accessibility for interactive elements
    const interactiveElements = document.querySelectorAll('.example-item, .faq-question');
    interactiveElements.forEach(item => {
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });
});
