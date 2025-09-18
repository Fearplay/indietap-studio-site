// Localization and Theme Management
class LocalizationManager {
    constructor() {
        // Default to English, override with saved preference if exists
        this.currentLang = localStorage.getItem('language') || 'en';
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.translations = {};
        this.initialized = false;
        this.languageChanging = false;
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
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                this.setLanguage(this.currentLang);
            }, 10);
            
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

        // Language toggle
        const languageToggle = document.getElementById('languageToggle');
        const languageDropdown = document.querySelector('.lang-dropdown');
        
        if (languageToggle && languageDropdown) {
            let hoverTimeout;
            let isClickToggled = false;
            
            // Toggle dropdown on click
            languageToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                clearTimeout(hoverTimeout);
                
                // Toggle the dropdown
                const isActive = languageToggle.classList.contains('active');
                if (isActive) {
                    languageToggle.classList.remove('active');
                    isClickToggled = false;
                } else {
                    languageToggle.classList.add('active');
                    isClickToggled = true;
                }
            });
            
            // Show dropdown on hover (only if not click-toggled closed)
            languageToggle.addEventListener('mouseenter', () => {
                if (!isClickToggled || languageToggle.classList.contains('active')) {
                    clearTimeout(hoverTimeout);
                    languageToggle.classList.add('active');
                }
            });
            
            // Hide dropdown on mouse leave with delay
            languageToggle.addEventListener('mouseleave', () => {
                if (!isClickToggled) {
                    hoverTimeout = setTimeout(() => {
                        languageToggle.classList.remove('active');
                    }, 300);
                }
            });
            
            // Keep dropdown open when hovering over it
            languageDropdown.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimeout);
            });
            
            languageDropdown.addEventListener('mouseleave', () => {
                if (!isClickToggled) {
                    hoverTimeout = setTimeout(() => {
                        languageToggle.classList.remove('active');
                    }, 300);
                }
            });
            
            // Handle language selection
            languageDropdown.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.target.dataset.lang && e.target.dataset.lang !== this.currentLang) {
                    this.setLanguage(e.target.dataset.lang);
                    languageToggle.classList.remove('active');
                    clearTimeout(hoverTimeout);
                    isClickToggled = false;
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!languageToggle.contains(e.target)) {
                    languageToggle.classList.remove('active');
                    clearTimeout(hoverTimeout);
                    isClickToggled = false;
                }
            });
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
