import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { media } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import {
	getArtistAdmin,
	getAllEducationAdmin,
	getAllAwardsAdmin,
	getAllResidenciesAdmin,
	upsertArtist,
	createEducation,
	updateEducation,
	deleteEducation,
	createAward,
	updateAward,
	deleteAward,
	createResidency,
	updateResidency,
	deleteResidency
} from '$lib/data/about.provider';

export const load: PageServerLoad = async () => {
	const artist = await getArtistAdmin();
	const education = await getAllEducationAdmin();
	const awards = await getAllAwardsAdmin();
	const residencies = await getAllResidenciesAdmin();
	const allMedia = await db.select().from(media).orderBy(media.uploaded_at);

	return {
		artist,
		education,
		awards,
		residencies,
		allMedia
	};
};

export const actions: Actions = {
	// Artist actions
	saveArtist: async ({ request }) => {
		const formData = await request.formData();

		const data = {
			name: formData.get('name') as string,
			image_id: formData.get('imageId') ? parseInt(formData.get('imageId') as string) : null,
			nationality: (formData.get('nationality') as string) || null,
			based_in: (formData.get('basedIn') as string) || null,
			biography_en: (formData.get('biographyEn') as string) || null,
			biography_ru: (formData.get('biographyRu') as string) || null,
			biography_es: (formData.get('biographyEs') as string) || null,
			biography_zh: (formData.get('biographyZh') as string) || null,
			seo_title_en: (formData.get('seoTitleEn') as string) || null,
			seo_title_ru: (formData.get('seoTitleRu') as string) || null,
			seo_title_es: (formData.get('seoTitleEs') as string) || null,
			seo_title_zh: (formData.get('seoTitleZh') as string) || null,
			seo_description_en: (formData.get('seoDescriptionEn') as string) || null,
			seo_description_ru: (formData.get('seoDescriptionRu') as string) || null,
			seo_description_es: (formData.get('seoDescriptionEs') as string) || null,
			seo_description_zh: (formData.get('seoDescriptionZh') as string) || null
		};

		if (!data.name) {
			return fail(400, { error: 'Name is required' });
		}

		try {
			await upsertArtist(data);
			return { success: true, message: 'Artist info saved' };
		} catch (e) {
			console.error('Error saving artist:', e);
			return fail(500, { error: 'Failed to save artist info' });
		}
	},

	// Education actions
	addEducation: async ({ request }) => {
		const formData = await request.formData();

		const data = {
			year: (formData.get('year') as string) || null,
			degree_en: (formData.get('degreeEn') as string) || null,
			degree_ru: (formData.get('degreeRu') as string) || null,
			degree_es: (formData.get('degreeEs') as string) || null,
			degree_zh: (formData.get('degreeZh') as string) || null,
			institution_en: (formData.get('institutionEn') as string) || null,
			institution_ru: (formData.get('institutionRu') as string) || null,
			institution_es: (formData.get('institutionEs') as string) || null,
			institution_zh: (formData.get('institutionZh') as string) || null,
			order_index: formData.get('orderIndex') ? parseInt(formData.get('orderIndex') as string) : 0
		};

		try {
			await createEducation(data);
			return { success: true };
		} catch (e) {
			console.error('Error adding education:', e);
			return fail(500, { error: 'Failed to add education' });
		}
	},

	updateEducation: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		const data = {
			year: (formData.get('year') as string) || null,
			degree_en: (formData.get('degreeEn') as string) || null,
			degree_ru: (formData.get('degreeRu') as string) || null,
			degree_es: (formData.get('degreeEs') as string) || null,
			degree_zh: (formData.get('degreeZh') as string) || null,
			institution_en: (formData.get('institutionEn') as string) || null,
			institution_ru: (formData.get('institutionRu') as string) || null,
			institution_es: (formData.get('institutionEs') as string) || null,
			institution_zh: (formData.get('institutionZh') as string) || null,
			order_index: formData.get('orderIndex') ? parseInt(formData.get('orderIndex') as string) : 0
		};

		try {
			await updateEducation(id, data);
			return { success: true };
		} catch (e) {
			console.error('Error updating education:', e);
			return fail(500, { error: 'Failed to update education' });
		}
	},

	deleteEducation: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		try {
			await deleteEducation(id);
			return { success: true };
		} catch (e) {
			console.error('Error deleting education:', e);
			return fail(500, { error: 'Failed to delete education' });
		}
	},

	// Award actions
	addAward: async ({ request }) => {
		const formData = await request.formData();

		const data = {
			year: (formData.get('year') as string) || null,
			title_en: (formData.get('titleEn') as string) || null,
			title_ru: (formData.get('titleRu') as string) || null,
			title_es: (formData.get('titleEs') as string) || null,
			title_zh: (formData.get('titleZh') as string) || null,
			organization_en: (formData.get('organizationEn') as string) || null,
			organization_ru: (formData.get('organizationRu') as string) || null,
			organization_es: (formData.get('organizationEs') as string) || null,
			organization_zh: (formData.get('organizationZh') as string) || null,
			order_index: formData.get('orderIndex') ? parseInt(formData.get('orderIndex') as string) : 0
		};

		try {
			await createAward(data);
			return { success: true };
		} catch (e) {
			console.error('Error adding award:', e);
			return fail(500, { error: 'Failed to add award' });
		}
	},

	updateAward: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		const data = {
			year: (formData.get('year') as string) || null,
			title_en: (formData.get('titleEn') as string) || null,
			title_ru: (formData.get('titleRu') as string) || null,
			title_es: (formData.get('titleEs') as string) || null,
			title_zh: (formData.get('titleZh') as string) || null,
			organization_en: (formData.get('organizationEn') as string) || null,
			organization_ru: (formData.get('organizationRu') as string) || null,
			organization_es: (formData.get('organizationEs') as string) || null,
			organization_zh: (formData.get('organizationZh') as string) || null,
			order_index: formData.get('orderIndex') ? parseInt(formData.get('orderIndex') as string) : 0
		};

		try {
			await updateAward(id, data);
			return { success: true };
		} catch (e) {
			console.error('Error updating award:', e);
			return fail(500, { error: 'Failed to update award' });
		}
	},

	deleteAward: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		try {
			await deleteAward(id);
			return { success: true };
		} catch (e) {
			console.error('Error deleting award:', e);
			return fail(500, { error: 'Failed to delete award' });
		}
	},

	// Residency actions
	addResidency: async ({ request }) => {
		const formData = await request.formData();

		const data = {
			year: (formData.get('year') as string) || null,
			location_en: (formData.get('locationEn') as string) || null,
			location_ru: (formData.get('locationRu') as string) || null,
			location_es: (formData.get('locationEs') as string) || null,
			location_zh: (formData.get('locationZh') as string) || null,
			order_index: formData.get('orderIndex') ? parseInt(formData.get('orderIndex') as string) : 0
		};

		try {
			await createResidency(data);
			return { success: true };
		} catch (e) {
			console.error('Error adding residency:', e);
			return fail(500, { error: 'Failed to add residency' });
		}
	},

	updateResidency: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		const data = {
			year: (formData.get('year') as string) || null,
			location_en: (formData.get('locationEn') as string) || null,
			location_ru: (formData.get('locationRu') as string) || null,
			location_es: (formData.get('locationEs') as string) || null,
			location_zh: (formData.get('locationZh') as string) || null,
			order_index: formData.get('orderIndex') ? parseInt(formData.get('orderIndex') as string) : 0
		};

		try {
			await updateResidency(id, data);
			return { success: true };
		} catch (e) {
			console.error('Error updating residency:', e);
			return fail(500, { error: 'Failed to update residency' });
		}
	},

	deleteResidency: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		try {
			await deleteResidency(id);
			return { success: true };
		} catch (e) {
			console.error('Error deleting residency:', e);
			return fail(500, { error: 'Failed to delete residency' });
		}
	}
};
