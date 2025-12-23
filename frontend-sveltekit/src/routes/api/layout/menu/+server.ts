import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { menuItems } from '$lib/server/db/schema';
import { eq, asc, isNull } from 'drizzle-orm';

// GET all menu items
export const GET: RequestHandler = async () => {
	try {
		const items = await db
			.select()
			.from(menuItems)
			.orderBy(asc(menuItems.order_index));

		// Build hierarchical structure
		const topLevel = items.filter((i) => !i.parent_id);
		const withChildren = topLevel.map((item) => ({
			...item,
			children: items.filter((child) => child.parent_id === item.id)
		}));

		return json({ items: withChildren });
	} catch (err) {
		console.error('Error fetching menu:', err);
		return json({ items: [], error: 'Failed to fetch menu' }, { status: 500 });
	}
};

// POST create new menu item
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const {
			href,
			label_en,
			label_ru,
			label_es,
			label_zh,
			parent_id,
			has_dropdown,
			order_index,
			icon,
			is_visible
		} = body;

		if (!href || !label_en) {
			throw error(400, 'href and label_en are required');
		}

		const [newItem] = await db
			.insert(menuItems)
			.values({
				href,
				label_en,
				label_ru: label_ru || label_en,
				label_es: label_es || label_en,
				label_zh: label_zh || label_en,
				parent_id: parent_id || null,
				has_dropdown: has_dropdown || false,
				order_index: order_index || 0,
				icon: icon || null,
				is_visible: is_visible !== false
			})
			.returning();

		return json({ success: true, item: newItem });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error creating menu item:', err);
		throw error(500, 'Failed to create menu item');
	}
};
