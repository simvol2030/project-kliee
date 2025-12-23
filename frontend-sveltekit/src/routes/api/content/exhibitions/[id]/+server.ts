import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { exhibitions, exhibitionArtworks, artworks, media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET single exhibition with artworks
export const GET: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const [item] = await db
			.select({
				exhibition: exhibitions,
				cover: media
			})
			.from(exhibitions)
			.leftJoin(media, eq(exhibitions.cover_image_id, media.id))
			.where(eq(exhibitions.id, id))
			.limit(1);

		if (!item) throw error(404, 'Exhibition not found');

		// Get related artworks
		const artworkItems = await db
			.select({
				relation: exhibitionArtworks,
				artwork: artworks
			})
			.from(exhibitionArtworks)
			.innerJoin(artworks, eq(exhibitionArtworks.artwork_id, artworks.id))
			.where(eq(exhibitionArtworks.exhibition_id, id));

		const result = {
			...item.exhibition,
			cover: item.cover
				? {
						id: item.cover.id,
						url: `/uploads/${item.cover.folder}/${item.cover.stored_filename}`,
						alt_en: item.cover.alt_en
					}
				: null,
			artworks: artworkItems.map((a) => ({
				...a.artwork,
				order_index: a.relation.order_index
			}))
		};

		return json(result);
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to fetch exhibition');
	}
};

// PATCH update exhibition
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const body = await request.json();
		const [updated] = await db
			.update(exhibitions)
			.set({
				title_en: body.title_en ?? undefined,
				title_ru: body.title_ru ?? undefined,
				title_es: body.title_es ?? undefined,
				title_zh: body.title_zh ?? undefined,
				description_en: body.description_en ?? undefined,
				description_ru: body.description_ru ?? undefined,
				description_es: body.description_es ?? undefined,
				description_zh: body.description_zh ?? undefined,
				venue: body.venue ?? undefined,
				city: body.city ?? undefined,
				country: body.country ?? undefined,
				address: body.address ?? undefined,
				start_date: body.start_date ?? undefined,
				end_date: body.end_date ?? undefined,
				opening_hours: body.opening_hours ?? undefined,
				cover_image_id: body.cover_image_id ?? undefined,
				gallery_link: body.gallery_link ?? undefined,
				is_current: body.is_current ?? undefined,
				is_visible: body.is_visible ?? undefined,
				order_index: body.order_index ?? undefined
			})
			.where(eq(exhibitions.id, id))
			.returning();

		if (!updated) throw error(404, 'Exhibition not found');

		// Update artworks if provided
		if (body.artwork_ids && Array.isArray(body.artwork_ids)) {
			// Delete existing relations
			await db.delete(exhibitionArtworks).where(eq(exhibitionArtworks.exhibition_id, id));
			// Add new relations
			for (let i = 0; i < body.artwork_ids.length; i++) {
				await db.insert(exhibitionArtworks).values({
					exhibition_id: id,
					artwork_id: body.artwork_ids[i],
					order_index: i
				});
			}
		}

		return json({ success: true, exhibition: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update exhibition');
	}
};

// DELETE exhibition
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		// Artworks relations will cascade delete
		await db.delete(exhibitions).where(eq(exhibitions.id, id));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete exhibition');
	}
};
