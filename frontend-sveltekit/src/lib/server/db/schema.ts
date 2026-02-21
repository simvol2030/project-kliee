import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================
// EXISTING TABLES (PRESERVED!)
// ============================================

/**
 * Users table - публичные пользователи системы
 */
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

/**
 * Posts table - посты блога
 */
export const posts = sqliteTable('blog_posts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	user_id: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	content: text('content'),
	published: integer('published', { mode: 'boolean' }).default(false).notNull(),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

/**
 * Admins table - административные пользователи с аутентификацией
 */
export const admins = sqliteTable('admins', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	role: text('role', { enum: ['super-admin', 'editor', 'viewer'] })
		.notNull()
		.default('viewer'),
	name: text('name').notNull(),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ============================================
// MEDIA LIBRARY
// ============================================

/**
 * Media - загруженные изображения
 */
export const media = sqliteTable('media', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	filename: text('filename').notNull(),
	stored_filename: text('stored_filename').notNull().unique(),
	mime_type: text('mime_type').notNull(),
	size: integer('size').notNull(),
	width: integer('width'),
	height: integer('height'),
	alt_en: text('alt_en'),
	alt_ru: text('alt_ru'),
	alt_es: text('alt_es'),
	alt_zh: text('alt_zh'),
	folder: text('folder').default('uploads'),
	file_hash: text('file_hash'), // MD5 hash for duplicate detection
	uploaded_at: text('uploaded_at').default(sql`CURRENT_TIMESTAMP`),
	uploaded_by: integer('uploaded_by').references(() => admins.id)
});

/**
 * Media Thumbnails - оптимизированные версии изображений
 */
export const mediaThumbnails = sqliteTable('media_thumbnails', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	media_id: integer('media_id')
		.notNull()
		.references(() => media.id, { onDelete: 'cascade' }),
	size_name: text('size_name').notNull(),
	width: integer('width').notNull(),
	height: integer('height').notNull(),
	stored_filename: text('stored_filename').notNull()
});

// ============================================
// NAVIGATION
// ============================================

/**
 * Menu Items - пункты навигации
 */
export const menuItems = sqliteTable('menu_items', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	href: text('href').notNull(),
	label_en: text('label_en').notNull(),
	label_ru: text('label_ru').notNull(),
	label_es: text('label_es').notNull(),
	label_zh: text('label_zh').notNull(),
	parent_id: integer('parent_id'),
	has_dropdown: integer('has_dropdown', { mode: 'boolean' }).default(false),
	order_index: integer('order_index').notNull().default(0),
	icon: text('icon'),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// ============================================
// FOOTER
// ============================================

/**
 * Footer Brand - бренд в футере
 */
export const footerBrand = sqliteTable('footer_brand', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	subtitle_en: text('subtitle_en'),
	subtitle_ru: text('subtitle_ru'),
	subtitle_es: text('subtitle_es'),
	subtitle_zh: text('subtitle_zh'),
	quote_en: text('quote_en'),
	quote_ru: text('quote_ru'),
	quote_es: text('quote_es'),
	quote_zh: text('quote_zh')
});

/**
 * Footer Social Links - ссылки на соцсети
 */
export const footerSocialLinks = sqliteTable('footer_social_links', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	platform: text('platform').notNull(),
	label: text('label').notNull(),
	badge: text('badge'),
	url: text('url').notNull(),
	icon: text('icon').notNull(),
	order_index: integer('order_index').default(0),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

/**
 * Footer Contact - контактная информация
 */
export const footerContact = sqliteTable('footer_contact', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title_en: text('title_en'),
	title_ru: text('title_ru'),
	title_es: text('title_es'),
	title_zh: text('title_zh'),
	email: text('email'),
	phone: text('phone')
});

// ============================================
// HOMEPAGE
// ============================================

/**
 * Homepage Hero - главный баннер
 */
