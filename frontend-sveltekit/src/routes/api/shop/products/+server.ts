import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPublicShopProducts, type PublicShopProduct } from '$lib/data/shop.provider';

export interface ProductsResponse {
	products: PublicShopProduct[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		hasMore: boolean;
	};
}

type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'featured';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse query parameters
		const sort = (url.searchParams.get('sort') || 'featured') as SortOption;
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '12')));
		const locale = (url.searchParams.get('locale') || 'en') as 'en' | 'ru' | 'es' | 'zh';

		// Get products from shop_products table
		const result = await getPublicShopProducts(locale, {
			page,
			limit,
			sort
		});

		const response: ProductsResponse = {
			products: result.products,
			pagination: {
				total: result.total,
				page,
				limit,
				hasMore: result.hasMore
			}
		};

		return json(response);
	} catch (error) {
		console.error('Error fetching shop products:', error);
		return json(
			{ error: 'Failed to fetch products' },
			{ status: 500 }
		);
	}
};
