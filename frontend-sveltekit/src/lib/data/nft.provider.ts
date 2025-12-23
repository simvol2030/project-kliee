/**
 * NFT Data Provider
 *
 * Abstraction layer for NFT page data access.
 * Currently reads from JSON, designed for easy migration to SQLite.
 *
 * @version 1.0
 * @date 2025-12-20
 */

import type {
	NftData,
	NftDataLocalized,
	FeaturedNft,
	FeaturedNftLocalized,
	LanguageCode,
	TranslatedString
} from '$lib/types/content.types';
import nftDataRaw from '../../../../data/nft.json';

// Type assertion for imported JSON
const nftData = nftDataRaw as NftData;

/**
 * Localize a single NFT item
 */
function localizeNft(nft: FeaturedNft, locale: LanguageCode): FeaturedNftLocalized {
	return {
		id: nft.id,
		title: nft.title[locale as keyof TranslatedString],
		technique: nft.technique,
		year: nft.year,
		price: nft.price,
		currency: nft.currency,
		image: nft.image,
		openSeaUrl: nft.openSeaUrl
	};
}

/**
 * Get all NFT page data with localized strings
 * @param locale - Language code (en, ru, es, zh)
 * @returns Localized NFT page data
 */
export function getNftData(locale: LanguageCode = 'en'): NftDataLocalized {
	return {
		page: {
			hero: {
				title: nftData.page.hero.title[locale as keyof TranslatedString],
				subtitle: nftData.page.hero.subtitle[locale as keyof TranslatedString]
			},
			description: nftData.page.description[locale as keyof TranslatedString]
		},
		openSeaCollection: nftData.openSeaCollection,
		featuredNfts: nftData.featuredNfts.map((n) => localizeNft(n, locale)),
		cta: {
			viewCollection: nftData.cta.viewCollection[locale as keyof TranslatedString]
		},
		seo: {
			title: nftData.seo.title[locale as keyof TranslatedString],
			description: nftData.seo.description[locale as keyof TranslatedString]
		}
	};
}

/**
 * Get featured NFTs with localized strings
 * @param locale - Language code
 * @returns Array of featured NFTs
 */
export function getFeaturedNfts(locale: LanguageCode = 'en'): FeaturedNftLocalized[] {
	return nftData.featuredNfts.map((n) => localizeNft(n, locale));
}

/**
 * Get a single NFT by ID
 * @param id - NFT ID
 * @param locale - Language code
 * @returns NFT or undefined if not found
 */
export function getNftById(id: string, locale: LanguageCode = 'en'): FeaturedNftLocalized | undefined {
	const nft = nftData.featuredNfts.find((n) => n.id === id);
	return nft ? localizeNft(nft, locale) : undefined;
}

/**
 * Get OpenSea collection info
 * @returns OpenSea collection details
 */
export function getOpenSeaCollection() {
	return nftData.openSeaCollection;
}

/**
 * Get page content with localized strings
 * @param locale - Language code
 * @returns Page hero and description
 */
export function getPageContent(locale: LanguageCode = 'en') {
	return {
		hero: {
			title: nftData.page.hero.title[locale as keyof TranslatedString],
			subtitle: nftData.page.hero.subtitle[locale as keyof TranslatedString]
		},
		description: nftData.page.description[locale as keyof TranslatedString]
	};
}

/**
 * Get CTA text
 * @param locale - Language code
 * @returns CTA button text
 */
export function getCtaText(locale: LanguageCode = 'en') {
	return {
		viewCollection: nftData.cta.viewCollection[locale as keyof TranslatedString]
	};
}

/**
 * Get SEO data with localized strings
 * @param locale - Language code
 * @returns SEO title and description
 */
export function getSeoData(locale: LanguageCode = 'en') {
	return {
		title: nftData.seo.title[locale as keyof TranslatedString],
		description: nftData.seo.description[locale as keyof TranslatedString]
	};
}

/**
 * Get NFT metadata
 * @returns NFT page metadata
 */
export function getNftMetadata() {
	return {
		version: nftData.version,
		lastUpdated: nftData.lastUpdated
	};
}

/**
 * Get total number of featured NFTs
 * @returns Number of featured NFTs
 */
export function getFeaturedNftsCount(): number {
	return nftData.featuredNfts.length;
}
