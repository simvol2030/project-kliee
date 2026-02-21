import type { PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	const allPosts = await queries.getAllPosts();
	const posts = allPosts.filter((p) => p.published);
	return { posts };
};
