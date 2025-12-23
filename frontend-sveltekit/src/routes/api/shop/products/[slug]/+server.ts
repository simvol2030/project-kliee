import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPublicProductBySlug, type PublicProductDetail } from '$lib/data/shop.provider';

export interface ProductDetailResponse {
	product: PublicProductDetail;
}

export const GET: RequestHandler = async ({ params, url }) => {
	const { slug } = params;
	const locale = (url.searchParams.get('locale') || 'en') as 'en' | 'ru' | 'es' | 'zh';

	try {
		const product = await getPublicProductBySlug(slug, locale);

		if (!product) {
			throw error(404, 'Product not found');
		}

		const response: ProductDetailResponse = {
			product
		};

		return json(response);
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error fetching product:', err);
		throw error(500, 'Failed to fetch product');
	}
};
