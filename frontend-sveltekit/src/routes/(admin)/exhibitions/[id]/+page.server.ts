import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { exhibitions, exhibitionImages, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';

// Helper function to construct media URL
function buildMediaUrl(folder: string | null, storedFilename: string | null): string | null {
	if (!storedFilename) return null;

	// Normalize inputs
	storedFilename = storedFilename.trim();
	folder = folder?.trim() || null;

	// Old images: stored_filename starts with /images/ - use directly
	if (storedFilename.startsWith('/images/')) {
		return storedFilename;
	}
	if (storedFilename.startsWith('/')) {
		return `/uploads${storedFilename}`;
	}
	if (storedFilename.includes('/')) {
		return `/uploads/${storedFilename}`;
	}

	// stored_filename is just a filename - check if folder is a static images path
	if (folder) {
		if (folder.startsWith('/images/') || folder.startsWith('images/')) {
			const normalizedFolder = folder.startsWith('/') ? folder : `/${folder}`;
			return `${normalizedFolder.replace(/\/$/, '')}/${storedFilename}`;
		}
	}

	return `/uploads/${folder || 'uploads'}/${storedFilename}`;
}

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	// Get all media for image picker
	const allMediaRaw = await db.select().from(media).orderBy(media.uploaded_at);
	const allMedia = allMediaRaw.map(m => ({
		...m,
		url: buildMediaUrl(m.folder, m.stored_filename)
	}));

	if (id === 'new') {
		return {
			isNew: true,
			item: null,
			galleryImages: [],
			allMedia
		};
	}

	// Try to find exhibition by numeric ID first, then by slug
	const numericId = parseInt(id);
	let exhibition;

	if (!isNaN(numericId)) {
		// Lookup by numeric ID
		const [result] = await db.select().from(exhibitions).where(eq(exhibitions.id, numericId));
		exhibition = result;
	}

	if (!exhibition) {
		// Lookup by slug
		const [result] = await db.select().from(exhibitions).where(eq(exhibitions.slug, id));
		exhibition = result;
	}

	if (!exhibition) {
		throw redirect(302, '/exhibitions');
	}

	// Get gallery images using the found exhibition's ID
	const galleryImages = await db
		.select({
			id: exhibitionImages.id,
			media_id: exhibitionImages.media_id,
			order_index: exhibitionImages.order_index,
			caption_en: exhibitionImages.caption_en,
			caption_ru: exhibitionImages.caption_ru,
			caption_es: exhibitionImages.caption_es,
			caption_zh: exhibitionImages.caption_zh,
			stored_filename: media.stored_filename,
			folder: media.folder,
			mime_type: media.mime_type
		})
		.from(exhibitionImages)
		.leftJoin(media, eq(exhibitionImages.media_id, media.id))
		.where(eq(exhibitionImages.exhibition_id, exhibition.id))
		.orderBy(asc(exhibitionImages.order_index));

	return {
		isNew: false,
		item: exhibition,
		galleryImages: galleryImages.map((img) => ({
			...img,
			url: buildMediaUrl(img.folder, img.stored_filename)
		})),
		allMedia
	};
};

// Helper function to generate slug
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

// Helper function to get exhibition ID from numeric ID or slug
async function getExhibitionId(idOrSlug: string): Promise<number | null> {
	const numericId = parseInt(idOrSlug);

	if (!isNaN(numericId)) {
		// Try numeric ID first
		const [result] = await db.select({ id: exhibitions.id }).from(exhibitions).where(eq(exhibitions.id, numericId));
		if (result) return result.id;
	}

	// Try slug
	const [result] = await db.select({ id: exhibitions.id }).from(exhibitions).where(eq(exhibitions.slug, idOrSlug));
	return result?.id ?? null;
}

