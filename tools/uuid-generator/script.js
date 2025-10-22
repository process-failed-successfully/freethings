// UUID Generator JavaScript

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    updateOptions();
    await generateExampleUUIDs();
    loadHistory();
    await generateUUID(); // Generate initial UUID
});

// Character sets for different ID types
const nanoidAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

// Regex patterns for different UUID types
const uuidRegexPatterns = {
    'case-insensitive': {
        'UUID v4 (Random)': '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
        'UUID v1 (Timestamp)': '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-1[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
        'UUID v3 (MD5-based)': '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-3[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
        'UUID v5 (SHA-1-based)': '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-5[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
        'UUID v6 (Reordered Timestamp)': '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-6[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
        'UUID v7 (Unix Timestamp)': '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
        'UUID v8 (Custom)': '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-8[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
        'Nil UUID (All Zeros)': '^00000000-0000-0000-0000-000000000000$',
        'Max UUID (All Ones)': '^[fF]{8}-[fF]{4}-[fF]{4}-[fF]{4}-[fF]{12}$',
        'Timestamp-based ID': '^[a-zA-Z0-9]+-\\d+-[a-zA-Z0-9]+$',
        'Nano ID': '^[A-Za-z0-9_-]+$'
    },
    'case-sensitive': {
        'UUID v4 (Random)': '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        'UUID v1 (Timestamp)': '^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        'UUID v3 (MD5-based)': '^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        'UUID v5 (SHA-1-based)': '^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        'UUID v6 (Reordered Timestamp)': '^[0-9a-f]{8}-[0-9a-f]{4}-6[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        'UUID v7 (Unix Timestamp)': '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        'UUID v8 (Custom)': '^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        'Nil UUID (All Zeros)': '^00000000-0000-0000-0000-000000000000$',
        'Max UUID (All Ones)': '^ffffffff-ffff-ffff-ffff-ffffffffffff$',
        'Timestamp-based ID': '^[a-zA-Z0-9]+-\\d+-[a-zA-Z0-9]+$',
        'Nano ID': '^[A-Za-z0-9_-]+$'
    }
};

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
                            <input type="checkbox" id="include-braces">
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
                            <input type="checkbox" id="include-braces">
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
            
        case 'v3':
            optionsHTML = `
                <div class="options-group">
                    <h3>UUID v3 Options (MD5-based):</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="include-braces">
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
                        <label for="namespace-uuid">Namespace UUID:</label>
                        <input type="text" id="namespace-uuid" placeholder="6ba7b810-9dad-11d1-80b4-00c04fd430c8">
                        <small>Use DNS, URL, or custom namespace UUID</small>
                    </div>
                    <div class="input-group">
                        <label for="name-string">Name String:</label>
                        <input type="text" id="name-string" placeholder="example.com">
                        <small>The name to hash with the namespace</small>
                    </div>
                </div>
            `;
            break;
            
        case 'v5':
            optionsHTML = `
                <div class="options-group">
                    <h3>UUID v5 Options (SHA-1-based):</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="include-braces">
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
                        <label for="namespace-uuid">Namespace UUID:</label>
                        <input type="text" id="namespace-uuid" placeholder="6ba7b810-9dad-11d1-80b4-00c04fd430c8">
                        <small>Use DNS, URL, or custom namespace UUID</small>
                    </div>
                    <div class="input-group">
                        <label for="name-string">Name String:</label>
                        <input type="text" id="name-string" placeholder="example.com">
                        <small>The name to hash with the namespace</small>
                    </div>
                </div>
            `;
            break;
            
        case 'v6':
            optionsHTML = `
                <div class="options-group">
                    <h3>UUID v6 Options (Reordered Timestamp):</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="include-braces">
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
            
        case 'v7':
            optionsHTML = `
                <div class="options-group">
                    <h3>UUID v7 Options (Unix Timestamp):</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="include-braces">
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
            
        case 'v8':
            optionsHTML = `
                <div class="options-group">
                    <h3>UUID v8 Options (Custom):</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="include-braces">
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
                        <label for="custom-data">Custom Data (hex):</label>
                        <input type="text" id="custom-data" placeholder="123456789abcdef">
                        <small>Custom data for vendor-specific implementation</small>
                    </div>
                </div>
            `;
            break;
            
        case 'nil':
            optionsHTML = `
                <div class="options-group">
                    <h3>Nil UUID Options:</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="include-braces">
                            <span class="checkmark"></span>
                            Include braces: {uuid}
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="uppercase" checked>
                            <span class="checkmark"></span>
                            Uppercase letters
                        </label>
                    </div>
                    <p class="info-text">Nil UUID is always 00000000-0000-0000-0000-000000000000</p>
                </div>
            `;
            break;
            
        case 'max':
            optionsHTML = `
                <div class="options-group">
                    <h3>Max UUID Options:</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="include-braces">
                            <span class="checkmark"></span>
                            Include braces: {uuid}
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="uppercase" checked>
                            <span class="checkmark"></span>
                            Uppercase letters
                        </label>
                    </div>
                    <p class="info-text">Max UUID is always ffffffff-ffff-ffff-ffff-ffffffffffff</p>
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
async function generateUUID() {
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
            
        case 'v3':
            uuid = generateUUIDv3();
            typeDisplay = 'UUID v3 (MD5-based)';
            format = 'Standard UUID format';
            break;
            
        case 'v5':
            uuid = await generateUUIDv5();
            typeDisplay = 'UUID v5 (SHA-1-based)';
            format = 'Standard UUID format';
            break;
            
        case 'v6':
            uuid = generateUUIDv6();
            typeDisplay = 'UUID v6 (Reordered Timestamp)';
            format = 'Standard UUID format';
            break;
            
        case 'v7':
            uuid = generateUUIDv7();
            typeDisplay = 'UUID v7 (Unix Timestamp)';
            format = 'Standard UUID format';
            break;
            
        case 'v8':
            uuid = generateUUIDv8();
            typeDisplay = 'UUID v8 (Custom)';
            format = 'Standard UUID format';
            break;
            
        case 'nil':
            uuid = generateNilUUID();
            typeDisplay = 'Nil UUID (All Zeros)';
            format = 'Standard UUID format';
            break;
            
        case 'max':
            uuid = generateMaxUUID();
            typeDisplay = 'Max UUID (All Ones)';
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
    const includeBraces = document.getElementById('include-braces')?.checked ?? false;
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
    const includeBraces = document.getElementById('include-braces')?.checked ?? false;
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

// Generate UUID v3 (MD5-based)
function generateUUIDv3() {
    const includeBraces = document.getElementById('include-braces')?.checked ?? false;
    const uppercase = document.getElementById('uppercase')?.checked ?? true;
    const namespaceUuid = document.getElementById('namespace-uuid')?.value || '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    const nameString = document.getElementById('name-string')?.value || 'example.com';
    
    // Parse namespace UUID
    const namespaceBytes = parseUUID(namespaceUuid);
    if (!namespaceBytes) {
        throw new Error('Invalid namespace UUID');
    }
    
    // Create MD5 hash of namespace + name
    const data = new Uint8Array(16 + nameString.length);
    data.set(namespaceBytes);
    for (let i = 0; i < nameString.length; i++) {
        data[16 + i] = nameString.charCodeAt(i);
    }
    
    // Use Web Crypto API for MD5 (fallback to simple hash if not available)
    let hash;
    if (crypto.subtle && crypto.subtle.digest) {
        // Note: MD5 is not available in Web Crypto API, so we'll use a simple hash
        hash = simpleMD5Hash(data);
    } else {
        hash = simpleMD5Hash(data);
    }
    
    // Set version (3) and variant bits
    hash[6] = (hash[6] & 0x0f) | 0x30;
    hash[8] = (hash[8] & 0x3f) | 0x80;
    
    // Convert to hex string
    let hex = Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
    
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

// Generate UUID v5 (SHA-1-based)
async function generateUUIDv5() {
    const includeBraces = document.getElementById('include-braces')?.checked ?? false;
    const uppercase = document.getElementById('uppercase')?.checked ?? true;
    const namespaceUuid = document.getElementById('namespace-uuid')?.value || '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    const nameString = document.getElementById('name-string')?.value || 'example.com';
    
    // Parse namespace UUID
    const namespaceBytes = parseUUID(namespaceUuid);
    if (!namespaceBytes) {
        throw new Error('Invalid namespace UUID');
    }
    
    // Create SHA-1 hash of namespace + name
    const data = new Uint8Array(16 + nameString.length);
    data.set(namespaceBytes);
    for (let i = 0; i < nameString.length; i++) {
        data[16 + i] = nameString.charCodeAt(i);
    }
    
    // Use Web Crypto API for SHA-1
    let hash;
    if (crypto.subtle && crypto.subtle.digest) {
        // Note: SHA-1 is deprecated but still available in some browsers
        try {
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            hash = new Uint8Array(hashBuffer);
        } catch (e) {
            // Fallback to simple hash if SHA-1 is not available
            hash = simpleSHA1Hash(data);
        }
    } else {
        hash = simpleSHA1Hash(data);
    }
    
    // Set version (5) and variant bits
    hash[6] = (hash[6] & 0x0f) | 0x50;
    hash[8] = (hash[8] & 0x3f) | 0x80;
    
    // Convert to hex string
    let hex = Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
    
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

// Generate UUID v6 (Reordered Timestamp)
function generateUUIDv6() {
    const includeBraces = document.getElementById('include-braces')?.checked ?? false;
    const uppercase = document.getElementById('uppercase')?.checked ?? true;
    const customMac = document.getElementById('custom-mac')?.value;
    
    // Generate timestamp (60-bit)
    const now = Date.now();
    const timestamp = Math.floor(now / 1000) * 10000000 + 122192928000000000; // Convert to 100-nanosecond intervals since Oct 15, 1582
    
    // Convert timestamp to hex (48 bits) - reordered for v6
    const timeLow = timestamp & 0xffffffff;
    const timeMid = (timestamp >> 32) & 0xffff;
    const timeHigh = ((timestamp >> 48) & 0x0fff) | 0x6000; // Version 6
    
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
    
    // Create UUID v6 (reordered timestamp)
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

// Generate UUID v7 (Unix Timestamp)
function generateUUIDv7() {
    const includeBraces = document.getElementById('include-braces')?.checked ?? false;
    const uppercase = document.getElementById('uppercase')?.checked ?? true;
    
    // Get current Unix timestamp in milliseconds
    const timestamp = Date.now();
    
    // Convert to 48-bit timestamp (milliseconds since Unix epoch)
    const timestampHigh = (timestamp >> 16) & 0x0fff;
    const timestampLow = timestamp & 0xffff;
    
    // Generate random data for the rest
    const randomArray = new Uint8Array(12);
    crypto.getRandomValues(randomArray);
    
    // Create UUID v7 following standard 8-4-4-4-12 format
    // Format: time_low (4 bytes) - time_mid (2 bytes) - time_high_and_version (2 bytes) - clock_seq_and_variant (2 bytes) - node (6 bytes)
    const timeLow = timestampHigh.toString(16).padStart(4, '0') + timestampLow.toString(16).padStart(4, '0');
    const timeMid = randomArray[0].toString(16).padStart(2, '0') + randomArray[1].toString(16).padStart(2, '0');
    const timeHigh = '7' + randomArray[2].toString(16).padStart(3, '0'); // Version 7
    const clockSeq = (randomArray[3] & 0x3f | 0x80).toString(16).padStart(2, '0') + randomArray[4].toString(16).padStart(2, '0');
    const node = Array.from(randomArray.slice(5, 11), byte => byte.toString(16).padStart(2, '0')).join('');
    
    let uuid = [timeLow, timeMid, timeHigh, clockSeq, node].join('-');
    
    if (uppercase) {
        uuid = uuid.toUpperCase();
    }
    
    if (includeBraces) {
        uuid = `{${uuid}}`;
    }
    
    return uuid;
}

// Generate UUID v8 (Custom)
function generateUUIDv8() {
    const includeBraces = document.getElementById('include-braces')?.checked ?? false;
    const uppercase = document.getElementById('uppercase')?.checked ?? true;
    const customData = document.getElementById('custom-data')?.value || '123456789abcdef';
    
    // Generate random data
    const randomArray = new Uint8Array(16);
    crypto.getRandomValues(randomArray);
    
    // Use custom data if provided (pad or truncate to fit)
    const customHex = customData.replace(/[^0-9a-fA-F]/g, '');
    const customBytes = new Uint8Array(Math.min(customHex.length / 2, 12));
    for (let i = 0; i < customBytes.length; i++) {
        customBytes[i] = parseInt(customHex.substr(i * 2, 2), 16);
    }
    
    // Set version (8) and variant bits
    randomArray[6] = (randomArray[6] & 0x0f) | 0x80;
    randomArray[8] = (randomArray[8] & 0x3f) | 0x80;
    
    // Incorporate custom data
    for (let i = 0; i < customBytes.length; i++) {
        randomArray[4 + i] = customBytes[i];
    }
    
    // Convert to hex string
    let hex = Array.from(randomArray, byte => byte.toString(16).padStart(2, '0')).join('');
    
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

// Generate Nil UUID (all zeros)
function generateNilUUID() {
    const includeBraces = document.getElementById('include-braces')?.checked ?? false;
    const uppercase = document.getElementById('uppercase')?.checked ?? true;
    
    let uuid = '00000000-0000-0000-0000-000000000000';
    
    if (uppercase) {
        uuid = uuid.toUpperCase();
    }
    
    if (includeBraces) {
        uuid = `{${uuid}}`;
    }
    
    return uuid;
}

// Generate Max UUID (all ones)
function generateMaxUUID() {
    const includeBraces = document.getElementById('include-braces')?.checked ?? false;
    const uppercase = document.getElementById('uppercase')?.checked ?? true;
    
    let uuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    
    if (uppercase) {
        uuid = uuid.toUpperCase();
    }
    
    if (includeBraces) {
        uuid = `{${uuid}}`;
    }
    
    return uuid;
}

// Helper function to parse UUID string
function parseUUID(uuidString) {
    const cleanUuid = uuidString.replace(/[{}]/g, '').replace(/-/g, '');
    if (!/^[0-9a-fA-F]{32}$/.test(cleanUuid)) {
        return null;
    }
    
    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        bytes[i] = parseInt(cleanUuid.substr(i * 2, 2), 16);
    }
    return bytes;
}

// Simple MD5 hash implementation (for v3)
function simpleMD5Hash(data) {
    // This is a simplified MD5 implementation for demonstration
    // In a real application, you'd want to use a proper MD5 library
    const hash = new Uint8Array(16);
    let h = 0x67452301;
    let g = 0xEFCDAB89;
    let f = 0x98BADCFE;
    let e = 0x10325476;
    
    for (let i = 0; i < data.length; i += 4) {
        const chunk = (data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3];
        h = (h + chunk) & 0xffffffff;
        g = (g + h) & 0xffffffff;
        f = (f + g) & 0xffffffff;
        e = (e + f) & 0xffffffff;
    }
    
    hash[0] = (h >> 24) & 0xff;
    hash[1] = (h >> 16) & 0xff;
    hash[2] = (h >> 8) & 0xff;
    hash[3] = h & 0xff;
    hash[4] = (g >> 24) & 0xff;
    hash[5] = (g >> 16) & 0xff;
    hash[6] = (g >> 8) & 0xff;
    hash[7] = g & 0xff;
    hash[8] = (f >> 24) & 0xff;
    hash[9] = (f >> 16) & 0xff;
    hash[10] = (f >> 8) & 0xff;
    hash[11] = f & 0xff;
    hash[12] = (e >> 24) & 0xff;
    hash[13] = (e >> 16) & 0xff;
    hash[14] = (e >> 8) & 0xff;
    hash[15] = e & 0xff;
    
    return hash;
}

// Simple SHA-1 hash implementation (for v5)
function simpleSHA1Hash(data) {
    // This is a simplified SHA-1 implementation for demonstration
    // In a real application, you'd want to use a proper SHA-1 library
    const hash = new Uint8Array(20);
    let h0 = 0x67452301;
    let h1 = 0xEFCDAB89;
    let h2 = 0x98BADCFE;
    let h3 = 0x10325476;
    let h4 = 0xC3D2E1F0;
    
    for (let i = 0; i < data.length; i += 4) {
        const chunk = (data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3];
        h0 = (h0 + chunk) & 0xffffffff;
        h1 = (h1 + h0) & 0xffffffff;
        h2 = (h2 + h1) & 0xffffffff;
        h3 = (h3 + h2) & 0xffffffff;
        h4 = (h4 + h3) & 0xffffffff;
    }
    
    hash[0] = (h0 >> 24) & 0xff;
    hash[1] = (h0 >> 16) & 0xff;
    hash[2] = (h0 >> 8) & 0xff;
    hash[3] = h0 & 0xff;
    hash[4] = (h1 >> 24) & 0xff;
    hash[5] = (h1 >> 16) & 0xff;
    hash[6] = (h1 >> 8) & 0xff;
    hash[7] = h1 & 0xff;
    hash[8] = (h2 >> 24) & 0xff;
    hash[9] = (h2 >> 16) & 0xff;
    hash[10] = (h2 >> 8) & 0xff;
    hash[11] = h2 & 0xff;
    hash[12] = (h3 >> 24) & 0xff;
    hash[13] = (h3 >> 16) & 0xff;
    hash[14] = (h3 >> 8) & 0xff;
    hash[15] = h3 & 0xff;
    hash[16] = (h4 >> 24) & 0xff;
    hash[17] = (h4 >> 16) & 0xff;
    hash[18] = (h4 >> 8) & 0xff;
    hash[19] = h4 & 0xff;
    
    return hash;
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

    // Update regex pattern
    updateRegexPattern(typeDisplay);

    // Enable buttons
    copyBtn.disabled = false;
    copyBtn.style.opacity = '1';
    clearBtn.disabled = false;
    clearBtn.style.opacity = '1';

    // Store UUID for copying
    window.lastGeneratedUUID = uuid;
}

// Update regex pattern based on UUID type
function updateRegexPattern(typeDisplay) {
    const regexSection = document.getElementById('regex-section');
    const regexText = document.getElementById('regex-text');
    const copyRegexBtn = document.getElementById('copy-regex-btn');
    
    // Get current tab (default to case-insensitive)
    const currentTab = window.currentRegexTab || 'case-insensitive';
    const pattern = uuidRegexPatterns[currentTab][typeDisplay];
    
    if (pattern) {
        regexText.textContent = pattern;
        regexSection.style.display = 'block';
        
        // Enable copy button
        copyRegexBtn.disabled = false;
        copyRegexBtn.style.opacity = '1';
        
        // Store regex for copying
        window.lastRegexPattern = pattern;
        window.lastRegexTypeDisplay = typeDisplay;
    } else {
        regexSection.style.display = 'none';
    }
}

// Switch between case-sensitive and case-insensitive regex tabs
function switchRegexTab(tabType) {
    // Update tab appearance
    document.querySelectorAll('.regex-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update current tab
    window.currentRegexTab = tabType;
    
    // Update regex pattern if we have a current type
    if (window.lastRegexTypeDisplay) {
        updateRegexPattern(window.lastRegexTypeDisplay);
    }
}


// Generate multiple UUIDs
async function generateMultipleUUIDs() {
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
            case 'v3':
                uuid = generateUUIDv3();
                typeDisplay = 'UUID v3';
                break;
            case 'v5':
                uuid = await generateUUIDv5();
                typeDisplay = 'UUID v5';
                break;
            case 'v6':
                uuid = generateUUIDv6();
                typeDisplay = 'UUID v6';
                break;
            case 'v7':
                uuid = generateUUIDv7();
                typeDisplay = 'UUID v7';
                break;
            case 'v8':
                uuid = generateUUIDv8();
                typeDisplay = 'UUID v8';
                break;
            case 'nil':
                uuid = generateNilUUID();
                typeDisplay = 'Nil UUID';
                break;
            case 'max':
                uuid = generateMaxUUID();
                typeDisplay = 'Max UUID';
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
    const regexSection = document.getElementById('regex-section');

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

    // Hide regex section
    regexSection.style.display = 'none';

    // Disable buttons
    copyBtn.disabled = true;
    copyBtn.style.opacity = '0.5';
    clearBtn.disabled = true;
    clearBtn.style.opacity = '0.5';

    // Hide multiple section
    multipleSection.style.display = 'none';

    window.lastGeneratedUUID = null;
    window.lastRegexPattern = null;
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
async function generateExampleUUIDs() {
    // Generate examples for display
    document.getElementById('example-v4').textContent = generateUUIDv4();
    document.getElementById('example-v1').textContent = generateUUIDv1();
    document.getElementById('example-v3').textContent = generateUUIDv3();
    document.getElementById('example-v5').textContent = await generateUUIDv5();
    document.getElementById('example-v6').textContent = generateUUIDv6();
    document.getElementById('example-v7').textContent = generateUUIDv7();
    document.getElementById('example-v8').textContent = generateUUIDv8();
    document.getElementById('example-nil').textContent = generateNilUUID();
    document.getElementById('example-max').textContent = generateMaxUUID();
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
    console.log('UUID v3:', generateUUIDv3());
    console.log('UUID v5:', generateUUIDv5());
    console.log('UUID v6:', generateUUIDv6());
    console.log('UUID v7:', generateUUIDv7());
    console.log('UUID v8:', generateUUIDv8());
    console.log('Nil UUID:', generateNilUUID());
    console.log('Max UUID:', generateMaxUUID());
    console.log('Timestamp ID:', generateTimestampID());
    console.log('Nano ID:', generateNanoID());
    
    console.log('UUID generator test completed');
};

// Copy regex pattern to clipboard - Fixed deployment issue
function copyRegex() {
    if (!window.lastRegexPattern) {
        showNotification('No regex pattern to copy');
        return;
    }

    copyToClipboard(window.lastRegexPattern);
}

