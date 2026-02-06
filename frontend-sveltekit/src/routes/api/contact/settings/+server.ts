import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { settings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const CONTACT_KEYS = [
	'contact_recipient_email',
	'contact_form_enabled',
	'contact_auto_reply_enabled'
] as const;

// GET contact settings
export const GET: RequestHandler = async () => {
	try {
		const rows = await db
			.select()
			.from(settings)
			.where(eq(settings.group, 'contact'));

		const result: Record<string, string> = {};
		for (const row of rows) {
			result[row.key] = row.value || '';
		}

		return json(result);
	} catch (err) {
		console.error('Error fetching contact settings:', err);
		throw error(500, 'Failed to fetch contact settings');
	}
};

// POST - save contact settings
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		for (const key of CONTACT_KEYS) {
			if (body[key] !== undefined) {
				const value = String(body[key]);
				const [existing] = await db
					.select()
					.from(settings)
					.where(eq(settings.key, key))
					.limit(1);

				if (existing) {
					await db
						.update(settings)
						.set({ value })
						.where(eq(settings.key, key));
				} else {
					await db.insert(settings).values({
						key,
						value,
						type: key.includes('enabled') ? 'boolean' : 'string',
						group: 'contact'
					});
				}
			}
		}

		return json({ success: true });
	} catch (err) {
		console.error('Error saving contact settings:', err);
		throw error(500, 'Failed to save contact settings');
	}
};
