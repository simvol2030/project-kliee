/**
 * Migration Script: artworks → shop_products
 *
 * Copies all artworks with is_for_sale=true into shop_products table,
 * linking them via artwork_id. Also copies artwork images to shop_product_images.
 *
 * Run this once after deploying to populate shop_products from existing artworks.
 *
 * Usage: npx tsx src/lib/server/db/migrate-shop-products.ts
 */

import { db } from './client';
import { artworks, artworkImages, shopProducts, shopProductImages } from './schema';
import { eq } from 'drizzle-orm';

async function migrateArtworksToShopProducts() {
	console.log('Starting migration: artworks → shop_products...\n');

	// Get all visible artworks that are for sale
	const artworksForSale = await db
		.select()
		.from(artworks)
		.where(eq(artworks.is_for_sale, true));

	console.log(`Found ${artworksForSale.length} artworks with is_for_sale=true`);

	if (artworksForSale.length === 0) {
		console.log('No artworks to migrate.');
		return;
	}

	let created = 0;
	let skipped = 0;
	let imagesCopied = 0;

	for (const artwork of artworksForSale) {
		// Check if already migrated (by artwork_id)
		const [existing] = await db
			.select({ id: shopProducts.id })
			.from(shopProducts)
			.where(eq(shopProducts.artwork_id, artwork.id))
			.limit(1);

		if (existing) {
			console.log(`  - Skipping "${artwork.title_en}" (already exists as product #${existing.id})`);
			skipped++;
			continue;
		}

		// Create shop product
		const [newProduct] = await db
			.insert(shopProducts)
			.values({
				artwork_id: artwork.id,
				sku: null, // Admin can add SKU later
				title_en: artwork.title_en,
				title_ru: artwork.title_ru,
				title_es: artwork.title_es,
				title_zh: artwork.title_zh,
				description_en: artwork.description_en,
				description_ru: artwork.description_ru,
				description_es: artwork.description_es,
				description_zh: artwork.description_zh,
				price_eur: artwork.price || 0,
				compare_price_eur: null,
				stock_quantity: 1, // Artworks are unique
				is_unlimited: false,
				shipping_class: 'fragile', // Artworks are fragile by default
				weight_kg: null,
				dimensions_cm: artwork.dimensions,
				is_visible: artwork.is_visible ?? true,
				is_featured: artwork.is_featured ?? false,
				order_index: artwork.order_index || 0
			})
			.returning();

		console.log(`  + Created product #${newProduct.id} from artwork "${artwork.title_en}"`);
		created++;

		// Copy artwork images to shop product images
		const artworkImagesRows = await db
			.select()
			.from(artworkImages)
			.where(eq(artworkImages.artwork_id, artwork.id));

		for (const img of artworkImagesRows) {
			await db.insert(shopProductImages).values({
				product_id: newProduct.id,
				media_id: img.media_id,
				is_primary: img.is_primary ?? false,
				order_index: img.order_index || 0
			});
			imagesCopied++;
		}
	}

	console.log('\n=== Migration Summary ===');
	console.log(`Products created: ${created}`);
	console.log(`Products skipped (already exist): ${skipped}`);
	console.log(`Images copied: ${imagesCopied}`);
	console.log('\nMigration complete!');
}

// Run migration
migrateArtworksToShopProducts()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Migration failed:', err);
		process.exit(1);
	});
