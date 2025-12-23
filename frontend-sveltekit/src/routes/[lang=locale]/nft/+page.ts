/**
 * NFT Page Data Loader
 */

import { getNftData } from '$lib/data/nft.provider';
import type { LanguageCode } from '$lib/types/layout.types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { locale } = await parent();
	const nft = getNftData(locale as LanguageCode);

	return {
		nft
	};
};
