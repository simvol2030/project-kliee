import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { artworks, artworkImages } from '$lib/server/db/schema';
import { eq, ne, isNotNull, and } from 'drizzle-orm';
import { generateSlug, makeSlugUnique } from '$lib/utils/slug';

// GET single artwork
export const GET: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const [item] = await db.select().from(artworks).where(eq(artworks.id, id)).limit(1);
		if (!item) throw error(404, 'Artwork not found');
		return json(item);
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to fetch artwork');
	}
};

// PATCH update artwork
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const body = await request.json();

		// Handle slug update - validate uniqueness
		let slugToSet: string | undefined = undefined;
		if (body.slug !== undefined) {
			const baseSlug = generateSlug(body.slug);
			const existingSlugs = await db
				.select({ slug: artworks.slug })
				.from(artworks)
				.where(and(isNotNull(artworks.slug), ne(artworks.id, id)));
			slugToSet = makeSlugUnique(baseSlug, existingSlugs.map((r) => r.slug!));
		}

		const [updated] = await db
			.update(artworks)
			.set({
				slug: slugToSet,
				series_id: body.series_id ?? undefined,
				title_en: body.title_en ?? undefined,
				title_ru: body.title_ru ?? undefined,
				title_es: body.title_es ?? undefined,
				title_zh: body.title_zh ?? undefined,
				description_en: body.description_en ?? undefined,
				description_ru: body.description_ru ?? undefined,
				description_es: body.description_es ?? undefined,
				description_zh: body.description_zh ?? undefined,
				technique: body.technique ?? undefined,
				dimensions: body.dimensions ?? undefined,
				year: body.year ?? undefined,
				price: body.price ?? undefined,
				currency: body.currency ?? undefined,
				is_featured: body.is_featured ?? undefined,
				is_for_sale: body.is_for_sale ?? undefined,
				is_visible: body.is_visible ?? undefined,
				order_index: body.order_index ?? undefined
			})
			.where(eq(artworks.id, id))
			.returning();

		if (!updated) throw error(404, 'Artwork not found');

		// Update images if provided
		if (body.images && Array.isArray(body.images)) {
			// Delete existing images
			await db.delete(artworkImages).where(eq(artworkImages.artwork_id, id));
			// Add new images
			for (let i = 0; i < body.images.length; i++) {
				await db.insert(artworkImages).values({
					artwork_id: id,
					media_id: body.images[i].media_id,
					is_primary: i === 0,
					order_index: i
				});
			}
		}

		return json({ success: true, artwork: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update artwork');
	}
};

// DELETE artwork
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		// Images will cascade delete
		await db.delete(artworks).where(eq(artworks.id, id));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete artwork');
	}
};
