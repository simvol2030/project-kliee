import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { blogPosts } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.created_at));
	return { posts };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Post ID is required' });
		}

		try {
			await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(id)));
			return { success: true };
		} catch (err) {
			console.error('Error deleting blog post:', err);
			return fail(500, { error: 'Failed to delete post' });
		}
	}
};
