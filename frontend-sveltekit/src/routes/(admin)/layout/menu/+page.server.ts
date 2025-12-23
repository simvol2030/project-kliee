import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { menuItems } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const items = await db.select().from(menuItems).orderBy(asc(menuItems.order_index));

	// Build hierarchical structure
	const topLevel = items.filter((i) => !i.parent_id);
	const withChildren = topLevel.map((item) => ({
		...item,
		children: items.filter((child) => child.parent_id === item.id)
	}));

	return { items: withChildren };
};
