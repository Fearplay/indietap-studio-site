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
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (!trimmedLine) {
                // Empty line
                if (inList) {
                    html += '</ul>\n';
                    inList = false;
                }
                continue; // Skip empty lines instead of adding <br>
            }
            
            // Check for main headings (all caps lines that are likely section headers)
            if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 5 && /^[A-Z\s&]+$/.test(trimmedLine)) {
                if (inList) {
                    html += '</ul>\n';
                    inList = false;
                }
                html += `<h2>${trimmedLine}</h2>\n`;
                continue;
            }
            
            // Check for list items (lines starting with -)
            if (trimmedLine.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>\n';
                    inList = true;
                }
                html += `<li>${trimmedLine.substring(2)}</li>\n`;
                continue;
            }
            
            // Regular paragraph
            if (inList) {
                html += '</ul>\n';
                inList = false;
            }
            
            // Check for subheadings - lines that don't end with punctuation and are relatively short
            if (trimmedLine.length < 60 && !trimmedLine.endsWith('.') && !trimmedLine.endsWith(':') && 
                !trimmedLine.includes('IndieTap Studio') && !trimmedLine.includes('email') && 
                !trimmedLine.includes('@') && !trimmedLine.includes('http')) {
                
                // Additional check to see if it looks like a heading
                const words = trimmedLine.split(' ');
                const hasCapitalizedWords = words.filter(word => word[0] && word[0] === word[0].toUpperCase()).length >= words.length / 2;
                
                if (hasCapitalizedWords && trimmedLine.length > 8) {
                    html += `<h3>${trimmedLine}</h3>\n`;
                } else {
                    html += `<p>${trimmedLine}</p>\n`;
                }
            } else {
                html += `<p>${trimmedLine}</p>\n`;
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
