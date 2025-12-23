import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPublicShopProducts, getPublicProductsByIds, type PublicShopProduct } from '$lib/data/shop.provider';

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
		const locale = (url.searchParams.get('locale') || 'en') as 'en' | 'ru' | 'es' | 'zh';

		// Check if fetching by IDs (for wishlist)
		const idsParam = url.searchParams.get('ids');
		if (idsParam) {
			const ids = idsParam
				.split(',')
				.map((id) => parseInt(id.trim()))
				.filter((id) => !isNaN(id));

			if (ids.length === 0) {
				return json({ products: [], pagination: { total: 0, page: 1, limit: 0, hasMore: false } });
			}

			const products = await getPublicProductsByIds(ids, locale);

			return json({
				products,
				pagination: {
					total: products.length,
					page: 1,
					limit: products.length,
					hasMore: false
				}
			});
		}

		// Parse query parameters for paginated list
		const sort = (url.searchParams.get('sort') || 'featured') as SortOption;
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '12')));

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
