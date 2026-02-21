/**
 * Homepage Data Loader (Server-Side)
 * K-LIÉE Artist Portfolio
 *
 * @version 2.0
 * @date 2026-02-21
 */

import { getHomepageDataFromDb } from '$lib/data/homepage.provider';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const homepage = await getHomepageDataFromDb();

		return {
			homepage
		};
	} catch (error) {
		console.error('[+page.server.ts] Error loading homepage data:', error);
		throw error;
	}
};
