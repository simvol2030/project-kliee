/**
 * Series Data Provider
 *
 * Async data provider for series/collections using Drizzle ORM.
 * Migrated from JSON to SQLite database.
 *
 * @version 2.0
 * @date 2025-12-27
 */

import { db } from '$lib/server/db/client';
import { series, artworks, media } from '$lib/server/db/schema';
import { eq, asc, count } from 'drizzle-orm';
import type { LanguageCode } from '$lib/utils/currency';

/**
 * Localized series type for frontend consumption
 */
export interface SeriesLocalized {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	coverImage: string;
	artworkCount: number;
	order: number;
	isFeatured: boolean;
	showInShop: boolean;
}

/**
 * Full series data with all locales (for admin)
 */
export interface SeriesFull {
	id: string;
	slug: string;
	name_en: string;
	name_ru: string;
	name_es: string;
	name_zh: string;
	description_en: string | null;
	description_ru: string | null;
	description_es: string | null;
	description_zh: string | null;
	cover_image_id: number | null;
	coverImageUrl: string | null;
	order_index: number;
	is_visible: boolean;
	is_featured: boolean;
	show_in_shop: boolean;
	artworkCount: number;
	created_at: string | null;
	updated_at: string | null;
}

/**
 * Map locale code to database field suffix
 */
function getLocaleSuffix(locale: LanguageCode): 'en' | 'ru' | 'es' | 'zh' {
	const validLocales = ['en', 'ru', 'es', 'zh'] as const;
	return validLocales.includes(locale as typeof validLocales[number])
		? (locale as 'en' | 'ru' | 'es' | 'zh')
		: 'en';
}

/**
 * Build image URL from media record
 */
function buildImageUrl(mediaRecord: { folder: string | null; stored_filename: string } | null): string {
	if (!mediaRecord) return '/images/placeholder-artwork.svg';

	// Normalize inputs
	const filename = mediaRecord.stored_filename?.trim() || '';
	const folder = mediaRecord.folder?.trim() || null;

	// Old images: stored_filename starts with /images/ - use directly
	if (filename.startsWith('/images/')) {
		return filename;
	}
	if (filename.startsWith('/')) {
		return `/uploads${filename}`;
	}
	if (filename.includes('/')) {
		return `/uploads/${filename}`;
	}

	// filename is just a filename - check if folder is a static images path
	if (folder) {
		if (folder.startsWith('/images/') || folder.startsWith('images/')) {
			const normalizedFolder = folder.startsWith('/') ? folder : `/${folder}`;
			return `${normalizedFolder.replace(/\/$/, '')}/${filename}`;
		}
	}

	return `/uploads/${folder || 'uploads'}/${filename}`;
}

/**
 * Get artwork count for a series
 */
async function getArtworkCountForSeries(seriesId: string): Promise<number> {
	const result = await db
		.select({ count: count() })
		.from(artworks)
		.where(eq(artworks.series_id, seriesId));
	return result[0]?.count || 0;
}

/**
 * Get all series with localized strings
 * @param locale - Language code (en, ru, es, zh)
 * @returns Array of series sorted by order
 */
export async function getAllSeries(locale: LanguageCode = 'en'): Promise<SeriesLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	const allSeries = await db
		.select({
			id: series.id,
			slug: series.slug,
			name_en: series.name_en,
			name_ru: series.name_ru,
			name_es: series.name_es,
			name_zh: series.name_zh,
			description_en: series.description_en,
			description_ru: series.description_ru,
			description_es: series.description_es,
			description_zh: series.description_zh,
			cover_image_id: series.cover_image_id,
			order_index: series.order_index,
			is_visible: series.is_visible,
			is_featured: series.is_featured,
			show_in_shop: series.show_in_shop
		})
		.from(series)
		.where(eq(series.is_visible, true))
		.orderBy(asc(series.order_index));

	// Get cover images and artwork counts
	const result: SeriesLocalized[] = [];

	for (const s of allSeries) {
		// Get cover image
		let coverImageUrl = '/images/placeholder-artwork.svg';
		if (s.cover_image_id) {
			const mediaRecord = await db
				.select({ folder: media.folder, stored_filename: media.stored_filename })
				.from(media)
				.where(eq(media.id, s.cover_image_id))
				.limit(1);
			if (mediaRecord[0]) {
				coverImageUrl = buildImageUrl(mediaRecord[0]);
			}
		}

		// Get artwork count
		const artworkCount = await getArtworkCountForSeries(s.id);

		// Map localized fields
		const titleKey = `name_${suffix}` as const;
		const descKey = `description_${suffix}` as const;

		result.push({
			id: s.id,
			slug: s.slug,
			title: s[titleKey] || s.name_en,
			description: s[descKey] || s.description_en,
			coverImage: coverImageUrl,
			artworkCount,
			order: s.order_index ?? 0,
			isFeatured: s.is_featured ?? false,
			showInShop: s.show_in_shop ?? false
		});
	}

	return result;
}

