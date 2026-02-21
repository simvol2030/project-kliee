import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { homepageHero, heroSlides, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET hero data with slides
export const GET: RequestHandler = async () => {
	try {
		const [hero] = await db.select().from(homepageHero).limit(1);

		let slides: any[] = [];
		if (hero) {
			slides = await db
				.select({
					slide: heroSlides,
					media: media
				})
				.from(heroSlides)
				.leftJoin(media, eq(heroSlides.media_id, media.id))
				.where(eq(heroSlides.hero_id, hero.id))
				.orderBy(asc(heroSlides.order_index));
		}

		return json({
			hero: hero || null,
			slides: slides.map((s) => ({
				...s.slide,
				image: s.media
					? {
							id: s.media.id,
							url: `/uploads/${s.media.folder}/${s.media.stored_filename}`,
							alt_en: s.media.alt_en,
							alt_ru: s.media.alt_ru,
							alt_es: s.media.alt_es,
							alt_zh: s.media.alt_zh
						}
					: null
			}))
		});
	} catch (err) {
		console.error('Error fetching hero:', err);
		return json({ hero: null, slides: [], error: 'Failed to fetch hero' }, { status: 500 });
	}
};

// POST/PATCH - Update hero or add slide
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { action } = body;

		if (action === 'updateHero') {
			const {
				title_en,
				title_ru,
				title_es,
				title_zh,
				subtitle_en,
				subtitle_ru,
				subtitle_es,
				subtitle_zh,
				quote_en,
				quote_ru,
				quote_es,
				quote_zh,
				announcement_highlight_en,
				announcement_highlight_ru,
				announcement_highlight_es,
				announcement_highlight_zh,
				announcement_text_en,
				announcement_text_ru,
				announcement_text_es,
				announcement_text_zh,
				announcement_link
			} = body;

			const [existing] = await db.select().from(homepageHero).limit(1);

			if (existing) {
				const [updated] = await db
					.update(homepageHero)
					.set({
						title_en: title_en ?? existing.title_en,
						title_ru: title_ru ?? existing.title_ru,
						title_es: title_es ?? existing.title_es,
						title_zh: title_zh ?? existing.title_zh,
						subtitle_en: subtitle_en ?? existing.subtitle_en,
						subtitle_ru: subtitle_ru ?? existing.subtitle_ru,
						subtitle_es: subtitle_es ?? existing.subtitle_es,
						subtitle_zh: subtitle_zh ?? existing.subtitle_zh,
						quote_en: quote_en ?? existing.quote_en,
						quote_ru: quote_ru ?? existing.quote_ru,
						quote_es: quote_es ?? existing.quote_es,
						quote_zh: quote_zh ?? existing.quote_zh,
						announcement_highlight_en: announcement_highlight_en ?? existing.announcement_highlight_en,
						announcement_highlight_ru: announcement_highlight_ru ?? existing.announcement_highlight_ru,
						announcement_highlight_es: announcement_highlight_es ?? existing.announcement_highlight_es,
						announcement_highlight_zh: announcement_highlight_zh ?? existing.announcement_highlight_zh,
						announcement_text_en: announcement_text_en ?? existing.announcement_text_en,
						announcement_text_ru: announcement_text_ru ?? existing.announcement_text_ru,
						announcement_text_es: announcement_text_es ?? existing.announcement_text_es,
						announcement_text_zh: announcement_text_zh ?? existing.announcement_text_zh,
						announcement_link: announcement_link ?? existing.announcement_link
					})
					.where(eq(homepageHero.id, existing.id))
					.returning();
				return json({ success: true, hero: updated });
			} else {
				const [created] = await db
					.insert(homepageHero)
					.values({
						title_en: title_en || 'Welcome',
						title_ru: title_ru || 'Добро пожаловать',
						title_es: title_es || 'Bienvenido',
						title_zh: title_zh || '欢迎',
						subtitle_en,
						subtitle_ru,
						subtitle_es,
						subtitle_zh,
						quote_en,
						quote_ru,
						quote_es,
						quote_zh,
						announcement_highlight_en,
						announcement_highlight_ru,
						announcement_highlight_es,
						announcement_highlight_zh,
						announcement_text_en,
						announcement_text_ru,
						announcement_text_es,
						announcement_text_zh,
						announcement_link
					})
					.returning();
				return json({ success: true, hero: created });
			}
		}

		if (action === 'addSlide') {
			const { media_id, alt_en, alt_ru, alt_es, alt_zh, duration, order_index } = body;

			// Get or create hero
			let [hero] = await db.select().from(homepageHero).limit(1);
			if (!hero) {
				[hero] = await db
					.insert(homepageHero)
					.values({
						title_en: 'Welcome',
						title_ru: 'Добро пожаловать',
						title_es: 'Bienvenido',
						title_zh: '欢迎'
					})
					.returning();
			}

			const [slide] = await db
				.insert(heroSlides)
				.values({
					hero_id: hero.id,
					media_id,
					alt_en,
					alt_ru,
					alt_es,
					alt_zh,
					duration: duration || 4000,
					order_index: order_index || 0,
					is_visible: true
				})
				.returning();

			return json({ success: true, slide });
		}

		throw error(400, 'Invalid action');
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error updating hero:', err);
		throw error(500, 'Failed to update hero');
	}
};
