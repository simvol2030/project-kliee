/**
 * Series Data Provider
 *
 * Abstraction layer for series data access.
 * Currently reads from JSON, designed for easy migration to SQLite.
 *
 * @version 1.0
 * @date 2025-12-20
 */

import type {
	Series,
	SeriesLocalized,
	SeriesData,
	LanguageCode,
	TranslatedString
} from '$lib/types/content.types';
import seriesDataRaw from '../../../../data/series.json';

// Type assertion for imported JSON
const seriesData = seriesDataRaw as SeriesData;

/**
 * Localize a single series item
 */
function localizeSeries(series: Series, locale: LanguageCode): SeriesLocalized {
	return {
		id: series.id,
		slug: series.slug,
		title: series.title[locale as keyof TranslatedString],
		description: series.description[locale as keyof TranslatedString],
		coverImage: series.coverImage,
		artworkCount: series.artworkCount,
		order: series.order
	};
}

/**
 * Get all series with localized strings
 * @param locale - Language code (en, ru, es, zh)
 * @returns Array of series sorted by order
 */
export function getAllSeries(locale: LanguageCode = 'en'): SeriesLocalized[] {
	return seriesData.series.map((s) => localizeSeries(s, locale)).sort((a, b) => a.order - b.order);
}

/**
 * Get a single series by slug
 * @param slug - Series slug
 * @param locale - Language code
 * @returns Series or undefined if not found
 */
export function getSeriesBySlug(slug: string, locale: LanguageCode = 'en'): SeriesLocalized | undefined {
	const series = seriesData.series.find((s) => s.slug === slug);
	return series ? localizeSeries(series, locale) : undefined;
}

/**
 * Get a single series by ID
 * @param id - Series ID
 * @param locale - Language code
 * @returns Series or undefined if not found
 */
export function getSeriesById(id: string, locale: LanguageCode = 'en'): SeriesLocalized | undefined {
	const series = seriesData.series.find((s) => s.id === id);
	return series ? localizeSeries(series, locale) : undefined;
}

/**
 * Get series metadata (version, last updated)
 * @returns Series metadata
 */
export function getSeriesMetadata() {
	return {
		version: seriesData.version,
		lastUpdated: seriesData.lastUpdated
	};
}

/**
 * Get total number of series
 * @returns Number of series
 */
export function getSeriesCount(): number {
	return seriesData.series.length;
}

/**
 * Check if a series exists by slug
 * @param slug - Series slug
 * @returns Boolean indicating if series exists
 */
export function seriesExists(slug: string): boolean {
	return seriesData.series.some((s) => s.slug === slug);
}
