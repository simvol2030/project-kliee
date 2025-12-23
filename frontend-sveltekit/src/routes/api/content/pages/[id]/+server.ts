import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { pages, pageBlocks, media } from '$lib/server/db/schema';
import { eq, asc, and, ne } from 'drizzle-orm';

// GET single page with blocks
export const GET: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const [item] = await db
			.select({
				page: pages,
				featuredImage: media
			})
			.from(pages)
			.leftJoin(media, eq(pages.featured_image_id, media.id))
			.where(eq(pages.id, id))
			.limit(1);

		if (!item) throw error(404, 'Page not found');

		// Get page blocks
		const blocks = await db
			.select({
				block: pageBlocks,
				media: media
			})
			.from(pageBlocks)
			.leftJoin(media, eq(pageBlocks.media_id, media.id))
			.where(eq(pageBlocks.page_id, id))
			.orderBy(asc(pageBlocks.order_index));

		const result = {
			...item.page,
			featured_image: item.featuredImage
				? {
						id: item.featuredImage.id,
						url: `/uploads/${item.featuredImage.folder}/${item.featuredImage.stored_filename}`,
						alt_en: item.featuredImage.alt_en
					}
				: null,
			blocks: blocks.map((b) => ({
				...b.block,
				media: b.media
					? {
							id: b.media.id,
							url: `/uploads/${b.media.folder}/${b.media.stored_filename}`,
							alt_en: b.media.alt_en
						}
					: null
			}))
		};

		return json(result);
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to fetch page');
	}
};

// PATCH update page
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const body = await request.json();

		// Check slug uniqueness if slug is being changed
		if (body.slug) {
			const existing = await db
				.select()
				.from(pages)
				.where(and(eq(pages.slug, body.slug), ne(pages.id, id)))
				.limit(1);
			if (existing.length > 0) {
				throw error(400, 'Page with this slug already exists');
			}
		}

		const [updated] = await db
			.update(pages)
			.set({
				slug: body.slug ?? undefined,
				page_type: body.page_type ?? undefined,
				template: body.template ?? undefined,
				title_en: body.title_en ?? undefined,
				title_ru: body.title_ru ?? undefined,
				title_es: body.title_es ?? undefined,
				title_zh: body.title_zh ?? undefined,
				content_en: body.content_en ?? undefined,
				content_ru: body.content_ru ?? undefined,
				content_es: body.content_es ?? undefined,
				content_zh: body.content_zh ?? undefined,
				seo_title_en: body.seo_title_en ?? undefined,
				seo_title_ru: body.seo_title_ru ?? undefined,
				seo_title_es: body.seo_title_es ?? undefined,
				seo_title_zh: body.seo_title_zh ?? undefined,
				seo_description_en: body.seo_description_en ?? undefined,
				seo_description_ru: body.seo_description_ru ?? undefined,
				seo_description_es: body.seo_description_es ?? undefined,
				seo_description_zh: body.seo_description_zh ?? undefined,
				featured_image_id: body.featured_image_id ?? undefined,
				is_published: body.is_published ?? undefined,
				is_in_menu: body.is_in_menu ?? undefined,
				updated_at: new Date().toISOString()
			})
			.where(eq(pages.id, id))
			.returning();

		if (!updated) throw error(404, 'Page not found');

		return json({ success: true, page: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update page');
	}
};

// DELETE page
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		// Blocks will cascade delete
		await db.delete(pages).where(eq(pages.id, id));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete page');
	}
};
