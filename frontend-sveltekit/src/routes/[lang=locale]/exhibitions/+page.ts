/**
 * Exhibitions Page Data Loader
 */

import {
	getAllExhibitions,
	getAllArtFairs,
	getCurrentExhibitions,
	getSeoData
} from '$lib/data/exhibitions.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { locale } = await parent();
	const localeCode = locale as LanguageCode;

	const exhibitions = getAllExhibitions(localeCode);
	const artFairs = getAllArtFairs(localeCode);
	const currentExhibitions = getCurrentExhibitions(localeCode);
	const seo = getSeoData(localeCode);

	return {
		exhibitions,
		artFairs,
		currentExhibitions,
		seo
	};
};
