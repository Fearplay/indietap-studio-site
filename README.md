**Made by AI**

# IndieTap Studio Website

Officiální webová stránka pro IndieTap Studio - tvoříme zábavné a užitečné mobilní aplikace.

## 📁 Struktura projektu

```
indietap-studio-site/
├── index.html              # Hlavní stránka
├── about.html              # O nás
├── contact.html            # Kontaktní stránka
├── privacy.html            # Ochrana soukromí
├── terms.html              # Podmínky použití
├── 404.html                # Custom 404 stránka
├── css/
│   └── styles.css          # Všechny CSS styly
├── js/
│   ├── script.js           # Hlavní JavaScript funkcionalita
│   └── localization.js     # Lokalizace a theme management
├── assets/
│   ├── icons/              # Ikony aplikací
│   ├── locales/            # Jazykové soubory (EN/CS)
│   └── policies/           # Textové soubory s právními dokumenty
├── .htaccess               # Apache konfigurace
├── CNAME                   # Custom doména pro GitHub Pages
└── README.md               # Dokumentace
```

## 🚀 Funkce

- **Responzivní design** - funguje na všech zařízeních (desktop, tablet, mobil)
- **Dual-language support** - English/Czech s plnou lokalizací
- **Dark/Light theme** - přepínání témat s anti-FOUC ochranou
- **Moderní UI** - gradientové designy, animace, floating efekty
- **Custom 404 stránka** - animovaná error stránka s navigací
- **Real aplikace** - Couplefy (live) + TapJoy (coming soon)
- **Performance optimized** - debounced events, lazy loading
- **SEO friendly** - sémantické HTML, meta tagy
- **Security headers** - XSS protection, content security

## 📱 Stránky

1. **index.html** - Úvodní stránka s hero sekcí a aplikacemi
2. **about.html** - O týmu a misi IndieTap Studio
3. **contact.html** - Kontaktní formuláře a podpory
4. **privacy.html** - Dynamicky načítaná ochrana soukromí
5. **terms.html** - Dynamicky načítané podmínky použití
6. **404.html** - Custom error stránka s animacemi

## 🛠️ Použité technologie

- **HTML5** - sémantická struktura, ARIA accessibility
- **CSS3** - moderní styling, gradients, animations, CSS variables
- **Vanilla JavaScript** - ES6+, theme management, localization
- **Google Fonts** - Inter font family pro moderní vzhled
- **SVG ikony** - vektorové ikony pro crisp zobrazení
- **JSON lokalizace** - strukturované jazykové soubory

## 🌐 Deployment

### GitHub Pages (současný hosting)
- Automaticky se nasazuje z main branche
- Custom doména: `indietapstudio.eu`
- 404.html se automaticky aktivuje pro neexistující stránky

### Lokální spuštění
```bash
# Python server
python -m http.server 8000

# Node.js serve
npx serve

# nebo jednoduše otevřete index.html v prohlížeči
```

## 🚫 Custom 404 Page

- **GitHub Pages**: Automaticky aktivní díky `404.html`
- **Apache hosting**: Konfigurovano přes `.htaccess`
- **Features**: Animované floating ikony, localized content, navigation buttons
- **Mobile friendly**: Responzivní design s touch-friendly buttons

## 📱 Responzivní breakpointy

- **Desktop**: 1200px+ (plný layout)
- **Tablet**: 768px - 1199px (zmenšené marginy)
- **Mobile**: 480px - 767px (hamburger menu)
- **Small Mobile**: < 480px (kompaktní layout)

## 🎨 Design System

### Barevná paleta
- **Light mode**: 
  - Primary gradient: #8b5cf6 → #3b82f6
  - Background: #ffffff, #f8f9fa
  - Text: #1a1a1a, #666666
- **Dark mode**:
  - Primary gradient: #9333ea → #3b82f6  
  - Background: #0f0f0f, #1a1a1a
  - Text: #ffffff, #cccccc

### Theme Features
- **Auto-detection**: Respects system preference
- **FOUC Prevention**: Inline scripts prevent theme flashing
- **Persistence**: localStorage saves user choice
- **Smooth transitions**: 0.3s ease transitions between themes

© 2025 IndieTap Studio. All rights reserved.
