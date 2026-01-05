/**
 * Content Type Definitions
 *
 * TypeScript interfaces for artworks, series, exhibitions, about, contact, and NFT pages
 * Matches JSON data structure from data/ directory
 *
 * @version 1.1
 * @date 2025-12-20
 */

import type { TranslatedString, LanguageCode } from './layout.types';

// Re-export common types for convenience
export type { TranslatedString, LanguageCode };

// ============================================
// Series Types
// ============================================

/**
 * Artwork series
 */
export interface Series {
	id: string;
	slug: string;
	title: TranslatedString;
	description: TranslatedString;
	coverImage: string;
	artworkCount: number;
	order: number;
}

/**
 * Series with localized strings (computed)
 */
export interface SeriesLocalized {
	id: string;
	slug: string;
	title: string;
	description: string;
	coverImage: string;
	artworkCount: number;
	order: number;
}

/**
 * Complete series data structure
 */
export interface SeriesData {
	version: string;
	lastUpdated: string;
	series: Series[];
}

// ============================================
// Artwork Types
// ============================================

/**
 * Single artwork item
 */
export interface Artwork {
	id: string;
	title: TranslatedString;
	series: string; // Series slug reference
	technique: TranslatedString;
	year: number | null;
	dimensions: string | null;
	price: number | null;
	currency: string | null;
	images: string[];
	available: boolean;
}

/**
 * Artwork with localized strings (computed)
 */
export interface ArtworkLocalized {
	id: string;
	slug: string; // Artwork slug for URLs
	title: string;
	series: string;
	technique: string;
	year: number | null;
	dimensions: string | null;
	price: number | null;
	currency: string | null;
	images: string[];
	available: boolean;
	shop_slug: string | null; // Slug for linked shopProduct (if exists)
}

/**
 * Complete artworks data structure
 */
export interface ArtworksData {
	version: string;
	lastUpdated: string;
	artworks: Artwork[];
}

// ============================================
// Exhibition Types (matches actual JSON)
// ============================================

/**
 * Single exhibition
 */
export interface Exhibition {
	id: string;
	year: number;
	title: TranslatedString;
	venue: TranslatedString;
	location: TranslatedString;
	type: string;
	current: boolean;
	image: string;
}

/**
 * Exhibition with localized strings (computed)
 */
export interface ExhibitionLocalized {
	id: string;
	year: number;
	title: string;
	venue: string;
	location: string;
	type: string;
	current: boolean;
	image: string;
}

/**
 * Art fair (matches actual JSON)
 */
export interface ArtFair {
	id: string;
	year: number;
	title: TranslatedString;
	gallery: TranslatedString | null;
	location: TranslatedString;
}

/**
 * Art fair with localized strings (computed)
 */
export interface ArtFairLocalized {
	id: string;
	year: number;
	title: string;
	gallery: string | null;
	location: string;
}

/**
 * Complete exhibitions data structure
 */
export interface ExhibitionsData {
	version: string;
	lastUpdated: string;
	exhibitions: Exhibition[];
	artFairs: ArtFair[];
	seo: {
		title: TranslatedString;
		description: TranslatedString;
	};
}

// ============================================
// About Types (matches actual JSON)
// ============================================

/**
 * Artist info
 */
export interface ArtistInfo {
	name: string;
	image: string;
	birthYear: number | null;
	nationality: string;
	basedIn: string;
}

/**
 * Education item (matches actual JSON - year is string for ranges like "2001-2005")
 */
export interface Education {
	year: string;
	degree: TranslatedString;
	institution: TranslatedString;
}

/**
 * Award item (matches actual JSON - year is string)
 */
export interface Award {
	year: string;
	title: TranslatedString;
	organization: TranslatedString;
}

/**
 * Residency item (matches actual JSON)
 */
export interface Residency {
	year: string;
	location: TranslatedString;
}

/**
 * Complete about data structure (matches actual JSON)
 */
