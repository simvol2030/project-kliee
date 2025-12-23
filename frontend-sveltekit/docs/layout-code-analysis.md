# Layout Code Analysis - K-LIÉE Static Site

**Date:** 2025-11-08
**Source Files Analyzed:**
- `kliee-site-v1_2/index.html`
- `kliee-site-v1_2/js/mobile-menu.js`
- `kliee-site-v1_2/js/lang-switcher.js`
- Language variants: `/ru/`, `/es/`, `/zh/`

---

## 🎯 Executive Summary

The static K-LIÉE site uses:
- **Inline CSS** (in `<style>` tag) for header/footer
- **External CSS** (`css/main.css` - 9247 lines)
- **Vanilla JavaScript** (no frameworks) for mobile menu and language switching
- **Folder-based i18n** - separate HTML files per language
- **CSS Variables** for theming (but only light theme implemented)

---

## 1. Header Component - HTML Structure

### 1.1 Desktop Header

```html
<header>
    <div class="container">
        <div class="header-content">
            <!-- Mobile Menu Toggle (hidden on desktop) -->
            <button class="mobile-menu-toggle" aria-label="Open menu">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <!-- Logo -->
            <div class="logo">
                <a href="index.html">K-LIÉE</a>
            </div>

            <!-- Navigation -->
            <nav>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="about.html">About</a></li>
                    <li class="dropdown">
                        <a href="works.html">Works</a>
                        <ul class="dropdown-menu">
                            <li><a href="works/chebu-rasha.html">CHEBU-RASHA</a></li>
                            <li><a href="works/last-supper.html">THE LAST SUPPER</a></li>
                            <li><a href="works/sbsa.html">SBSA</a></li>
                            <li><a href="works/the-bull.html">THE BULL</a></li>
                            <li><a href="works/hotel-series.html">Hotel Series</a></li>
                            <li><a href="works/sculptures.html">Sculptures</a></li>
                            <li><a href="works/porcelain.html">Porcelain</a></li>
                        </ul>
                    </li>
                    <li><a href="exhibitions.html">Exhibitions</a></li>
                    <li><a href="nft.html">NFT</a></li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>
            </nav>

            <!-- Language Switcher -->
            <div class="language-switcher">
                <select onchange="switchLanguage(this.value)">
                    <option value="en">EN</option>
                    <option value="es">ES</option>
                    <option value="ru">RU</option>
                    <option value="zh">中文</option>
                </select>
            </div>
        </div>
    </div>
</header>
```

**Key Observations:**
- `<button class="mobile-menu-toggle">` - 3 `<span>` elements for hamburger icon
- `<nav>` with `<ul>` - same structure used for Desktop and Mobile
- `Works` has `class="dropdown"` - submenu with 7 items
- Language switcher is `<select>` (replaced by JS to dropdown with flags)

---

### 1.2 Multilingual Menu Items

| Page | EN | RU | ES | ZH |
|------|----|----|----|----|
| **Home** | Home | Главная | Inicio | 首页 |
| **About** | About | О художнике | Acerca de | 关于 |
| **Works** | Works | Работы | Obras | 作品 |
| **Exhibitions** | Exhibitions | *(missing in code)* | *(missing in code)* | *(missing in code)* |
| **NFT** | NFT | NFT | NFT | NFT |
| **Contact** | Contact | Контакты | Contacto | 联系 |

**Works Submenu (7 items):**
- EN: CHEBU-RASHA, THE LAST SUPPER, SBSA, THE BULL, Hotel Series, Sculptures, Porcelain
- RU: ЧЕБУ-РАША, ТАЙНАЯ ВЕЧЕРЯ, ЧУЖОЙ БУДУАР ЧУЖАЯ БОЙНЯ, БЫК, Серия Отель, Скульптуры, Фарфор
- ES: CHEBU-RASHA, LA ÚLTIMA CENA, SBSA, EL TORO, Serie Hotel, Esculturas, Porcelana
- ZH: 切布拉什卡, 最后的晚餐, 某人的闺房某人的屠宰场, 公牛, 酒店系列, 雕塑, 瓷器

**Note:** "Exhibitions" missing in RU/ES/ZH nav (but exists in browser snapshot) - may need verification.

---

## 2. Header Component - CSS Styles

### 2.1 CSS Variables (Root)

```css
:root {
    --white: #FFFFFF;
    --black: #000000;
    --gold: #D4AF37;
    --red: #DC143C;
    --gray: #F5F5F5;
    --dark-gray: #333333;
}
```

