import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { media, mediaThumbnails } from '$lib/server/db/schema';
import { eq, desc, like, and } from 'drizzle-orm';

// Helper function to construct media URL
// Handles cases where stored_filename might already include path
function buildMediaUrl(folder: string | null, storedFilename: string): string {
	if (storedFilename.startsWith('/')) {
		return `/uploads${storedFilename}`;
	}
	if (storedFilename.includes('/')) {
		return `/uploads/${storedFilename}`;
	}
	return `/uploads/${folder || 'uploads'}/${storedFilename}`;
}

export const GET: RequestHandler = async ({ url }) => {
	const folder = url.searchParams.get('folder');
	const search = url.searchParams.get('search');
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');

	try {
		// Build conditions
		const conditions = [];
		if (folder) {
			conditions.push(eq(media.folder, folder));
		}
		if (search) {
			conditions.push(like(media.filename, `%${search}%`));
		}

		// Execute query
		const items = conditions.length > 0
			? await db.select().from(media).where(and(...conditions)).orderBy(desc(media.uploaded_at)).limit(limit).offset(offset)
			: await db.select().from(media).orderBy(desc(media.uploaded_at)).limit(limit).offset(offset);

		// Get thumbnails for each item
		const itemsWithThumbnails = await Promise.all(
			items.map(async (item: typeof media.$inferSelect) => {
				const thumbs = await db
					.select()
					.from(mediaThumbnails)
					.where(eq(mediaThumbnails.media_id, item.id));

				return {
					...item,
					url: buildMediaUrl(item.folder, item.stored_filename),
					thumbnails: thumbs.map((t: typeof mediaThumbnails.$inferSelect) => ({
						size: t.size_name,
						url: buildMediaUrl(item.folder, t.stored_filename),
						width: t.width,
						height: t.height
					}))
				};
			})
		);

		return json({
			items: itemsWithThumbnails,
			total: items.length,
			limit,
			offset
		});
	} catch (err) {
		console.error('Error fetching media:', err);
		return json({ items: [], total: 0, limit, offset, error: 'Failed to fetch media' });
	}
};
