import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { series, media } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';

// Helper function to construct media URL
function buildMediaUrl(folder: string | null, storedFilename: string): string {
	// Normalize inputs
	storedFilename = storedFilename?.trim() || '';
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

	// Load all image media for the picker
	const allMediaItems = await db
		.select()
		.from(media)
		.orderBy(desc(media.uploaded_at));

	const allMedia = allMediaItems
		.filter(m => m.mime_type?.startsWith('image/'))
		.map(m => ({
			...m,
			url: buildMediaUrl(m.folder, m.stored_filename)
		}));

	if (id === 'new') {
		return { item: null, isNew: true, allMedia };
	}

	// id is TEXT in schema, no parseInt needed
	const [item] = await db.select().from(series).where(eq(series.id, id));

	if (!item) {
		throw error(404, 'Series not found');
	}

	// Find cover image URL if set
	let coverImageUrl: string | null = null;
	if (item.cover_image_id) {
		const coverMedia = allMediaItems.find(m => m.id === item.cover_image_id);
		if (coverMedia) {
			coverImageUrl = buildMediaUrl(coverMedia.folder, coverMedia.stored_filename);
		}
	}

	return { item: { ...item, coverImageUrl }, isNew: false, allMedia };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const formData = await request.formData();
		const isNew = params.id === 'new';

		// Extract form data (using snake_case field names from form)
		const slug = formData.get('slug') as string;
		const nameEn = formData.get('name_en') as string;
		const nameRu = formData.get('name_ru') as string;
		const nameEs = formData.get('name_es') as string;
		const nameZh = formData.get('name_zh') as string;
		const descriptionEn = (formData.get('description_en') as string) || null;
		const descriptionRu = (formData.get('description_ru') as string) || null;
		const descriptionEs = (formData.get('description_es') as string) || null;
		const descriptionZh = (formData.get('description_zh') as string) || null;
		const orderIndex = parseInt(formData.get('order_index') as string) || 0;
		const coverImageId = formData.get('cover_image_id') ? parseInt(formData.get('cover_image_id') as string) : null;
		const isVisible = formData.get('is_visible') === 'on';
		const isFeatured = formData.get('is_featured') === 'on';
		const showInShop = formData.get('show_in_shop') === 'on';

		if (!nameEn?.trim()) {
			return fail(400, { error: 'Name (English) is required' });
		}

		if (!slug?.trim()) {
			return fail(400, { error: 'Slug is required' });
		}

		// Build data with snake_case keys matching schema
		const data = {
			slug,
			name_en: nameEn,
			name_ru: nameRu || nameEn,
			name_es: nameEs || nameEn,
			name_zh: nameZh || nameEn,
			description_en: descriptionEn,
			description_ru: descriptionRu,
			description_es: descriptionEs,
			description_zh: descriptionZh,
			order_index: orderIndex,
			cover_image_id: coverImageId,
			is_visible: isVisible,
			is_featured: isFeatured,
			show_in_shop: showInShop
		};

		try {
			if (isNew) {
				// Generate unique ID for new series (id is TEXT, required)
				const newId = `ser_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
				const result = await db.insert(series).values({ id: newId, ...data }).returning({ id: series.id });
				const createdId = result[0]?.id;
				throw redirect(303, `/series/${createdId}`);
			} else {
				// id is TEXT in schema, use params.id directly
				await db
					.update(series)
					.set({
						...data,
						updated_at: new Date().toISOString()
					})
					.where(eq(series.id, params.id));
				return { success: true, message: 'Series saved successfully' };
			}
		} catch (e) {
			if (e && typeof e === 'object' && 'status' in e) throw e;
			console.error('Error saving series:', e);
			return fail(500, { error: 'Failed to save series' });
		}
	}
};
