import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { artworks, series, media } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';

interface BulkRequest {
	entity: 'artworks' | 'series' | 'media';
	action: 'delete' | 'set_visible' | 'set_for_sale';
	ids: string[];
	value?: boolean;
}

// POST - perform bulk action
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: BulkRequest = await request.json();
		const { entity, action, ids, value } = body;

		if (!entity || !action || !ids || !Array.isArray(ids) || ids.length === 0) {
			throw error(400, 'Entity, action, and ids array are required');
		}

		let affected = 0;

		if (entity === 'artworks') {
			if (action === 'delete') {
				await db.delete(artworks).where(inArray(artworks.id, ids));
				affected = ids.length;
			} else if (action === 'set_visible') {
				await db
					.update(artworks)
					.set({ is_visible: value ?? true })
					.where(inArray(artworks.id, ids));
				affected = ids.length;
			} else if (action === 'set_for_sale') {
				await db
					.update(artworks)
					.set({ is_for_sale: value ?? true })
					.where(inArray(artworks.id, ids));
				affected = ids.length;
			}
		} else if (entity === 'series') {
			if (action === 'delete') {
				await db.delete(series).where(inArray(series.id, ids));
				affected = ids.length;
			} else if (action === 'set_visible') {
				await db
					.update(series)
					.set({ is_visible: value ?? true })
					.where(inArray(series.id, ids));
				affected = ids.length;
			}
		} else if (entity === 'media') {
			if (action === 'delete') {
				// Convert string ids to numbers for media
				const mediaIds = ids.map((id) => parseInt(id));
				await db.delete(media).where(inArray(media.id, mediaIds));
				affected = ids.length;
			}
		}

		return json({
			success: true,
			action,
			affected
		});
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error performing bulk action:', err);
		throw error(500, 'Failed to perform bulk action');
	}
};