**Usage:**
- `--white` - Header background, text (light theme)
- `--black` - Text color, borders
- `--gold` - Accent (hover states, logo hover, underlines)
- `--red` - (Used in hero section, not in header)
- `--gray` - Background for dropdown hover
- `--dark-gray` - (Not used in visible styles)

**Missing:** No dark theme variables defined.

---

### 2.2 Header Styles

```css
header {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.98);  /* Semi-transparent white */
    backdrop-filter: blur(20px);            /* Glassmorphism effect */
    z-index: 1000;
    padding: 20px 0;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}
```

**JavaScript Enhancement:**
```javascript
// Header scroll effect (inline in HTML)
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.padding = '15px 0';         // Smaller on scroll
        header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.padding = '20px 0';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
    }
});
```

**Features:**
- Fixed positioning (sticky header)
- Glassmorphism (backdrop-filter blur)
- Semi-transparent background
- Dynamic padding on scroll
- Smooth transitions (0.3s)

---

### 2.3 Logo Styles

```css
.logo a {
    font-size: 28px;
    font-weight: 300;               /* Light weight */
    text-decoration: none;
    color: var(--black);
    letter-spacing: 3px;            /* Spaced lettering */
    transition: color 0.3s;
}

.logo a:hover {
    color: var(--gold);             /* Gold on hover */
}
```

**Typography:**
- Font: Inherited from body (likely 'Playfair Display' for display text or 'Inter')
- Size: 28px
- Weight: 300 (Light)
- Spacing: 3px letter-spacing
- Hover: Gold color

---

### 2.4 Navigation Styles

```css
nav ul {
    display: flex;
    list-style: none;
    gap: 40px;                      /* 40px between items */
}

nav a {
    text-decoration: none;
    color: var(--black);
    font-size: 15px;
    font-weight: 400;
    letter-spacing: 0.5px;
    transition: all 0.3s;
    position: relative;
}

/* Hover underline animation */
nav a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--gold);
    transition: width 0.3s;
}

nav a:hover::after {
    width: 100%;                    /* Underline grows on hover */
}
```

**Features:**
- Flexbox layout with 40px gaps
- Animated gold underline on hover
- Clean, minimal typography
- Smooth transitions

---

### 2.5 Dropdown Menu (Works Submenu)

```css
.dropdown {
    position: relative;
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 15px);
    left: 50%;
    transform: translateX(-50%) translateY(-10px);  /* Centered */
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    min-width: 200px;
    padding: 10px 0;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    display: flex;
    flex-direction: column;
}

.dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);      /* Slide down */
}

.dropdown-menu a {
    display: block;
    padding: 10px 20px;
    font-size: 14px;
}

.dropdown-menu a::after {
    display: none;                                  /* No underline */
}

.dropdown-menu a:hover {
    background: var(--gray);
    color: var(--gold);
}
```

**Features:**
- Appears on hover
- Centered below parent
- Slide-down animation (translateY)
- Glassmorphism (backdrop-filter)
- Gray background on item hover

---

### 2.6 Language Switcher Styles

```css
.language-switcher select {
    background: transparent;
    border: 1px solid var(--black);
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
}

.language-switcher select:hover {
    border-color: var(--gold);
    color: var(--gold);
}
```

**Note:** This `<select>` is **replaced by JavaScript** with a custom dropdown (see Section 4.2).

---

### 2.7 Mobile Menu Toggle (Hamburger)

**CSS (assumed from browser behavior):**
- Hidden on Desktop (likely `display: none` above certain breakpoint)
- Visible on Mobile
- 3 `<span>` elements styled as horizontal lines
- Animates to "X" on `.active` class (likely)

**Breakdown assumed:**
```css
/* Assumed mobile menu toggle styles (not in provided code) */
.mobile-menu-toggle {
    display: none;  /* Hidden on desktop */
    /* ... hamburger icon styles */
}

@media (max-width: 1024px) {
    .mobile-menu-toggle {
        display: block;
    }

    nav ul {
        /* Mobile menu styles */
        position: fixed;
        top: 0;
        right: -100%;           /* Off-screen */
        height: 100vh;
        width: 300px;          /* Or 100% */
        background: white;
        transition: right 0.3s;
    }

    nav ul.active {
        right: 0;              /* Slide in */
    }
}
```

**Note:** Exact mobile styles need to be extracted from `main.css` (9247 lines).

---

## 3. Footer Component - HTML Structure

