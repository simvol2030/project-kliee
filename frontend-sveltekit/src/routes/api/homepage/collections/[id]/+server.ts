import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { homepageFeaturedCollections } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// PATCH update collection
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const body = await request.json();

		// Build updates only for fields explicitly present in the body.
		// Using 'in' operator (not ??) so callers can clear nullable fields by sending null.
		const updates: Record<string, unknown> = {};
		if ('series_id' in body) updates.series_id = body.series_id;
		if ('title_override_en' in body) updates.title_override_en = body.title_override_en;
		if ('title_override_ru' in body) updates.title_override_ru = body.title_override_ru;
		if ('title_override_es' in body) updates.title_override_es = body.title_override_es;
		if ('title_override_zh' in body) updates.title_override_zh = body.title_override_zh;
		if ('description_override_en' in body) updates.description_override_en = body.description_override_en;
		if ('description_override_ru' in body) updates.description_override_ru = body.description_override_ru;
		if ('description_override_es' in body) updates.description_override_es = body.description_override_es;
		if ('description_override_zh' in body) updates.description_override_zh = body.description_override_zh;
		if ('cover_image_id' in body) updates.cover_image_id = body.cover_image_id;
		if ('link' in body) updates.link = body.link;
		if ('order_index' in body) updates.order_index = body.order_index;
		if ('is_visible' in body) updates.is_visible = body.is_visible;

		if (Object.keys(updates).length === 0) {
			throw error(400, 'No fields to update');
		}

		const [updated] = await db
			.update(homepageFeaturedCollections)
			.set(updates)
			.where(eq(homepageFeaturedCollections.id, id))
			.returning();

		if (!updated) throw error(404, 'Collection not found');
		return json({ success: true, collection: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update collection');
	}
};

// DELETE collection
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		await db.delete(homepageFeaturedCollections).where(eq(homepageFeaturedCollections.id, id));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete collection');
	}
};
