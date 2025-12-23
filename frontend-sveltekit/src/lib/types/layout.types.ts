/**
 * Layout Components Type Definitions
 *
 * TypeScript interfaces for Header, Footer, and MobileMenu components
 * Matches JSON data structure from data/menu.json and data/footer.json
 *
 * @version 1.0
 * @date 2025-11-08
 */

// ============================================
// Common Types
// ============================================

/**
 * Translated string for all 4 supported languages
 */
export interface TranslatedString {
  en: string;
  ru: string;
  es: string;
  zh: string;
}

/**
 * Supported language codes
 */
export type LanguageCode = 'en' | 'ru' | 'es' | 'zh';

/**
 * Language option for language switcher
 */
export interface LanguageOption {
  code: LanguageCode;
  name: string;
  flag: string;
}

// ============================================
// Menu Types
// ============================================

/**
 * Single menu item (can be top-level or submenu item)
 */
export interface MenuItem {
  id: string;
  label: TranslatedString;
  labelText?: string;  // Flattened label for current locale (computed)
  href: string;
  parentId: string | null;
  hasDropdown: boolean;
  order: number;
  icon?: string;  // Emoji icon (optional, for top-level items only)
}

/**
 * Complete menu data structure
 */
export interface MenuData {
  version: string;
  lastUpdated: string;
  items: MenuItem[];
}

/**
 * Menu item with children (for dropdown rendering)
 */
export interface MenuItemWithChildren extends MenuItem {
  children?: MenuItem[];
}

// ============================================
// Footer Types
// ============================================

/**
 * Footer brand section
 */
export interface FooterBrand {
  title: string;
  subtitle: TranslatedString;
  quote: TranslatedString;
}

/**
 * Social media link
 */
export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  badge: string | null;
  url: string;
  icon: string;
  order: number;
}

/**
 * Footer social section
 */
export interface FooterSocial {
  title: TranslatedString;
  links: SocialLink[];
}

/**
 * Footer contact section
 */
export interface FooterContact {
  title: TranslatedString;
  email: string;
}

/**
 * Complete footer data structure
 */
export interface FooterData {
  version: string;
  lastUpdated: string;
  brand: FooterBrand;
  social: FooterSocial;
  contact: FooterContact;
  copyright: string;
}

/**
 * Footer data with localized strings (computed)
 */
export interface FooterDataLocalized {
  brand: {
    title: string;
    subtitle: string;
    quote: string;
  };
  social: {
    title: string;
    links: SocialLink[];
  };
  contact: {
    title: string;
    email: string;
  };
  copyright: string;
}

// ============================================
// Component Props Types
// ============================================

/**
 * Header component props
 */
export interface HeaderProps {
  menuItems?: MenuItem[];
  locale?: LanguageCode;
}

/**
 * Footer component props
 */
export interface FooterProps {
  footerData?: FooterDataLocalized;
  locale?: LanguageCode;
}

/**
 * MobileMenu component props
 */
export interface MobileMenuProps {
  menuItems: MenuItem[];
  locale: LanguageCode;
  closeMobileMenu: () => void;
}

/**
 * LanguageSwitcher component props
 */
export interface LanguageSwitcherProps {
  currentLang: LanguageCode;
}

// ============================================
// SQLite Migration Types (Future)
// ============================================

/**
 * Menu item database schema (for future Drizzle ORM migration)
 */
export interface MenuItemDB {
  id: string;
  labelEn: string;
  labelRu: string;
  labelEs: string;
  labelZh: string;
  href: string;
  parentId: string | null;
  hasDropdown: number; // SQLite boolean (0 or 1)
  order: number;
}

/**
 * Social link database schema (for future Drizzle ORM migration)
 */
export interface SocialLinkDB {
  id: string;
  platform: string;
  label: string;
  badge: string | null;
  url: string;
  icon: string;
  order: number;
}

/**
 * Footer database schema (for future Drizzle ORM migration)
 */
export interface FooterDB {
  id: number;
  brandTitle: string;
  brandSubtitleEn: string;
  brandSubtitleRu: string;
  brandSubtitleEs: string;
  brandSubtitleZh: string;
  brandQuoteEn: string;
  brandQuoteRu: string;
  brandQuoteEs: string;
  brandQuoteZh: string;
  socialTitleEn: string;
  socialTitleRu: string;
  socialTitleEs: string;
  socialTitleZh: string;
  contactTitleEn: string;
  contactTitleRu: string;
  contactTitleEs: string;
  contactTitleZh: string;
  contactEmail: string;
  copyright: string;
}
