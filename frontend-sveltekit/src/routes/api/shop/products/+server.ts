import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { artworks, artworkImages, media, series, type Artwork, type Series } from '$lib/server/db/schema';
import { eq, and, gte, lte, desc, asc, sql, inArray } from 'drizzle-orm';

export interface ShopProduct {
	id: string;
	slug: string | null;
	title_en: string;
	title_ru: string;
	title_es: string;
	title_zh: string;
	description_en: string | null;
	description_ru: string | null;
	description_es: string | null;
	description_zh: string | null;
	technique: string | null;
	dimensions: string | null;
	year: number | null;
	price: number | null;
	currency: string | null;
	is_featured: boolean | null;
	is_for_sale: boolean | null;
	series: {
		id: string;
		slug: string;
		name_en: string;
		name_ru: string;
		name_es: string;
		name_zh: string;
	} | null;
	primary_image: {
		id: number;
		stored_filename: string;
		alt_en: string | null;
		alt_ru: string | null;
		alt_es: string | null;
		alt_zh: string | null;
		width: number | null;
		height: number | null;
	} | null;
	created_at: string | null;
}

export interface ProductsResponse {
	products: ShopProduct[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		hasMore: boolean;
	};
}

type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'featured';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse query parameters
		const idsParam = url.searchParams.get('ids');
		const seriesId = url.searchParams.get('series_id');
		const minPrice = url.searchParams.get('min_price');
		const maxPrice = url.searchParams.get('max_price');
		const sort = (url.searchParams.get('sort') || 'featured') as SortOption;
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '12')));
		const offset = (page - 1) * limit;

		// Build conditions
		const conditions = [eq(artworks.is_visible, true)];

		// Filter by specific IDs (for wishlist)
		if (idsParam) {
			const ids = idsParam.split(",").map((id) => id.trim()).filter((id) => id.length > 0);
			if (ids.length > 0) {
				conditions.push(inArray(artworks.id, ids));
			}
		}

		// Filter by series
		if (seriesId) {
			const seriesIdStr = seriesId;
			if (seriesIdStr) {
				conditions.push(eq(artworks.series_id, seriesIdStr));
			}
		}

		// Filter by price range
		if (minPrice) {
			const minPriceNum = parseInt(minPrice);
			if (!isNaN(minPriceNum)) {
				conditions.push(gte(artworks.price, minPriceNum));
			}
		}
		if (maxPrice) {
			const maxPriceNum = parseInt(maxPrice);
			if (!isNaN(maxPriceNum)) {
				conditions.push(lte(artworks.price, maxPriceNum));
			}
		}

		// Get total count
		const countResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(artworks)
			.where(and(...conditions));
		const total = countResult[0]?.count || 0;

		// Determine sort order
		let orderBy;
		switch (sort) {
			case 'price_asc':
				orderBy = asc(artworks.price);
				break;
			case 'price_desc':
				orderBy = desc(artworks.price);
				break;
			case 'newest':
				orderBy = desc(artworks.created_at);
				break;
			case 'featured':
			default:
				// Featured first, then by order_index
				orderBy = [desc(artworks.is_featured), asc(artworks.order_index), desc(artworks.created_at)];
				break;
		}

		// Fetch products with related data
		const productsRaw = await db
			.select({
				artwork: artworks,
				series: series
			})
			.from(artworks)
			.leftJoin(series, eq(artworks.series_id, series.id))
			.where(and(...conditions))
			.orderBy(...(Array.isArray(orderBy) ? orderBy : [orderBy]))
			.limit(limit)
			.offset(offset);

		// Get primary images for all fetched products
		const productIds = productsRaw.map((p: { artwork: Artwork; series: Series | null }) => p.artwork.id);

		let imagesMap: Map<string, {
			id: number;
			stored_filename: string;
			alt_en: string | null;
			alt_ru: string | null;
			alt_es: string | null;
			alt_zh: string | null;
			width: number | null;
			height: number | null;
		}> = new Map();

		if (productIds.length > 0) {
			const images = await db
				.select({
					artwork_id: artworkImages.artwork_id,
					media_id: media.id,
					stored_filename: media.stored_filename,
					alt_en: media.alt_en,
					alt_ru: media.alt_ru,
					alt_es: media.alt_es,
					alt_zh: media.alt_zh,
					width: media.width,
					height: media.height,
					is_primary: artworkImages.is_primary,
					order_index: artworkImages.order_index
				})
				.from(artworkImages)
				.innerJoin(media, eq(artworkImages.media_id, media.id))
				.where(
					inArray(artworkImages.artwork_id, productIds)
				)
				.orderBy(desc(artworkImages.is_primary), asc(artworkImages.order_index));

			// Group images by artwork_id and take the first (primary or first by order)
			for (const img of images) {
				if (!imagesMap.has(img.artwork_id)) {
					imagesMap.set(img.artwork_id, {
						id: img.media_id,
						stored_filename: img.stored_filename,
						alt_en: img.alt_en,
						alt_ru: img.alt_ru,
						alt_es: img.alt_es,
						alt_zh: img.alt_zh,
						width: img.width,
						height: img.height
					});
				}
			}
		}

		// Build response
		const products: ShopProduct[] = productsRaw.map((row: { artwork: Artwork; series: Series | null }) => ({
			id: row.artwork.id,
			slug: row.artwork.slug,
			title_en: row.artwork.title_en,
			title_ru: row.artwork.title_ru,
			title_es: row.artwork.title_es,
			title_zh: row.artwork.title_zh,
			description_en: row.artwork.description_en,
			description_ru: row.artwork.description_ru,
			description_es: row.artwork.description_es,
			description_zh: row.artwork.description_zh,
			technique: row.artwork.technique,
			dimensions: row.artwork.dimensions,
			year: row.artwork.year,
			price: row.artwork.price,
			currency: row.artwork.currency,
			is_featured: row.artwork.is_featured,
			is_for_sale: row.artwork.is_for_sale,
			series: row.series
				? {
						id: row.series.id,
						slug: row.series.slug,
						name_en: row.series.name_en,
						name_ru: row.series.name_ru,
						name_es: row.series.name_es,
						name_zh: row.series.name_zh
					}
				: null,
			primary_image: imagesMap.get(row.artwork.id) || null,
			created_at: row.artwork.created_at
		}));

		const response: ProductsResponse = {
			products,
			pagination: {
				total,
				page,
				limit,
				hasMore: offset + products.length < total
			}
		};

		return json(response);
	} catch (error) {
		console.error('Error fetching shop products:', error);
		return json(
			{ error: 'Failed to fetch products' },
			{ status: 500 }
		);
	}
};
