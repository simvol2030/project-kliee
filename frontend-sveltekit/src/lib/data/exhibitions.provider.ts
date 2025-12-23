/**
 * Exhibitions Data Provider
 *
 * Abstraction layer for exhibitions data access.
 * Currently reads from JSON, designed for easy migration to SQLite.
 *
 * @version 1.1
 * @date 2025-12-20
 */

import type {
	Exhibition,
	ExhibitionLocalized,
	ArtFair,
	ArtFairLocalized,
	ExhibitionsData,
	LanguageCode,
	TranslatedString
} from '$lib/types/content.types';
import exhibitionsDataRaw from '../../../../data/exhibitions.json';

// Type assertion for imported JSON
const exhibitionsData = exhibitionsDataRaw as ExhibitionsData;

/**
 * Localize a single exhibition item
 */
function localizeExhibition(exhibition: Exhibition, locale: LanguageCode): ExhibitionLocalized {
	return {
		id: exhibition.id,
		year: exhibition.year,
		title: exhibition.title[locale as keyof TranslatedString],
		venue: exhibition.venue[locale as keyof TranslatedString],
		location: exhibition.location[locale as keyof TranslatedString],
		type: exhibition.type,
		current: exhibition.current,
		image: exhibition.image
	};
}

/**
 * Localize a single art fair item
 */
function localizeArtFair(fair: ArtFair, locale: LanguageCode): ArtFairLocalized {
	return {
		id: fair.id,
		year: fair.year,
		title: fair.title[locale as keyof TranslatedString],
		gallery: fair.gallery ? fair.gallery[locale as keyof TranslatedString] : null,
		location: fair.location[locale as keyof TranslatedString]
	};
}

/**
 * Get all exhibitions with localized strings
 * @param locale - Language code (en, ru, es, zh)
 * @returns Array of exhibitions sorted by year (newest first)
 */
export function getAllExhibitions(locale: LanguageCode = 'en'): ExhibitionLocalized[] {
	return exhibitionsData.exhibitions
		.map((e) => localizeExhibition(e, locale))
		.sort((a, b) => b.year - a.year);
}

/**
 * Get exhibitions by type
 * @param type - Exhibition type (solo, group, fair, festival, gallery)
 * @param locale - Language code
 * @returns Array of exhibitions of the specified type
 */
export function getExhibitionsByType(
	type: string,
	locale: LanguageCode = 'en'
): ExhibitionLocalized[] {
	return exhibitionsData.exhibitions
		.filter((e) => e.type === type)
		.map((e) => localizeExhibition(e, locale))
		.sort((a, b) => b.year - a.year);
}

/**
 * Get current exhibitions
 * @param locale - Language code
 * @returns Array of currently running exhibitions
 */
export function getCurrentExhibitions(locale: LanguageCode = 'en'): ExhibitionLocalized[] {
	return exhibitionsData.exhibitions
		.filter((e) => e.current)
		.map((e) => localizeExhibition(e, locale))
		.sort((a, b) => b.year - a.year);
}

/**
 * Get past exhibitions
 * @param locale - Language code
 * @returns Array of past exhibitions
 */
export function getPastExhibitions(locale: LanguageCode = 'en'): ExhibitionLocalized[] {
	return exhibitionsData.exhibitions
		.filter((e) => !e.current)
		.map((e) => localizeExhibition(e, locale))
		.sort((a, b) => b.year - a.year);
}

/**
 * Get a single exhibition by ID
 * @param id - Exhibition ID
 * @param locale - Language code
 * @returns Exhibition or undefined if not found
 */
export function getExhibitionById(
	id: string,
	locale: LanguageCode = 'en'
): ExhibitionLocalized | undefined {
	const exhibition = exhibitionsData.exhibitions.find((e) => e.id === id);
	return exhibition ? localizeExhibition(exhibition, locale) : undefined;
}

/**
 * Get exhibitions by year
 * @param year - Year
 * @param locale - Language code
 * @returns Array of exhibitions from that year
 */
export function getExhibitionsByYear(
	year: number,
	locale: LanguageCode = 'en'
): ExhibitionLocalized[] {
	return exhibitionsData.exhibitions
		.filter((e) => e.year === year)
		.map((e) => localizeExhibition(e, locale));
}

/**
 * Get all art fairs with localized strings
 * @param locale - Language code
 * @returns Array of art fairs sorted by year (newest first)
 */
export function getAllArtFairs(locale: LanguageCode = 'en'): ArtFairLocalized[] {
	return exhibitionsData.artFairs
		.map((f) => localizeArtFair(f, locale))
		.sort((a, b) => b.year - a.year);
}

/**
 * Get art fairs by year
 * @param year - Year
 * @param locale - Language code
 * @returns Array of art fairs from that year
 */
export function getArtFairsByYear(year: number, locale: LanguageCode = 'en'): ArtFairLocalized[] {
	return exhibitionsData.artFairs
		.filter((f) => f.year === year)
		.map((f) => localizeArtFair(f, locale));
}

/**
 * Get SEO data with localized strings
 * @param locale - Language code
 * @returns SEO title and description
 */
export function getSeoData(locale: LanguageCode = 'en') {
	return {
		title: exhibitionsData.seo.title[locale as keyof TranslatedString],
		description: exhibitionsData.seo.description[locale as keyof TranslatedString]
	};
}

/**
 * Get exhibitions metadata
 * @returns Exhibitions metadata
 */
export function getExhibitionsMetadata() {
	return {
		version: exhibitionsData.version,
		lastUpdated: exhibitionsData.lastUpdated
	};
}

/**
 * Get total number of exhibitions
 * @returns Number of exhibitions
 */
export function getExhibitionsCount(): number {
	return exhibitionsData.exhibitions.length;
}

/**
 * Get total number of art fairs
 * @returns Number of art fairs
 */
export function getArtFairsCount(): number {
	return exhibitionsData.artFairs.length;
}

/**
 * Get unique years from exhibitions
 * @returns Array of years sorted descending
 */
export function getExhibitionYears(): number[] {
	const years = [...new Set(exhibitionsData.exhibitions.map((e) => e.year))];
	return years.sort((a, b) => b - a);
}
