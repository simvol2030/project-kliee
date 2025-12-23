#!/usr/bin/env node
/**
 * Simple Product Import Script (No Dependencies)
 * Imports Saatchi Art products without YAML parser
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Hardcoded products data (from YAML)
const products = [
	{
		title_en: 'Chebu-Rasha Throwing Up Eyes',
		title_ru: 'Чебу-Раша Выбрасывающая Глаза',
		title_es: 'Chebu-Rasha Lanzando Ojos',
		title_zh: '切布拉莎抛眼睛',
		description_en: 'Digital print on paper',
		description_ru: 'Цифровая печать на бумаге',
		description_es: 'Impresión digital en papel',
		description_zh: '数字印刷在纸上',
		price: 1466,
		medium: 'Digital on Paper',
		dimensions: '50 x 50 cm',
		year: 2024,
		is_available: true,
		is_featured: false,
		image_url:
			'https://images.saatchiart.com/saatchi/115891/art/11537433/10599685-HQJBQDFT-6.jpg',
		image_filename: 'chebu-rasha-throwing-up-eyes.jpg'
	},
	{
		title_en: 'Chebu-Rasha Cloud Sitting Atop A Tall Hill',
		title_ru: 'Чебу-Раша Облако Сидящее На Высоком Холме',
		title_es: 'Chebu-Rasha Nube Sentada En Una Colina Alta',
		title_zh: '切布拉莎云坐在高山上',
		description_en: 'Digital print on paper',
		description_ru: 'Цифровая печать на бумаге',
		description_es: 'Impresión digital en papel',
		description_zh: '数字印刷在纸上',
		price: 1466,
		medium: 'Digital on Paper',
		dimensions: '50 x 50 cm',
		year: 2024,
		is_available: true,
		is_featured: false,
		image_url:
			'https://images.saatchiart.com/saatchi/115891/art/11537421/10599673-MTYMMHQC-6.jpg',
		image_filename: 'chebu-rasha-cloud-sitting.jpg'
	},
	{
		title_en: 'Chebu-Rasha, Teletubbies',
		title_ru: 'Чебу-Раша, Телепузики',
		title_es: 'Chebu-Rasha, Teletubbies',
		title_zh: '切布拉莎，天线宝宝',
		description_en: 'Digital print on paper',
		description_ru: 'Цифровая печать на бумаге',
		description_es: 'Impresión digital en papel',
		description_zh: '数字印刷在纸上',
		price: 1456,
		medium: 'Digital on Paper',
		dimensions: '40 x 40 cm',
		year: 2024,
		is_available: true,
		is_featured: true,
		image_url:
			'https://images.saatchiart.com/saatchi/115891/art/11537401/10599653-PNMOKFTE-6.jpg',
		image_filename: 'chebu-rasha-teletubbies.jpg'
	}
	// ... Add remaining 12 products here for full import
];

// Additional 12 products
const productsAdditional = [
	{
		title_en: 'Storm Cloud, Brains, Red Thunder',
		title_ru: 'Грозовое Облако, Мозги, Красный Гром',
		title_es: 'Nube De Tormenta, Cerebros, Trueno Rojo',
		title_zh: '风暴云，大脑，红色雷电',
		description_en: 'Digital print on paper',
		description_ru: 'Цифровая печать на бумаге',
		description_es: 'Impresión digital en papel',
		description_zh: '数字印刷在纸上',
		price: 1456,
		medium: 'Digital on Paper',
		dimensions: '40 x 40 cm',
		year: 2024,
		is_available: true,
		is_featured: false,
		image_url:
			'https://images.saatchiart.com/saatchi/115891/art/11537395/10599647-XWKWSQTM-6.jpg',
		image_filename: 'storm-cloud-brains-red-thunder.jpg'
	},
	{
		title_en: 'Chebu-Rasha',
		title_ru: 'Чебу-Раша',
		title_es: 'Chebu-Rasha',
		title_zh: '切布拉莎',
		description_en: 'Digital print on paper',
		description_ru: 'Цифровая печать на бумаге',
		description_es: 'Impresión digital en papel',
		description_zh: '数字印刷在纸上',
		price: 1456,
		medium: 'Digital on Paper',
		dimensions: '40 x 40 cm',
		year: 2024,
		is_available: true,
		is_featured: false,
		image_url:
			'https://images.saatchiart.com/saatchi/115891/art/11537343/10599595-DDNCNTHT-6.jpg',
		image_filename: 'chebu-rasha.jpg'
	},
	{
		title_en: 'Red Hills Of My Innocence Or First Shoot',
		title_ru: 'Красные Холмы Моей Невинности Или Первый Выстрел',
		title_es: 'Colinas Rojas De Mi Inocencia O Primer Disparo',
		title_zh: '我的纯真红山或第一枪',
		description_en: 'Digital print on paper',
		description_ru: 'Цифровая печать на бумаге',
		description_es: 'Impresión digital en papel',
		description_zh: '数字印刷在纸上',
		price: 1456,
		medium: 'Digital on Paper',
		dimensions: '40 x 40 cm',
		year: 2024,
		is_available: true,
		is_featured: false,
		image_url:
			'https://images.saatchiart.com/saatchi/115891/art/11537337/10599589-VDYQPAJJ-6.jpg',
		image_filename: 'red-hills-innocence.jpg'
	}
	// ... Continue with remaining products
];

const allProducts = [...products, ...productsAdditional];

async function downloadImage(url, filename) {
	const targetPath = join(rootDir, 'static', 'uploads', 'products', filename);

	if (existsSync(targetPath)) {
		console.log(`✓ Image already exists: ${filename}`);
		return `/uploads/products/${filename}`;
	}

	console.log(`Downloading: ${url}`);
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to download ${url}: ${response.statusText}`);
	}

	const buffer = await response.arrayBuffer();
	writeFileSync(targetPath, Buffer.from(buffer));
	console.log(`✓ Downloaded: ${filename}`);

	return `/uploads/products/${filename}`;
}

async function importProducts() {
	console.log('🚀 Starting Saatchi Art products import...\n');

	// Connect to database
	const dbPath = join(rootDir, '../data/db/sqlite/app.db');
	const db = new Database(dbPath);

	console.log(`Found ${allProducts.length} products\n`);

	let imported = 0;
	let errors = 0;

	for (const product of allProducts) {
		try {
			console.log(`\n📦 Processing: ${product.title_en}`);

			// Download image
			const imagePath = await downloadImage(product.image_url, product.image_filename);

			// Insert into media table
			const mediaInsert = db.prepare(`
				INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			`);

			const mediaResult = mediaInsert.run(
				product.image_filename,
				imagePath,
				'image/jpeg',
				0,
				product.title_en,
				product.title_en,
				product.title_ru,
				product.title_es,
				product.title_zh
			);

			const mediaId = mediaResult.lastInsertRowid;
			console.log(`  ✓ Created media record: ID ${mediaId}`);

			// Create slug
			const slug = product.title_en
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');

			// Insert into artworks table
			const artworkInsert = db.prepare(`
				INSERT INTO artworks (
					slug, title_en, title_ru, title_es, title_zh,
					description_en, description_ru, description_es, description_zh,
					technique, dimensions, year, price, currency,
					is_featured, is_for_sale, is_visible
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`);

			const artworkResult = artworkInsert.run(
				slug,
				product.title_en,
				product.title_ru,
				product.title_es,
				product.title_zh,
				product.description_en,
				product.description_ru,
				product.description_es,
				product.description_zh,
				product.medium,
				product.dimensions,
				product.year,
				product.price,
				'USD',
				product.is_featured ? 1 : 0,
				product.is_available ? 1 : 0,
				1
			);

			const artworkId = artworkResult.lastInsertRowid;
			console.log(`  ✓ Created artwork record: ID ${artworkId}`);

			// Link artwork with media
			const linkInsert = db.prepare(`
				INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
				VALUES (?, ?, ?, ?)
			`);

			linkInsert.run(artworkId, mediaId, 1, 0);
			console.log(`  ✓ Linked artwork with media`);
			console.log(`  ✅ Successfully imported: ${product.title_en}`);

			imported++;
		} catch (error) {
			console.error(`  ❌ Error importing ${product.title_en}:`, error.message);
			errors++;
		}
	}

	db.close();

	console.log('\n' + '='.repeat(60));
	console.log('📊 Import Summary:');
	console.log(`  ✅ Imported: ${imported}`);
	console.log(`  ❌ Errors: ${errors}`);
	console.log('='.repeat(60) + '\n');

	if (imported > 0) {
		console.log('✨ Import completed successfully!');
		console.log('\nNext steps:');
		console.log('  1. Check admin panel: http://localhost:5173/artworks');
		console.log('  2. Check shop page: http://localhost:5173/en/shop');
	}
}

// Run
importProducts()
	.then(() => {
		console.log('\n✅ Script finished');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Script failed:', error);
		process.exit(1);
	});
