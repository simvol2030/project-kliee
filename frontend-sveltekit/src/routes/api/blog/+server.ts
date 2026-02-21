import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { blogPosts, media } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

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

// GET all blog posts
export const GET: RequestHandler = async ({ url }) => {
	const publishedOnly = url.searchParams.get('published') === 'true';

	try {
		const posts = await db
			.select({
				post: blogPosts,
				cover: media
			})
			.from(blogPosts)
			.leftJoin(media, eq(blogPosts.cover_image_id, media.id))
			.orderBy(desc(blogPosts.created_at));

		const result = posts.map((item) => ({
			...item.post,
			cover: item.cover
				? {
						id: item.cover.id,
						url: buildMediaUrl(item.cover.folder ?? null, item.cover.stored_filename),
						alt_en: item.cover.alt_en
					}
				: null
		}));

		if (publishedOnly) {
			return json(result.filter((p) => p.is_published === 1));
		}

		return json(result);
	} catch (err) {
		console.error('Error fetching blog posts:', err);
		throw error(500, 'Failed to fetch blog posts');
	}
};

// POST create new blog post
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Auto-generate slug if not provided
		let slug = body.slug;
		if (!slug && body.title_en) {
			slug = body.title_en
				.toLowerCase()
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim();
		}
		if (!slug) {
			slug = `post-${Date.now()}`;
		}

		const [created] = await db
			.insert(blogPosts)
			.values({
				slug,
				author_id: body.author_id || null,
				title_en: body.title_en || '',
				title_ru: body.title_ru || '',
				title_es: body.title_es || '',
				title_zh: body.title_zh || '',
				excerpt_en: body.excerpt_en || '',
				excerpt_ru: body.excerpt_ru || '',
				excerpt_es: body.excerpt_es || '',
				excerpt_zh: body.excerpt_zh || '',
				content_en: body.content_en || '',
				content_ru: body.content_ru || '',
				content_es: body.content_es || '',
				content_zh: body.content_zh || '',
				cover_image_id: body.cover_image_id || null,
				tags: body.tags ? JSON.stringify(body.tags) : '[]',
				is_published: body.is_published ? 1 : 0,
				is_featured: body.is_featured ? 1 : 0,
				published_at: body.published_at || null,
				seo_title_en: body.seo_title_en || '',
				seo_title_ru: body.seo_title_ru || '',
				seo_title_es: body.seo_title_es || '',
				seo_title_zh: body.seo_title_zh || '',
				seo_description_en: body.seo_description_en || '',
				seo_description_ru: body.seo_description_ru || '',
				seo_description_es: body.seo_description_es || '',
				seo_description_zh: body.seo_description_zh || ''
			})
			.returning();

		return json({ success: true, post: created }, { status: 201 });
	} catch (err: unknown) {
		console.error('Error creating blog post:', err);
		if (err instanceof Error && err.message.includes('UNIQUE')) {
			throw error(409, 'A post with this slug already exists');
		}
		throw error(500, 'Failed to create blog post');
	}
};
