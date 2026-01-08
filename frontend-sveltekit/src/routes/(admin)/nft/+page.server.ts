import type { PageServerLoad, Actions } from './$types';
import { getAllNftsAdmin } from '$lib/data/nft.provider';
import { db } from '$lib/server/db/client';
import { nfts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const items = await getAllNftsAdmin();
	return { items };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'NFT ID is required' });
		}

		try {
			await db.delete(nfts).where(eq(nfts.id, parseInt(id as string)));
			return { success: true };
		} catch (e) {
			console.error('Error deleting NFT:', e);
			return fail(500, { error: 'Failed to delete NFT' });
		}
	}
};