```html
<footer>
    <div class="container">
        <div class="footer-content">
            <!-- Column 1: Brand -->
            <div class="footer-col">
                <h3>Svetlana K-Liée</h3>
                <p>Contemporary Artist</p>
                <p>"I am the Artist - This is my Vision"</p>
            </div>

            <!-- Column 2: Social Links -->
            <div class="footer-col">
                <h3>Follow</h3>
                <div class="social-links">
                    <a href="https://instagram.com/Official.k.liee" target="_blank">IG</a>
                    <a href="https://instagram.com/svetlana.k.liee" target="_blank">
                        IG<span style="font-size: 10px; vertical-align: super;">RU</span>
                    </a>
                    <a href="https://t.me/SvetlanaKliee" target="_blank">TG</a>
                    <a href="https://www.youtube.com/@SvetlanaKLiee" target="_blank">YT</a>
                    <a href="https://uk.pinterest.com/svetaklie/_profile/" target="_blank">PIN</a>
                    <a href="https://www.tiktok.com/@svetlanakliee_art" target="_blank">TT</a>
                    <a href="https://opensea.io/collection/k-lieesculptures" target="_blank">OS</a>
                </div>
            </div>

            <!-- Column 3: Contact -->
            <div class="footer-col">
                <h3>Contact</h3>
                <p><a href="mailto:info@k-lie.com">info@k-lie.com</a></p>
            </div>
        </div>

        <!-- Copyright -->
        <div class="footer-bottom">
            <p>&copy; 2025 K-LIÉE. All rights reserved.</p>
        </div>
    </div>
</footer>
```

### 3.1 Social Links (7 platforms)

| Code | Platform | URL |
|------|----------|-----|
| **IG** | Instagram (English) | `https://instagram.com/Official.k.liee` |
| **IG RU** | Instagram (Russian) | `https://instagram.com/svetlana.k.liee` |
| **TG** | Telegram | `https://t.me/SvetlanaKliee` |
| **YT** | YouTube | `https://www.youtube.com/@SvetlanaKLiee` |
| **PIN** | Pinterest | `https://uk.pinterest.com/svetaklie/_profile/` |
| **TT** | TikTok | `https://www.tiktok.com/@svetlanakliee_art` |
| **OS** | OpenSea (NFT) | `https://opensea.io/collection/k-lieesculptures` |

**Note:** Instagram has 2 accounts (EN and RU versions).

---

### 3.2 Multilingual Footer Content

| Section | EN | RU | ES | ZH |
|---------|----|----|----|----|
| **Brand Title** | Svetlana K-Liée | Svetlana K-Liée | Svetlana K-Liée | Svetlana K-Liée |
| **Subtitle** | Contemporary Artist | Современный художник | Artista Contemporánea | 当代艺术家 |
| **Quote** | "I am the Artist - This is my Vision" | "Я художник - это моё видение" | "Soy la Artista - Esta es mi Visión" | "我是艺术家 - 这是我的愿景" |
| **Social Header** | Follow | Подписаться | Seguir | 关注 |
| **Contact Header** | Contact | Контакты | Contacto | 联系 |

**Copyright:** Same in all languages - `© 2025 K-LIÉE. All rights reserved.`

---

## 4. JavaScript Functionality

### 4.1 Mobile Menu - `js/mobile-menu.js`

**Full Code:**
```javascript
// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('nav ul');

    if (mobileMenuToggle && navList) {
        // Toggle menu on button click
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navList.classList.toggle('active');
            this.classList.toggle('active');
        });

        // Close menu when clicking outside header
        document.addEventListener('click', function(event) {
            if (!event.target.closest('header')) {
                navList.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });

        // Close menu when clicking on a link
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navList.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });
    }
});
```

**Behavior:**
1. **Open:** Click `.mobile-menu-toggle` → Add `.active` to `nav ul` and button
2. **Close on outside click:** Click outside `<header>` → Remove `.active`
3. **Close on link click:** Click any `<a>` inside menu → Remove `.active`
4. **Same nav for Desktop/Mobile** - CSS controls visibility

**Implications for Svelte:**
- Need reactive `mobileMenuOpen` state ($state)
- Toggle function
- Click outside handler
- Close on navigation

---

### 4.2 Language Switcher - `js/lang-switcher.js`

