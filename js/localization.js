// Localization and Theme Management
class LocalizationManager {
    constructor() {
        // Default to English, override with saved preference if exists
        this.currentLang = localStorage.getItem('language') || 'en';
        
        // Theme logic: Check localStorage first, then system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
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
            
            // Initialize language last to prevent flash
            // Use setTimeout to ensure DOM is ready and elements are available
            setTimeout(() => {
                this.setLanguage(this.currentLang);
            }, 50);
            
            this.initialized = true;
        } catch (error) {
            console.error('Failed to load translations:', error);
            this.initialized = true; // Still mark as initialized to prevent infinite loops
        }
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
                this.setTheme(newTheme);
            });
        }

        // Simple Language Selector - Dropdown Design
        const languageSelector = document.getElementById('languageSelector');
        
        console.log('Language selector element:', languageSelector);
        
        if (languageSelector) {
            console.log('Setting up language selector event listeners...');
            // Mark as setup to prevent duplicates
            this.eventListenersSetup = true;
            
            // Set current language value
            languageSelector.value = this.currentLang;
            
            // Add change listener
            languageSelector.addEventListener('change', (e) => {
                const targetLang = e.target.value;
                console.log('Language selected:', targetLang);
                
                if (targetLang && targetLang !== this.currentLang) {
                    this.setLanguage(targetLang);
                }
            });
        } else {
            console.error('Language selector element not found!');
            // Language element not found, retry after a short delay
            setTimeout(() => {
                this.setupLanguageEventListeners();
            }, 100);
        }
    }

    setupLanguageEventListeners() {
        // Prevent multiple setups
        if (this.eventListenersSetup) {
            console.log('Event listeners already set up, skipping...');
            return;
        }
        
        const languageSelector = document.getElementById('languageSelector');
        
        if (languageSelector) {
            console.log('Setting up language selector event listeners on retry...');
            // Mark as setup to prevent duplicates
            this.eventListenersSetup = true;
            
            // Set current language value
            languageSelector.value = this.currentLang;
            
            // Add change listener
            languageSelector.addEventListener('change', (e) => {
                const targetLang = e.target.value;
                console.log('Language selected (retry):', targetLang);
                
                if (targetLang && targetLang !== this.currentLang) {
                    this.setLanguage(targetLang);
                }
            });
        } else {
            console.log('Language selector element still not found on retry');
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

        // Update theme toggle appearance
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            if (theme === 'dark') {
                themeToggle.classList.add('dark');
            } else {
                themeToggle.classList.remove('dark');
            }
        }
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
                    // Use a small delay to prevent flash
                    if (element.textContent !== translation) {
                        element.style.opacity = '0.7';
                        requestAnimationFrame(() => {
                            element.textContent = translation;
                            element.style.opacity = '1';
                        });
                    }
                }
            }
        });

        // Update page title
        if (this.translations[this.currentLang].pageTitle) {
            document.title = this.translations[this.currentLang].pageTitle;
        }

        // Remove transition class after update
        setTimeout(() => {
            document.body.classList.remove('language-changing');
        }, 200);
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
        }
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

// Export for use in other scripts
window.localizationManager = localizationManager;
