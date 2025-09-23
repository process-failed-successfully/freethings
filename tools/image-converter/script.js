// Global variables
let uploadedFiles = [];
let convertedImages = [];

// DOM elements
const fileInput = document.getElementById('file-input');
const fileUploadArea = document.getElementById('file-upload-area');
const fileList = document.getElementById('file-list');
const resultsSection = document.getElementById('results-section');
const resultsGrid = document.getElementById('results-grid');
const convertBtn = document.getElementById('convert-btn');
const downloadAllBtn = document.getElementById('download-all-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateFormatOptions();
    updateSizeOptions();
    setupColorPicker();
});

// Event Listeners
function initializeEventListeners() {
    // File upload area click
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop events
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleDrop);

    // File input change
    fileInput.addEventListener('change', handleFileUpload);

    // Custom dimensions inputs
    document.getElementById('custom-width').addEventListener('input', updateAspectRatio);
    document.getElementById('custom-height').addEventListener('input', updateAspectRatio);
    document.getElementById('maintain-aspect').addEventListener('change', updateAspectRatio);
}

function setupColorPicker() {
    const colorInput = document.getElementById('background-color');
    const colorText = document.getElementById('background-color-text');
    
    colorInput.addEventListener('input', function() {
        colorText.value = this.value;
    });
    
    colorText.addEventListener('input', function() {
        if (this.value.match(/^#[0-9A-F]{6}$/i)) {
            colorInput.value = this.value;
        }
    });
}

// File handling functions
function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    processFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    fileUploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    fileUploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    fileUploadArea.classList.remove('dragover');
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
}

function processFiles(files) {
    const imageFiles = files.filter(file => 
        file.type.startsWith('image/') || 
        file.name.toLowerCase().endsWith('.svg')
    );
    
    if (imageFiles.length === 0) {
        alert('Please select valid image files.');
        return;
    }

    imageFiles.forEach(file => {
        if (!uploadedFiles.find(f => f.name === file.name && f.size === file.size)) {
            uploadedFiles.push(file);
        }
    });

    displayFileList();
    updateConvertButton();
}

function displayFileList() {
    fileList.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileFormat = getFileFormat(file);
        
        if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
            // Handle SVG files specially
            const reader = new FileReader();
            reader.onload = function(e) {
                fileItem.innerHTML = `
                    <div class="file-preview svg-preview">
                        <i class="fas fa-vector-square"></i>
                    </div>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                        <div class="file-format">${fileFormat}</div>
                    </div>
                    <div class="file-actions">
                        <button class="btn btn-secondary" onclick="previewImage(${index})">
                            <i class="fas fa-eye"></i>
                            Preview
                        </button>
                        <button class="btn btn-danger" onclick="removeFile(${index})">
                            <i class="fas fa-trash"></i>
                            Remove
                        </button>
                    </div>
                `;
            };
            reader.readAsText(file);
        } else {
            // Handle regular image files
            const reader = new FileReader();
            reader.onload = function(e) {
                fileItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}" class="file-preview">
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                        <div class="file-format">${fileFormat}</div>
                    </div>
                    <div class="file-actions">
                        <button class="btn btn-secondary" onclick="previewImage(${index})">
                            <i class="fas fa-eye"></i>
                            Preview
                        </button>
                        <button class="btn btn-danger" onclick="removeFile(${index})">
                            <i class="fas fa-trash"></i>
                            Remove
                        </button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
        
        fileList.appendChild(fileItem);
    });
}

function getFileFormat(file) {
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        return 'SVG';
    }
    return file.type.split('/')[1].toUpperCase();
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    displayFileList();
    updateConvertButton();
}

