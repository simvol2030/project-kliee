CREATE TABLE `admins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_unique` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `artwork_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`artwork_id` text NOT NULL,
	`media_id` integer NOT NULL,
	`is_primary` integer DEFAULT false,
	`order_index` integer DEFAULT 0,
	FOREIGN KEY (`artwork_id`) REFERENCES `artworks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `artworks` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text,
	`series_id` text,
	`title_en` text NOT NULL,
	`title_ru` text NOT NULL,
	`title_es` text NOT NULL,
	`title_zh` text NOT NULL,
	`description_en` text,
	`description_ru` text,
	`description_es` text,
	`description_zh` text,
	`technique` text,
	`dimensions` text,
	`year` integer,
	`price` integer,
	`currency` text DEFAULT 'EUR',
	`is_featured` integer DEFAULT false,
	`is_for_sale` integer DEFAULT true,
	`is_visible` integer DEFAULT true,
	`order_index` integer DEFAULT 0,
	`seo_title_en` text,
	`seo_title_ru` text,
	`seo_title_es` text,
	`seo_title_zh` text,
	`seo_description_en` text,
	`seo_description_ru` text,
	`seo_description_es` text,
	`seo_description_zh` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artworks_slug_unique` ON `artworks` (`slug`);--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`artwork_id` text NOT NULL,
	`price_eur_snapshot` integer,
	`added_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`session_id`) REFERENCES `cart_sessions`(`session_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`artwork_id`) REFERENCES `artworks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cart_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cart_sessions_session_id_unique` ON `cart_sessions` (`session_id`);--> statement-breakpoint
CREATE TABLE `currency_rates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_currency` text DEFAULT 'EUR' NOT NULL,
	`to_currency` text NOT NULL,
	`rate` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `exhibition_artworks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exhibition_id` integer NOT NULL,
	`artwork_id` text NOT NULL,
	`order_index` integer DEFAULT 0,
	FOREIGN KEY (`exhibition_id`) REFERENCES `exhibitions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`artwork_id`) REFERENCES `artworks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exhibitions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title_en` text NOT NULL,
	`title_ru` text NOT NULL,
	`title_es` text NOT NULL,
	`title_zh` text NOT NULL,
	`description_en` text,
	`description_ru` text,
	`description_es` text,
	`description_zh` text,
	`venue` text,
	`city` text,
	`country` text,
	`address` text,
	`start_date` text,
	`end_date` text,
	`opening_hours` text,
	`cover_image_id` integer,
	`gallery_link` text,
	`is_current` integer DEFAULT false,
	`is_visible` integer DEFAULT true,
	`order_index` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`cover_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `footer_brand` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`subtitle_en` text,
	`subtitle_ru` text,
	`subtitle_es` text,
	`subtitle_zh` text,
	`quote_en` text,
	`quote_ru` text,
	`quote_es` text,
	`quote_zh` text
);
--> statement-breakpoint
CREATE TABLE `footer_contact` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title_en` text,
	`title_ru` text,
	`title_es` text,
	`title_zh` text,
	`email` text,
	`phone` text
);
--> statement-breakpoint
CREATE TABLE `footer_social_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platform` text NOT NULL,
	`label` text NOT NULL,
	`badge` text,
	`url` text NOT NULL,
	`icon` text NOT NULL,
	`order_index` integer DEFAULT 0,
	`is_visible` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `hero_slides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hero_id` integer,
	`media_id` integer,
	`alt_en` text,
	`alt_ru` text,
	`alt_es` text,
	`alt_zh` text,
	`duration` integer DEFAULT 4000,
	`order_index` integer DEFAULT 0,
	`is_visible` integer DEFAULT true,
	FOREIGN KEY (`hero_id`) REFERENCES `homepage_hero`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `homepage_about` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title_en` text,
	`title_ru` text,
	`title_es` text,
	`title_zh` text,
	`text_en` text,
	`text_ru` text,
	`text_es` text,
	`text_zh` text,
	`image_id` integer,
	`cta_text_en` text,
	`cta_text_ru` text,
	`cta_text_es` text,
	`cta_text_zh` text,
	`cta_href` text,
	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `homepage_hero` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title_en` text NOT NULL,
	`title_ru` text NOT NULL,
	`title_es` text NOT NULL,
	`title_zh` text NOT NULL,
	`subtitle_en` text,
	`subtitle_ru` text,
	`subtitle_es` text,
	`subtitle_zh` text,
	`quote_en` text,
	`quote_ru` text,
	`quote_es` text,
	`quote_zh` text,
	`announcement_highlight_en` text,
	`announcement_highlight_ru` text,
	`announcement_highlight_es` text,
	`announcement_highlight_zh` text,
	`announcement_text_en` text,
	`announcement_text_ru` text,
	`announcement_text_es` text,
	`announcement_text_zh` text
);
--> statement-breakpoint
CREATE TABLE `homepage_news` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title_en` text,
	`title_ru` text,
	`title_es` text,
	`title_zh` text,
	`excerpt_en` text,
	`excerpt_ru` text,
	`excerpt_es` text,
	`excerpt_zh` text,
	`image_id` integer,
	`link` text,
	`date` text,
	`order_index` integer DEFAULT 0,
	`is_visible` integer DEFAULT true,
	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `homepage_process` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title_en` text,
	`title_ru` text,
	`title_es` text,
	`title_zh` text,
	`description_en` text,
	`description_ru` text,
	`description_es` text,
	`description_zh` text,
	`icon` text,
	`step_number` integer,
	`order_index` integer DEFAULT 0,
	`is_visible` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `homepage_sections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`section_type` text NOT NULL,
	`title_en` text,
	`title_ru` text,
	`title_es` text,
	`title_zh` text,
	`subtitle_en` text,
	`subtitle_ru` text,
	`subtitle_es` text,
	`subtitle_zh` text,
	`content_json` text,
	`order_index` integer DEFAULT 0,
	`is_visible` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `homepage_testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quote_en` text,
	`quote_ru` text,
	`quote_es` text,
	`quote_zh` text,
	`author` text,
	`role_en` text,
	`role_ru` text,
	`role_es` text,
	`role_zh` text,
	`avatar_id` integer,
	`order_index` integer DEFAULT 0,
	`is_visible` integer DEFAULT true,
	FOREIGN KEY (`avatar_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`stored_filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt_en` text,
	`alt_ru` text,
	`alt_es` text,
	`alt_zh` text,
	`folder` text DEFAULT 'uploads',
	`uploaded_at` text DEFAULT CURRENT_TIMESTAMP,
	`uploaded_by` integer,
	FOREIGN KEY (`uploaded_by`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_stored_filename_unique` ON `media` (`stored_filename`);--> statement-breakpoint
CREATE TABLE `media_thumbnails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`media_id` integer NOT NULL,
	`size_name` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`stored_filename` text NOT NULL,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`href` text NOT NULL,
	`label_en` text NOT NULL,
	`label_ru` text NOT NULL,
	`label_es` text NOT NULL,
	`label_zh` text NOT NULL,
	`parent_id` integer,
	`has_dropdown` integer DEFAULT false,
	`order_index` integer DEFAULT 0 NOT NULL,
	`icon` text,
	`is_visible` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`artwork_id` text NOT NULL,
	`price_eur` integer NOT NULL,
	`title_snapshot` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`artwork_id`) REFERENCES `artworks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`status` text NOT NULL,
	`changed_at` text DEFAULT CURRENT_TIMESTAMP,
	`changed_by` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`changed_by`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_number` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`lang` text DEFAULT 'en',
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text,
	`shipping_country` text NOT NULL,
	`shipping_city` text NOT NULL,
	`shipping_address` text NOT NULL,
	`shipping_postal` text NOT NULL,
	`note` text,
	`admin_note` text,
	`subtotal_eur` integer NOT NULL,
	`currency_code` text NOT NULL,
	`currency_rate` text NOT NULL,
	`total_local` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE TABLE `page_blocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`page_id` integer NOT NULL,
	`block_type` text NOT NULL,
	`content_en` text,
	`content_ru` text,
	`content_es` text,
	`content_zh` text,
	`settings_json` text,
	`media_id` integer,
	`order_index` integer DEFAULT 0,
	`is_visible` integer DEFAULT true,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`page_type` text DEFAULT 'static',
	`template` text DEFAULT 'default',
	`title_en` text NOT NULL,
	`title_ru` text NOT NULL,
	`title_es` text NOT NULL,
	`title_zh` text NOT NULL,
	`content_en` text,
	`content_ru` text,
	`content_es` text,
	`content_zh` text,
	`seo_title_en` text,
	`seo_title_ru` text,
	`seo_title_es` text,
	`seo_title_zh` text,
	`seo_description_en` text,
	`seo_description_ru` text,
	`seo_description_es` text,
	`seo_description_zh` text,
	`featured_image_id` integer,
	`is_published` integer DEFAULT true,
	`is_in_menu` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`featured_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`published` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `series` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_ru` text NOT NULL,
	`name_es` text NOT NULL,
	`name_zh` text NOT NULL,
	`description_en` text,
	`description_ru` text,
	`description_es` text,
	`description_zh` text,
	`cover_image_id` integer,
	`order_index` integer DEFAULT 0,
	`is_visible` integer DEFAULT true,
	`is_featured` integer DEFAULT false,
	`show_in_shop` integer DEFAULT false,
	`seo_title_en` text,
	`seo_title_ru` text,
	`seo_title_es` text,
	`seo_title_zh` text,
	`seo_description_en` text,
	`seo_description_ru` text,
	`seo_description_es` text,
	`seo_description_zh` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`cover_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `series_slug_unique` ON `series` (`slug`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`type` text DEFAULT 'string',
	`group` text DEFAULT 'general'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE TABLE `shop_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`type` text DEFAULT 'string'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shop_settings_key_unique` ON `shop_settings` (`key`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `works_page` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title_en` text,
	`title_ru` text,
	`title_es` text,
	`title_zh` text,
	`description_en` text,
	`description_ru` text,
	`description_es` text,
	`description_zh` text,
	`seo_title_en` text,
	`seo_title_ru` text,
	`seo_title_es` text,
	`seo_title_zh` text,
	`seo_description_en` text,
	`seo_description_ru` text,
	`seo_description_es` text,
	`seo_description_zh` text
);
