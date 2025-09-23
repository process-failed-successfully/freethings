// Password Generator JavaScript

// Character sets
const characterSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: '0O1lI', // Characters that look similar
    ambiguous: '{}[]()/\\~|' // Ambiguous characters
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateLengthDisplay();
    generatePassword(); // Generate initial password
});

// Update length display
function updateLengthDisplay() {
    const length = document.getElementById('password-length').value;
    document.getElementById('length-display').textContent = length;
}

// Generate a single password
function generatePassword() {
    const length = parseInt(document.getElementById('password-length').value);
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;
    const excludeSimilar = document.getElementById('exclude-similar').checked;
    const excludeAmbiguous = document.getElementById('exclude-ambiguous').checked;
    const requireOneOfEach = document.getElementById('require-one-of-each').checked;

    // Validate that at least one character type is selected
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        showError('Please select at least one character type');
        return;
    }

    // Build character set
    let charset = '';
    if (includeUppercase) charset += characterSets.uppercase;
    if (includeLowercase) charset += characterSets.lowercase;
    if (includeNumbers) charset += characterSets.numbers;
    if (includeSymbols) charset += characterSets.symbols;

    // Remove similar characters if requested
    if (excludeSimilar) {
        charset = charset.replace(/[0O1lI]/g, '');
    }

    // Remove ambiguous characters if requested
    if (excludeAmbiguous) {
        charset = charset.replace(/[{}[\]()/\\~|]/g, '');
    }

    // Validate charset is not empty after exclusions
    if (charset.length === 0) {
        showError('No characters available after exclusions. Please adjust your settings.');
        return;
    }

    let password;

    if (requireOneOfEach) {
        password = generatePasswordWithRequirements(charset, length, {
            includeUppercase,
            includeLowercase,
            includeNumbers,
            includeSymbols,
            excludeSimilar,
            excludeAmbiguous
        });
    } else {
        password = generateRandomPassword(charset, length);
    }

    displayPassword(password);
    analyzePassword(password);
    trackPasswordGeneration();
}

// Generate password with requirements
function generatePasswordWithRequirements(charset, length, options) {
    let password = '';
    const requiredChars = [];

    // Add one character from each required type
    if (options.includeUppercase) {
        const uppercaseChars = getAvailableChars('uppercase', options);
        requiredChars.push(getRandomChar(uppercaseChars));
    }
    if (options.includeLowercase) {
        const lowercaseChars = getAvailableChars('lowercase', options);
        requiredChars.push(getRandomChar(lowercaseChars));
    }
    if (options.includeNumbers) {
        const numberChars = getAvailableChars('numbers', options);
        requiredChars.push(getRandomChar(numberChars));
    }
    if (options.includeSymbols) {
        const symbolChars = getAvailableChars('symbols', options);
        requiredChars.push(getRandomChar(symbolChars));
    }

    // Fill remaining length with random characters
    for (let i = requiredChars.length; i < length; i++) {
        password += getRandomChar(charset);
    }

    // Add required characters at random positions
    requiredChars.forEach(char => {
        const randomPosition = Math.floor(Math.random() * password.length);
        password = password.slice(0, randomPosition) + char + password.slice(randomPosition);
    });

    return password;
}

// Get available characters for a type after exclusions
function getAvailableChars(type, options) {
    let chars = characterSets[type];
    
    if (options.excludeSimilar) {
        chars = chars.replace(/[0O1lI]/g, '');
    }
    
    if (options.excludeAmbiguous) {
        chars = chars.replace(/[{}[\]()/\\~|]/g, '');
    }
    
    return chars;
}

// Generate random password
function generateRandomPassword(charset, length) {
    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }
    
    return password;
}

// Get random character from charset
function getRandomChar(charset) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return charset[array[0] % charset.length];
}

// Display generated password
function displayPassword(password) {
    const passwordOutput = document.getElementById('password-output');
    const copyBtn = document.getElementById('copy-btn');
    const refreshBtn = document.getElementById('refresh-btn');

    passwordOutput.textContent = password;
    passwordOutput.classList.add('has-password');

    // Enable buttons
    copyBtn.disabled = false;
    copyBtn.style.opacity = '1';
    refreshBtn.disabled = false;
    refreshBtn.style.opacity = '1';

    // Store password for copying
    window.lastGeneratedPassword = password;
}

