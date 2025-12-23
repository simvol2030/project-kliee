import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { artworks, series, artworkImages, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import { artworkSchema, validateOrFail } from '$lib/validation';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	// Handle "new" as special case
	if (id === 'new') {
		const allSeries = await db.select().from(series).orderBy(series.order_index);
		return {
			artwork: null,
			images: [],
			series: allSeries,
			isNew: true
		};
	}

	// id is TEXT in schema, no parseInt needed
	const [artwork] = await db.select().from(artworks).where(eq(artworks.id, id));

	if (!artwork) {
		throw error(404, 'Artwork not found');
	}

	// Load images for this artwork
	const imageRows = await db
		.select({
			id: artworkImages.id,
			media_id: artworkImages.media_id,
			is_primary: artworkImages.is_primary,
			order_index: artworkImages.order_index,
			media: {
				id: media.id,
				filename: media.filename,
				stored_filename: media.stored_filename,
				folder: media.folder,
				alt_en: media.alt_en
			}
		})
		.from(artworkImages)
		.leftJoin(media, eq(artworkImages.media_id, media.id))
		.where(eq(artworkImages.artwork_id, id))
		.orderBy(asc(artworkImages.order_index));

	// Transform images to include URL
	const images = imageRows.map((img) => ({
		id: img.id,
		media_id: img.media_id,
		is_primary: img.is_primary,
		order_index: img.order_index,
		media: img.media
			? {
					...img.media,
					url: `/uploads/${img.media.folder || 'uploads'}/${img.media.stored_filename}`
				}
			: null
	}));

	const allSeries = await db.select().from(series).orderBy(series.order_index);

	return {
		artwork,
		images,
		series: allSeries,
		isNew: false
	};
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const formData = await request.formData();
		const isNew = params.id === 'new';

		// Validate with Zod schema
		const validation = validateOrFail(artworkSchema, formData, ['is_for_sale']);

		if (!validation.valid) {
			return fail(400, {
				error: validation.message,
				errors: validation.errors
			});
		}

		const validated = validation.data;
		const imagesJson = formData.get('images') as string;

		// Build data object with snake_case keys matching schema
		const data = {
			title_en: validated.title_en,
			title_ru: validated.title_ru || validated.title_en,
			title_es: validated.title_es || validated.title_en,
			title_zh: validated.title_zh || validated.title_en,
			series_id: validated.series_id || null,
			technique: validated.technique || null,
			year: validated.year,
			dimensions: validated.dimensions || null,
			price: validated.price,
			currency: validated.currency,
			is_for_sale: validated.is_for_sale,
			// SEO fields
			seo_title_en: validated.seo_title_en || null,
			seo_title_ru: validated.seo_title_ru || null,
			seo_title_es: validated.seo_title_es || null,
			seo_title_zh: validated.seo_title_zh || null,
			seo_description_en: validated.seo_description_en || null,
			seo_description_ru: validated.seo_description_ru || null,
			seo_description_es: validated.seo_description_es || null,
			seo_description_zh: validated.seo_description_zh || null
		};

		try {
			let artworkId: string;

			if (isNew) {
				// Generate unique ID for new artwork (id is TEXT, required)
				artworkId = `art_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
				await db.insert(artworks).values({ id: artworkId, ...data });
			} else {
				artworkId = params.id;
				// id is TEXT in schema, use params.id directly
				await db
					.update(artworks)
					.set({
						...data,
						updated_at: new Date().toISOString()
					})
					.where(eq(artworks.id, artworkId));
			}

			// Handle images
			if (imagesJson) {
				try {
					const imagesList = JSON.parse(imagesJson);
					if (Array.isArray(imagesList)) {
						// Delete existing images
						await db.delete(artworkImages).where(eq(artworkImages.artwork_id, artworkId));

						// Insert new images
						if (imagesList.length > 0) {
							const insertData = imagesList.map(
								(
									img: { media_id: number; is_primary: boolean; order_index: number },
									index: number
								) => ({
									artwork_id: artworkId,
									media_id: img.media_id,
									is_primary: img.is_primary || index === 0,
									order_index: img.order_index ?? index
								})
							);
							await db.insert(artworkImages).values(insertData);
						}
					}
				} catch (e) {
					console.error('Error parsing images JSON:', e);
				}
			}

			if (isNew) {
				throw redirect(303, `/artworks/${artworkId}`);
			}

			return { success: true, message: 'Artwork saved successfully' };
		} catch (e) {
			if (e && typeof e === 'object' && 'status' in e) throw e; // re-throw redirects
			console.error('Error saving artwork:', e);
			return fail(500, { error: 'Failed to save artwork' });
		}
	}
};
