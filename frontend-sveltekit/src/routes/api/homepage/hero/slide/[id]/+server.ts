import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { heroSlides } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// PATCH update slide
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const body = await request.json();
		const { media_id, alt_en, alt_ru, alt_es, alt_zh, duration, order_index, is_visible } = body;

		const [updated] = await db
			.update(heroSlides)
			.set({
				media_id: media_id ?? undefined,
				alt_en: alt_en ?? undefined,
				alt_ru: alt_ru ?? undefined,
				alt_es: alt_es ?? undefined,
				alt_zh: alt_zh ?? undefined,
				duration: duration ?? undefined,
				order_index: order_index ?? undefined,
				is_visible: is_visible ?? undefined
			})
			.where(eq(heroSlides.id, id))
			.returning();

		if (!updated) throw error(404, 'Slide not found');
		return json({ success: true, slide: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update slide');
	}
};

// DELETE slide
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		await db.delete(heroSlides).where(eq(heroSlides.id, id));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete slide');
	}
};
