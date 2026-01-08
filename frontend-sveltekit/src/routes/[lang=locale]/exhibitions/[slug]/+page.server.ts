/**
 * Exhibition Detail Page Data Loader
 */

import { error } from '@sveltejs/kit';
import { getExhibitionBySlug, getExhibitionImages } from '$lib/data/exhibitions.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { locale } = await parent();
	const localeCode = locale as LanguageCode;
	const { slug } = params;

	const exhibition = await getExhibitionBySlug(slug, localeCode);

	if (!exhibition) {
		throw error(404, {
			message: 'Exhibition not found'
		});
	}

	// Get gallery images for this exhibition
	const images = await getExhibitionImages(exhibition.id, localeCode);

	return {
		exhibition,
		images
	};
};
