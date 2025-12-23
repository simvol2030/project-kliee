import type { LayoutServerLoad } from './$types';
import type { LanguageCode } from '$lib/types/layout.types';

export const load: LayoutServerLoad = async ({ params }) => {
	// Get language from URL param
	const locale = params.lang as LanguageCode;

	return {
		locale
	};
};
