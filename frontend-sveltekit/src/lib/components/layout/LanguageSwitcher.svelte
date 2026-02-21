<script lang="ts">
  import { page } from '$app/stores';
  import { goto, invalidateAll } from '$app/navigation';
  import type { LanguageCode } from '$lib/types/layout.types';

  interface Props {
    currentLang: LanguageCode;
  }

  let { currentLang }: Props = $props();

  // State
  let isOpen = $state(false);

  // Language options
  const languages = [
    { code: 'en' as LanguageCode, name: 'English' },
    { code: 'ru' as LanguageCode, name: 'Русский' },
    { code: 'es' as LanguageCode, name: 'Español' },
    { code: 'zh' as LanguageCode, name: '中文' }
  ];

  // Derived: current language object
  const currentLanguage = $derived(
    languages.find((lang) => lang.code === currentLang) || languages[0]
  );

  /**
   * Toggle dropdown open/close
   */
  function toggleDropdown() {
    isOpen = !isOpen;
  }

  /**
   * Select a language and navigate to translated URL
   */
  async function selectLanguage(langCode: LanguageCode) {
    // Extract path after language prefix
    const currentPath = $page.url.pathname.replace(/^\/(en|ru|es|zh)/, '');

    // Close dropdown first for better UX
    isOpen = false;

    // Navigate to new language URL and invalidate all data
    await goto(`/${langCode}${currentPath || '/'}`);
    await invalidateAll();
  }

  /**
   * Close dropdown when clicking outside
   */
  $effect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-switcher')) {
        isOpen = false;
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });

  /**
   * Close dropdown on Escape key
   */
  $effect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        isOpen = false;
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="language-switcher">
  <button
    class="current-lang"
    class:open={isOpen}
    onclick={toggleDropdown}
    aria-label="Select language"
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    <span class="lang-badge">{currentLanguage.code.toUpperCase()}</span>
    <span class="code">{currentLanguage.code.toUpperCase()}</span>
    <span class="arrow" class:rotated={isOpen}>▼</span>
  </button>

  {#if isOpen}
    <div class="dropdown" role="menu">
      {#each languages as lang}
        <button
          class="lang-option"
          class:active={lang.code === currentLang}
          onclick={() => selectLanguage(lang.code)}
          role="menuitem"
          tabindex={isOpen ? 0 : -1}
        >
          <span class="lang-badge">{lang.code.toUpperCase()}</span>
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
    gap: 6px;
    padding: 8px 12px;
    background: light-dark(
      rgba(255, 255, 255, 0.8),
      rgba(28, 28, 28, 0.8)
    );
    border: 1px solid light-dark(var(--gray-300, #e0e0e0), #38383a);
    border-radius: 8px;
    cursor: pointer;
    color: light-dark(var(--black, #000), #ffffff);
    transition:
      all 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.2s ease;
    font-size: 14px;
    font-weight: 500;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .current-lang:hover {
    border-color: light-dark(#d1d1d1, #48484a);
    background: light-dark(
      rgba(245, 245, 245, 0.95),
      rgba(44, 44, 44, 0.95)
    );
    box-shadow: 0 2px 8px light-dark(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.2));
  }

  .current-lang:active {
    transform: translateY(0);
  }

  .current-lang:focus {
    outline: 2px solid light-dark(var(--accent, #d4af37), var(--accent, #d4af37));
    outline-offset: 2px;
  }

  .lang-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 2px 6px;
    border-radius: 4px;
    background: light-dark(rgba(0,0,0,0.08), rgba(255,255,255,0.12));
    color: light-dark(var(--black, #000), #fff);
    min-width: 28px;
  }

  .code {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .arrow {
    font-size: 10px;
    transition: transform 0.3s ease;
    margin-left: 2px;
  }

  .arrow.rotated {
    transform: rotate(180deg);
  }

  /* Dropdown - Apple Minimalist */
  .dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 180px;
    background: light-dark(#ffffff, #1c1c1e);
    border: 1px solid light-dark(var(--gray-200, #e5e5e5), #38383a);
    border-radius: 8px;
    box-shadow:
      0 4px 16px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)),
      0 1px 4px light-dark(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.2));
    overflow: hidden;
    z-index: 1000;
    animation: dropdownFadeIn 0.2s ease;
  }

  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .lang-option {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-bottom: 1px solid light-dark(
      rgba(0, 0, 0, 0.08),
      rgba(255, 255, 255, 0.08)
    );
    color: light-dark(var(--text-primary, #333), #ffffff);
    cursor: pointer;
    transition: background 0.2s ease;
    text-align: left;
    font-size: 15px;
  }

  .lang-option:last-child {
    border-bottom: none;
  }

  .lang-option:hover {
    background: light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.08));
  }

  .lang-option:focus {
    outline: none;
    background: light-dark(rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.1));
  }

  .lang-option.active {
    background: light-dark(rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.15));
    color: light-dark(var(--accent, #d4af37), var(--accent, #d4af37));
    font-weight: 600;
  }

  .lang-option:active {
    background: light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.15));
  }



  .lang-option .name {
    flex: 1;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .current-lang {
      padding: 10px 14px;
      font-size: 15px;
    }

    .dropdown {
      min-width: 180px;
    }

    .lang-option {
      padding: 14px 18px;
      font-size: 15px;
    }
  }
</style>
