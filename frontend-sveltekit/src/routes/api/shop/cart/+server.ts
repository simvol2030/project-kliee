import { json, error } from '@sveltejs/kit';
import type { RequestHandler, RequestEvent } from './$types';
import { db } from '$lib/server/db/client';
import { cartSessions, cartItems, shopProducts, shopProductImages, media, artworks } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const CART_COOKIE_NAME = 'cart_session';
const CART_EXPIRY_DAYS = 30;

/**
 * Get or create cart session ID from cookie
 */
function getSessionId(event: RequestEvent): string {
	let sessionId = event.cookies.get(CART_COOKIE_NAME);

	if (!sessionId) {
		sessionId = randomUUID();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + CART_EXPIRY_DAYS);

		event.cookies.set(CART_COOKIE_NAME, sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: CART_EXPIRY_DAYS * 24 * 60 * 60
		});
	}

	return sessionId;
}

/**
 * Ensure cart session exists in database
 */
async function ensureCartSession(sessionId: string): Promise<void> {
	const [existing] = await db
		.select()
		.from(cartSessions)
		.where(eq(cartSessions.session_id, sessionId))
		.limit(1);

	if (!existing) {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + CART_EXPIRY_DAYS);

		await db.insert(cartSessions).values({
			session_id: sessionId,
			expires_at: expiresAt.toISOString()
		});
	}
}

/**
 * Cart item with product details
 */
export interface CartItemWithDetails {
	id: number;
	product_id: number;
	slug: string;
	title_en: string;
	title_ru: string;
	title_es: string;
	title_zh: string;
	price_eur: number;
	is_available: boolean;
	image: {
		url: string;
		alt_en: string | null;
		alt_ru: string | null;
		alt_es: string | null;
		alt_zh: string | null;
	} | null;
	added_at: string | null;
}

export interface CartResponse {
	items: CartItemWithDetails[];
	count: number;
	total_eur: number;
}

/**
 * GET /api/shop/cart
 * Returns current cart contents
 */
export const GET: RequestHandler = async (event) => {
	try {
		const sessionId = getSessionId(event);
		await ensureCartSession(sessionId);

		// Get cart items with product details
		const items = await db
			.select({
				id: cartItems.id,
				product_id: cartItems.product_id,
				added_at: cartItems.added_at,
				title_en: shopProducts.title_en,
				title_ru: shopProducts.title_ru,
				title_es: shopProducts.title_es,
				title_zh: shopProducts.title_zh,
				price_eur: shopProducts.price_eur,
				stock_quantity: shopProducts.stock_quantity,
				is_unlimited: shopProducts.is_unlimited,
				is_visible: shopProducts.is_visible,
				artwork_id: shopProducts.artwork_id,
				artworkSlug: artworks.slug,
				stored_filename: media.stored_filename,
				folder: media.folder,
				alt_en: media.alt_en,
				alt_ru: media.alt_ru,
				alt_es: media.alt_es,
				alt_zh: media.alt_zh
			})
			.from(cartItems)
			.innerJoin(shopProducts, eq(cartItems.product_id, shopProducts.id))
			.leftJoin(artworks, eq(shopProducts.artwork_id, artworks.id))
			.leftJoin(
				shopProductImages,
				and(eq(shopProductImages.product_id, shopProducts.id), eq(shopProductImages.is_primary, true))
			)
			.leftJoin(media, eq(shopProductImages.media_id, media.id))
			.where(eq(cartItems.session_id, sessionId));

		const cartItemsWithDetails: CartItemWithDetails[] = items.map((item) => {
			const isAvailable = Boolean(item.is_visible) && (Boolean(item.is_unlimited) || (item.stock_quantity ?? 0) > 0);
			const slug = item.artworkSlug || `product-${item.product_id}`;

			return {
				id: item.id,
				product_id: item.product_id,
				slug,
				title_en: item.title_en,
				title_ru: item.title_ru,
				title_es: item.title_es,
				title_zh: item.title_zh,
				price_eur: item.price_eur,
				is_available: isAvailable,
				image: item.stored_filename
					? {
							url: `/uploads/${item.folder || 'products'}/${item.stored_filename}`,
							alt_en: item.alt_en,
							alt_ru: item.alt_ru,
							alt_es: item.alt_es,
							alt_zh: item.alt_zh
						}
					: null,
				added_at: item.added_at
			};
		});

		// Calculate total
		const totalEur = cartItemsWithDetails.reduce(
			(sum, item) => sum + (item.is_available ? item.price_eur : 0),
			0
		);

		const response: CartResponse = {
			items: cartItemsWithDetails,
			count: cartItemsWithDetails.length,
			total_eur: totalEur
		};

		return json(response);
	} catch (err) {
		console.error('Error fetching cart:', err);
		throw error(500, 'Failed to fetch cart');
	}
};

