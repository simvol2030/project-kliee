/**
 * Artworks Data Provider
 *
 * Abstraction layer for artwork data access.
 * Reads from SQLite database via Drizzle ORM.
 *
 * @version 2.0
 * @date 2025-12-23
 */

import { db } from '$lib/server/db/client';
import { artworks, artworkImages, media, series } from '$lib/server/db/schema';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';
import type { ArtworkLocalized, LanguageCode } from '$lib/types/content.types';

/**
 * Map database artwork to localized format
 */
function mapArtworkToLocalized(
	artwork: typeof artworks.$inferSelect,
	locale: LanguageCode,
	primaryImageFilename?: string | null,
	primaryImageFolder?: string | null,
	seriesSlug?: string | null
): ArtworkLocalized {
	// Get title by locale
	const title =
		locale === 'ru'
			? artwork.title_ru
			: locale === 'es'
				? artwork.title_es
				: locale === 'zh'
					? artwork.title_zh
					: artwork.title_en;

	// Get technique - for now use the technique field as-is
	const technique = artwork.technique || '';

	// Build images array - use primary image if available
	const images: string[] = [];
	if (primaryImageFilename) {
		const folder = primaryImageFolder || 'products';
		images.push(`/uploads/${folder}/${primaryImageFilename}`);
	}

	return {
		id: artwork.id,
		title,
		series: seriesSlug || '',
		technique,
		year: artwork.year,
		dimensions: artwork.dimensions,
		price: artwork.price,
		currency: artwork.currency || 'EUR',
		images,
		available: artwork.is_for_sale === true
	};
}

/**
 * Get all artworks with localized strings
 * @param locale - Language code (en, ru, es, zh)
 * @returns Array of artworks sorted by year (newest first)
 */
export async function getAllArtworks(locale: LanguageCode = 'en'): Promise<ArtworkLocalized[]> {
	const result = await db
		.select({
			artwork: artworks,
			seriesSlug: series.slug,
			primaryImage: media.stored_filename,
			primaryImageFolder: media.folder
		})
		.from(artworks)
		.leftJoin(series, eq(artworks.series_id, series.id))
		.leftJoin(
			artworkImages,
			and(eq(artworkImages.artwork_id, artworks.id), eq(artworkImages.is_primary, true))
		)
		.leftJoin(media, eq(artworkImages.media_id, media.id))
		.where(eq(artworks.is_visible, true))
		.orderBy(desc(artworks.year), asc(artworks.order_index));

	return result.map((row) =>
		mapArtworkToLocalized(row.artwork, locale, row.primaryImage, row.primaryImageFolder, row.seriesSlug)
	);
}

/**
 * Get artworks by series slug
 * @param seriesSlug - Series slug
 * @param locale - Language code
 * @returns Array of artworks in the series
 */
export async function getArtworksBySeries(
	seriesSlug: string,
	locale: LanguageCode = 'en'
): Promise<ArtworkLocalized[]> {
	// First find the series by slug
	const [seriesRecord] = await db
		.select()
		.from(series)
		.where(eq(series.slug, seriesSlug))
		.limit(1);

	if (!seriesRecord) {
		return [];
	}

	const result = await db
		.select({
			artwork: artworks,
			seriesSlug: series.slug,
			primaryImage: media.stored_filename,
			primaryImageFolder: media.folder
		})
		.from(artworks)
		.leftJoin(series, eq(artworks.series_id, series.id))
		.leftJoin(
			artworkImages,
			and(eq(artworkImages.artwork_id, artworks.id), eq(artworkImages.is_primary, true))
		)
		.leftJoin(media, eq(artworkImages.media_id, media.id))
		.where(and(eq(artworks.series_id, seriesRecord.id), eq(artworks.is_visible, true)))
		.orderBy(desc(artworks.year), asc(artworks.order_index));

	return result.map((row) =>
		mapArtworkToLocalized(row.artwork, locale, row.primaryImage, row.primaryImageFolder, row.seriesSlug)
	);
}

