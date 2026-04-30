**Made by AI**

# IndieTap Studio Website

Official website for IndieTap Studio — we build fun and useful mobile apps.

## 📁 Project structure

```
indietap-studio-site/
├── index.html              # Main page
├── about.html              # About us
├── contact.html            # Contact page
├── privacy.html            # Privacy policy
├── terms.html              # Terms of service
├── 404.html                # Custom 404 page
├── css/
│   └── styles.css          # All CSS styles
├── js/
│   ├── script.js           # Main JavaScript functionality
│   └── localization.js     # Localization and theme management
├── assets/
│   ├── icons/              # App icons
│   ├── locales/            # Language files (EN/CS)
│   └── policies/           # Plain-text legal documents
├── .htaccess               # Apache configuration
├── CNAME                   # Custom domain for GitHub Pages
└── README.md               # Documentation
```

## 🚀 Features

- **Responsive design** — works on every device (desktop, tablet, mobile)
- **Dual-language support** — full English/Czech localization
- **Dark/Light theme** — theme switching with anti-FOUC protection
- **Modern UI** — gradient designs, animations, floating effects
- **Custom 404 page** — animated error page with navigation
- **Real apps** — Couplefy, Clickoji, Push It. I Dare You. (live) plus upcoming titles
- **Performance optimized** — debounced events, lazy loading
- **SEO friendly** — semantic HTML, meta tags
- **Security headers** — XSS protection, content security

## 📱 Pages

1. **index.html** — Landing page with hero section and apps
2. **about.html** — About the IndieTap Studio team and mission
3. **contact.html** — Contact and support forms
4. **privacy.html** — Dynamically loaded privacy policy
5. **terms.html** — Dynamically loaded terms of service
6. **404.html** — Custom error page with animations

## 🛠️ Tech stack

- **HTML5** — semantic structure, ARIA accessibility
- **CSS3** — modern styling, gradients, animations, CSS variables
- **Vanilla JavaScript** — ES6+, theme management, localization
- **Google Fonts** — Inter font family for a modern look
- **SVG icons** — vector icons for crisp rendering
- **JSON localization** — structured language files

## 🌐 Deployment

### GitHub Pages (current hosting)
- Auto-deploys from the `main` branch
- Custom domain: `indietapstudio.eu`
- `404.html` is automatically served for missing pages

### Local run
```bash
# Python server
python -m http.server 8000

# Node.js serve
npx serve

# or just open index.html in your browser
```

## 🚫 Custom 404 page

- **GitHub Pages**: automatically active thanks to `404.html`
- **Apache hosting**: configured via `.htaccess`
- **Features**: animated floating icons, localized content, navigation buttons
- **Mobile friendly**: responsive design with touch-friendly buttons

## 📱 Responsive breakpoints

- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px – 1199px (reduced margins)
- **Mobile**: 480px – 767px (hamburger menu)
- **Small mobile**: < 480px (compact layout)

## 🎨 Design system

### Color palette
- **Light mode**:
  - Primary gradient: #8b5cf6 → #3b82f6
  - Background: #ffffff, #f8f9fa
  - Text: #1a1a1a, #666666
- **Dark mode**:
  - Primary gradient: #9333ea → #3b82f6
  - Background: #0f0f0f, #1a1a1a
  - Text: #ffffff, #cccccc

### Theme features
- **Auto-detection**: respects system preference
- **FOUC prevention**: inline scripts prevent theme flashing
- **Persistence**: `localStorage` saves the user's choice
- **Smooth transitions**: 0.3s ease transitions between themes

© 2025 IndieTap Studio. All rights reserved.
