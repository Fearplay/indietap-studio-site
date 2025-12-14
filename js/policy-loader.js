/**
 * Policy Content Loader - Loads privacy policies and terms of service
 * dynamically based on current language selection
 */

class PolicyLoader {
    constructor() {
        // Check URL parameters first, then localStorage, then default to 'en'
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');

        if (urlLang && (urlLang === 'en' || urlLang === 'cs')) {
            // If valid language in URL, use it and save to localStorage
            this.currentLanguage = urlLang;
            localStorage.setItem('language', urlLang);

            // Update the language selector if it exists
            setTimeout(() => {
                const langSelector = document.getElementById('languageSelector');
                if (langSelector) {
                    langSelector.value = urlLang;
                }
            }, 100);

            // Trigger language change event for other components
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: urlLang }
            }));
        } else {
            // No URL parameter or invalid, use localStorage or default
            this.currentLanguage = localStorage.getItem('language') || 'en';
        }

        this.init();

        // Listen for language changes
        window.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.loadPolicyContent();
        });
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadPolicyContent();
            });
        } else {
            this.loadPolicyContent();
        }
    }

    async loadPolicyContent() {
        const policyContainer = document.getElementById('privacy-content') || document.getElementById('terms-content');

        if (!policyContainer) {
            return; // No policy container found on this page
        }

        const isPrivacy = policyContainer.id === 'privacy-content';
        const enPath = policyContainer.getAttribute('data-policy-path');
        const csPath = policyContainer.getAttribute('data-policy-path-cs');

        if (!enPath || !csPath) {
            console.error('Policy paths not found in data attributes');
            return;
        }

        const policyPath = this.currentLanguage === 'cs' ? csPath : enPath;

        try {
            // Show loading message
            const loadingKey = isPrivacy ? 'privacy.loading' : 'terms.loading';
            policyContainer.innerHTML = `<p data-key="${loadingKey}">Loading...</p>`;

            // Apply current translations to loading message
            if (window.localizationManager) {
                window.localizationManager.updateTranslations();
            }

            const response = await fetch(policyPath);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content = await response.text();

            // Convert text content to HTML
            const htmlContent = this.formatPolicyContent(content);
            policyContainer.innerHTML = htmlContent;

        } catch (error) {
            console.error('Error loading policy content:', error);

            const errorMessage = this.currentLanguage === 'cs'
                ? 'Chyba při načítání obsahu. Zkuste to prosím znovu.'
                : 'Error loading content. Please try again.';

            policyContainer.innerHTML = `<p style="color: var(--error-color, #e53e3e);">${errorMessage}</p>`;
        }
    }

    formatPolicyContent(text) {
        // Split content by lines and format as HTML
        const lines = text.split('\n');
        let html = '';
        let inList = false;

        // Define known headlines for better detection
        const knownHeadlines = [
            // English - General
            'Privacy Policy', 'Data Collection and Use', 'Locally Stored Data', 'Security',
            'Changes', 'Effective Date', 'Your Consent', 'Contact', 'INTRODUCTION', 'Introduction',
            'Personal data collection', 'IP addresses and server processing', 'Third-party services – Google Fonts',
            'Children', 'DATA WE COLLECT', 'PURPOSES & LEGAL BASES (GDPR/UK GDPR)', 'YOUR CHOICES',
            'CHILDREN & TEENS', 'DATA RETENTION', 'SHARING & TRANSFERS', 'SECURITY', 'YOUR PRIVACY RIGHTS',
            'CALOPPA', 'INTERNATIONAL USERS', 'CHANGES', 'CONTACT',
            // Czech - General
            'Zásady ochrany osobních údajů', 'Shromažďování a používání údajů', 'Lokálně uložená data',
            'Zabezpečení', 'Změny', 'Platnost zásad od', 'Souhlas uživatele', 'Kontakt', 'ÚVOD', 'Úvod',
            'Shromažďování osobních údajů', 'IP adresy a serverové zpracování', 'Externí služby – Google Fonts',
            'Děti', 'Změny zásad', 'DATA, KTERÁ SHROMAŽĎUJEME', 'ÚČELY A PRÁVNÍ ZÁKLADY (GDPR/UK GDPR)',
            'VAŠE MOŽNOSTI', 'DĚTI A TEENAGEŘI', 'UCHOVÁVÁNÍ DAT', 'SDÍLENÍ A PŘENOSY', 'ZABEZPEČENÍ',
            'VAŠE PRÁVA NA OCHRANU SOUKROMÍ', 'MEZINÁRODNÍ UŽIVATELÉ', 'ZMĚNY', 'KONTAKT'
        ];

        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i].trim();
            const prevLine = i > 0 ? lines[i - 1].trim() : '';
            const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';

            if (!trimmedLine) {
                // Empty line
                if (inList) {
                    html += '</ul>\n';
                    inList = false;
                }
                continue; // Skip empty lines
            }

            // Check for bullet points (lines starting with • or -)
            if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>\n';
                    inList = true;
                }
                let bulletContent = trimmedLine.startsWith('• ') ? trimmedLine.substring(2) : trimmedLine.substring(2);

                // Support formatting in bullet points
                bulletContent = bulletContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                // Convert hidden links format [text](url) to clickable links
                const hasHiddenLinksInBullet = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/.test(bulletContent);
                bulletContent = bulletContent.replace(
                    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
                    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-link">$1</a>'
                );

                // Convert standalone URLs to clickable links (only if no hidden links present)
                if (!hasHiddenLinksInBullet) {
                    bulletContent = bulletContent.replace(
                        /(https?:\/\/[^\s]+)/g,
                        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-link">$1</a>'
                    );
                }

                html += `<li>${bulletContent}</li>\n`;
                continue;
            }

            // Close list if we're not in a bullet point
            if (inList) {
                html += '</ul>\n';
                inList = false;
            }

            // Check if this line is a known headline or looks like a standalone headline
            const isKnownHeadline = knownHeadlines.includes(trimmedLine);

            // Check if line is ALL CAPS (likely a section header)
            const isAllCaps = trimmedLine === trimmedLine.toUpperCase() &&
                trimmedLine.length > 3 &&
                /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s&()\/–-]+$/.test(trimmedLine);

            // Check if line follows empty line and is followed by empty line (standalone heading)
            const isStandaloneHeading = prevLine === '' && nextLine === '';

            // Check if it looks like a heading (short, no punctuation at end, no special chars)
            const looksLikeHeading = trimmedLine.length < 80 &&
                trimmedLine.length > 2 &&
                !trimmedLine.endsWith('.') &&
                !trimmedLine.endsWith(',') &&
                !trimmedLine.includes('@') &&
                !trimmedLine.includes('http') &&
                !trimmedLine.includes('[') &&
                !trimmedLine.includes('](') &&
                !trimmedLine.includes(':') &&
                !/^\d/.test(trimmedLine); // Doesn't start with a number

            if (isKnownHeadline || isAllCaps || (isStandaloneHeading && looksLikeHeading)) {
                html += `<h3>${trimmedLine}</h3>\n`;
            } else {
                // Support basic Markdown formatting (bold text with **)
                let formattedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                // Convert hidden links format [text](url) to clickable links
                const hasHiddenLinks = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/.test(formattedLine);
                formattedLine = formattedLine.replace(
                    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
                    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-link">$1</a>'
                );

                // Convert standalone URLs to clickable links (only if no hidden links present)
                if (!hasHiddenLinks) {
                    formattedLine = formattedLine.replace(
                        /(https?:\/\/[^\s]+)/g,
                        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-link">$1</a>'
                    );
                }

                html += `<p>${formattedLine}</p>\n`;
            }
        }

        // Close any open list
        if (inList) {
            html += '</ul>\n';
        }

        return html;
    }
}

// Initialize the policy loader when the script loads
const policyLoader = new PolicyLoader();
