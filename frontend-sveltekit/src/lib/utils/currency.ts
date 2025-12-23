/**
 * Currency utilities for shop module
 */

export interface CurrencyInfo {
	code: string;
	symbol: string;
	rate: number;
	locale: string;
}

export type LanguageCode = 'en' | 'ru' | 'es' | 'zh';

// Language to currency mapping
export const LANG_CURRENCY_MAP: Record<LanguageCode, CurrencyInfo> = {
	en: { code: 'USD', symbol: '$', rate: 1.08, locale: 'en-US' },
	ru: { code: 'RUB', symbol: '₽', rate: 98.5, locale: 'ru-RU' },
	es: { code: 'EUR', symbol: '€', rate: 1.0, locale: 'es-ES' },
	zh: { code: 'CNY', symbol: '¥', rate: 7.85, locale: 'zh-CN' }
};

export interface CurrencyRate {
	to_currency: string;
	rate: string;
}

/**
 * Get currency info for a language, with optional rates override
 */
export function getCurrencyByLang(lang: LanguageCode, rates?: CurrencyRate[]): CurrencyInfo {
	const base = LANG_CURRENCY_MAP[lang] || LANG_CURRENCY_MAP.en;

	if (rates) {
		const rateEntry = rates.find((r) => r.to_currency === base.code);
		if (rateEntry) {
			return { ...base, rate: parseFloat(rateEntry.rate) };
		}
	}

	return base;
}

/**
 * Convert price from EUR to target currency
 */
export function convertPrice(priceEur: number, toCurrency: string, rates: CurrencyRate[]): number {
	const rateEntry = rates.find((r) => r.to_currency === toCurrency);
	const rate = rateEntry ? parseFloat(rateEntry.rate) : 1;
	return Math.round(priceEur * rate);
}

/**
 * Format price in the appropriate currency for the language
 */
export function formatPrice(
	priceEur: number | null | undefined,
	lang: LanguageCode,
	rates?: CurrencyRate[]
): string {
	// Handle null/undefined price
	if (priceEur === null || priceEur === undefined) {
		const priceOnRequest: Record<LanguageCode, string> = {
			en: 'Price on request',
			ru: 'Цена по запросу',
			es: 'Precio a consultar',
			zh: '价格面议'
		};
		return priceOnRequest[lang] || priceOnRequest.en;
	}

	const currency = getCurrencyByLang(lang, rates);
	const convertedPrice = priceEur * currency.rate;

	// Format using Intl.NumberFormat
	const formatter = new Intl.NumberFormat(currency.locale, {
		style: 'currency',
		currency: currency.code,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});

	return formatter.format(convertedPrice);
}

/**
 * Format price without conversion (already in target currency)
 */
export function formatLocalPrice(
	amount: number,
	currencyCode: string,
	locale: string
): string {
	const formatter = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currencyCode,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});

	return formatter.format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(code: string): string {
	const symbols: Record<string, string> = {
		USD: '$',
		EUR: '€',
		RUB: '₽',
		CNY: '¥',
		GBP: '£'
	};
	return symbols[code] || code;
}
