<script lang="ts">
  import { page } from '$app/stores';
  import type { LanguageCode } from '$lib/types/layout.types';
  import { currentTranslations } from '$lib/i18n';

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
