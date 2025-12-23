import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import {
	orders,
	orderItems,
	orderStatusHistory,
	cartItems,
	cartSessions,
	artworks,
	currencyRates
} from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { sendOrderNotifications } from '$lib/server/notifications';

const CART_COOKIE_NAME = 'cart_session';

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `KL-${timestamp}-${random}`;
}

/**
 * Get currency code based on language
 */
function getCurrencyForLang(lang: string): string {
	switch (lang) {
		case 'ru':
			return 'RUB';
		case 'zh':
			return 'CNY';
		case 'es':
			return 'EUR';
		default:
			return 'USD';
	}
}

export interface OrderRequest {
	customer_name: string;
	customer_email: string;
	customer_phone?: string;
	shipping_country: string;
	shipping_city: string;
	shipping_address: string;
	shipping_postal: string;
	note?: string;
	lang?: string;
}

export interface OrderResponse {
	success: boolean;
	order_number: string;
	order_id: number;
}

/**
 * POST /api/shop/orders
 * Create a new order from cart contents
 */
export const POST: RequestHandler = async (event) => {
	try {
		const sessionId = event.cookies.get(CART_COOKIE_NAME);

		if (!sessionId) {
			throw error(400, 'No cart session found');
		}

		// Get cart items
		const cartItemsData = await db
			.select({
				id: cartItems.id,
				artwork_id: cartItems.artwork_id,
				price_eur_snapshot: cartItems.price_eur_snapshot
			})
			.from(cartItems)
			.where(eq(cartItems.session_id, sessionId));

		if (cartItemsData.length === 0) {
			throw error(400, 'Cart is empty');
		}

		// Verify artworks are still available
		const artworkIds = cartItemsData.map((item) => item.artwork_id);
		const artworksData = await db.select().from(artworks).where(eq(artworks.is_visible, true));

		const availableArtworks = artworksData.filter(
			(a) => artworkIds.includes(a.id) && a.is_for_sale
		);

		if (availableArtworks.length !== artworkIds.length) {
			throw error(400, 'Some items are no longer available');
		}

		// Parse request body
		const body: OrderRequest = await event.request.json();

		// Validate required fields
		if (!body.customer_name?.trim()) {
			throw error(400, 'Customer name is required');
		}
		if (!body.customer_email?.trim()) {
			throw error(400, 'Customer email is required');
		}
		if (!body.shipping_country?.trim()) {
			throw error(400, 'Shipping country is required');
		}
		if (!body.shipping_city?.trim()) {
			throw error(400, 'Shipping city is required');
		}
		if (!body.shipping_address?.trim()) {
			throw error(400, 'Shipping address is required');
		}
		if (!body.shipping_postal?.trim()) {
			throw error(400, 'Shipping postal code is required');
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(body.customer_email)) {
			throw error(400, 'Invalid email format');
		}

		// Calculate subtotal
		const subtotalEur = cartItemsData.reduce((sum, item) => sum + (item.price_eur_snapshot || 0), 0);

		// Get currency for language
		const lang = body.lang || 'en';
		const currencyCode = getCurrencyForLang(lang);

		// Get currency rate
		let currencyRate = '1';
		let totalLocal = subtotalEur;

		if (currencyCode !== 'EUR') {
			const [rate] = await db
				.select()
				.from(currencyRates)
				.where(eq(currencyRates.to_currency, currencyCode))
				.limit(1);

			if (rate) {
				currencyRate = rate.rate;
				totalLocal = Math.round(subtotalEur * parseFloat(rate.rate));
			}
		}

		// Generate order number
		const orderNumber = generateOrderNumber();

		// Create order
		const [newOrder] = await db
			.insert(orders)
			.values({
				order_number: orderNumber,
				status: 'pending',
				lang,
				customer_name: body.customer_name.trim(),
				customer_email: body.customer_email.trim().toLowerCase(),
				customer_phone: body.customer_phone?.trim() || null,
				shipping_country: body.shipping_country.trim(),
				shipping_city: body.shipping_city.trim(),
				shipping_address: body.shipping_address.trim(),
				shipping_postal: body.shipping_postal.trim(),
				note: body.note?.trim() || null,
				subtotal_eur: subtotalEur,
				currency_code: currencyCode,
				currency_rate: currencyRate,
				total_local: totalLocal
			})
			.returning();

		// Create order items and get titles
		const artworkMap = new Map(availableArtworks.map((a) => [a.id, a]));

		for (const cartItem of cartItemsData) {
			const artwork = artworkMap.get(cartItem.artwork_id);
			if (!artwork) continue;

			const titleSnapshot =
				lang === 'ru'
					? artwork.title_ru
					: lang === 'es'
						? artwork.title_es
						: lang === 'zh'
							? artwork.title_zh
							: artwork.title_en;

			await db.insert(orderItems).values({
				order_id: newOrder.id,
				artwork_id: cartItem.artwork_id,
				price_eur: cartItem.price_eur_snapshot || artwork.price || 0,
				title_snapshot: titleSnapshot
			});

			// Mark artwork as sold (not for sale anymore)
			await db
				.update(artworks)
				.set({ is_for_sale: false })
				.where(eq(artworks.id, cartItem.artwork_id));
		}

		// Add status history entry
		await db.insert(orderStatusHistory).values({
			order_id: newOrder.id,
			status: 'pending'
		});

		// Clear cart
		await db.delete(cartItems).where(eq(cartItems.session_id, sessionId));

		// Delete cart session
		await db.delete(cartSessions).where(eq(cartSessions.session_id, sessionId));

		// Clear cart cookie
		event.cookies.delete(CART_COOKIE_NAME, { path: '/' });

		// Collect order items for notification
		const notificationItems = cartItemsData.map((cartItem) => {
			const artwork = artworkMap.get(cartItem.artwork_id);
			const title =
				lang === 'ru'
					? artwork?.title_ru
					: lang === 'es'
						? artwork?.title_es
						: lang === 'zh'
							? artwork?.title_zh
							: artwork?.title_en;
			return {
				title: title || 'Artwork',
				price: cartItem.price_eur_snapshot || artwork?.price || 0
			};
		});

		// Send notifications (non-blocking)
		sendOrderNotifications({
			orderNumber,
			customerName: body.customer_name.trim(),
			customerEmail: body.customer_email.trim().toLowerCase(),
			customerPhone: body.customer_phone?.trim() || null,
			items: notificationItems,
			totalEur: subtotalEur,
			totalLocal,
			currencyCode,
			shippingCountry: body.shipping_country.trim(),
			shippingCity: body.shipping_city.trim(),
			shippingAddress: body.shipping_address.trim(),
			note: body.note?.trim() || null,
			lang
		}).catch((err) => {
			console.error('Failed to send order notifications:', err);
		});

		const response: OrderResponse = {
			success: true,
			order_number: orderNumber,
			order_id: newOrder.id
		};

		return json(response);
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error creating order:', err);
		throw error(500, 'Failed to create order');
	}
};

/**
 * GET /api/shop/orders/:number
 * Get order details by order number (for confirmation page)
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
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
		const items = await db.select().from(orderItems).where(eq(orderItems.order_id, order.id));

		return json({
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
			}))
		});
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error fetching order:', err);
		throw error(500, 'Failed to fetch order');
	}
};
