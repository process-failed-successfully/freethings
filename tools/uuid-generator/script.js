// UUID Generator JavaScript

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateOptions();
    generateExampleUUIDs();
    loadHistory();
    generateUUID(); // Generate initial UUID
});

// Character sets for different ID types
const nanoidAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

// Update options based on UUID type
function updateOptions() {
    const uuidType = document.getElementById('uuid-type').value;
    const optionsContainer = document.getElementById('options-container');
    
    let optionsHTML = '';
    
    switch (uuidType) {
        case 'v4':
            optionsHTML = `
                <div class="options-group">
                    <h3>UUID v4 Options:</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="include-braces" checked>
                            <span class="checkmark"></span>
                            Include braces: {uuid}
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="uppercase" checked>
                            <span class="checkmark"></span>
                            Uppercase letters
                        </label>
                    </div>
                </div>
            `;
            break;
            
        case 'v1':
            optionsHTML = `
                <div class="options-group">
                    <h3>UUID v1 Options:</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="include-braces" checked>
                            <span class="checkmark"></span>
                            Include braces: {uuid}
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="uppercase" checked>
                            <span class="checkmark"></span>
                            Uppercase letters
                        </label>
                    </div>
                    <div class="input-group">
                        <label for="custom-mac">Custom MAC Address (optional):</label>
                        <input type="text" id="custom-mac" placeholder="00:11:22:33:44:55">
                        <small>Leave empty for random MAC address</small>
                    </div>
                </div>
            `;
            break;
            
        case 'timestamp':
            optionsHTML = `
                <div class="options-group">
                    <h3>Timestamp Options:</h3>
                    <div class="input-group">
                        <label for="timestamp-prefix">Prefix:</label>
                        <input type="text" id="timestamp-prefix" placeholder="id">
                    </div>
                    <div class="input-group">
                        <label for="timestamp-suffix-length">Suffix Length:</label>
                        <input type="range" id="timestamp-suffix-length" min="3" max="12" value="6" oninput="updateSuffixDisplay()">
                        <span id="suffix-display">6</span>
                    </div>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="use-nanoid-suffix">
                            <span class="checkmark"></span>
                            Use Nano ID for suffix
                        </label>
                    </div>
                </div>
            `;
            break;
            
        case 'nanoid':
            optionsHTML = `
                <div class="options-group">
                    <h3>Nano ID Options:</h3>
                    <div class="input-group">
                        <label for="nanoid-length">Length:</label>
                        <input type="range" id="nanoid-length" min="4" max="64" value="21" oninput="updateNanoIdDisplay()">
                        <span id="nanoid-display">21</span>
                    </div>
                    <div class="input-group">
                        <label for="custom-alphabet">Custom Alphabet (optional):</label>
                        <input type="text" id="custom-alphabet" placeholder="${nanoidAlphabet}">
                        <small>Leave empty for default URL-safe alphabet</small>
                    </div>
                </div>
            `;
            break;
    }
    
    optionsContainer.innerHTML = optionsHTML;
}

// Update suffix length display
function updateSuffixDisplay() {
    const length = document.getElementById('timestamp-suffix-length').value;
    document.getElementById('suffix-display').textContent = length;
}

// Update Nano ID length display
function updateNanoIdDisplay() {
    const length = document.getElementById('nanoid-length').value;
    document.getElementById('nanoid-display').textContent = length;
}

// Generate a single UUID
function generateUUID() {
    const uuidType = document.getElementById('uuid-type').value;
    let uuid;
    let typeDisplay;
    let format;
    
    switch (uuidType) {
        case 'v4':
            uuid = generateUUIDv4();
            typeDisplay = 'UUID v4 (Random)';
            format = 'Standard UUID format';
            break;
            
        case 'v1':
            uuid = generateUUIDv1();
            typeDisplay = 'UUID v1 (Timestamp)';
            format = 'Standard UUID format';
            break;
            
        case 'timestamp':
            uuid = generateTimestampID();
            typeDisplay = 'Timestamp-based ID';
            format = 'Custom timestamp format';
            break;
            
        case 'nanoid':
            uuid = generateNanoID();
            typeDisplay = 'Nano ID';
            format = 'URL-safe unique ID';
            break;
            
        default:
            uuid = generateUUIDv4();
            typeDisplay = 'UUID v4 (Random)';
            format = 'Standard UUID format';
    }
    
    displayUUID(uuid, typeDisplay, format);
    addToHistory(uuid, typeDisplay);
    trackUUIDGeneration(uuidType);
}

