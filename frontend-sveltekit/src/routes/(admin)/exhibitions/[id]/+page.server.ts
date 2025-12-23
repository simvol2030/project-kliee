import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { exhibitions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	if (id === 'new') {
		return {
			isNew: true,
			item: null
		};
	}

	const numericId = parseInt(id);
	if (isNaN(numericId)) {
		throw error(400, 'Invalid exhibition ID');
	}

	const [exhibition] = await db.select().from(exhibitions).where(eq(exhibitions.id, numericId));

	if (!exhibition) {
		throw redirect(302, '/exhibitions');
	}

	return {
		isNew: false,
		item: exhibition
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
		const descriptionEn = (formData.get('descriptionEn') as string) || null;
		const descriptionRu = (formData.get('descriptionRu') as string) || null;
		const descriptionEs = (formData.get('descriptionEs') as string) || null;
		const descriptionZh = (formData.get('descriptionZh') as string) || null;
		const venue = (formData.get('venue') as string) || null;
		const city = (formData.get('city') as string) || null;
		const country = (formData.get('country') as string) || null;
		const address = (formData.get('address') as string) || null;
		const startDate = (formData.get('startDate') as string) || null;
		const endDate = (formData.get('endDate') as string) || null;
		const openingHours = (formData.get('openingHours') as string) || null;
		const galleryLink = (formData.get('galleryLink') as string) || null;
		const isCurrent = formData.get('isCurrent') === 'on';
		const isVisible = formData.get('isVisible') !== 'off'; // default true

		if (!titleEn) {
			return fail(400, { error: 'Title (English) is required' });
		}

		// Build data object with snake_case keys matching schema
		const data = {
			title_en: titleEn,
			title_ru: titleRu || titleEn,
			title_es: titleEs || titleEn,
			title_zh: titleZh || titleEn,
			description_en: descriptionEn,
			description_ru: descriptionRu,
			description_es: descriptionEs,
			description_zh: descriptionZh,
			venue,
			city,
			country,
			address,
			start_date: startDate,
			end_date: endDate,
			opening_hours: openingHours,
			gallery_link: galleryLink,
			is_current: isCurrent,
			is_visible: isVisible
		};

		try {
			if (isNew) {
				// Insert without specifying id (auto-increment)
				const result = await db.insert(exhibitions).values(data).returning({ id: exhibitions.id });
				const newId = result[0]?.id;
				throw redirect(302, `/exhibitions/${newId}`);
			} else {
				const numericId = parseInt(params.id);
				if (isNaN(numericId)) {
					return fail(400, { error: 'Invalid exhibition ID' });
				}
				await db.update(exhibitions).set(data).where(eq(exhibitions.id, numericId));
				return { success: true, message: 'Exhibition saved successfully' };
			}
		} catch (e) {
			if (e instanceof Response) throw e;
			console.error('Error saving exhibition:', e);
			return fail(500, { error: 'Failed to save exhibition' });
		}
	}
};
