import type { PageServerLoad } from './$types';
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
import { eq, asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Hero
	const [hero] = await db.select().from(homepageHero).limit(1);
	let slides: any[] = [];
	if (hero) {
		const slideRows = await db
			.select({ slide: heroSlides, media: media })
			.from(heroSlides)
			.leftJoin(media, eq(heroSlides.media_id, media.id))
			.where(eq(heroSlides.hero_id, hero.id))
			.orderBy(asc(heroSlides.order_index));
		slides = slideRows.map((s) => ({
			...s.slide,
			image: s.media ? { id: s.media.id, url: `/uploads/${s.media.folder}/${s.media.stored_filename}` } : null
		}));
	}

	// About
	const aboutRows = await db
		.select({ about: homepageAbout, image: media })
		.from(homepageAbout)
		.leftJoin(media, eq(homepageAbout.image_id, media.id))
		.limit(1);
	const aboutRow = aboutRows[0];
	const about = aboutRow?.about
		? { ...aboutRow.about, image: aboutRow.image ? { id: aboutRow.image.id, url: `/uploads/${aboutRow.image.folder}/${aboutRow.image.stored_filename}` } : null }
		: null;

	// News
	const newsRows = await db
		.select({ news: homepageNews, image: media })
		.from(homepageNews)
		.leftJoin(media, eq(homepageNews.image_id, media.id))
		.orderBy(asc(homepageNews.order_index));
	const news = newsRows.map((r) => ({
		...r.news,
		image: r.image ? { id: r.image.id, url: `/uploads/${r.image.folder}/${r.image.stored_filename}` } : null
	}));

	// Testimonials
	const testimonialRows = await db
		.select({ testimonial: homepageTestimonials, avatar: media })
		.from(homepageTestimonials)
		.leftJoin(media, eq(homepageTestimonials.avatar_id, media.id))
		.orderBy(asc(homepageTestimonials.order_index));
	const testimonials = testimonialRows.map((r) => ({
		...r.testimonial,
		avatar: r.avatar ? { id: r.avatar.id, url: `/uploads/${r.avatar.folder}/${r.avatar.stored_filename}` } : null
	}));

	// Process
	const process = await db.select().from(homepageProcess).orderBy(asc(homepageProcess.order_index));

	// Featured Collections
	const collectionRows = await db
		.select({
			collection: homepageFeaturedCollections,
			seriesRow: series,
			coverImage: media
		})
		.from(homepageFeaturedCollections)
		.leftJoin(series, eq(homepageFeaturedCollections.series_id, series.id))
		.leftJoin(media, eq(homepageFeaturedCollections.cover_image_id, media.id))
		.orderBy(asc(homepageFeaturedCollections.order_index));

	const collections = collectionRows.map((r) => ({
		...r.collection,
		series: r.seriesRow
			? { id: r.seriesRow.id, slug: r.seriesRow.slug, name_en: r.seriesRow.name_en }
			: null,
		cover_image: r.coverImage
			? { id: r.coverImage.id, url: `/uploads/${r.coverImage.folder}/${r.coverImage.stored_filename}` }
			: null
	}));

	// All series (for collection picker dropdown)
	const allSeries = await db
		.select({ id: series.id, slug: series.slug, name_en: series.name_en, name_ru: series.name_ru })
		.from(series)
		.where(eq(series.is_visible, true))
		.orderBy(asc(series.name_en));

	// Exhibitions (all visible, for homepage selection)
	const exhibitionRows = await db
		.select({ exhibition: exhibitions, cover: media })
		.from(exhibitions)
		.leftJoin(media, eq(exhibitions.cover_image_id, media.id))
		.where(eq(exhibitions.is_visible, true))
		.orderBy(asc(exhibitions.order_index));

	const allExhibitions = exhibitionRows.map((r) => ({
		...r.exhibition,
		cover_image: r.cover
			? { id: r.cover.id, url: `/uploads/${r.cover.folder}/${r.cover.stored_filename}` }
			: null
	}));

	// Exhibitions preview section config
	const [exhibitionsSectionRow] = await db
		.select()
		.from(homepageSections)
		.where(eq(homepageSections.section_type, 'exhibitions_preview'))
		.limit(1);

	return {
		hero,
		slides,
		about,
		news,
		testimonials,
		process,
		collections,
		allSeries,
		allExhibitions,
		exhibitionsSection: exhibitionsSectionRow || null
	};
};
