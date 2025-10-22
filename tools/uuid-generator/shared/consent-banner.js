// Consent Banner JavaScript
(function() {
    'use strict';
    
    // Check if consent banner should be shown
    function shouldShowBanner() {
        return !localStorage.getItem('cookieConsent');
    }
    
    // Create consent banner HTML
    function createConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'consent-banner';
        banner.className = 'consent-banner';
        banner.innerHTML = `
            <div class="consent-banner-content">
                <div class="consent-banner-text">
                    We use cookies to enhance your experience and analyze site usage. 
                    <a href="/privacy/" style="color: #60a5fa;">Learn more</a>
                </div>
                <div class="consent-banner-actions">
                    <button class="consent-banner-btn decline" onclick="declineCookies()">Decline</button>
                    <button class="consent-banner-btn settings" onclick="showCookieSettings()">Settings</button>
                    <button class="consent-banner-btn accept" onclick="acceptCookies()">Accept All</button>
                </div>
            </div>
        `;
        return banner;
    }
    
    // Show consent banner
    function showConsentBanner() {
        if (shouldShowBanner()) {
            const banner = createConsentBanner();
            document.body.appendChild(banner);
            
            // Show banner with animation
            setTimeout(() => {
                banner.classList.add('show');
            }, 100);
        }
    }
    
    // Accept all cookies
    window.acceptCookies = function() {
        localStorage.setItem('cookieConsent', 'accepted');
        hideConsentBanner();
        initializeAnalytics();
    };
    
    // Decline cookies
    window.declineCookies = function() {
        localStorage.setItem('cookieConsent', 'declined');
        hideConsentBanner();
    };
    
    // Show cookie settings (placeholder)
    window.showCookieSettings = function() {
        alert('Cookie settings would be implemented here. For now, you can manage cookies in your browser settings.');
    };
    
    // Hide consent banner
    function hideConsentBanner() {
        const banner = document.getElementById('consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
            }, 300);
        }
    }
    
    // Initialize analytics (placeholder)
    function initializeAnalytics() {
        // This would initialize Google Analytics or other tracking
        console.log('Analytics initialized');
    }
    
    // Manage cookie consent
    window.manageCookieConsent = function() {
        localStorage.removeItem('cookieConsent');
        showConsentBanner();
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showConsentBanner);
    } else {
        showConsentBanner();
    }
})();

