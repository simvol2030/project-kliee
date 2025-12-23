import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { pageBlocks } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// PATCH update block
export const PATCH: RequestHandler = async ({ params, request }) => {
	const pageId = parseInt(params.id);
	const blockId = parseInt(params.blockId);
	if (isNaN(pageId) || isNaN(blockId)) throw error(400, 'Invalid ID');

	try {
		const body = await request.json();

		const [updated] = await db
			.update(pageBlocks)
			.set({
				block_type: body.block_type ?? undefined,
				content_en: body.content_en ?? undefined,
				content_ru: body.content_ru ?? undefined,
				content_es: body.content_es ?? undefined,
				content_zh: body.content_zh ?? undefined,
				settings_json: body.settings_json ? JSON.stringify(body.settings_json) : undefined,
				media_id: body.media_id ?? undefined,
				order_index: body.order_index ?? undefined,
				is_visible: body.is_visible ?? undefined
			})
			.where(and(eq(pageBlocks.id, blockId), eq(pageBlocks.page_id, pageId)))
			.returning();

		if (!updated) throw error(404, 'Block not found');

		return json({ success: true, block: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update block');
	}
};

// DELETE block
export const DELETE: RequestHandler = async ({ params }) => {
	const pageId = parseInt(params.id);
	const blockId = parseInt(params.blockId);
	if (isNaN(pageId) || isNaN(blockId)) throw error(400, 'Invalid ID');

	try {
		await db
			.delete(pageBlocks)
			.where(and(eq(pageBlocks.id, blockId), eq(pageBlocks.page_id, pageId)));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete block');
	}
};
