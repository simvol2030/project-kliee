import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { ProductDetailResponse } from '../../../api/shop/products/[slug]/+server';
import type { LanguageCode } from '$lib/utils/currency';

export interface ProductPageData {
	product: ProductDetailResponse['product'];
	currencyRates: Array<{
		currency: string;
		rate: number;
		updated_at: string | null;
	}>;
	lang: LanguageCode;
	related?: Array<{
		id: number;
		slug: string;
		title_en: string;
		title_ru: string | null;
		title_es: string | null;
		title_zh: string | null;
		price: number | null;
		is_for_sale: boolean;
		primary_image: {
			id: number;
			stored_filename: string;
			folder: string | null;
			alt_en: string | null;
		} | null;
	}>;
}

export const load: PageLoad = async ({ fetch, params }) => {
	const lang = params.lang as LanguageCode;
	const { slug } = params;

	// Fetch product and currency rates in parallel
	const [productRes, currenciesRes] = await Promise.all([
		fetch(`/api/shop/products/${slug}?locale=${lang}`),
		fetch('/api/shop/currencies')
	]);

	if (!productRes.ok) {
		throw error(productRes.status, 'Product not found');
	}

	const productData: ProductDetailResponse = await productRes.json();
	const currenciesData = await currenciesRes.json();

	return {
		product: productData.product,
		currencyRates: currenciesData.rates || [],
		lang
	} satisfies ProductPageData;
};
