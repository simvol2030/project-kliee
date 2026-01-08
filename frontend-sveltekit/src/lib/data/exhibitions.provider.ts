/**
 * Exhibitions Data Provider
 *
 * Async data provider for exhibitions using Drizzle ORM.
 * Migrated from JSON to SQLite database.
 *
 * @version 2.0
 * @date 2025-12-27
 */

import { db } from '$lib/server/db/client';
import { exhibitions, exhibitionImages, media } from '$lib/server/db/schema';
import { eq, desc, asc, and, or, count, ne } from 'drizzle-orm';
import type { LanguageCode } from '$lib/utils/currency';

/**
 * Localized exhibition type for frontend consumption
 */
export interface ExhibitionLocalized {
	id: number;
	slug: string | null;
	year: number | null;
	title: string;
	description: string | null;
	venue: string | null;
	city: string | null;
	country: string | null;
	type: string;
	isCurrent: boolean;
	isFeatured: boolean;
	coverImage: string | null;
	startDate: string | null;
	endDate: string | null;
	galleryLink: string | null;
}

/**
 * Full exhibition data with all locales (for admin)
 */
export interface ExhibitionFull {
	id: number;
	slug: string | null;
	type: string;
	year: number | null;
	title_en: string;
	title_ru: string;
	title_es: string;
	title_zh: string;
	description_en: string | null;
	description_ru: string | null;
	description_es: string | null;
	description_zh: string | null;
	venue_en: string | null;
	venue_ru: string | null;
	venue_es: string | null;
	venue_zh: string | null;
	city: string | null;
	country: string | null;
	address: string | null;
	start_date: string | null;
	end_date: string | null;
	opening_hours: string | null;
	cover_image_id: number | null;
	coverImageUrl: string | null;
	gallery_link: string | null;
	is_current: boolean;
	is_featured: boolean;
	is_visible: boolean;
	order_index: number;
	created_at: string | null;
}

/**
 * Exhibition image type
 */
export interface ExhibitionImageLocalized {
	id: number;
	url: string;
	caption: string | null;
	order: number;
	mimeType: string | null;
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
function buildImageUrl(mediaRecord: { folder: string | null; stored_filename: string } | null): string | null {
	if (!mediaRecord) return null;
	const folder = mediaRecord.folder || 'uploads';
	return `/uploads/${folder}/${mediaRecord.stored_filename}`;
}

/**
 * Get cover image URL for exhibition
 */
async function getCoverImageUrl(coverImageId: number | null): Promise<string | null> {
	if (!coverImageId) return null;

	const mediaRecord = await db
		.select({ folder: media.folder, stored_filename: media.stored_filename })
		.from(media)
		.where(eq(media.id, coverImageId))
		.limit(1);

	return mediaRecord[0] ? buildImageUrl(mediaRecord[0]) : null;
}

/**
 * Map DB record to localized exhibition
 */
function mapToLocalized(
	exhibition: typeof exhibitions.$inferSelect,
	locale: 'en' | 'ru' | 'es' | 'zh',
	coverImageUrl: string | null
): ExhibitionLocalized {
	const titleMap = { en: exhibition.title_en, ru: exhibition.title_ru, es: exhibition.title_es, zh: exhibition.title_zh };
	const descMap = { en: exhibition.description_en, ru: exhibition.description_ru, es: exhibition.description_es, zh: exhibition.description_zh };
	const venueMap = { en: exhibition.venue_en, ru: exhibition.venue_ru, es: exhibition.venue_es, zh: exhibition.venue_zh };

	return {
		id: exhibition.id,
		slug: exhibition.slug,
		year: exhibition.year,
		title: titleMap[locale] || exhibition.title_en,
		description: descMap[locale] || exhibition.description_en,
		venue: venueMap[locale] || exhibition.venue_en,
		city: exhibition.city,
		country: exhibition.country,
		type: exhibition.type || 'solo',
		isCurrent: exhibition.is_current ?? false,
		isFeatured: exhibition.is_featured ?? false,
		coverImage: coverImageUrl,
		startDate: exhibition.start_date,
		endDate: exhibition.end_date,
		galleryLink: exhibition.gallery_link
	};
}

/**
 * Get all exhibitions with localized strings (excluding art fairs)
 * @param locale - Language code (en, ru, es, zh)
 * @returns Array of exhibitions sorted by year (newest first)
 */
export async function getAllExhibitions(locale: LanguageCode = 'en'): Promise<ExhibitionLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	// Exclude art fairs (type = 'fair' or 'biennale')
	const allExhibitions = await db
		.select()
		.from(exhibitions)
		.where(
			and(
				eq(exhibitions.is_visible, true),
				ne(exhibitions.type, 'fair'),
				ne(exhibitions.type, 'biennale')
			)
		)
		.orderBy(desc(exhibitions.year), asc(exhibitions.order_index));

