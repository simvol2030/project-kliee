import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, params, url }) => {
	const orderNumber = url.searchParams.get('number');

	if (!orderNumber) {
		throw error(400, 'Order number is required');
	}

	// Fetch order details
	const orderResponse = await fetch(`/api/shop/orders?number=${orderNumber}`);

	if (!orderResponse.ok) {
		throw error(404, 'Order not found');
	}

	const orderData = await orderResponse.json();

	// Fetch currency rates
	const currenciesResponse = await fetch('/api/shop/currencies');
	const currencies = currenciesResponse.ok
		? await currenciesResponse.json()
		: { base: 'EUR', rates: [] };

	return {
		order: orderData.order,
		items: orderData.items,
		currencyRates: currencies.rates,
		lang: params.lang as 'en' | 'ru' | 'es' | 'zh'
	};
};
