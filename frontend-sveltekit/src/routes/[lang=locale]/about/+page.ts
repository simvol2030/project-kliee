/**
 * About Page Data Loader
 */

import { getAboutData } from '$lib/data/about.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { locale } = await parent();
	const about = getAboutData(locale as LanguageCode);

	return {
		about
	};
};
