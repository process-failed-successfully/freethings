// QR Code Generator JavaScript

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateInputFields();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add input event listeners for real-time validation
    document.addEventListener('input', function(e) {
        if (e.target.matches('#qr-type, #qr-size, #qr-color, #qr-bg-color')) {
            // Auto-generate QR code when settings change (if content exists)
            const content = getQRContent();
            if (content) {
                generateQRCode();
            }
        }
    });
}

// Update input fields based on QR type
function updateInputFields() {
    const qrType = document.getElementById('qr-type').value;
    const inputFields = document.getElementById('input-fields');
    
    let html = '';
    
    switch(qrType) {
        case 'url':
            html = `
                <div class="input-group">
                    <label for="url-input">Website URL:</label>
                    <input type="url" id="url-input" placeholder="https://example.com" required>
                </div>
            `;
            break;
            
        case 'text':
            html = `
                <div class="input-group">
                    <label for="text-input">Text Content:</label>
                    <textarea id="text-input" placeholder="Enter your text here..." rows="3" required></textarea>
                </div>
            `;
            break;
            
        case 'wifi':
            html = `
                <div class="input-group">
                    <label for="wifi-ssid">Network Name (SSID):</label>
                    <input type="text" id="wifi-ssid" placeholder="MyWiFiNetwork" required>
                </div>
                <div class="input-group">
                    <label for="wifi-password">Password:</label>
                    <input type="password" id="wifi-password" placeholder="Enter WiFi password">
                </div>
                <div class="input-group">
                    <label for="wifi-security">Security Type:</label>
                    <select id="wifi-security">
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">No Password</option>
                    </select>
                </div>
            `;
            break;
            
        case 'email':
            html = `
                <div class="input-group">
                    <label for="email-address">Email Address:</label>
                    <input type="email" id="email-address" placeholder="example@email.com" required>
                </div>
                <div class="input-group">
                    <label for="email-subject">Subject (Optional):</label>
                    <input type="text" id="email-subject" placeholder="Email subject">
                </div>
                <div class="input-group">
                    <label for="email-body">Message (Optional):</label>
                    <textarea id="email-body" placeholder="Email message" rows="3"></textarea>
                </div>
            `;
            break;
            
        case 'phone':
            html = `
                <div class="input-group">
                    <label for="phone-number">Phone Number:</label>
                    <input type="tel" id="phone-number" placeholder="+1234567890" required>
                </div>
            `;
            break;
            
        case 'sms':
            html = `
                <div class="input-group">
                    <label for="sms-number">Phone Number:</label>
                    <input type="tel" id="sms-number" placeholder="+1234567890" required>
                </div>
                <div class="input-group">
                    <label for="sms-message">Message (Optional):</label>
                    <textarea id="sms-message" placeholder="SMS message" rows="3"></textarea>
                </div>
            `;
            break;
    }
    
    inputFields.innerHTML = html;
}

// Get QR content based on current type and inputs
function getQRContent() {
    const qrType = document.getElementById('qr-type').value;
    
    switch(qrType) {
        case 'url':
            return document.getElementById('url-input')?.value || '';
            
        case 'text':
            return document.getElementById('text-input')?.value || '';
            
        case 'wifi':
            const ssid = document.getElementById('wifi-ssid')?.value || '';
            const password = document.getElementById('wifi-password')?.value || '';
            const security = document.getElementById('wifi-security')?.value || 'WPA';
            
            if (!ssid) return '';
            
            if (security === 'nopass') {
                return `WIFI:T:nopass;S:${ssid};;`;
            } else {
                return `WIFI:T:${security};S:${ssid};P:${password};;`;
            }
            
        case 'email':
            const email = document.getElementById('email-address')?.value || '';
            const subject = document.getElementById('email-subject')?.value || '';
            const body = document.getElementById('email-body')?.value || '';
            
            if (!email) return '';
            
            let emailContent = `mailto:${email}`;
            const params = [];
            
            if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
            if (body) params.push(`body=${encodeURIComponent(body)}`);
            
            if (params.length > 0) {
                emailContent += '?' + params.join('&');
            }
            
            return emailContent;
            
        case 'phone':
            const phone = document.getElementById('phone-number')?.value || '';
            return phone ? `tel:${phone}` : '';
            
        case 'sms':
            const smsNumber = document.getElementById('sms-number')?.value || '';
            const smsMessage = document.getElementById('sms-message')?.value || '';
            
            if (!smsNumber) return '';
            
            let smsContent = `sms:${smsNumber}`;
            if (smsMessage) {
                smsContent += `:${encodeURIComponent(smsMessage)}`;
            }
            
            return smsContent;
            
        default:
            return '';
    }
}

