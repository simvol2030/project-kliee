import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { menuItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const items = await db.select().from(menuItems).orderBy(menuItems.order_index);
	return { menuItems: items };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();

		const labelEn = formData.get('labelEn') as string;
		const labelRu = formData.get('labelRu') as string;
		const labelEs = formData.get('labelEs') as string;
		const labelZh = formData.get('labelZh') as string;
		const href = formData.get('href') as string;
		const orderIndex = parseInt(formData.get('order') as string) || 0;

		if (!labelEn?.trim() || !href?.trim()) {
			return fail(400, { error: 'Label and URL are required' });
		}

		// Build data with snake_case keys matching schema
		const data = {
			label_en: labelEn,
			label_ru: labelRu || labelEn,
			label_es: labelEs || labelEn,
			label_zh: labelZh || labelEn,
			href,
			order_index: orderIndex
		};

		try {
			await db.insert(menuItems).values(data);
			return { success: true, message: 'Menu item created' };
		} catch (e) {
			console.error('Error creating menu item:', e);
			return fail(500, { error: 'Failed to create menu item' });
		}
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		const labelEn = formData.get('labelEn') as string;
		const labelRu = formData.get('labelRu') as string;
		const labelEs = formData.get('labelEs') as string;
		const labelZh = formData.get('labelZh') as string;
		const href = formData.get('href') as string;
		const orderIndex = parseInt(formData.get('order') as string) || 0;

		if (!labelEn?.trim() || !href?.trim()) {
			return fail(400, { error: 'Label and URL are required' });
		}

		// Build data with snake_case keys matching schema
		const data = {
			label_en: labelEn,
			label_ru: labelRu || labelEn,
			label_es: labelEs || labelEn,
			label_zh: labelZh || labelEn,
			href,
			order_index: orderIndex
		};

		try {
			await db.update(menuItems).set(data).where(eq(menuItems.id, id));
			return { success: true, message: 'Menu item updated' };
		} catch (e) {
			console.error('Error updating menu item:', e);
			return fail(500, { error: 'Failed to update menu item' });
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		try {
			await db.delete(menuItems).where(eq(menuItems.id, id));
			return { success: true, message: 'Menu item deleted' };
		} catch (e) {
			console.error('Error deleting menu item:', e);
			return fail(500, { error: 'Failed to delete menu item' });
		}
	}
};
