import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { artworks, series, menuItems, exhibitions } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

interface ReorderItem {
	id: string | number;
	order_index: number;
}

interface ReorderRequest {
	entity: 'artworks' | 'series' | 'menu_items' | 'exhibitions';
	items: ReorderItem[];
}

// PATCH - batch update order_index for multiple items
export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const body: ReorderRequest = await request.json();
		const { entity, items } = body;

		if (!entity || !items || !Array.isArray(items)) {
			throw error(400, 'Entity and items array are required');
		}

		if (items.length === 0) {
			return json({ success: true, updated: 0 });
		}

		// Validate entity type
		const tableMap = {
			artworks,
			series,
			menu_items: menuItems,
			exhibitions
		};

		const table = tableMap[entity];
		if (!table) {
			throw error(400, `Unknown entity: ${entity}`);
		}

		// Update each item's order_index
		let updated = 0;
		for (const item of items) {
			if (entity === 'artworks') {
				await db
					.update(artworks)
					.set({ order_index: item.order_index })
					.where(eq(artworks.id, String(item.id)));
			} else if (entity === 'series') {
				await db
					.update(series)
					.set({ order_index: item.order_index })
					.where(eq(series.id, String(item.id)));
			} else if (entity === 'menu_items') {
				await db
					.update(menuItems)
					.set({ order_index: item.order_index })
					.where(eq(menuItems.id, Number(item.id)));
			} else if (entity === 'exhibitions') {
				await db
					.update(exhibitions)
					.set({ order_index: item.order_index })
					.where(eq(exhibitions.id, Number(item.id)));
			}
			updated++;
		}

		return json({ success: true, updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error reordering items:', err);
		throw error(500, 'Failed to reorder items');
	}
};
