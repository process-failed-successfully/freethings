/**
 * Google Consent Mode v2 Implementation
 * GDPR-compliant cookie consent banner for FreeThings.win
 */

(function() {
    'use strict';

    // Initialize Google Consent Mode v2 with default denied state
    // This runs before any Google tags load
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }

    // Dynamically load Google AdSense only after advertising consent is granted
    function loadAdSenseScript() {
        try {
            if (window.__adsenseLoaded) return;

            // Ensure account meta exists for Auto ads
            var meta = document.querySelector('meta[name="google-adsense-account"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'google-adsense-account');
                meta.setAttribute('content', 'ca-pub-6242151456790313');
                document.head.appendChild(meta);
            }

            var script = document.createElement('script');
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6242151456790313';
            document.head.appendChild(script);

            window.__adsenseLoaded = true;
        } catch (e) {
            // Fail silently; ads are non-essential
        }
    }

    // Set default consent state (denied) before any Google services load
    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'functionality_storage': 'denied',
        'personalization_storage': 'denied',
        'security_storage': 'granted', // Always granted for security
        'wait_for_update': 500 // Wait up to 500ms for user consent
    });

    // Cookie consent manager
    const ConsentManager = {
        STORAGE_KEY: 'freethings_consent',
        CONSENT_VERSION: '1.0',

        // Check if consent has been given
        hasConsent: function() {
            const consent = this.getConsent();
            return consent !== null;
        },

        // Get stored consent
        getConsent: function() {
            try {
                const stored = localStorage.getItem(this.STORAGE_KEY);
                if (stored) {
                    const consent = JSON.parse(stored);
                    // Check if consent version matches
                    if (consent.version === this.CONSENT_VERSION) {
                        return consent;
                    }
                }
            } catch (e) {
                console.error('Error reading consent:', e);
            }
            return null;
        },

        // Save consent preferences
        saveConsent: function(preferences) {
            const consent = {
                version: this.CONSENT_VERSION,
                timestamp: new Date().toISOString(),
                preferences: preferences
            };

            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(consent));
                this.updateGoogleConsent(preferences);
            } catch (e) {
                console.error('Error saving consent:', e);
            }
        },

        // Update Google Consent Mode based on user preferences
        updateGoogleConsent: function(preferences) {
            gtag('consent', 'update', {
                'ad_storage': preferences.advertising ? 'granted' : 'denied',
                'ad_user_data': preferences.advertising ? 'granted' : 'denied',
                'ad_personalization': preferences.advertising ? 'granted' : 'denied',
                'analytics_storage': preferences.analytics ? 'granted' : 'denied',
                'functionality_storage': preferences.functional ? 'granted' : 'denied',
                'personalization_storage': preferences.functional ? 'granted' : 'denied'
            });

            // Load AdSense library after advertising consent is granted
            if (preferences.advertising) {
                loadAdSenseScript();
            }

            // Reload ads if consent is given
            if (preferences.advertising && window.adsbygoogle) {
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                } catch (e) {
                    // Ignore ad loading errors
                }
            }
        },

        // Accept all cookies
        acceptAll: function() {
            this.saveConsent({
                advertising: true,
                analytics: true,
                functional: true
            });
        },

        // Reject all non-essential cookies
        rejectAll: function() {
            this.saveConsent({
                advertising: false,
                analytics: false,
                functional: false
            });
        },

        // Save custom preferences
        saveCustom: function(preferences) {
            this.saveConsent(preferences);
        }
    };

    // Cookie banner UI
    const BannerUI = {
        banner: null,
        settingsModal: null,

        // Create and show the consent banner
        show: function() {
            if (this.banner) return;

            // Create banner HTML
            this.banner = document.createElement('div');
            this.banner.id = 'consent-banner';
            this.banner.className = 'consent-banner';
            this.banner.innerHTML = `
                <div class="consent-banner-content">
                    <div class="consent-banner-text">
                        <h3>🍪 Cookie Consent</h3>
                        <p>We use cookies to improve your experience and show relevant ads through Google AdSense. By clicking "Accept All", you consent to our use of cookies for advertising and analytics.</p>
                        <p class="consent-privacy-link">
                            <a href="/privacy/" target="_blank">Privacy Policy</a> • 
                            <a href="/terms/" target="_blank">Terms of Service</a>
                        </p>
                    </div>
                    <div class="consent-banner-actions">
                        <button id="consent-accept-all" class="consent-btn consent-btn-primary">
                            <i class="fas fa-check"></i> Accept All
                        </button>
                        <button id="consent-reject-all" class="consent-btn consent-btn-secondary">
                            <i class="fas fa-times"></i> Reject All
                        </button>
                        <button id="consent-customize" class="consent-btn consent-btn-link">
                            <i class="fas fa-cog"></i> Customize
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(this.banner);

            // Add event listeners
            document.getElementById('consent-accept-all').addEventListener('click', () => {
                ConsentManager.acceptAll();
                this.hide();
            });

            document.getElementById('consent-reject-all').addEventListener('click', () => {
                ConsentManager.rejectAll();
                this.hide();
            });

            document.getElementById('consent-customize').addEventListener('click', () => {
                this.showSettings();
            });

            // Animate in
            setTimeout(() => {
                this.banner.classList.add('consent-banner-visible');
            }, 100);
        },

        // Hide the banner
        hide: function() {
            if (this.banner) {
                this.banner.classList.remove('consent-banner-visible');
                setTimeout(() => {
                    if (this.banner && this.banner.parentNode) {
                        this.banner.parentNode.removeChild(this.banner);
                    }
                    this.banner = null;
                }, 300);
            }
        },

        // Show settings modal
        showSettings: function() {
            if (this.settingsModal) return;

            this.settingsModal = document.createElement('div');
            this.settingsModal.id = 'consent-settings-modal';
            this.settingsModal.className = 'consent-modal';
            this.settingsModal.innerHTML = `
                <div class="consent-modal-overlay"></div>
                <div class="consent-modal-content">
                    <div class="consent-modal-header">
                        <h2>Cookie Preferences</h2>
                        <button id="consent-modal-close" class="consent-modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="consent-modal-body">
                        <p>Customize your cookie preferences below. Essential cookies are always enabled for security purposes.</p>
                        
                        <div class="consent-option">
                            <div class="consent-option-header">
                                <label class="consent-toggle">
                                    <input type="checkbox" id="consent-essential" checked disabled>
                                    <span class="consent-toggle-slider"></span>
                                </label>
                                <div class="consent-option-info">
                                    <h4>Essential Cookies <span class="consent-badge-required">Required</span></h4>
                                    <p>These cookies are necessary for the website to function and cannot be disabled.</p>
                                </div>
                            </div>
                        </div>

                        <div class="consent-option">
                            <div class="consent-option-header">
                                <label class="consent-toggle">
                                    <input type="checkbox" id="consent-functional" checked>
                                    <span class="consent-toggle-slider"></span>
                                </label>
                                <div class="consent-option-info">
                                    <h4>Functional Cookies</h4>
                                    <p>Enable enhanced functionality like remembering your preferences and settings.</p>
                                </div>
                            </div>
                        </div>

                        <div class="consent-option">
                            <div class="consent-option-header">
                                <label class="consent-toggle">
                                    <input type="checkbox" id="consent-advertising" checked>
                                    <span class="consent-toggle-slider"></span>
                                </label>
                                <div class="consent-option-info">
                                    <h4>Advertising Cookies</h4>
                                    <p>Used by Google AdSense to display personalized advertisements based on your interests. This helps keep our service free.</p>
                                </div>
                            </div>
                        </div>

                        <div class="consent-option">
                            <div class="consent-option-header">
                                <label class="consent-toggle">
                                    <input type="checkbox" id="consent-analytics">
                                    <span class="consent-toggle-slider"></span>
                                </label>
                                <div class="consent-option-info">
                                    <h4>Analytics Cookies</h4>
                                    <p>Help us understand how visitors use our site so we can improve it. All data is anonymous.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="consent-modal-footer">
                        <button id="consent-save-preferences" class="consent-btn consent-btn-primary">
                            <i class="fas fa-save"></i> Save Preferences
                        </button>
                        <button id="consent-accept-all-modal" class="consent-btn consent-btn-secondary">
                            <i class="fas fa-check"></i> Accept All
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(this.settingsModal);

            // Add event listeners
            const closeModal = () => {
                this.hideSettings();
            };

            document.getElementById('consent-modal-close').addEventListener('click', closeModal);
            document.querySelector('.consent-modal-overlay').addEventListener('click', closeModal);

            document.getElementById('consent-save-preferences').addEventListener('click', () => {
                const preferences = {
                    advertising: document.getElementById('consent-advertising').checked,
                    analytics: document.getElementById('consent-analytics').checked,
                    functional: document.getElementById('consent-functional').checked
                };
                ConsentManager.saveCustom(preferences);
                this.hideSettings();
                this.hide();
            });

            document.getElementById('consent-accept-all-modal').addEventListener('click', () => {
                ConsentManager.acceptAll();
                this.hideSettings();
                this.hide();
            });

            // Animate in
            setTimeout(() => {
                this.settingsModal.classList.add('consent-modal-visible');
            }, 10);
        },

        // Hide settings modal
        hideSettings: function() {
            if (this.settingsModal) {
                this.settingsModal.classList.remove('consent-modal-visible');
                setTimeout(() => {
                    if (this.settingsModal && this.settingsModal.parentNode) {
                        this.settingsModal.parentNode.removeChild(this.settingsModal);
                    }
                    this.settingsModal = null;
                }, 300);
            }
        }
    };

    // Initialize on page load
    function init() {
        // Check if consent has already been given
        const existingConsent = ConsentManager.getConsent();
        
        if (existingConsent) {
            // Apply stored consent preferences
            ConsentManager.updateGoogleConsent(existingConsent.preferences);
        } else {
            // Show consent banner after a short delay
            setTimeout(() => {
                BannerUI.show();
            }, 1000);
        }

        // Add global function to manage cookies (for settings page, etc.)
        window.manageCookieConsent = function() {
            BannerUI.showSettings();
        };

        // Expose AdSense loader for pages that may want to trigger it
        window.loadAdSense = loadAdSenseScript;

        // Add global function to check consent status
        window.hasUserConsent = function() {
            return ConsentManager.hasConsent();
        };
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

