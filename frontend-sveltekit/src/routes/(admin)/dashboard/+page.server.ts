import type { PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';
import { db } from '$lib/server/db/client';
import { series, artworks, exhibitions, pages, media } from '$lib/server/db/schema';
import { count } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Получаем данные (queries теперь async)
	const users = await queries.getAllUsers();
	const posts = await queries.getAllPosts();

	// Получаем статистику контента
	const [seriesCount] = await db.select({ count: count() }).from(series);
	const [artworksCount] = await db.select({ count: count() }).from(artworks);
	const [exhibitionsCount] = await db.select({ count: count() }).from(exhibitions);
	const [pagesCount] = await db.select({ count: count() }).from(pages);
	const [mediaCount] = await db.select({ count: count() }).from(media);

	// Вычисляем статистику
	const usersCount = users.length;
	const postsCount = posts.length;
	const publishedCount = posts.filter((p) => p.published).length;

	// Получаем недавние посты
	const recentPosts = posts.slice(0, 5);

	return {
		stats: {
			users: usersCount,
			posts: postsCount,
			published: publishedCount,
			drafts: postsCount - publishedCount
		},
		contentStats: {
			series: seriesCount.count,
			artworks: artworksCount.count,
			exhibitions: exhibitionsCount.count,
			pages: pagesCount.count,
			media: mediaCount.count
		},
		recentPosts
	};
};
