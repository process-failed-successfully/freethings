// Base64 Converter JavaScript

// Global variables
let currentInputMode = 'text';
let currentOperation = 'encode';
let currentFile = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupFileUpload();
});

// Setup event listeners
function setupEventListeners() {
    const textInput = document.getElementById('text-input');
    
    // Real-time conversion for text input
    textInput.addEventListener('input', function() {
        if (currentInputMode === 'text' && this.value.trim()) {
            convertText();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (currentInputMode === 'text') {
                convertText();
            } else if (currentFile) {
                convertFile();
            }
        }
    });
}

// Setup file upload functionality
function setupFileUpload() {
    const fileUploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('file-input');
    
    // Click to upload
    fileUploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop
    fileUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });
    
    fileUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
    });
    
    fileUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

// Set input mode (text or file)
function setInputMode(mode) {
    currentInputMode = mode;
    
    // Update button states
    document.getElementById('text-mode-btn').classList.toggle('active', mode === 'text');
    document.getElementById('file-mode-btn').classList.toggle('active', mode === 'file');
    
    // Show/hide containers
    document.getElementById('text-input-container').style.display = mode === 'text' ? 'block' : 'none';
    document.getElementById('file-input-container').style.display = mode === 'file' ? 'block' : 'none';
    
    // Clear results when switching modes
    clearResults();
}

// Set operation (encode or decode)
function setOperation(operation) {
    currentOperation = operation;
    
    // Update button states
    document.getElementById('encode-btn').classList.toggle('active', operation === 'encode');
    document.getElementById('decode-btn').classList.toggle('active', operation === 'decode');
    
    // Update display
    document.getElementById('operation-display').textContent = operation === 'encode' ? 'Encode' : 'Decode';
    
    // Re-convert current content
    if (currentInputMode === 'text') {
        const textInput = document.getElementById('text-input');
        if (textInput.value.trim()) {
            convertText();
        }
    } else if (currentFile) {
        convertFile();
    }
}

// Handle file upload
function handleFileUpload() {
    const fileInput = document.getElementById('file-input');
    if (fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
    }
}

// Handle file selection
function handleFile(file) {
    currentFile = file;
    
    // Show file info
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    fileInfo.style.display = 'flex';
    document.getElementById('file-upload-area').style.display = 'none';
    
    // Auto-convert file
    convertFile();
}

// Remove selected file
function removeFile() {
    currentFile = null;
    
    document.getElementById('file-info').style.display = 'none';
    document.getElementById('file-upload-area').style.display = 'block';
    document.getElementById('file-input').value = '';
    
    clearResults();
}

// Convert text input
function convertText() {
    const textInput = document.getElementById('text-input');
    const text = textInput.value.trim();
    
    if (!text) {
        clearResults();
        return;
    }
    
    try {
        let result;
        let status = 'Success';
        
        if (currentOperation === 'encode') {
            result = btoa(unescape(encodeURIComponent(text)));
        } else {
            result = decodeURIComponent(escape(atob(text)));
        }
        
        displayResult(result, status);
        trackConversion('text', currentOperation);
        
    } catch (error) {
        displayError('Invalid input. Please check your text and try again.');
        updateStatus('Error');
    }
}

