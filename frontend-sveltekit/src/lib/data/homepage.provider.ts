/**
 * Homepage Data Provider
 * K-LIÉE Artist Portfolio
 *
 * Provides type-safe access to homepage data from JSON file
 * Future migration path: Replace import with database queries
 *
 * @version 1.0
 * @date 2025-11-09
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { HomepageData } from '$lib/types/homepage';

/**
 * Get homepage data from JSON file
 * @returns HomepageData - Complete homepage data with all sections
 * @throws Error if data is invalid
 */
export function getHomepageData(): HomepageData {
	// Read JSON file from static directory
	const jsonPath = join(process.cwd(), 'static', 'data', 'homepage.json');
	const jsonContent = readFileSync(jsonPath, 'utf-8');
	const data = JSON.parse(jsonContent) as HomepageData;

	// Validate that we have the expected structure
	if (!data.pageType || data.pageType !== 'homepage') {
		throw new Error('Invalid homepage data: missing or incorrect pageType');
	}

	if (!data.meta || !data.sections) {
		throw new Error('Invalid homepage data: missing required sections');
	}

	return data;
}

/**
 * Future database implementation example (commented out)
 *
 * import { db } from '$lib/server/db/database';
 * import { homepageSections } from '$lib/server/db/schema';
 *
 * export async function getHomepageData(): Promise<HomepageData> {
 *   const data = await db.select().from(homepageSections).where(...);
 *   return transformToHomepageData(data);
 * }
 */
