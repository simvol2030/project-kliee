/**
 * Static list of countries for checkout form
 * ISO 3166-1 alpha-2 codes with translations
 */

export interface Country {
	code: string;
	name_en: string;
	name_ru: string;
	name_es: string;
	name_zh: string;
}

export const countries: Country[] = [
	// Europe
	{ code: 'AT', name_en: 'Austria', name_ru: 'Австрия', name_es: 'Austria', name_zh: '奥地利' },
	{ code: 'BE', name_en: 'Belgium', name_ru: 'Бельгия', name_es: 'Bélgica', name_zh: '比利时' },
	{ code: 'CH', name_en: 'Switzerland', name_ru: 'Швейцария', name_es: 'Suiza', name_zh: '瑞士' },
	{ code: 'CZ', name_en: 'Czech Republic', name_ru: 'Чехия', name_es: 'República Checa', name_zh: '捷克' },
	{ code: 'DE', name_en: 'Germany', name_ru: 'Германия', name_es: 'Alemania', name_zh: '德国' },
	{ code: 'DK', name_en: 'Denmark', name_ru: 'Дания', name_es: 'Dinamarca', name_zh: '丹麦' },
	{ code: 'ES', name_en: 'Spain', name_ru: 'Испания', name_es: 'España', name_zh: '西班牙' },
	{ code: 'FI', name_en: 'Finland', name_ru: 'Финляндия', name_es: 'Finlandia', name_zh: '芬兰' },
	{ code: 'FR', name_en: 'France', name_ru: 'Франция', name_es: 'Francia', name_zh: '法国' },
	{ code: 'GB', name_en: 'United Kingdom', name_ru: 'Великобритания', name_es: 'Reino Unido', name_zh: '英国' },
	{ code: 'GR', name_en: 'Greece', name_ru: 'Греция', name_es: 'Grecia', name_zh: '希腊' },
	{ code: 'HU', name_en: 'Hungary', name_ru: 'Венгрия', name_es: 'Hungría', name_zh: '匈牙利' },
	{ code: 'IE', name_en: 'Ireland', name_ru: 'Ирландия', name_es: 'Irlanda', name_zh: '爱尔兰' },
	{ code: 'IT', name_en: 'Italy', name_ru: 'Италия', name_es: 'Italia', name_zh: '意大利' },
	{ code: 'LU', name_en: 'Luxembourg', name_ru: 'Люксембург', name_es: 'Luxemburgo', name_zh: '卢森堡' },
	{ code: 'NL', name_en: 'Netherlands', name_ru: 'Нидерланды', name_es: 'Países Bajos', name_zh: '荷兰' },
	{ code: 'NO', name_en: 'Norway', name_ru: 'Норвегия', name_es: 'Noruega', name_zh: '挪威' },
	{ code: 'PL', name_en: 'Poland', name_ru: 'Польша', name_es: 'Polonia', name_zh: '波兰' },
	{ code: 'PT', name_en: 'Portugal', name_ru: 'Португалия', name_es: 'Portugal', name_zh: '葡萄牙' },
	{ code: 'SE', name_en: 'Sweden', name_ru: 'Швеция', name_es: 'Suecia', name_zh: '瑞典' },

	// Americas
	{ code: 'AR', name_en: 'Argentina', name_ru: 'Аргентина', name_es: 'Argentina', name_zh: '阿根廷' },
	{ code: 'BR', name_en: 'Brazil', name_ru: 'Бразилия', name_es: 'Brasil', name_zh: '巴西' },
	{ code: 'CA', name_en: 'Canada', name_ru: 'Канада', name_es: 'Canadá', name_zh: '加拿大' },
	{ code: 'CL', name_en: 'Chile', name_ru: 'Чили', name_es: 'Chile', name_zh: '智利' },
	{ code: 'CO', name_en: 'Colombia', name_ru: 'Колумбия', name_es: 'Colombia', name_zh: '哥伦比亚' },
	{ code: 'MX', name_en: 'Mexico', name_ru: 'Мексика', name_es: 'México', name_zh: '墨西哥' },
	{ code: 'US', name_en: 'United States', name_ru: 'США', name_es: 'Estados Unidos', name_zh: '美国' },

	// Asia
	{ code: 'AE', name_en: 'United Arab Emirates', name_ru: 'ОАЭ', name_es: 'Emiratos Árabes Unidos', name_zh: '阿联酋' },
	{ code: 'CN', name_en: 'China', name_ru: 'Китай', name_es: 'China', name_zh: '中国' },
	{ code: 'HK', name_en: 'Hong Kong', name_ru: 'Гонконг', name_es: 'Hong Kong', name_zh: '香港' },
	{ code: 'IL', name_en: 'Israel', name_ru: 'Израиль', name_es: 'Israel', name_zh: '以色列' },
	{ code: 'IN', name_en: 'India', name_ru: 'Индия', name_es: 'India', name_zh: '印度' },
	{ code: 'JP', name_en: 'Japan', name_ru: 'Япония', name_es: 'Japón', name_zh: '日本' },
	{ code: 'KR', name_en: 'South Korea', name_ru: 'Южная Корея', name_es: 'Corea del Sur', name_zh: '韩国' },
	{ code: 'SG', name_en: 'Singapore', name_ru: 'Сингапур', name_es: 'Singapur', name_zh: '新加坡' },
	{ code: 'TW', name_en: 'Taiwan', name_ru: 'Тайвань', name_es: 'Taiwán', name_zh: '台湾' },

	// Oceania
	{ code: 'AU', name_en: 'Australia', name_ru: 'Австралия', name_es: 'Australia', name_zh: '澳大利亚' },
	{ code: 'NZ', name_en: 'New Zealand', name_ru: 'Новая Зеландия', name_es: 'Nueva Zelanda', name_zh: '新西兰' },

	// Russia & CIS
	{ code: 'BY', name_en: 'Belarus', name_ru: 'Беларусь', name_es: 'Bielorrusia', name_zh: '白俄罗斯' },
	{ code: 'KZ', name_en: 'Kazakhstan', name_ru: 'Казахстан', name_es: 'Kazajistán', name_zh: '哈萨克斯坦' },
	{ code: 'RU', name_en: 'Russia', name_ru: 'Россия', name_es: 'Rusia', name_zh: '俄罗斯' },
	{ code: 'UA', name_en: 'Ukraine', name_ru: 'Украина', name_es: 'Ucrania', name_zh: '乌克兰' }
];

export type LanguageCode = 'en' | 'ru' | 'es' | 'zh';

/**
 * Get country name in specified language
 */
export function getCountryName(code: string, lang: LanguageCode): string {
	const country = countries.find((c) => c.code === code);
	if (!country) return code;

	switch (lang) {
		case 'ru':
			return country.name_ru;
		case 'es':
			return country.name_es;
		case 'zh':
			return country.name_zh;
		default:
			return country.name_en;
	}
}

/**
 * Get countries sorted by name in specified language
 */
export function getCountriesSorted(lang: LanguageCode): Country[] {
	return [...countries].sort((a, b) => {
		const nameA = getCountryName(a.code, lang);
		const nameB = getCountryName(b.code, lang);
		return nameA.localeCompare(nameB, lang);
	});
}
