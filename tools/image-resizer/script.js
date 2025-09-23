// Global variables
let uploadedFiles = [];
let resizedImages = [];

// DOM elements
const fileInput = document.getElementById('file-input');
const fileUploadArea = document.getElementById('file-upload-area');
const fileList = document.getElementById('file-list');
const resultsSection = document.getElementById('results-section');
const resultsGrid = document.getElementById('results-grid');
const resizeBtn = document.getElementById('resize-btn');
const downloadAllBtn = document.getElementById('download-all-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateResizeMode();
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
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
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
    updateResizeButton();
}

function displayFileList() {
    fileList.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            fileItem.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" class="file-preview">
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
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
        
        fileList.appendChild(fileItem);
    });
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    displayFileList();
    updateResizeButton();
}

function previewImage(index) {
    const file = uploadedFiles[index];
    const reader = new FileReader();
    reader.onload = function(e) {
        // Create modal for image preview
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
                <img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
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
    };
    reader.readAsDataURL(file);
}

function clearAll() {
    uploadedFiles = [];
    resizedImages = [];
    displayFileList();
    hideResults();
    updateResizeButton();
    fileInput.value = '';
}

// Resize mode functions
function updateResizeMode() {
    const mode = document.getElementById('resize-mode').value;
    
    // Hide all groups
    document.getElementById('percentage-group').style.display = 'none';
    document.getElementById('dimensions-group').style.display = 'none';
    document.getElementById('preset-group').style.display = 'none';
    
    // Show selected group
    switch(mode) {
        case 'percentage':
            document.getElementById('percentage-group').style.display = 'block';
            break;
        case 'dimensions':
            document.getElementById('dimensions-group').style.display = 'block';
            break;
        case 'preset':
            document.getElementById('preset-group').style.display = 'block';
            break;
    }
}

function updatePercentageDisplay() {
    const percentage = document.getElementById('resize-percentage').value;
    document.getElementById('percentage-display').textContent = percentage + '%';
}

function updateQualityDisplay() {
    const quality = document.getElementById('quality').value;
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
        'facebook': { width: 1200, height: 630 },
        'instagram': { width: 1080, height: 1080 },
        'instagram-story': { width: 1080, height: 1920 },
        'twitter': { width: 1500, height: 500 },
        'youtube': { width: 1280, height: 720 }
    };
    
    const dimensions = presets[preset];
    if (dimensions) {
        document.getElementById('custom-width').value = dimensions.width;
        document.getElementById('custom-height').value = dimensions.height;
    }
}

function applyQuickPreset(preset) {
    // Switch to preset mode and apply
    document.getElementById('resize-mode').value = 'preset';
    updateResizeMode();
    
    const presets = {
        'thumbnail': 'thumbnail',
        'social': 'facebook',
        'instagram': 'instagram',
        'web': 'medium',
        'email': 'small',
        'compress': 'percentage'
    };
    
    if (preset === 'compress') {
        document.getElementById('resize-mode').value = 'percentage';
        document.getElementById('resize-percentage').value = '70';
        updatePercentageDisplay();
        updateResizeMode();
    } else {
        document.getElementById('preset-size').value = presets[preset];
        applyPreset();
    }
}

// Main resize function
async function resizeImages() {
    if (uploadedFiles.length === 0) {
        alert('Please upload some images first.');
        return;
    }
    
    resizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    resizeBtn.disabled = true;
    
    resizedImages = [];
    
    try {
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const resizedImage = await resizeImage(file);
            resizedImages.push(resizedImage);
        }
        
        displayResults();
        showResults();
        
    } catch (error) {
        console.error('Error resizing images:', error);
        alert('Error processing images. Please try again.');
    } finally {
        resizeBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Resize Images';
        resizeBtn.disabled = false;
    }
}

