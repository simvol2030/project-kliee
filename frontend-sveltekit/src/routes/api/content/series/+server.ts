import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { series, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET all series
export const GET: RequestHandler = async () => {
	try {
		const items = await db
			.select({
				series: series,
				cover: media
			})
			.from(series)
			.leftJoin(media, eq(series.cover_image_id, media.id))
			.orderBy(asc(series.order_index));

		return json({
			items: items.map((row) => ({
				...row.series,
				cover: row.cover
					? { id: row.cover.id, url: `/uploads/${row.cover.folder}/${row.cover.stored_filename}` }
					: null
			}))
		});
	} catch (err) {
		console.error('Error fetching series:', err);
		return json({ items: [], error: 'Failed to fetch series' }, { status: 500 });
	}
};

// POST create series
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const {
			slug,
			name_en,
			name_ru,
			name_es,
			name_zh,
			description_en,
			description_ru,
			description_es,
			description_zh,
			cover_image_id,
			order_index,
			is_visible,
			is_featured,
			seo_title_en,
			seo_title_ru,
			seo_title_es,
			seo_title_zh,
			seo_description_en,
			seo_description_ru,
			seo_description_es,
			seo_description_zh
		} = body;

		if (!slug || !name_en) {
			throw error(400, 'slug and name_en are required');
		}

		// Generate unique ID for new series (id is TEXT, required)
		const newId = `ser_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

		const [created] = await db
			.insert(series)
			.values({
				id: newId,
				slug,
				name_en,
				name_ru: name_ru || name_en,
				name_es: name_es || name_en,
				name_zh: name_zh || name_en,
				description_en,
				description_ru,
				description_es,
				description_zh,
				cover_image_id,
				order_index: order_index || 0,
				is_visible: is_visible !== false,
				is_featured: is_featured || false,
				seo_title_en,
				seo_title_ru,
				seo_title_es,
				seo_title_zh,
				seo_description_en,
				seo_description_ru,
				seo_description_es,
				seo_description_zh
			})
			.returning();

		return json({ success: true, series: created });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error creating series:', err);
		throw error(500, 'Failed to create series');
	}
};
