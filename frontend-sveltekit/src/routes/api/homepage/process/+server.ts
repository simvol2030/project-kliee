import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { homepageProcess } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

// GET all process steps
export const GET: RequestHandler = async () => {
	try {
		const items = await db.select().from(homepageProcess).orderBy(asc(homepageProcess.order_index));
		return json({ items });
	} catch (err) {
		console.error('Error fetching process:', err);
		return json({ items: [], error: 'Failed to fetch process' }, { status: 500 });
	}
};

// POST create process step
export const POST: RequestHandler = async ({ request }) => {
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

		const [created] = await db
			.insert(homepageProcess)
			.values({
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
				order_index: order_index || 0,
				is_visible: is_visible !== false
			})
			.returning();

		return json({ success: true, step: created });
	} catch (err) {
		console.error('Error creating process step:', err);
		throw error(500, 'Failed to create process step');
	}
};
