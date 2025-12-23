import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { artworkImages, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET artwork images
export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	try {
		const images = await db
			.select({
				id: artworkImages.id,
				media_id: artworkImages.media_id,
				is_primary: artworkImages.is_primary,
				order_index: artworkImages.order_index,
				media: {
					id: media.id,
					filename: media.filename,
					stored_filename: media.stored_filename,
					folder: media.folder,
					alt_en: media.alt_en
				}
			})
			.from(artworkImages)
			.leftJoin(media, eq(artworkImages.media_id, media.id))
			.where(eq(artworkImages.artwork_id, id))
			.orderBy(asc(artworkImages.order_index));

		// Add URL to each media item
		const result = images.map((img) => ({
			...img,
			media: img.media
				? {
						...img.media,
						url: `/uploads/${img.media.folder || 'uploads'}/${img.media.stored_filename}`
					}
				: null
		}));

		return json({ images: result });
	} catch (err) {
		console.error('Error fetching artwork images:', err);
		throw error(500, 'Failed to fetch artwork images');
	}
};

// PUT - Replace all artwork images
export const PUT: RequestHandler = async ({ params, request }) => {
	const { id } = params;

	try {
		const body = await request.json();
		const { images } = body;

		if (!Array.isArray(images)) {
			throw error(400, 'images must be an array');
		}

		// Delete existing images
		await db.delete(artworkImages).where(eq(artworkImages.artwork_id, id));

		// Insert new images
		if (images.length > 0) {
			const insertData = images.map((img: { media_id: number; is_primary: boolean; order_index: number }, index: number) => ({
				artwork_id: id,
				media_id: img.media_id,
				is_primary: img.is_primary || index === 0,
				order_index: img.order_index ?? index
			}));

			await db.insert(artworkImages).values(insertData);
		}

		return json({ success: true, count: images.length });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error updating artwork images:', err);
		throw error(500, 'Failed to update artwork images');
	}
};

// POST - Add single image to artwork
export const POST: RequestHandler = async ({ params, request }) => {
	const { id } = params;

	try {
		const body = await request.json();
		const { media_id, is_primary = false } = body;

		if (!media_id) {
			throw error(400, 'media_id is required');
		}

		// Get current max order_index
		const existing = await db
			.select({ order_index: artworkImages.order_index })
			.from(artworkImages)
			.where(eq(artworkImages.artwork_id, id))
			.orderBy(asc(artworkImages.order_index));

		const nextIndex = existing.length > 0 ? Math.max(...existing.map((e) => e.order_index ?? 0)) + 1 : 0;
		const shouldBePrimary = is_primary || existing.length === 0;

		// If this should be primary, unset others
		if (shouldBePrimary) {
			await db
				.update(artworkImages)
				.set({ is_primary: false })
				.where(eq(artworkImages.artwork_id, id));
		}

		const [inserted] = await db
			.insert(artworkImages)
			.values({
				artwork_id: id,
				media_id,
				is_primary: shouldBePrimary,
				order_index: nextIndex
			})
			.returning();

		return json({ success: true, image: inserted });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error adding artwork image:', err);
		throw error(500, 'Failed to add artwork image');
	}
};

// DELETE - Remove image from artwork
export const DELETE: RequestHandler = async ({ params, url }) => {
	const { id } = params;
	const imageId = url.searchParams.get('image_id');

	try {
		if (imageId) {
			// Delete specific image
			await db.delete(artworkImages).where(eq(artworkImages.id, parseInt(imageId)));
		} else {
			// Delete all images for this artwork
			await db.delete(artworkImages).where(eq(artworkImages.artwork_id, id));
		}

		return json({ success: true });
	} catch (err) {
		console.error('Error deleting artwork image:', err);
		throw error(500, 'Failed to delete artwork image');
	}
};