	const result: ExhibitionLocalized[] = [];

	for (const e of allExhibitions) {
		const coverImageUrl = await getCoverImageUrl(e.cover_image_id);
		result.push(mapToLocalized(e, suffix, coverImageUrl));
	}

	return result;
}

/**
 * Get all exhibitions for admin (all types, all visibility)
 */
export async function getAllExhibitionsAdmin(): Promise<ExhibitionFull[]> {
	const allExhibitions = await db
		.select()
		.from(exhibitions)
		.orderBy(desc(exhibitions.year), asc(exhibitions.order_index));

	const result: ExhibitionFull[] = [];

	for (const e of allExhibitions) {
		const coverImageUrl = await getCoverImageUrl(e.cover_image_id);

		result.push({
			id: e.id,
			slug: e.slug,
			type: e.type || 'solo',
			year: e.year,
			title_en: e.title_en,
			title_ru: e.title_ru,
			title_es: e.title_es,
			title_zh: e.title_zh,
			description_en: e.description_en,
			description_ru: e.description_ru,
			description_es: e.description_es,
			description_zh: e.description_zh,
			venue_en: e.venue_en,
			venue_ru: e.venue_ru,
			venue_es: e.venue_es,
			venue_zh: e.venue_zh,
			city: e.city,
			country: e.country,
			address: e.address,
			start_date: e.start_date,
			end_date: e.end_date,
			opening_hours: e.opening_hours,
			cover_image_id: e.cover_image_id,
			coverImageUrl,
			gallery_link: e.gallery_link,
			is_current: e.is_current ?? false,
			is_featured: e.is_featured ?? false,
			is_visible: e.is_visible ?? true,
			order_index: e.order_index ?? 0,
			created_at: e.created_at
		});
	}

	return result;
}

/**
 * Get current exhibitions
 * @param locale - Language code
 * @returns Array of currently running exhibitions
 */
export async function getCurrentExhibitions(locale: LanguageCode = 'en'): Promise<ExhibitionLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	const currentExhibitions = await db
		.select()
		.from(exhibitions)
		.where(
			and(
				eq(exhibitions.is_visible, true),
				eq(exhibitions.is_current, true)
			)
		)
		.orderBy(desc(exhibitions.year), asc(exhibitions.order_index));

	const result: ExhibitionLocalized[] = [];

	for (const e of currentExhibitions) {
		const coverImageUrl = await getCoverImageUrl(e.cover_image_id);
		result.push(mapToLocalized(e, suffix, coverImageUrl));
	}

	return result;
}

/**
 * Get past exhibitions (excluding art fairs)
 * @param locale - Language code
 * @returns Array of past exhibitions
 */
export async function getPastExhibitions(locale: LanguageCode = 'en'): Promise<ExhibitionLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	const pastExhibitions = await db
		.select()
		.from(exhibitions)
		.where(
			and(
				eq(exhibitions.is_visible, true),
				eq(exhibitions.is_current, false),
				ne(exhibitions.type, 'fair'),
				ne(exhibitions.type, 'biennale')
			)
		)
		.orderBy(desc(exhibitions.year), asc(exhibitions.order_index));

	const result: ExhibitionLocalized[] = [];

	for (const e of pastExhibitions) {
		const coverImageUrl = await getCoverImageUrl(e.cover_image_id);
		result.push(mapToLocalized(e, suffix, coverImageUrl));
	}

	return result;
}

/**
 * Get art fairs and biennales
 * @param locale - Language code
 * @returns Array of art fairs
 */
