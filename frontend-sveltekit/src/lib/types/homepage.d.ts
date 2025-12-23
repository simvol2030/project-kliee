/**
 * Homepage Type Definitions
 * K-LIÉE Artist Portfolio
 *
 * @version 1.0
 * @date 2025-11-09
 */

// ============================================
// Common Types
// ============================================

export interface TranslatedString {
	en: string;
	ru: string;
	es: string;
	zh: string;
}

export interface PageMeta {
	title: TranslatedString;
	description: TranslatedString;
	keywords: TranslatedString;
}

// ============================================
// Hero Section
// ============================================

export interface HeroSlide {
	image: string;
	alt: TranslatedString;
	duration?: number; // milliseconds, default 4000
}

export interface HeroAnnouncement {
	highlight: TranslatedString;
	text: TranslatedString;
	link?: string;
}

export interface HeroSection {
	slides: HeroSlide[];
	title: TranslatedString;
	subtitle: TranslatedString;
	quote: TranslatedString;
	announcement?: HeroAnnouncement;
}

// ============================================
// Featured Collections Section
// ============================================

export interface WorkCollection {
	id: string;
	title: TranslatedString;
	description: TranslatedString;
	coverImage: string;
	link: string;
}

export interface FeaturedCollectionsSection {
	title: TranslatedString;
	subtitle: TranslatedString;
	collections: WorkCollection[];
}

// ============================================
// Exhibitions Section
// ============================================

export type ExhibitionStatus = 'current' | 'upcoming' | 'past';

export interface Exhibition {
	id: string;
	title: TranslatedString;
	description: TranslatedString;
	location: TranslatedString;
	workCount: number;
	dateRange: {
		start: string; // ISO date
		end: string | null; // ISO date or null for "Ongoing"
	};
	status: ExhibitionStatus;
	coverImage: string;
	link: string;
}

export interface ExhibitionsSection {
	title: TranslatedString;
	subtitle: TranslatedString;
	featured: Exhibition | null;
	viewAllLink: string;
}

// ============================================
// About Section
// ============================================

export interface AboutSection {
	title: TranslatedString;
	paragraphs: TranslatedString[];
	ctaText: TranslatedString;
	ctaLink: string;
	image: string;
	imageAlt: TranslatedString;
}

// ============================================
// News Section
// ============================================

export interface NewsItem {
	id: string;
	date: string; // Display format (e.g., "December 2024")
	title: TranslatedString;
	excerpt: TranslatedString;
	link: string | null;
}

export interface NewsSection {
	title: TranslatedString;
	items: NewsItem[];
}

// ============================================
// Testimonials Section
// ============================================

export interface TestimonialAuthor {
	name: string; // Not translated (proper names)
	title: TranslatedString;
}

export interface Testimonial {
	id: string;
	quote: TranslatedString;
	author: TestimonialAuthor;
}

export interface TestimonialsSection {
	title: TranslatedString;
	testimonials: Testimonial[];
}

// ============================================
// Creative Process Section
// ============================================

export interface ProcessStep {
	id: string;
	title: TranslatedString;
	description: TranslatedString;
	image: string;
}

export interface ProcessSection {
	title: TranslatedString;
	steps: ProcessStep[];
}

// ============================================
// Homepage Data (Root)
// ============================================

export interface HomepageSections {
	hero: HeroSection;
	featuredCollections: FeaturedCollectionsSection;
	exhibitions: ExhibitionsSection;
	about: AboutSection;
	news: NewsSection;
	testimonials: TestimonialsSection;
	process: ProcessSection;
}

export interface HomepageData {
	pageType: 'homepage';
	meta: PageMeta;
	sections: HomepageSections;
}
