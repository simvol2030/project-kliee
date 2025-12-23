import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { orders, orderItems } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Fetch all orders ordered by creation date (newest first)
	const allOrders = await db.select().from(orders).orderBy(desc(orders.created_at));

	// For each order, fetch items
	const ordersWithItems = await Promise.all(
		allOrders.map(async (order) => {
			const items = await db.select().from(orderItems).where(eq(orderItems.order_id, order.id));
			return {
				...order,
				items,
				itemCount: items.length
			};
		})
	);

	return {
		orders: ordersWithItems
	};
};
