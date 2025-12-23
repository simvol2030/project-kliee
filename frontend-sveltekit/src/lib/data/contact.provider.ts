/**
 * Contact Data Provider
 *
 * Abstraction layer for contact page data access.
 * Currently reads from JSON, designed for easy migration to SQLite.
 *
 * @version 1.1
 * @date 2025-12-20
 */

import type {
	ContactData,
	ContactDataLocalized,
	LanguageCode,
	TranslatedString,
	TranslatedArrayString
} from '$lib/types/content.types';
import contactDataRaw from '../../../../data/contact.json';

// Type assertion for imported JSON
const contactData = contactDataRaw as ContactData;

/**
 * Get all contact page data with localized strings
 * @param locale - Language code (en, ru, es, zh)
 * @returns Localized contact page data
 */
export function getContactData(locale: LanguageCode = 'en'): ContactDataLocalized {
	return {
		contact: {
			email: contactData.contact.email,
			socialLinks: contactData.contact.socialLinks,
			studio: {
				city: contactData.contact.studio.city[locale as keyof TranslatedString],
				country: contactData.contact.studio.country[locale as keyof TranslatedString]
			}
		},
		page: {
			hero: {
				title: contactData.page.hero.title[locale as keyof TranslatedString],
				subtitle: contactData.page.hero.subtitle[locale as keyof TranslatedString]
			},
			form: {
				title: contactData.page.form.title[locale as keyof TranslatedString],
				fields: {
					name: {
						label: contactData.page.form.fields.name.label[locale as keyof TranslatedString],
						placeholder: contactData.page.form.fields.name.placeholder[locale as keyof TranslatedString]
					},
					email: {
						label: contactData.page.form.fields.email.label[locale as keyof TranslatedString],
						placeholder: contactData.page.form.fields.email.placeholder[locale as keyof TranslatedString]
					},
					subject: {
						label: contactData.page.form.fields.subject.label[locale as keyof TranslatedString],
						options: contactData.page.form.fields.subject.options[locale as keyof TranslatedArrayString]
					},
					message: {
						label: contactData.page.form.fields.message.label[locale as keyof TranslatedString],
						placeholder: contactData.page.form.fields.message.placeholder[locale as keyof TranslatedString]
					}
				},
				submit: contactData.page.form.submit[locale as keyof TranslatedString],
				success: contactData.page.form.success[locale as keyof TranslatedString],
				error: contactData.page.form.error[locale as keyof TranslatedString]
			}
		},
		seo: {
			title: contactData.seo.title[locale as keyof TranslatedString],
			description: contactData.seo.description[locale as keyof TranslatedString]
		}
	};
}

/**
 * Get form configuration
 * @param locale - Language code
 * @returns Form fields and messages
 */
export function getFormConfig(locale: LanguageCode = 'en') {
	return {
		title: contactData.page.form.title[locale as keyof TranslatedString],
		fields: {
			name: {
				label: contactData.page.form.fields.name.label[locale as keyof TranslatedString],
				placeholder: contactData.page.form.fields.name.placeholder[locale as keyof TranslatedString]
			},
			email: {
				label: contactData.page.form.fields.email.label[locale as keyof TranslatedString],
				placeholder: contactData.page.form.fields.email.placeholder[locale as keyof TranslatedString]
			},
			subject: {
				label: contactData.page.form.fields.subject.label[locale as keyof TranslatedString],
				options: contactData.page.form.fields.subject.options[locale as keyof TranslatedArrayString]
			},
			message: {
				label: contactData.page.form.fields.message.label[locale as keyof TranslatedString],
				placeholder: contactData.page.form.fields.message.placeholder[locale as keyof TranslatedString]
			}
		},
		submit: contactData.page.form.submit[locale as keyof TranslatedString],
		success: contactData.page.form.success[locale as keyof TranslatedString],
		error: contactData.page.form.error[locale as keyof TranslatedString]
	};
}

/**
 * Get contact info (email, social links, studio location)
 * @param locale - Language code
 * @returns Contact information
 */
export function getContactInfo(locale: LanguageCode = 'en') {
	return {
		email: contactData.contact.email,
		socialLinks: contactData.contact.socialLinks,
		studio: {
			city: contactData.contact.studio.city[locale as keyof TranslatedString],
			country: contactData.contact.studio.country[locale as keyof TranslatedString]
		}
	};
}

/**
 * Get page hero content
 * @param locale - Language code
 * @returns Hero title and subtitle
 */
export function getPageHero(locale: LanguageCode = 'en') {
	return {
		title: contactData.page.hero.title[locale as keyof TranslatedString],
		subtitle: contactData.page.hero.subtitle[locale as keyof TranslatedString]
	};
}

/**
 * Get SEO data with localized strings
 * @param locale - Language code
 * @returns SEO title and description
 */
export function getSeoData(locale: LanguageCode = 'en') {
	return {
		title: contactData.seo.title[locale as keyof TranslatedString],
		description: contactData.seo.description[locale as keyof TranslatedString]
	};
}

/**
 * Get contact metadata
 * @returns Contact metadata
 */
export function getContactMetadata() {
	return {
		version: contactData.version,
		lastUpdated: contactData.lastUpdated
	};
}

/**
 * Get email address
 * @returns Email string
 */
export function getEmail(): string {
	return contactData.contact.email;
}

/**
 * Get social links
 * @returns Array of social link objects
 */
export function getSocialLinks() {
	return contactData.contact.socialLinks;
}
