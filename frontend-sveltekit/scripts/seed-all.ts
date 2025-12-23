/**
 * Seed Script: Migrate JSON data to SQLite database
 * Run: npx tsx scripts/seed-all.ts
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../src/lib/server/db/schema';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database - use the same path as drizzle.config.ts
const dbPath = join(__dirname, '..', '..', 'data', 'db', 'sqlite', 'app.db');
console.log('Database path:', dbPath);
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

// Read JSON files
function readJson<T>(filename: string): T {
	const path = join(__dirname, '../../data', filename);
	const content = readFileSync(path, 'utf-8');
	return JSON.parse(content) as T;
}

interface MenuJson {
	items: Array<{
		id: string;
		label: { en: string; ru: string; es: string; zh: string };
		href: string;
		parentId: string | null;
		hasDropdown: boolean;
		order: number;
		icon?: string;
	}>;
}

interface FooterJson {
	brand: {
		title: string;
		subtitle: { en: string; ru: string; es: string; zh: string };
		quote: { en: string; ru: string; es: string; zh: string };
	};
	social: {
		links: Array<{
			id: string;
			platform: string;
			label: string;
			badge: string | null;
			url: string;
			icon: string;
			order: number;
		}>;
	};
	contact: {
		title: { en: string; ru: string; es: string; zh: string };
		email: string;
	};
}

interface HomepageJson {
	sections: {
		hero: {
			title: { en: string; ru: string; es: string; zh: string };
			subtitle: { en: string; ru: string; es: string; zh: string };
			quote: { en: string; ru: string; es: string; zh: string };
			announcement: {
				highlight: { en: string; ru: string; es: string; zh: string };
				text: { en: string; ru: string; es: string; zh: string };
			};
			slides: Array<{
				image: string;
				alt: { en: string; ru: string; es: string; zh: string };
				duration: number;
			}>;
		};
		featuredCollections: {
			title: { en: string; ru: string; es: string; zh: string };
			subtitle: { en: string; ru: string; es: string; zh: string };
			collections: Array<{
				id: string;
				title: { en: string; ru: string; es: string; zh: string };
				description: { en: string; ru: string; es: string; zh: string };
				coverImage: string;
				link: string;
			}>;
		};
		exhibitions: {
			title: { en: string; ru: string; es: string; zh: string };
			subtitle: { en: string; ru: string; es: string; zh: string };
			featured: {
				title: { en: string; ru: string; es: string; zh: string };
				description: { en: string; ru: string; es: string; zh: string };
				location: { en: string; ru: string; es: string; zh: string };
				workCount: number;
				dateRange: { start: string; end: string | null };
				coverImage: string;
			};
		};
		about: {
			title: { en: string; ru: string; es: string; zh: string };
			paragraphs: Array<{ en: string; ru: string; es: string; zh: string }>;
			ctaText: { en: string; ru: string; es: string; zh: string };
			ctaLink: string;
			image: string;
		};
		news: {
			title: { en: string; ru: string; es: string; zh: string };
			items: Array<{
				id: string;
				date: string;
				title: { en: string; ru: string; es: string; zh: string };
				excerpt: { en: string; ru: string; es: string; zh: string };
			}>;
		};
		testimonials: {
			title: { en: string; ru: string; es: string; zh: string };
			testimonials: Array<{
				id: string;
				quote: { en: string; ru: string; es: string; zh: string };
				author: {
					name: string;
					title: { en: string; ru: string; es: string; zh: string };
				};
			}>;
		};
		process: {
			title: { en: string; ru: string; es: string; zh: string };
			steps: Array<{
				id: string;
				title: { en: string; ru: string; es: string; zh: string };
				description: { en: string; ru: string; es: string; zh: string };
				image: string;
			}>;
		};
	};
}

async function seedMenu() {
	console.log('Seeding menu items...');
	const data = readJson<MenuJson>('menu.json');

	// Create a map of old ID to new numeric ID
	const idMap: Record<string, number> = {};
	let nextId = 1;

	// First pass: assign IDs
	for (const item of data.items) {
		idMap[item.id] = nextId++;
	}

	// Second pass: insert items
	for (const item of data.items) {
		await db.insert(schema.menuItems).values({
			id: idMap[item.id],
			href: item.href,
			label_en: item.label.en,
			label_ru: item.label.ru,
			label_es: item.label.es,
			label_zh: item.label.zh,
			parent_id: item.parentId ? idMap[item.parentId] : null,
			has_dropdown: item.hasDropdown,
			order_index: item.order,
			icon: item.icon || null,
			is_visible: true
		});
	}

	console.log(`  ✓ Inserted ${data.items.length} menu items`);
}

async function seedFooter() {
	console.log('Seeding footer...');
	const data = readJson<FooterJson>('footer.json');

	// Brand
	await db.insert(schema.footerBrand).values({
		id: 1,
		title: data.brand.title,
		subtitle_en: data.brand.subtitle.en,
		subtitle_ru: data.brand.subtitle.ru,
		subtitle_es: data.brand.subtitle.es,
		subtitle_zh: data.brand.subtitle.zh,
		quote_en: data.brand.quote.en,
		quote_ru: data.brand.quote.ru,
		quote_es: data.brand.quote.es,
		quote_zh: data.brand.quote.zh
	});
	console.log('  ✓ Inserted footer brand');

	// Social links
	for (const link of data.social.links) {
		await db.insert(schema.footerSocialLinks).values({
			platform: link.platform,
			label: link.label,
			badge: link.badge,
			url: link.url,
			icon: link.icon,
			order_index: link.order,
			is_visible: true
		});
	}
	console.log(`  ✓ Inserted ${data.social.links.length} social links`);

	// Contact
	await db.insert(schema.footerContact).values({
		id: 1,
		title_en: data.contact.title.en,
		title_ru: data.contact.title.ru,
		title_es: data.contact.title.es,
		title_zh: data.contact.title.zh,
		email: data.contact.email
	});
	console.log('  ✓ Inserted footer contact');
}

async function seedHomepage() {
	console.log('Seeding homepage...');
	const data = readJson<HomepageJson>('homepage.json');
	const { sections } = data;

	// Hero
	const [hero] = await db
		.insert(schema.homepageHero)
		.values({
			id: 1,
			title_en: sections.hero.title.en,
			title_ru: sections.hero.title.ru,
			title_es: sections.hero.title.es,
			title_zh: sections.hero.title.zh,
			subtitle_en: sections.hero.subtitle.en,
			subtitle_ru: sections.hero.subtitle.ru,
			subtitle_es: sections.hero.subtitle.es,
			subtitle_zh: sections.hero.subtitle.zh,
			quote_en: sections.hero.quote.en,
			quote_ru: sections.hero.quote.ru,
			quote_es: sections.hero.quote.es,
			quote_zh: sections.hero.quote.zh,
			announcement_highlight_en: sections.hero.announcement.highlight.en,
			announcement_highlight_ru: sections.hero.announcement.highlight.ru,
			announcement_highlight_es: sections.hero.announcement.highlight.es,
			announcement_highlight_zh: sections.hero.announcement.highlight.zh,
			announcement_text_en: sections.hero.announcement.text.en,
			announcement_text_ru: sections.hero.announcement.text.ru,
			announcement_text_es: sections.hero.announcement.text.es,
			announcement_text_zh: sections.hero.announcement.text.zh
		})
		.returning();
	console.log('  ✓ Inserted homepage hero');

	// Hero slides (without media_id for now - will be linked after media upload)
	for (let i = 0; i < sections.hero.slides.length; i++) {
		const slide = sections.hero.slides[i];
		await db.insert(schema.heroSlides).values({
			hero_id: hero.id,
			media_id: null, // Will be linked after media upload
			alt_en: slide.alt.en,
			alt_ru: slide.alt.ru,
			alt_es: slide.alt.es,
			alt_zh: slide.alt.zh,
			duration: slide.duration,
			order_index: i,
			is_visible: true
		});
	}
	console.log(`  ✓ Inserted ${sections.hero.slides.length} hero slides`);

	// Featured Collections section
	await db.insert(schema.homepageSections).values({
		section_type: 'featured_collections',
		title_en: sections.featuredCollections.title.en,
		title_ru: sections.featuredCollections.title.ru,
		title_es: sections.featuredCollections.title.es,
		title_zh: sections.featuredCollections.title.zh,
		subtitle_en: sections.featuredCollections.subtitle.en,
		subtitle_ru: sections.featuredCollections.subtitle.ru,
		subtitle_es: sections.featuredCollections.subtitle.es,
		subtitle_zh: sections.featuredCollections.subtitle.zh,
		content_json: JSON.stringify(sections.featuredCollections.collections),
		order_index: 1,
		is_visible: true
	});
	console.log('  ✓ Inserted featured collections section');

	// Exhibitions section
	await db.insert(schema.homepageSections).values({
		section_type: 'exhibitions',
		title_en: sections.exhibitions.title.en,
		title_ru: sections.exhibitions.title.ru,
		title_es: sections.exhibitions.title.es,
		title_zh: sections.exhibitions.title.zh,
		subtitle_en: sections.exhibitions.subtitle.en,
		subtitle_ru: sections.exhibitions.subtitle.ru,
		subtitle_es: sections.exhibitions.subtitle.es,
		subtitle_zh: sections.exhibitions.subtitle.zh,
		content_json: JSON.stringify(sections.exhibitions.featured),
		order_index: 2,
		is_visible: true
	});
	console.log('  ✓ Inserted exhibitions section');

	// About preview
	await db.insert(schema.homepageAbout).values({
		id: 1,
		title_en: sections.about.title.en,
		title_ru: sections.about.title.ru,
		title_es: sections.about.title.es,
		title_zh: sections.about.title.zh,
		text_en: sections.about.paragraphs.map((p) => p.en).join('\n\n'),
		text_ru: sections.about.paragraphs.map((p) => p.ru).join('\n\n'),
		text_es: sections.about.paragraphs.map((p) => p.es).join('\n\n'),
		text_zh: sections.about.paragraphs.map((p) => p.zh).join('\n\n'),
		image_id: null, // Will be linked after media upload
		cta_text_en: sections.about.ctaText.en,
		cta_text_ru: sections.about.ctaText.ru,
		cta_text_es: sections.about.ctaText.es,
		cta_text_zh: sections.about.ctaText.zh,
		cta_href: sections.about.ctaLink
	});
	console.log('  ✓ Inserted about preview');

	// News
	for (let i = 0; i < sections.news.items.length; i++) {
		const item = sections.news.items[i];
		await db.insert(schema.homepageNews).values({
			title_en: item.title.en,
			title_ru: item.title.ru,
			title_es: item.title.es,
			title_zh: item.title.zh,
			excerpt_en: item.excerpt.en,
			excerpt_ru: item.excerpt.ru,
			excerpt_es: item.excerpt.es,
			excerpt_zh: item.excerpt.zh,
			date: item.date,
			order_index: i,
			is_visible: true
		});
	}
	console.log(`  ✓ Inserted ${sections.news.items.length} news items`);

	// Testimonials
	for (let i = 0; i < sections.testimonials.testimonials.length; i++) {
		const item = sections.testimonials.testimonials[i];
		await db.insert(schema.homepageTestimonials).values({
			quote_en: item.quote.en,
			quote_ru: item.quote.ru,
			quote_es: item.quote.es,
			quote_zh: item.quote.zh,
			author: item.author.name,
			role_en: item.author.title.en,
			role_ru: item.author.title.ru,
			role_es: item.author.title.es,
			role_zh: item.author.title.zh,
			order_index: i,
			is_visible: true
		});
	}
	console.log(`  ✓ Inserted ${sections.testimonials.testimonials.length} testimonials`);

	// Process steps
	for (let i = 0; i < sections.process.steps.length; i++) {
		const step = sections.process.steps[i];
		await db.insert(schema.homepageProcess).values({
			title_en: step.title.en,
			title_ru: step.title.ru,
			title_es: step.title.es,
			title_zh: step.title.zh,
			description_en: step.description.en,
			description_ru: step.description.ru,
			description_es: step.description.es,
			description_zh: step.description.zh,
			step_number: i + 1,
			order_index: i,
			is_visible: true
		});
	}
	console.log(`  ✓ Inserted ${sections.process.steps.length} process steps`);
}

async function seedSeries() {
	console.log('Seeding series from featured collections...');
	const data = readJson<HomepageJson>('homepage.json');
	const collections = data.sections.featuredCollections.collections;

	for (let i = 0; i < collections.length; i++) {
		const col = collections[i];
		await db.insert(schema.series).values({
			slug: col.id,
			name_en: col.title.en,
			name_ru: col.title.ru,
			name_es: col.title.es,
			name_zh: col.title.zh,
			description_en: col.description.en,
			description_ru: col.description.ru,
			description_es: col.description.es,
			description_zh: col.description.zh,
			order_index: i,
			is_visible: true,
			is_featured: true
		});
	}
	console.log(`  ✓ Inserted ${collections.length} series`);
}

async function seedPages() {
	console.log('Seeding static pages...');

	const staticPages = [
		{
			slug: 'about',
			title_en: 'About',
			title_ru: 'О художнике',
			title_es: 'Acerca de',
			title_zh: '关于'
		},
		{
			slug: 'contact',
			title_en: 'Contact',
			title_ru: 'Контакты',
			title_es: 'Contacto',
			title_zh: '联系'
		},
		{ slug: 'nft', title_en: 'NFT', title_ru: 'NFT', title_es: 'NFT', title_zh: 'NFT' }
	];

	for (const page of staticPages) {
		await db.insert(schema.pages).values({
			slug: page.slug,
			page_type: 'static',
			template: 'default',
			title_en: page.title_en,
			title_ru: page.title_ru,
			title_es: page.title_es,
			title_zh: page.title_zh,
			is_published: true
		});
	}
	console.log(`  ✓ Inserted ${staticPages.length} pages`);
}

async function seedWorksPage() {
	console.log('Seeding works page config...');
	await db.insert(schema.worksPage).values({
		id: 1,
		title_en: 'Works',
		title_ru: 'Работы',
		title_es: 'Obras',
		title_zh: '作品',
		description_en: 'Explore the collections of contemporary art',
		description_ru: 'Исследуйте коллекции современного искусства',
		description_es: 'Explora las colecciones de arte contemporáneo',
		description_zh: '探索当代艺术收藏'
	});
	console.log('  ✓ Inserted works page config');
}

async function main() {
	console.log('🌱 Starting database seed...\n');

	try {
		await seedMenu();
		await seedFooter();
		await seedHomepage();
		await seedSeries();
		await seedPages();
		await seedWorksPage();

		console.log('\n✅ Database seeded successfully!');
	} catch (error) {
		console.error('\n❌ Error seeding database:', error);
		process.exit(1);
	} finally {
		sqlite.close();
	}
}

main();