**Core Function:**
```javascript
function switchLanguage(targetLang) {
    // Get current language from URL
    let currentPath = window.location.pathname;
    let currentLang = 'en';

    if (currentPath.includes('/ru/')) currentLang = 'ru';
    else if (currentPath.includes('/es/')) currentLang = 'es';
    else if (currentPath.includes('/zh/')) currentLang = 'zh';

    // Don't switch if already on target
    if (currentLang === targetLang) return;

    // Build new URL
    // EN (default): /index.html
    // RU: /ru/index.html
    // ES: /es/index.html
    // ZH: /zh/index.html

    // ... (code builds newUrl based on targetLang)

    window.location.href = newUrl;
}
```

**Dynamic Dropdown Creation:**
```javascript
// Replaces <select> with custom dropdown
langSwitcherDiv.innerHTML = `
    <div class="language-selector">
        <button class="current-lang" aria-label="Select language">
            <span class="lang-flag">${currentFlag}</span>
            <span class="lang-code">${currentLangCode}</span>
            <i class="fas fa-chevron-down"></i>
        </button>
        <div class="language-menu">
            <button class="language-option" data-lang="en" onclick="switchLanguage('en')">
                <span class="lang-flag">🇬🇧</span>
                <span class="lang-name">English</span>
            </button>
            <button class="language-option" data-lang="ru" onclick="switchLanguage('ru')">
                <span class="lang-flag">🇷🇺</span>
                <span class="lang-name">Русский</span>
            </button>
            <button class="language-option" data-lang="es" onclick="switchLanguage('es')">
                <span class="lang-flag">🇪🇸</span>
                <span class="lang-name">Español</span>
            </button>
            <button class="language-option" data-lang="zh" onclick="switchLanguage('zh')">
                <span class="lang-flag">🇨🇳</span>
                <span class="lang-name">中文</span>
            </button>
        </div>
    </div>
`;
```

**Language Flags:**
- EN: 🇬🇧 (UK flag)
- RU: 🇷🇺 (Russia flag)
- ES: 🇪🇸 (Spain flag)
- ZH: 🇨🇳 (China flag)

**Behavior:**
1. Detects current language from URL path
2. Dynamically replaces `<select>` with custom dropdown
3. Shows current flag + code
4. Switches via URL navigation (full page reload)

**Implications for SvelteKit:**
- Use `paraglide-sveltekit` for routing (`/en`, `/ru`, `/es`, `/zh`)
- No page reload needed
- Reactive current language
- No dynamic HTML generation (use Svelte components)

---

## 5. Typography System

### 5.1 Fonts

**Loaded from Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet">
```

**Font Stack:**
- **Body:** `'Inter', -apple-system, sans-serif`
- **Display (Logo?):** Likely `'Playfair Display'` (serif for artistic feel)

**Weights used:**
- Inter: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold)
- Playfair Display: Regular, Italic

---

### 5.2 Font Sizes

| Element | Size | Weight |
|---------|------|--------|
| **Logo** | 28px | 300 (Light) |
| **Nav Links** | 15px | 400 (Regular) |
| **Dropdown Items** | 14px | 400 |
| **Language Switcher** | 14px | 400 |
| **Footer H3** | ~18-20px (assumed) | 500-600 |
| **Footer Text** | ~14-16px (assumed) | 400 |

---

## 6. Responsive Breakpoints

**Observed behavior (from browser testing):**
- **Desktop:** ≥1024px (horizontal nav, no hamburger)
- **Mobile:** <1024px (hamburger menu, centered logo)

**Specific widths tested:**
- Desktop: 1920px ✅
- Tablet: ~768px (assumed)
- Mobile: 375px ✅

**Changes on Mobile:**
- Logo: Left → Center
- Nav: Horizontal → Hidden (hamburger)
- Hamburger button: Hidden → Visible (right side)
- Language switcher: Moves below logo

---

## 7. Accessibility Features

### 7.1 Semantic HTML

✅ **Good:**
- `<header>` - Semantic header tag
- `<nav>` - Semantic navigation
- `<footer>` - Semantic footer
- `<button>` - Proper button for hamburger
- `aria-label="Open menu"` - Screen reader label

### 7.2 Keyboard Navigation

**Assumed (need to verify):**
- Tab through nav links ✅
- Tab through dropdown items ✅
- Escape to close dropdown (?)
- Enter/Space to activate buttons ✅

### 7.3 ARIA Attributes

**Currently implemented:**
- `aria-label="Open menu"` on mobile toggle

**Missing (need to add in Svelte):**
- `aria-expanded` on mobile menu button
- `aria-controls` linking button to menu
- `aria-current="page"` on active link
- `aria-haspopup` on Works dropdown
- Focus trap in mobile menu

---

## 8. Key Findings for Migration

### 8.1 What Works Well

✅ **Reusable Patterns:**
- CSS Variables system (just needs dark theme)
- Semantic HTML structure
- Clean separation of concerns

✅ **Good UX:**
- Smooth transitions (0.3s)
- Hover states with visual feedback
- Mobile-first considerations

✅ **Accessibility:**
- Semantic HTML
- ARIA labels present (though incomplete)

---

### 8.2 What Needs Improvement

❌ **Issues to Fix:**
1. **No Dark Theme** - Only light theme variables defined
2. **Duplicated HTML** - 4 separate HTML files per language
3. **Full Page Reload** - Language switch reloads entire page
4. **Inline JS** - Header scroll effect in HTML
5. **Dynamic HTML** - Language switcher generated via JS (not SEO-friendly)
6. **Large CSS File** - 9247 lines in one file
7. **No Build Process** - No minification, no tree-shaking
8. **Missing ARIA** - Incomplete accessibility attributes

---

## 9. Migration Strategy

### 9.1 Header.svelte Component

**Convert to:**
```svelte
<script lang="ts">
    import { page } from '$app/stores';

    let mobileMenuOpen = $state(false);

    // ... logic