export const homepageHero = sqliteTable('homepage_hero', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title_en: text('title_en').notNull(),
	title_ru: text('title_ru').notNull(),
	title_es: text('title_es').notNull(),
	title_zh: text('title_zh').notNull(),
	subtitle_en: text('subtitle_en'),
	subtitle_ru: text('subtitle_ru'),
	subtitle_es: text('subtitle_es'),
	subtitle_zh: text('subtitle_zh'),
	quote_en: text('quote_en'),
	quote_ru: text('quote_ru'),
	quote_es: text('quote_es'),
	quote_zh: text('quote_zh'),
	announcement_highlight_en: text('announcement_highlight_en'),
	announcement_highlight_ru: text('announcement_highlight_ru'),
	announcement_highlight_es: text('announcement_highlight_es'),
	announcement_highlight_zh: text('announcement_highlight_zh'),
	announcement_text_en: text('announcement_text_en'),
	announcement_text_ru: text('announcement_text_ru'),
	announcement_text_es: text('announcement_text_es'),
	announcement_text_zh: text('announcement_text_zh'),
	announcement_link: text('announcement_link')
});

/**
 * Hero Slides - слайды баннера
 */
export const heroSlides = sqliteTable('hero_slides', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	hero_id: integer('hero_id').references(() => homepageHero.id, { onDelete: 'cascade' }),
	media_id: integer('media_id').references(() => media.id),
	alt_en: text('alt_en'),
	alt_ru: text('alt_ru'),
	alt_es: text('alt_es'),
	alt_zh: text('alt_zh'),
	duration: integer('duration').default(4000),
	order_index: integer('order_index').default(0),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

/**
 * Homepage Sections - секции главной страницы (общие)
 */
export const homepageSections = sqliteTable('homepage_sections', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	section_type: text('section_type').notNull(),
	title_en: text('title_en'),
	title_ru: text('title_ru'),
	title_es: text('title_es'),
	title_zh: text('title_zh'),
	subtitle_en: text('subtitle_en'),
	subtitle_ru: text('subtitle_ru'),
	subtitle_es: text('subtitle_es'),
	subtitle_zh: text('subtitle_zh'),
	content_json: text('content_json'),
	order_index: integer('order_index').default(0),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

/**
 * Homepage About Preview - превью секции "О художнике"
 */
export const homepageAbout = sqliteTable('homepage_about', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title_en: text('title_en'),
	title_ru: text('title_ru'),
	title_es: text('title_es'),
	title_zh: text('title_zh'),
	text_en: text('text_en'),
	text_ru: text('text_ru'),
	text_es: text('text_es'),
	text_zh: text('text_zh'),
	image_id: integer('image_id').references(() => media.id),
	cta_text_en: text('cta_text_en'),
	cta_text_ru: text('cta_text_ru'),
	cta_text_es: text('cta_text_es'),
	cta_text_zh: text('cta_text_zh'),
	cta_href: text('cta_href')
});

/**
 * Homepage News - новости на главной
 */
export const homepageNews = sqliteTable('homepage_news', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title_en: text('title_en'),
	title_ru: text('title_ru'),
	title_es: text('title_es'),
	title_zh: text('title_zh'),
	excerpt_en: text('excerpt_en'),
	excerpt_ru: text('excerpt_ru'),
	excerpt_es: text('excerpt_es'),
	excerpt_zh: text('excerpt_zh'),
	image_id: integer('image_id').references(() => media.id),
	link: text('link'),
	date: text('date'),
	order_index: integer('order_index').default(0),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

/**
 * Homepage Testimonials - отзывы
 */
export const homepageTestimonials = sqliteTable('homepage_testimonials', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	quote_en: text('quote_en'),
	quote_ru: text('quote_ru'),
	quote_es: text('quote_es'),
	quote_zh: text('quote_zh'),
	author: text('author'),
	role_en: text('role_en'),
	role_ru: text('role_ru'),
	role_es: text('role_es'),
	role_zh: text('role_zh'),
	avatar_id: integer('avatar_id').references(() => media.id),
	order_index: integer('order_index').default(0),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

/**
 * Homepage Process - этапы творческого процесса
 */
export const homepageProcess = sqliteTable('homepage_process', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title_en: text('title_en'),
	title_ru: text('title_ru'),
	title_es: text('title_es'),
	title_zh: text('title_zh'),
	description_en: text('description_en'),
	description_ru: text('description_ru'),
	description_es: text('description_es'),
	description_zh: text('description_zh'),
	icon: text('icon'),
	image_id: integer('image_id').references(() => media.id),
	step_number: integer('step_number'),
	order_index: integer('order_index').default(0),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

/**
 * Homepage Featured Collections - коллекции на главной странице
 */
export const homepageFeaturedCollections = sqliteTable('homepage_featured_collections', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	series_id: text('series_id').references(() => series.id, { onDelete: 'cascade' }),
	title_override_en: text('title_override_en'),
	title_override_ru: text('title_override_ru'),
	title_override_es: text('title_override_es'),
	title_override_zh: text('title_override_zh'),
	description_override_en: text('description_override_en'),
	description_override_ru: text('description_override_ru'),
	description_override_es: text('description_override_es'),
	description_override_zh: text('description_override_zh'),
	cover_image_id: integer('cover_image_id').references(() => media.id),
	link: text('link'),
	order_index: integer('order_index').default(0),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

// ============================================
// SERIES (Collections)
// ============================================

/**
 * Series - коллекции работ
 */
export const series = sqliteTable('series', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name_en: text('name_en').notNull(),
	name_ru: text('name_ru').notNull(),
	name_es: text('name_es').notNull(),
	name_zh: text('name_zh').notNull(),
	description_en: text('description_en'),
	description_ru: text('description_ru'),
	description_es: text('description_es'),
	description_zh: text('description_zh'),
	cover_image_id: integer('cover_image_id').references(() => media.id),
	order_index: integer('order_index').default(0),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
	is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
	show_in_shop: integer('show_in_shop', { mode: 'boolean' }).default(false),
	seo_title_en: text('seo_title_en'),
	seo_title_ru: text('seo_title_ru'),
	seo_title_es: text('seo_title_es'),
	seo_title_zh: text('seo_title_zh'),
	seo_description_en: text('seo_description_en'),
	seo_description_ru: text('seo_description_ru'),
	seo_description_es: text('seo_description_es'),
	seo_description_zh: text('seo_description_zh'),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Works Page Config - настройки страницы /works
 */
export const worksPage = sqliteTable('works_page', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title_en: text('title_en'),
	title_ru: text('title_ru'),
	title_es: text('title_es'),
	title_zh: text('title_zh'),
	description_en: text('description_en'),
	description_ru: text('description_ru'),
	description_es: text('description_es'),
	description_zh: text('description_zh'),
	seo_title_en: text('seo_title_en'),
	seo_title_ru: text('seo_title_ru'),
	seo_title_es: text('seo_title_es'),
	seo_title_zh: text('seo_title_zh'),
	seo_description_en: text('seo_description_en'),
	seo_description_ru: text('seo_description_ru'),
	seo_description_es: text('seo_description_es'),
	seo_description_zh: text('seo_description_zh')
});

// ============================================
// ARTWORKS
// ============================================

/**
 * Artworks - произведения искусства
 */
export const artworks = sqliteTable('artworks', {
	id: text('id').primaryKey(),
	slug: text('slug').unique(),
	series_id: text('series_id').references(() => series.id),
	title_en: text('title_en').notNull(),
	title_ru: text('title_ru').notNull(),
	title_es: text('title_es').notNull(),
	title_zh: text('title_zh').notNull(),
	description_en: text('description_en'),
	description_ru: text('description_ru'),
	description_es: text('description_es'),
	description_zh: text('description_zh'),
	technique: text('technique'),
	dimensions: text('dimensions'),
	year: integer('year'),
	price: integer('price'),
	currency: text('currency').default('EUR'),
	is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
	is_for_sale: integer('is_for_sale', { mode: 'boolean' }).default(true),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
	order_index: integer('order_index').default(0),
	// SEO fields
	seo_title_en: text('seo_title_en'),
	seo_title_ru: text('seo_title_ru'),
	seo_title_es: text('seo_title_es'),
	seo_title_zh: text('seo_title_zh'),
	seo_description_en: text('seo_description_en'),
	seo_description_ru: text('seo_description_ru'),
	seo_description_es: text('seo_description_es'),
	seo_description_zh: text('seo_description_zh'),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Artwork Images - изображения работ
 */
export const artworkImages = sqliteTable('artwork_images', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	artwork_id: text('artwork_id')
		.notNull()
		.references(() => artworks.id, { onDelete: 'cascade' }),
	media_id: integer('media_id')
		.notNull()
		.references(() => media.id),
	is_primary: integer('is_primary', { mode: 'boolean' }).default(false),
	order_index: integer('order_index').default(0)
});

// ============================================
// EXHIBITIONS
// ============================================

/**
 * Exhibitions - выставки
 */
export const exhibitions = sqliteTable('exhibitions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').unique(),
	type: text('type', { enum: ['solo', 'group', 'fair', 'biennale', 'other'] }).default('solo'),
	year: integer('year'),
	title_en: text('title_en').notNull(),
	title_ru: text('title_ru').notNull(),
	title_es: text('title_es').notNull(),
	title_zh: text('title_zh').notNull(),
	description_en: text('description_en'),
	description_ru: text('description_ru'),
	description_es: text('description_es'),
	description_zh: text('description_zh'),
	venue_en: text('venue_en'),
	venue_ru: text('venue_ru'),
	venue_es: text('venue_es'),
	venue_zh: text('venue_zh'),
	city: text('city'),
	country: text('country'),
	address: text('address'),
	start_date: text('start_date'),
	end_date: text('end_date'),
	opening_hours: text('opening_hours'),
	cover_image_id: integer('cover_image_id').references(() => media.id),
	gallery_link: text('gallery_link'),
	is_current: integer('is_current', { mode: 'boolean' }).default(false),
	is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
	is_homepage_featured: integer('is_homepage_featured', { mode: 'boolean' }).default(false),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
	order_index: integer('order_index').default(0),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Exhibition Artworks - работы на выставках
 */
export const exhibitionArtworks = sqliteTable('exhibition_artworks', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	exhibition_id: integer('exhibition_id')
		.notNull()
		.references(() => exhibitions.id, { onDelete: 'cascade' }),
	artwork_id: text('artwork_id')
		.notNull()
		.references(() => artworks.id),
	order_index: integer('order_index').default(0)
});

/**
 * Exhibition Images - изображения выставок (галерея)
 */
export const exhibitionImages = sqliteTable('exhibition_images', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	exhibition_id: integer('exhibition_id')
		.notNull()
		.references(() => exhibitions.id, { onDelete: 'cascade' }),
	media_id: integer('media_id')
		.notNull()
		.references(() => media.id),
	caption_en: text('caption_en'),
	caption_ru: text('caption_ru'),
	caption_es: text('caption_es'),
	caption_zh: text('caption_zh'),
	order_index: integer('order_index').default(0)
});

// ============================================
// PAGES (Static + Dynamic via Page Builder)
// ============================================

/**
 * Pages - статические и динамические страницы
 */
export const pages = sqliteTable('pages', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	page_type: text('page_type').default('static'),
	template: text('template').default('default'),
	title_en: text('title_en').notNull(),
	title_ru: text('title_ru').notNull(),
	title_es: text('title_es').notNull(),
	title_zh: text('title_zh').notNull(),
	content_en: text('content_en'),
	content_ru: text('content_ru'),
	content_es: text('content_es'),
	content_zh: text('content_zh'),
	seo_title_en: text('seo_title_en'),
	seo_title_ru: text('seo_title_ru'),
	seo_title_es: text('seo_title_es'),
	seo_title_zh: text('seo_title_zh'),
	seo_description_en: text('seo_description_en'),
	seo_description_ru: text('seo_description_ru'),
	seo_description_es: text('seo_description_es'),
	seo_description_zh: text('seo_description_zh'),
	featured_image_id: integer('featured_image_id').references(() => media.id),
	is_published: integer('is_published', { mode: 'boolean' }).default(true),
	is_in_menu: integer('is_in_menu', { mode: 'boolean' }).default(false),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Page Blocks - блоки страниц для Page Builder
 */
export const pageBlocks = sqliteTable('page_blocks', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	page_id: integer('page_id')
		.notNull()
		.references(() => pages.id, { onDelete: 'cascade' }),
	block_type: text('block_type').notNull(),
	content_en: text('content_en'),
	content_ru: text('content_ru'),
	content_es: text('content_es'),
	content_zh: text('content_zh'),
	settings_json: text('settings_json'),
	media_id: integer('media_id').references(() => media.id),
	order_index: integer('order_index').default(0),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

// ============================================
// CONTACT SOCIAL LINKS
// ============================================

/**
 * Contact Social Links - ссылки на соцсети для страницы контактов
 */
export const contactSocialLinks = sqliteTable('contact_social_links', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	platform: text('platform').notNull(),
	label: text('label').notNull(),
	url: text('url').notNull(),
	order_index: integer('order_index').default(0),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

// ============================================
// SETTINGS (Global)
// ============================================

/**
 * Settings - глобальные настройки
 */
export const settings = sqliteTable('settings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	key: text('key').notNull().unique(),
	value: text('value'),
	type: text('type').default('string'),
	group: text('group').default('general')
});

// ============================================
// SHOP MODULE
// ============================================

/**
 * Currency Rates - курсы валют (EUR = базовая)
 */
export const currencyRates = sqliteTable('currency_rates', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	from_currency: text('from_currency').notNull().default('EUR'),
	to_currency: text('to_currency').notNull(),
	rate: text('rate').notNull(), // stored as string to preserve precision
	updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Shop Settings - настройки магазина
 */
export const shopSettings = sqliteTable('shop_settings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	key: text('key').notNull().unique(),
	value: text('value'),
	type: text('type').default('string') // string, boolean, number, json
});

/**
 * Cart Sessions - сессии корзины
 */
export const cartSessions = sqliteTable('cart_sessions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	session_id: text('session_id').notNull().unique(),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
	expires_at: text('expires_at').notNull()
});

/**
 * Cart Items - товары в корзине
 * Updated: now uses product_id (shop_products) instead of artwork_id
 */
export const cartItems = sqliteTable('cart_items', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	session_id: text('session_id')
		.notNull()
		.references(() => cartSessions.session_id, { onDelete: 'cascade' }),
	product_id: integer('product_id')
		.notNull()
		.references(() => shopProducts.id, { onDelete: 'cascade' }),
	price_eur_snapshot: integer('price_eur_snapshot'), // price at time of adding
	added_at: text('added_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Orders - заказы
 */
export const orders = sqliteTable('orders', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	order_number: text('order_number').notNull().unique(),
	status: text('status', {
		enum: ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled']
	})
		.notNull()
		.default('pending'),
	lang: text('lang').default('en'),
	customer_name: text('customer_name').notNull(),
	customer_email: text('customer_email').notNull(),
	customer_phone: text('customer_phone'),
	shipping_country: text('shipping_country').notNull(),
	shipping_city: text('shipping_city').notNull(),
	shipping_address: text('shipping_address').notNull(),
	shipping_postal: text('shipping_postal').notNull(),
	note: text('note'),
	admin_note: text('admin_note'),
	subtotal_eur: integer('subtotal_eur').notNull(),
	currency_code: text('currency_code').notNull(),
	currency_rate: text('currency_rate').notNull(),
	total_local: integer('total_local').notNull(),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Order Items - товары в заказе
 */
export const orderItems = sqliteTable('order_items', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	order_id: integer('order_id')
		.notNull()
		.references(() => orders.id, { onDelete: 'cascade' }),
	artwork_id: text('artwork_id')
		.notNull()
		.references(() => artworks.id),
	price_eur: integer('price_eur').notNull(),
	title_snapshot: text('title_snapshot').notNull()
});

/**
 * Order Status History - история статусов заказа
 */
export const orderStatusHistory = sqliteTable('order_status_history', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	order_id: integer('order_id')
		.notNull()
		.references(() => orders.id, { onDelete: 'cascade' }),
	status: text('status').notNull(),
	changed_at: text('changed_at').default(sql`CURRENT_TIMESTAMP`),
	changed_by: integer('changed_by').references(() => admins.id)
});

/**
 * Shop Products - товары магазина (отдельно от artworks для гибкости)
 */
export const shopProducts = sqliteTable('shop_products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	artwork_id: text('artwork_id').references(() => artworks.id, { onDelete: 'set null' }),
	sku: text('sku').unique(),
	title_en: text('title_en').notNull(),
	title_ru: text('title_ru').notNull(),
	title_es: text('title_es').notNull(),
	title_zh: text('title_zh').notNull(),
	description_en: text('description_en'),
	description_ru: text('description_ru'),
	description_es: text('description_es'),
	description_zh: text('description_zh'),
	price_eur: integer('price_eur').notNull(),
	compare_price_eur: integer('compare_price_eur'),
	stock_quantity: integer('stock_quantity').default(1),
	is_unlimited: integer('is_unlimited', { mode: 'boolean' }).default(true),
	shipping_class: text('shipping_class', { enum: ['standard', 'fragile', 'oversized'] }).default('standard'),
	weight_kg: text('weight_kg'),
	dimensions_cm: text('dimensions_cm'),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
	is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
	order_index: integer('order_index').default(0),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Shop Product Images - изображения товаров (если не связан с artwork)
 */
export const shopProductImages = sqliteTable('shop_product_images', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	product_id: integer('product_id')
		.notNull()
		.references(() => shopProducts.id, { onDelete: 'cascade' }),
	media_id: integer('media_id')
		.notNull()
		.references(() => media.id),
	is_primary: integer('is_primary', { mode: 'boolean' }).default(false),
	order_index: integer('order_index').default(0)
});

// ============================================
// NFT MODULE
// ============================================

/**
 * NFTs - цифровые произведения
 */
export const nfts = sqliteTable('nfts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	title_en: text('title_en').notNull(),
	title_ru: text('title_ru').notNull(),
	title_es: text('title_es').notNull(),
	title_zh: text('title_zh').notNull(),
	description_en: text('description_en').notNull(),
	description_ru: text('description_ru').notNull(),
	description_es: text('description_es').notNull(),
	description_zh: text('description_zh').notNull(),
	image_id: integer('image_id')
		.notNull()
		.references(() => media.id),
	video_id: integer('video_id')
		.references(() => media.id), // Optional - for uploaded videos
	video_url: text('video_url'), // Optional - for external URLs (YouTube, Vimeo)
	technique: text('technique'),
	year: integer('year'),
	price: text('price'), // String for crypto prices
	currency: text('currency').default('ETH'),
	opensea_url: text('opensea_url'),
	blockchain: text('blockchain').default('Ethereum'),
	is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
	is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
	order_index: integer('order_index').default(0),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// ============================================
// ABOUT MODULE
// ============================================

/**
 * About Artist - информация о художнике (singleton)
 */
export const aboutArtist = sqliteTable('about_artist', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	image_id: integer('image_id').references(() => media.id),
	nationality: text('nationality'),
	based_in: text('based_in'),
	biography_en: text('biography_en'),
	biography_ru: text('biography_ru'),
	biography_es: text('biography_es'),
	biography_zh: text('biography_zh'),
	seo_title_en: text('seo_title_en'),
	seo_title_ru: text('seo_title_ru'),
	seo_title_es: text('seo_title_es'),
	seo_title_zh: text('seo_title_zh'),
	seo_description_en: text('seo_description_en'),
	seo_description_ru: text('seo_description_ru'),
	seo_description_es: text('seo_description_es'),
	seo_description_zh: text('seo_description_zh'),
	updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * About Education - образование
 */
export const aboutEducation = sqliteTable('about_education', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	year: text('year'), // Text for ranges like "2015-2019"
	degree_en: text('degree_en'),
	degree_ru: text('degree_ru'),
	degree_es: text('degree_es'),
	degree_zh: text('degree_zh'),
	institution_en: text('institution_en'),
	institution_ru: text('institution_ru'),
	institution_es: text('institution_es'),
	institution_zh: text('institution_zh'),
	order_index: integer('order_index').default(0)
});

/**
 * About Awards - награды
 */
export const aboutAwards = sqliteTable('about_awards', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	year: text('year'),
	title_en: text('title_en'),
	title_ru: text('title_ru'),
	title_es: text('title_es'),
	title_zh: text('title_zh'),
	organization_en: text('organization_en'),
	organization_ru: text('organization_ru'),
	organization_es: text('organization_es'),
	organization_zh: text('organization_zh'),
	order_index: integer('order_index').default(0)
});

/**
 * About Residencies - резиденции
 */
export const aboutResidencies = sqliteTable('about_residencies', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	year: text('year'),
	location_en: text('location_en'),
	location_ru: text('location_ru'),
	location_es: text('location_es'),
	location_zh: text('location_zh'),
	order_index: integer('order_index').default(0)
});

// ============================================
// CHATBOT MODULE (AI Consultant "Melena")
// ============================================

/**
 * Chatbot Settings - настройки AI-консультанта (singleton)
 */
export const chatbotSettings = sqliteTable('chatbot_settings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	api_key: text('api_key'), // OpenRouter API key (overrides env)
	system_prompt: text('system_prompt').notNull(),
	model: text('model').notNull().default('anthropic/claude-3-haiku'),
	temperature: text('temperature').default('0.7'),
	max_tokens: integer('max_tokens').default(1024),
	greeting_en: text('greeting_en'),
	greeting_ru: text('greeting_ru'),
	greeting_es: text('greeting_es'),
	greeting_zh: text('greeting_zh'),
	avatar_url: text('avatar_url'), // Avatar image URL for chat widget
	is_enabled: integer('is_enabled', { mode: 'boolean' }).default(true),
	updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Chat FAQ - база знаний для grounding
 */
export const chatFaq = sqliteTable('chat_faq', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	question_en: text('question_en').notNull(),
	question_ru: text('question_ru'),
	question_es: text('question_es'),
	question_zh: text('question_zh'),
	answer_en: text('answer_en').notNull(),
	answer_ru: text('answer_ru'),
	answer_es: text('answer_es'),
	answer_zh: text('answer_zh'),
	keywords: text('keywords'), // JSON array for search
	is_active: integer('is_active', { mode: 'boolean' }).default(true),
	order_index: integer('order_index').default(0),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Chatbot Sessions - сессии чата с посетителями
 */
export const chatbotSessions = sqliteTable('chatbot_sessions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	session_id: text('session_id').notNull().unique(),
	visitor_id: text('visitor_id'),
	lang: text('lang').default('en'),
	started_at: text('started_at').default(sql`CURRENT_TIMESTAMP`),
	last_message_at: text('last_message_at'),
	is_saved: integer('is_saved', { mode: 'boolean' }).default(false),
	admin_note: text('admin_note')
});

/**
 * Chatbot Messages - сообщения в чате
 */
export const chatbotMessages = sqliteTable('chatbot_messages', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	session_id: text('session_id')
		.notNull()
		.references(() => chatbotSessions.session_id, { onDelete: 'cascade' }),
	role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
	content: text('content').notNull(),
	tokens_used: integer('tokens_used'),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// ============================================
// TypeScript Types
// ============================================

// Existing
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;

// Media
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type MediaThumbnail = typeof mediaThumbnails.$inferSelect;
export type NewMediaThumbnail = typeof mediaThumbnails.$inferInsert;

// Navigation
export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;

// Footer
export type FooterBrand = typeof footerBrand.$inferSelect;
export type NewFooterBrand = typeof footerBrand.$inferInsert;
export type FooterSocialLink = typeof footerSocialLinks.$inferSelect;
export type NewFooterSocialLink = typeof footerSocialLinks.$inferInsert;
export type FooterContact = typeof footerContact.$inferSelect;
export type NewFooterContact = typeof footerContact.$inferInsert;

// Homepage
export type HomepageHero = typeof homepageHero.$inferSelect;
export type NewHomepageHero = typeof homepageHero.$inferInsert;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type NewHeroSlide = typeof heroSlides.$inferInsert;
export type HomepageSection = typeof homepageSections.$inferSelect;
export type NewHomepageSection = typeof homepageSections.$inferInsert;
export type HomepageAbout = typeof homepageAbout.$inferSelect;
export type NewHomepageAbout = typeof homepageAbout.$inferInsert;
export type HomepageNewsItem = typeof homepageNews.$inferSelect;
export type NewHomepageNewsItem = typeof homepageNews.$inferInsert;
export type HomepageTestimonial = typeof homepageTestimonials.$inferSelect;
export type NewHomepageTestimonial = typeof homepageTestimonials.$inferInsert;
export type HomepageProcessStep = typeof homepageProcess.$inferSelect;
export type NewHomepageProcessStep = typeof homepageProcess.$inferInsert;

// Series
export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
export type WorksPageConfig = typeof worksPage.$inferSelect;
export type NewWorksPageConfig = typeof worksPage.$inferInsert;

// Artworks
export type Artwork = typeof artworks.$inferSelect;
export type NewArtwork = typeof artworks.$inferInsert;
export type ArtworkImage = typeof artworkImages.$inferSelect;
export type NewArtworkImage = typeof artworkImages.$inferInsert;

// Exhibitions
export type Exhibition = typeof exhibitions.$inferSelect;
export type NewExhibition = typeof exhibitions.$inferInsert;
export type ExhibitionArtwork = typeof exhibitionArtworks.$inferSelect;
export type NewExhibitionArtwork = typeof exhibitionArtworks.$inferInsert;

// Pages
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type PageBlock = typeof pageBlocks.$inferSelect;
export type NewPageBlock = typeof pageBlocks.$inferInsert;

// Settings
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

// Shop Module
export type CurrencyRate = typeof currencyRates.$inferSelect;
export type NewCurrencyRate = typeof currencyRates.$inferInsert;
export type ShopSetting = typeof shopSettings.$inferSelect;
export type NewShopSetting = typeof shopSettings.$inferInsert;
export type CartSession = typeof cartSessions.$inferSelect;
export type NewCartSession = typeof cartSessions.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderStatusHistoryItem = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistoryItem = typeof orderStatusHistory.$inferInsert;

// Shop Products
export type ShopProduct = typeof shopProducts.$inferSelect;
export type NewShopProduct = typeof shopProducts.$inferInsert;
export type ShopProductImage = typeof shopProductImages.$inferSelect;
export type NewShopProductImage = typeof shopProductImages.$inferInsert;

// Exhibition Images
export type ExhibitionImage = typeof exhibitionImages.$inferSelect;
export type NewExhibitionImage = typeof exhibitionImages.$inferInsert;

// NFT
export type Nft = typeof nfts.$inferSelect;
export type NewNft = typeof nfts.$inferInsert;

// About
export type AboutArtist = typeof aboutArtist.$inferSelect;
export type NewAboutArtist = typeof aboutArtist.$inferInsert;
export type AboutEducation = typeof aboutEducation.$inferSelect;
export type NewAboutEducation = typeof aboutEducation.$inferInsert;
export type AboutAward = typeof aboutAwards.$inferSelect;
export type NewAboutAward = typeof aboutAwards.$inferInsert;
export type AboutResidency = typeof aboutResidencies.$inferSelect;
export type NewAboutResidency = typeof aboutResidencies.$inferInsert;

// Contact Social Links
export type ContactSocialLink = typeof contactSocialLinks.$inferSelect;
export type NewContactSocialLink = typeof contactSocialLinks.$inferInsert;

// Chatbot
export type ChatbotSettings = typeof chatbotSettings.$inferSelect;
export type NewChatbotSettings = typeof chatbotSettings.$inferInsert;
export type ChatFaq = typeof chatFaq.$inferSelect;
export type NewChatFaq = typeof chatFaq.$inferInsert;
export type ChatbotSession = typeof chatbotSessions.$inferSelect;
export type NewChatbotSession = typeof chatbotSessions.$inferInsert;
export type ChatbotMessage = typeof chatbotMessages.$inferSelect;
export type NewChatbotMessage = typeof chatbotMessages.$inferInsert;

// Homepage Featured Collections
export type HomepageFeaturedCollection = typeof homepageFeaturedCollections.$inferSelect;
export type NewHomepageFeaturedCollection = typeof homepageFeaturedCollections.$inferInsert;
