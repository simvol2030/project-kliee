/**
 * About Page Data Loader
 */

import { getAboutData } from '$lib/data/about.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { locale } = await parent();
	const about = await getAboutData(locale as LanguageCode);

	return {
		about
	};
};
