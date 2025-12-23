import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { currencyRates, shopSettings } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	// Fetch currency rates
	const rates = await db.select().from(currencyRates);

	// Fetch shop settings
	const settings = await db.select().from(shopSettings);

	// Convert settings array to object
	const settingsObj: Record<string, string> = {};
	for (const s of settings) {
		settingsObj[s.key] = s.value || '';
	}

	return {
		rates: rates.map((r) => ({
			currency: r.to_currency,
			rate: parseFloat(r.rate),
			updated_at: r.updated_at
		})),
		settings: settingsObj
	};
};
