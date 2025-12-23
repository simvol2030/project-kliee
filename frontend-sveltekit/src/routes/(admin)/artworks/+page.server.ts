import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { artworks, series } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const allArtworks = await db.select().from(artworks).orderBy(artworks.title_en);
	const allSeries = await db.select().from(series).orderBy(series.order_index);

	return {
		artworks: allArtworks,
		series: allSeries
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Artwork ID is required' });
		}

		try {
			// id is TEXT in schema, no parseInt needed
			await db.delete(artworks).where(eq(artworks.id, id));
			return { success: true, message: 'Artwork deleted successfully' };
		} catch (error) {
			console.error('Error deleting artwork:', error);
			return fail(500, { error: 'Failed to delete artwork' });
		}
	}
};
