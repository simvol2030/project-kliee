import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { homepageFeaturedCollections, series, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET all featured collections
export const GET: RequestHandler = async () => {
	try {
		const rows = await db
			.select({
				collection: homepageFeaturedCollections,
				seriesRow: series,
				coverImage: media
			})
			.from(homepageFeaturedCollections)
			.leftJoin(series, eq(homepageFeaturedCollections.series_id, series.id))
			.leftJoin(media, eq(homepageFeaturedCollections.cover_image_id, media.id))
			.orderBy(asc(homepageFeaturedCollections.order_index));

		return json({
			items: rows.map((r) => ({
				...r.collection,
				series: r.seriesRow
					? {
							id: r.seriesRow.id,
							slug: r.seriesRow.slug,
							name_en: r.seriesRow.name_en,
							name_ru: r.seriesRow.name_ru,
							name_es: r.seriesRow.name_es,
							name_zh: r.seriesRow.name_zh,
							description_en: r.seriesRow.description_en,
							description_ru: r.seriesRow.description_ru,
							description_es: r.seriesRow.description_es,
							description_zh: r.seriesRow.description_zh
						}
					: null,
				cover_image: r.coverImage
					? {
							id: r.coverImage.id,
							url: `/uploads/${r.coverImage.folder}/${r.coverImage.stored_filename}`,
							alt_en: r.coverImage.alt_en,
							alt_ru: r.coverImage.alt_ru,
							alt_es: r.coverImage.alt_es,
							alt_zh: r.coverImage.alt_zh
						}
					: null
			}))
		});
	} catch (err) {
		console.error('Error fetching featured collections:', err);
		return json({ items: [], error: 'Failed to fetch collections' }, { status: 500 });
	}
};

// POST create featured collection
export const POST: RequestHandler = async ({ request }) => {
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

		const [created] = await db
			.insert(homepageFeaturedCollections)
			.values({
				series_id: series_id || null,
				title_override_en: title_override_en || null,
				title_override_ru: title_override_ru || null,
				title_override_es: title_override_es || null,
				title_override_zh: title_override_zh || null,
				description_override_en: description_override_en || null,
				description_override_ru: description_override_ru || null,
				description_override_es: description_override_es || null,
				description_override_zh: description_override_zh || null,
				cover_image_id: cover_image_id || null,
				link: link || null,
				order_index: order_index ?? 0,
				is_visible: is_visible !== false
			})
			.returning();

		return json({ success: true, collection: created });
	} catch (err) {
		console.error('Error creating collection:', err);
		throw error(500, 'Failed to create collection');
	}
};
