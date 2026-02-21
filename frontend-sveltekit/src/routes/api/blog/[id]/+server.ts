import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { blogPosts, media, admins } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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

// GET single blog post
export const GET: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid post ID');

	try {
		const [result] = await db
			.select({
				post: blogPosts,
				cover: media,
				author: admins
			})
			.from(blogPosts)
			.leftJoin(media, eq(blogPosts.cover_image_id, media.id))
			.leftJoin(admins, eq(blogPosts.author_id, admins.id))
			.where(eq(blogPosts.id, id));

		if (!result) throw error(404, 'Blog post not found');

		return json({
			...result.post,
			cover: result.cover
				? {
						id: result.cover.id,
						url: buildMediaUrl(result.cover.folder ?? null, result.cover.stored_filename),
						alt_en: result.cover.alt_en
					}
				: null,
			author_name: result.author?.name || null
		});
	} catch (err) {
		if (err instanceof Response) throw err;
		console.error('Error fetching blog post:', err);
		throw error(500, 'Failed to fetch blog post');
	}
};

// PATCH update blog post
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid post ID');

	try {
		const body = await request.json();

		const updateData: Record<string, unknown> = {
			updated_at: new Date().toISOString()
		};

		// Only update provided fields
		const fields = [
			'slug', 'author_id',
			'title_en', 'title_ru', 'title_es', 'title_zh',
			'excerpt_en', 'excerpt_ru', 'excerpt_es', 'excerpt_zh',
			'content_en', 'content_ru', 'content_es', 'content_zh',
			'cover_image_id',
			'published_at',
			'seo_title_en', 'seo_title_ru', 'seo_title_es', 'seo_title_zh',
			'seo_description_en', 'seo_description_ru', 'seo_description_es', 'seo_description_zh'
		];

		for (const field of fields) {
			if (field in body) {
				updateData[field] = body[field];
			}
		}

		// Handle boolean -> integer conversions
		if ('is_published' in body) {
			updateData.is_published = body.is_published ? 1 : 0;
		}
		if ('is_featured' in body) {
			updateData.is_featured = body.is_featured ? 1 : 0;
		}

		// Handle tags (array -> JSON string)
		if ('tags' in body) {
			updateData.tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : body.tags;
		}

		const [updated] = await db
			.update(blogPosts)
			.set(updateData)
			.where(eq(blogPosts.id, id))
			.returning();

		if (!updated) throw error(404, 'Blog post not found');

		return json({ success: true, post: updated });
	} catch (err) {
		if (err instanceof Response) throw err;
		console.error('Error updating blog post:', err);
		if (err instanceof Error && err.message.includes('UNIQUE')) {
			throw error(409, 'A post with this slug already exists');
		}
		throw error(500, 'Failed to update blog post');
	}
};

// DELETE blog post
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid post ID');

	try {
		const [deleted] = await db
			.delete(blogPosts)
			.where(eq(blogPosts.id, id))
			.returning();

		if (!deleted) throw error(404, 'Blog post not found');

		return json({ success: true });
	} catch (err) {
		if (err instanceof Response) throw err;
		console.error('Error deleting blog post:', err);
		throw error(500, 'Failed to delete blog post');
	}
};
