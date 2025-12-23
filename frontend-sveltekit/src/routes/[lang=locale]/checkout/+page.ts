import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, params }) => {
	// Fetch cart and currencies in parallel
	const [cartResponse, currenciesResponse] = await Promise.all([
		fetch('/api/shop/cart'),
		fetch('/api/shop/currencies')
	]);

	const cart = cartResponse.ok ? await cartResponse.json() : { items: [], count: 0, total_eur: 0 };
	const currencies = currenciesResponse.ok
		? await currenciesResponse.json()
		: { base: 'EUR', rates: [] };

	// Redirect to cart if empty
	if (cart.items.length === 0) {
		throw redirect(302, `/${params.lang}/cart`);
	}

	return {
		cart,
		currencyRates: currencies.rates,
		lang: params.lang as 'en' | 'ru' | 'es' | 'zh'
	};
};
