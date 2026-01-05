/**
 * One-time Sync Script: Artworks to ShopProducts
 *
 * Creates shopProducts for artworks that have is_for_sale=true AND price > 0
 * but don't have a corresponding shopProduct yet.
 *
 * Run with: npx tsx scripts/sync-artworks-to-shop.ts
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../data/db/sqlite/app.db');

interface Artwork {
	id: string;
	slug: string | null;
	title_en: string;
	title_ru: string;
	title_es: string;
	title_zh: string;
	description_en: string | null;
	description_ru: string | null;
	description_es: string | null;
	description_zh: string | null;
	price: number | null;
	currency: string | null;
	is_for_sale: number;
}

function main() {
	console.log('============================================================');
	console.log('Artworks to ShopProducts Sync Script');
	console.log('============================================================\n');

	// Connect to database
	console.log('[1/4] Connecting to database...');
	const db = new Database(DB_PATH);

	// Find artworks that should be in shop but aren't
	console.log('\n[2/4] Finding artworks to sync...');
	const artworksToSync = db
		.prepare(
			`
		SELECT a.* FROM artworks a
		WHERE a.is_for_sale = 1
		AND a.price IS NOT NULL
		AND a.price > 0
		AND NOT EXISTS (
			SELECT 1 FROM shop_products sp WHERE sp.artwork_id = a.id
		)
	`
		)
		.all() as Artwork[];

	console.log(`   Found ${artworksToSync.length} artworks to sync`);

	if (artworksToSync.length === 0) {
		console.log('\n[3/4] No artworks need syncing.');
		console.log('\n[4/4] Done!');
		db.close();
		return;
	}

	// Prepare insert statement
	console.log('\n[3/4] Creating shopProducts...');
	const insertShopProduct = db.prepare(`
		INSERT INTO shop_products (
			artwork_id, sku, title_en, title_ru, title_es, title_zh,
			description_en, description_ru, description_es, description_zh,
			price_eur, stock_quantity, is_unlimited, shipping_class,
			is_visible, is_featured, order_index, created_at, updated_at
		) VALUES (
			@artwork_id, @sku, @title_en, @title_ru, @title_es, @title_zh,
			@description_en, @description_ru, @description_es, @description_zh,
			@price_eur, @stock_quantity, @is_unlimited, @shipping_class,
			@is_visible, @is_featured, @order_index, @created_at, @updated_at
		)
	`);

	// Get artwork images for linking
	const getArtworkImages = db.prepare(`
		SELECT ai.media_id, ai.is_primary, ai.order_index
		FROM artwork_images ai
		WHERE ai.artwork_id = ?
		ORDER BY ai.is_primary DESC, ai.order_index ASC
	`);

	const insertShopProductImage = db.prepare(`
		INSERT INTO shop_product_images (product_id, media_id, is_primary, order_index)
		VALUES (?, ?, ?, ?)
	`);

	let created = 0;
	let failed = 0;
	const now = new Date().toISOString();

	for (const artwork of artworksToSync) {
		try {
			// Create shopProduct
			const result = insertShopProduct.run({
				artwork_id: artwork.id,
				sku: `ART-${artwork.id.substring(0, 8).toUpperCase()}`,
				title_en: artwork.title_en,
				title_ru: artwork.title_ru,
				title_es: artwork.title_es,
				title_zh: artwork.title_zh,
				description_en: artwork.description_en,
				description_ru: artwork.description_ru,
				description_es: artwork.description_es,
				description_zh: artwork.description_zh,
				price_eur: artwork.price,
				stock_quantity: 1,
				is_unlimited: 0,
				shipping_class: 'fragile',
				is_visible: 1,
				is_featured: 0,
				order_index: 0,
				created_at: now,
				updated_at: now
			});

			const shopProductId = result.lastInsertRowid;

			// Copy artwork images to shop product
			const images = getArtworkImages.all(artwork.id) as {
				media_id: number;
				is_primary: number;
				order_index: number;
			}[];
			for (const img of images) {
				insertShopProductImage.run(shopProductId, img.media_id, img.is_primary, img.order_index);
			}

			console.log(`   CREATED: ${artwork.title_en} (${images.length} images)`);
			created++;
		} catch (err) {
			console.log(`   FAILED: ${artwork.title_en} - ${err}`);
			failed++;
		}
	}

	console.log('\n[4/4] Sync complete!');
	console.log('============================================================');
	console.log(`SUMMARY:`);
	console.log(`   Created: ${created}`);
	console.log(`   Failed: ${failed}`);
	console.log('============================================================');

	db.close();
}

main();