export interface AboutData {
	version: string;
	lastUpdated: string;
	artist: ArtistInfo;
	biography: TranslatedString;
	education: Education[];
	awards: Award[];
	residencies: Residency[];
	seo: {
		title: TranslatedString;
		description: TranslatedString;
	};
}

/**
 * About data with localized strings (computed)
 */
export interface AboutDataLocalized {
	artist: ArtistInfo;
	biography: string;
	education: Array<{
		year: string;
		degree: string;
		institution: string;
	}>;
	awards: Array<{
		year: string;
		title: string;
		organization: string;
	}>;
	residencies: Array<{
		year: string;
		location: string;
	}>;
	seo: {
		title: string;
		description: string;
	};
}

// ============================================
// Contact Types (matches actual JSON)
// ============================================

/**
 * Social link
 */
export interface SocialLinkItem {
	platform: string;
	url: string;
	label: string;
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
	label: TranslatedString;
	placeholder: TranslatedString;
}

/**
 * Translated array of strings (for select options)
 */
export interface TranslatedArrayString {
	en: string[];
	ru: string[];
	es: string[];
	zh: string[];
}

/**
 * Complete contact data structure (matches actual JSON)
 */
export interface ContactData {
	version: string;
	lastUpdated: string;
	contact: {
		email: string;
		socialLinks: SocialLinkItem[];
		studio: {
			city: TranslatedString;
			country: TranslatedString;
		};
	};
	page: {
		hero: {
			title: TranslatedString;
			subtitle: TranslatedString;
		};
		form: {
			title: TranslatedString;
			fields: {
				name: FormFieldConfig;
				email: FormFieldConfig;
				subject: {
					label: TranslatedString;
					options: TranslatedArrayString;
				};
				message: FormFieldConfig;
			};
			submit: TranslatedString;
			success: TranslatedString;
			error: TranslatedString;
		};
	};
	seo: {
		title: TranslatedString;
		description: TranslatedString;
	};
}

/**
 * Contact data with localized strings (computed)
 */
export interface ContactDataLocalized {
	contact: {
		email: string;
		socialLinks: SocialLinkItem[];
		studio: {
			city: string;
			country: string;
		};
	};
	page: {
		hero: {
			title: string;
			subtitle: string;
		};
		form: {
			title: string;
			fields: {
				name: { label: string; placeholder: string };
				email: { label: string; placeholder: string };
				subject: { label: string; options: string[] };
				message: { label: string; placeholder: string };
			};
			submit: string;
			success: string;
			error: string;
		};
	};
	seo: {
		title: string;
		description: string;
	};
}

// ============================================
// NFT Types
// ============================================

/**
 * Featured NFT item
 */
export interface FeaturedNft {
	id: string;
	title: TranslatedString;
	technique: string;
	year: number;
	price: number | null;
	currency: string | null;
	image: string;
	openSeaUrl: string | null;
}

/**
 * Featured NFT with localized strings (computed)
 */
export interface FeaturedNftLocalized {
	id: string;
	title: string;
	technique: string;
	year: number;
	price: number | null;
	currency: string | null;
	image: string;
	openSeaUrl: string | null;
}

/**
 * Complete NFT data structure
 */
export interface NftData {
	version: string;
	lastUpdated: string;
	page: {
		hero: {
			title: TranslatedString;
			subtitle: TranslatedString;
		};
		description: TranslatedString;
	};
	openSeaCollection: {
		url: string;
		collectionName: string;
		blockchain: string;
	};
	featuredNfts: FeaturedNft[];
	cta: {
		viewCollection: TranslatedString;
	};
	seo: {
		title: TranslatedString;
		description: TranslatedString;
	};
}

/**
 * NFT data with localized strings (computed)
 */
export interface NftDataLocalized {
	page: {
		hero: {
			title: string;
			subtitle: string;
		};
		description: string;
	};
	openSeaCollection: {
		url: string;
		collectionName: string;
		blockchain: string;
	};
	featuredNfts: FeaturedNftLocalized[];
	cta: {
		viewCollection: string;
	};
	seo: {
		title: string;
		description: string;
	};
}
