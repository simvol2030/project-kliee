/**
 * Simple i18n implementation for K-LIÉE
 *
 * Uses Svelte stores for reactive language switching
 * Translations are loaded from JSON files
 */

import { writable, derived, get } from 'svelte/store';
import type { LanguageCode } from '$lib/types/layout.types';

// Available languages
export const LANGUAGES: LanguageCode[] = ['en', 'ru', 'es', 'zh'];
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

// Current language store
export const currentLanguage = writable<LanguageCode>(DEFAULT_LANGUAGE);

// Translations store (loaded lazily)
export const translations = writable<Record<string, Record<string, string>>>({});

/**
 * Load translations for a specific language
 */
export async function loadTranslations(lang: LanguageCode) {
	try {
		const response = await fetch(`/messages/${lang}.json`);
		const data = await response.json();

		translations.update((all) => ({
			...all,
			[lang]: data
		}));

		return data;
	} catch (error) {
		console.error(`Failed to load translations for ${lang}:`, error);
		return {};
	}
}

/**
 * Derived store for current translations
 */
export const currentTranslations = derived(
	[currentLanguage, translations],
	([$lang, $translations]) => $translations[$lang] || {}
);

/**
 * Get translation by key (non-reactive, for use in scripts)
 */
export function t(key: string): string {
	const lang = get(currentLanguage);
	const trans = get(translations);
	const translation = trans[lang]?.[key];

	if (!translation) {
		console.warn(`Translation missing for key: ${key} (${lang})`);
		return key;
	}

	return translation;
}

/**
 * Set current language and load translations
 */
export async function setLanguage(lang: LanguageCode) {
	if (!LANGUAGES.includes(lang)) {
		console.warn(`Invalid language: ${lang}, falling back to ${DEFAULT_LANGUAGE}`);
		lang = DEFAULT_LANGUAGE;
	}

	currentLanguage.set(lang);
	await loadTranslations(lang);
}

/**
 * Initialize i18n with language from URL or browser
 */
export async function initI18n(lang?: LanguageCode) {
	const initialLang = lang || DEFAULT_LANGUAGE;
	await setLanguage(initialLang);
}
