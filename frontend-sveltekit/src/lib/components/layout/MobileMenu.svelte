<script lang="ts">
  import { page } from '$app/stores';
  import { goto, invalidateAll } from '$app/navigation';
  import { toggleMode, mode } from 'mode-watcher';
  import type { LanguageCode } from '$lib/types/layout.types';
  import { currentTranslations } from '$lib/i18n';

  // Language options
  const languages: { code: LanguageCode; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

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

  interface Props {
    closeMobileMenu: () => void;
  }

  let { closeMobileMenu }: Props = $props();

  // Get locale
  const locale = $derived(($page.data.locale as LanguageCode) || 'en');

  // Get menu items from page data (loaded from DB)
  const dbMenuItems = $derived(($page.data.menuItems as DbMenuItem[]) || []);

  // Create translated menu items from DB data
  const menuItems = $derived(
    dbMenuItems.map(item => ({
      ...item,
      labelText: $currentTranslations[`menu.${item.id}`] || item.label[locale] || item.label.en
    }))
  );

  // State for visibility animation
  let isVisible = $state(false);

  // State for open submenu (null = all closed, string = menu item ID with open submenu)
  let openSubmenuId = $state<string | null>(null);

  /**
   * Toggle submenu open/closed
   */
  function toggleSubmenu(itemId: string) {
    openSubmenuId = openSubmenuId === itemId ? null : itemId;
  }

  /**
   * Handle keyboard navigation for submenu toggle
   */
  function handleSubmenuKeydown(event: KeyboardEvent, itemId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSubmenu(itemId);
    }
  }

  /**
   * Animate in on mount
   */
  $effect(() => {
    // Delay to allow CSS transition
    setTimeout(() => {
      isVisible = true;
    }, 10);
  });

  /**
   * Lock body scroll when menu is open
   */
  $effect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  });

  /**
   * Close on Escape key
   */
  $effect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  /**
   * Handle link click - close menu after navigation
   */
  function handleLinkClick() {
    closeMobileMenu();
  }

  /**
   * Handle backdrop click - close menu
   */
  function handleBackdropClick(event: MouseEvent) {
    // Only close if clicking directly on backdrop, not on menu panel
    if (event.target === event.currentTarget) {
      closeMobileMenu();
    }
  }

  /**
   * Select language and navigate
   */
  async function selectLanguage(langCode: LanguageCode) {
    const currentPath = $page.url.pathname.replace(/^\/(en|ru|es|zh)/, '');
    closeMobileMenu();
    await goto(`/${langCode}${currentPath || '/'}`);
    await invalidateAll();
  }

  /**
   * Toggle theme
   */
  function toggleTheme() {
    toggleMode();
  }
</script>

<!-- Backdrop - click outside to close -->
<div
  class="mobile-menu-backdrop"
  class:visible={isVisible}
  onclick={handleBackdropClick}
  role="presentation"
></div>

<!-- Menu Panel -->
<div
  class="mobile-menu-overlay"
  class:visible={isVisible}
  role="dialog"
  aria-modal="true"
  aria-label="Mobile navigation menu"
