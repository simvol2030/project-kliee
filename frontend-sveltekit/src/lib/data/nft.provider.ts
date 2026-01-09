/**
 * NFT Data Provider
 *
 * Provides NFT data from SQLite database with page content from JSON.
 *
 * @version 2.0
 * @date 2026-01-08
 */

import type { LanguageCode } from '$lib/types/layout.types';
import { db } from '$lib/server/db/client';
import { nfts, media } from '$lib/server/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import nftDataRaw from '../../../../data/nft.json';

// ============================================
// TYPES
// ============================================

export interface NftLocalized {
	id: number;
	slug: string;
	title: string;
	description: string;
	technique: string | null;
	year: number | null;
	price: string | null;
	currency: string | null;
	imageUrl: string | null;
	videoUrl: string | null;
	openSeaUrl: string | null;
	blockchain: string | null;
	isFeatured: boolean;
}

export interface NftFull {
	id: number;
	slug: string;
	title_en: string;
	title_ru: string;
	title_es: string;
	title_zh: string;
	description_en: string;
	description_ru: string;
	description_es: string;
	description_zh: string;
	technique: string | null;
	year: number | null;
	price: string | null;
	currency: string | null;
	image_id: number;
	video_id: number;
	imageUrl: string | null;
	videoUrl: string | null;
	opensea_url: string | null;
	blockchain: string | null;
	is_featured: boolean;
	is_visible: boolean;
	order_index: number;
	created_at: string | null;
}

// Page content types (from JSON)
interface TranslatedString {
	en: string;
	ru: string;
	es: string;
	zh: string;
}

interface NftPageData {
	version: string;
	lastUpdated: string;
	page: {
		hero: {
			title: TranslatedString;
			subtitle: TranslatedString;
		};
		description: TranslatedString;
	};
	openSeaCollection: {
		url: string;
		collectionName: string;
		blockchain: string;
	};
	featuredNfts: unknown[];
	cta: {
		viewCollection: TranslatedString;
	};
	seo: {
		title: TranslatedString;
		description: TranslatedString;
	};
}

const nftData = nftDataRaw as NftPageData;

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLocaleSuffix(locale: LanguageCode): string {
	return `_${locale}`;
}

function buildMediaUrl(folder: string | null, filename: string | null): string | null {
	if (!filename) return null;
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
	return `/uploads/${folder || 'uploads'}/${filename}`;
}

// ============================================
// DATABASE FUNCTIONS - Public
// ============================================

/**
 * Get all visible NFTs (for public pages)
 */
export async function getAllNfts(locale: LanguageCode = 'en'): Promise<NftLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	const results = await db
		.select({
			id: nfts.id,
			slug: nfts.slug,
			title_en: nfts.title_en,
			title_ru: nfts.title_ru,
			title_es: nfts.title_es,
			title_zh: nfts.title_zh,
			description_en: nfts.description_en,
			description_ru: nfts.description_ru,
			description_es: nfts.description_es,
			description_zh: nfts.description_zh,
			technique: nfts.technique,
			year: nfts.year,
			price: nfts.price,
			currency: nfts.currency,
			opensea_url: nfts.opensea_url,
			blockchain: nfts.blockchain,
			is_featured: nfts.is_featured,
			image_id: nfts.image_id,
			video_id: nfts.video_id
		})
		.from(nfts)
		.where(eq(nfts.is_visible, true))
		.orderBy(asc(nfts.order_index));

	// Get media URLs for each NFT
	const nftsWithMedia = await Promise.all(
		results.map(async (nft) => {
			const [imageMedia] = await db.select().from(media).where(eq(media.id, nft.image_id));
			const [videoMedia] = await db.select().from(media).where(eq(media.id, nft.video_id));

			const titleKey = `title${suffix}` as keyof typeof nft;
			const descriptionKey = `description${suffix}` as keyof typeof nft;

			return {
				id: nft.id,
				slug: nft.slug,
				title: (nft[titleKey] as string) || nft.title_en,
				description: (nft[descriptionKey] as string) || nft.description_en,
				technique: nft.technique,
				year: nft.year,
				price: nft.price,
				currency: nft.currency,
				imageUrl: buildMediaUrl(imageMedia?.folder, imageMedia?.stored_filename),
				videoUrl: buildMediaUrl(videoMedia?.folder, videoMedia?.stored_filename),
				openSeaUrl: nft.opensea_url,
				blockchain: nft.blockchain,
				isFeatured: nft.is_featured ?? false
			};
		})
	);

	return nftsWithMedia;
}