async function resizeImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = function() {
            try {
                const originalWidth = img.width;
                const originalHeight = img.height;
                
                let newWidth, newHeight;
                
                // Calculate new dimensions based on resize mode
                const mode = document.getElementById('resize-mode').value;
                
                switch(mode) {
                    case 'percentage':
                        const percentage = parseInt(document.getElementById('resize-percentage').value) / 100;
                        newWidth = Math.round(originalWidth * percentage);
                        newHeight = Math.round(originalHeight * percentage);
                        break;
                        
                    case 'dimensions':
                        const customWidth = parseInt(document.getElementById('custom-width').value);
                        const customHeight = parseInt(document.getElementById('custom-height').value);
                        const maintainAspect = document.getElementById('maintain-aspect').checked;
                        
                        if (maintainAspect) {
                            const aspectRatio = originalWidth / originalHeight;
                            if (customWidth && customHeight) {
                                // Use the smaller dimension to maintain aspect ratio
                                const widthRatio = customWidth / originalWidth;
                                const heightRatio = customHeight / originalHeight;
                                const ratio = Math.min(widthRatio, heightRatio);
                                newWidth = Math.round(originalWidth * ratio);
                                newHeight = Math.round(originalHeight * ratio);
                            } else if (customWidth) {
                                newWidth = customWidth;
                                newHeight = Math.round(customWidth / aspectRatio);
                            } else if (customHeight) {
                                newHeight = customHeight;
                                newWidth = Math.round(customHeight * aspectRatio);
                            } else {
                                newWidth = originalWidth;
                                newHeight = originalHeight;
                            }
                        } else {
                            newWidth = customWidth || originalWidth;
                            newHeight = customHeight || originalHeight;
                        }
                        break;
                        
                    case 'preset':
                        const preset = document.getElementById('preset-size').value;
                        const presets = {
                            'thumbnail': { width: 150, height: 150 },
                            'small': { width: 300, height: 300 },
                            'medium': { width: 600, height: 600 },
                            'large': { width: 1200, height: 1200 },
                            'facebook': { width: 1200, height: 630 },
                            'instagram': { width: 1080, height: 1080 },
                            'instagram-story': { width: 1080, height: 1920 },
                            'twitter': { width: 1500, height: 500 },
                            'youtube': { width: 1280, height: 720 }
                        };
                        
                        if (presets[preset]) {
                            const presetDims = presets[preset];
                            const aspectRatio = originalWidth / originalHeight;
                            const presetRatio = presetDims.width / presetDims.height;
                            
                            if (aspectRatio > presetRatio) {
                                newWidth = presetDims.width;
                                newHeight = Math.round(presetDims.width / aspectRatio);
                            } else {
                                newHeight = presetDims.height;
                                newWidth = Math.round(presetDims.height * aspectRatio);
                            }
                        } else {
                            newWidth = originalWidth;
                            newHeight = originalHeight;
                        }
                        break;
                        
                    default:
                        newWidth = originalWidth;
                        newHeight = originalHeight;
                }
                
                // Set canvas dimensions
                canvas.width = newWidth;
                canvas.height = newHeight;
                
                // Draw resized image
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                // Get output format and quality
                const outputFormat = document.getElementById('output-format').value;
                const quality = parseInt(document.getElementById('quality').value) / 100;
                
                let mimeType = file.type;
                if (outputFormat !== 'original') {
                    mimeType = `image/${outputFormat}`;
                }
                
                // Convert to blob
                canvas.toBlob((blob) => {
                    const resizedFile = new File([blob], file.name, { type: mimeType });
                    
                    resolve({
                        original: file,
                        resized: resizedFile,
                        originalSize: file.size,
                        newSize: blob.size,
                        originalDimensions: `${originalWidth}×${originalHeight}`,
                        newDimensions: `${newWidth}×${newHeight}`,
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

function displayResults() {
    resultsGrid.innerHTML = '';
    
    resizedImages.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            resultItem.innerHTML = `
                <img src="${e.target.result}" alt="Resized" class="result-preview">
                <div class="result-info">
                    <h4>${result.resized.name}</h4>
                    <div class="result-stats">
                        <div>Original: ${result.originalDimensions}</div>
                        <div>New: ${result.newDimensions}</div>
                        <div>Original: ${formatFileSize(result.originalSize)}</div>
                        <div>New: ${formatFileSize(result.newSize)}</div>
                    </div>
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="downloadImage(${index})">
                            <i class="fas fa-download"></i>
                            Download
                        </button>
                        <button class="btn btn-secondary" onclick="previewResizedImage(${index})">
                            <i class="fas fa-eye"></i>
                            Preview
                        </button>
                    </div>
                </div>
            `;
        };
        reader.readAsDataURL(result.resized);
        
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
    const result = resizedImages[index];
    const url = URL.createObjectURL(result.resized);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.resized.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadAll() {
    resizedImages.forEach((result, index) => {
        setTimeout(() => {
            downloadImage(index);
        }, index * 100); // Small delay between downloads
    });
}

function previewResizedImage(index) {
    const result = resizedImages[index];
    const reader = new FileReader();
    reader.onload = function(e) {
        // Create modal for image preview
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
                <img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
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
    };
    reader.readAsDataURL(result.resized);
}

function updateResizeButton() {
    if (uploadedFiles.length > 0) {
        resizeBtn.disabled = false;
        resizeBtn.style.opacity = '1';
    } else {
        resizeBtn.disabled = true;
        resizeBtn.style.opacity = '0.6';
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
