/**
 * Homepage Data Loader (Server-Side)
 * K-LIÉE Artist Portfolio
 *
 * @version 1.0
 * @date 2025-11-09
 */

import { getHomepageData } from '$lib/data/homepage.provider';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	try {
		// Get homepage data from JSON import
		const homepage = getHomepageData();

		console.log('[+page.server.ts] Homepage data loaded successfully');

		return {
			homepage
		};
	} catch (error) {
		console.error('[+page.server.ts] Error loading homepage data:', error);
		throw error;
	}
};
