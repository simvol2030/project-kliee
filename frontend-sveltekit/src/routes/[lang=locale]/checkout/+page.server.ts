import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/client';
import { cartItems, cartSessions, shopProducts, shopProductImages, media, currencyRates, artworks } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const CART_COOKIE_NAME = 'cart_session';

interface CartItemForCheckout {
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
}

export const load: PageServerLoad = async ({ cookies, params }) => {
	const sessionId = cookies.get(CART_COOKIE_NAME);

	// If no cart session, redirect to cart page
	if (!sessionId) {
		throw redirect(302, `/${params.lang}/cart`);
	}

	// Get cart items with product details
	const items = await db
		.select({
			id: cartItems.id,
			product_id: cartItems.product_id,
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

	// If cart is empty, redirect to cart page
	if (items.length === 0) {
		throw redirect(302, `/${params.lang}/cart`);
	}

	// Format cart items
	const cartItemsForCheckout: CartItemForCheckout[] = items.map((item) => {
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
				: null
		};
	});

	// Calculate total (only available items)
	const totalEur = cartItemsForCheckout.reduce(
		(sum, item) => sum + (item.is_available ? item.price_eur : 0),
		0
	);

	// Get currency rates
	const rates = await db.select().from(currencyRates);

	return {
		cart: {
			items: cartItemsForCheckout,
			count: cartItemsForCheckout.length,
			total_eur: totalEur
		},
		currencyRates: rates.map((r) => ({
			from: r.from_currency,
			to: r.to_currency,
			rate: parseFloat(r.rate)
		})),
		lang: params.lang
	};
};
