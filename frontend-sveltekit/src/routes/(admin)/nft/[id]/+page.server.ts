import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { nfts, media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import { getNftByIdAdmin } from '$lib/data/nft.provider';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	// Get all media for pickers
	const allMedia = await db.select().from(media).orderBy(media.uploaded_at);

	if (id === 'new') {
		return {
			isNew: true,
			item: null,
			allMedia
		};
	}

	const numericId = parseInt(id);
	if (isNaN(numericId)) {
		throw error(400, 'Invalid NFT ID');
	}

	const item = await getNftByIdAdmin(numericId);

	if (!item) {
		throw redirect(302, '/nft');
	}

	return {
		isNew: false,
		item,
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

export const actions: Actions = {
	save: async ({ request, params }) => {
		const formData = await request.formData();
		const isNew = params.id === 'new';

		// Extract form data
		const titleEn = formData.get('titleEn') as string;
		const titleRu = formData.get('titleRu') as string;
		const titleEs = formData.get('titleEs') as string;
		const titleZh = formData.get('titleZh') as string;
		const descriptionEn = formData.get('descriptionEn') as string;
		const descriptionRu = formData.get('descriptionRu') as string;
		const descriptionEs = formData.get('descriptionEs') as string;
		const descriptionZh = formData.get('descriptionZh') as string;

		const technique = (formData.get('technique') as string) || null;
		const year = formData.get('year') ? parseInt(formData.get('year') as string) : null;
		const price = (formData.get('price') as string) || null;
		const currency = (formData.get('currency') as string) || 'ETH';
		const openSeaUrl = (formData.get('openSeaUrl') as string) || null;
		const blockchain = (formData.get('blockchain') as string) || 'Ethereum';

		const imageId = formData.get('imageId') ? parseInt(formData.get('imageId') as string) : null;
		const videoId = formData.get('videoId') ? parseInt(formData.get('videoId') as string) : null;

		let slug = (formData.get('slug') as string) || null;
		const isFeatured = formData.get('isFeatured') === 'on';
		const isVisible = formData.get('isVisible') !== 'off';
		const orderIndex = formData.get('orderIndex') ? parseInt(formData.get('orderIndex') as string) : 0;

		// Validation
		if (!titleEn) {
			return fail(400, { error: 'Title (English) is required' });
		}

		if (!descriptionEn) {
			return fail(400, { error: 'Description (English) is required' });
		}

		if (!descriptionRu) {
			return fail(400, { error: 'Description (Russian) is required' });
		}

		if (!descriptionEs) {
			return fail(400, { error: 'Description (Spanish) is required' });
		}

		if (!descriptionZh) {
			return fail(400, { error: 'Description (Chinese) is required' });
		}

		if (!imageId) {
			return fail(400, { error: 'Image is required. Please select an image.' });
		}

		// Video is optional - Media Library doesn't support video upload yet

		// Auto-generate slug if not provided
		if (!slug) {
			slug = generateSlug(titleEn);
		}

		// Build data object
		const data = {
			slug,
			title_en: titleEn,
			title_ru: titleRu || titleEn,
			title_es: titleEs || titleEn,
			title_zh: titleZh || titleEn,
			description_en: descriptionEn,
			description_ru: descriptionRu,
			description_es: descriptionEs,
			description_zh: descriptionZh,
			technique,
			year,
			price,
			currency,
			opensea_url: openSeaUrl,
			blockchain,
			image_id: imageId,
			video_id: videoId,
			is_featured: isFeatured,
			is_visible: isVisible,
			order_index: orderIndex
		};

		try {
			if (isNew) {
				const result = await db.insert(nfts).values(data).returning({ id: nfts.id });
				const newId = result[0]?.id;
				throw redirect(302, `/nft/${newId}`);
			} else {
				const numericId = parseInt(params.id);
				if (isNaN(numericId)) {
					return fail(400, { error: 'Invalid NFT ID' });
				}
				await db.update(nfts).set(data).where(eq(nfts.id, numericId));
				return { success: true, message: 'NFT saved successfully' };
			}
		} catch (e) {
			if (e instanceof Response) throw e;
			console.error('Error saving NFT:', e);
			return fail(500, { error: 'Failed to save NFT' });
		}
	}
};
