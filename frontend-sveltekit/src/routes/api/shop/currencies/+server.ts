import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { currencyRates } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '$lib/server/auth/session';

/**
 * GET /api/shop/currencies
 * Returns all currency rates
 */
export const GET: RequestHandler = async () => {
	try {
		const rates = await db.select().from(currencyRates);

		return json({
			base: 'EUR',
			rates: rates.map((r) => ({
				currency: r.to_currency,
				rate: parseFloat(r.rate),
				updated_at: r.updated_at
			}))
		});
	} catch (err) {
		console.error('Error fetching currency rates:', err);
		throw error(500, 'Failed to fetch currency rates');
	}
};

/**
 * PATCH /api/shop/currencies
 * Update currency rates (admin only)
 */
export const PATCH: RequestHandler = async (event) => {
	// Check admin auth
	const user = getSession(event);
	if (!user || !['super-admin', 'editor'].includes(user.role)) {
		throw error(403, 'Admin access required');
	}

	try {
		const body = await event.request.json();
		const { rates } = body;

		if (!Array.isArray(rates)) {
			throw error(400, 'rates must be an array');
		}

		const results = [];

		for (const { currency, rate } of rates) {
			if (!currency || typeof rate !== 'number' || rate <= 0) {
				continue;
			}

			// Check if rate exists
			const [existing] = await db
				.select()
				.from(currencyRates)
				.where(eq(currencyRates.to_currency, currency))
				.limit(1);

			if (existing) {
				// Update
				await db
					.update(currencyRates)
					.set({
						rate: rate.toString(),
						updated_at: new Date().toISOString()
					})
					.where(eq(currencyRates.to_currency, currency));
			} else {
				// Insert
				await db.insert(currencyRates).values({
					from_currency: 'EUR',
					to_currency: currency,
					rate: rate.toString()
				});
			}

			results.push({ currency, rate, updated: true });
		}

		return json({ success: true, updated: results });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error updating currency rates:', err);
		throw error(500, 'Failed to update currency rates');
	}
};