function previewImage(index) {
    const file = uploadedFiles[index];
    
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        // Handle SVG preview
        const reader = new FileReader();
        reader.onload = function(e) {
            showImageModal(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    } else {
        // Handle regular image preview
        const reader = new FileReader();
        reader.onload = function(e) {
            showImageModal(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    }
}

function showImageModal(imageSrc, fileName) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        cursor: pointer;
    `;
    
    modal.innerHTML = `
        <div style="max-width: 90%; max-height: 90%; position: relative;">
            <img src="${imageSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            <button onclick="this.parentElement.parentElement.remove()" style="
                position: absolute;
                top: -40px;
                right: 0;
                background: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                font-size: 18px;
            ">×</button>
        </div>
    `;
    
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
}

function clearAll() {
    uploadedFiles = [];
    convertedImages = [];
    displayFileList();
    hideResults();
    updateConvertButton();
    fileInput.value = '';
}

// Format and size options
function updateFormatOptions() {
    const format = document.getElementById('output-format').value;
    const svgOptions = document.getElementById('svg-options');
    
    // Show SVG-specific options when converting to JPG
    if (format === 'jpeg') {
        svgOptions.style.display = 'block';
    } else {
        svgOptions.style.display = 'none';
    }
    
    // Update quality slider visibility
    const qualityGroup = document.querySelector('#output-quality').parentElement.parentElement;
    if (format === 'jpeg' || format === 'webp') {
        qualityGroup.style.display = 'block';
    } else {
        qualityGroup.style.display = 'none';
    }
}

function updateSizeOptions() {
    const sizeMode = document.getElementById('output-size').value;
    
    // Hide all size groups
    document.getElementById('custom-size-group').style.display = 'none';
    document.getElementById('preset-size-group').style.display = 'none';
    
    // Show selected group
    if (sizeMode === 'custom') {
        document.getElementById('custom-size-group').style.display = 'block';
    } else if (sizeMode === 'preset') {
        document.getElementById('preset-size-group').style.display = 'block';
    }
}

function updateQualityDisplay() {
    const quality = document.getElementById('output-quality').value;
    document.getElementById('quality-display').textContent = quality + '%';
}

function updateAspectRatio() {
    const maintainAspect = document.getElementById('maintain-aspect').checked;
    if (!maintainAspect) return;
    
    const widthInput = document.getElementById('custom-width');
    const heightInput = document.getElementById('custom-height');
    
    if (widthInput.value && !heightInput.value) {
        // Calculate height based on width (assuming square for now)
        heightInput.value = widthInput.value;
    } else if (heightInput.value && !widthInput.value) {
        // Calculate width based on height
        widthInput.value = heightInput.value;
    }
}

function applyPreset() {
    const preset = document.getElementById('preset-size').value;
    if (!preset) return;
    
    const presets = {
        'thumbnail': { width: 150, height: 150 },
        'small': { width: 300, height: 300 },
        'medium': { width: 600, height: 600 },
        'large': { width: 1200, height: 1200 },
        'hd': { width: 1920, height: 1080 },
        '4k': { width: 3840, height: 2160 }
    };
    
    const dimensions = presets[preset];
    if (dimensions) {
        document.getElementById('custom-width').value = dimensions.width;
        document.getElementById('custom-height').value = dimensions.height;
    }
}

function applyQuickPreset(preset) {
    const presets = {
        'svg-to-jpg': {
            format: 'jpeg',
            quality: 90,
            handleTransparency: true,
            background: '#ffffff'
        },
        'svg-to-png': {
            format: 'png',
            quality: 100,
            handleTransparency: false
        },
        'jpg-to-webp': {
            format: 'webp',
            quality: 85
        },
        'png-to-jpg': {
            format: 'jpeg',
            quality: 90,
            handleTransparency: true,
            background: '#ffffff'
        },
        'web-optimized': {
            format: 'webp',
            quality: 80,
            size: 'medium'
        },
        'print-ready': {
            format: 'png',
            quality: 100,
            size: '4k'
        }
    };
    
    const settings = presets[preset];
    if (settings) {
        document.getElementById('output-format').value = settings.format;
        updateFormatOptions();
        
        if (settings.quality) {
            document.getElementById('output-quality').value = settings.quality;
            updateQualityDisplay();
        }
        
        if (settings.size) {
            document.getElementById('output-size').value = 'preset';
            document.getElementById('preset-size').value = settings.size;
            updateSizeOptions();
            applyPreset();
        }
        
        if (settings.background) {
            document.getElementById('background-color').value = settings.background;
            document.getElementById('background-color-text').value = settings.background;
        }
        
        if (settings.handleTransparency !== undefined) {
            document.getElementById('handle-transparency').checked = settings.handleTransparency;
        }
    }
}

// Main conversion function
async function convertImages() {
    if (uploadedFiles.length === 0) {
        alert('Please upload some images first.');
        return;
    }
    
    convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
    convertBtn.disabled = true;
    
    convertedImages = [];
    
    try {
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const convertedImage = await convertImage(file);
            convertedImages.push(convertedImage);
        }
        
        displayResults();
        showResults();
        
    } catch (error) {
        console.error('Error converting images:', error);
        alert('Error processing images. Please try again.');
    } finally {
        convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Convert Images';
        convertBtn.disabled = false;
    }
}

async function convertImage(file) {
    return new Promise((resolve, reject) => {
        const outputFormat = document.getElementById('output-format').value;
        const quality = parseInt(document.getElementById('output-quality').value) / 100;
        const sizeMode = document.getElementById('output-size').value;
        
        // Check if it's an SVG file
        if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
            convertSVG(file, outputFormat, quality, sizeMode)
                .then(resolve)
                .catch(reject);
        } else {
            convertRegularImage(file, outputFormat, quality, sizeMode)
                .then(resolve)
                .catch(reject);
        }
    });
}

async function convertSVG(file, outputFormat, quality, sizeMode) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const svgContent = e.target.result;
            
            // Create SVG element
            const svgElement = new DOMParser().parseFromString(svgContent, 'image/svg+xml').documentElement;
            
            // Get SVG dimensions
            let width = parseInt(svgElement.getAttribute('width')) || 400;
            let height = parseInt(svgElement.getAttribute('height')) || 400;
            
            // Handle viewBox if present
            const viewBox = svgElement.getAttribute('viewBox');
            if (viewBox) {
                const viewBoxValues = viewBox.split(' ');
                width = parseInt(viewBoxValues[2]) || width;
                height = parseInt(viewBoxValues[3]) || height;
            }
            
            // Calculate new dimensions
            const newDimensions = calculateNewDimensions(width, height, sizeMode);
            
            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = newDimensions.width;
            canvas.height = newDimensions.height;
            
            // Handle transparency for JPG conversion
            if (outputFormat === 'jpeg' && document.getElementById('handle-transparency').checked) {
                const backgroundColor = document.getElementById('background-color').value;
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // Create image from SVG
            const img = new Image();
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = function() {
                try {
                    // Draw SVG to canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Convert to desired format
                    const mimeType = `image/${outputFormat}`;
                    canvas.toBlob((blob) => {
                        URL.revokeObjectURL(url);
                        
                        const convertedFile = new File([blob], 
                            file.name.replace(/\.svg$/i, `.${outputFormat}`), 
                            { type: mimeType }
                        );
                        
                        resolve({
                            original: file,
                            converted: convertedFile,
                            originalSize: file.size,
                            newSize: blob.size,
                            originalFormat: 'SVG',
                            newFormat: outputFormat.toUpperCase(),
                            compressionRatio: Math.round((1 - blob.size / file.size) * 100)
                        });
                    }, mimeType, quality);
                    
                } catch (error) {
                    URL.revokeObjectURL(url);
                    reject(error);
                }
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load SVG'));
            };
            
            img.src = url;
        };
        
        reader.onerror = () => reject(new Error('Failed to read SVG file'));
        reader.readAsText(file);
    });
}

async function convertRegularImage(file, outputFormat, quality, sizeMode) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = function() {
            try {
                const originalWidth = img.width;
                const originalHeight = img.height;
                
                // Calculate new dimensions
                const newDimensions = calculateNewDimensions(originalWidth, originalHeight, sizeMode);
                
                // Set canvas dimensions
                canvas.width = newDimensions.width;
                canvas.height = newDimensions.height;
                
                // Handle transparency for JPG conversion
                if (outputFormat === 'jpeg' && hasTransparency(file)) {
                    const backgroundColor = document.getElementById('background-color').value;
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                // Draw image to canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to desired format
                const mimeType = `image/${outputFormat}`;
                canvas.toBlob((blob) => {
                    const convertedFile = new File([blob], 
                        file.name.replace(/\.[^/.]+$/, `.${outputFormat}`), 
                        { type: mimeType }
                    );
                    
                    resolve({
                        original: file,
                        converted: convertedFile,
                        originalSize: file.size,
                        newSize: blob.size,
                        originalFormat: getFileFormat(file),
                        newFormat: outputFormat.toUpperCase(),
                        compressionRatio: Math.round((1 - blob.size / file.size) * 100)
                    });
                }, mimeType, quality);
                
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

function calculateNewDimensions(originalWidth, originalHeight, sizeMode) {
    switch(sizeMode) {
        case 'original':
            return { width: originalWidth, height: originalHeight };
            
        case 'custom':
            const customWidth = parseInt(document.getElementById('custom-width').value);
            const customHeight = parseInt(document.getElementById('custom-height').value);
            const maintainAspect = document.getElementById('maintain-aspect').checked;
            
            if (maintainAspect) {
                const aspectRatio = originalWidth / originalHeight;
                if (customWidth && customHeight) {
                    const widthRatio = customWidth / originalWidth;
                    const heightRatio = customHeight / originalHeight;
                    const ratio = Math.min(widthRatio, heightRatio);
                    return {
                        width: Math.round(originalWidth * ratio),
                        height: Math.round(originalHeight * ratio)
                    };
                } else if (customWidth) {
                    return {
                        width: customWidth,
                        height: Math.round(customWidth / aspectRatio)
                    };
                } else if (customHeight) {
                    return {
                        width: Math.round(customHeight * aspectRatio),
                        height: customHeight
                    };
                }
            }
            
            return {
                width: customWidth || originalWidth,
                height: customHeight || originalHeight
            };
            
        case 'preset':
            const preset = document.getElementById('preset-size').value;
            const presets = {
                'thumbnail': { width: 150, height: 150 },
                'small': { width: 300, height: 300 },
                'medium': { width: 600, height: 600 },
                'large': { width: 1200, height: 1200 },
                'hd': { width: 1920, height: 1080 },
                '4k': { width: 3840, height: 2160 }
            };
            
            if (presets[preset]) {
                const presetDims = presets[preset];
                const aspectRatio = originalWidth / originalHeight;
                const presetRatio = presetDims.width / presetDims.height;
                
                if (aspectRatio > presetRatio) {
                    return {
                        width: presetDims.width,
                        height: Math.round(presetDims.width / aspectRatio)
                    };
                } else {
                    return {
                        width: Math.round(presetDims.height * aspectRatio),
                        height: presetDims.height
                    };
                }
            }
            
            return { width: originalWidth, height: originalHeight };
            
        default:
            return { width: originalWidth, height: originalHeight };
    }
}

function hasTransparency(file) {
    return file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp';
}

function displayResults() {
    resultsGrid.innerHTML = '';
    
    convertedImages.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            resultItem.innerHTML = `
                <img src="${e.target.result}" alt="Converted" class="result-preview">
                <div class="result-info">
                    <h4>${result.converted.name}</h4>
                    <div class="result-stats">
                        <div>${result.originalFormat} → ${result.newFormat}</div>
                        <div>Original: ${formatFileSize(result.originalSize)}</div>
                        <div>New: ${formatFileSize(result.newSize)}</div>
                        <div>Saved: ${result.compressionRatio}%</div>
                    </div>
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="downloadImage(${index})">
                            <i class="fas fa-download"></i>
                            Download
                        </button>
                        <button class="btn btn-secondary" onclick="previewConvertedImage(${index})">
                            <i class="fas fa-eye"></i>
                            Preview
                        </button>
                    </div>
                </div>
            `;
        };
        reader.readAsDataURL(result.converted);
        
        resultsGrid.appendChild(resultItem);
    });
}

function showResults() {
    resultsSection.style.display = 'block';
    downloadAllBtn.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function hideResults() {
    resultsSection.style.display = 'none';
    downloadAllBtn.style.display = 'none';
}

function downloadImage(index) {
    const result = convertedImages[index];
    const url = URL.createObjectURL(result.converted);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.converted.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadAll() {
    convertedImages.forEach((result, index) => {
        setTimeout(() => {
            downloadImage(index);
        }, index * 100); // Small delay between downloads
    });
}

function previewConvertedImage(index) {
    const result = convertedImages[index];
    const reader = new FileReader();
    reader.onload = function(e) {
        showImageModal(e.target.result, result.converted.name);
    };
    reader.readAsDataURL(result.converted);
}

function updateConvertButton() {
    if (uploadedFiles.length > 0) {
        convertBtn.disabled = false;
        convertBtn.style.opacity = '1';
    } else {
        convertBtn.disabled = true;
        convertBtn.style.opacity = '0.6';
    }
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// FAQ functionality
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
