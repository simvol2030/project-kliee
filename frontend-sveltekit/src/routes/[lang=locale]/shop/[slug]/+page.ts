import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { ProductDetailResponse } from '../../../api/shop/products/[slug]/+server';
import type { LanguageCode } from '$lib/utils/currency';

export interface ProductPageData {
	product: ProductDetailResponse['product'];
	related: ProductDetailResponse['related'];
	currencyRates: Array<{
		currency: string;
		rate: number;
		updated_at: string | null;
	}>;
	lang: LanguageCode;
}

export const load: PageLoad = async ({ fetch, params }) => {
	const lang = params.lang as LanguageCode;
	const { slug } = params;

	// Fetch product and currency rates in parallel
	const [productRes, currenciesRes] = await Promise.all([
		fetch(`/api/shop/products/${slug}`),
		fetch('/api/shop/currencies')
	]);

	if (!productRes.ok) {
		throw error(productRes.status, 'Product not found');
	}

	const productData: ProductDetailResponse = await productRes.json();
	const currenciesData = await currenciesRes.json();

	return {
		product: productData.product,
		related: productData.related,
		currencyRates: currenciesData.rates || [],
		lang
	} satisfies ProductPageData;
};
