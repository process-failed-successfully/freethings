// Word Counter Tool
document.addEventListener('DOMContentLoaded', function() {
    const textArea = document.getElementById('text-input');
    const wordCount = document.getElementById('word-count');
    const charCount = document.getElementById('char-count');
    const charCountNoSpaces = document.getElementById('char-count-no-spaces');
    const sentenceCount = document.getElementById('sentence-count');
    const paragraphCount = document.getElementById('paragraph-count');
    const readingTime = document.getElementById('reading-time');

    function updateCounts() {
        const text = textArea.value;
        
        // Word count
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        wordCount.textContent = words.length;
        
        // Character count
        charCount.textContent = text.length;
        
        // Character count without spaces
        charCountNoSpaces.textContent = text.replace(/\s/g, '').length;
        
        // Sentence count
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        sentenceCount.textContent = sentences.length;
        
        // Paragraph count
        const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
        paragraphCount.textContent = paragraphs.length;
        
        // Reading time (average 200 words per minute)
        const readingTimeMinutes = Math.ceil(words.length / 200);
        readingTime.textContent = readingTimeMinutes;
    }

    textArea.addEventListener('input', updateCounts);
    
    // Initial count
    updateCounts();
});
