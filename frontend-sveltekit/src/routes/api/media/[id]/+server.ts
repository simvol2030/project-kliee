import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { db } from '$lib/server/db/client';
import { media, mediaThumbnails } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET single media item
export const GET: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid media ID');
	}

	try {
		const [item] = await db.select().from(media).where(eq(media.id, id)).limit(1);

		if (!item) {
			throw error(404, 'Media not found');
		}

		const thumbs = await db
			.select()
			.from(mediaThumbnails)
			.where(eq(mediaThumbnails.media_id, item.id));

		return json({
			...item,
			url: `/uploads/${item.folder}/${item.stored_filename}`,
			thumbnails: thumbs.map((t) => ({
				size: t.size_name,
				url: `/uploads/${item.folder}/${t.stored_filename}`,
				width: t.width,
				height: t.height
			}))
		});
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to fetch media');
	}
};

// PATCH update media (alt texts)
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid media ID');
	}

	try {
		const body = await request.json();
		const { alt_en, alt_ru, alt_es, alt_zh } = body;

		const [updated] = await db
			.update(media)
			.set({
				alt_en: alt_en ?? undefined,
				alt_ru: alt_ru ?? undefined,
				alt_es: alt_es ?? undefined,
				alt_zh: alt_zh ?? undefined
			})
			.where(eq(media.id, id))
			.returning();

		if (!updated) {
			throw error(404, 'Media not found');
		}

		return json({ success: true, media: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to update media');
	}
};

// DELETE media
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid media ID');
	}

	try {
		// Get media record first
		const [item] = await db.select().from(media).where(eq(media.id, id)).limit(1);

		if (!item) {
			throw error(404, 'Media not found');
		}

		// Get thumbnails
		const thumbs = await db
			.select()
			.from(mediaThumbnails)
			.where(eq(mediaThumbnails.media_id, item.id));

		// Delete files from disk
		const uploadDir = join(process.cwd(), 'static', 'uploads', item.folder || 'uploads');

		try {
			// Delete original
			await unlink(join(uploadDir, item.stored_filename));

			// Delete thumbnails
			for (const thumb of thumbs) {
				await unlink(join(uploadDir, thumb.stored_filename));
			}
		} catch (fileErr) {
			console.warn('Could not delete some files:', fileErr);
		}

		// Delete from database (thumbnails will cascade)
		await db.delete(media).where(eq(media.id, id));

		return json({ success: true, message: 'Media deleted' });
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to delete media');
	}
};
