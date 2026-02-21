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
		const {
			series_id,
			title_override_en,
			title_override_ru,
			title_override_es,
			title_override_zh,
			description_override_en,
			description_override_ru,
			description_override_es,
			description_override_zh,
			cover_image_id,
			link,
			order_index,
			is_visible
		} = body;

		const [updated] = await db
			.update(homepageFeaturedCollections)
			.set({
				series_id: series_id ?? undefined,
				title_override_en: title_override_en ?? undefined,
				title_override_ru: title_override_ru ?? undefined,
				title_override_es: title_override_es ?? undefined,
				title_override_zh: title_override_zh ?? undefined,
				description_override_en: description_override_en ?? undefined,
				description_override_ru: description_override_ru ?? undefined,
				description_override_es: description_override_es ?? undefined,
				description_override_zh: description_override_zh ?? undefined,
				cover_image_id: cover_image_id ?? undefined,
				link: link ?? undefined,
				order_index: order_index ?? undefined,
				is_visible: is_visible ?? undefined
			})
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
