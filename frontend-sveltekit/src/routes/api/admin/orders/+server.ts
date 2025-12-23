import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { orders, orderStatusHistory } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';

interface UpdateStatusRequest {
	order_id: number;
	status: OrderStatus;
	admin_note?: string;
}

/**
 * PATCH /api/admin/orders
 * Update order status
 */
export const PATCH: RequestHandler = async ({ request, locals }) => {
	try {
		const body: UpdateStatusRequest = await request.json();

		if (!body.order_id || !body.status) {
			throw error(400, 'Order ID and status are required');
		}

		const validStatuses: OrderStatus[] = [
			'pending',
			'confirmed',
			'processing',
			'shipped',
			'completed',
			'cancelled'
		];

		if (!validStatuses.includes(body.status)) {
			throw error(400, 'Invalid status');
		}

		// Check if order exists
		const [existingOrder] = await db
			.select()
			.from(orders)
			.where(eq(orders.id, body.order_id))
			.limit(1);

		if (!existingOrder) {
			throw error(404, 'Order not found');
		}

		// Update order status
		await db
			.update(orders)
			.set({
				status: body.status,
				admin_note: body.admin_note ?? existingOrder.admin_note,
				updated_at: new Date().toISOString()
			})
			.where(eq(orders.id, body.order_id));

		// Add status history entry
		await db.insert(orderStatusHistory).values({
			order_id: body.order_id,
			status: body.status,
			changed_by: (locals as any).user?.id || null
		});

		return json({ success: true, status: body.status });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error updating order:', err);
		throw error(500, 'Failed to update order');
	}
};

/**
 * GET /api/admin/orders?id=X
 * Get order details
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const orderId = url.searchParams.get('id');

		if (!orderId) {
			throw error(400, 'Order ID is required');
		}

		const [order] = await db
			.select()
			.from(orders)
			.where(eq(orders.id, parseInt(orderId)))
			.limit(1);

		if (!order) {
			throw error(404, 'Order not found');
		}

		// Get status history
		const history = await db
			.select()
			.from(orderStatusHistory)
			.where(eq(orderStatusHistory.order_id, order.id));

		return json({ order, history });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error fetching order:', err);
		throw error(500, 'Failed to fetch order');
	}
};