/**
 * Get all series for admin (all locales, all visibility)
 * @returns Array of series with full data
 */
export async function getAllSeriesAdmin(): Promise<SeriesFull[]> {
	const allSeries = await db
		.select()
		.from(series)
		.orderBy(asc(series.order_index));

	const result: SeriesFull[] = [];

	for (const s of allSeries) {
		// Get cover image
		let coverImageUrl: string | null = null;
		if (s.cover_image_id) {
			const mediaRecord = await db
				.select({ folder: media.folder, stored_filename: media.stored_filename })
				.from(media)
				.where(eq(media.id, s.cover_image_id))
				.limit(1);
			if (mediaRecord[0]) {
				coverImageUrl = buildImageUrl(mediaRecord[0]);
			}
		}

		// Get artwork count
		const artworkCount = await getArtworkCountForSeries(s.id);

		result.push({
			id: s.id,
			slug: s.slug,
			name_en: s.name_en,
			name_ru: s.name_ru,
			name_es: s.name_es,
			name_zh: s.name_zh,
			description_en: s.description_en,
			description_ru: s.description_ru,
			description_es: s.description_es,
			description_zh: s.description_zh,
			cover_image_id: s.cover_image_id,
			coverImageUrl,
			order_index: s.order_index ?? 0,
			is_visible: s.is_visible ?? true,
			is_featured: s.is_featured ?? false,
			show_in_shop: s.show_in_shop ?? false,
			artworkCount,
			created_at: s.created_at,
			updated_at: s.updated_at
		});
	}

	return result;
}

/**
 * Get a single series by slug
 * @param slug - Series slug
 * @param locale - Language code
 * @returns Series or undefined if not found
 */
export async function getSeriesBySlug(
	slug: string,
	locale: LanguageCode = 'en'
): Promise<SeriesLocalized | undefined> {
	const suffix = getLocaleSuffix(locale);

	const seriesRecord = await db
		.select()
		.from(series)
		.where(eq(series.slug, slug))
		.limit(1);

	if (!seriesRecord[0]) return undefined;
	const s = seriesRecord[0];

	// Only return visible series
	if (!s.is_visible) return undefined;

	// Get cover image
	let coverImageUrl = '/images/placeholder-artwork.svg';
	if (s.cover_image_id) {
		const mediaRecord = await db
			.select({ folder: media.folder, stored_filename: media.stored_filename })
			.from(media)
			.where(eq(media.id, s.cover_image_id))
			.limit(1);
		if (mediaRecord[0]) {
			coverImageUrl = buildImageUrl(mediaRecord[0]);
		}
	}

	// Get artwork count
	const artworkCount = await getArtworkCountForSeries(s.id);

	// Map localized fields
	const titleMap = { en: s.name_en, ru: s.name_ru, es: s.name_es, zh: s.name_zh };
	const descMap = { en: s.description_en, ru: s.description_ru, es: s.description_es, zh: s.description_zh };

	return {
		id: s.id,
		slug: s.slug,
		title: titleMap[suffix] || s.name_en,
		description: descMap[suffix] || s.description_en,
		coverImage: coverImageUrl,
		artworkCount,
		order: s.order_index ?? 0,
		isFeatured: s.is_featured ?? false,
		showInShop: s.show_in_shop ?? false
	};
}

/**
 * Get a single series by ID
 * @param id - Series ID
 * @param locale - Language code
 * @returns Series or undefined if not found
 */
