import { json, error } from '@sveltejs/kit';
import type { RequestHandler, RequestEvent } from './$types';
import { db } from '$lib/server/db/client';
import { cartSessions, cartItems, artworks, artworkImages, media } from '$lib/server/db/schema';
import { eq, and, gt } from 'drizzle-orm';
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
 * Cart item with artwork details
 */
export interface CartItemWithDetails {
	id: number;
	artwork_id: string;
	title_en: string;
	title_ru: string;
	title_es: string;
	title_zh: string;
	slug: string | null;
	price: number | null;
	is_for_sale: boolean | null;
	image: {
		stored_filename: string;
		folder: string | null;
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

		// Get cart items with artwork details
		const items = await db
			.select({
				id: cartItems.id,
				artwork_id: cartItems.artwork_id,
				added_at: cartItems.added_at,
				title_en: artworks.title_en,
				title_ru: artworks.title_ru,
				title_es: artworks.title_es,
				title_zh: artworks.title_zh,
				slug: artworks.slug,
				price: artworks.price,
				is_for_sale: artworks.is_for_sale,
				stored_filename: media.stored_filename,
				folder: media.folder,
				alt_en: media.alt_en,
				alt_ru: media.alt_ru,
				alt_es: media.alt_es,
				alt_zh: media.alt_zh
			})
			.from(cartItems)
			.innerJoin(artworks, eq(cartItems.artwork_id, artworks.id))
			.leftJoin(
				artworkImages,
				and(eq(artworkImages.artwork_id, artworks.id), eq(artworkImages.is_primary, true))
			)
			.leftJoin(media, eq(artworkImages.media_id, media.id))
			.where(eq(cartItems.session_id, sessionId));

		const cartItemsWithDetails: CartItemWithDetails[] = items.map((item) => ({
			id: item.id,
			artwork_id: item.artwork_id,
			title_en: item.title_en,
			title_ru: item.title_ru,
			title_es: item.title_es,
			title_zh: item.title_zh,
			slug: item.slug,
			price: item.price,
			is_for_sale: item.is_for_sale,
			image: item.stored_filename
				? {
						stored_filename: item.stored_filename,
						folder: item.folder,
						alt_en: item.alt_en,
						alt_ru: item.alt_ru,
						alt_es: item.alt_es,
						alt_zh: item.alt_zh
					}
				: null,
			added_at: item.added_at
		}));

		// Calculate total
		const totalEur = cartItemsWithDetails.reduce(
			(sum, item) => sum + (item.price || 0),
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
 * Add item to cart (quantity is always 1 - artworks are unique)
 */
export const POST: RequestHandler = async (event) => {
	try {
		const sessionId = getSessionId(event);
		await ensureCartSession(sessionId);

		const body = await event.request.json();
		const { artwork_id } = body;

		if (!artwork_id || typeof artwork_id !== 'string') {
			throw error(400, 'artwork_id is required');
		}

		// Check if artwork exists and is for sale
		const [artwork] = await db
			.select()
			.from(artworks)
			.where(and(eq(artworks.id, artwork_id), eq(artworks.is_for_sale, true)))
			.limit(1);

		if (!artwork) {
			throw error(404, 'Artwork not found or not for sale');
		}

		// Check if already in cart (artworks are unique, can't add twice)
		const [existingItem] = await db
			.select()
			.from(cartItems)
			.where(and(eq(cartItems.session_id, sessionId), eq(cartItems.artwork_id, artwork_id)))
			.limit(1);

		if (existingItem) {
			throw error(409, 'Item already in cart');
		}

		// Add to cart with price snapshot
		await db.insert(cartItems).values({
			session_id: sessionId,
			artwork_id: artwork_id,
			price_eur_snapshot: artwork.price
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
		const artworkId = url.searchParams.get('artwork_id');
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
		} else if (artworkId) {
			// Remove by artwork_id (artwork_id is text in database)
			await db
				.delete(cartItems)
				.where(
					and(eq(cartItems.session_id, sessionId), eq(cartItems.artwork_id, artworkId))
				);
		} else {
			throw error(400, 'id, artwork_id, or clear=true required');
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
