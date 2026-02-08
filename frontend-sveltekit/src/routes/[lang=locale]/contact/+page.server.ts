import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { contactSocialLinks } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const socialLinks = await db
		.select()
		.from(contactSocialLinks)
		.where(eq(contactSocialLinks.is_visible, true))
		.orderBy(asc(contactSocialLinks.order_index));

	return {
		dbSocialLinks: socialLinks.map((link) => ({
			platform: link.platform,
			url: link.url,
			label: link.label
		}))
	};
};
