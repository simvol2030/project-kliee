/**
 * About Data Provider
 *
 * Provides about page data from SQLite database.
 *
 * @version 2.0
 * @date 2026-01-08
 */

import type { LanguageCode } from '$lib/types/layout.types';
import { db } from '$lib/server/db/client';
import { aboutArtist, aboutEducation, aboutAwards, aboutResidencies, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

// ============================================
// TYPES
// ============================================

export interface ArtistLocalized {
	id: number;
	name: string;
	imageUrl: string | null;
	nationality: string | null;
	basedIn: string | null;
}

export interface ArtistFull {
	id: number;
	name: string;
	image_id: number | null;
	imageUrl: string | null;
	nationality: string | null;
	based_in: string | null;
	biography_en: string | null;
	biography_ru: string | null;
	biography_es: string | null;
	biography_zh: string | null;
	seo_title_en: string | null;
	seo_title_ru: string | null;
	seo_title_es: string | null;
	seo_title_zh: string | null;
	seo_description_en: string | null;
	seo_description_ru: string | null;
	seo_description_es: string | null;
	seo_description_zh: string | null;
	updated_at: string | null;
}

export interface EducationLocalized {
	id: number;
	year: string | null;
	degree: string | null;
	institution: string | null;
}

export interface EducationFull {
	id: number;
	year: string | null;
	degree_en: string | null;
	degree_ru: string | null;
	degree_es: string | null;
	degree_zh: string | null;
	institution_en: string | null;
	institution_ru: string | null;
	institution_es: string | null;
	institution_zh: string | null;
	order_index: number;
}

export interface AwardLocalized {
	id: number;
	year: string | null;
	title: string | null;
	organization: string | null;
}

export interface AwardFull {
	id: number;
	year: string | null;
	title_en: string | null;
	title_ru: string | null;
	title_es: string | null;
	title_zh: string | null;
	organization_en: string | null;
	organization_ru: string | null;
	organization_es: string | null;
	organization_zh: string | null;
	order_index: number;
}

export interface ResidencyLocalized {
	id: number;
	year: string | null;
	location: string | null;
}

export interface ResidencyFull {
	id: number;
	year: string | null;
	location_en: string | null;
	location_ru: string | null;
	location_es: string | null;
	location_zh: string | null;
	order_index: number;
}

export interface AboutDataLocalized {
	artist: ArtistLocalized;
	biography: string;
	education: EducationLocalized[];
	awards: AwardLocalized[];
	residencies: ResidencyLocalized[];
	seo: {
		title: string;
		description: string;
	};
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLocaleSuffix(locale: LanguageCode): string {
	return `_${locale}`;
}

function buildMediaUrl(folder: string | null, filename: string | null): string | null {
	if (!filename) return null;

	// Normalize inputs
	filename = filename.trim();
	folder = folder?.trim() || null;

	// Old images: stored_filename starts with /images/ - use directly
	if (filename.startsWith('/images/')) {
		return filename;
	}
	if (filename.startsWith('/')) {
		return `/uploads${filename}`;
	}
	if (filename.includes('/')) {
		return `/uploads/${filename}`;
	}

	// filename is just a filename - check if folder is a static images path
	if (folder) {
		if (folder.startsWith('/images/') || folder.startsWith('images/')) {
			const normalizedFolder = folder.startsWith('/') ? folder : `/${folder}`;
			return `${normalizedFolder.replace(/\/$/, '')}/${filename}`;
		}
	}

	return `/uploads/${folder || 'uploads'}/${filename}`;
}

// ============================================
// PUBLIC FUNCTIONS
// ============================================

/**
 * Get all about page data
 */
export async function getAboutData(locale: LanguageCode = 'en'): Promise<AboutDataLocalized> {
	const suffix = getLocaleSuffix(locale);

	// Get artist info
	const [artistRow] = await db.select().from(aboutArtist).limit(1);

	let imageUrl: string | null = null;
	if (artistRow?.image_id) {
		const [mediaRow] = await db.select().from(media).where(eq(media.id, artistRow.image_id));
		imageUrl = buildMediaUrl(mediaRow?.folder, mediaRow?.stored_filename);
	}

	const bioKey = `biography${suffix}` as keyof typeof artistRow;
	const seoTitleKey = `seo_title${suffix}` as keyof typeof artistRow;
	const seoDescKey = `seo_description${suffix}` as keyof typeof artistRow;

	// Get education
	const educationRows = await db.select().from(aboutEducation).orderBy(asc(aboutEducation.order_index));
	const education = educationRows.map((row) => {
		const degreeKey = `degree${suffix}` as keyof typeof row;
		const institutionKey = `institution${suffix}` as keyof typeof row;
		return {
			id: row.id,
			year: row.year,
			degree: (row[degreeKey] as string) || row.degree_en,
			institution: (row[institutionKey] as string) || row.institution_en
		};
	});

	// Get awards
	const awardRows = await db.select().from(aboutAwards).orderBy(asc(aboutAwards.order_index));
	const awards = awardRows.map((row) => {
		const titleKey = `title${suffix}` as keyof typeof row;
		const orgKey = `organization${suffix}` as keyof typeof row;
		return {
			id: row.id,
			year: row.year,
			title: (row[titleKey] as string) || row.title_en,
			organization: (row[orgKey] as string) || row.organization_en
		};
	});

	// Get residencies
	const residencyRows = await db.select().from(aboutResidencies).orderBy(asc(aboutResidencies.order_index));
	const residencies = residencyRows.map((row) => {
		const locationKey = `location${suffix}` as keyof typeof row;
		return {
			id: row.id,
			year: row.year,
			location: (row[locationKey] as string) || row.location_en
		};
	});

	return {
		artist: {
			id: artistRow?.id || 0,
			name: artistRow?.name || 'Artist',
			imageUrl,
			nationality: artistRow?.nationality || null,
			basedIn: artistRow?.based_in || null
		},
		biography: artistRow ? ((artistRow[bioKey] as string) || artistRow.biography_en || '') : '',
		education,
		awards,
		residencies,
		seo: {
			title: artistRow ? ((artistRow[seoTitleKey] as string) || artistRow.seo_title_en || 'About') : 'About',
			description: artistRow ? ((artistRow[seoDescKey] as string) || artistRow.seo_description_en || '') : ''
		}
	};
}

/**
 * Get artist info
 */
export async function getArtistInfo(locale: LanguageCode = 'en'): Promise<ArtistLocalized | null> {
	const [artistRow] = await db.select().from(aboutArtist).limit(1);
	if (!artistRow) return null;

	let imageUrl: string | null = null;
	if (artistRow.image_id) {
		const [mediaRow] = await db.select().from(media).where(eq(media.id, artistRow.image_id));
		imageUrl = buildMediaUrl(mediaRow?.folder, mediaRow?.stored_filename);
	}

	return {
		id: artistRow.id,
		name: artistRow.name,
		imageUrl,
		nationality: artistRow.nationality,
		basedIn: artistRow.based_in
	};
}

/**
 * Get biography
 */
export async function getBiography(locale: LanguageCode = 'en'): Promise<string> {
	const suffix = getLocaleSuffix(locale);
	const [artistRow] = await db.select().from(aboutArtist).limit(1);
	if (!artistRow) return '';

	const bioKey = `biography${suffix}` as keyof typeof artistRow;
	return (artistRow[bioKey] as string) || artistRow.biography_en || '';
}

/**
 * Get education list
 */
export async function getEducation(locale: LanguageCode = 'en'): Promise<EducationLocalized[]> {
	const suffix = getLocaleSuffix(locale);
	const rows = await db.select().from(aboutEducation).orderBy(asc(aboutEducation.order_index));

	return rows.map((row) => {
		const degreeKey = `degree${suffix}` as keyof typeof row;
		const institutionKey = `institution${suffix}` as keyof typeof row;
		return {
			id: row.id,
			year: row.year,
			degree: (row[degreeKey] as string) || row.degree_en,
			institution: (row[institutionKey] as string) || row.institution_en
		};
	});
}

/**
 * Get awards list
 */
export async function getAwards(locale: LanguageCode = 'en'): Promise<AwardLocalized[]> {
	const suffix = getLocaleSuffix(locale);
	const rows = await db.select().from(aboutAwards).orderBy(asc(aboutAwards.order_index));

	return rows.map((row) => {
		const titleKey = `title${suffix}` as keyof typeof row;
		const orgKey = `organization${suffix}` as keyof typeof row;
		return {
			id: row.id,
			year: row.year,
			title: (row[titleKey] as string) || row.title_en,
			organization: (row[orgKey] as string) || row.organization_en
		};
	});
}

/**
 * Get residencies list
 */
export async function getResidencies(locale: LanguageCode = 'en'): Promise<ResidencyLocalized[]> {
	const suffix = getLocaleSuffix(locale);
	const rows = await db.select().from(aboutResidencies).orderBy(asc(aboutResidencies.order_index));

	return rows.map((row) => {
		const locationKey = `location${suffix}` as keyof typeof row;
		return {
			id: row.id,
			year: row.year,
			location: (row[locationKey] as string) || row.location_en
		};
	});
}

/**
 * Get SEO data
 */
export async function getSeoData(locale: LanguageCode = 'en'): Promise<{ title: string; description: string }> {
	const suffix = getLocaleSuffix(locale);
	const [artistRow] = await db.select().from(aboutArtist).limit(1);

	if (!artistRow) {
		return { title: 'About', description: '' };
	}

	const seoTitleKey = `seo_title${suffix}` as keyof typeof artistRow;
	const seoDescKey = `seo_description${suffix}` as keyof typeof artistRow;

	return {
		title: (artistRow[seoTitleKey] as string) || artistRow.seo_title_en || 'About',
		description: (artistRow[seoDescKey] as string) || artistRow.seo_description_en || ''
	};
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Get artist raw data for admin
 */
export async function getArtistAdmin(): Promise<ArtistFull | null> {
	const [artistRow] = await db.select().from(aboutArtist).limit(1);
	if (!artistRow) return null;

	let imageUrl: string | null = null;
	if (artistRow.image_id) {
		const [mediaRow] = await db.select().from(media).where(eq(media.id, artistRow.image_id));
		imageUrl = buildMediaUrl(mediaRow?.folder, mediaRow?.stored_filename);
	}

	return {
		...artistRow,
		imageUrl
	};
}

/**
 * Update or create artist info
 */
export async function upsertArtist(data: Partial<typeof aboutArtist.$inferInsert>): Promise<void> {
	const [existing] = await db.select({ id: aboutArtist.id }).from(aboutArtist).limit(1);

	if (existing) {
		await db.update(aboutArtist).set(data).where(eq(aboutArtist.id, existing.id));
	} else {
		await db.insert(aboutArtist).values({ name: data.name || 'Artist', ...data });
	}
}

/**
 * Get all education for admin
 */
export async function getAllEducationAdmin(): Promise<EducationFull[]> {
	const rows = await db.select().from(aboutEducation).orderBy(asc(aboutEducation.order_index));
	return rows.map((row) => ({ ...row, order_index: row.order_index ?? 0 }));
}

/**
 * Get education by ID
 */
export async function getEducationById(id: number): Promise<EducationFull | undefined> {
	const [row] = await db.select().from(aboutEducation).where(eq(aboutEducation.id, id));
	return row ? { ...row, order_index: row.order_index ?? 0 } : undefined;
}

/**
 * Create education entry
 */
export async function createEducation(data: Omit<typeof aboutEducation.$inferInsert, 'id'>): Promise<number> {
	const result = await db.insert(aboutEducation).values(data).returning({ id: aboutEducation.id });
	return result[0].id;
}

/**
 * Update education entry
 */
export async function updateEducation(id: number, data: Partial<typeof aboutEducation.$inferInsert>): Promise<void> {
	await db.update(aboutEducation).set(data).where(eq(aboutEducation.id, id));
}

/**
 * Delete education entry
 */
export async function deleteEducation(id: number): Promise<void> {
	await db.delete(aboutEducation).where(eq(aboutEducation.id, id));
}

/**
 * Get all awards for admin
 */
export async function getAllAwardsAdmin(): Promise<AwardFull[]> {
	const rows = await db.select().from(aboutAwards).orderBy(asc(aboutAwards.order_index));
	return rows.map((row) => ({ ...row, order_index: row.order_index ?? 0 }));
}

/**
 * Get award by ID
 */
export async function getAwardById(id: number): Promise<AwardFull | undefined> {
	const [row] = await db.select().from(aboutAwards).where(eq(aboutAwards.id, id));
	return row ? { ...row, order_index: row.order_index ?? 0 } : undefined;
}

/**
 * Create award entry
 */
export async function createAward(data: Omit<typeof aboutAwards.$inferInsert, 'id'>): Promise<number> {
	const result = await db.insert(aboutAwards).values(data).returning({ id: aboutAwards.id });
	return result[0].id;
}

/**
 * Update award entry
 */
export async function updateAward(id: number, data: Partial<typeof aboutAwards.$inferInsert>): Promise<void> {
	await db.update(aboutAwards).set(data).where(eq(aboutAwards.id, id));
}

/**
 * Delete award entry
 */
export async function deleteAward(id: number): Promise<void> {
	await db.delete(aboutAwards).where(eq(aboutAwards.id, id));
}

/**
 * Get all residencies for admin
 */
export async function getAllResidenciesAdmin(): Promise<ResidencyFull[]> {
	const rows = await db.select().from(aboutResidencies).orderBy(asc(aboutResidencies.order_index));
	return rows.map((row) => ({ ...row, order_index: row.order_index ?? 0 }));
}

/**
 * Get residency by ID
 */
export async function getResidencyById(id: number): Promise<ResidencyFull | undefined> {
	const [row] = await db.select().from(aboutResidencies).where(eq(aboutResidencies.id, id));
	return row ? { ...row, order_index: row.order_index ?? 0 } : undefined;
}

/**
 * Create residency entry
 */
export async function createResidency(data: Omit<typeof aboutResidencies.$inferInsert, 'id'>): Promise<number> {
	const result = await db.insert(aboutResidencies).values(data).returning({ id: aboutResidencies.id });
	return result[0].id;
}

/**
 * Update residency entry
 */
export async function updateResidency(id: number, data: Partial<typeof aboutResidencies.$inferInsert>): Promise<void> {
	await db.update(aboutResidencies).set(data).where(eq(aboutResidencies.id, id));
}

/**
 * Delete residency entry
 */
export async function deleteResidency(id: number): Promise<void> {
	await db.delete(aboutResidencies).where(eq(aboutResidencies.id, id));
}
