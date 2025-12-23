import type { PageLoad } from './$types';
import type { ProductsResponse } from '../../api/shop/products/+server';
import type { LanguageCode } from '$lib/utils/currency';

export interface SeriesItem {
	id: number;
	slug: string;
	name_en: string;
	name_ru: string;
	name_es: string;
	name_zh: string;
}

export interface ShopPageData {
	products: ProductsResponse;
	series: SeriesItem[];
	currencyRates: Array<{
		id: number;
		currency: string;
		rate: number;
		updated_at: string | null;
	}>;
	lang: LanguageCode;
	filters: {
		series_id: number | null;
		min_price: number | null;
		max_price: number | null;
		sort: string;
		page: number;
	};
}

export const load: PageLoad = async ({ fetch, params, url }) => {
	const lang = params.lang as LanguageCode;

	// Parse filters from URL
	const seriesId = url.searchParams.get('series');
	const minPrice = url.searchParams.get('min_price');
	const maxPrice = url.searchParams.get('max_price');
	const sort = url.searchParams.get('sort') || 'featured';
	const page = parseInt(url.searchParams.get('page') || '1');

	// Build products API URL
	const productsParams = new URLSearchParams();
	if (seriesId) productsParams.set('series_id', seriesId);
	if (minPrice) productsParams.set('min_price', minPrice);
	if (maxPrice) productsParams.set('max_price', maxPrice);
	productsParams.set('sort', sort);
	productsParams.set('page', page.toString());
	productsParams.set('limit', '12');

	// Fetch data in parallel
	const [productsRes, seriesRes, currenciesRes] = await Promise.all([
		fetch(`/api/shop/products?${productsParams}`),
		fetch('/api/content/series'),
		fetch('/api/shop/currencies')
	]);

	const products: ProductsResponse = await productsRes.json();
	const seriesData = await seriesRes.json();
	const currenciesData = await currenciesRes.json();

	// Extract series list (only visible ones)
	const seriesArray = Array.isArray(seriesData.series) ? seriesData.series
		: Array.isArray(seriesData) ? seriesData
		: [];
	const series: SeriesItem[] = seriesArray
		.filter((s: { is_visible?: boolean }) => s.is_visible !== false)
		.map((s: {
			id: number;
			slug: string;
			name_en: string;
			name_ru: string;
			name_es: string;
			name_zh: string;
		}) => ({
			id: s.id,
			slug: s.slug,
			name_en: s.name_en,
			name_ru: s.name_ru,
			name_es: s.name_es,
			name_zh: s.name_zh
		}));

	return {
		products,
		series,
		currencyRates: currenciesData.rates || [],
		lang,
		filters: {
			series_id: seriesId ? parseInt(seriesId) : null,
			min_price: minPrice ? parseInt(minPrice) : null,
			max_price: maxPrice ? parseInt(maxPrice) : null,
			sort,
			page
		}
	} satisfies ShopPageData;
};
