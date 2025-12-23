/**
 * Artworks Data Provider
 *
 * Abstraction layer for artwork data access.
 * Currently reads from JSON, designed for easy migration to SQLite.
 *
 * @version 1.0
 * @date 2025-12-20
 */

import type {
	Artwork,
	ArtworkLocalized,
	ArtworksData,
	LanguageCode,
	TranslatedString
} from '$lib/types/content.types';
import artworksDataRaw from '../../../../data/artworks.json';

// Type assertion for imported JSON
const artworksData = artworksDataRaw as ArtworksData;

/**
 * Localize a single artwork item
 */
function localizeArtwork(artwork: Artwork, locale: LanguageCode): ArtworkLocalized {
	return {
		id: artwork.id,
		title: artwork.title[locale as keyof TranslatedString],
		series: artwork.series,
		technique: artwork.technique[locale as keyof TranslatedString],
		year: artwork.year,
		dimensions: artwork.dimensions,
		price: artwork.price,
		currency: artwork.currency,
		images: artwork.images,
		available: artwork.available
	};
}

/**
 * Get all artworks with localized strings
 * @param locale - Language code (en, ru, es, zh)
 * @returns Array of artworks sorted by year (newest first)
 */
export function getAllArtworks(locale: LanguageCode = 'en'): ArtworkLocalized[] {
	return artworksData.artworks
		.map((a) => localizeArtwork(a, locale))
		.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

/**
 * Get artworks by series slug
 * @param seriesSlug - Series slug
 * @param locale - Language code
 * @returns Array of artworks in the series
 */
export function getArtworksBySeries(
	seriesSlug: string,
	locale: LanguageCode = 'en'
): ArtworkLocalized[] {
	return artworksData.artworks
		.filter((a) => a.series === seriesSlug)
		.map((a) => localizeArtwork(a, locale))
		.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

/**
 * Get a single artwork by ID
 * @param id - Artwork ID
 * @param locale - Language code
 * @returns Artwork or undefined if not found
 */
export function getArtworkById(
	id: string,
	locale: LanguageCode = 'en'
): ArtworkLocalized | undefined {
	const artwork = artworksData.artworks.find((a) => a.id === id);
	return artwork ? localizeArtwork(artwork, locale) : undefined;
}

/**
 * Get artworks by year
 * @param year - Year of creation
 * @param locale - Language code
 * @returns Array of artworks from that year
 */
export function getArtworksByYear(year: number, locale: LanguageCode = 'en'): ArtworkLocalized[] {
	return artworksData.artworks
		.filter((a) => a.year === year)
		.map((a) => localizeArtwork(a, locale));
}

/**
 * Get available artworks (for sale)
 * @param locale - Language code
 * @returns Array of available artworks
 */
export function getAvailableArtworks(locale: LanguageCode = 'en'): ArtworkLocalized[] {
	return artworksData.artworks
		.filter((a) => a.available && a.price !== null)
		.map((a) => localizeArtwork(a, locale))
		.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

/**
 * Get featured artworks (first artwork from each series)
 * @param locale - Language code
 * @param limit - Maximum number to return
 * @returns Array of featured artworks
 */
export function getFeaturedArtworks(
	locale: LanguageCode = 'en',
	limit: number = 6
): ArtworkLocalized[] {
	const seriesSlugs = [...new Set(artworksData.artworks.map((a) => a.series))];
	const featured: ArtworkLocalized[] = [];

	for (const slug of seriesSlugs) {
		if (featured.length >= limit) break;
		const artwork = artworksData.artworks.find((a) => a.series === slug);
		if (artwork) {
			featured.push(localizeArtwork(artwork, locale));
		}
	}

	return featured;
}

/**
 * Search artworks by title
 * @param query - Search query
 * @param locale - Language code
 * @returns Array of matching artworks
 */
export function searchArtworks(query: string, locale: LanguageCode = 'en'): ArtworkLocalized[] {
	const lowerQuery = query.toLowerCase();
	return artworksData.artworks
		.filter((a) => {
			const title = a.title[locale as keyof TranslatedString].toLowerCase();
			return title.includes(lowerQuery);
		})
		.map((a) => localizeArtwork(a, locale));
}

/**
 * Get unique years from artworks
 * @returns Array of years sorted descending (excludes null years)
 */
export function getArtworkYears(): number[] {
	const years = artworksData.artworks
		.map((a) => a.year)
		.filter((year): year is number => year !== null);
	return [...new Set(years)].sort((a, b) => b - a);
}

/**
 * Get unique techniques from artworks
 * @param locale - Language code
 * @returns Array of unique techniques
 */
export function getArtworkTechniques(locale: LanguageCode = 'en'): string[] {
	const techniques = artworksData.artworks.map(
		(a) => a.technique[locale as keyof TranslatedString]
	);
	return [...new Set(techniques)].sort();
}

/**
 * Get artworks with pagination
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @param locale - Language code
 * @returns Paginated artworks with metadata
 */
export function getArtworksPaginated(
	page: number = 1,
	pageSize: number = 12,
	locale: LanguageCode = 'en'
): {
	artworks: ArtworkLocalized[];
	total: number;
	totalPages: number;
	currentPage: number;
	hasNext: boolean;
	hasPrev: boolean;
} {
	const allArtworks = getAllArtworks(locale);
	const total = allArtworks.length;
	const totalPages = Math.ceil(total / pageSize);
	const currentPage = Math.max(1, Math.min(page, totalPages));
	const start = (currentPage - 1) * pageSize;
	const artworks = allArtworks.slice(start, start + pageSize);

	return {
		artworks,
		total,
		totalPages,
		currentPage,
		hasNext: currentPage < totalPages,
		hasPrev: currentPage > 1
	};
}

/**
 * Get artworks metadata
 * @returns Artworks metadata
 */
export function getArtworksMetadata() {
	return {
		version: artworksData.version,
		lastUpdated: artworksData.lastUpdated
	};
}

/**
 * Get total number of artworks
 * @returns Number of artworks
 */
export function getArtworksCount(): number {
	return artworksData.artworks.length;
}

/**
 * Get count of artworks by series
 * @param seriesSlug - Series slug
 * @returns Number of artworks in series
 */
export function getArtworksCountBySeries(seriesSlug: string): number {
	return artworksData.artworks.filter((a) => a.series === seriesSlug).length;
}
