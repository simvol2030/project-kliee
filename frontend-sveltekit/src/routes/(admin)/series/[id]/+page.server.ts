import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { series } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	if (id === 'new') {
		return { item: null, isNew: true };
	}

	// id is TEXT in schema, no parseInt needed
	const [item] = await db.select().from(series).where(eq(series.id, id));

	if (!item) {
		throw error(404, 'Series not found');
	}

	return { item, isNew: false };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const formData = await request.formData();
		const isNew = params.id === 'new';

		// Extract form data
		const slug = formData.get('slug') as string;
		const nameEn = formData.get('nameEn') as string;
		const nameRu = formData.get('nameRu') as string;
		const nameEs = formData.get('nameEs') as string;
		const nameZh = formData.get('nameZh') as string;
		const descriptionEn = (formData.get('descriptionEn') as string) || null;
		const descriptionRu = (formData.get('descriptionRu') as string) || null;
		const descriptionEs = (formData.get('descriptionEs') as string) || null;
		const descriptionZh = (formData.get('descriptionZh') as string) || null;
		const orderIndex = parseInt(formData.get('order') as string) || 0;

		if (!nameEn?.trim()) {
			return fail(400, { error: 'Name (English) is required' });
		}

		if (!slug?.trim()) {
			return fail(400, { error: 'Slug is required' });
		}

		// Build data with snake_case keys matching schema
		const data = {
			slug,
			name_en: nameEn,
			name_ru: nameRu || nameEn,
			name_es: nameEs || nameEn,
			name_zh: nameZh || nameEn,
			description_en: descriptionEn,
			description_ru: descriptionRu,
			description_es: descriptionEs,
			description_zh: descriptionZh,
			order_index: orderIndex
		};

		try {
			if (isNew) {
				// Generate unique ID for new series (id is TEXT, required)
				const newId = `ser_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
				const result = await db.insert(series).values({ id: newId, ...data }).returning({ id: series.id });
				const createdId = result[0]?.id;
				throw redirect(303, `/series/${createdId}`);
			} else {
				// id is TEXT in schema, use params.id directly
				await db
					.update(series)
					.set({
						...data,
						updated_at: new Date().toISOString()
					})
					.where(eq(series.id, params.id));
				return { success: true, message: 'Series saved successfully' };
			}
		} catch (e) {
			if (e && typeof e === 'object' && 'status' in e) throw e;
			console.error('Error saving series:', e);
			return fail(500, { error: 'Failed to save series' });
		}
	}
};
