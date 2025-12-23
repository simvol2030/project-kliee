/**
 * Catalog Page Data Loader
 *
 * Supports filtering, search, and pagination via URL params
 */

import {
	getAllArtworks,
	getArtworksBySeries,
	getArtworkYears,
	getArtworkTechniques,
	searchArtworks,
	getAvailableArtworks
} from '$lib/data/artworks.provider';
import { getAllSeries } from '$lib/data/series.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { locale } = await parent();
	const localeCode = locale as LanguageCode;

	// Parse URL search params
	const searchQuery = url.searchParams.get('q') || '';
	const seriesFilter = url.searchParams.get('series') || '';
	const yearFilter = url.searchParams.get('year') || '';
	const availableOnly = url.searchParams.get('available') === 'true';
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const pageSize = 12;

	// Get filter options
	const allSeries = getAllSeries(localeCode);
	const years = await getArtworkYears();
	const techniques = await getArtworkTechniques(localeCode);

	// Get artworks based on filters
	let artworks = searchQuery
		? await searchArtworks(searchQuery, localeCode)
		: seriesFilter
			? await getArtworksBySeries(seriesFilter, localeCode)
			: availableOnly
				? await getAvailableArtworks(localeCode)
				: await getAllArtworks(localeCode);

	// Apply year filter
	if (yearFilter) {
		const yearNum = parseInt(yearFilter, 10);
		artworks = artworks.filter((a) => a.year === yearNum);
	}

	// Apply available filter if not already applied
	if (availableOnly && !searchQuery && seriesFilter) {
		artworks = artworks.filter((a) => a.available);
	}

	// Pagination
	const total = artworks.length;
	const totalPages = Math.ceil(total / pageSize);
	const currentPage = Math.max(1, Math.min(page, totalPages || 1));
	const start = (currentPage - 1) * pageSize;
	const paginatedArtworks = artworks.slice(start, start + pageSize);

	return {
		artworks: paginatedArtworks,
		pagination: {
			total,
			totalPages,
			currentPage,
			hasNext: currentPage < totalPages,
			hasPrev: currentPage > 1
		},
		filters: {
			search: searchQuery,
			series: seriesFilter,
			year: yearFilter,
			available: availableOnly
		},
		options: {
			series: allSeries,
			years,
			techniques
		}
	};
};
