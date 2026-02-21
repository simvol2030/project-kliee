import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { blogPosts, media, admins } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

// Helper to build media URL
function buildMediaUrl(folder: string | null, storedFilename: string | null): string | null {
	if (!storedFilename) return null;
	storedFilename = storedFilename.trim();
	folder = folder?.trim() || null;

	if (storedFilename.startsWith('/images/')) return storedFilename;
	if (storedFilename.startsWith('/')) return `/uploads${storedFilename}`;
	if (storedFilename.includes('/')) return `/uploads/${storedFilename}`;

	return `/uploads/${folder || 'uploads'}/${storedFilename}`;
}

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	// Get all admins for author dropdown
	const allAdmins = await db.select().from(admins);

	// Get all media for image picker
	const allMediaRaw = await db.select().from(media).orderBy(media.uploaded_at);
	const allMedia = allMediaRaw.map((m) => ({
		...m,
		url: buildMediaUrl(m.folder ?? null, m.stored_filename)
	}));

	if (id === 'new') {
		return {
			isNew: true,
			item: null,
			coverImage: null,
			allAdmins,
			allMedia
		};
	}

	const numericId = parseInt(id);
	if (isNaN(numericId)) {
		throw redirect(302, '/blog');
	}

	const [result] = await db
		.select({
			post: blogPosts,
			cover: media
		})
		.from(blogPosts)
		.leftJoin(media, eq(blogPosts.cover_image_id, media.id))
		.where(eq(blogPosts.id, numericId));

	if (!result) {
		throw redirect(302, '/blog');
	}

	const coverImage = result.cover
		? {
				id: result.cover.id,
				url: buildMediaUrl(result.cover.folder ?? null, result.cover.stored_filename),
				alt_en: result.cover.alt_en
			}
		: null;

	return {
		isNew: false,
		item: result.post,
		coverImage,
		allAdmins,
		allMedia
	};
};