export async function getArtFairs(locale: LanguageCode = 'en'): Promise<ExhibitionLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	const artFairs = await db
		.select()
		.from(exhibitions)
		.where(
			and(
				eq(exhibitions.is_visible, true),
				or(
					eq(exhibitions.type, 'fair'),
					eq(exhibitions.type, 'biennale')
				)
			)
		)
		.orderBy(desc(exhibitions.year), asc(exhibitions.order_index));

	const result: ExhibitionLocalized[] = [];

	for (const e of artFairs) {
		const coverImageUrl = await getCoverImageUrl(e.cover_image_id);
		result.push(mapToLocalized(e, suffix, coverImageUrl));
	}

	return result;
}

/**
 * Get exhibition by slug
 * @param slug - Exhibition slug
 * @param locale - Language code
 * @returns Exhibition or undefined
 */
export async function getExhibitionBySlug(
	slug: string,
	locale: LanguageCode = 'en'
): Promise<ExhibitionLocalized | undefined> {
	const suffix = getLocaleSuffix(locale);

	const [exhibition] = await db
		.select()
		.from(exhibitions)
		.where(eq(exhibitions.slug, slug))
		.limit(1);

	if (!exhibition) return undefined;
	if (!exhibition.is_visible) return undefined;

	const coverImageUrl = await getCoverImageUrl(exhibition.cover_image_id);
	return mapToLocalized(exhibition, suffix, coverImageUrl);
}

/**
 * Get exhibition by ID
 * @param id - Exhibition ID
 * @param locale - Language code
 * @returns Exhibition or undefined
 */
export async function getExhibitionById(
	id: number,
	locale: LanguageCode = 'en'
): Promise<ExhibitionLocalized | undefined> {
	const suffix = getLocaleSuffix(locale);

	const [exhibition] = await db
		.select()
		.from(exhibitions)
		.where(eq(exhibitions.id, id))
		.limit(1);

	if (!exhibition) return undefined;

	const coverImageUrl = await getCoverImageUrl(exhibition.cover_image_id);
	return mapToLocalized(exhibition, suffix, coverImageUrl);
}

/**
 * Get exhibition by ID for admin (all fields)
 */
export async function getExhibitionByIdAdmin(id: number): Promise<ExhibitionFull | undefined> {
	const [exhibition] = await db
		.select()
		.from(exhibitions)
		.where(eq(exhibitions.id, id))
		.limit(1);

	if (!exhibition) return undefined;

	const coverImageUrl = await getCoverImageUrl(exhibition.cover_image_id);

	return {
		id: exhibition.id,
		slug: exhibition.slug,
		type: exhibition.type || 'solo',
		year: exhibition.year,
		title_en: exhibition.title_en,
		title_ru: exhibition.title_ru,
		title_es: exhibition.title_es,
		title_zh: exhibition.title_zh,
		description_en: exhibition.description_en,
		description_ru: exhibition.description_ru,
		description_es: exhibition.description_es,
		description_zh: exhibition.description_zh,
		venue_en: exhibition.venue_en,
		venue_ru: exhibition.venue_ru,
		venue_es: exhibition.venue_es,
		venue_zh: exhibition.venue_zh,
		city: exhibition.city,
		country: exhibition.country,
		address: exhibition.address,
		start_date: exhibition.start_date,
		end_date: exhibition.end_date,
		opening_hours: exhibition.opening_hours,
		cover_image_id: exhibition.cover_image_id,
		coverImageUrl,
		gallery_link: exhibition.gallery_link,
		is_current: exhibition.is_current ?? false,
		is_featured: exhibition.is_featured ?? false,
		is_visible: exhibition.is_visible ?? true,
		order_index: exhibition.order_index ?? 0,
		created_at: exhibition.created_at
	};
}

/**
 * Get exhibition gallery images
 * @param exhibitionId - Exhibition ID
 * @param locale - Language code
 * @returns Array of images
 */
