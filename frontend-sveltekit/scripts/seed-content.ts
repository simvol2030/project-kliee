/**
 * Seed script for K-LIÉE database
 * Extracts data from static site files and populates SQLite database
 *
 * Run: npx tsx scripts/seed-content.ts
 */

import { db } from '../src/lib/server/db/client';
import { series, artworks, exhibitions, artFairs } from '../src/lib/server/db/schema';
import catalogData from '../../_old-static-site/catalog.json';

// Category to Series mapping (IDs match existing database)
const categoryToSeriesMap: Record<string, { id: string; slug: string; order: number }> = {
	'CHEBU-RASHA': { id: 'chebu-rasha', slug: 'chebu-rasha', order: 1 },
	'«π» OR THE LAST SUPPER': { id: 'last-supper', slug: 'last-supper', order: 2 },
	"SOMEBODY'S BOUDOIR, SOMEBODY'S ABATTOIR": { id: 'sbsa', slug: 'somebodys-boudoir', order: 3 },
	'THE BULL': { id: 'the-bull', slug: 'the-bull', order: 4 },
	'HOTEL SERIES': { id: 'hotel-series', slug: 'hotel-series', order: 5 },
	'SCULPTURES': { id: 'sculptures', slug: 'sculptures', order: 6 },
	'PORCELAIN': { id: 'porcelain', slug: 'porcelain', order: 7 },
	'NFT': { id: 'nft', slug: 'nft', order: 8 }
};

// Series translations
const seriesTranslations: Record<string, { titleRu: string; titleEs: string; titleZh: string; descEn: string; descRu: string }> = {
	'CHEBU-RASHA': {
		titleRu: 'Чебу-Раша',
		titleEs: 'Chebu-Rasha',
		titleZh: '切布拉什卡',
		descEn: 'A satirical series exploring Russian cultural identity through the lens of the beloved Soviet cartoon character.',
		descRu: 'Сатирическая серия, исследующая российскую культурную идентичность через призму любимого советского мультипликационного персонажа.'
	},
	'«π» OR THE LAST SUPPER': {
		titleRu: '«π» или Тайная вечеря',
		titleEs: '«π» o La Última Cena',
		titleZh: '«π» 或最后的晚餐',
		descEn: 'A reinterpretation of the iconic religious scene through contemporary artistic vision.',
		descRu: 'Переосмысление культовой религиозной сцены через призму современного художественного видения.'
	},
	"SOMEBODY'S BOUDOIR, SOMEBODY'S ABATTOIR": {
		titleRu: 'Чей-то будуар, чья-то бойня',
		titleEs: 'El tocador de alguien, el matadero de alguien',
		titleZh: '某人的闺房，某人的屠宰场',
		descEn: 'A provocative photography series exploring themes of beauty, violence, and transformation.',
		descRu: 'Провокационная фотосерия, исследующая темы красоты, насилия и трансформации.'
	},
	'THE BULL': {
		titleRu: 'Бык',
		titleEs: 'El Toro',
		titleZh: '公牛',
		descEn: 'Powerful silkscreen prints featuring the majestic bull as a symbol of strength and fertility.',
		descRu: 'Мощные шелкографические принты с величественным быком как символом силы и плодородия.'
	},
	'HOTEL SERIES': {
		titleRu: 'Отельная серия',
		titleEs: 'Serie de Hoteles',
		titleZh: '酒店系列',
		descEn: 'Intimate photography capturing moments of luxury and solitude in prestigious hotels.',
		descRu: 'Интимная фотография, запечатлевающая моменты роскоши и уединения в престижных отелях.'
	},
	'SCULPTURES': {
		titleRu: 'Скульптуры',
		titleEs: 'Esculturas',
		titleZh: '雕塑',
		descEn: 'Bronze and ceramic sculptures exploring the human form and its relationship with objects.',
		descRu: 'Бронзовые и керамические скульптуры, исследующие человеческую форму и её связь с предметами.'
	},
	'PORCELAIN': {
		titleRu: 'Фарфор',
		titleEs: 'Porcelana',
		titleZh: '瓷器',
		descEn: 'Exquisite porcelain prints combining traditional craftsmanship with contemporary imagery.',
		descRu: 'Изысканные фарфоровые принты, сочетающие традиционное мастерство с современной образностью.'
	},
	'NFT': {
		titleRu: 'NFT',
		titleEs: 'NFT',
		titleZh: 'NFT',
		descEn: 'Digital art collection available as non-fungible tokens.',
		descRu: 'Коллекция цифрового искусства, доступная в виде невзаимозаменяемых токенов.'
	}
};

