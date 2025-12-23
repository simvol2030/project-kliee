import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { artworks, artworkImages, media, series, type Artwork, type Series } from '$lib/server/db/schema';
import { eq, and, desc, asc, sql, ne } from 'drizzle-orm';

export interface ProductImage {
	id: number;
	stored_filename: string;
	alt_en: string | null;
	alt_ru: string | null;
	alt_es: string | null;
	alt_zh: string | null;
	width: number | null;
	height: number | null;
	is_primary: boolean | null;
	order_index: number | null;
}

export interface ProductDetail {
	id: number;
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
		id: number;
		slug: string;
		name_en: string;
		name_ru: string;
		name_es: string;
		name_zh: string;
	} | null;
	images: ProductImage[];
	created_at: string | null;
}

export interface RelatedProduct {
	id: number;
	slug: string | null;
	title_en: string;
	title_ru: string;
	title_es: string;
	title_zh: string;
	price: number | null;
	is_for_sale: boolean | null;
	primary_image: {
		id: number;
		stored_filename: string;
		alt_en: string | null;
	} | null;
}

export interface ProductDetailResponse {
	product: ProductDetail;
	related: RelatedProduct[];
}

export const GET: RequestHandler = async ({ params }) => {
	const { slug } = params;

	try {
		// Find artwork by slug
		const [artworkRow] = await db
			.select({
				artwork: artworks,
				series: series
			})
			.from(artworks)
			.leftJoin(series, eq(artworks.series_id, series.id))
			.where(
				and(
					eq(artworks.slug, slug),
					eq(artworks.is_visible, true)
				)
			)
			.limit(1);

		if (!artworkRow) {
			throw error(404, 'Product not found');
		}

		const artwork = artworkRow.artwork;
		const artworkSeries = artworkRow.series;

		// Get all images for this artwork
		const images = await db
			.select({
				id: media.id,
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
			.where(eq(artworkImages.artwork_id, artwork.id))
			.orderBy(desc(artworkImages.is_primary), asc(artworkImages.order_index));

		// Get related products (same series, max 4, excluding current)
		let related: RelatedProduct[] = [];
		if (artworkSeries) {
			const relatedArtworks = await db
				.select({
					artwork: artworks
				})
				.from(artworks)
				.where(
					and(
						eq(artworks.series_id, artworkSeries.id),
						eq(artworks.is_visible, true),
						ne(artworks.id, artwork.id)
					)
				)
				.orderBy(desc(artworks.is_featured), asc(artworks.order_index))
				.limit(4);

			// Get primary images for related artworks
			if (relatedArtworks.length > 0) {
				const relatedIds = relatedArtworks.map((r) => r.artwork.id);

				const relatedImages = await db
					.select({
						artwork_id: artworkImages.artwork_id,
						media_id: media.id,
						stored_filename: media.stored_filename,
						alt_en: media.alt_en,
						is_primary: artworkImages.is_primary,
						order_index: artworkImages.order_index
					})
					.from(artworkImages)
					.innerJoin(media, eq(artworkImages.media_id, media.id))
					.where(
						sql`${artworkImages.artwork_id} IN (${sql.join(relatedIds.map((id: number) => sql`${id}`), sql`, `)})`
					)
					.orderBy(desc(artworkImages.is_primary), asc(artworkImages.order_index));

				// Group by artwork_id and take first
				const imagesMap = new Map<number, { id: number; stored_filename: string; alt_en: string | null }>();
				for (const img of relatedImages) {
					if (!imagesMap.has(img.artwork_id)) {
						imagesMap.set(img.artwork_id, {
							id: img.media_id,
							stored_filename: img.stored_filename,
							alt_en: img.alt_en
						});
					}
				}

				related = relatedArtworks.map((r) => ({
					id: r.artwork.id,
					slug: r.artwork.slug,
					title_en: r.artwork.title_en,
					title_ru: r.artwork.title_ru,
					title_es: r.artwork.title_es,
					title_zh: r.artwork.title_zh,
					price: r.artwork.price,
					is_for_sale: r.artwork.is_for_sale,
					primary_image: imagesMap.get(r.artwork.id) || null
				}));
			}
		}

		const product: ProductDetail = {
			id: artwork.id,
			slug: artwork.slug,
			title_en: artwork.title_en,
			title_ru: artwork.title_ru,
			title_es: artwork.title_es,
			title_zh: artwork.title_zh,
			description_en: artwork.description_en,
			description_ru: artwork.description_ru,
			description_es: artwork.description_es,
			description_zh: artwork.description_zh,
			technique: artwork.technique,
			dimensions: artwork.dimensions,
			year: artwork.year,
			price: artwork.price,
			currency: artwork.currency,
			is_featured: artwork.is_featured,
			is_for_sale: artwork.is_for_sale,
			series: artworkSeries
				? {
						id: artworkSeries.id,
						slug: artworkSeries.slug,
						name_en: artworkSeries.name_en,
						name_ru: artworkSeries.name_ru,
						name_es: artworkSeries.name_es,
						name_zh: artworkSeries.name_zh
					}
				: null,
			images,
			created_at: artwork.created_at
		};

		const response: ProductDetailResponse = {
			product,
			related
		};

		return json(response);
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error fetching product:', err);
		throw error(500, 'Failed to fetch product');
	}
};
