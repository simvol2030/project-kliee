import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { series } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET single series
export const GET: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const [item] = await db.select().from(series).where(eq(series.id, id)).limit(1);
		if (!item) throw error(404, 'Series not found');
		return json(item);
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to fetch series');
	}
};

// PATCH update series
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const body = await request.json();
		const [updated] = await db
			.update(series)
			.set({
				slug: body.slug ?? undefined,
				name_en: body.name_en ?? undefined,
				name_ru: body.name_ru ?? undefined,
				name_es: body.name_es ?? undefined,
				name_zh: body.name_zh ?? undefined,
				description_en: body.description_en ?? undefined,
				description_ru: body.description_ru ?? undefined,
				description_es: body.description_es ?? undefined,
				description_zh: body.description_zh ?? undefined,
				cover_image_id: body.cover_image_id ?? undefined,
				order_index: body.order_index ?? undefined,
				is_visible: body.is_visible ?? undefined,
				is_featured: body.is_featured ?? undefined,
				seo_title_en: body.seo_title_en ?? undefined,
				seo_title_ru: body.seo_title_ru ?? undefined,
				seo_title_es: body.seo_title_es ?? undefined,
				seo_title_zh: body.seo_title_zh ?? undefined,
				seo_description_en: body.seo_description_en ?? undefined,
				seo_description_ru: body.seo_description_ru ?? undefined,
				seo_description_es: body.seo_description_es ?? undefined,
				seo_description_zh: body.seo_description_zh ?? undefined
			})
			.where(eq(series.id, id))
			.returning();

		if (!updated) throw error(404, 'Series not found');
		return json({ success: true, series: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update series');
	}
};

// DELETE series
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		await db.delete(series).where(eq(series.id, id));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete series');
	}
};
