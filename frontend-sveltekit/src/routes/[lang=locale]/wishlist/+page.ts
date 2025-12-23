import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	// Fetch currency rates
	const currenciesResponse = await fetch('/api/shop/currencies');
	const currencies = currenciesResponse.ok
		? await currenciesResponse.json()
		: { base: 'EUR', rates: [] };

	return {
		currencyRates: currencies.rates,
		lang: params.lang as 'en' | 'ru' | 'es' | 'zh'
	};
};
