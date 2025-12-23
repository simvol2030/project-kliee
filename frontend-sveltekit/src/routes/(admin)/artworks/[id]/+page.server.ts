import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { artworks, series } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	// Handle "new" as special case
	if (id === 'new') {
		const allSeries = await db.select().from(series).orderBy(series.order_index);
		return {
			artwork: null,
			series: allSeries,
			isNew: true
		};
	}

	// id is TEXT in schema, no parseInt needed
	const [artwork] = await db.select().from(artworks).where(eq(artworks.id, id));

	if (!artwork) {
		throw error(404, 'Artwork not found');
	}

	const allSeries = await db.select().from(series).orderBy(series.order_index);

	return {
		artwork,
		series: allSeries,
		isNew: false
	};
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const formData = await request.formData();
		const isNew = params.id === 'new';

		// Extract form data
		const titleEn = formData.get('titleEn') as string;
		const titleRu = formData.get('titleRu') as string;
		const titleEs = formData.get('titleEs') as string;
		const titleZh = formData.get('titleZh') as string;
		const seriesIdStr = formData.get('seriesId') as string;
		const technique = formData.get('technique') as string;
		const year = formData.get('year') ? parseInt(formData.get('year') as string) : null;
		const dimensions = (formData.get('dimensions') as string) || null;
		const price = formData.get('price') ? parseInt(formData.get('price') as string) : null;
		const currency = (formData.get('currency') as string) || 'EUR';
		const isForSale = formData.get('isForSale') === 'on';

		// Validation
		if (!titleEn?.trim()) {
			return fail(400, { error: 'Title (English) is required' });
		}

		// Build data object with snake_case keys matching schema
		// series_id is TEXT in schema, no parseInt needed
		const data = {
			title_en: titleEn,
			title_ru: titleRu || titleEn,
			title_es: titleEs || titleEn,
			title_zh: titleZh || titleEn,
			series_id: seriesIdStr || null,
			technique: technique || null,
			year,
			dimensions,
			price,
			currency,
			is_for_sale: isForSale
		};

		try {
			if (isNew) {
				// Generate unique ID for new artwork (id is TEXT, required)
				const newId = `art_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
				const result = await db.insert(artworks).values({ id: newId, ...data }).returning({ id: artworks.id });
				const createdId = result[0]?.id;
				throw redirect(303, `/artworks/${createdId}`);
			} else {
				// id is TEXT in schema, use params.id directly
				await db
					.update(artworks)
					.set({
						...data,
						updated_at: new Date().toISOString()
					})
					.where(eq(artworks.id, params.id));
				return { success: true, message: 'Artwork saved successfully' };
			}
		} catch (e) {
			if (e && typeof e === 'object' && 'status' in e) throw e; // re-throw redirects
			console.error('Error saving artwork:', e);
			return fail(500, { error: 'Failed to save artwork' });
		}
	}
};