// Generate QR Code
function generateQRCode() {
    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        alert('QR Code library is still loading. Please wait a moment and try again.');
        return;
    }
    
    const content = getQRContent();
    
    if (!content) {
        alert('Please enter content to generate QR code');
        return;
    }
    
    const generateBtn = document.getElementById('generate-btn');
    const qrOutput = document.getElementById('qr-output');
    const downloadSection = document.getElementById('download-section');
    
    // Show loading state
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    
    // Get options
    const size = parseInt(document.getElementById('qr-size').value);
    const color = document.getElementById('qr-color').value;
    const bgColor = document.getElementById('qr-bg-color').value;
    
    // QR Code options
    const options = {
        width: size,
        height: size,
        color: {
            dark: color,
            light: bgColor
        },
        margin: 2,
        errorCorrectionLevel: 'M'
    };
    
    // Clear previous QR code
    qrOutput.innerHTML = '';
    
    // Try to generate QR code using multiple methods
    function tryGenerateQRCode() {
        console.log('Starting QR code generation with content:', content);
        console.log('Options:', options);
        console.log('QRCode library available:', typeof QRCode);
        
        // Method 1: Try QRCode.toCanvas with a div container
        try {
            QRCode.toCanvas(qrOutput, content, options, function (error, canvas) {
                if (error) {
                    console.warn('QRCode.toCanvas failed, trying alternative method:', error);
                    tryAlternativeMethod();
                } else {
                    console.log('QRCode.toCanvas succeeded');
                    handleSuccess(canvas);
                }
            });
        } catch (e) {
            console.warn('QRCode.toCanvas threw exception, trying alternative method:', e);
            tryAlternativeMethod();
        }
    }
    
    function tryAlternativeMethod() {
        console.log('Trying alternative QR code generation method...');
        
        // Method 2: Generate as data URL and create img element
        QRCode.toDataURL(content, options, function (error, url) {
            if (error) {
                console.error('QRCode.toDataURL also failed:', error);
                showError(error);
                return;
            }
            
            console.log('QRCode.toDataURL succeeded, creating image element');
            
            // Create img element from data URL
            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            
            qrOutput.appendChild(img);
            
            // Create a canvas for download purposes
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = options.width;
            canvas.height = options.height;
            
            img.onload = function() {
                console.log('Image loaded, drawing to canvas for download');
                ctx.drawImage(img, 0, 0);
                window.currentQRCanvas = canvas;
                handleSuccess(canvas);
            };
            
            img.onerror = function() {
                console.error('Failed to load QR code image');
                showError(new Error('Failed to load QR code image'));
            };
        });
    }
    
    function handleSuccess(canvas) {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
        
        // Show download section
        downloadSection.style.display = 'flex';
        
        // Store canvas for download
        window.currentQRCanvas = canvas;
        
        // Add some styling to the canvas if it's visible
        if (canvas.style) {
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
            canvas.style.borderRadius = '8px';
            canvas.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }
    }
    
    function showError(error) {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
        
        qrOutput.innerHTML = `
            <div class="qr-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error generating QR code. Please try again.</p>
                <small>Error: ${error.message || 'Unknown error'}</small>
            </div>
        `;
        downloadSection.style.display = 'none';
    }
    
    // Start the generation process
    tryGenerateQRCode();
}