/**
 * POST /api/shop/cart
 * Add item to cart
 */
export const POST: RequestHandler = async (event) => {
	try {
		const sessionId = getSessionId(event);
		await ensureCartSession(sessionId);

		const body = await event.request.json();
		const { product_id } = body;

		if (!product_id || typeof product_id !== 'number') {
			throw error(400, 'product_id is required and must be a number');
		}

		// Check if product exists and is available
		const [product] = await db
			.select()
			.from(shopProducts)
			.where(and(eq(shopProducts.id, product_id), eq(shopProducts.is_visible, true)))
			.limit(1);

		if (!product) {
			throw error(404, 'Product not found');
		}

		// Check stock
		const isAvailable = product.is_unlimited || (product.stock_quantity ?? 0) > 0;
		if (!isAvailable) {
			throw error(400, 'Product is out of stock');
		}

		// Check if already in cart (products can only be added once)
		const [existingItem] = await db
			.select()
			.from(cartItems)
			.where(and(eq(cartItems.session_id, sessionId), eq(cartItems.product_id, product_id)))
			.limit(1);

		if (existingItem) {
			throw error(409, 'Item already in cart');
		}

		// Add to cart with price snapshot
		await db.insert(cartItems).values({
			session_id: sessionId,
			product_id: product_id,
			price_eur_snapshot: product.price_eur
		});

		// Return updated cart count
		const count = await db
			.select({ id: cartItems.id })
			.from(cartItems)
			.where(eq(cartItems.session_id, sessionId));

		return json({ success: true, count: count.length });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error adding to cart:', err);
		throw error(500, 'Failed to add item to cart');
	}
};

/**
 * DELETE /api/shop/cart
 * Remove item from cart or clear entire cart
 */
export const DELETE: RequestHandler = async (event) => {
	try {
		const sessionId = getSessionId(event);
		const url = new URL(event.request.url);
		const itemId = url.searchParams.get('id');
		const productId = url.searchParams.get('product_id');
		const clearAll = url.searchParams.get('clear') === 'true';

		if (clearAll) {
			// Clear entire cart
			await db.delete(cartItems).where(eq(cartItems.session_id, sessionId));
			return json({ success: true, count: 0 });
		}

		if (itemId) {
			// Remove specific cart item by id
			await db
				.delete(cartItems)
				.where(and(eq(cartItems.session_id, sessionId), eq(cartItems.id, parseInt(itemId))));
		} else if (productId) {
			// Remove by product_id
			await db
				.delete(cartItems)
				.where(
					and(eq(cartItems.session_id, sessionId), eq(cartItems.product_id, parseInt(productId)))
				);
		} else {
			throw error(400, 'id, product_id, or clear=true required');
		}

		// Return updated cart count
		const count = await db
			.select({ id: cartItems.id })
			.from(cartItems)
			.where(eq(cartItems.session_id, sessionId));

		return json({ success: true, count: count.length });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error removing from cart:', err);
		throw error(500, 'Failed to remove item from cart');
	}
};
