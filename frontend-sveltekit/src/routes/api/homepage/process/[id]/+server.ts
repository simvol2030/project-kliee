import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { homepageProcess } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// PATCH update process step
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
			description_en,
			description_ru,
			description_es,
			description_zh,
			icon,
			step_number,
			order_index,
			is_visible
		} = body;

		const [updated] = await db
			.update(homepageProcess)
			.set({
				title_en: title_en ?? undefined,
				title_ru: title_ru ?? undefined,
				title_es: title_es ?? undefined,
				title_zh: title_zh ?? undefined,
				description_en: description_en ?? undefined,
				description_ru: description_ru ?? undefined,
				description_es: description_es ?? undefined,
				description_zh: description_zh ?? undefined,
				icon: icon ?? undefined,
				step_number: step_number ?? undefined,
				order_index: order_index ?? undefined,
				is_visible: is_visible ?? undefined
			})
			.where(eq(homepageProcess.id, id))
			.returning();

		if (!updated) throw error(404, 'Process step not found');
		return json({ success: true, step: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update process step');
	}
};

// DELETE process step
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		await db.delete(homepageProcess).where(eq(homepageProcess.id, id));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete process step');
	}
};
