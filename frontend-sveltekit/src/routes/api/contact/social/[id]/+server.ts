import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { contactSocialLinks } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// PATCH - update social link
export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		const body = await request.json();
		const { platform, label, url, order_index, is_visible } = body;

		const [updated] = await db
			.update(contactSocialLinks)
			.set({
				platform: platform ?? undefined,
				label: label ?? undefined,
				url: url ?? undefined,
				order_index: order_index ?? undefined,
				is_visible: is_visible ?? undefined
			})
			.where(eq(contactSocialLinks.id, id))
			.returning();

		if (!updated) throw error(404, 'Social link not found');
		return json({ success: true, socialLink: updated });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to update social link');
	}
};

// DELETE - remove social link
export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	try {
		await db.delete(contactSocialLinks).where(eq(contactSocialLinks.id, id));
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete social link');
	}
};
