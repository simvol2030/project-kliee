import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { artworks, artworkImages, media, series } from '$lib/server/db/schema';
import { eq, asc, isNotNull, ne } from 'drizzle-orm';
import { generateSlug, makeSlugUnique } from '$lib/utils/slug';

// GET all artworks
export const GET: RequestHandler = async ({ url }) => {
	const seriesId = url.searchParams.get('series_id');

	try {
		const baseQuery = db
			.select({
				artwork: artworks,
				series: series
			})
			.from(artworks)
			.leftJoin(series, eq(artworks.series_id, series.id));

		const items = seriesId
			? await baseQuery.where(eq(artworks.series_id, parseInt(seriesId))).orderBy(asc(artworks.order_index))
			: await baseQuery.orderBy(asc(artworks.order_index));

		// Get images for each artwork
		const result = await Promise.all(
			items.map(async (row) => {
				const images = await db
					.select({
						artworkImage: artworkImages,
						media: media
					})
					.from(artworkImages)
					.leftJoin(media, eq(artworkImages.media_id, media.id))
					.where(eq(artworkImages.artwork_id, row.artwork.id))
					.orderBy(asc(artworkImages.order_index));

				return {
					...row.artwork,
					series: row.series ? { id: row.series.id, name_en: row.series.name_en, slug: row.series.slug } : null,
					images: images.map((img) => ({
						id: img.artworkImage.id,
						is_primary: img.artworkImage.is_primary,
						url: img.media ? `/uploads/${img.media.folder}/${img.media.stored_filename}` : null
					}))
				};
			})
		);

		return json({ items: result });
	} catch (err) {
		console.error('Error fetching artworks:', err);
		return json({ items: [], error: 'Failed to fetch artworks' }, { status: 500 });
	}
};

// POST create artwork
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const {
			series_id,
			title_en,
			title_ru,
			title_es,
			title_zh,
			description_en,
			description_ru,
			description_es,
			description_zh,
			technique,
			dimensions,
			year,
			price,
			currency,
			is_featured,
			is_for_sale,
			is_visible,
			order_index,
			images
		} = body;

		if (!title_en) {
			throw error(400, 'title_en is required');
		}

		// Generate unique slug
		const baseSlug = body.slug || generateSlug(title_en);
		const existingSlugs = await db
			.select({ slug: artworks.slug })
			.from(artworks)
			.where(isNotNull(artworks.slug));
		const uniqueSlug = makeSlugUnique(baseSlug, existingSlugs.map((r) => r.slug!));

		const [created] = await db
			.insert(artworks)
			.values({
				slug: uniqueSlug,
				series_id,
				title_en,
				title_ru: title_ru || title_en,
				title_es: title_es || title_en,
				title_zh: title_zh || title_en,
				description_en,
				description_ru,
				description_es,
				description_zh,
				technique,
				dimensions,
				year,
				price,
				currency: currency || 'EUR',
				is_featured: is_featured || false,
				is_for_sale: is_for_sale !== false,
				is_visible: is_visible !== false,
				order_index: order_index || 0
			})
			.returning();

		// Add images if provided
		if (images && Array.isArray(images)) {
			for (let i = 0; i < images.length; i++) {
				await db.insert(artworkImages).values({
					artwork_id: created.id,
					media_id: images[i].media_id,
					is_primary: i === 0,
					order_index: i
				});
			}
		}

		return json({ success: true, artwork: created });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error creating artwork:', err);
		throw error(500, 'Failed to create artwork');
	}
};
