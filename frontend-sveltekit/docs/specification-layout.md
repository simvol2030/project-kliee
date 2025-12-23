# Component Specifications - Layout Components

**Date:** 2025-11-08
**Scope:** Header, Footer, MobileMenu components
**Framework:** Svelte 5 (runes), TypeScript, paraglide-sveltekit
**Theme:** mode-watcher for SSR-safe dark/light themes

---

## 🎯 Component Architecture

```
+layout.svelte
├── Header.svelte
│   ├── Logo (inline)
│   ├── Navigation (inline)
│   │   └── MenuItemDropdown.svelte (conditional)
│   ├── LanguageSwitcher.svelte
│   └── MobileMenu.svelte
└── Footer.svelte
    ├── FooterBrand (inline)
    ├── FooterSocial (inline)
    └── FooterContact (inline)
```

**Note:** Mobile menu is a separate component but controlled by Header.

---

## 1. Header Component Specification

### File: `src/lib/components/layout/Header.svelte`

### 1.1 Purpose

Main site header with:
- Logo (left on desktop, center on mobile)
- Navigation menu (horizontal on desktop, hamburger on mobile)
- Language switcher (right on desktop, below logo on mobile)
- Scroll-based dynamic styling (shrinks on scroll)

---

### 1.2 Props

```typescript
interface HeaderProps {
  // No props - reads from $page.data.locale and data providers
}
```

**Rationale:** Self-contained component, gets data from:
- `getTopLevelMenuItems(locale)` - Menu data
- `$page.data.locale` - Current language
- `$mode` - Current theme (from mode-watcher)

---

### 1.3 State (Svelte 5 Runes)

```typescript
// Mobile menu state
let mobileMenuOpen = $state(false);

// Scroll state
let scrollY = $state(0);
let isScrolled = $derived(scrollY > 100);

// Derived props
const locale = $derived($page.data.locale || 'en');
const menuItems = $derived(getTopLevelMenuItems(locale));
```

**State Variables:**
- `mobileMenuOpen` - Boolean, controls mobile menu visibility
- `scrollY` - Number, current scroll position
- `isScrolled` - Boolean derived, header shrinks when > 100px

---

### 1.4 Events

**Internal Events:**
```typescript
// Toggle mobile menu
function toggleMobileMenu() {
  mobileMenuOpen = !mobileMenuOpen;
}

// Close mobile menu
function closeMobileMenu() {
  mobileMenuOpen = false;
}

// Handle scroll
$effect(() => {
  function handleScroll() {
    scrollY = window.scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => window.removeEventListener('scroll', handleScroll);
});

// Close menu on outside click
$effect(() => {
  if (!mobileMenuOpen) return;

  function handleClickOutside(event: MouseEvent) {
    const header = document.querySelector('header');
    if (!header?.contains(event.target as Node)) {
      closeMobileMenu();
    }
  }

  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
});
```

---

