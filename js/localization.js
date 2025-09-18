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

        // New Modern Language Switch - Toggle Design
        const languageSwitch = document.getElementById('languageSwitch');
        const langOptions = languageSwitch ? languageSwitch.querySelectorAll('.lang-option') : null;
        
        console.log('Language switch element:', languageSwitch);
        console.log('Language options:', langOptions);
        
        if (languageSwitch && langOptions && langOptions.length > 0) {
            console.log('Setting up new language switch event listeners...');
            // Mark as setup to prevent duplicates
            this.eventListenersSetup = true;
            
            // Update current language display
            this.updateLanguageSwitch();
            
            // Add click listeners to each language option
            langOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const targetLang = option.dataset.lang;
                    console.log('Language option clicked:', targetLang);
                    
                    if (targetLang && targetLang !== this.currentLang) {
                        this.setLanguage(targetLang);
                    }
                });
            });
        } else {
            console.error('Language switch elements not found!', { 
                languageSwitch, 
                langOptions,
                allLanguageSwitches: document.querySelectorAll('#languageSwitch')
            });
            // Language elements not found, retry after a short delay
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
        
        const languageSwitch = document.getElementById('languageSwitch');
        const langOptions = languageSwitch ? languageSwitch.querySelectorAll('.lang-option') : null;
        
        if (languageSwitch && langOptions && langOptions.length > 0) {
            console.log('Setting up language switch event listeners on retry...');
            // Mark as setup to prevent duplicates
            this.eventListenersSetup = true;
            
            this.updateLanguageSwitch();
            
            // Add click listeners to each language option
            langOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const targetLang = option.dataset.lang;
                    console.log('Language option clicked (retry):', targetLang);
                    
                    if (targetLang && targetLang !== this.currentLang) {
                        this.setLanguage(targetLang);
                    }
                });
            });
        } else {
            console.log('Language switch elements still not found on retry');
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

    openLanguageDropdown() {
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.classList.add('active');
            this.updateLanguageDisplay();
        }
    }

    closeLanguageDropdown() {
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.classList.remove('active');
            // Remove any selecting states
            const selectingItems = document.querySelectorAll('.lang-dropdown .selecting');
            selectingItems.forEach(item => item.classList.remove('selecting'));
        }
    }

    updateLanguageDisplay() {
        // Fallback for old code - redirect to new function
        this.updateLanguageSwitch();
    }

    updateLanguageSwitch() {
        const languageSwitch = document.getElementById('languageSwitch');
        if (languageSwitch) {
            // Update switch slider position and active states
            if (this.currentLang === 'cs') {
                languageSwitch.classList.add('cs');
            } else {
                languageSwitch.classList.remove('cs');
            }
            
            // Mark active language option
            const langOptions = languageSwitch.querySelectorAll('.lang-option');
            langOptions.forEach(option => {
                if (option.dataset.lang === this.currentLang) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
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
