/**
 * NFT Page Data Loader
 * Fetches NFTs from database and page content from JSON
 */

import { getAllNfts, getPageContent, getOpenSeaCollection, getCtaText, getSeoData } from '$lib/data/nft.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { locale } = await parent();
	const localeCode = locale as LanguageCode;

	// Get NFTs from database
	const nfts = await getAllNfts(localeCode);

	// Get page content from JSON
	const pageContent = getPageContent(localeCode);
	const collection = getOpenSeaCollection();
	const cta = getCtaText(localeCode);
	const seo = getSeoData(localeCode);

	return {
		nfts,
		page: pageContent,
		openSeaCollection: collection,
		cta,
		seo
	};
};
