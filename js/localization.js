// Localization and Theme Management
class LocalizationManager {
    constructor() {
        // Default to English, override with saved preference if exists
        this.currentLang = localStorage.getItem('language') || 'en';
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.translations = {};
        this.initialized = false;
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

            // Initialize theme
            this.setTheme(this.currentTheme);
            
            // Initialize language
            this.setLanguage(this.currentLang);
            
            // Setup event listeners
            this.setupEventListeners();
            
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
            themeToggle.addEventListener('click', () => {
                const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
                this.setTheme(newTheme);
            });
        }

        // Language toggle
        const languageToggle = document.getElementById('languageToggle');
        const languageDropdown = document.querySelector('.lang-dropdown');
        
        if (languageToggle && languageDropdown) {
            // Toggle dropdown on click
            languageToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                languageToggle.classList.toggle('active');
            });
            
            // Handle language selection
            languageDropdown.addEventListener('click', (e) => {
                if (e.target.dataset.lang) {
                    this.setLanguage(e.target.dataset.lang);
                    languageToggle.classList.remove('active');
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                languageToggle.classList.remove('active');
            });
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
        } else {
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
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        
        // Update current language display
        const langCurrent = document.querySelector('.lang-current');
        if (langCurrent) {
            langCurrent.textContent = lang.toUpperCase();
        }

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Update all translatable elements
        this.updateTranslations();
        
        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    updateTranslations() {
        if (!this.translations[this.currentLang]) return;

        const elements = document.querySelectorAll('[data-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-key');
            const translation = this.getNestedTranslation(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' && element.type !== 'submit') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update page title
        if (this.translations[this.currentLang].pageTitle) {
            document.title = this.translations[this.currentLang].pageTitle;
        }
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
