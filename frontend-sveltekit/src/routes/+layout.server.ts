/**
 * Root Layout Server Load Function
 *
 * Provides data to all pages via the root layout
 * Extracts locale from URL path (/en, /ru, /es, /zh)
 *
 * @version 2.2
 * @date 2025-12-22
 */

import type { LayoutServerLoad } from './$types';
import type { LanguageCode } from '$lib/types/layout.types';
import { LANGUAGES, DEFAULT_LANGUAGE } from '$lib/i18n';
import { db } from '$lib/server/db/client';
import { currencyRates, menuItems } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ url }) => {
	// Extract language from URL path
	// URL format: /en, /ru, /es, /zh or /en/about, etc.
	const pathSegments = url.pathname.split('/').filter((segment) => segment.length > 0);
	const potentialLang = pathSegments[0] as LanguageCode;

	// Validate language
	const locale: LanguageCode = LANGUAGES.includes(potentialLang)
		? potentialLang
		: DEFAULT_LANGUAGE;

	// Load currency rates for shop components
	const rates = await db.select().from(currencyRates);

	// Load menu items from database
	const menuItemsData = await db
		.select()
		.from(menuItems)
		.where(eq(menuItems.is_visible, true))
		.orderBy(asc(menuItems.order_index));

	// Build hierarchical menu structure
	const topLevelMenu = menuItemsData.filter((item) => !item.parent_id);
	const menuWithChildren = topLevelMenu.map((item) => ({
		id: item.id.toString(),
		href: item.href,
		label: {
			en: item.label_en,
			ru: item.label_ru,
			es: item.label_es,
			zh: item.label_zh
		},
		hasDropdown: item.has_dropdown || false,
		parentId: item.parent_id ? item.parent_id.toString() : null,
		order: item.order_index,
		icon: item.icon,
		children: menuItemsData
			.filter((child) => child.parent_id === item.id)
			.map((child) => ({
				id: child.id.toString(),
				href: child.href,
				label: {
					en: child.label_en,
					ru: child.label_ru,
					es: child.label_es,
					zh: child.label_zh
				},
				hasDropdown: false,
				parentId: item.id.toString(),
				order: child.order_index,
				icon: child.icon
			}))
	}));

	return {
		locale,
		currencyRates: rates.map((r) => ({
			currency: r.to_currency,
			rate: parseFloat(r.rate)
		})),
		menuItems: menuWithChildren
	};
};