</script>

<header class:scrolled={scrollY > 100}>
    <div class="container">
        <div class="header-content">
            <button
                class="mobile-menu-toggle"
                class:active={mobileMenuOpen}
                onclick={() => mobileMenuOpen = !mobileMenuOpen}
                aria-expanded={mobileMenuOpen}
                aria-label="Open menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div class="logo">
                <a href="/">K-LIÉE</a>
            </div>

            <nav>
                <ul class:active={mobileMenuOpen}>
                    {#each menuItems as item}
                        <li>
                            <a href={item.href} aria-current={$page.url.pathname === item.href ? 'page' : undefined}>
                                {item.label[$page.data.locale]}
                            </a>
                        </li>
                    {/each}
                </ul>
            </nav>

            <LanguageSwitcher currentLang={$page.data.locale} />
        </div>
    </div>
</header>
```

**Key Changes:**
- Use `$state` rune instead of class toggling
- Use `$page.data.locale` for current language
- Centralized menu data (JSON)
- No inline styles
- Proper ARIA attributes

---

### 9.2 Footer.svelte Component

**Convert to:**
```svelte
<script lang="ts">
    import { page } from '$app/stores';
    import type { FooterData } from '$lib/types/layout.types';

    let footerData: FooterData;
</script>

<footer>
    <div class="container">
        <div class="footer-content">
            <div class="footer-col">
                <h3>{footerData.brand.title}</h3>
                <p>{footerData.brand.subtitle[$page.data.locale]}</p>
                <p>{footerData.brand.quote[$page.data.locale]}</p>
            </div>

            <div class="footer-col">
                <h3>{footerData.social.title[$page.data.locale]}</h3>
                <div class="social-links">
                    {#each footerData.social.links as link}
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.label}
                        </a>
                    {/each}
                </div>
            </div>

            <div class="footer-col">
                <h3>{footerData.contact.title[$page.data.locale]}</h3>
                <p><a href="mailto:{footerData.contact.email}">{footerData.contact.email}</a></p>
            </div>
        </div>

        <div class="footer-bottom">
            <p>{footerData.copyright}</p>
        </div>
    </div>
</footer>
```

**Key Changes:**
- Data-driven (JSON)
- Reactive to locale changes
- TypeScript types
- Clean component structure

---

### 9.3 CSS Migration

**Strategy:**
1. **Extract CSS Variables** - Create complete light/dark theme sets
2. **Modular CSS** - Split into:
   - `app.css` - Global + CSS Variables
   - `Header.svelte` - Component-scoped styles
   - `Footer.svelte` - Component-scoped styles
3. **Use Svelte CSS** - Scoped by default
4. **PostCSS** - Autoprefixer, minification

---

## 10. Next Steps

✅ **Step 2: Code Analysis - COMPLETE**

⏭️ **Step 2.5: Data Structure Design**
- Design JSON structure for Menu items (with 4 languages)
- Design JSON structure for Footer content
- Define TypeScript types

⏭️ **Step 3: Specification**
- Create detailed component specs
- Define props, state, events
- Document accessibility requirements

---

**Analysis Complete:** ✅
**Time Spent:** ~40 minutes
**Ready for:** Data Structure Design (Step 2.5)
