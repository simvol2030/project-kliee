<script lang="ts">
  import { page } from '$app/stores';
  import { toggleMode, mode } from 'mode-watcher';
  import { currentTranslations } from '$lib/i18n';
  import type { LanguageCode } from '$lib/types/layout.types';
  import type { CurrencyRate } from '$lib/utils/currency';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import CartDropdown from '$lib/components/shop/CartDropdown.svelte';
  import WishlistIcon from '$lib/components/shop/WishlistIcon.svelte';

  // Menu item interface (from DB)
  interface DbMenuItem {
    id: string;
    href: string;
    label: { en: string; ru: string; es: string; zh: string };
    hasDropdown: boolean;
    parentId: string | null;
    order: number;
    icon: string | null;
    children?: DbMenuItem[];
  }

  // Props from parent
  interface Props {
    mobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    currencyRates?: CurrencyRate[];
  }

  let { mobileMenuOpen, toggleMobileMenu, currencyRates = [] }: Props = $props();

  // State
  let scrollY = $state(0);

  // Derived values
  const isScrolled = $derived(scrollY > 100);
  const locale = $derived(($page.data.locale as LanguageCode) || 'en');

  // Get menu items from page data (loaded from DB in +layout.server.ts)
  const dbMenuItems = $derived(($page.data.menuItems as DbMenuItem[]) || []);

  // Create translated menu items from DB data
  const menuItems = $derived(
    dbMenuItems.map(item => ({
      ...item,
      labelText: $currentTranslations[`menu.${item.id}`] || item.label[locale] || item.label.en
    }))
  );

  /**
   * Track scroll position for sticky header effect
   */
  $effect(() => {
    function handleScroll() {
      scrollY = window.scrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  /**
   * Toggle theme using mode-watcher
   */
  function toggleTheme() {
    toggleMode();
  }
</script>

<header class="header" class:scrolled={isScrolled}>
  <div class="container">
    <div class="header-content">
      <!-- Logo (left on mobile, left on desktop) -->
      <div class="logo">
        <a href="/{locale}">K-LIÉE</a>
      </div>

      <!-- Desktop Navigation (hidden on mobile, center on desktop) -->
      <nav class="desktop-nav" aria-label="Main navigation">
        <ul class="nav-list">
          {#each menuItems as item}
            <li class="nav-item" class:has-dropdown={item.hasDropdown}>
              <a
                href="/{locale}{item.href}"
                class="nav-link"
                aria-current={$page.url.pathname === `/${locale}${item.href}` ? 'page' : undefined}
              >
                {item.labelText}
              </a>

              {#if item.hasDropdown && item.children && item.children.length > 0}
                <ul class="dropdown-menu" role="menu">
                  {#each item.children as subItem}
                    <li class="dropdown-item" role="none">
                      <a href="/{locale}{subItem.href}" class="dropdown-link" role="menuitem">
                        {subItem.label[locale] || subItem.label.en}
                      </a>
                    </li>
                  {/each}
                </ul>
              {/if}
            </li>
          {/each}
        </ul>
      </nav>

      <!-- Desktop Theme Toggle (hidden on mobile) -->
      <button
        class="desktop-theme-toggle"
        onclick={toggleTheme}
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <div class="toggle-track" class:dark={mode.current === 'dark'}>
          <div class="toggle-thumb">
            <span class="toggle-icon">{mode.current === 'dark' ? '☀️' : '🌙'}</span>
          </div>
        </div>
      </button>

      <!-- Shop Icons (Wishlist + Cart) -->
      <div class="shop-icons">
        <WishlistIcon lang={locale} />
        <CartDropdown lang={locale} {currencyRates} />
      </div>

      <!-- Desktop Language Switcher (hidden on mobile) -->
      <div class="desktop-lang-switcher">
        <LanguageSwitcher currentLang={locale} />
      </div>

      <!-- Mobile Actions (visible on mobile only, right side) -->
      <div class="mobile-actions">
        <!-- Mobile Shop Icons -->
        <div class="mobile-shop-icons">
          <WishlistIcon lang={locale} />
          <CartDropdown lang={locale} {currencyRates} />
        </div>

        <!-- Mobile Menu Toggle (hamburger) -->
        <button
          class="mobile-menu-toggle"
          class:active={mobileMenuOpen}
          onclick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
      </div>
    </div>
  </div>
</header>

<style>
  /* Header */
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 1000;
    padding: 20px 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
  }

  :global(.dark) .header {
    background: rgba(13, 13, 13, 0.98);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .header.scrolled {
    padding: 15px 0;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
  }

  :global(.dark) .header.scrolled {
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
  }

  /* Logo */
  .logo a {
    font-size: 28px;
    font-weight: 700;
    color: var(--black, #000);
    text-decoration: none;
    letter-spacing: 3px;
    transition: color 0.3s ease;
  }

  :global(.dark) .logo a {
    color: var(--white, #fff);
  }

  .logo a:hover {
    color: var(--accent, #d4af37);
  }

  /* Mobile Menu Toggle (hidden on desktop) */
  .mobile-menu-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    width: 30px;
    height: 24px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .mobile-menu-toggle .bar {
    width: 100%;
    height: 3px;
    background: var(--black, #000);
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  :global(.dark) .mobile-menu-toggle .bar {
    background: var(--white, #fff);
  }

  .mobile-menu-toggle.active .bar:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }

  .mobile-menu-toggle.active .bar:nth-child(2) {
    opacity: 0;
  }

  .mobile-menu-toggle.active .bar:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }

  /* Desktop Navigation */
  .desktop-nav {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .nav-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px 40px; /* row-gap column-gap */
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-item {
    position: relative;
  }

  .nav-link {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary, #333);
    text-decoration: none;
    padding: 8px 0;
    position: relative;
    transition: color 0.3s ease;
  }

  :global(.dark) .nav-link {
    color: var(--text-primary-dark, #e0e0e0);
  }

  .nav-link:hover {
    color: var(--accent, #d4af37);
  }

  .nav-link[aria-current='page'] {
    color: var(--accent, #d4af37);
    font-weight: 600;
  }

  .nav-link[aria-current='page']::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--accent, #d4af37);
  }

  /* Dropdown Menu */
  .nav-item.has-dropdown {
    position: relative;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 220px;
    max-height: 400px;
    overflow-y: auto;
    background: var(--white, #fff);
    border: 1px solid var(--gray-200, #e5e5e5);
    border-radius: 8px;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.1),
      0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 0;
    margin-top: 12px;
    list-style: none;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    z-index: 100;
  }

  :global(.dark) .dropdown-menu {
    background: var(--gray-900, #0d0d0d);
    border: 1px solid var(--gray-700, #333);
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.4),
      0 1px 3px rgba(0, 0, 0, 0.2);
  }

  /* Custom scrollbar for dropdown */
  .dropdown-menu::-webkit-scrollbar {
    width: 6px;
  }

  .dropdown-menu::-webkit-scrollbar-track {
    background: transparent;
  }

  .dropdown-menu::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  :global(.dark) .dropdown-menu::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }

  .dropdown-menu::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  :global(.dark) .dropdown-menu::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .nav-item.has-dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .dropdown-item {
    list-style: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  :global(.dark) .dropdown-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .dropdown-item:last-child {
    border-bottom: none;
  }

  .dropdown-link {
    display: block;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary, #333);
    text-decoration: none;
    transition: all 0.2s ease;
  }

  :global(.dark) .dropdown-link {
    color: var(--text-primary-dark, #e0e0e0);
  }

  .dropdown-link:hover {
    background: var(--gray-50, #f5f5f5);
    color: var(--accent, #d4af37);
  }

  :global(.dark) .dropdown-link:hover {
    background: var(--gray-800, #1a1a1a);
  }

  /* Responsive: Tablet and below */
  @media (max-width: 1024px) {
    .container {
      padding: 0 30px;
    }

    .header-content {
      gap: 30px;
    }

    .nav-list {
      gap: 16px 24px; /* Tighter spacing on tablet */
    }
  }

  /* Mobile Actions (icon buttons) */
  .mobile-actions {
    display: none;
    align-items: center;
    gap: 12px;
  }

  /* Desktop Theme Toggle - Apple Minimalist Style */
  .desktop-theme-toggle {
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .desktop-theme-toggle .toggle-track {
    position: relative;
    width: 51px;
    height: 31px;
    background: #e5e5e5;
    border-radius: 16px;
    transition: background 0.25s ease;
    box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.04);
  }

  :global(.dark) .desktop-theme-toggle .toggle-track {
    background: #39393d;
    box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.04);
  }

  .desktop-theme-toggle:hover .toggle-track {
    background: #d1d1d1;
  }

  :global(.dark) .desktop-theme-toggle:hover .toggle-track {
    background: #48484a;
  }

  .desktop-theme-toggle .toggle-track.dark {
    background: #d4af37;
  }

  .desktop-theme-toggle:hover .toggle-track.dark {
    background: #b8941e;
  }

  .desktop-theme-toggle .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 27px;
    height: 27px;
    background: #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s ease;
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.15),
      0 1px 1px rgba(0, 0, 0, 0.16);
  }

  .desktop-theme-toggle .toggle-track.dark .toggle-thumb {
    transform: translateX(20px);
  }

  .desktop-theme-toggle .toggle-icon {
    font-size: 13px;
    line-height: 1;
  }

  .desktop-theme-toggle:active .toggle-thumb {
    width: 29px;
  }

  .desktop-theme-toggle:active .toggle-track.dark .toggle-thumb {
    transform: translateX(18px);
  }

  /* Shop Icons (Cart & Wishlist) */
  .shop-icons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mobile-shop-icons {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Desktop Language Switcher */
  .desktop-lang-switcher {
    display: block;
  }

  /* Responsive: Mobile */
  @media (max-width: 768px) {
    .mobile-menu-toggle {
      display: flex;
    }

    .mobile-actions {
      display: flex;
    }

    .desktop-nav {
      display: none;
    }

    .desktop-theme-toggle {
      display: none;
    }

    .desktop-lang-switcher {
      display: none;
    }

    .shop-icons {
      display: none;
    }

    .container {
      padding: 0 24px;
    }

    .header-content {
      gap: 20px;
    }

    .logo {
      flex: 0 0 auto;
      text-align: left;
    }

    .logo a {
      font-size: 24px;
      letter-spacing: 2px;
    }
  }

  /* Accessibility: Focus states */
  .mobile-menu-toggle:focus,
  .icon-btn:focus,
  .desktop-theme-toggle:focus,
  .nav-link:focus,
  .dropdown-link:focus {
    outline: 2px solid var(--accent, #d4af37);
    outline-offset: 2px;
  }
</style>
