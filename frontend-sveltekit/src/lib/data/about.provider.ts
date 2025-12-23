/**
 * About Data Provider
 *
 * Abstraction layer for about page data access.
 * Currently reads from JSON, designed for easy migration to SQLite.
 *
 * @version 1.1
 * @date 2025-12-20
 */

import type {
	AboutData,
	AboutDataLocalized,
	LanguageCode,
	TranslatedString
} from '$lib/types/content.types';
import aboutDataRaw from '../../../../data/about.json';

// Type assertion for imported JSON
const aboutData = aboutDataRaw as AboutData;

/**
 * Get all about page data with localized strings
 * @param locale - Language code (en, ru, es, zh)
 * @returns Localized about page data
 */
export function getAboutData(locale: LanguageCode = 'en'): AboutDataLocalized {
	return {
		artist: aboutData.artist,
		biography: aboutData.biography[locale as keyof TranslatedString],
		education: aboutData.education.map((e) => ({
			year: e.year,
			institution: e.institution[locale as keyof TranslatedString],
			degree: e.degree[locale as keyof TranslatedString]
		})),
		awards: aboutData.awards.map((a) => ({
			year: a.year,
			title: a.title[locale as keyof TranslatedString],
			organization: a.organization[locale as keyof TranslatedString]
		})),
		residencies: aboutData.residencies.map((r) => ({
			year: r.year,
			location: r.location[locale as keyof TranslatedString]
		})),
		seo: {
			title: aboutData.seo.title[locale as keyof TranslatedString],
			description: aboutData.seo.description[locale as keyof TranslatedString]
		}
	};
}

/**
 * Get biography text
 * @param locale - Language code
 * @returns Localized biography text
 */
export function getBiography(locale: LanguageCode = 'en'): string {
	return aboutData.biography[locale as keyof TranslatedString];
}

/**
 * Get artist info
 * @returns Artist information (name, image, nationality, etc.)
 */
export function getArtistInfo() {
	return aboutData.artist;
}

/**
 * Get education list
 * @param locale - Language code
 * @returns Array of education items
 */
export function getEducation(locale: LanguageCode = 'en') {
	return aboutData.education.map((e) => ({
		year: e.year,
		institution: e.institution[locale as keyof TranslatedString],
		degree: e.degree[locale as keyof TranslatedString]
	}));
}

/**
 * Get awards list
 * @param locale - Language code
 * @returns Array of awards
 */
export function getAwards(locale: LanguageCode = 'en') {
	return aboutData.awards.map((a) => ({
		year: a.year,
		title: a.title[locale as keyof TranslatedString],
		organization: a.organization[locale as keyof TranslatedString]
	}));
}

/**
 * Get residencies list
 * @param locale - Language code
 * @returns Array of residencies
 */
export function getResidencies(locale: LanguageCode = 'en') {
	return aboutData.residencies.map((r) => ({
		year: r.year,
		location: r.location[locale as keyof TranslatedString]
	}));
}

/**
 * Get SEO data with localized strings
 * @param locale - Language code
 * @returns SEO title and description
 */
export function getSeoData(locale: LanguageCode = 'en') {
	return {
		title: aboutData.seo.title[locale as keyof TranslatedString],
		description: aboutData.seo.description[locale as keyof TranslatedString]
	};
}

/**
 * Get about metadata
 * @returns About metadata
 */
export function getAboutMetadata() {
	return {
		version: aboutData.version,
		lastUpdated: aboutData.lastUpdated
	};
}
