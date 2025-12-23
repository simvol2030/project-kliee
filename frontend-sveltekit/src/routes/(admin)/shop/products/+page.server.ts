import type { PageServerLoad, Actions } from './$types';
import { getAllShopProducts, deleteShopProduct, updateProductOrder } from '$lib/data/shop.provider';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const products = await getAllShopProducts();

	return {
		products
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id || typeof id !== 'string') {
			return fail(400, { error: 'Product ID is required' });
		}

		const success = await deleteShopProduct(parseInt(id));

		if (!success) {
			return fail(404, { error: 'Product not found' });
		}

		return { success: true };
	},

	reorder: async ({ request }) => {
		const formData = await request.formData();
		const orderData = formData.get('order');

		if (!orderData || typeof orderData !== 'string') {
			return fail(400, { error: 'Order data is required' });
		}

		try {
			const products = JSON.parse(orderData) as { id: number; order_index: number }[];
			await updateProductOrder(products);
			return { success: true };
		} catch (err) {
			console.error('Error updating product order:', err);
			return fail(500, { error: 'Failed to update order' });
		}
	}
};
