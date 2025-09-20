/**
 * Policy Content Loader - Loads privacy policies and terms of service
 * dynamically based on current language selection
 */

class PolicyLoader {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
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
            // English
            'Privacy Policy', 'Data Collection and Use', 'Locally Stored Data', 'Security', 
            'Changes', 'Effective Date', 'Your Consent', 'Contact',
            // Czech
            'Zásady ochrany osobních údajů', 'Shromažďování a používání údajů', 'Lokálně uložená data', 
            'Zabezpečení', 'Změny', 'Platnost zásad od', 'Souhlas uživatele', 'Kontakt'
        ];
        
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i].trim();
            const prevLine = i > 0 ? lines[i-1].trim() : '';
            const nextLine = i < lines.length - 1 ? lines[i+1].trim() : '';
            
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
                const bulletContent = trimmedLine.startsWith('• ') ? trimmedLine.substring(2) : trimmedLine.substring(2);
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
            const isStandaloneHeading = (prevLine === '' || i === 0) && (nextLine === '' || i === lines.length - 1);
            const isDate = trimmedLine.match(/^\d+\.\s+(ledna|února|března|dubna|května|června|července|srpna|září|října|listopadu|prosince)\s+\d{4}$/) || // Czech dates like "28. května 2025"
                          trimmedLine.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}$/) || // English dates like "May 28, 2025"
                          trimmedLine === '28. května 2025' || trimmedLine === 'May 28, 2025'; // Exact matches as fallback
            const looksLikeHeading = trimmedLine.length < 80 && 
                                   !trimmedLine.endsWith('.') && 
                                   !trimmedLine.includes('@') && 
                                   !trimmedLine.includes('http') &&
                                   !isDate; // Not a date
            
            if (isKnownHeadline || (isStandaloneHeading && looksLikeHeading && !isDate)) {
                html += `<h3>${trimmedLine}</h3>\n`;
            } else {
                // Support basic Markdown formatting (bold text with **)
                let formattedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
