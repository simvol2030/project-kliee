import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { menuItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET single menu item
export const GET: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
		if (!item) throw error(404, 'Menu item not found');
		return json(item);
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to fetch menu item');
	}
};

// PATCH update menu item
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

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

		const [updated] = await db
			.update(menuItems)
			.set({
				href: href ?? undefined,
				label_en: label_en ?? undefined,
				label_ru: label_ru ?? undefined,
				label_es: label_es ?? undefined,
				label_zh: label_zh ?? undefined,
				parent_id: parent_id ?? undefined,
				has_dropdown: has_dropdown ?? undefined,
				order_index: order_index ?? undefined,
				icon: icon ?? undefined,
				is_visible: is_visible ?? undefined
			})
			.where(eq(menuItems.id, id))
			.returning();

		if (!updated) throw error(404, 'Menu item not found');
		return json({ success: true, item: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update menu item');
	}
};

// DELETE menu item
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		// First delete children
		await db.delete(menuItems).where(eq(menuItems.parent_id, id));
		// Then delete item
		await db.delete(menuItems).where(eq(menuItems.id, id));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete menu item');
	}
};
