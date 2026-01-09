import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { media, mediaThumbnails } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

// Helper function to construct media URL
// Handles cases where stored_filename might already include path
function buildMediaUrl(folder: string | null, storedFilename: string): string {
	// Old images: stored_filename starts with /images/ - use directly (served by nginx /images/ location)
	if (storedFilename.startsWith('/images/')) {
		return storedFilename;
	}
	// Legacy: other paths starting with /
	if (storedFilename.startsWith('/')) {
		return `/uploads${storedFilename}`;
	}
	// Modern: relative paths that contain /
	if (storedFilename.includes('/')) {
		return `/uploads/${storedFilename}`;
	}
	// Simple filename - combine with folder
	return `/uploads/${folder || 'uploads'}/${storedFilename}`;
}

export const load: PageServerLoad = async () => {
	const items = await db
		.select()
		.from(media)
		.orderBy(desc(media.uploaded_at));

	// Get thumbnails for each media item
	const itemsWithThumbnails = await Promise.all(
		items.map(async (item: typeof media.$inferSelect) => {
			const thumbnails = await db
				.select()
				.from(mediaThumbnails)
				.where(eq(mediaThumbnails.media_id, item.id));

			return {
				...item,
				url: buildMediaUrl(item.folder, item.stored_filename),
				thumbnails: thumbnails.map((t: typeof mediaThumbnails.$inferSelect) => ({
					size: t.size_name,
					url: buildMediaUrl(item.folder, t.stored_filename)
				}))
			};
		})
	);

	return {
		items: itemsWithThumbnails
	};
};
