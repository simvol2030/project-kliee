import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { blogPosts, media, admins } from '$lib/server/db/schema';
import { eq, and, ne, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { LanguageCode } from '$lib/types/layout.types';

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

export const load: PageServerLoad = async ({ params, parent }) => {
	const { locale } = await parent();
	const localeCode = locale as LanguageCode;
	const { slug } = params;

	// Get the main post
	const [result] = await db
		.select({
			post: blogPosts,
			cover: media,
			author: admins
		})
		.from(blogPosts)
		.leftJoin(media, eq(blogPosts.cover_image_id, media.id))
		.leftJoin(admins, eq(blogPosts.author_id, admins.id))
		.where(and(eq(blogPosts.slug, slug), eq(blogPosts.is_published, 1)))
		.limit(1);

	if (!result) {
		throw error(404, 'Post not found');
	}

	const post = {
		...result.post,
		cover: result.cover
			? {
					id: result.cover.id,
					url: buildMediaUrl(result.cover.folder ?? null, result.cover.stored_filename),
					alt_en: result.cover.alt_en
				}
			: null,
		author_name: result.author?.name || null
	};

	// Get related posts (latest 3, excluding current)
	const relatedResults = await db
		.select({
			post: blogPosts,
			cover: media
		})
		.from(blogPosts)
		.leftJoin(media, eq(blogPosts.cover_image_id, media.id))
		.where(and(eq(blogPosts.is_published, 1), ne(blogPosts.id, result.post.id)))
		.orderBy(desc(blogPosts.published_at))
		.limit(3);

	const relatedPosts = relatedResults.map((r) => ({
		...r.post,
		cover: r.cover
			? {
					id: r.cover.id,
					url: buildMediaUrl(r.cover.folder ?? null, r.cover.stored_filename),
					alt_en: r.cover.alt_en
				}
			: null
	}));

	// SEO
	const seoTitle = (post[`seo_title_${localeCode}` as keyof typeof post] as string) ||
		(post[`title_${localeCode}` as keyof typeof post] as string) ||
		post.title_en ||
		'';
	const seoDescription = (post[`seo_description_${localeCode}` as keyof typeof post] as string) ||
		(post[`excerpt_${localeCode}` as keyof typeof post] as string) ||
		post.excerpt_en ||
		'';

	return {
		post,
		relatedPosts,
		locale: localeCode,
		seo: {
			title: seoTitle ? `${seoTitle} | K-LIÉE` : 'Blog | K-LIÉE',
			description: seoDescription,
			coverUrl: post.cover?.url || null
		}
	};
};
