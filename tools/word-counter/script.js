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
    window.toggleFAQ = (el) => el.parentElement.classList.toggle('active');
    window.loadExample = (type) => {
        const ex = { short: 'Social media post example.', medium: 'This is a medium length paragraph for testing.', long: 'This is a longer text designed to test multi-sentence and multi-paragraph statistics in the word counter tool.', technical: 'const count = (text) => text.length;' };
        textArea.value = ex[type] || ''; updateCounts();
    };

    document.querySelectorAll('.example-item').forEach(item => {
        item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); } });
    });
});
