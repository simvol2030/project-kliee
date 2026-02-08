import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { settings, contactSocialLinks } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Load contact settings
	const settingsRows = await db
		.select()
		.from(settings)
		.where(eq(settings.group, 'contact'));

	const contactSettings: Record<string, string> = {};
	for (const row of settingsRows) {
		contactSettings[row.key] = row.value || '';
	}

	// Load social links
	const socialLinks = await db
		.select()
		.from(contactSocialLinks)
		.orderBy(asc(contactSocialLinks.order_index));

	return {
		contactSettings,
		socialLinks
	};
};