// Show error message
function showError(message) {
    const passwordOutput = document.getElementById('password-output');
    const copyBtn = document.getElementById('copy-btn');
    const refreshBtn = document.getElementById('refresh-btn');

    passwordOutput.innerHTML = `
        <div class="password-placeholder">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
    passwordOutput.classList.remove('has-password');

    copyBtn.disabled = true;
    copyBtn.style.opacity = '0.5';
    refreshBtn.disabled = true;
    refreshBtn.style.opacity = '0.5';
}

// Analyze password strength
function analyzePassword(password) {
    const entropy = calculateEntropy(password);
    const strength = calculateStrength(password);
    const crackTime = calculateCrackTime(entropy);

    // Update strength meter
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    
    strengthBar.className = `strength-bar ${strength.level}`;
    strengthText.className = `strength-text ${strength.level}`;
    strengthText.textContent = strength.text;

    // Update info
    document.getElementById('entropy-value').textContent = `${entropy.toFixed(1)} bits`;
    document.getElementById('crack-time').textContent = crackTime;
}

// Calculate password entropy
function calculateEntropy(password) {
    let charsetSize = 0;
    
    // Check which character types are present
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32; // Approximate symbol count
    
    return Math.log2(Math.pow(charsetSize, password.length));
}

// Calculate password strength
function calculateStrength(password) {
    const entropy = calculateEntropy(password);
    let score = 0;
    let level = 'very-weak';
    let text = 'Very Weak';

    // Length bonus
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (password.length >= 20) score += 1;

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 2;

    // Entropy-based strength
    if (entropy >= 60) {
        level = 'very-strong';
        text = 'Very Strong';
    } else if (entropy >= 45) {
        level = 'good';
        text = 'Good';
    } else if (entropy >= 30) {
        level = 'fair';
        text = 'Fair';
    } else if (entropy >= 15) {
        level = 'weak';
        text = 'Weak';
    } else {
        level = 'very-weak';
        text = 'Very Weak';
    }

    return { level, text, score };
}

// Calculate time to crack
function calculateCrackTime(entropy) {
    // Assuming 1 billion guesses per second (common for modern hardware)
    const guessesPerSecond = 1e9;
    const combinations = Math.pow(2, entropy);
    const seconds = combinations / (2 * guessesPerSecond); // Divide by 2 for average case

    if (seconds < 1) return '< 1 second';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
    return `${Math.round(seconds / 31536000000)} millennia`;
}

// Generate multiple passwords
function generateMultiplePasswords() {
    const count = 5; // Generate 5 passwords
    const multipleSection = document.getElementById('multiple-passwords-section');
    const multipleList = document.getElementById('multiple-passwords-list');

    multipleSection.style.display = 'block';
    multipleList.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const length = parseInt(document.getElementById('password-length').value);
        const includeUppercase = document.getElementById('include-uppercase').checked;
        const includeLowercase = document.getElementById('include-lowercase').checked;
        const includeNumbers = document.getElementById('include-numbers').checked;
        const includeSymbols = document.getElementById('include-symbols').checked;
        const excludeSimilar = document.getElementById('exclude-similar').checked;
        const excludeAmbiguous = document.getElementById('exclude-ambiguous').checked;
        const requireOneOfEach = document.getElementById('require-one-of-each').checked;

        // Build character set (same logic as single password)
        let charset = '';
        if (includeUppercase) charset += characterSets.uppercase;
        if (includeLowercase) charset += characterSets.lowercase;
        if (includeNumbers) charset += characterSets.numbers;
        if (includeSymbols) charset += characterSets.symbols;

        if (excludeSimilar) charset = charset.replace(/[0O1lI]/g, '');
        if (excludeAmbiguous) charset = charset.replace(/[{}[\]()/\\~|]/g, '');

        let password;
        if (requireOneOfEach) {
            password = generatePasswordWithRequirements(charset, length, {
                includeUppercase,
                includeLowercase,
                includeNumbers,
                includeSymbols,
                excludeSimilar,
                excludeAmbiguous
            });
        } else {
            password = generateRandomPassword(charset, length);
        }

        // Create password item
        const passwordItem = document.createElement('div');
        passwordItem.className = 'multiple-password-item';
        passwordItem.innerHTML = `
            <div class="multiple-password-text">${password}</div>
            <button class="multiple-password-copy" onclick="copySpecificPassword('${password}')">
                <i class="fas fa-copy"></i>
                Copy
            </button>
        `;
        multipleList.appendChild(passwordItem);
    }

    // Scroll to multiple passwords section
    multipleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Copy password to clipboard
function copyPassword() {
    if (!window.lastGeneratedPassword) {
        showNotification('No password to copy');
        return;
    }

    copyToClipboard(window.lastGeneratedPassword);
}

// Copy specific password from multiple list
function copySpecificPassword(password) {
    copyToClipboard(password);
}

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Password copied to clipboard!');
            trackPasswordCopy();
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
        showNotification('Password copied to clipboard!');
        trackPasswordCopy();
    } catch (err) {
        showNotification('Failed to copy password');
    }

    document.body.removeChild(textArea);
}

// Apply preset configuration
function applyPreset(preset) {
    const lengthSlider = document.getElementById('password-length');
    const uppercaseCheck = document.getElementById('include-uppercase');
    const lowercaseCheck = document.getElementById('include-lowercase');
    const numbersCheck = document.getElementById('include-numbers');
    const symbolsCheck = document.getElementById('include-symbols');
    const excludeSimilarCheck = document.getElementById('exclude-similar');
    const excludeAmbiguousCheck = document.getElementById('exclude-ambiguous');
    const requireOneOfEachCheck = document.getElementById('require-one-of-each');

    // Reset all checkboxes
    [uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck, excludeSimilarCheck, excludeAmbiguousCheck, requireOneOfEachCheck].forEach(cb => {
        cb.checked = false;
    });

    switch (preset) {
        case 'basic':
            lengthSlider.value = 10;
            uppercaseCheck.checked = true;
            lowercaseCheck.checked = true;
            numbersCheck.checked = true;
            break;

        case 'strong':
            lengthSlider.value = 16;
            uppercaseCheck.checked = true;
            lowercaseCheck.checked = true;
            numbersCheck.checked = true;
            symbolsCheck.checked = true;
            break;

        case 'pin':
            lengthSlider.value = 4;
            numbersCheck.checked = true;
            break;

        case 'memorable':
            lengthSlider.value = 12;
            uppercaseCheck.checked = true;
            lowercaseCheck.checked = true;
            numbersCheck.checked = true;
            excludeSimilarCheck.checked = true;
            break;

        case 'maximum':
            lengthSlider.value = 32;
            uppercaseCheck.checked = true;
            lowercaseCheck.checked = true;
            numbersCheck.checked = true;
            symbolsCheck.checked = true;
            excludeSimilarCheck.checked = true;
            excludeAmbiguousCheck.checked = true;
            requireOneOfEachCheck.checked = true;
            break;

        case 'pronounceable':
            lengthSlider.value = 12;
            uppercaseCheck.checked = true;
            lowercaseCheck.checked = true;
            numbersCheck.checked = true;
            excludeSimilarCheck.checked = true;
            requireOneOfEachCheck.checked = true;
            break;
    }

    updateLengthDisplay();
    generatePassword();
    showNotification(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied`);
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
function trackPasswordGeneration() {
    console.log('Password generation tracked:', {
        timestamp: new Date().toISOString()
    });
    
    // Example: Google Analytics 4
    // gtag('event', 'password_generated', {});
}

function trackPasswordCopy() {
    console.log('Password copy tracked:', {
        timestamp: new Date().toISOString()
    });
    
    // Example: Google Analytics 4
    // gtag('event', 'password_copied', {});
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
window.testPasswordGenerator = function() {
    console.log('Testing password generator...');
    
    const testCharset = characterSets.uppercase + characterSets.lowercase + characterSets.numbers;
    const testPassword = generateRandomPassword(testCharset, 12);
    
    console.log('Test password:', testPassword);
    console.log('Entropy:', calculateEntropy(testPassword));
    console.log('Strength:', calculateStrength(testPassword));
    
    console.log('Password generator test completed');
};