/**
 * Get featured NFTs (for homepage)
 */
export async function getFeaturedNfts(locale: LanguageCode = 'en'): Promise<NftLocalized[]> {
	const suffix = getLocaleSuffix(locale);

	const results = await db
		.select({
			id: nfts.id,
			slug: nfts.slug,
			title_en: nfts.title_en,
			title_ru: nfts.title_ru,
			title_es: nfts.title_es,
			title_zh: nfts.title_zh,
			description_en: nfts.description_en,
			description_ru: nfts.description_ru,
			description_es: nfts.description_es,
			description_zh: nfts.description_zh,
			technique: nfts.technique,
			year: nfts.year,
			price: nfts.price,
			currency: nfts.currency,
			opensea_url: nfts.opensea_url,
			blockchain: nfts.blockchain,
			is_featured: nfts.is_featured,
			image_id: nfts.image_id,
			video_id: nfts.video_id
		})
		.from(nfts)
		.where(eq(nfts.is_visible, true))
		.orderBy(asc(nfts.order_index));

	// Filter featured and get media URLs
	const featuredResults = results.filter((nft) => nft.is_featured);

	const nftsWithMedia = await Promise.all(
		featuredResults.map(async (nft) => {
			const [imageMedia] = await db.select().from(media).where(eq(media.id, nft.image_id));
			const [videoMedia] = await db.select().from(media).where(eq(media.id, nft.video_id));

			const titleKey = `title${suffix}` as keyof typeof nft;
			const descriptionKey = `description${suffix}` as keyof typeof nft;

			return {
				id: nft.id,
				slug: nft.slug,
				title: (nft[titleKey] as string) || nft.title_en,
				description: (nft[descriptionKey] as string) || nft.description_en,
				technique: nft.technique,
				year: nft.year,
				price: nft.price,
				currency: nft.currency,
				imageUrl: buildMediaUrl(imageMedia?.folder, imageMedia?.stored_filename),
				videoUrl: buildMediaUrl(videoMedia?.folder, videoMedia?.stored_filename),
				openSeaUrl: nft.opensea_url,
				blockchain: nft.blockchain,
				isFeatured: true
			};
		})
	);

	return nftsWithMedia;
}

/**
 * Get NFT by slug (for detail page)
 */
