import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { exhibitions, media } from '$lib/server/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

// GET all exhibitions
export const GET: RequestHandler = async ({ url }) => {
	const current = url.searchParams.get('current');

	try {
		let query = db
			.select({
				exhibition: exhibitions,
				cover: media
			})
			.from(exhibitions)
			.leftJoin(media, eq(exhibitions.cover_image_id, media.id))
			.orderBy(desc(exhibitions.start_date));

		const items = await query;

		const result = items.map((item) => ({
			...item.exhibition,
			cover: item.cover
				? {
						id: item.cover.id,
						url: `/uploads/${item.cover.folder}/${item.cover.stored_filename}`,
						alt_en: item.cover.alt_en
					}
				: null
		}));

		// Filter by current if requested
		if (current === 'true') {
			return json(result.filter((e) => e.is_current));
		}

		return json(result);
	} catch (err) {
		console.error('Error fetching exhibitions:', err);
		throw error(500, 'Failed to fetch exhibitions');
	}
};

// POST create exhibition
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		const [created] = await db
			.insert(exhibitions)
			.values({
				title_en: body.title_en || '',
				title_ru: body.title_ru || '',
				title_es: body.title_es || '',
				title_zh: body.title_zh || '',
				description_en: body.description_en,
				description_ru: body.description_ru,
				description_es: body.description_es,
				description_zh: body.description_zh,
				venue: body.venue,
				city: body.city,
				country: body.country,
				address: body.address,
				start_date: body.start_date,
				end_date: body.end_date,
				opening_hours: body.opening_hours,
				cover_image_id: body.cover_image_id,
				gallery_link: body.gallery_link,
				is_current: body.is_current ?? false,
				is_visible: body.is_visible ?? true,
				order_index: body.order_index ?? 0
			})
			.returning();

		return json({ success: true, exhibition: created });
	} catch (err) {
		console.error('Error creating exhibition:', err);
		throw error(500, 'Failed to create exhibition');
	}
};