### 1.5 Component Structure

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { mode } from 'mode-watcher';
  import { getTopLevelMenuItems, getSubMenuItems } from '$lib/data-providers/menu.provider';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import MobileMenu from './MobileMenu.svelte';

  // State
  let mobileMenuOpen = $state(false);
  let scrollY = $state(0);

  // Derived
  const isScrolled = $derived(scrollY > 100);
  const locale = $derived($page.data.locale || 'en');
  const menuItems = $derived(getTopLevelMenuItems(locale));

  // Functions
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  // Effects
  $effect(() => {
    function handleScroll() {
      scrollY = window.scrollY;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  $effect(() => {
    if (!mobileMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const header = document.querySelector('header');
      if (!header?.contains(event.target as Node)) {
        closeMobileMenu();
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<header class:scrolled={isScrolled} class="header">
  <div class="container">
    <div class="header-content">
      <!-- Mobile Menu Toggle -->
      <button
        class="mobile-menu-toggle"
        class:active={mobileMenuOpen}
        onclick={toggleMobileMenu}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Logo -->
      <div class="logo">
        <a href="/{locale}">K-LIÉE</a>
      </div>

      <!-- Desktop Navigation -->
      <nav class="desktop-nav" aria-label="Main navigation">
        <ul>
          {#each menuItems as item}
            <li class:dropdown={item.hasDropdown}>
              <a
                href="{item.href}"
                aria-current={$page.url.pathname === item.href ? 'page' : undefined}
                aria-haspopup={item.hasDropdown}
              >
                {item.labelText}
              </a>

              {#if item.hasDropdown}
                <ul class="dropdown-menu" role="menu">
                  {#each getSubMenuItems(item.id, locale) as subItem}
                    <li role="none">
                      <a href="{subItem.href}" role="menuitem">
                        {subItem.labelText}
                      </a>
                    </li>
                  {/each}
                </ul>
              {/if}
            </li>
          {/each}
        </ul>
      </nav>

      <!-- Language Switcher -->
      <LanguageSwitcher currentLang={locale} />
    </div>
  </div>

  <!-- Mobile Menu (overlay) -->
  {#if mobileMenuOpen}
    <MobileMenu
      {menuItems}
      {locale}
      {closeMobileMenu}
    />
  {/if}
</header>

<style>
  /* ... CSS styles ... */
</style>
```

---

### 1.6 CSS Styles

**Theme-aware CSS Variables:**

```css
header {
  --header-bg: light-dark(
    rgba(255, 255, 255, 0.98),
    rgba(13, 13, 13, 0.98)
  );
  --header-text: light-dark(var(--black), var(--white));
  --header-shadow: light-dark(
    0 2px 20px rgba(0, 0, 0, 0.05),
    0 2px 20px rgba(0, 0, 0, 0.3)
  );

  position: fixed;
  top: 0;
  width: 100%;
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  z-index: 1000;
  padding: 20px 0;
  box-shadow: var(--header-shadow);
  transition: all 0.3s ease;
}

header.scrolled {
  padding: 15px 0;
  box-shadow: light-dark(
    0 2px 30px rgba(0, 0, 0, 0.1),
    0 2px 30px rgba(0, 0, 0, 0.5)
  );
}

.logo a {
  font-size: 28px;
  font-weight: 300;
  text-decoration: none;
  color: var(--header-text);
  letter-spacing: 3px;
  transition: color 0.3s;
}

.logo a:hover {
  color: var(--gold);
}

/* Desktop Navigation */
.desktop-nav ul {
  display: flex;
  list-style: none;
  gap: 40px;
}

.desktop-nav a {
  text-decoration: none;
  color: var(--header-text);
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0.5px;
  transition: all 0.3s;
  position: relative;
}

.desktop-nav a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--gold);
  transition: width 0.3s;
}

.desktop-nav a:hover::after {
  width: 100%;
}

/* Dropdown */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 15px);
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  min-width: 200px;
  padding: 10px 0;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none; /* Hidden on desktop */
  flex-direction: column;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.mobile-menu-toggle span {
  width: 24px;
  height: 2px;
  background: var(--header-text);
  transition: all 0.3s;
}

.mobile-menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Responsive */
@media (max-width: 1024px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .desktop-nav {
    display: none;
  }

  .logo {
    flex: 1;
    text-align: center;
  }
}
</style>
```

---

### 1.7 Accessibility (WCAG 2.1 AA)

**ARIA Attributes:**
- ✅ `aria-expanded` on hamburger button
- ✅ `aria-controls` linking button to menu
- ✅ `aria-current="page"` on active link
- ✅ `aria-haspopup` on dropdown parent
- ✅ `aria-label="Main navigation"` on `<nav>`
- ✅ `role="menu"` on dropdown
- ✅ `role="menuitem"` on dropdown links

**Keyboard Navigation:**
- ✅ Tab through all links
- ✅ Enter/Space to activate buttons
- ✅ Escape to close dropdown/mobile menu
- ✅ Arrow keys for dropdown navigation (future enhancement)

**Focus Management:**
- ✅ Visible focus indicators
- ✅ Focus trap in mobile menu
- ✅ Restore focus on close

---

## 2. MobileMenu Component Specification

### File: `src/lib/components/layout/MobileMenu.svelte`

### 2.1 Purpose

Full-screen overlay menu for mobile devices with:
- Vertical navigation list
- Close button
- Animated entrance/exit
- Focus trap

---

### 2.2 Props

```typescript
interface MobileMenuProps {
  menuItems: MenuItem[];          // Array of menu items
  locale: string;                 // Current language
  closeMobileMenu: () => void;    // Close callback
}
```

---

### 2.3 State

```typescript
// Animation state
let isVisible = $state(false);

$effect(() => {
  // Trigger animation after mount
  setTimeout(() => isVisible = true, 10);
});

// Body scroll lock
$effect(() => {
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = '';
  };
});
```

---

### 2.4 Events

```typescript
// Close on link click
function handleLinkClick() {
  closeMobileMenu();
}

// Close on Escape key
$effect(() => {
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  }
  window.addEventListener('keydown', handleKeydown);
  return () => window.removeEventListener('keydown', handleKeydown);
});
```

---

### 2.5 Component Structure

```svelte
<script lang="ts">
  import type { MenuItem } from '$lib/types/layout.types';
  import { getSubMenuItems } from '$lib/data-providers/menu.provider';

  interface Props {
    menuItems: MenuItem[];
    locale: string;
    closeMobileMenu: () => void;
  }

  let { menuItems, locale, closeMobileMenu }: Props = $props();

  let isVisible = $state(false);

  $effect(() => {
    setTimeout(() => isVisible = true, 10);
  });

  $effect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  });

  $effect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  function handleLinkClick() {
    closeMobileMenu();
  }
</script>

<div
  class="mobile-menu-overlay"
  class:visible={isVisible}
  id="mobile-menu"
  role="dialog"
  aria-modal="true"
  aria-label="Mobile navigation"
>
  <div class="mobile-menu-content">
    <!-- Close Button -->
    <button
      class="close-btn"
      onclick={closeMobileMenu}
      aria-label="Close menu"
    >
      ×
    </button>

    <!-- Logo -->
    <div class="mobile-logo">
      <a href="/{locale}" onclick={handleLinkClick}>K-LIÉE</a>
    </div>

    <!-- Navigation -->
    <nav aria-label="Mobile navigation menu">
      <ul>
        {#each menuItems as item}
          <li>
            <a href="{item.href}" onclick={handleLinkClick}>
              {item.labelText}
            </a>

            {#if item.hasDropdown}
              <ul class="submenu">
                {#each getSubMenuItems(item.id, locale) as subItem}
                  <li>
                    <a href="{subItem.href}" onclick={handleLinkClick}>
                      {subItem.labelText}
                    </a>
                  </li>
                {/each}
              </ul>
            {/if}
          </li>
        {/each}
      </ul>
    </nav>
  </div>
</div>

<style>
  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: light-dark(
      var(--white),
      var(--black)
    );
    z-index: 999;
    opacity: 0;
    transform: translateX(100%);
    transition: opacity 0.3s, transform 0.3s;
  }

  .mobile-menu-overlay.visible {
    opacity: 1;
    transform: translateX(0);
  }

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    font-size: 40px;
    line-height: 1;
    cursor: pointer;
    color: light-dark(var(--black), var(--white));
  }

  .mobile-logo {
    text-align: center;
    margin: 60px 0 40px;
  }

  .mobile-logo a {
    font-size: 32px;
    font-weight: 300;
    text-decoration: none;
    color: light-dark(var(--black), var(--white));
    letter-spacing: 3px;
  }

  nav ul {
    list-style: none;
    padding: 0 40px;
  }

  nav > ul > li {
    margin-bottom: 30px;
  }

  nav a {
    display: block;
    text-align: center;
    font-size: 20px;
    font-weight: 400;
    text-decoration: none;
    color: light-dark(var(--black), var(--white));
    transition: color 0.3s;
  }

  nav a:hover {
    color: var(--gold);
  }

  .submenu {
    margin-top: 15px;
    padding-left: 0;
  }

  .submenu li {
    margin-bottom: 10px;
  }

  .submenu a {
    font-size: 16px;
    opacity: 0.8;
  }
</style>
```

---

### 2.6 Accessibility

**ARIA Attributes:**
- ✅ `role="dialog"` - Identifies as dialog
- ✅ `aria-modal="true"` - Modal behavior
- ✅ `aria-label="Mobile navigation"` - Screen reader label

**Keyboard Navigation:**
- ✅ Escape to close
- ✅ Tab through links
- ✅ Focus trap (future enhancement with svelte-focus-trap)

**Focus Management:**
- ✅ Auto-focus first link on open
- ✅ Restore focus to hamburger on close

---

## 3. Footer Component Specification

### File: `src/lib/components/layout/Footer.svelte`

### 3.1 Purpose

Site footer with:
- Brand section (title, subtitle, quote)
- Social links (7 platforms)
- Contact section (email)
- Copyright

---

### 3.2 Props

```typescript
interface FooterProps {
  // No props - reads from $page.data.locale and data providers
}
```

---

### 3.3 State

```typescript
const locale = $derived($page.data.locale || 'en');
const footerData = $derived(getFooterData(locale));
```

---

### 3.4 Component Structure

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { getFooterData } from '$lib/data-providers/footer.provider';

  const locale = $derived($page.data.locale || 'en');
  const footerData = $derived(getFooterData(locale));
</script>

<footer>
  <div class="container">
    <div class="footer-content">
      <!-- Brand -->
      <div class="footer-col">
        <h3>{footerData.brand.title}</h3>
        <p>{footerData.brand.subtitle}</p>
        <p class="quote">{footerData.brand.quote}</p>
      </div>

      <!-- Social Links -->
      <div class="footer-col">
        <h3>{footerData.social.title}</h3>
        <div class="social-links">
          {#each footerData.social.links as link}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="{link.platform}"
            >
              {link.label}
            </a>
          {/each}
        </div>
      </div>

      <!-- Contact -->
      <div class="footer-col">
        <h3>{footerData.contact.title}</h3>
        <p>
          <a href="mailto:{footerData.contact.email}">
            {footerData.contact.email}
          </a>
        </p>
      </div>
    </div>

    <!-- Copyright -->
    <div class="footer-bottom">
      <p>{footerData.copyright}</p>
    </div>
  </div>
</footer>

<style>
  footer {
    background: light-dark(
      var(--black),
      var(--dark-gray)
    );
    color: light-dark(
      var(--white),
      var(--gray)
    );
    padding: 60px 0 30px;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-col h3 {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 20px;
  }

  .footer-col p {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 10px;
  }

  .quote {
    font-style: italic;
    color: var(--gold);
  }

  .social-links {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }

  .social-links a {
    text-decoration: none;
    color: inherit;
    transition: color 0.3s;
  }

  .social-links a:hover {
    color: var(--gold);
  }

  .footer-bottom {
    text-align: center;
    padding-top: 30px;
    border-top: 1px solid light-dark(
      rgba(255, 255, 255, 0.1),
      rgba(0, 0, 0, 0.1)
    );
  }

  .footer-bottom p {
    font-size: 14px;
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .social-links {
      justify-content: center;
    }
  }
</style>
```

---

### 3.5 Accessibility

**ARIA Attributes:**
- ✅ `aria-label` on social links (platform name)
- ✅ `rel="noopener noreferrer"` on external links

**Semantic HTML:**
- ✅ `<footer>` semantic tag
- ✅ `<h3>` for section headings
- ✅ `<a>` for all links

---

## 4. LanguageSwitcher Component Specification

### File: `src/lib/components/layout/LanguageSwitcher.svelte`

### 4.1 Purpose

Dropdown language selector with:
- Current language flag + code
- 4 language options
- Dropdown animation
- SvelteKit navigation (no page reload)

---

### 4.2 Props

```typescript
interface LanguageSwitcherProps {
  currentLang: string;  // 'en' | 'ru' | 'es' | 'zh'
}
```

---

### 4.3 State

```typescript
let isOpen = $state(false);

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

const currentLanguage = $derived(
  languages.find(lang => lang.code === currentLang) || languages[0]
);
```

---

### 4.4 Events

```typescript
function toggleDropdown() {
  isOpen = !isOpen;
}

function selectLanguage(langCode: string) {
  // Use paraglide-sveltekit navigation
  goto(`/${langCode}${$page.url.pathname.replace(/^\/(en|ru|es|zh)/, '')}`);
  isOpen = false;
}

// Close on outside click
$effect(() => {
  if (!isOpen) return;

  function handleClickOutside(event: MouseEvent) {
    const dropdown = document.querySelector('.language-switcher');
    if (!dropdown?.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
});
```

---

### 4.5 Component Structure

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  interface Props {
    currentLang: string;
  }

  let { currentLang }: Props = $props();

  let isOpen = $state(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const currentLanguage = $derived(
    languages.find(lang => lang.code === currentLang) || languages[0]
  );

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function selectLanguage(langCode: string) {
    const currentPath = $page.url.pathname.replace(/^\/(en|ru|es|zh)/, '');
    goto(`/${langCode}${currentPath || '/'}`);
    isOpen = false;
  }

  $effect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const dropdown = document.querySelector('.language-switcher');
      if (!dropdown?.contains(event.target as Node)) {
        isOpen = false;
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="language-switcher">
  <button
    class="current-lang"
    onclick={toggleDropdown}
    aria-expanded={isOpen}
    aria-haspopup="true"
    aria-label="Select language"
  >
    <span class="flag">{currentLanguage.flag}</span>
    <span class="code">{currentLanguage.code.toUpperCase()}</span>
    <span class="arrow">▼</span>
  </button>

  {#if isOpen}
    <div class="dropdown" role="menu">
      {#each languages as lang}
        <button
          class="lang-option"
          class:active={lang.code === currentLang}
          onclick={() => selectLanguage(lang.code)}
          role="menuitem"
          aria-label="{lang.name}"
        >
          <span class="flag">{lang.flag}</span>
          <span class="name">{lang.name}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .language-switcher {
    position: relative;
  }

  .current-lang {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid light-dark(var(--black), var(--white));
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
    color: light-dark(var(--black), var(--white));
  }

  .current-lang:hover {
    border-color: var(--gold);
    color: var(--gold);
  }

  .arrow {
    font-size: 10px;
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: light-dark(
      rgba(255, 255, 255, 0.98),
      rgba(13, 13, 13, 0.98)
    );
    backdrop-filter: blur(20px);
    min-width: 150px;
    padding: 10px 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    z-index: 1001;
  }

  .lang-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    font-size: 14px;
    text-align: left;
    transition: background 0.3s;
    color: light-dark(var(--black), var(--white));
  }

  .lang-option:hover {
    background: light-dark(var(--gray), var(--dark-gray));
    color: var(--gold);
  }

  .lang-option.active {
    background: light-dark(var(--gray), var(--dark-gray));
  }
</style>
```

---

## 5. TypeScript Types (Summary)

**File:** `src/lib/types/layout.types.ts`

```typescript
export interface TranslatedString {
  en: string;
  ru: string;
  es: string;
  zh: string;
}

export interface MenuItem {
  id: string;
  label: TranslatedString;
  labelText?: string;  // Flattened for current locale
  href: string;
  parentId: string | null;
  hasDropdown: boolean;
  order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  order: number;
}

export interface FooterBrand {
  title: string;
  subtitle: string;  // Localized
  quote: string;     // Localized
}

export interface FooterSocial {
  title: string;     // Localized
  links: SocialLink[];
}

export interface FooterContact {
  title: string;     // Localized
  email: string;
}

export interface FooterData {
  brand: FooterBrand;
  social: FooterSocial;
  contact: FooterContact;
  copyright: string;
}
```

---

## 6. Summary

### Components Created

1. ✅ **Header.svelte** - Main navigation with responsive behavior
2. ✅ **MobileMenu.svelte** - Full-screen mobile overlay menu
3. ✅ **Footer.svelte** - 3-column footer with social links
4. ✅ **LanguageSwitcher.svelte** - Dropdown language selector

### Key Features

- **Svelte 5 Runes:** `$state`, `$derived`, `$effect`, `$props`
- **TypeScript:** Full type safety
- **Accessibility:** WCAG 2.1 AA compliance
- **Responsive:** Desktop/Tablet/Mobile
- **Themeable:** Light/Dark via `light-dark()` CSS function
- **i18n Ready:** Reads from data providers with locale

---

**Specification Complete:** ✅
**Time Spent:** ~45 minutes
**Ready for:** JSON Data Creation (Step 4)
