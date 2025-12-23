/**
 * Menu Data Provider
 *
 * Abstraction layer for menu data access.
 * Currently reads from JSON, designed for easy migration to SQLite.
 *
 * @version 1.0
 * @date 2025-11-08
 */

import type { MenuItem, MenuData, LanguageCode, TranslatedString } from '$lib/types/layout.types';
import menuDataRaw from '../../../../data/menu.json';

// Type assertion for imported JSON
const menuData = menuDataRaw as MenuData;

/**
 * Get all menu items with localized labels
 * @param locale - Language code (en, ru, es, zh)
 * @returns Array of menu items with flattened labelText
 */
export function getMenuItems(locale: LanguageCode = 'en'): MenuItem[] {
  return menuData.items.map((item) => ({
    ...item,
    labelText: item.label[locale as keyof TranslatedString]
  }));
}

/**
 * Get only top-level menu items (parentId === null)
 * @param locale - Language code
 * @returns Array of top-level menu items
 */
export function getTopLevelMenuItems(locale: LanguageCode = 'en'): MenuItem[] {
  return getMenuItems(locale).filter((item) => item.parentId === null);
}

/**
 * Get submenu items for a specific parent
 * @param parentId - Parent menu item ID
 * @param locale - Language code
 * @returns Array of submenu items sorted by order
 */
export function getSubMenuItems(parentId: string, locale: LanguageCode = 'en'): MenuItem[] {
  return getMenuItems(locale)
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get a single menu item by ID
 * @param id - Menu item ID
 * @param locale - Language code
 * @returns Menu item or undefined if not found
 */
export function getMenuItemById(id: string, locale: LanguageCode = 'en'): MenuItem | undefined {
  return getMenuItems(locale).find((item) => item.id === id);
}

/**
 * Check if a menu item has children
 * @param id - Menu item ID
 * @returns Boolean indicating if item has children
 */
export function hasChildren(id: string): boolean {
  return menuData.items.some((item) => item.parentId === id);
}

/**
 * Get breadcrumb trail for a given path
 * @param path - Current page path (e.g., "/works/chebu-rasha")
 * @param locale - Language code
 * @returns Array of menu items forming breadcrumb trail
 */
export function getBreadcrumbs(path: string, locale: LanguageCode = 'en'): MenuItem[] {
  const items = getMenuItems(locale);
  const breadcrumbs: MenuItem[] = [];

  // Find item matching current path
  const currentItem = items.find((item) => item.href === path);

  if (!currentItem) {
    return breadcrumbs;
  }

  // Add current item
  breadcrumbs.unshift(currentItem);

  // Walk up parent chain
  let parent = currentItem.parentId ? items.find((item) => item.id === currentItem.parentId) : null;

  while (parent) {
    breadcrumbs.unshift(parent);
    parent = parent.parentId ? items.find((item) => item.id === parent!.parentId) : null;
  }

  return breadcrumbs;
}

/**
 * Get menu metadata (version, last updated)
 * @returns Menu metadata
 */
export function getMenuMetadata() {
  return {
    version: menuData.version,
    lastUpdated: menuData.lastUpdated
  };
}