// Download QR Code
function downloadQRCode() {
    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        alert('QR Code library is not loaded. Please refresh the page and try again.');
        return;
    }
    
    if (!window.currentQRCanvas) {
        alert('No QR code to download');
        return;
    }
    
    const format = document.querySelector('input[name="format"]:checked').value;
    const canvas = window.currentQRCanvas;
    
    if (format === 'png') {
        // Download as PNG
        const link = document.createElement('a');
        link.download = `qrcode-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } else if (format === 'svg') {
        // For SVG, we need to regenerate with SVG format
        const content = getQRContent();
        const size = parseInt(document.getElementById('qr-size').value);
        const color = document.getElementById('qr-color').value;
        const bgColor = document.getElementById('qr-bg-color').value;
        
        const options = {
            width: size,
            height: size,
            color: {
                dark: color,
                light: bgColor
            },
            margin: 2,
            errorCorrectionLevel: 'M'
        };
        
        QRCode.toString(content, options, function (error, string) {
            if (error) {
                console.error('SVG generation error:', error);
                alert('Error generating SVG. Please try PNG format.');
                return;
            }
            
            // Create and download SVG file
            const blob = new Blob([string], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `qrcode-${Date.now()}.svg`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    }
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

// Set QR type from footer links
function setQRType(type) {
    document.getElementById('qr-type').value = type;
    updateInputFields();
    
    // Scroll to generator section
    document.querySelector('.generator-section').scrollIntoView({
        behavior: 'smooth'
    });
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

// Add some utility functions for better UX
function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    
    if (type === 'url' && value) {
        try {
            new URL(value);
            input.style.borderColor = '#10b981';
        } catch {
            input.style.borderColor = '#ef4444';
        }
    } else if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        input.style.borderColor = emailRegex.test(value) ? '#10b981' : '#ef4444';
    } else {
        input.style.borderColor = value ? '#10b981' : '#e5e7eb';
    }
}

// Add input validation
document.addEventListener('input', function(e) {
    if (e.target.matches('input[type="url"], input[type="email"]')) {
        validateInput(e.target);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate QR code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generateQRCode();
    }
});

// Add copy to clipboard functionality
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Copied to clipboard!');
    }
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
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
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

// Add analytics placeholder (for future implementation)
function trackEvent(eventName, eventData) {
    // Placeholder for analytics tracking
    console.log('Analytics Event:', eventName, eventData);
    
    // Example: Google Analytics 4
    // gtag('event', eventName, eventData);
}

// Track QR code generation
function trackQRGeneration(type, size) {
    trackEvent('qr_generated', {
        qr_type: type,
        qr_size: size,
        timestamp: new Date().toISOString()
    });
}

// Track downloads
function trackDownload(format) {
    trackEvent('qr_downloaded', {
        format: format,
        timestamp: new Date().toISOString()
    });
}

// Update generateQRCode to include tracking
const originalGenerateQRCode = generateQRCode;
generateQRCode = function() {
    const content = getQRContent();
    const qrType = document.getElementById('qr-type').value;
    const size = document.getElementById('qr-size').value;
    
    originalGenerateQRCode();
    
    if (content) {
        trackQRGeneration(qrType, size);
    }
};

// Update downloadQRCode to include tracking
const originalDownloadQRCode = downloadQRCode;
downloadQRCode = function() {
    const format = document.querySelector('input[name="format"]:checked').value;
    
    originalDownloadQRCode();
    trackDownload(format);
};

// Test function for debugging (can be called from browser console)
window.testQRCode = function() {
    console.log('Testing QRCode library...');
    console.log('QRCode object:', typeof QRCode);
    
    if (typeof QRCode === 'undefined') {
        console.error('QRCode library is not loaded');
        return;
    }
    
    console.log('QRCode methods:', Object.keys(QRCode));
    
    // Test simple generation
    QRCode.toDataURL('test', { width: 100 }, function(error, url) {
        if (error) {
            console.error('QRCode test failed:', error);
        } else {
            console.log('QRCode test successful:', url.substring(0, 50) + '...');
        }
    });
};

// Test QR generation function (called by test button)
function testQRGeneration() {
    console.log('=== QR Code Generation Test ===');
    
    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        alert('QRCode library is not loaded. Please wait for the page to fully load and try again.');
        return;
    }
    
    // Set test content
    document.getElementById('qr-type').value = 'url';
    updateInputFields();
    
    const urlInput = document.getElementById('url-input');
    if (urlInput) {
        urlInput.value = 'https://example.com';
    }
    
    // Generate QR code
    console.log('Starting test QR code generation...');
    generateQRCode();
}
