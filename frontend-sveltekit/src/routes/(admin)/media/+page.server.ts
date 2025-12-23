import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { media, mediaThumbnails } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

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
				url: `/uploads/${item.folder}/${item.stored_filename}`,
				thumbnails: thumbnails.map((t: typeof mediaThumbnails.$inferSelect) => ({
					size: t.size_name,
					url: `/uploads/${item.folder}/${t.stored_filename}`
				}))
			};
		})
	);

	return {
		items: itemsWithThumbnails
	};
};