// Exhibitions data from about.html
const exhibitionsData = [
	{ year: 2005, titleEn: 'Please Meet Svetlana Kuleshova', venueEn: 'The House of Artists', locationEn: 'St. Petersburg, Russia', type: 'solo' as const },
	{ year: 2006, titleEn: 'Stella Art International', venueEn: 'Stella Art Gallery', locationEn: 'Paris, France', type: 'gallery' as const },
	{ year: 2008, titleEn: 'Highlights by Svetlana K-Lié', venueEn: 'The Central House of Artists', locationEn: 'Moscow, Russia', type: 'solo' as const },
	{ year: 2009, titleEn: 'Vesna Hempel', venueEn: 'The AngloMoskva Festival, Liberatum', locationEn: 'Moscow, Russia', type: 'festival' as const },
	{ year: 2010, titleEn: 'Meat', venueEn: 'Brighton Photo Fringe', locationEn: 'Lewes, England', type: 'festival' as const },
	{ year: 2011, titleEn: 'Hotel-Hempel', venueEn: 'L-gallery', locationEn: 'Moscow, Russia', type: 'gallery' as const },
	{ year: 2022, titleEn: 'Scope', venueEn: 'Miami Beach, Art Basel', locationEn: 'Miami, USA', type: 'fair' as const },
	{ year: 2024, titleEn: 'Lev Tolstoy', venueEn: 'Shanghai History Museum', locationEn: 'Shanghai, China', type: 'group' as const },
	{ year: 2024, titleEn: 'Tales of Xenophobia', venueEn: 'Tora and Art Foundation', locationEn: 'Paris, France', type: 'group' as const }
];

// Art Fairs data
const artFairsData = [
	{ year: 2006, titleEn: 'Art-Manage', venueEn: 'Zebra Bliss Gallery', locationEn: 'Moscow, Russia' },
	{ year: 2007, titleEn: 'Art-Manage', venueEn: 'Zebra Bliss Gallery', locationEn: 'Moscow, Russia' },
	{ year: 2008, titleEn: 'The Affordable Art Fair', venueEn: 'Brighton Independent Printmaking', locationEn: 'London, England' },
	{ year: 2009, titleEn: 'Business Art Fair', venueEn: 'Espace Pierre Cardin, Stella Art International', locationEn: 'Paris, France' },
	{ year: 2009, titleEn: 'Russian Art Fair', venueEn: 'Artelia Gallery', locationEn: 'London, England' },
	{ year: 2010, titleEn: 'Russian Art Fair', venueEn: 'Artelia Gallery', locationEn: 'London, England' },
	{ year: 2010, titleEn: 'International Art Fair', venueEn: 'Artelia Gallery', locationEn: 'London, England' },
	{ year: 2010, titleEn: 'Chelsea Art Fair', venueEn: 'Artelia Gallery', locationEn: 'London, England' },
	{ year: 2013, titleEn: 'Art Monaco 2013', venueEn: 'Onega Gallery', locationEn: 'Monaco' },
	{ year: 2022, titleEn: 'Artexpo Dallas', venueEn: 'Dallas Convention Center', locationEn: 'Texas, USA' },
	{ year: 2023, titleEn: 'Hamptons Art Fair', venueEn: 'Southampton', locationEn: 'New York, USA' },
	{ year: 2023, titleEn: 'Art on Paper', venueEn: 'Art Fair', locationEn: 'New York City, USA' },
	{ year: 2024, titleEn: 'Seattle Art Fair', venueEn: 'Jade Flower Gallery', locationEn: 'Seattle, USA' },
	{ year: 2024, titleEn: "Spring Art Fair 'For Reunion'", venueEn: 'Taoxichuan Art Center', locationEn: 'Jingdezhen, China' }
];

function parsePrice(priceStr: string): number | null {
	if (!priceStr) return null;
	const match = priceStr.match(/£([\d,]+)/);
	if (match) {
		return parseInt(match[1].replace(',', '')) * 100; // Convert to pence
	}
	return null;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 50);
}

