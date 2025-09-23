// Text Case Converter JavaScript

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateStats();
});

// Setup event listeners
function setupEventListeners() {
    const textInput = document.getElementById('text-input');
    
    // Real-time stats update
    textInput.addEventListener('input', function() {
        updateStats();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (textInput.value.trim()) {
                convertText('title'); // Default to title case on Ctrl+Enter
            }
        }
    });
}

// Update text statistics
function updateStats() {
    const text = document.getElementById('text-input').value;
    
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lineCount = text.split('\n').length;
    
    document.getElementById('char-count').textContent = `${charCount} characters`;
    document.getElementById('word-count').textContent = `${wordCount} words`;
    document.getElementById('line-count').textContent = `${lineCount} lines`;
}

// Convert text to specified case
function convertText(caseType) {
    const text = document.getElementById('text-input').value.trim();
    
    if (!text) {
        showError('Please enter some text to convert');
        return;
    }
    
    let result;
    
    switch (caseType) {
        case 'uppercase':
            result = text.toUpperCase();
            break;
            
        case 'lowercase':
            result = text.toLowerCase();
            break;
            
        case 'title':
            result = toTitleCase(text);
            break;
            
        case 'sentence':
            result = toSentenceCase(text);
            break;
            
        case 'camel':
            result = toCamelCase(text);
            break;
            
        case 'pascal':
            result = toPascalCase(text);
            break;
            
        case 'snake':
            result = toSnakeCase(text);
            break;
            
        case 'kebab':
            result = toKebabCase(text);
            break;
            
        case 'constant':
            result = toConstantCase(text);
            break;
            
        case 'alternating':
            result = toAlternatingCase(text);
            break;
            
        default:
            showError('Unknown case type');
            return;
    }
    
    showResult(result);
    trackConversion(caseType);
}

// Title Case: First Letter of Each Word Capitalized
function toTitleCase(text) {
    return text.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// Sentence Case: First Letter of Each Sentence Capitalized
function toSentenceCase(text) {
    return text.toLowerCase().replace(/(^\w|\.\s+\w)/g, function(txt) {
        return txt.toUpperCase();
    });
}

// Camel Case: firstWordSecondWord
function toCamelCase(text) {
    return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9]/g, '');
}

// Pascal Case: FirstWordSecondWord
function toPascalCase(text) {
    return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word) {
            return word.toUpperCase();
        })
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9]/g, '');
}

// Snake Case: first_word_second_word
function toSnakeCase(text) {
    return text
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('_');
}

// Kebab Case: first-word-second-word
function toKebabCase(text) {
    return text
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('-');
}

// Constant Case: FIRST_WORD_SECOND_WORD
function toConstantCase(text) {
    return text
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toUpperCase())
        .join('_');
}

// Alternating Case: AlTeRnAtInG cAsE
function toAlternatingCase(text) {
    let result = '';
    let upperCase = true;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (/[a-zA-Z]/.test(char)) {
            result += upperCase ? char.toUpperCase() : char.toLowerCase();
            upperCase = !upperCase;
        } else {
            result += char;
            // Don't toggle case for non-letter characters
        }
    }
    
    return result;
}

// Show conversion result
function showResult(result) {
    const resultOutput = document.getElementById('result-output');
    const copyBtn = document.getElementById('copy-btn');
    
    resultOutput.innerHTML = result;
    resultOutput.classList.add('has-content');
    
    // Enable copy button
    copyBtn.disabled = false;
    copyBtn.style.opacity = '1';
    
    // Store result for copying
    window.lastConversionResult = result;
    
    // Scroll to result if on mobile
    if (window.innerWidth <= 768) {
        resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Show error message
function showError(message) {
    const resultOutput = document.getElementById('result-output');
    const copyBtn = document.getElementById('copy-btn');
    
    resultOutput.innerHTML = `
        <div class="result-placeholder">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
    resultOutput.classList.remove('has-content');
    
    copyBtn.disabled = true;
    copyBtn.style.opacity = '0.5';
}

// Clear result
function clearResult() {
    const resultOutput = document.getElementById('result-output');
    const copyBtn = document.getElementById('copy-btn');
    
    resultOutput.innerHTML = `
        <div class="result-placeholder">
            <i class="fas fa-font"></i>
            <p>Your converted text will appear here</p>
        </div>
    `;
    resultOutput.classList.remove('has-content');
    
    copyBtn.disabled = true;
    copyBtn.style.opacity = '0.5';
    
    window.lastConversionResult = null;
}

// Copy result to clipboard
function copyResult() {
    if (!window.lastConversionResult) {
        showNotification('No result to copy');
        return;
    }
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(window.lastConversionResult).then(() => {
            showNotification('Text copied to clipboard!');
            trackCopy();
        }).catch(() => {
            fallbackCopy(window.lastConversionResult);
        });
    } else {
        fallbackCopy(window.lastConversionResult);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Text copied to clipboard!');
        trackCopy();
    } catch (err) {
        showNotification('Failed to copy text');
    }
    
    document.body.removeChild(textArea);
}

// Load example text
function loadExample(text) {
    document.getElementById('text-input').value = text;
    updateStats();
    
    // Scroll to input
    document.getElementById('text-input').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
    
    // Focus on input
    document.getElementById('text-input').focus();
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Toggle FAQ items
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Analytics tracking
function trackConversion(caseType) {
    console.log('Case conversion tracked:', {
        caseType: caseType,
        timestamp: new Date().toISOString()
    });
    
    // Example: Google Analytics 4
    // gtag('event', 'text_conversion', {
    //     case_type: caseType
    // });
}

function trackCopy() {
    console.log('Copy action tracked:', {
        timestamp: new Date().toISOString()
    });
    
    // Example: Google Analytics 4
    // gtag('event', 'text_copied', {});
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Test function for debugging
window.testCaseConverter = function() {
    console.log('Testing case converter...');
    
    const testText = 'hello world test';
    
    console.log('Original:', testText);
    console.log('Uppercase:', testText.toUpperCase());
    console.log('Lowercase:', testText.toLowerCase());
    console.log('Title Case:', toTitleCase(testText));
    console.log('Camel Case:', toCamelCase(testText));
    console.log('Pascal Case:', toPascalCase(testText));
    console.log('Snake Case:', toSnakeCase(testText));
    console.log('Kebab Case:', toKebabCase(testText));
    console.log('Constant Case:', toConstantCase(testText));
    console.log('Alternating Case:', toAlternatingCase(testText));
    
    console.log('Case converter test completed');
};

// Auto-save functionality (optional)
function saveToLocalStorage() {
    const text = document.getElementById('text-input').value;
    if (text) {
        localStorage.setItem('caseConverterText', text);
    }
}

function loadFromLocalStorage() {
    const savedText = localStorage.getItem('caseConverterText');
    if (savedText) {
        document.getElementById('text-input').value = savedText;
        updateStats();
    }
}

// Auto-save on input
document.getElementById('text-input').addEventListener('input', function() {
    // Debounce the save operation
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(saveToLocalStorage, 1000);
});

// Load saved text on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
});

// Clear saved text when page is unloaded (optional)
window.addEventListener('beforeunload', function() {
    localStorage.removeItem('caseConverterText');
});
