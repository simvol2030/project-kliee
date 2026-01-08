/**
 * Exhibitions Page Data Loader
 * Displays exhibitions, art fairs, and current exhibitions
 */

import {
	getCurrentExhibitions,
	getPastExhibitions,
	getArtFairs
} from '$lib/data/exhibitions.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageServerLoad } from './$types';

// SEO data by locale (can be moved to DB settings later)
const seoData: Record<string, { title: string; description: string }> = {
	en: {
		title: 'Exhibitions | K-LIÉE',
		description: 'Explore past and current exhibitions by Svetlana K-Liée'
	},
	ru: {
		title: 'Выставки | К-ЛИЭ',
		description: 'Посмотрите прошлые и текущие выставки Светланы К-Лиэ'
	},
	es: {
		title: 'Exposiciones | K-LIÉE',
		description: 'Explore las exposiciones pasadas y actuales de Svetlana K-Liée'
	},
	zh: {
		title: '展览 | K-LIÉE',
		description: '探索 Svetlana K-Liée 的过去和当前展览'
	}
};

export const load: PageServerLoad = async ({ parent }) => {
	const { locale } = await parent();
	const localeCode = locale as LanguageCode;

	// Fetch all async data
	const [currentExhibitions, pastExhibitions, artFairs] = await Promise.all([
		getCurrentExhibitions(localeCode),
		getPastExhibitions(localeCode),
		getArtFairs(localeCode)
	]);

	const seo = seoData[localeCode] || seoData.en;

	return {
		currentExhibitions,
		pastExhibitions,
		artFairs,
		seo
	};
};
