import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { homepageNews, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET all news items
export const GET: RequestHandler = async () => {
	try {
		const items = await db
			.select({
				news: homepageNews,
				image: media
			})
			.from(homepageNews)
			.leftJoin(media, eq(homepageNews.image_id, media.id))
			.orderBy(asc(homepageNews.order_index));

		return json({
			items: items.map((row) => ({
				...row.news,
				image: row.image
					? {
							id: row.image.id,
							url: `/uploads/${row.image.folder}/${row.image.stored_filename}`,
							alt_en: row.image.alt_en,
							alt_ru: row.image.alt_ru,
							alt_es: row.image.alt_es,
							alt_zh: row.image.alt_zh
						}
					: null
			}))
		});
	} catch (err) {
		console.error('Error fetching news:', err);
		return json({ items: [], error: 'Failed to fetch news' }, { status: 500 });
	}
};

// POST create news item
export const POST: RequestHandler = async ({ request }) => {
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

		const [created] = await db
			.insert(homepageNews)
			.values({
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
				order_index: order_index || 0,
				is_visible: is_visible !== false
			})
			.returning();

		return json({ success: true, news: created });
	} catch (err) {
		console.error('Error creating news:', err);
		throw error(500, 'Failed to create news');
	}
};
