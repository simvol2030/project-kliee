import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	// Fetch cart data and currency rates in parallel
	const [cartResponse, currenciesResponse] = await Promise.all([
		fetch('/api/shop/cart'),
		fetch('/api/shop/currencies')
	]);

	const cart = cartResponse.ok ? await cartResponse.json() : { items: [], count: 0, total_eur: 0 };
	const currencies = currenciesResponse.ok
		? await currenciesResponse.json()
		: { base: 'EUR', rates: [] };

	return {
		cart,
		currencyRates: currencies.rates,
		lang: params.lang as 'en' | 'ru' | 'es' | 'zh'
	};
};
