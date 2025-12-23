import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { exhibitions } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const allExhibitions = await db.select().from(exhibitions).orderBy(desc(exhibitions.start_date));

	return {
		exhibitions: allExhibitions
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Exhibition ID is required' });
		}

		try {
			await db.delete(exhibitions).where(eq(exhibitions.id, parseInt(id)));
			return { success: true, message: 'Exhibition deleted successfully' };
		} catch (error) {
			console.error('Error deleting exhibition:', error);
			return fail(500, { error: 'Failed to delete exhibition' });
		}
	}
};
