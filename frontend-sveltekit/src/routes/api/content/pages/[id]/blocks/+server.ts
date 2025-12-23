import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { pageBlocks, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET all blocks for a page
export const GET: RequestHandler = async ({ params }) => {
	const pageId = parseInt(params.id);
	if (isNaN(pageId)) throw error(400, 'Invalid page ID');

	try {
		const blocks = await db
			.select({
				block: pageBlocks,
				media: media
			})
			.from(pageBlocks)
			.leftJoin(media, eq(pageBlocks.media_id, media.id))
			.where(eq(pageBlocks.page_id, pageId))
			.orderBy(asc(pageBlocks.order_index));

		const result = blocks.map((b) => ({
			...b.block,
			media: b.media
				? {
						id: b.media.id,
						url: `/uploads/${b.media.folder}/${b.media.stored_filename}`,
						alt_en: b.media.alt_en
					}
				: null
		}));

		return json(result);
	} catch (err) {
		throw error(500, 'Failed to fetch blocks');
	}
};

// POST create block
export const POST: RequestHandler = async ({ params, request }) => {
	const pageId = parseInt(params.id);
	if (isNaN(pageId)) throw error(400, 'Invalid page ID');

	try {
		const body = await request.json();

		const [created] = await db
			.insert(pageBlocks)
			.values({
				page_id: pageId,
				block_type: body.block_type || 'text',
				content_en: body.content_en,
				content_ru: body.content_ru,
				content_es: body.content_es,
				content_zh: body.content_zh,
				settings_json: body.settings_json ? JSON.stringify(body.settings_json) : null,
				media_id: body.media_id,
				order_index: body.order_index ?? 0,
				is_visible: body.is_visible ?? true
			})
			.returning();

		return json({ success: true, block: created });
	} catch (err) {
		console.error('Error creating block:', err);
		throw error(500, 'Failed to create block');
	}
};

// PUT reorder blocks (replace all blocks order)
export const PUT: RequestHandler = async ({ params, request }) => {
	const pageId = parseInt(params.id);
	if (isNaN(pageId)) throw error(400, 'Invalid page ID');

	try {
		const body = await request.json();
		const { block_ids } = body;

		if (!Array.isArray(block_ids)) {
			throw error(400, 'block_ids must be an array');
		}

		// Update order_index for each block
		for (let i = 0; i < block_ids.length; i++) {
			await db
				.update(pageBlocks)
				.set({ order_index: i })
				.where(eq(pageBlocks.id, block_ids[i]));
		}

		return json({ success: true });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to reorder blocks');
	}
};
