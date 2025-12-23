import { z } from 'zod';

// Common validation rules
const requiredString = (fieldName: string) =>
	z.string().min(1, `${fieldName} is required`);

const optionalString = z.string().optional().or(z.literal(''));

const positiveNumber = (fieldName: string) =>
	z.number().positive(`${fieldName} must be positive`).or(z.literal(0));

const optionalNumber = z.number().optional().nullable();

const slug = z.string()
	.min(2, 'Slug must be at least 2 characters')
	.max(100, 'Slug must be less than 100 characters')
	.regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

// Artwork schema
export const artworkSchema = z.object({
	title_en: requiredString('Title (English)'),
	title_ru: optionalString,
	title_es: optionalString,
	title_zh: optionalString,
	technique: optionalString,
	series_id: optionalString,
	year: z.coerce.number().min(1800).max(2100).optional().nullable(),
	dimensions: optionalString,
	price: z.coerce.number().min(0).optional().nullable(),
	currency: z.enum(['EUR', 'USD', 'GBP']).default('EUR'),
	is_for_sale: z.boolean().default(true),
	// SEO fields (Phase 3)
	seo_title_en: optionalString,
	seo_title_ru: optionalString,
	seo_title_es: optionalString,
	seo_title_zh: optionalString,
	seo_description_en: optionalString,
	seo_description_ru: optionalString,
	seo_description_es: optionalString,
	seo_description_zh: optionalString
});

export type ArtworkInput = z.infer<typeof artworkSchema>;

// Series schema
export const seriesSchema = z.object({
	slug: slug,
	name_en: requiredString('Name (English)'),
	name_ru: optionalString,
	name_es: optionalString,
	name_zh: optionalString,
	description_en: optionalString,
	description_ru: optionalString,
	description_es: optionalString,
	description_zh: optionalString,
	cover_image_id: z.coerce.number().optional().nullable(),
	order_index: z.coerce.number().min(0).default(0),
	is_visible: z.boolean().default(true),
	is_featured: z.boolean().default(false),
	// Shop category (Phase 5)
	show_in_shop: z.boolean().default(false),
	// SEO
	seo_title_en: optionalString,
	seo_title_ru: optionalString,
	seo_title_es: optionalString,
	seo_title_zh: optionalString,
	seo_description_en: optionalString,
	seo_description_ru: optionalString,
	seo_description_es: optionalString,
	seo_description_zh: optionalString
});

export type SeriesInput = z.infer<typeof seriesSchema>;

// Page schema
export const pageSchema = z.object({
	slug: slug,
	title_en: requiredString('Title (English)'),
	title_ru: optionalString,
	title_es: optionalString,
	title_zh: optionalString,
	content_en: optionalString,
	content_ru: optionalString,
	content_es: optionalString,
	content_zh: optionalString,
	is_published: z.boolean().default(false),
	template: z.string().default('default'),
	seo_title_en: optionalString,
	seo_title_ru: optionalString,
	seo_title_es: optionalString,
	seo_title_zh: optionalString,
	seo_description_en: optionalString,
	seo_description_ru: optionalString,
	seo_description_es: optionalString,
	seo_description_zh: optionalString
});

export type PageInput = z.infer<typeof pageSchema>;

// Exhibition schema
export const exhibitionSchema = z.object({
	slug: slug,
	title_en: requiredString('Title (English)'),
	title_ru: optionalString,
	title_es: optionalString,
	title_zh: optionalString,
	description_en: optionalString,
	description_ru: optionalString,
	description_es: optionalString,
	description_zh: optionalString,
	location_en: optionalString,
	location_ru: optionalString,
	location_es: optionalString,
	location_zh: optionalString,
	start_date: z.string().optional().nullable(),
	end_date: z.string().optional().nullable(),
	is_current: z.boolean().default(false),
	is_visible: z.boolean().default(true),
	cover_image_id: z.coerce.number().optional().nullable(),
	order_index: z.coerce.number().min(0).default(0)
});

export type ExhibitionInput = z.infer<typeof exhibitionSchema>;

// Menu item schema
export const menuItemSchema = z.object({
	menu_id: requiredString('Menu'),
	label_en: requiredString('Label (English)'),
	label_ru: optionalString,
	label_es: optionalString,
	label_zh: optionalString,
	url: z.string().min(1, 'URL is required'),
	parent_id: z.coerce.number().optional().nullable(),
	order_index: z.coerce.number().min(0).default(0),
	is_visible: z.boolean().default(true),
	open_in_new_tab: z.boolean().default(false)
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

// Contact message schema (for validation)
export const contactMessageSchema = z.object({
	name: requiredString('Name'),
	email: z.string().email('Invalid email address'),
	subject: optionalString,
	message: requiredString('Message').min(10, 'Message must be at least 10 characters'),
	phone: optionalString
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

// Media schema
export const mediaSchema = z.object({
	filename: requiredString('Filename'),
	folder: z.string().default('uploads'),
	alt_en: optionalString,
	alt_ru: optionalString,
	alt_es: optionalString,
	alt_zh: optionalString
});

export type MediaInput = z.infer<typeof mediaSchema>;

// Settings schema
export const settingsSchema = z.object({
	key: requiredString('Setting key'),
	value: z.string(),
	type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
	group: z.string().default('general'),
	label: optionalString,
	description: optionalString
});

export type SettingsInput = z.infer<typeof settingsSchema>;