/**
 * Get a single artwork by ID
 * @param id - Artwork ID
 * @param locale - Language code
 * @returns Artwork or undefined if not found
 */
export async function getArtworkById(
	id: string,
	locale: LanguageCode = 'en'
): Promise<ArtworkLocalized | undefined> {
	const result = await db
		.select({
			artwork: artworks,
			seriesSlug: series.slug,
			primaryImage: media.stored_filename,
			primaryImageFolder: media.folder
		})
		.from(artworks)
		.leftJoin(series, eq(artworks.series_id, series.id))
		.leftJoin(
			artworkImages,
			and(eq(artworkImages.artwork_id, artworks.id), eq(artworkImages.is_primary, true))
		)
		.leftJoin(media, eq(artworkImages.media_id, media.id))
		.where(eq(artworks.id, id))
		.limit(1);

	if (result.length === 0) {
		return undefined;
	}

	const row = result[0];
	return mapArtworkToLocalized(row.artwork, locale, row.primaryImage, row.primaryImageFolder, row.seriesSlug);
}

/**
 * Get artworks by year
 * @param year - Year of creation
 * @param locale - Language code
 * @returns Array of artworks from that year
 */
export async function getArtworksByYear(
	year: number,
	locale: LanguageCode = 'en'
): Promise<ArtworkLocalized[]> {
	const result = await db
		.select({
			artwork: artworks,
			seriesSlug: series.slug,
			primaryImage: media.stored_filename,
			primaryImageFolder: media.folder
		})
		.from(artworks)
		.leftJoin(series, eq(artworks.series_id, series.id))
		.leftJoin(
			artworkImages,
			and(eq(artworkImages.artwork_id, artworks.id), eq(artworkImages.is_primary, true))
		)
		.leftJoin(media, eq(artworkImages.media_id, media.id))
		.where(and(eq(artworks.year, year), eq(artworks.is_visible, true)))
		.orderBy(asc(artworks.order_index));

	return result.map((row) =>
		mapArtworkToLocalized(row.artwork, locale, row.primaryImage, row.primaryImageFolder, row.seriesSlug)
	);
}

/**
 * Get available artworks (for sale)
 * @param locale - Language code
 * @returns Array of available artworks
 */
export async function getAvailableArtworks(locale: LanguageCode = 'en'): Promise<ArtworkLocalized[]> {
	const result = await db
		.select({
			artwork: artworks,
			seriesSlug: series.slug,
			primaryImage: media.stored_filename,
			primaryImageFolder: media.folder
		})
		.from(artworks)
		.leftJoin(series, eq(artworks.series_id, series.id))
		.leftJoin(
			artworkImages,
			and(eq(artworkImages.artwork_id, artworks.id), eq(artworkImages.is_primary, true))
		)
		.leftJoin(media, eq(artworkImages.media_id, media.id))
		.where(and(eq(artworks.is_for_sale, true), eq(artworks.is_visible, true)))
		.orderBy(desc(artworks.year), asc(artworks.order_index));

	return result.map((row) =>
		mapArtworkToLocalized(row.artwork, locale, row.primaryImage, row.primaryImageFolder, row.seriesSlug)
	);
}

/**
 * Get featured artworks
 * @param locale - Language code
 * @param limit - Maximum number to return
 * @returns Array of featured artworks
 */
