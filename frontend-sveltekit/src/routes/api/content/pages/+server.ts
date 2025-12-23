import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { pages, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET all pages
export const GET: RequestHandler = async ({ url }) => {
	const published = url.searchParams.get('published');

	try {
		const items = await db
			.select({
				page: pages,
				featuredImage: media
			})
			.from(pages)
			.leftJoin(media, eq(pages.featured_image_id, media.id))
			.orderBy(asc(pages.slug));

		let result = items.map((item) => ({
			...item.page,
			featured_image: item.featuredImage
				? {
						id: item.featuredImage.id,
						url: `/uploads/${item.featuredImage.folder}/${item.featuredImage.stored_filename}`,
						alt_en: item.featuredImage.alt_en
					}
				: null
		}));

		// Filter by published if requested
		if (published === 'true') {
			result = result.filter((p) => p.is_published);
		}

		return json(result);
	} catch (err) {
		console.error('Error fetching pages:', err);
		throw error(500, 'Failed to fetch pages');
	}
};

// POST create page
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Check if slug already exists
		const existing = await db.select().from(pages).where(eq(pages.slug, body.slug)).limit(1);
		if (existing.length > 0) {
			throw error(400, 'Page with this slug already exists');
		}

		const [created] = await db
			.insert(pages)
			.values({
				slug: body.slug,
				page_type: body.page_type || 'static',
				template: body.template || 'default',
				title_en: body.title_en || '',
				title_ru: body.title_ru || '',
				title_es: body.title_es || '',
				title_zh: body.title_zh || '',
				content_en: body.content_en,
				content_ru: body.content_ru,
				content_es: body.content_es,
				content_zh: body.content_zh,
				seo_title_en: body.seo_title_en,
				seo_title_ru: body.seo_title_ru,
				seo_title_es: body.seo_title_es,
				seo_title_zh: body.seo_title_zh,
				seo_description_en: body.seo_description_en,
				seo_description_ru: body.seo_description_ru,
				seo_description_es: body.seo_description_es,
				seo_description_zh: body.seo_description_zh,
				featured_image_id: body.featured_image_id,
				is_published: body.is_published ?? true,
				is_in_menu: body.is_in_menu ?? false
			})
			.returning();

		return json({ success: true, page: created });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error creating page:', err);
		throw error(500, 'Failed to create page');
	}
};
