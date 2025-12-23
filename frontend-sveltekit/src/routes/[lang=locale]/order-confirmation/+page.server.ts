import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db/client';
import { orders, orderItems, currencyRates } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url, params }) => {
	const orderNumber = url.searchParams.get('number');

	if (!orderNumber) {
		throw error(400, 'Order number is required');
	}

	// Get order
	const [order] = await db
		.select()
		.from(orders)
		.where(eq(orders.order_number, orderNumber))
		.limit(1);

	if (!order) {
		throw error(404, 'Order not found');
	}

	// Get order items
	const items = await db
		.select()
		.from(orderItems)
		.where(eq(orderItems.order_id, order.id));

	// Get currency rates
	const rates = await db.select().from(currencyRates);

	return {
		order: {
			id: order.id,
			order_number: order.order_number,
			status: order.status,
			customer_name: order.customer_name,
			customer_email: order.customer_email,
			shipping_country: order.shipping_country,
			shipping_city: order.shipping_city,
			subtotal_eur: order.subtotal_eur,
			currency_code: order.currency_code,
			total_local: order.total_local,
			created_at: order.created_at
		},
		items: items.map((item) => ({
			artwork_id: item.artwork_id,
			title: item.title_snapshot,
			price_eur: item.price_eur
		})),
		currencyRates: rates.map((r) => ({
			from: r.from_currency,
			to: r.to_currency,
			rate: parseFloat(r.rate)
		})),
		lang: params.lang
	};
};
