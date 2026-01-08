import type { PageServerLoad, Actions } from './$types';
import {
	getShopProductById,
	getProductImagesWithMedia,
	createShopProduct,
	updateShopProduct,
	addProductImage,
	removeProductImage,
	setPrimaryImage,
	reorderProductImages,
	getAvailableArtworksForLinking
} from '$lib/data/shop.provider';
import { db } from '$lib/server/db/client';
import { media } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const isNew = params.id === 'new';

	// Get available artworks for linking
	const availableArtworks = await getAvailableArtworksForLinking();

	// Get all media for image picker
	const allMedia = await db.select().from(media).orderBy(media.uploaded_at);

	if (isNew) {
		return {
			isNew: true,
			product: null,
			images: [],
			availableArtworks,
			allMedia
		};
	}

	const productId = parseInt(params.id);
	if (isNaN(productId)) {
		throw redirect(302, '/shop/products');
	}

	const product = await getShopProductById(productId);
	if (!product) {
		throw redirect(302, '/shop/products');
	}

	const images = await getProductImagesWithMedia(productId);

	return {
		isNew: false,
		product,
		images,
		availableArtworks,
		allMedia
	};
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const formData = await request.formData();
		const isNew = params.id === 'new';

		// Extract form data
		const productData = {
			sku: (formData.get('sku') as string) || null,
			artwork_id: (formData.get('artwork_id') as string) || null,
			title_en: formData.get('title_en') as string,
			title_ru: formData.get('title_ru') as string,
			title_es: formData.get('title_es') as string,
			title_zh: formData.get('title_zh') as string,
			description_en: (formData.get('description_en') as string) || null,
			description_ru: (formData.get('description_ru') as string) || null,
			description_es: (formData.get('description_es') as string) || null,
			description_zh: (formData.get('description_zh') as string) || null,
			price_eur: parseInt(formData.get('price_eur') as string) || 0,
			compare_price_eur: formData.get('compare_price_eur')
				? parseInt(formData.get('compare_price_eur') as string)
				: null,
			stock_quantity: parseInt(formData.get('stock_quantity') as string) || 1,
			is_unlimited: formData.get('is_unlimited') === 'true',
			shipping_class: (formData.get('shipping_class') as 'standard' | 'fragile' | 'oversized') || 'standard',
			weight_kg: (formData.get('weight_kg') as string) || null,
			dimensions_cm: (formData.get('dimensions_cm') as string) || null,
			is_visible: formData.get('is_visible') === 'true',
			is_featured: formData.get('is_featured') === 'true',
			order_index: parseInt(formData.get('order_index') as string) || 0
		};

		// Validate required fields
		if (!productData.title_en || !productData.title_ru || !productData.title_es || !productData.title_zh) {
			return fail(400, { error: 'All title fields are required' });
		}

		if (productData.price_eur <= 0) {
			return fail(400, { error: 'Price must be greater than 0' });
		}

		try {
			if (isNew) {
				const newProduct = await createShopProduct(productData);
				throw redirect(302, `/shop/products/${newProduct.id}`);
			} else {
				const productId = parseInt(params.id);
				await updateShopProduct(productId, productData);
				return { success: true, message: 'Product saved successfully' };
			}
		} catch (err) {
			if (err instanceof Response) {
				throw err; // Re-throw redirects
			}
			console.error('Error saving product:', err);
			return fail(500, { error: 'Failed to save product' });
		}
	},

	addImage: async ({ request, params }) => {
		if (params.id === 'new') {
			return fail(400, { error: 'Save the product first before adding images' });
		}

		const formData = await request.formData();
		const mediaId = formData.get('media_id');
		const isPrimary = formData.get('is_primary') === 'true';

		if (!mediaId) {
			return fail(400, { error: 'Media ID is required' });
		}

		const productId = parseInt(params.id);
		await addProductImage(productId, parseInt(mediaId as string), isPrimary);

		return { success: true };
	},

	removeImage: async ({ request }) => {
		const formData = await request.formData();
		const imageId = formData.get('image_id');

		if (!imageId) {
			return fail(400, { error: 'Image ID is required' });
		}

		await removeProductImage(parseInt(imageId as string));
		return { success: true };
	},

	setPrimary: async ({ request, params }) => {
		const formData = await request.formData();
		const imageId = formData.get('image_id');

		if (!imageId) {
			return fail(400, { error: 'Image ID is required' });
		}

		const productId = parseInt(params.id);
		await setPrimaryImage(productId, parseInt(imageId as string));

		return { success: true };
	},

	reorderImages: async ({ request, params }) => {
		if (params.id === 'new') {
			return fail(400, { error: 'Cannot reorder images for new product' });
		}

		const formData = await request.formData();
		const orderJson = formData.get('order') as string;

		if (!orderJson) {
			return fail(400, { error: 'Order data is required' });
		}

		try {
			const imageOrders = JSON.parse(orderJson) as { id: number; order_index: number }[];
			const productId = parseInt(params.id);
			await reorderProductImages(productId, imageOrders);
			return { success: true };
		} catch (err) {
			console.error('Error reordering images:', err);
			return fail(500, { error: 'Failed to reorder images' });
		}
	}
};
