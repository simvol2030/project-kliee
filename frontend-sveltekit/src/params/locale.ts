import type { ParamMatcher } from '@sveltejs/kit';

const LANGUAGES = ['en', 'ru', 'es', 'zh'];

export const match: ParamMatcher = (param) => {
	return LANGUAGES.includes(param);
};
