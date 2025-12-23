import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { homepageTestimonials } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// PATCH update testimonial
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const body = await request.json();
		const {
			quote_en,
			quote_ru,
			quote_es,
			quote_zh,
			author,
			role_en,
			role_ru,
			role_es,
			role_zh,
			avatar_id,
			order_index,
			is_visible
		} = body;

		const [updated] = await db
			.update(homepageTestimonials)
			.set({
				quote_en: quote_en ?? undefined,
				quote_ru: quote_ru ?? undefined,
				quote_es: quote_es ?? undefined,
				quote_zh: quote_zh ?? undefined,
				author: author ?? undefined,
				role_en: role_en ?? undefined,
				role_ru: role_ru ?? undefined,
				role_es: role_es ?? undefined,
				role_zh: role_zh ?? undefined,
				avatar_id: avatar_id ?? undefined,
				order_index: order_index ?? undefined,
				is_visible: is_visible ?? undefined
			})
			.where(eq(homepageTestimonials.id, id))
			.returning();

		if (!updated) throw error(404, 'Testimonial not found');
		return json({ success: true, testimonial: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update testimonial');
	}
};

// DELETE testimonial
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		await db.delete(homepageTestimonials).where(eq(homepageTestimonials.id, id));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete testimonial');
	}
};