async function seedSeries() {
	console.log('🎨 Seeding series...');

	const uniqueCategories = [...new Set(catalogData.map((item: any) => item['Категория']))];

	for (const category of uniqueCategories) {
		const mapping = categoryToSeriesMap[category];
		const translations = seriesTranslations[category];

		if (!mapping || !translations) {
			console.warn(`  ⚠️ No mapping for category: ${category}`);
			continue;
		}

		await db.insert(series).values({
			id: mapping.id,
			slug: mapping.slug,
			titleEn: category,
			titleRu: translations.titleRu,
			titleEs: translations.titleEs,
			titleZh: translations.titleZh,
			descriptionEn: translations.descEn,
			descriptionRu: translations.descRu,
			descriptionEs: translations.descEn, // Same as EN for now
			descriptionZh: translations.descEn, // Same as EN for now
			order: mapping.order,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}).onConflictDoNothing();

		console.log(`  ✅ ${category}`);
	}
}

async function seedArtworks() {
	console.log('🖼️ Seeding artworks...');

	for (const item of catalogData as any[]) {
		const category = item['Категория'];
		const mapping = categoryToSeriesMap[category];

		if (!mapping) {
			console.warn(`  ⚠️ Skipping artwork without series mapping: ${item['Название']}`);
			continue;
		}

		const id = `artwork-${item.ID}`;
		const title = item['Название'];
		const technique = item['Тип/Техника'];
		const imagePath = item['Путь к изображению'];
		const price = parsePrice(item['Цена']);

		// Extract year from note if present
		let year: number | null = null;
		if (item['Примечание']) {
			const yearMatch = item['Примечание'].match(/\b(19|20)\d{2}\b/);
			if (yearMatch) year = parseInt(yearMatch[0]);
		}

		await db.insert(artworks).values({
			id,
			titleEn: title,
			titleRu: title, // Same for now, can be updated via admin
			titleEs: title,
			titleZh: title,
			seriesId: mapping.id,
			techniqueEn: technique,
			techniqueRu: technique,
			techniqueEs: technique,
			techniqueZh: technique,
			year,
			price,
			currency: price ? 'GBP' : null,
			images: JSON.stringify([`/${imagePath}`]),
			available: true,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}).onConflictDoNothing();

		console.log(`  ✅ ${title}`);
	}
}

async function seedExhibitions() {
	console.log('🏛️ Seeding exhibitions...');

	for (let i = 0; i < exhibitionsData.length; i++) {
		const ex = exhibitionsData[i];
		const id = `exhibition-${i + 1}`;

		await db.insert(exhibitions).values({
			id,
			year: ex.year,
			type: ex.type,
			titleEn: ex.titleEn,
			titleRu: ex.titleEn, // Can be translated later
			titleEs: ex.titleEn,
			titleZh: ex.titleEn,
			venueEn: ex.venueEn,
			venueRu: ex.venueEn,
			venueEs: ex.venueEn,
			venueZh: ex.venueEn,
			locationEn: ex.locationEn,
			locationRu: ex.locationEn,
			locationEs: ex.locationEn,
			locationZh: ex.locationEn,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}).onConflictDoNothing();

		console.log(`  ✅ ${ex.year} - ${ex.titleEn}`);
	}
}

async function seedArtFairs() {
	console.log('🎪 Seeding art fairs...');

	for (let i = 0; i < artFairsData.length; i++) {
		const fair = artFairsData[i];
		const id = `artfair-${i + 1}`;

		await db.insert(artFairs).values({
			id,
			year: fair.year,
			titleEn: fair.titleEn,
			titleRu: fair.titleEn,
			titleEs: fair.titleEn,
			titleZh: fair.titleEn,
			galleryEn: fair.venueEn,
			galleryRu: fair.venueEn,
			galleryEs: fair.venueEn,
			galleryZh: fair.venueEn,
			locationEn: fair.locationEn,
			locationRu: fair.locationEn,
			locationEs: fair.locationEn,
			locationZh: fair.locationEn,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}).onConflictDoNothing();

		console.log(`  ✅ ${fair.year} - ${fair.titleEn}`);
	}
}

async function main() {
	console.log('🚀 Starting content migration...\n');

	try {
		await seedSeries();
		console.log('');
		await seedArtworks();
		console.log('');
		await seedExhibitions();
		console.log('');
		await seedArtFairs();

		console.log('\n✅ Content migration complete!');
		console.log(`   - ${Object.keys(categoryToSeriesMap).length} series`);
		console.log(`   - ${(catalogData as any[]).length} artworks`);
		console.log(`   - ${exhibitionsData.length} exhibitions`);
		console.log(`   - ${artFairsData.length} art fairs`);
	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	}
}

main();
