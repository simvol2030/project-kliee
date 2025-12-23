import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { series } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const allSeries = await db.select().from(series).orderBy(series.order_index);

	return {
		series: allSeries
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Series ID is required' });
		}

		try {
			// id is TEXT in schema, no parseInt needed
			await db.delete(series).where(eq(series.id, id));
			return { success: true, message: 'Series deleted successfully' };
		} catch (error) {
			console.error('Error deleting series:', error);
			return fail(500, { error: 'Failed to delete series' });
		}
	}
};
