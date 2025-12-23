/**
 * Import Products from Saatchi Art YAML
 *
 * Скрипт импорта товаров с Saatchi Art:
 * 1. Читает YAML файл с товарами
 * 2. Скачивает изображения
 * 3. Создаёт записи в media
 * 4. Создаёт записи в artworks
 * 5. Связывает через artworkImages
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as yaml from 'yaml';
import { db } from '../src/lib/server/db/client';
import { media, artworks, artworkImages } from '../src/lib/server/db/schema';

interface ProductData {
	title_en: string;
	title_ru: string;
	title_es: string;
	title_zh: string;
	description_en: string;
	description_ru: string;
	description_es: string;
	description_zh: string;
	price: number;
	medium: string;
	dimensions: string;
	year: number;
	is_available: boolean;
	is_featured: boolean;
	source_url: string;
	image_url: string;
	image_filename: string;
}

async function downloadImage(url: string, filename: string): Promise<string> {
	const targetPath = join(process.cwd(), 'static', 'uploads', 'products', filename);

	// Проверяем, не скачан ли уже файл
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

	// 1. Читаем YAML файл
	const yamlPath = join(process.cwd(), 'data', 'products-saatchi-art.yaml');
	const yamlContent = readFileSync(yamlPath, 'utf-8');
	const data = yaml.parse(yamlContent);
	const products: ProductData[] = data.products;

	console.log(`Found ${products.length} products in YAML\n`);

	let imported = 0;
	let skipped = 0;
	let errors = 0;

	// 2. Импортируем каждый продукт
	for (const product of products) {
		try {
			console.log(`\n📦 Processing: ${product.title_en}`);

			// 3. Скачиваем изображение
			const imagePath = await downloadImage(product.image_url, product.image_filename);

			// 4. Создаём запись в media
			const [mediaRecord] = await db
				.insert(media)
				.values({
					filename: product.image_filename,
					file_path: imagePath,
					file_type: 'image/jpeg',
					file_size: 0, // размер будем проставлять позже если нужно
					title: product.title_en,
					alt_text_en: product.title_en,
					alt_text_ru: product.title_ru,
					alt_text_es: product.title_es,
					alt_text_zh: product.title_zh
				})
				.returning();

			console.log(`  ✓ Created media record: ID ${mediaRecord.id}`);

			// 5. Создаём slug из title
			const slug = product.title_en
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');

			// 6. Создаём запись в artworks
			const [artworkRecord] = await db
				.insert(artworks)
				.values({
					slug,
					title_en: product.title_en,
					title_ru: product.title_ru,
					title_es: product.title_es,
					title_zh: product.title_zh,
					description_en: product.description_en,
					description_ru: product.description_ru,
					description_es: product.description_es,
					description_zh: product.description_zh,
					technique: product.medium,
					dimensions: product.dimensions,
					year: product.year,
					price: product.price,
					currency: 'USD', // Saatchi Art в долларах
					is_featured: product.is_featured,
					is_for_sale: product.is_available,
					is_visible: true
				})
				.returning();

			console.log(`  ✓ Created artwork record: ID ${artworkRecord.id}`);

			// 7. Связываем artwork с media
			await db.insert(artworkImages).values({
				artwork_id: artworkRecord.id,
				media_id: mediaRecord.id,
				is_primary: true,
				order_index: 0
			});

			console.log(`  ✓ Linked artwork with media`);
			console.log(`  ✅ Successfully imported: ${product.title_en}`);
			imported++;
		} catch (error) {
			console.error(`  ❌ Error importing ${product.title_en}:`, error);
			errors++;
		}
	}

	console.log('\n' + '='.repeat(60));
	console.log('📊 Import Summary:');
	console.log(`  ✅ Imported: ${imported}`);
	console.log(`  ⏭️  Skipped: ${skipped}`);
	console.log(`  ❌ Errors: ${errors}`);
	console.log('='.repeat(60) + '\n');

	if (imported > 0) {
		console.log('✨ Import completed successfully!');
		console.log('\nNext steps:');
		console.log('  1. Check admin panel: http://localhost:5173/artworks');
		console.log('  2. Check shop page: http://localhost:5173/en/shop');
	}
}

// Запуск
importProducts()
	.then(() => {
		console.log('\n✅ Script finished');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Script failed:', error);
		process.exit(1);
	});
