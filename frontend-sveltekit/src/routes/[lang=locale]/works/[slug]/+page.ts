/**
 * Individual Series Page Data Loader
 */

import { error } from '@sveltejs/kit';
import { getSeriesBySlug, getAllSeries } from '$lib/data/series.provider';
import { getArtworksBySeries } from '$lib/data/artworks.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { locale } = await parent();
	const localeCode = locale as LanguageCode;
	const { slug } = params;

	const series = getSeriesBySlug(slug, localeCode);

	if (!series) {
		throw error(404, {
			message: 'Series not found'
		});
	}

	const artworks = await getArtworksBySeries(slug, localeCode);
	const allSeries = getAllSeries(localeCode);

	// Find adjacent series for navigation
	const currentIndex = allSeries.findIndex((s) => s.slug === slug);
	const prevSeries = currentIndex > 0 ? allSeries[currentIndex - 1] : null;
	const nextSeries = currentIndex < allSeries.length - 1 ? allSeries[currentIndex + 1] : null;

	return {
		series,
		artworks,
		prevSeries,
		nextSeries
	};
};
