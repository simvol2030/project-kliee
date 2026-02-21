/**
 * Homepage Data Provider
 * K-LIÉE Artist Portfolio
 *
 * Reads homepage data from the database (DB-first).
 * Falls back to static JSON if DB sections are empty.
 *
 * @version 2.0
 * @date 2026-02-21
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { HomepageData, TranslatedString } from '$lib/types/homepage';
import { db } from '$lib/server/db/client';
import {
	homepageHero,
	heroSlides,
	homepageAbout,
	homepageNews,
	homepageTestimonials,
	homepageProcess,
	homepageFeaturedCollections,
	homepageSections,
	exhibitions,
	series,
	media
} from '$lib/server/db/schema';
import { eq, asc, and } from 'drizzle-orm';

// ============================================
// JSON fallback loader
// ============================================

function getHomepageJson(): HomepageData {
	const jsonPath = join(process.cwd(), 'static', 'data', 'homepage.json');
	const jsonContent = readFileSync(jsonPath, 'utf-8');
	return JSON.parse(jsonContent) as HomepageData;
}

// ============================================
// Helper: split text into paragraphs (by \n\n)
// ============================================

function splitTextToParagraphs(
	text_en: string | null,
	text_ru: string | null,
	text_es: string | null,
	text_zh: string | null
): TranslatedString[] {
	const split = (t: string | null) =>
		(t || '').split('\n\n').map((s) => s.trim()).filter(Boolean);

	const paras_en = split(text_en);
	const paras_ru = split(text_ru);
	const paras_es = split(text_es);
	const paras_zh = split(text_zh);
	const maxLen = Math.max(paras_en.length, paras_ru.length, paras_es.length, paras_zh.length);

	if (maxLen === 0) return [];

	return Array.from({ length: maxLen }, (_, i) => ({
		en: paras_en[i] || '',
		ru: paras_ru[i] || '',
		es: paras_es[i] || '',
		zh: paras_zh[i] || ''
	}));
}

// ============================================
// Helper: media URL
// ============================================

function mediaUrl(m: { folder: string | null; stored_filename: string } | null): string {
	if (!m) return '';
	return `/uploads/${m.folder || 'uploads'}/${m.stored_filename}`;
}

// ============================================
// Main DB provider
// ============================================

export async function getHomepageDataFromDb(): Promise<HomepageData> {
	const json = getHomepageJson();

	// --- Hero ---
	const [heroRow] = await db.select().from(homepageHero).limit(1);

	let heroData = json.sections.hero;
	if (heroRow) {
		const slideRows = heroRow
			? await db
					.select({ slide: heroSlides, media: media })
					.from(heroSlides)
					.leftJoin(media, eq(heroSlides.media_id, media.id))
					.where(and(eq(heroSlides.hero_id, heroRow.id), eq(heroSlides.is_visible, true)))
					.orderBy(asc(heroSlides.order_index))
			: [];

		const slides =
			slideRows.length > 0
				? slideRows.map((s) => ({
						image: s.media ? mediaUrl(s.media) : '',
						alt: {
							en: s.slide.alt_en || '',
							ru: s.slide.alt_ru || '',
							es: s.slide.alt_es || '',
							zh: s.slide.alt_zh || ''
						},
						duration: s.slide.duration ?? 4000
					}))
				: json.sections.hero.slides; // fall back to JSON slides if none in DB

		heroData = {
			slides,
			title: {
				en: heroRow.title_en,
				ru: heroRow.title_ru,
				es: heroRow.title_es,
				zh: heroRow.title_zh
			},
			subtitle: {
				en: heroRow.subtitle_en || '',
				ru: heroRow.subtitle_ru || '',
				es: heroRow.subtitle_es || '',
				zh: heroRow.subtitle_zh || ''
			},
			quote: {
				en: heroRow.quote_en || '',
				ru: heroRow.quote_ru || '',
				es: heroRow.quote_es || '',
				zh: heroRow.quote_zh || ''
			},
			announcement:
				heroRow.announcement_text_en || heroRow.announcement_highlight_en
					? {
							highlight: {
								en: heroRow.announcement_highlight_en || '',
								ru: heroRow.announcement_highlight_ru || '',
								es: heroRow.announcement_highlight_es || '',
								zh: heroRow.announcement_highlight_zh || ''
							},
							text: {
								en: heroRow.announcement_text_en || '',
								ru: heroRow.announcement_text_ru || '',
								es: heroRow.announcement_text_es || '',
								zh: heroRow.announcement_text_zh || ''
							},
							link: heroRow.announcement_link || undefined
						}
					: json.sections.hero.announcement
		};
	}

	// --- About ---
	const aboutRows = await db
		.select({ about: homepageAbout, image: media })
		.from(homepageAbout)
		.leftJoin(media, eq(homepageAbout.image_id, media.id))
		.limit(1);

	let aboutData = json.sections.about;
	const aboutRow = aboutRows[0];
	if (aboutRow?.about) {
		const a = aboutRow.about;
		const paragraphs = splitTextToParagraphs(a.text_en, a.text_ru, a.text_es, a.text_zh);
		aboutData = {
			title: {
				en: a.title_en || json.sections.about.title.en,
				ru: a.title_ru || json.sections.about.title.ru,
				es: a.title_es || json.sections.about.title.es,
				zh: a.title_zh || json.sections.about.title.zh
			},
			paragraphs: paragraphs.length > 0 ? paragraphs : json.sections.about.paragraphs,
			ctaText: {
				en: a.cta_text_en || json.sections.about.ctaText.en,
				ru: a.cta_text_ru || json.sections.about.ctaText.ru,
				es: a.cta_text_es || json.sections.about.ctaText.es,
				zh: a.cta_text_zh || json.sections.about.ctaText.zh
			},
			ctaLink: a.cta_href || json.sections.about.ctaLink,
			image: aboutRow.image ? mediaUrl(aboutRow.image) : json.sections.about.image,
			imageAlt: {
				en: aboutRow.image?.alt_en || json.sections.about.imageAlt.en,
				ru: aboutRow.image?.alt_ru || json.sections.about.imageAlt.ru,
				es: aboutRow.image?.alt_es || json.sections.about.imageAlt.es,
				zh: aboutRow.image?.alt_zh || json.sections.about.imageAlt.zh
			}
		};
	}

	// --- News ---
	const newsRows = await db
		.select({ news: homepageNews, image: media })
		.from(homepageNews)
		.leftJoin(media, eq(homepageNews.image_id, media.id))
		.where(eq(homepageNews.is_visible, true))
		.orderBy(asc(homepageNews.order_index));

	// Section title from homepage_sections
	const [newsSectionRow] = await db
		.select()
		.from(homepageSections)
		.where(eq(homepageSections.section_type, 'news'))
		.limit(1);

	const newsSectionTitle: TranslatedString = {
		en: newsSectionRow?.title_en || json.sections.news.title.en,
		ru: newsSectionRow?.title_ru || json.sections.news.title.ru,
		es: newsSectionRow?.title_es || json.sections.news.title.es,
		zh: newsSectionRow?.title_zh || json.sections.news.title.zh
	};

	const newsData =
		newsRows.length > 0
			? {
					title: newsSectionTitle,
					items: newsRows.map((r) => ({
						id: String(r.news.id),
						date: r.news.date || '',
						title: {
							en: r.news.title_en || '',
							ru: r.news.title_ru || '',
							es: r.news.title_es || '',
							zh: r.news.title_zh || ''
						},
						excerpt: {
							en: r.news.excerpt_en || '',
							ru: r.news.excerpt_ru || '',
							es: r.news.excerpt_es || '',
							zh: r.news.excerpt_zh || ''
						},
						link: r.news.link || null
					}))
				}
			: json.sections.news;

	// --- Testimonials ---
	const testimonialRows = await db
		.select({ testimonial: homepageTestimonials, avatar: media })
		.from(homepageTestimonials)
		.leftJoin(media, eq(homepageTestimonials.avatar_id, media.id))
		.where(eq(homepageTestimonials.is_visible, true))
		.orderBy(asc(homepageTestimonials.order_index));

	const [testimonialsSectionRow] = await db
		.select()
		.from(homepageSections)
		.where(eq(homepageSections.section_type, 'testimonials'))
		.limit(1);

	const testimonialsSectionTitle: TranslatedString = {
		en: testimonialsSectionRow?.title_en || json.sections.testimonials.title.en,
		ru: testimonialsSectionRow?.title_ru || json.sections.testimonials.title.ru,
		es: testimonialsSectionRow?.title_es || json.sections.testimonials.title.es,
		zh: testimonialsSectionRow?.title_zh || json.sections.testimonials.title.zh
	};

	const testimonialsData =
		testimonialRows.length > 0
			? {
					title: testimonialsSectionTitle,
					testimonials: testimonialRows.map((r) => ({
						id: String(r.testimonial.id),
						quote: {
							en: r.testimonial.quote_en || '',
							ru: r.testimonial.quote_ru || '',
							es: r.testimonial.quote_es || '',
							zh: r.testimonial.quote_zh || ''
						},
						author: {
							name: r.testimonial.author || '',
							title: {
								en: r.testimonial.role_en || '',
								ru: r.testimonial.role_ru || '',
								es: r.testimonial.role_es || '',
								zh: r.testimonial.role_zh || ''
							}
						}
					}))
				}
			: json.sections.testimonials;

	// --- Process ---
	const processRows = await db
		.select({ step: homepageProcess, image: media })
		.from(homepageProcess)
		.leftJoin(media, eq(homepageProcess.image_id, media.id))
		.where(eq(homepageProcess.is_visible, true))
		.orderBy(asc(homepageProcess.order_index));

	const [processSectionRow] = await db
		.select()
		.from(homepageSections)
		.where(eq(homepageSections.section_type, 'process'))
		.limit(1);

	const processSectionTitle: TranslatedString = {
		en: processSectionRow?.title_en || json.sections.process.title.en,
		ru: processSectionRow?.title_ru || json.sections.process.title.ru,
		es: processSectionRow?.title_es || json.sections.process.title.es,
		zh: processSectionRow?.title_zh || json.sections.process.title.zh
	};

	const processData =
		processRows.length > 0
			? {
					title: processSectionTitle,
					steps: processRows.map((r) => ({
						id: String(r.step.id),
						title: {
							en: r.step.title_en || '',
							ru: r.step.title_ru || '',
							es: r.step.title_es || '',
							zh: r.step.title_zh || ''
						},
						description: {
							en: r.step.description_en || '',
							ru: r.step.description_ru || '',
							es: r.step.description_es || '',
							zh: r.step.description_zh || ''
						},
						image: r.image ? mediaUrl(r.image) : r.step.icon || ''
					}))
				}
			: json.sections.process;

	// --- Featured Collections ---
	const collectionRows = await db
		.select({
			collection: homepageFeaturedCollections,
			seriesRow: series,
			coverImage: media
		})
		.from(homepageFeaturedCollections)
		.leftJoin(series, eq(homepageFeaturedCollections.series_id, series.id))
		.leftJoin(media, eq(homepageFeaturedCollections.cover_image_id, media.id))
		.where(eq(homepageFeaturedCollections.is_visible, true))
		.orderBy(asc(homepageFeaturedCollections.order_index));

	const [collectionsSectionRow] = await db
		.select()
		.from(homepageSections)
		.where(eq(homepageSections.section_type, 'featured_collections'))
		.limit(1);

	const featuredCollectionsData =
		collectionRows.length > 0
			? {
					title: {
						en:
							collectionsSectionRow?.title_en ||
							json.sections.featuredCollections.title.en,
						ru:
							collectionsSectionRow?.title_ru ||
							json.sections.featuredCollections.title.ru,
						es:
							collectionsSectionRow?.title_es ||
							json.sections.featuredCollections.title.es,
						zh:
							collectionsSectionRow?.title_zh ||
							json.sections.featuredCollections.title.zh
					},
					subtitle: {
						en:
							collectionsSectionRow?.subtitle_en ||
							json.sections.featuredCollections.subtitle.en,
						ru:
							collectionsSectionRow?.subtitle_ru ||
							json.sections.featuredCollections.subtitle.ru,
						es:
							collectionsSectionRow?.subtitle_es ||
							json.sections.featuredCollections.subtitle.es,
						zh:
							collectionsSectionRow?.subtitle_zh ||
							json.sections.featuredCollections.subtitle.zh
					},
					collections: collectionRows.map((r) => {
						const c = r.collection;
						const s = r.seriesRow;
						// cover image: use override if set, else series cover
						const coverImg = r.coverImage ? mediaUrl(r.coverImage) : '';
						return {
							id: String(c.id),
							title: {
								en: c.title_override_en || s?.name_en || '',
								ru: c.title_override_ru || s?.name_ru || '',
								es: c.title_override_es || s?.name_es || '',
								zh: c.title_override_zh || s?.name_zh || ''
							},
							description: {
								en: c.description_override_en || s?.description_en || '',
								ru: c.description_override_ru || s?.description_ru || '',
								es: c.description_override_es || s?.description_es || '',
								zh: c.description_override_zh || s?.description_zh || ''
							},
							coverImage: coverImg,
							link: c.link || (s?.slug ? `/works/${s.slug}` : '/works')
						};
					})
				}
			: json.sections.featuredCollections;

	// --- Exhibitions Preview ---
	const [exhibitionRow] = await db
		.select({ exhibition: exhibitions, coverImage: media })
		.from(exhibitions)
		.leftJoin(media, eq(exhibitions.cover_image_id, media.id))
		.where(and(eq(exhibitions.is_homepage_featured, true), eq(exhibitions.is_visible, true)))
		.limit(1);

	const [exhibitionsSectionRow] = await db
		.select()
		.from(homepageSections)
		.where(eq(homepageSections.section_type, 'exhibitions_preview'))
		.limit(1);

	const exhibitionsData = exhibitionRow?.exhibition
		? {
				title: {
					en: exhibitionsSectionRow?.title_en || json.sections.exhibitions.title.en,
					ru: exhibitionsSectionRow?.title_ru || json.sections.exhibitions.title.ru,
					es: exhibitionsSectionRow?.title_es || json.sections.exhibitions.title.es,
					zh: exhibitionsSectionRow?.title_zh || json.sections.exhibitions.title.zh
				},
				subtitle: {
					en: exhibitionsSectionRow?.subtitle_en || json.sections.exhibitions.subtitle.en,
					ru: exhibitionsSectionRow?.subtitle_ru || json.sections.exhibitions.subtitle.ru,
					es: exhibitionsSectionRow?.subtitle_es || json.sections.exhibitions.subtitle.es,
					zh: exhibitionsSectionRow?.subtitle_zh || json.sections.exhibitions.subtitle.zh
				},
				featured: {
					id: String(exhibitionRow.exhibition.id),
					title: {
						en: exhibitionRow.exhibition.title_en,
						ru: exhibitionRow.exhibition.title_ru,
						es: exhibitionRow.exhibition.title_es,
						zh: exhibitionRow.exhibition.title_zh
					},
					description: {
						en: exhibitionRow.exhibition.description_en || '',
						ru: exhibitionRow.exhibition.description_ru || '',
						es: exhibitionRow.exhibition.description_es || '',
						zh: exhibitionRow.exhibition.description_zh || ''
					},
					location: {
						en: [exhibitionRow.exhibition.venue_en, exhibitionRow.exhibition.city]
							.filter(Boolean)
							.join(', '),
						ru: [exhibitionRow.exhibition.venue_ru, exhibitionRow.exhibition.city]
							.filter(Boolean)
							.join(', '),
						es: [exhibitionRow.exhibition.venue_es, exhibitionRow.exhibition.city]
							.filter(Boolean)
							.join(', '),
						zh: [exhibitionRow.exhibition.venue_zh, exhibitionRow.exhibition.city]
							.filter(Boolean)
							.join(', ')
					},
					workCount: 0,
					dateRange: {
						start: exhibitionRow.exhibition.start_date || '',
						end: exhibitionRow.exhibition.end_date || null
					},
					status: (exhibitionRow.exhibition.is_current
						? 'current'
						: 'past') as 'current' | 'past' | 'upcoming',
					coverImage: exhibitionRow.coverImage
						? mediaUrl(exhibitionRow.coverImage)
						: '',
					link: `/exhibitions/${exhibitionRow.exhibition.slug || exhibitionRow.exhibition.id}`
				},
				viewAllLink: '/exhibitions'
			}
		: json.sections.exhibitions;

	// --- SEO meta (always from JSON for now) ---
	const meta = json.meta;

	return {
		pageType: 'homepage',
		meta,
		sections: {
			hero: heroData,
			featuredCollections: featuredCollectionsData,
			exhibitions: exhibitionsData,
			about: aboutData,
			news: newsData,
			testimonials: testimonialsData,
			process: processData
		}
	};
}

/**
 * Legacy sync function — kept for backwards compatibility.
 * Use getHomepageDataFromDb() instead.
 */
export function getHomepageData(): HomepageData {
	const jsonPath = join(process.cwd(), 'static', 'data', 'homepage.json');
	const jsonContent = readFileSync(jsonPath, 'utf-8');
	const data = JSON.parse(jsonContent) as HomepageData;

	if (!data.pageType || data.pageType !== 'homepage') {
		throw new Error('Invalid homepage data: missing or incorrect pageType');
	}

	if (!data.meta || !data.sections) {
		throw new Error('Invalid homepage data: missing required sections');
	}

	return data;
}
