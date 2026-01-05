/**
 * Artworks JSON Data Provider
 *
 * Reads artwork data from JSON file for Works pages.
 * This is a fast solution while DB integration is being developed.
 *
 * @version 1.0
 * @date 2025-01-05
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
 * Generate a slug from English title
 */
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.substring(0, 100);
}

/**
 * Localize a single artwork item
 */
function localizeArtwork(artwork: Artwork, locale: LanguageCode): ArtworkLocalized {
	return {
		id: artwork.id,
		slug: generateSlug(artwork.title.en), // Generate slug from English title
		title: artwork.title[locale as keyof TranslatedString] || artwork.title.en,
		series: artwork.series,
		technique: artwork.technique[locale as keyof TranslatedString] || artwork.technique.en,
		year: artwork.year,
		dimensions: artwork.dimensions,
		price: artwork.price,
		currency: artwork.currency,
		images: artwork.images,
		available: artwork.available,
		shop_slug: null // JSON provider doesn't have shop integration
	};
}

/**
 * Get all artworks with localized strings
 * @param locale - Language code (en, ru, es, zh)
 * @returns Array of artworks
 */
export function getAllArtworksFromJson(locale: LanguageCode = 'en'): ArtworkLocalized[] {
	return artworksData.artworks.map((a) => localizeArtwork(a, locale));
}

/**
 * Get artworks by series slug
 * @param seriesSlug - Series slug
 * @param locale - Language code
 * @returns Array of artworks in the series
 */
export function getArtworksBySeriesFromJson(
	seriesSlug: string,
	locale: LanguageCode = 'en'
): ArtworkLocalized[] {
	const filtered = artworksData.artworks.filter((a) => a.series === seriesSlug);
	return filtered.map((a) => localizeArtwork(a, locale));
}

/**
 * Get a single artwork by ID
 * @param id - Artwork ID
 * @param locale - Language code
 * @returns Artwork or undefined if not found
 */
export function getArtworkByIdFromJson(
	id: string,
	locale: LanguageCode = 'en'
): ArtworkLocalized | undefined {
	const artwork = artworksData.artworks.find((a) => a.id === id);
	return artwork ? localizeArtwork(artwork, locale) : undefined;
}

/**
 * Get count of artworks by series
 * @param seriesSlug - Series slug
 * @returns Number of artworks in series
 */
export function getArtworksCountBySeriesFromJson(seriesSlug: string): number {
	return artworksData.artworks.filter((a) => a.series === seriesSlug).length;
}

/**
 * Get artworks metadata
 * @returns Artworks metadata
 */
export function getArtworksMetadataFromJson(): { version: string; lastUpdated: string } {
	return {
		version: artworksData.version,
		lastUpdated: artworksData.lastUpdated
	};
}
