// Unit Converter JavaScript

// Conversion factors and units data
const conversionData = {
    length: {
        units: {
            'millimeter': { name: 'Millimeter (mm)', factor: 0.001 },
            'centimeter': { name: 'Centimeter (cm)', factor: 0.01 },
            'meter': { name: 'Meter (m)', factor: 1 },
            'kilometer': { name: 'Kilometer (km)', factor: 1000 },
            'inch': { name: 'Inch (in)', factor: 0.0254 },
            'foot': { name: 'Foot (ft)', factor: 0.3048 },
            'yard': { name: 'Yard (yd)', factor: 0.9144 },
            'mile': { name: 'Mile (mi)', factor: 1609.34 }
        }
    },
    weight: {
        units: {
            'milligram': { name: 'Milligram (mg)', factor: 0.000001 },
            'gram': { name: 'Gram (g)', factor: 0.001 },
            'kilogram': { name: 'Kilogram (kg)', factor: 1 },
            'tonne': { name: 'Tonne (t)', factor: 1000 },
            'ounce': { name: 'Ounce (oz)', factor: 0.0283495 },
            'pound': { name: 'Pound (lb)', factor: 0.453592 },
            'stone': { name: 'Stone (st)', factor: 6.35029 }
        }
    },
    temperature: {
        units: {
            'celsius': { name: 'Celsius (°C)', factor: 1 },
            'fahrenheit': { name: 'Fahrenheit (°F)', factor: 1 },
            'kelvin': { name: 'Kelvin (K)', factor: 1 }
        }
    },
    area: {
        units: {
            'square_millimeter': { name: 'Square Millimeter (mm²)', factor: 0.000001 },
            'square_centimeter': { name: 'Square Centimeter (cm²)', factor: 0.0001 },
            'square_meter': { name: 'Square Meter (m²)', factor: 1 },
            'square_kilometer': { name: 'Square Kilometer (km²)', factor: 1000000 },
            'hectare': { name: 'Hectare (ha)', factor: 10000 },
            'square_inch': { name: 'Square Inch (in²)', factor: 0.00064516 },
            'square_foot': { name: 'Square Foot (ft²)', factor: 0.092903 },
            'square_yard': { name: 'Square Yard (yd²)', factor: 0.836127 },
            'acre': { name: 'Acre', factor: 4046.86 },
            'square_mile': { name: 'Square Mile (mi²)', factor: 2589988.11 }
        }
    },
    volume: {
        units: {
            'milliliter': { name: 'Milliliter (ml)', factor: 0.000001 },
            'liter': { name: 'Liter (l)', factor: 0.001 },
            'cubic_meter': { name: 'Cubic Meter (m³)', factor: 1 },
            'cubic_centimeter': { name: 'Cubic Centimeter (cm³)', factor: 0.000001 },
            'fluid_ounce': { name: 'Fluid Ounce (fl oz)', factor: 0.0000295735 },
            'cup': { name: 'Cup', factor: 0.000236588 },
            'pint': { name: 'Pint (pt)', factor: 0.000473176 },
            'quart': { name: 'Quart (qt)', factor: 0.000946353 },
            'gallon': { name: 'Gallon (gal)', factor: 0.00378541 },
            'cubic_inch': { name: 'Cubic Inch (in³)', factor: 0.0000163871 },
            'cubic_foot': { name: 'Cubic Foot (ft³)', factor: 0.0283168 }
        }
    },
    time: {
        units: {
            'nanosecond': { name: 'Nanosecond (ns)', factor: 0.000000001 },
            'microsecond': { name: 'Microsecond (μs)', factor: 0.000001 },
            'millisecond': { name: 'Millisecond (ms)', factor: 0.001 },
            'second': { name: 'Second (s)', factor: 1 },
            'minute': { name: 'Minute (min)', factor: 60 },
            'hour': { name: 'Hour (h)', factor: 3600 },
            'day': { name: 'Day (d)', factor: 86400 },
            'week': { name: 'Week', factor: 604800 },
            'month': { name: 'Month', factor: 2629746 },
            'year': { name: 'Year', factor: 31556952 }
        }
    },
    speed: {
        units: {
            'meter_per_second': { name: 'Meter/Second (m/s)', factor: 1 },
            'kilometer_per_hour': { name: 'Kilometer/Hour (km/h)', factor: 0.277778 },
            'mile_per_hour': { name: 'Mile/Hour (mph)', factor: 0.44704 },
            'foot_per_second': { name: 'Foot/Second (ft/s)', factor: 0.3048 },
            'knot': { name: 'Knot (kn)', factor: 0.514444 }
        }
    },
    pressure: {
        units: {
            'pascal': { name: 'Pascal (Pa)', factor: 1 },
            'kilopascal': { name: 'Kilopascal (kPa)', factor: 1000 },
            'megapascal': { name: 'Megapascal (MPa)', factor: 1000000 },
            'bar': { name: 'Bar', factor: 100000 },
            'atmosphere': { name: 'Atmosphere (atm)', factor: 101325 },
            'psi': { name: 'PSI', factor: 6894.76 },
            'torr': { name: 'Torr', factor: 133.322 }
        }
    },
    energy: {
        units: {
            'joule': { name: 'Joule (J)', factor: 1 },
            'kilojoule': { name: 'Kilojoule (kJ)', factor: 1000 },
            'megajoule': { name: 'Megajoule (MJ)', factor: 1000000 },
            'calorie': { name: 'Calorie (cal)', factor: 4.184 },
            'kilocalorie': { name: 'Kilocalorie (kcal)', factor: 4184 },
            'watt_hour': { name: 'Watt Hour (Wh)', factor: 3600 },
            'kilowatt_hour': { name: 'Kilowatt Hour (kWh)', factor: 3600000 },
            'btu': { name: 'BTU', factor: 1055.06 }
        }
    },
    data: {
        units: {
            'bit': { name: 'Bit (b)', factor: 0.125 },
            'byte': { name: 'Byte (B)', factor: 1 },
            'kilobyte': { name: 'Kilobyte (KB)', factor: 1024 },
            'megabyte': { name: 'Megabyte (MB)', factor: 1048576 },
            'gigabyte': { name: 'Gigabyte (GB)', factor: 1073741824 },
            'terabyte': { name: 'Terabyte (TB)', factor: 1099511627776 },
            'petabyte': { name: 'Petabyte (PB)', factor: 1125899906842624 }
        }
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateUnits();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Auto-convert when inputs change
    document.getElementById('value-input').addEventListener('input', function() {
        if (this.value && this.value.trim() !== '') {
            convertUnits();
        }
    });

    document.getElementById('from-unit').addEventListener('change', function() {
        if (document.getElementById('value-input').value) {
            convertUnits();
        }
    });

    document.getElementById('to-unit').addEventListener('change', function() {
        if (document.getElementById('value-input').value) {
            convertUnits();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            convertUnits();
        }
    });
}

// Update units based on selected category
function updateUnits() {
    const category = document.getElementById('category-select').value;
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');
    
    const units = conversionData[category].units;
    
    // Clear existing options
    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';
    
    // Add options
    Object.keys(units).forEach(unitKey => {
        const unit = units[unitKey];
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');
        
        option1.value = unitKey;
        option1.textContent = unit.name;
        
        option2.value = unitKey;
        option2.textContent = unit.name;
        
        fromUnit.appendChild(option1);
        toUnit.appendChild(option2);
    });
    
    // Set default selections
    const unitKeys = Object.keys(units);
    if (category === 'temperature') {
        fromUnit.value = 'celsius';
        toUnit.value = 'fahrenheit';
    } else {
        fromUnit.value = unitKeys[0];
        toUnit.value = unitKeys[1];
    }
    
    // Clear result if category changed
    clearResult();
}

// Convert units
function convertUnits() {
    const category = document.getElementById('category-select').value;
    const fromUnit = document.getElementById('from-unit').value;
    const toUnit = document.getElementById('to-unit').value;
    const value = parseFloat(document.getElementById('value-input').value);
    
    if (!value || isNaN(value)) {
        showError('Please enter a valid number');
        return;
    }
    
    if (fromUnit === toUnit) {
        showResult(value, toUnit, 'Same unit selected');
        return;
    }
    
    const convertBtn = document.getElementById('convert-btn');
    convertBtn.classList.add('loading');
    convertBtn.disabled = true;
    
    // Simulate processing time for better UX
    setTimeout(() => {
        try {
            let result;
            
            if (category === 'temperature') {
                result = convertTemperature(value, fromUnit, toUnit);
            } else {
                result = convertStandard(value, fromUnit, toUnit, category);
            }
            
            showResult(result, toUnit, `${value} ${conversionData[category].units[fromUnit].name} =`);
            
            // Track conversion
            trackConversion(category, fromUnit, toUnit);
            
        } catch (error) {
            showError('Conversion error: ' + error.message);
        } finally {
            convertBtn.classList.remove('loading');
            convertBtn.disabled = false;
        }
    }, 300);
}

// Standard unit conversion
function convertStandard(value, fromUnit, toUnit, category) {
    const units = conversionData[category].units;
    const fromFactor = units[fromUnit].factor;
    const toFactor = units[toUnit].factor;
    
    // Convert to base unit first, then to target unit
    const baseValue = value * fromFactor;
    const result = baseValue / toFactor;
    
    return result;
}

// Temperature conversion (special case)
function convertTemperature(value, fromUnit, toUnit) {
    let celsius;
    
    // Convert to Celsius first
    switch (fromUnit) {
        case 'celsius':
            celsius = value;
            break;
        case 'fahrenheit':
            celsius = (value - 32) * 5/9;
            break;
        case 'kelvin':
            celsius = value - 273.15;
            break;
        default:
            throw new Error('Unknown temperature unit');
    }
    
    // Convert from Celsius to target unit
    switch (toUnit) {
        case 'celsius':
            return celsius;
        case 'fahrenheit':
            return (celsius * 9/5) + 32;
        case 'kelvin':
            return celsius + 273.15;
        default:
            throw new Error('Unknown temperature unit');
    }
}

// Show conversion result
function showResult(result, unit, description) {
    const resultOutput = document.getElementById('result-output');
    const copySection = document.getElementById('copy-section');
    const category = document.getElementById('category-select').value;
    const unitName = conversionData[category].units[unit].name;
    
    // Format the result
    let formattedResult;
    if (Math.abs(result) >= 1000000 || (Math.abs(result) < 0.001 && result !== 0)) {
        formattedResult = result.toExponential(6);
    } else {
        formattedResult = result.toFixed(6).replace(/\.?0+$/, '');
    }
    
    resultOutput.innerHTML = `
        <div class="result-display">
            <div class="result-value">${formattedResult}</div>
            <div class="result-unit">${unitName}</div>
            <div class="result-details">${description}</div>
        </div>
    `;
    
    copySection.style.display = 'flex';
    
    // Store result for copying
    window.lastConversionResult = `${formattedResult} ${unitName}`;
}

// Show error message
function showError(message) {
    const resultOutput = document.getElementById('result-output');
    const copySection = document.getElementById('copy-section');
    
    resultOutput.innerHTML = `
        <div class="result-placeholder">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
    
    copySection.style.display = 'none';
}

// Clear result
function clearResult() {
    const resultOutput = document.getElementById('result-output');
    const copySection = document.getElementById('copy-section');
    
    resultOutput.innerHTML = `
        <div class="result-placeholder">
            <i class="fas fa-exchange-alt"></i>
            <p>Your conversion result will appear here</p>
        </div>
    `;
    
    copySection.style.display = 'none';
}

// Copy result to clipboard
function copyResult() {
    if (!window.lastConversionResult) {
        showNotification('No result to copy');
        return;
    }
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(window.lastConversionResult).then(() => {
            showNotification('Result copied to clipboard!');
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
        showNotification('Result copied to clipboard!');
    } catch (err) {
        showNotification('Failed to copy result');
    }
    
    document.body.removeChild(textArea);
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Quick convert function for quick conversion items
function quickConvert(category, fromUnit, toUnit, value) {
    document.getElementById('category-select').value = category;
    updateUnits();
    
    document.getElementById('from-unit').value = fromUnit;
    document.getElementById('to-unit').value = toUnit;
    document.getElementById('value-input').value = value;
    
    convertUnits();
    
    // Scroll to converter
    document.querySelector('.converter-section').scrollIntoView({
        behavior: 'smooth'
    });
}

// Set category from footer links
function setCategory(category) {
    document.getElementById('category-select').value = category;
    updateUnits();
    
    // Scroll to converter section
    document.querySelector('.converter-section').scrollIntoView({
        behavior: 'smooth'
    });
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
function trackConversion(category, fromUnit, toUnit) {
    // Placeholder for analytics tracking
    console.log('Conversion tracked:', {
        category: category,
        fromUnit: fromUnit,
        toUnit: toUnit,
        timestamp: new Date().toISOString()
    });
    
    // Example: Google Analytics 4
    // gtag('event', 'unit_conversion', {
    //     category: category,
    //     from_unit: fromUnit,
    //     to_unit: toUnit
    // });
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
window.testConversion = function() {
    console.log('Testing unit conversion...');
    
    // Test temperature conversion
    const tempResult = convertTemperature(0, 'celsius', 'fahrenheit');
    console.log('0°C to °F:', tempResult, '(should be 32)');
    
    // Test standard conversion
    const lengthResult = convertStandard(1, 'meter', 'feet', 'length');
    console.log('1m to ft:', lengthResult, '(should be ~3.281)');
    
    console.log('Unit conversion test completed');
};
