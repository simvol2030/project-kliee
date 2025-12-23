/**
 * Contact Page Data Loader
 */

import { getContactData } from '$lib/data/contact.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { locale } = await parent();
	const contact = getContactData(locale as LanguageCode);

	return {
		contact
	};
};
