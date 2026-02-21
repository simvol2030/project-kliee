import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { exhibitions, media, homepageSections } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET all exhibitions (for selection) + current homepage section config
export const GET: RequestHandler = async () => {
	try {
		const rows = await db
			.select({ exhibition: exhibitions, cover: media })
			.from(exhibitions)
			.leftJoin(media, eq(exhibitions.cover_image_id, media.id))
			.where(eq(exhibitions.is_visible, true))
			.orderBy(asc(exhibitions.order_index));

		const [sectionRow] = await db
			.select()
			.from(homepageSections)
			.where(eq(homepageSections.section_type, 'exhibitions_preview'))
			.limit(1);

		return json({
			exhibitions: rows.map((r) => ({
				...r.exhibition,
				cover_image: r.cover
					? {
							id: r.cover.id,
							url: `/uploads/${r.cover.folder}/${r.cover.stored_filename}`
						}
					: null
			})),
			section: sectionRow || null
		});
	} catch (err) {
		console.error('Error fetching exhibitions for homepage:', err);
		return json({ exhibitions: [], section: null, error: 'Failed to fetch' }, { status: 500 });
	}
};

// POST to set the homepage-featured exhibition + section config
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { featured_exhibition_id, title_en, title_ru, title_es, title_zh, subtitle_en, subtitle_ru, subtitle_es, subtitle_zh } = body;

		// Clear + set featured exhibition atomically
		await db.transaction(async (tx) => {
			await tx.update(exhibitions).set({ is_homepage_featured: false });
			if (featured_exhibition_id) {
				const id = parseInt(String(featured_exhibition_id));
				if (!isNaN(id)) {
					await tx.update(exhibitions).set({ is_homepage_featured: true }).where(eq(exhibitions.id, id));
				}
			}
		});

		// Upsert section config in homepage_sections
		const [existing] = await db
			.select()
			.from(homepageSections)
			.where(eq(homepageSections.section_type, 'exhibitions_preview'))
			.limit(1);

		if (existing) {
			await db
				.update(homepageSections)
				.set({
					title_en: title_en ?? existing.title_en,
					title_ru: title_ru ?? existing.title_ru,
					title_es: title_es ?? existing.title_es,
					title_zh: title_zh ?? existing.title_zh,
					subtitle_en: subtitle_en ?? existing.subtitle_en,
					subtitle_ru: subtitle_ru ?? existing.subtitle_ru,
					subtitle_es: subtitle_es ?? existing.subtitle_es,
					subtitle_zh: subtitle_zh ?? existing.subtitle_zh
				})
				.where(eq(homepageSections.id, existing.id));
		} else {
			await db.insert(homepageSections).values({
				section_type: 'exhibitions_preview',
				title_en: title_en || null,
				title_ru: title_ru || null,
				title_es: title_es || null,
				title_zh: title_zh || null,
				subtitle_en: subtitle_en || null,
				subtitle_ru: subtitle_ru || null,
				subtitle_es: subtitle_es || null,
				subtitle_zh: subtitle_zh || null,
				is_visible: true
			});
		}

		return json({ success: true });
	} catch (err) {
		console.error('Error updating exhibitions homepage config:', err);
		throw error(500, 'Failed to update exhibitions config');
	}
};
