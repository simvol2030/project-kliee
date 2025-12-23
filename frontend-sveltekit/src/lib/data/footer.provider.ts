/**
 * Footer Data Provider
 *
 * Abstraction layer for footer data access.
 * Currently reads from JSON, designed for easy migration to SQLite.
 *
 * @version 1.0
 * @date 2025-11-08
 */

import type {
  FooterData,
  FooterDataLocalized,
  SocialLink,
  LanguageCode,
  TranslatedString
} from '$lib/types/layout.types';
import footerDataRaw from '../../../../data/footer.json';

// Type assertion for imported JSON
const footerData = footerDataRaw as FooterData;

/**
 * Get complete footer data with localized strings
 * @param locale - Language code (en, ru, es, zh)
 * @returns Localized footer data
 */
export function getFooterData(locale: LanguageCode = 'en'): FooterDataLocalized {
  return {
    brand: {
      title: footerData.brand.title,
      subtitle: footerData.brand.subtitle[locale as keyof TranslatedString],
      quote: footerData.brand.quote[locale as keyof TranslatedString]
    },
    social: {
      title: footerData.social.title[locale as keyof TranslatedString],
      links: getSocialLinks()
    },
    contact: {
      title: footerData.contact.title[locale as keyof TranslatedString],
      email: footerData.contact.email
    },
    copyright: footerData.copyright
  };
}

/**
 * Get social links sorted by order
 * @returns Array of social links
 */
export function getSocialLinks(): SocialLink[] {
  return [...footerData.social.links].sort((a, b) => a.order - b.order);
}

/**
 * Get a single social link by ID
 * @param id - Social link ID
 * @returns Social link or undefined if not found
 */
export function getSocialLinkById(id: string): SocialLink | undefined {
  return footerData.social.links.find((link) => link.id === id);
}

/**
 * Get social links by platform
 * @param platform - Platform name (e.g., "Instagram", "Telegram")
 * @returns Array of social links for the platform
 */
export function getSocialLinksByPlatform(platform: string): SocialLink[] {
  return footerData.social.links.filter((link) => link.platform === platform);
}

/**
 * Get brand information (title, subtitle, quote)
 * @param locale - Language code
 * @returns Localized brand information
 */
export function getBrandInfo(locale: LanguageCode = 'en') {
  return {
    title: footerData.brand.title,
    subtitle: footerData.brand.subtitle[locale as keyof TranslatedString],
    quote: footerData.brand.quote[locale as keyof TranslatedString]
  };
}

/**
 * Get contact information
 * @param locale - Language code
 * @returns Localized contact information
 */
export function getContactInfo(locale: LanguageCode = 'en') {
  return {
    title: footerData.contact.title[locale as keyof TranslatedString],
    email: footerData.contact.email
  };
}

/**
 * Get copyright text
 * @returns Copyright string
 */
export function getCopyright(): string {
  return footerData.copyright;
}

/**
 * Get footer metadata (version, last updated)
 * @returns Footer metadata
 */
export function getFooterMetadata() {
  return {
    version: footerData.version,
    lastUpdated: footerData.lastUpdated
  };
}
