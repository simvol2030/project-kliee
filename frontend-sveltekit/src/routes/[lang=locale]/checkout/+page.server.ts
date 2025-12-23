import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/client';
import { cartItems, cartSessions, artworks, artworkImages, media, currencyRates } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const CART_COOKIE_NAME = 'cart_session';

interface CartItemForCheckout {
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

	// Get cart items with artwork details
	const items = await db
		.select({
			id: cartItems.id,
			artwork_id: cartItems.artwork_id,
			title_en: artworks.title_en,
			title_ru: artworks.title_ru,
			title_es: artworks.title_es,
			title_zh: artworks.title_zh,
			slug: artworks.slug,
			price: artworks.price,
			is_for_sale: artworks.is_for_sale,
			stored_filename: media.stored_filename,
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

	// If cart is empty, redirect to cart page
	if (items.length === 0) {
		throw redirect(302, `/${params.lang}/cart`);
	}

	// Format cart items
	const cartItemsForCheckout: CartItemForCheckout[] = items.map((item) => ({
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
					alt_en: item.alt_en,
					alt_ru: item.alt_ru,
					alt_es: item.alt_es,
					alt_zh: item.alt_zh
				}
			: null
	}));

	// Calculate total
	const totalEur = cartItemsForCheckout.reduce(
		(sum, item) => sum + (item.price || 0),
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
