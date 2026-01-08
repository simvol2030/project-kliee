/**
 * Works Overview Page Data Loader
 * Displays all series/collections
 */

import { getAllSeries } from '$lib/data/series.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { locale } = await parent();
	const series = await getAllSeries(locale as LanguageCode);

	return {
		series
	};
};
