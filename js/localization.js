// Localization and Theme Management
class LocalizationManager {
    constructor() {
        // Check URL parameters first, then inline script, then localStorage, then default
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');

        if (urlLang && (urlLang === 'en' || urlLang === 'cs')) {
            // Valid language in URL, use it and save to localStorage
            this.currentLang = urlLang;
            localStorage.setItem('language', urlLang);
            window._initialLanguage = urlLang; // Update for consistency
        } else {
            // Use initial language from inline script if available, otherwise use saved preference
            this.currentLang = window._initialLanguage || localStorage.getItem('language') || 'en';
        }

        // Use initial theme from inline script if available, otherwise use saved preference
        this.currentTheme = window._initialTheme || localStorage.getItem('theme');
        if (!this.currentTheme) {
            // Use system preference if no saved theme
            this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            // Save the detected preference to localStorage
            localStorage.setItem('theme', this.currentTheme);
        }

        this.translations = {};
        this.initialized = false;
        this.languageChanging = false;
        this.eventListenersSetup = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Load both language files
            const [enResponse, csResponse] = await Promise.all([
                fetch('assets/locales/en.json'),
                fetch('assets/locales/cs.json')
            ]);

            this.translations.en = await enResponse.json();
            this.translations.cs = await csResponse.json();

            // Initialize theme first (no visual flash)
            this.setTheme(this.currentTheme);

            // Setup event listeners before language initialization
            this.setupEventListeners();

            // Initialize language and ensure selector displays correct value immediately
            this.setLanguage(this.currentLang);

            // Force update language selector multiple times to ensure it's set correctly
            this.updateLanguageSelector();

            // Remove loading state after translations are applied
            this.finishLoading();

            // Additional retries with different timings for robustness
            setTimeout(() => {
                this.updateLanguageSelector();
            }, 50);

            setTimeout(() => {
                this.updateLanguageSelector();
            }, 150);

            setTimeout(() => {
                this.updateLanguageSelector();
            }, 300);

            this.initialized = true;
        } catch (error) {
            this.initialized = true;
        }
    }

    setupEventListeners() {
        // Theme button
        const themeButton = document.getElementById('themeButton');
        if (themeButton) {
            themeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
                this.setTheme(newTheme);
                this.updateThemeButton();
            });
        }

        // Simple Language Selector - Dropdown Design
        const languageSelector = document.getElementById('languageSelector');

        if (languageSelector) {
            // Mark as setup to prevent duplicates
            this.eventListenersSetup = true;

            // Ensure language selector shows the correct value from localStorage
            languageSelector.value = this.currentLang;

            // Force update display to match current language 
            this.updateTranslations();

            // Add change listener
            languageSelector.addEventListener('change', (e) => {
                const targetLang = e.target.value;

                if (targetLang && targetLang !== this.currentLang) {
                    this.setLanguage(targetLang);
                }
            });

            // Additional verification that the value is actually set
            setTimeout(() => {
                if (languageSelector.value !== this.currentLang) {
                    languageSelector.value = this.currentLang;
                }
            }, 10);

        } else {
            // Language element not found, retry after a short delay
            setTimeout(() => {
                this.setupLanguageEventListeners();
            }, 100);
        }
    }

    setupLanguageEventListeners() {
        // Prevent multiple setups
        if (this.eventListenersSetup) {
            return;
        }

        const languageSelector = document.getElementById('languageSelector');

        if (languageSelector) {
            // Mark as setup to prevent duplicates
            this.eventListenersSetup = true;

            // Ensure language selector shows the correct value from localStorage
            languageSelector.value = this.currentLang;

            // Force update display to match current language 
            this.updateTranslations();

            // Add change listener
            languageSelector.addEventListener('change', (e) => {
                const targetLang = e.target.value;

                if (targetLang && targetLang !== this.currentLang) {
                    this.setLanguage(targetLang);
                }
            });

            // Additional verification that the value is actually set
            setTimeout(() => {
                if (languageSelector.value !== this.currentLang) {
                    languageSelector.value = this.currentLang;
                }
            }, 10);
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);

        // Apply theme to both html and body elements for consistency
        const html = document.documentElement;
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            html.classList.add('dark-theme');
            document.body.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
            html.classList.remove('dark-theme');
            document.body.removeAttribute('data-theme');
        }

        // Update the theme button display
        this.updateThemeButton();
    }

    setLanguage(lang) {
        // Prevent rapid language switching
        if (this.languageChanging) return;
        if (lang === this.currentLang) return;

        this.languageChanging = true;
        this.currentLang = lang;
        localStorage.setItem('language', lang);

        // Update current language display immediately
        const langCurrent = document.querySelector('.lang-current');
        if (langCurrent) {
            langCurrent.textContent = lang.toUpperCase();
        }

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Update language dropdown display
        this.updateLanguageDisplay();

        // Update all translatable elements
        this.updateTranslations();

        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));

        // Reset language changing flag after completion
        setTimeout(() => {
            this.languageChanging = false;
        }, 300);
    }

    updateTranslations() {
        if (!this.translations[this.currentLang]) return;

        // Add a smooth transition class to prevent visual flash
        document.body.classList.add('language-changing');

        const elements = document.querySelectorAll('[data-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-key');
            const translation = this.getNestedTranslation(key);

            if (translation) {
                if (element.tagName === 'INPUT' && element.type !== 'submit') {
                    element.placeholder = translation;
                } else {
                    // Direct update without delay to prevent flash
                    element.textContent = translation;
                }
            }
        });

        // Update page title
        if (this.translations[this.currentLang].site && this.translations[this.currentLang].site.title) {
            document.title = this.translations[this.currentLang].site.title;
        }

        // Remove transition class after update
        setTimeout(() => {
            document.body.classList.remove('language-changing');
        }, 100);
    }

    getNestedTranslation(key) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLang];

        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                return null;
            }
        }

        return translation;
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    // Helper methods for enhanced language selector UX
    isMobile() {
        return window.innerWidth <= 768;
    }


    updateLanguageDisplay() {
        // Update language selector value
        this.updateLanguageSelector();
    }

    updateLanguageSelector() {
        const languageSelector = document.getElementById('languageSelector');
        if (languageSelector) {
            // Set the correct option based on current language
            languageSelector.value = this.currentLang;

            setTimeout(() => {
                if (languageSelector.value !== this.currentLang) {
                    languageSelector.selectedIndex = this.currentLang === 'cs' ? 1 : 0;
                }
            }, 5);

        } else {
            // Retry after a short delay if selector not found
            setTimeout(() => {
                const retrySelector = document.getElementById('languageSelector');
                if (retrySelector) {
                    retrySelector.value = this.currentLang;

                    setTimeout(() => {
                        if (retrySelector.value !== this.currentLang) {
                            retrySelector.selectedIndex = this.currentLang === 'cs' ? 1 : 0;
                        }
                    }, 5);
                }
            }, 100);
        }
    }

    updateThemeButton() {
        const themeButton = document.getElementById('themeButton');
        if (themeButton) {
            const themeIcon = themeButton.querySelector('.theme-icon');
            if (themeIcon) {
                // Update icon based on current theme
                themeIcon.textContent = this.currentTheme === 'dark' ? '🌙' : '☀️';
            }
        }
    }

    finishLoading() {
        // Remove loading state and add loaded state to show elements with proper translations
        requestAnimationFrame(() => {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        });
    }
}

// Initialize localization manager
const localizationManager = new LocalizationManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        localizationManager.init();
    });
} else {
    localizationManager.init();
}

// Additional safeguard: Force update language selector when everything is loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        localizationManager.updateLanguageSelector();
    }, 100);
});

// Export for use in other scripts
window.localizationManager = localizationManager;
