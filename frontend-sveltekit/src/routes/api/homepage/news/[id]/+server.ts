import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { homepageNews } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// PATCH update news item
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const body = await request.json();
		const {
			title_en,
			title_ru,
			title_es,
			title_zh,
			excerpt_en,
			excerpt_ru,
			excerpt_es,
			excerpt_zh,
			image_id,
			link,
			date,
			order_index,
			is_visible
		} = body;

		const [updated] = await db
			.update(homepageNews)
			.set({
				title_en: title_en ?? undefined,
				title_ru: title_ru ?? undefined,
				title_es: title_es ?? undefined,
				title_zh: title_zh ?? undefined,
				excerpt_en: excerpt_en ?? undefined,
				excerpt_ru: excerpt_ru ?? undefined,
				excerpt_es: excerpt_es ?? undefined,
				excerpt_zh: excerpt_zh ?? undefined,
				image_id: image_id ?? undefined,
				link: link ?? undefined,
				date: date ?? undefined,
				order_index: order_index ?? undefined,
				is_visible: is_visible ?? undefined
			})
			.where(eq(homepageNews.id, id))
			.returning();

		if (!updated) throw error(404, 'News item not found');
		return json({ success: true, news: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update news');
	}
};

// DELETE news item
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		await db.delete(homepageNews).where(eq(homepageNews.id, id));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete news');
	}
};
