import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { footerBrand, footerSocialLinks, footerContact } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const [brand] = await db.select().from(footerBrand).limit(1);
	const socialLinks = await db.select().from(footerSocialLinks).orderBy(asc(footerSocialLinks.order_index));
	const [contact] = await db.select().from(footerContact).limit(1);

	return {
		brand: brand || null,
		socialLinks,
		contact: contact || null
	};
};