export async function getNftBySlug(
	slug: string,
	locale: LanguageCode = 'en'
): Promise<NftLocalized | undefined> {
	const suffix = getLocaleSuffix(locale);

	const [result] = await db
		.select({
			id: nfts.id,
			slug: nfts.slug,
			title_en: nfts.title_en,
			title_ru: nfts.title_ru,
			title_es: nfts.title_es,
			title_zh: nfts.title_zh,
			description_en: nfts.description_en,
			description_ru: nfts.description_ru,
			description_es: nfts.description_es,
			description_zh: nfts.description_zh,
			technique: nfts.technique,
			year: nfts.year,
			price: nfts.price,
			currency: nfts.currency,
			opensea_url: nfts.opensea_url,
			blockchain: nfts.blockchain,
			is_featured: nfts.is_featured,
			is_visible: nfts.is_visible,
			image_id: nfts.image_id,
			video_id: nfts.video_id
		})
		.from(nfts)
		.where(eq(nfts.slug, slug));

	if (!result || !result.is_visible) return undefined;

	const [imageMedia] = await db.select().from(media).where(eq(media.id, result.image_id));
	const [videoMedia] = await db.select().from(media).where(eq(media.id, result.video_id));

	const titleKey = `title${suffix}` as keyof typeof result;
	const descriptionKey = `description${suffix}` as keyof typeof result;

	return {
		id: result.id,
		slug: result.slug,
		title: (result[titleKey] as string) || result.title_en,
		description: (result[descriptionKey] as string) || result.description_en,
		technique: result.technique,
		year: result.year,
		price: result.price,
		currency: result.currency,
		imageUrl: buildMediaUrl(imageMedia?.folder, imageMedia?.stored_filename),
		videoUrl: buildMediaUrl(videoMedia?.folder, videoMedia?.stored_filename),
		openSeaUrl: result.opensea_url,
		blockchain: result.blockchain,
		isFeatured: result.is_featured ?? false
	};
}

// ============================================
// DATABASE FUNCTIONS - Admin
// ============================================

/**
 * Get all NFTs for admin (includes non-visible)
 */
export async function getAllNftsAdmin(): Promise<NftFull[]> {
	const results = await db
		.select()
		.from(nfts)
		.orderBy(desc(nfts.created_at));

	const nftsWithMedia = await Promise.all(
		results.map(async (nft) => {
			const [imageMedia] = await db.select().from(media).where(eq(media.id, nft.image_id));
			const [videoMedia] = await db.select().from(media).where(eq(media.id, nft.video_id));

			return {
				...nft,
				is_featured: nft.is_featured ?? false,
				is_visible: nft.is_visible ?? true,
				order_index: nft.order_index ?? 0,
				imageUrl: buildMediaUrl(imageMedia?.folder, imageMedia?.stored_filename),
				videoUrl: buildMediaUrl(videoMedia?.folder, videoMedia?.stored_filename)
			};
		})
	);

	return nftsWithMedia;
}

/**
 * Get NFT by ID for admin
 */
export async function getNftByIdAdmin(id: number): Promise<NftFull | undefined> {
	const [result] = await db.select().from(nfts).where(eq(nfts.id, id));

	if (!result) return undefined;

	const [imageMedia] = await db.select().from(media).where(eq(media.id, result.image_id));
	const [videoMedia] = await db.select().from(media).where(eq(media.id, result.video_id));

	return {
		...result,
		is_featured: result.is_featured ?? false,
		is_visible: result.is_visible ?? true,
		order_index: result.order_index ?? 0,
		imageUrl: buildMediaUrl(imageMedia?.folder, imageMedia?.stored_filename),
		videoUrl: buildMediaUrl(videoMedia?.folder, videoMedia?.stored_filename)
	};
}

// ============================================
// PAGE CONTENT FUNCTIONS (from JSON)
// ============================================

/**
 * Get page content with localized strings
 */
export function getPageContent(locale: LanguageCode = 'en') {
	return {
		hero: {
			title: nftData.page.hero.title[locale],
			subtitle: nftData.page.hero.subtitle[locale]
		},
		description: nftData.page.description[locale]
	};
}

/**
 * Get OpenSea collection info
 */
export function getOpenSeaCollection() {
	return nftData.openSeaCollection;
}

/**
 * Get CTA text
 */
export function getCtaText(locale: LanguageCode = 'en') {
	return {
		viewCollection: nftData.cta.viewCollection[locale]
	};
}

/**
 * Get SEO data with localized strings
 */
export function getSeoData(locale: LanguageCode = 'en') {
	return {
		title: nftData.seo.title[locale],
		description: nftData.seo.description[locale]
	};
}

/**
 * Get NFT metadata
 */
export function getNftMetadata() {
	return {
		version: nftData.version,
		lastUpdated: nftData.lastUpdated
	};
}
