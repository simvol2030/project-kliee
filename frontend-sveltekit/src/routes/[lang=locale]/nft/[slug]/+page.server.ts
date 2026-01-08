/**
 * NFT Detail Page Data Loader
 */

import { getNftBySlug, getOpenSeaCollection } from '$lib/data/nft.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { locale } = await parent();
	const localeCode = locale as LanguageCode;
	const { slug } = params;

	const nft = await getNftBySlug(slug, localeCode);

	if (!nft) {
		throw error(404, {
			message: 'NFT not found'
		});
	}

	const collection = getOpenSeaCollection();

	return {
		nft,
		openSeaCollection: collection
	};
};