// Generate UUID v4 (Random)
function generateUUIDv4() {
    const includeBraces = document.getElementById('include-braces')?.checked ?? true;
    const uppercase = document.getElementById('uppercase')?.checked ?? true;
    
    // Generate random UUID v4
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    
    // Set version (4) and variant bits
    array[6] = (array[6] & 0x0f) | 0x40;
    array[8] = (array[8] & 0x3f) | 0x80;
    
    // Convert to hex string
    let hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Format as UUID
    let uuid = [
        hex.substr(0, 8),
        hex.substr(8, 4),
        hex.substr(12, 4),
        hex.substr(16, 4),
        hex.substr(20, 12)
    ].join('-');
    
    if (uppercase) {
        uuid = uuid.toUpperCase();
    }
    
    if (includeBraces) {
        uuid = `{${uuid}}`;
    }
    
    return uuid;
}

// Generate UUID v1 (Timestamp-based)
function generateUUIDv1() {
    const includeBraces = document.getElementById('include-braces')?.checked ?? true;
    const uppercase = document.getElementById('uppercase')?.checked ?? true;
    const customMac = document.getElementById('custom-mac')?.value;
    
    // Generate timestamp (60-bit)
    const now = Date.now();
    const timestamp = Math.floor(now / 1000) * 10000000 + 122192928000000000; // Convert to 100-nanosecond intervals since Oct 15, 1582
    
    // Convert timestamp to hex (48 bits)
    const timeLow = timestamp & 0xffffffff;
    const timeMid = (timestamp >> 32) & 0xffff;
    const timeHigh = ((timestamp >> 48) & 0x0fff) | 0x1000; // Version 1
    
    // Generate or use custom MAC address
    let mac;
    if (customMac && customMac.match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)) {
        mac = customMac.replace(/[:-]/g, '');
    } else {
        // Generate random MAC address
        const macArray = new Uint8Array(6);
        crypto.getRandomValues(macArray);
        macArray[0] = (macArray[0] & 0xfe) | 0x02; // Set multicast bit
        mac = Array.from(macArray, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Create UUID
    let uuid = [
        timeLow.toString(16).padStart(8, '0'),
        timeMid.toString(16).padStart(4, '0'),
        timeHigh.toString(16).padStart(4, '0'),
        mac.substr(0, 4),
        mac.substr(4, 8)
    ].join('-');
    
    if (uppercase) {
        uuid = uuid.toUpperCase();
    }
    
    if (includeBraces) {
        uuid = `{${uuid}}`;
    }
    
    return uuid;
}

// Generate timestamp-based ID
function generateTimestampID() {
    const prefix = document.getElementById('timestamp-prefix')?.value || 'id';
    const suffixLength = parseInt(document.getElementById('timestamp-suffix-length')?.value || 6);
    const useNanoIdSuffix = document.getElementById('use-nanoid-suffix')?.checked ?? false;
    
    const timestamp = Date.now();
    
    let suffix;
    if (useNanoIdSuffix) {
        suffix = generateNanoID(suffixLength);
    } else {
        // Generate random suffix
        const array = new Uint8Array(Math.ceil(suffixLength / 2));
        crypto.getRandomValues(array);
        suffix = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').substr(0, suffixLength);
    }
    
    return `${prefix}-${timestamp}-${suffix}`;
}

// Generate Nano ID
function generateNanoID(customLength = null) {
    const length = customLength || parseInt(document.getElementById('nanoid-length')?.value || 21);
    const customAlphabet = document.getElementById('custom-alphabet')?.value;
    const alphabet = customAlphabet || nanoidAlphabet;
    
    let id = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
        id += alphabet[array[i] % alphabet.length];
    }
    
    return id;
}

// Display generated UUID
function displayUUID(uuid, typeDisplay, format) {
    const uuidOutput = document.getElementById('uuid-output');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');

    uuidOutput.innerHTML = `<div class="uuid-display">${uuid}</div>`;

    // Update info
    document.getElementById('uuid-type-display').textContent = typeDisplay;
    document.getElementById('uuid-length').textContent = `${uuid.length} characters`;
    document.getElementById('uuid-format').textContent = format;

    // Enable buttons
    copyBtn.disabled = false;
    copyBtn.style.opacity = '1';
    clearBtn.disabled = false;
    clearBtn.style.opacity = '1';

    // Store UUID for copying
    window.lastGeneratedUUID = uuid;
}