>
  <div class="mobile-menu-header">
    <div class="mobile-logo">
      <a href="/{locale}" onclick={handleLinkClick}>K-LIÉE</a>
    </div>

    <button
      class="close-btn"
      onclick={closeMobileMenu}
      aria-label="Close menu"
    >
      <span class="close-icon">×</span>
    </button>
  </div>

  <!-- Controls: Language and Theme at the top -->
  <div class="mobile-menu-controls">
    <!-- Language Selector -->
    <div class="control-section">
      <div class="language-row">
        {#each languages as lang}
          <button
            class="lang-btn-compact"
            class:active={lang.code === locale}
            onclick={() => selectLanguage(lang.code)}
            aria-label={`Switch to ${lang.name}`}
          >
            <span class="lang-flag">{lang.flag}</span>
            <span class="lang-code">{lang.code.toUpperCase()}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Theme Toggle -->
    <div class="control-section">
      <button
        class="theme-toggle-compact"
        onclick={toggleTheme}
        aria-label="Toggle theme"
      >
        <div class="toggle-track-compact" class:dark={mode.current === 'dark'}>
          <div class="toggle-thumb-compact">
            <span class="toggle-icon-compact">{mode.current === 'dark' ? '☀️' : '🌙'}</span>
          </div>
        </div>
        <span class="theme-label-compact">{mode.current === 'dark' ? 'Dark' : 'Light'}</span>
      </button>
    </div>
  </div>

  <nav class="mobile-nav" aria-label="Mobile navigation">
    <ul class="menu-list">
      {#each menuItems as item}
        <li class="menu-item">
          {#if item.hasDropdown}
            <button
              class="menu-button"
              onclick={() => toggleSubmenu(item.id)}
              onkeydown={(e) => handleSubmenuKeydown(e, item.id)}
              aria-expanded={openSubmenuId === item.id}
              aria-label={openSubmenuId === item.id ? `Close ${item.labelText} submenu` : `Open ${item.labelText} submenu`}
            >
              {#if item.icon}
                <span class="menu-icon">{item.icon}</span>
              {/if}
              <span class="menu-button-text">{item.labelText}</span>
              <span class="chevron" class:rotated={openSubmenuId === item.id}>▼</span>
            </button>

            {#if openSubmenuId === item.id && item.children && item.children.length > 0}
              <ul class="submenu-list">
                {#each item.children as subItem}
                  <li class="submenu-item">
                    <a
                      href="/{locale}{subItem.href}"
                      class="submenu-link"
                      onclick={handleLinkClick}
                    >
                      {subItem.label[locale] || subItem.label.en}
                    </a>
                  </li>
                {/each}
              </ul>
            {/if}
          {:else}
            <a
              href="/{locale}{item.href}"
              class="menu-link"
              onclick={handleLinkClick}
            >
              {#if item.icon}
                <span class="menu-icon">{item.icon}</span>
              {/if}
              <span class="menu-link-text">{item.labelText}</span>
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  </nav>

</div>

<style>
  /* Backdrop - semi-transparent overlay */
  .mobile-menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998; /* Below menu panel but above everything else */
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
  }

  .mobile-menu-backdrop.visible {
    opacity: 1;
    visibility: visible;
  }

  /* Overlay - Apple Minimalist */
  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    right: 0;
    width: 85%;
    max-width: 400px;
    bottom: 0;
    background: #ffffff;
    z-index: 9999;
    overflow-y: auto;
    overflow-x: hidden;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
    display: flex;
    flex-direction: column;
  }

  :global(.dark) .mobile-menu-overlay {
    background: #000000;
  }

  .mobile-menu-overlay.visible {
    transform: translateX(0);
  }

  /* Header */
  .mobile-menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--gray-200, #e5e5e5);
  }

  :global(.dark) .mobile-menu-header {
    border-bottom: 1px solid var(--gray-700, #333);
  }

  /* Controls section at the top */
  .mobile-menu-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  :global(.dark) .mobile-menu-controls {
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .control-section {
    display: flex;
    align-items: center;
  }

  /* Compact Language Row */
  .language-row {
    display: flex;
    gap: 6px;
  }

  .lang-btn-compact {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 10px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .lang-btn-compact:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  :global(.dark) .lang-btn-compact:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .lang-btn-compact.active {
    background: rgba(212, 175, 55, 0.1);
    border-color: var(--accent, #d4af37);
  }

  :global(.dark) .lang-btn-compact.active {
    background: rgba(212, 175, 55, 0.15);
  }

  .lang-btn-compact .lang-flag {
    font-size: 20px;
    line-height: 1;
  }

  .lang-btn-compact .lang-code {
    font-size: 10px;
    font-weight: 600;
    color: #666;
    letter-spacing: 0.3px;
  }

  :global(.dark) .lang-btn-compact .lang-code {
    color: #aaa;
  }

  .lang-btn-compact.active .lang-code {
    color: var(--accent, #d4af37);
  }

  .lang-btn-compact:focus {
    outline: 2px solid var(--accent, #d4af37);
    outline-offset: 2px;
  }

  /* Compact Theme Toggle */
  .theme-toggle-compact {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .toggle-track-compact {
    position: relative;
    width: 44px;
    height: 26px;
    background: #e5e5e5;
    border-radius: 13px;
    transition: background 0.25s ease;
    box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.04);
  }

  :global(.dark) .toggle-track-compact {
    background: #39393d;
    box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.04);
  }

  .toggle-track-compact.dark {
    background: #d4af37;
  }

  .toggle-thumb-compact {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 22px;
    height: 22px;
    background: #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s ease;
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.15),
      0 1px 1px rgba(0, 0, 0, 0.12);
  }

  .toggle-track-compact.dark .toggle-thumb-compact {
    transform: translateX(18px);
  }

  .toggle-icon-compact {
    font-size: 11px;
    line-height: 1;
  }

  .theme-label-compact {
    font-size: 13px;
    font-weight: 500;
    color: #000;
  }

  :global(.dark) .theme-label-compact {
    color: #fff;
  }

  .theme-toggle-compact:focus {
    outline: 2px solid var(--accent, #d4af37);
    outline-offset: 2px;
  }

  .mobile-logo a {
    font-size: 24px;
    font-weight: 700;
    color: var(--black, #000);
    text-decoration: none;
    letter-spacing: 2px;
  }

  :global(.dark) .mobile-logo a {
    color: var(--white, #fff);
  }

  /* Close button */
  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--black, #000);
    transition: all 0.2s ease;
    border-radius: 8px;
  }

  :global(.dark) .close-btn {
    color: var(--white, #fff);
  }

  .close-btn:hover {
    background: var(--gray-100, #f0f0f0);
  }

  :global(.dark) .close-btn:hover {
    background: var(--gray-800, #1a1a1a);
  }

  .close-btn:active {
    transform: scale(0.95);
  }

  .close-icon {
    font-size: 40px;
    line-height: 1;
    font-weight: 300;
  }

  /* Navigation */
  .mobile-nav {
    padding: 40px 24px;
    flex: 1;
  }

  .menu-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .menu-item {
    margin-bottom: 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  :global(.dark) .menu-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .menu-item:last-child {
    border-bottom: none;
  }

  .menu-link,
  .menu-button {
    display: block;
    width: 100%;
    padding: 12px 20px;
    font-size: 17px;
    font-weight: 400;
    color: #000000;
    text-decoration: none;
    transition: background 0.2s ease;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
  }

  :global(.dark) .menu-link,
  :global(.dark) .menu-button {
    color: #ffffff;
  }

  .menu-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .menu-icon {
    font-size: 20px;
    margin-right: 12px;
    min-width: 24px;
    text-align: center;
  }

  .menu-button-text,
  .menu-link-text {
    flex: 1;
  }

  .chevron {
    display: inline-block;
    font-size: 14px;
    color: var(--accent, #d4af37);
    transition: transform 0.2s ease;
    margin-left: 8px;
  }

  .chevron.rotated {
    transform: rotate(180deg);
  }

  .menu-link:hover,
  .menu-button:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  :global(.dark) .menu-link:hover,
  :global(.dark) .menu-button:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .menu-link:active,
  .menu-button:active {
    background: rgba(0, 0, 0, 0.1);
  }

  :global(.dark) .menu-link:active,
  :global(.dark) .menu-button:active {
    background: rgba(255, 255, 255, 0.15);
  }

  /* Submenu */
  .submenu-list {
    list-style: none;
    padding: 0;
    margin: 8px 0 0 20px;
    animation: slideDown 0.2s ease-out;
    overflow: hidden;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 500px;
    }
  }

  .submenu-item {
    margin-bottom: 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  :global(.dark) .submenu-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .submenu-item:last-child {
    border-bottom: none;
  }

  .submenu-link {
    display: block;
    padding: 10px 16px;
    font-size: 16px;
    font-weight: 400;
    color: var(--text-secondary, #666);
    text-decoration: none;
    border-radius: 6px;
    transition: background 0.2s ease;
  }

  :global(.dark) .submenu-link {
    color: #8e8e93;
  }

  .submenu-link:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  :global(.dark) .submenu-link:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .submenu-link:active {
    background: rgba(0, 0, 0, 0.1);
  }

  :global(.dark) .submenu-link:active {
    background: rgba(255, 255, 255, 0.15);
  }

  /* Mobile optimization */
  @media (max-width: 375px) {
    .mobile-menu-header {
      padding: 16px 20px;
    }

    .mobile-logo a {
      font-size: 22px;
    }

    .mobile-nav {
      padding: 32px 20px;
    }

    .menu-link {
      padding: 14px 18px;
      font-size: 17px;
    }

    .submenu-link {
      padding: 10px 14px;
      font-size: 15px;
    }
  }

  /* Accessibility: Focus states */
  .close-btn:focus,
  .menu-link:focus,
  .menu-button:focus,
  .submenu-link:focus {
    outline: 2px solid var(--accent, #d4af37);
    outline-offset: 2px;
  }

  /* Remove default button focus outline in favor of custom */
  .menu-button:focus-visible {
    outline: 2px solid var(--accent, #d4af37);
    outline-offset: 2px;
  }

</style>
