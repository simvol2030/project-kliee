import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { homepageAbout, media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET about section
export const GET: RequestHandler = async () => {
	try {
		const result = await db
			.select({
				about: homepageAbout,
				image: media
			})
			.from(homepageAbout)
			.leftJoin(media, eq(homepageAbout.image_id, media.id))
			.limit(1);

		const [row] = result;

		return json({
			about: row?.about
				? {
						...row.about,
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
					}
				: null
		});
	} catch (err) {
		console.error('Error fetching about:', err);
		return json({ about: null, error: 'Failed to fetch about' }, { status: 500 });
	}
};

// POST update about section
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const {
			title_en,
			title_ru,
			title_es,
			title_zh,
			text_en,
			text_ru,
			text_es,
			text_zh,
			image_id,
			cta_text_en,
			cta_text_ru,
			cta_text_es,
			cta_text_zh,
			cta_href
		} = body;

		const [existing] = await db.select().from(homepageAbout).limit(1);

		if (existing) {
			const [updated] = await db
				.update(homepageAbout)
				.set({
					title_en: title_en ?? existing.title_en,
					title_ru: title_ru ?? existing.title_ru,
					title_es: title_es ?? existing.title_es,
					title_zh: title_zh ?? existing.title_zh,
					text_en: text_en ?? existing.text_en,
					text_ru: text_ru ?? existing.text_ru,
					text_es: text_es ?? existing.text_es,
					text_zh: text_zh ?? existing.text_zh,
					image_id: image_id ?? existing.image_id,
					cta_text_en: cta_text_en ?? existing.cta_text_en,
					cta_text_ru: cta_text_ru ?? existing.cta_text_ru,
					cta_text_es: cta_text_es ?? existing.cta_text_es,
					cta_text_zh: cta_text_zh ?? existing.cta_text_zh,
					cta_href: cta_href ?? existing.cta_href
				})
				.where(eq(homepageAbout.id, existing.id))
				.returning();
			return json({ success: true, about: updated });
		} else {
			const [created] = await db
				.insert(homepageAbout)
				.values({
					title_en,
					title_ru,
					title_es,
					title_zh,
					text_en,
					text_ru,
					text_es,
					text_zh,
					image_id,
					cta_text_en,
					cta_text_ru,
					cta_text_es,
					cta_text_zh,
					cta_href
				})
				.returning();
			return json({ success: true, about: created });
		}
	} catch (err) {
		console.error('Error updating about:', err);
		throw error(500, 'Failed to update about');
	}
};
