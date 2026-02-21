import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { blogPosts, media } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { LanguageCode } from '$lib/types/layout.types';

// SEO per locale
const seoData: Record<string, { title: string; description: string }> = {
	en: {
		title: 'Blog | K-LIÉE',
		description: 'Stories, insights, and updates from the studio of Svetlana K-Liée'
	},
	ru: {
		title: 'Блог | К-ЛИЭ',
		description: 'Истории, размышления и новости из мастерской Светланы К-Лиэ'
	},
	es: {
		title: 'Blog | K-LIÉE',
		description: 'Historias, ideas y novedades del estudio de Svetlana K-Liée'
	},
	zh: {
		title: '博客 | K-LIÉE',
		description: 'Svetlana K-Liée 工作室的故事、见解与动态'
	}
};

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

export const load: PageServerLoad = async ({ parent }) => {
	const { locale } = await parent();
	const localeCode = locale as LanguageCode;

	const results = await db
		.select({
			post: blogPosts,
			cover: media
		})
		.from(blogPosts)
		.leftJoin(media, eq(blogPosts.cover_image_id, media.id))
		.where(eq(blogPosts.is_published, 1))
		.orderBy(desc(blogPosts.published_at));

	const posts = results.map((r) => ({
		...r.post,
		cover: r.cover
			? {
					id: r.cover.id,
					url: buildMediaUrl(r.cover.folder ?? null, r.cover.stored_filename),
					alt_en: r.cover.alt_en
				}
			: null
	}));

	const featuredPost = posts.find((p) => p.is_featured === 1) || null;
	const regularPosts = posts.filter((p) => !featuredPost || p.id !== featuredPost.id);

	const seo = seoData[localeCode] || seoData.en;

	return {
		posts,
		featuredPost,
		regularPosts,
		seo
	};
};