export async function getExhibitionImages(
	exhibitionId: number,
	locale: LanguageCode = 'en'
): Promise<ExhibitionImageLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	const images = await db
		.select({
			id: exhibitionImages.id,
			mediaId: exhibitionImages.media_id,
			orderIndex: exhibitionImages.order_index,
			captionEn: exhibitionImages.caption_en,
			captionRu: exhibitionImages.caption_ru,
			captionEs: exhibitionImages.caption_es,
			captionZh: exhibitionImages.caption_zh,
			storedFilename: media.stored_filename,
			folder: media.folder,
			mimeType: media.mime_type
		})
		.from(exhibitionImages)
		.leftJoin(media, eq(exhibitionImages.media_id, media.id))
		.where(eq(exhibitionImages.exhibition_id, exhibitionId))
		.orderBy(asc(exhibitionImages.order_index));

	return images.map((img) => {
		const captionMap = { en: img.captionEn, ru: img.captionRu, es: img.captionEs, zh: img.captionZh };
		const url = buildImageUrl(
			img.storedFilename ? { folder: img.folder, stored_filename: img.storedFilename } : null
		);

		return {
			id: img.id,
			url: url || '/images/placeholder-artwork.jpg',
			caption: captionMap[suffix] || img.captionEn,
			order: img.orderIndex ?? 0,
			mimeType: img.mimeType
		};
	});
}

/**
 * Get featured exhibitions
 * @param locale - Language code
 * @param limit - Max number to return
 */
export async function getFeaturedExhibitions(
	locale: LanguageCode = 'en',
	limit = 4
): Promise<ExhibitionLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	const featured = await db
		.select()
		.from(exhibitions)
		.where(
			and(
				eq(exhibitions.is_visible, true),
				eq(exhibitions.is_featured, true)
			)
		)
		.orderBy(desc(exhibitions.year), asc(exhibitions.order_index))
		.limit(limit);

	const result: ExhibitionLocalized[] = [];

	for (const e of featured) {
		const coverImageUrl = await getCoverImageUrl(e.cover_image_id);
		result.push(mapToLocalized(e, suffix, coverImageUrl));
	}

	return result;
}

/**
 * Get exhibitions by year
 * @param year - Year
 * @param locale - Language code
 */
export async function getExhibitionsByYear(
	year: number,
	locale: LanguageCode = 'en'
): Promise<ExhibitionLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	const yearExhibitions = await db
		.select()
		.from(exhibitions)
		.where(
			and(
				eq(exhibitions.is_visible, true),
				eq(exhibitions.year, year)
			)
		)
		.orderBy(asc(exhibitions.order_index));

	const result: ExhibitionLocalized[] = [];

	for (const e of yearExhibitions) {
		const coverImageUrl = await getCoverImageUrl(e.cover_image_id);
		result.push(mapToLocalized(e, suffix, coverImageUrl));
	}

	return result;
}

/**
 * Get exhibitions by type
 * @param type - Exhibition type
 * @param locale - Language code
 */
export async function getExhibitionsByType(
	type: string,
	locale: LanguageCode = 'en'
): Promise<ExhibitionLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	const typeExhibitions = await db
		.select()
		.from(exhibitions)
		.where(
			and(
				eq(exhibitions.is_visible, true),
				eq(exhibitions.type, type)
			)
		)
		.orderBy(desc(exhibitions.year), asc(exhibitions.order_index));

	const result: ExhibitionLocalized[] = [];

	for (const e of typeExhibitions) {
		const coverImageUrl = await getCoverImageUrl(e.cover_image_id);
		result.push(mapToLocalized(e, suffix, coverImageUrl));
	}

	return result;
}

/**
 * Get unique years from exhibitions
 */
export async function getExhibitionYears(): Promise<number[]> {
	const exhibitions_data = await db
		.select({ year: exhibitions.year })
		.from(exhibitions)
		.where(eq(exhibitions.is_visible, true))
		.orderBy(desc(exhibitions.year));

	const years = exhibitions_data
		.map((r) => r.year)
		.filter((year): year is number => year !== null);

	return [...new Set(years)];
}

/**
 * Get total number of exhibitions
 */
export async function getExhibitionsCount(): Promise<number> {
	const result = await db
		.select({ count: count() })
		.from(exhibitions)
		.where(eq(exhibitions.is_visible, true));
	return result[0]?.count || 0;
}

/**
 * Get total number of art fairs
 */
export async function getArtFairsCount(): Promise<number> {
	const result = await db
		.select({ count: count() })
		.from(exhibitions)
		.where(
			and(
				eq(exhibitions.is_visible, true),
				or(
					eq(exhibitions.type, 'fair'),
					eq(exhibitions.type, 'biennale')
				)
			)
		);
	return result[0]?.count || 0;
}