export const actions: Actions = {
	save: async ({ request, params }) => {
		const formData = await request.formData();
		const isNew = params.id === 'new';

		// Extract form data
		const titleEn = formData.get('titleEn') as string;
		const titleRu = formData.get('titleRu') as string;
		const titleEs = formData.get('titleEs') as string;
		const titleZh = formData.get('titleZh') as string;
		const descriptionEn = (formData.get('descriptionEn') as string) || null;
		const descriptionRu = (formData.get('descriptionRu') as string) || null;
		const descriptionEs = (formData.get('descriptionEs') as string) || null;
		const descriptionZh = (formData.get('descriptionZh') as string) || null;

		// Multilingual venue
		const venueEn = (formData.get('venueEn') as string) || null;
		const venueRu = (formData.get('venueRu') as string) || null;
		const venueEs = (formData.get('venueEs') as string) || null;
		const venueZh = (formData.get('venueZh') as string) || null;

		const city = (formData.get('city') as string) || null;
		const country = (formData.get('country') as string) || null;
		const address = (formData.get('address') as string) || null;
		const startDate = (formData.get('startDate') as string) || null;
		const endDate = (formData.get('endDate') as string) || null;
		const openingHours = (formData.get('openingHours') as string) || null;
		const galleryLink = (formData.get('galleryLink') as string) || null;
		const coverImageId = formData.get('coverImageId') ? parseInt(formData.get('coverImageId') as string) : null;

		// New fields
		const type = (formData.get('type') as string) || 'solo';
		const year = formData.get('year') ? parseInt(formData.get('year') as string) : null;
		let slug = (formData.get('slug') as string) || null;
		const isCurrent = formData.get('isCurrent') === 'on';
		const isFeatured = formData.get('isFeatured') === 'on';
		const isVisible = formData.get('isVisible') !== 'off';
		const orderIndex = formData.get('orderIndex') ? parseInt(formData.get('orderIndex') as string) : 0;

		if (!titleEn) {
			return fail(400, { error: 'Title (English) is required' });
		}

		// Auto-generate slug if not provided
		if (!slug) {
			slug = generateSlug(titleEn);
		}

		// Build data object with snake_case keys matching schema
		const data = {
			slug,
			type: type as 'solo' | 'group' | 'fair' | 'biennale' | 'other',
			year,
			title_en: titleEn,
			title_ru: titleRu || titleEn,
			title_es: titleEs || titleEn,
			title_zh: titleZh || titleEn,
			description_en: descriptionEn,
			description_ru: descriptionRu,
			description_es: descriptionEs,
			description_zh: descriptionZh,
			venue_en: venueEn,
			venue_ru: venueRu,
			venue_es: venueEs,
			venue_zh: venueZh,
			city,
			country,
			address,
			start_date: startDate,
			end_date: endDate,
			opening_hours: openingHours,
			gallery_link: galleryLink,
			cover_image_id: coverImageId,
			is_current: isCurrent,
			is_featured: isFeatured,
			is_visible: isVisible,
			order_index: orderIndex
		};

		try {
			if (isNew) {
				const result = await db.insert(exhibitions).values(data).returning({ id: exhibitions.id });
				const newId = result[0]?.id;
				throw redirect(302, `/exhibitions/${newId}`);
			} else {
				// Get exhibition ID (supports both numeric ID and slug)
				const exhibitionId = await getExhibitionId(params.id);
				if (!exhibitionId) {
					return fail(400, { error: 'Exhibition not found' });
				}
				await db.update(exhibitions).set(data).where(eq(exhibitions.id, exhibitionId));
				return { success: true, message: 'Exhibition saved successfully' };
			}
		} catch (e) {
			if (e instanceof Response) throw e;
			console.error('Error saving exhibition:', e);
			return fail(500, { error: 'Failed to save exhibition' });
		}
	},

	addImage: async ({ request, params }) => {
		if (params.id === 'new') {
			return fail(400, { error: 'Save the exhibition first before adding images' });
		}

		const formData = await request.formData();
		const mediaId = formData.get('media_id');

		if (!mediaId) {
			return fail(400, { error: 'Media ID is required' });
		}

		// Get exhibition ID (supports both numeric ID and slug)
		const exhibitionId = await getExhibitionId(params.id);
		if (!exhibitionId) {
			return fail(400, { error: 'Exhibition not found' });
		}

		// Get current max order_index
		const existing = await db
			.select({ order_index: exhibitionImages.order_index })
			.from(exhibitionImages)
			.where(eq(exhibitionImages.exhibition_id, exhibitionId))
			.orderBy(asc(exhibitionImages.order_index));

		const nextIndex = existing.length > 0 ? Math.max(...existing.map((e) => e.order_index ?? 0)) + 1 : 0;

		await db.insert(exhibitionImages).values({
			exhibition_id: exhibitionId,
			media_id: parseInt(mediaId as string),
			order_index: nextIndex
		});

		return { success: true };
	},

	removeImage: async ({ request }) => {
		const formData = await request.formData();
		const imageId = formData.get('image_id');

		if (!imageId) {
			return fail(400, { error: 'Image ID is required' });
		}

		await db.delete(exhibitionImages).where(eq(exhibitionImages.id, parseInt(imageId as string)));
		return { success: true };
	},

	reorderImages: async ({ request, params }) => {
		if (params.id === 'new') {
			return fail(400, { error: 'Cannot reorder images for new exhibition' });
		}

		const formData = await request.formData();
		const orderJson = formData.get('order') as string;

		if (!orderJson) {
			return fail(400, { error: 'Order data is required' });
		}

		try {
			const imageOrders = JSON.parse(orderJson) as { id: number; order_index: number }[];

			for (const item of imageOrders) {
				await db
					.update(exhibitionImages)
					.set({ order_index: item.order_index })
					.where(eq(exhibitionImages.id, item.id));
			}

			return { success: true };
		} catch (err) {
			console.error('Error reordering images:', err);
			return fail(500, { error: 'Failed to reorder images' });
		}
	}
};