// Convert file
function convertFile() {
    if (!currentFile) {
        displayError('No file selected.');
        return;
    }
    
    const reader = new FileReader();
    
    if (currentOperation === 'encode') {
        reader.onload = function(e) {
            try {
                const result = e.target.result.split(',')[1]; // Remove data URL prefix
                displayResult(result, 'Success');
                trackConversion('file', 'encode');
            } catch (error) {
                displayError('Failed to encode file.');
                updateStatus('Error');
            }
        };
        reader.readAsDataURL(currentFile);
    } else {
        // For decode, we need to treat the file as Base64 text
        reader.onload = function(e) {
            try {
                const base64String = e.target.result;
                const binaryString = atob(base64String);
                
                // Create blob and download
                const blob = new Blob([binaryString], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                
                displayFileResult(url, currentFile.name);
                trackConversion('file', 'decode');
                
            } catch (error) {
                displayError('Invalid Base64 file. Please check the file format.');
                updateStatus('Error');
            }
        };
        reader.readAsText(currentFile);
    }
    
    updateStatus('Processing...');
}

// Display text result
function displayResult(result, status) {
    const resultOutput = document.getElementById('result-output');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    resultOutput.innerHTML = `<div class="result-text">${result}</div>`;
    resultOutput.classList.add('has-result');
    
    // Enable copy button
    copyBtn.disabled = false;
    copyBtn.style.opacity = '1';
    
    // Hide download button for text results
    downloadBtn.style.display = 'none';
    
    // Update info
    document.getElementById('size-display').textContent = `${result.length} characters`;
    updateStatus(status);
    
    // Store result for copying
    window.lastResult = result;
    window.resultType = 'text';
}

// Display file result (for decoded files)
function displayFileResult(url, fileName) {
    const resultOutput = document.getElementById('result-output');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    resultOutput.innerHTML = `
        <div class="result-file">
            <i class="fas fa-file"></i>
            <div class="file-result-info">
                <div class="file-name">${fileName}</div>
                <div class="file-status">Ready for download</div>
            </div>
        </div>
    `;
    resultOutput.classList.add('has-result');
    
    // Disable copy button for file results
    copyBtn.disabled = true;
    copyBtn.style.opacity = '0.5';
    
    // Enable download button
    downloadBtn.style.display = 'flex';
    downloadBtn.disabled = false;
    downloadBtn.style.opacity = '1';
    
    // Update info
    document.getElementById('size-display').textContent = `${currentFile.size} bytes`;
    updateStatus('Ready');
    
    // Store result for downloading
    window.lastResult = url;
    window.resultType = 'file';
    window.resultFileName = fileName;
}

// Display error message
function displayError(message) {
    const resultOutput = document.getElementById('result-output');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    resultOutput.innerHTML = `
        <div class="result-placeholder">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
    resultOutput.classList.remove('has-result');
    
    copyBtn.disabled = true;
    copyBtn.style.opacity = '0.5';
    downloadBtn.style.display = 'none';
    
    document.getElementById('size-display').textContent = '- characters';
}

// Update status
function updateStatus(status) {
    document.getElementById('status-display').textContent = status;
}

// Clear results
function clearResults() {
    const resultOutput = document.getElementById('result-output');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    resultOutput.innerHTML = `
        <div class="result-placeholder">
            <i class="fas fa-exchange-alt"></i>
            <p>Your converted result will appear here</p>
        </div>
    `;
    resultOutput.classList.remove('has-result');
    
    copyBtn.disabled = true;
    copyBtn.style.opacity = '0.5';
    downloadBtn.style.display = 'none';
    
    document.getElementById('size-display').textContent = '- characters';
    updateStatus('Ready');
    
    window.lastResult = null;
    window.resultType = null;
}

// Copy result to clipboard
function copyResult() {
    if (!window.lastResult || window.resultType !== 'text') {
        showNotification('No text result to copy');
        return;
    }
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(window.lastResult).then(() => {
            showNotification('Result copied to clipboard!');
            trackCopy();
        }).catch(() => {
            fallbackCopy(window.lastResult);
        });
    } else {
        fallbackCopy(window.lastResult);
    }
}

// Download result file
function downloadResult() {
    if (!window.lastResult || window.resultType !== 'file') {
        showNotification('No file to download');
        return;
    }
    
    const link = document.createElement('a');
    link.href = window.lastResult;
    link.download = window.resultFileName || 'decoded_file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('File downloaded!');
    trackDownload();
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
        showNotification('Result copied to clipboard!');
        trackCopy();
    } catch (err) {
        showNotification('Failed to copy result');
    }
    
    document.body.removeChild(textArea);
}

// Load example
function loadExample(type) {
    const textInput = document.getElementById('text-input');
    
    // Switch to text mode
    setInputMode('text');
    
    const examples = {
        hello: 'Hello World',
        json: '{"name": "John", "age": 30}',
        url: 'https://example.com',
        binary: 'Hello'
    };
    
    textInput.value = examples[type] || '';
    convertText();
    
    // Scroll to input
    textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    textInput.focus();
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
function trackConversion(inputType, operation) {
    console.log('Base64 conversion tracked:', {
        inputType: inputType,
        operation: operation,
        timestamp: new Date().toISOString()
    });
    
    // Example: Google Analytics 4
    // gtag('event', 'base64_conversion', {
    //     input_type: inputType,
    //     operation: operation
    // });
}

function trackCopy() {
    console.log('Base64 copy tracked:', {
        timestamp: new Date().toISOString()
    });
    
    // Example: Google Analytics 4
    // gtag('event', 'base64_copied', {});
}

function trackDownload() {
    console.log('Base64 download tracked:', {
        timestamp: new Date().toISOString()
    });
    
    // Example: Google Analytics 4
    // gtag('event', 'base64_downloaded', {});
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
window.testBase64Converter = function() {
    console.log('Testing Base64 converter...');
    
    const testText = 'Hello World';
    const encoded = btoa(unescape(encodeURIComponent(testText)));
    const decoded = decodeURIComponent(escape(atob(encoded)));
    
    console.log('Original:', testText);
    console.log('Encoded:', encoded);
    console.log('Decoded:', decoded);
    console.log('Match:', testText === decoded);
    
    console.log('Base64 converter test completed');
};

