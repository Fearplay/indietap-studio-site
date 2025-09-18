// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    initializeTabs();
    
    // Mobile menu functionality
    initializeMobileMenu();
    
    // Smooth scrolling for navigation links
    initializeSmoothScrolling();
    
    // Add scroll effect to header
    initializeScrollHeader();
});

// Tab Functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Mobile Menu Functionality
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navigation = document.querySelector('.navigation');
    
    if (mobileToggle && navigation) {
        mobileToggle.addEventListener('click', function() {
            navigation.classList.toggle('mobile-active');
            this.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Only prevent default for hash links, not external links
                if (this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                }
                navigation.classList.remove('mobile-active');
                mobileToggle.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside (but not on controls)
        document.addEventListener('click', function(e) {
            const controls = document.querySelector('.controls');
            const languageSwitch = document.querySelector('.language-switch');
            const isControlsClick = controls && controls.contains(e.target);
            const isLanguageSwitchClick = languageSwitch && languageSwitch.contains(e.target);
            
            // Don't close mobile menu if clicking on controls or language switch
            if (!navigation.contains(e.target) && !mobileToggle.contains(e.target) && !isControlsClick && !isLanguageSwitchClick) {
                navigation.classList.remove('mobile-active');
                mobileToggle.classList.remove('active');
            }
        });
    }
}

// Smooth Scrolling for Navigation Links
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            // Check if we're on a different page and need to navigate to index.html
            if ((targetId === '#apps' || targetId === '#hero') && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                window.location.href = 'index.html' + targetId;
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            } else if (targetId === '#apps') {
                // For Apps & Games, scroll to hero section (not the actual apps section at bottom)
                const heroSection = document.querySelector('.hero');
                if (heroSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = heroSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                } else {
                    // Fallback to top if no hero section found
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Header Scroll Effect
function initializeScrollHeader() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow when scrolled
        if (scrollTop > 10) {
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Mobile menu styles are now in CSS file

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationDelay = '0.2s';
            entry.target.style.animationFillMode = 'both';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.app-card, .tab-content');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// Add loading state management
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll events
const debouncedScrollHandler = debounce(function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.querySelector('.header');
    
    if (scrollTop > 10) {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);