// Generate multiple UUIDs
function generateMultipleUUIDs() {
    const count = 10; // Generate 10 UUIDs
    const multipleSection = document.getElementById('multiple-uuids-section');
    const multipleList = document.getElementById('multiple-uuids-list');

    multipleSection.style.display = 'block';
    multipleList.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const uuidType = document.getElementById('uuid-type').value;
        let uuid;
        let typeDisplay;
        
        switch (uuidType) {
            case 'v4':
                uuid = generateUUIDv4();
                typeDisplay = 'UUID v4';
                break;
            case 'v1':
                uuid = generateUUIDv1();
                typeDisplay = 'UUID v1';
                break;
            case 'timestamp':
                uuid = generateTimestampID();
                typeDisplay = 'Timestamp ID';
                break;
            case 'nanoid':
                uuid = generateNanoID();
                typeDisplay = 'Nano ID';
                break;
            default:
                uuid = generateUUIDv4();
                typeDisplay = 'UUID v4';
        }

        // Create UUID item
        const uuidItem = document.createElement('div');
        uuidItem.className = 'multiple-uuid-item';
        uuidItem.innerHTML = `
            <div class="uuid-info">
                <div class="uuid-text">${uuid}</div>
                <div class="uuid-type">${typeDisplay}</div>
            </div>
            <button class="uuid-copy-btn" onclick="copySpecificUUID('${uuid}')">
                <i class="fas fa-copy"></i>
                Copy
            </button>
        `;
        multipleList.appendChild(uuidItem);
    }

    // Scroll to multiple UUIDs section
    multipleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Copy UUID to clipboard
function copyUUID() {
    if (!window.lastGeneratedUUID) {
        showNotification('No UUID to copy');
        return;
    }

    copyToClipboard(window.lastGeneratedUUID);
}

// Copy specific UUID from multiple list
function copySpecificUUID(uuid) {
    copyToClipboard(uuid);
}

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('UUID copied to clipboard!');
            trackUUIDCopy();
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
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
        showNotification('UUID copied to clipboard!');
        trackUUIDCopy();
    } catch (err) {
        showNotification('Failed to copy UUID');
    }

    document.body.removeChild(textArea);
}

// Clear results
function clearResults() {
    const uuidOutput = document.getElementById('uuid-output');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const multipleSection = document.getElementById('multiple-uuids-section');

    uuidOutput.innerHTML = `
        <div class="uuid-placeholder">
            <i class="fas fa-fingerprint"></i>
            <p>Your UUID will appear here</p>
        </div>
    `;

    // Reset info
    document.getElementById('uuid-type-display').textContent = '-';
    document.getElementById('uuid-length').textContent = '- characters';
    document.getElementById('uuid-format').textContent = '-';

    // Disable buttons
    copyBtn.disabled = true;
    copyBtn.style.opacity = '0.5';
    clearBtn.disabled = true;
    clearBtn.style.opacity = '0.5';

    // Hide multiple section
    multipleSection.style.display = 'none';

    window.lastGeneratedUUID = null;
}

// Add to history
function addToHistory(uuid, type) {
    const history = getHistory();
    const historyItem = {
        uuid: uuid,
        type: type,
        timestamp: new Date().toISOString()
    };
    
    history.unshift(historyItem);
    
    // Keep only last 20 items
    if (history.length > 20) {
        history.splice(20);
    }
    
    localStorage.setItem('uuidHistory', JSON.stringify(history));
    updateHistoryDisplay();
}

// Get history from localStorage
function getHistory() {
    const history = localStorage.getItem('uuidHistory');
    return history ? JSON.parse(history) : [];
}

// Load history on page load
function loadHistory() {
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const history = getHistory();
    const historyList = document.getElementById('history-list');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No UUIDs generated yet</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => {
        const date = new Date(item.timestamp);
        return `
            <div class="history-item">
                <div class="history-uuid">${item.uuid}</div>
                <div class="history-info">
                    <span class="history-type">${item.type}</span>
                    <span class="history-time">${date.toLocaleString()}</span>
                </div>
                <button class="history-copy-btn" onclick="copySpecificUUID('${item.uuid}')">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Set UUID type from footer links
function setUUIDType(type) {
    document.getElementById('uuid-type').value = type;
    updateOptions();
    generateUUID();
    
    // Scroll to generator section
    document.querySelector('.generator-section').scrollIntoView({
        behavior: 'smooth'
    });
}

// Generate example UUIDs
function generateExampleUUIDs() {
    // Generate examples for display
    document.getElementById('example-v4').textContent = generateUUIDv4();
    document.getElementById('example-v1').textContent = generateUUIDv1();
    document.getElementById('example-timestamp').textContent = generateTimestampID();
    document.getElementById('example-nanoid').textContent = generateNanoID();
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
function trackUUIDGeneration(type) {
    console.log('UUID generation tracked:', {
        type: type,
        timestamp: new Date().toISOString()
    });
    
    // Example: Google Analytics 4
    // gtag('event', 'uuid_generated', {
    //     uuid_type: type
    // });
}

function trackUUIDCopy() {
    console.log('UUID copy tracked:', {
        timestamp: new Date().toISOString()
    });
    
    // Example: Google Analytics 4
    // gtag('event', 'uuid_copied', {});
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
window.testUUIDGenerator = function() {
    console.log('Testing UUID generator...');
    
    console.log('UUID v4:', generateUUIDv4());
    console.log('UUID v1:', generateUUIDv1());
    console.log('Timestamp ID:', generateTimestampID());
    console.log('Nano ID:', generateNanoID());
    
    console.log('UUID generator test completed');
};