export async function getSeriesById(
	id: string,
	locale: LanguageCode = 'en'
): Promise<SeriesLocalized | undefined> {
	const suffix = getLocaleSuffix(locale);

	const seriesRecord = await db
		.select()
		.from(series)
		.where(eq(series.id, id))
		.limit(1);

	if (!seriesRecord[0]) return undefined;
	const s = seriesRecord[0];

	// Get cover image
	let coverImageUrl = '/images/placeholder-artwork.svg';
	if (s.cover_image_id) {
		const mediaRecord = await db
			.select({ folder: media.folder, stored_filename: media.stored_filename })
			.from(media)
			.where(eq(media.id, s.cover_image_id))
			.limit(1);
		if (mediaRecord[0]) {
			coverImageUrl = buildImageUrl(mediaRecord[0]);
		}
	}

	// Get artwork count
	const artworkCount = await getArtworkCountForSeries(s.id);

	// Map localized fields
	const titleMap = { en: s.name_en, ru: s.name_ru, es: s.name_es, zh: s.name_zh };
	const descMap = { en: s.description_en, ru: s.description_ru, es: s.description_es, zh: s.description_zh };

	return {
		id: s.id,
		slug: s.slug,
		title: titleMap[suffix] || s.name_en,
		description: descMap[suffix] || s.description_en,
		coverImage: coverImageUrl,
		artworkCount,
		order: s.order_index ?? 0,
		isFeatured: s.is_featured ?? false,
		showInShop: s.show_in_shop ?? false
	};
}

/**
 * Get series by ID for admin (all fields)
 */
export async function getSeriesByIdAdmin(id: string): Promise<SeriesFull | undefined> {
	const seriesRecord = await db
		.select()
		.from(series)
		.where(eq(series.id, id))
		.limit(1);

	if (!seriesRecord[0]) return undefined;
	const s = seriesRecord[0];

	// Get cover image
	let coverImageUrl: string | null = null;
	if (s.cover_image_id) {
		const mediaRecord = await db
			.select({ folder: media.folder, stored_filename: media.stored_filename })
			.from(media)
			.where(eq(media.id, s.cover_image_id))
			.limit(1);
		if (mediaRecord[0]) {
			coverImageUrl = buildImageUrl(mediaRecord[0]);
		}
	}

	// Get artwork count
	const artworkCount = await getArtworkCountForSeries(s.id);

	return {
		id: s.id,
		slug: s.slug,
		name_en: s.name_en,
		name_ru: s.name_ru,
		name_es: s.name_es,
		name_zh: s.name_zh,
		description_en: s.description_en,
		description_ru: s.description_ru,
		description_es: s.description_es,
		description_zh: s.description_zh,
		cover_image_id: s.cover_image_id,
		coverImageUrl,
		order_index: s.order_index ?? 0,
		is_visible: s.is_visible ?? true,
		is_featured: s.is_featured ?? false,
		show_in_shop: s.show_in_shop ?? false,
		artworkCount,
		created_at: s.created_at,
		updated_at: s.updated_at
	};
}

/**
 * Get total number of series (visible only)
 * @returns Number of series
 */
export async function getSeriesCount(): Promise<number> {
	const result = await db
		.select({ count: count() })
		.from(series)
		.where(eq(series.is_visible, true));
	return result[0]?.count || 0;
}

/**
 * Check if a series exists by slug
 * @param slug - Series slug
 * @returns Boolean indicating if series exists
 */
export async function seriesExists(slug: string): Promise<boolean> {
	const result = await db
		.select({ id: series.id })
		.from(series)
		.where(eq(series.slug, slug))
		.limit(1);
	return result.length > 0;
}

/**
 * Get featured series for homepage
 * @param locale - Language code
 * @param limit - Maximum number of series to return
 */
export async function getFeaturedSeries(
	locale: LanguageCode = 'en',
	limit = 4
): Promise<SeriesLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	const featuredSeries = await db
		.select()
		.from(series)
		.where(eq(series.is_featured, true))
		.orderBy(asc(series.order_index))
		.limit(limit);

	const result: SeriesLocalized[] = [];

	for (const s of featuredSeries) {
		if (!s.is_visible) continue;

		// Get cover image
		let coverImageUrl = '/images/placeholder-artwork.svg';
		if (s.cover_image_id) {
			const mediaRecord = await db
				.select({ folder: media.folder, stored_filename: media.stored_filename })
				.from(media)
				.where(eq(media.id, s.cover_image_id))
				.limit(1);
			if (mediaRecord[0]) {
				coverImageUrl = buildImageUrl(mediaRecord[0]);
			}
		}

		// Get artwork count
		const artworkCount = await getArtworkCountForSeries(s.id);

		// Map localized fields
		const titleMap = { en: s.name_en, ru: s.name_ru, es: s.name_es, zh: s.name_zh };
		const descMap = { en: s.description_en, ru: s.description_ru, es: s.description_es, zh: s.description_zh };

		result.push({
			id: s.id,
			slug: s.slug,
			title: titleMap[suffix] || s.name_en,
			description: descMap[suffix] || s.description_en,
			coverImage: coverImageUrl,
			artworkCount,
			order: s.order_index ?? 0,
			isFeatured: true,
			showInShop: s.show_in_shop ?? false
		});
	}

	return result;
}
