/**
 * Works Overview Page Data Loader
 */

import { getAllSeries } from '$lib/data/series.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { locale } = await parent();
	const series = getAllSeries(locale as LanguageCode);

	return {
		series
	};
};