export async function getFeaturedArtworks(
	locale: LanguageCode = 'en',
	limit: number = 6
): Promise<ArtworkLocalized[]> {
	const result = await db
		.select({
			artwork: artworks,
			seriesSlug: series.slug,
			primaryImage: media.stored_filename,
			primaryImageFolder: media.folder
		})
		.from(artworks)
		.leftJoin(series, eq(artworks.series_id, series.id))
		.leftJoin(
			artworkImages,
			and(eq(artworkImages.artwork_id, artworks.id), eq(artworkImages.is_primary, true))
		)
		.leftJoin(media, eq(artworkImages.media_id, media.id))
		.where(and(eq(artworks.is_featured, true), eq(artworks.is_visible, true)))
		.orderBy(asc(artworks.order_index))
		.limit(limit);

	return result.map((row) =>
		mapArtworkToLocalized(row.artwork, locale, row.primaryImage, row.primaryImageFolder, row.seriesSlug)
	);
}

/**
 * Search artworks by title
 * @param query - Search query
 * @param locale - Language code
 * @returns Array of matching artworks
 */
export async function searchArtworks(
	query: string,
	locale: LanguageCode = 'en'
): Promise<ArtworkLocalized[]> {
	const allArtworks = await getAllArtworks(locale);
	const lowerQuery = query.toLowerCase();
	return allArtworks.filter((artwork) => artwork.title.toLowerCase().includes(lowerQuery));
}

/**
 * Get unique years from artworks
 * @returns Array of years sorted descending (excludes null years)
 */
export async function getArtworkYears(): Promise<number[]> {
	const result = await db
		.select({ year: artworks.year })
		.from(artworks)
		.where(eq(artworks.is_visible, true))
		.orderBy(desc(artworks.year));

	const years = result
		.map((r) => r.year)
		.filter((year): year is number => year !== null);

	return [...new Set(years)];
}

/**
 * Get unique techniques from artworks
 * @param locale - Language code
 * @returns Array of unique techniques
 */
export async function getArtworkTechniques(locale: LanguageCode = 'en'): Promise<string[]> {
	const result = await db
		.select({ technique: artworks.technique })
		.from(artworks)
		.where(eq(artworks.is_visible, true));

	const techniques = result
		.map((r) => r.technique)
		.filter((tech): tech is string => tech !== null && tech.trim() !== '');

	return [...new Set(techniques)].sort();
}

/**
 * Get artworks with pagination
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @param locale - Language code
 * @returns Paginated artworks with metadata
 */
export async function getArtworksPaginated(
	page: number = 1,
	pageSize: number = 12,
	locale: LanguageCode = 'en'
): Promise<{
	artworks: ArtworkLocalized[];
	total: number;
	totalPages: number;
	currentPage: number;
	hasNext: boolean;
	hasPrev: boolean;
}> {
	const allArtworks = await getAllArtworks(locale);
	const total = allArtworks.length;
	const totalPages = Math.ceil(total / pageSize);
	const currentPage = Math.max(1, Math.min(page, totalPages || 1));
	const start = (currentPage - 1) * pageSize;
	const paginatedArtworks = allArtworks.slice(start, start + pageSize);

	return {
		artworks: paginatedArtworks,
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
export async function getArtworksMetadata(): Promise<{ version: string; lastUpdated: string }> {
	// Since we're using database now, we return a version indicator
	return {
		version: '2.0-db',
		lastUpdated: new Date().toISOString()
	};
}

/**
 * Get total number of artworks
 * @returns Number of artworks
 */
export async function getArtworksCount(): Promise<number> {
	const result = await db
		.select({ id: artworks.id })
		.from(artworks)
		.where(eq(artworks.is_visible, true));

	return result.length;
}

/**
 * Get count of artworks by series
 * @param seriesSlug - Series slug
 * @returns Number of artworks in series
 */
export async function getArtworksCountBySeries(seriesSlug: string): Promise<number> {
	// First find the series by slug
	const [seriesRecord] = await db
		.select()
		.from(series)
		.where(eq(series.slug, seriesSlug))
		.limit(1);

	if (!seriesRecord) {
		return 0;
	}

	const result = await db
		.select({ id: artworks.id })
		.from(artworks)
		.where(and(eq(artworks.series_id, seriesRecord.id), eq(artworks.is_visible, true)));

	return result.length;
}
