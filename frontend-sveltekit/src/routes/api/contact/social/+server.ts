import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { contactSocialLinks } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

// GET all contact social links
export const GET: RequestHandler = async () => {
	try {
		const links = await db
			.select()
			.from(contactSocialLinks)
			.orderBy(asc(contactSocialLinks.order_index));

		return json(links);
	} catch (err) {
		console.error('Error fetching contact social links:', err);
		throw error(500, 'Failed to fetch contact social links');
	}
};

// POST - add new social link
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { platform, label, url, order_index, is_visible } = body;

		if (!platform || !url) {
			throw error(400, 'platform and url are required');
		}

		const [newLink] = await db
			.insert(contactSocialLinks)
			.values({
				platform,
				label: label || platform,
				url,
				order_index: order_index || 0,
				is_visible: is_visible !== false
			})
			.returning();

		return json({ success: true, socialLink: newLink });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error creating contact social link:', err);
		throw error(500, 'Failed to create contact social link');
	}
};
