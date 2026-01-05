/**
 * Artwork-Shop Sync Service
 *
 * Handles automatic synchronization between artworks and shopProducts.
 * When an artwork has is_for_sale=true AND price > 0, a corresponding
 * shopProduct is automatically created/updated.
 *
 * @version 1.0
 * @date 2026-01-05
 */

import { db } from '$lib/server/db/client';
import {
	artworks,
	shopProducts,
	shopProductImages,
	artworkImages,
	media,
	type Artwork,
	type NewShopProduct
} from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Sync artwork to shopProduct when is_for_sale changes
 * Called from artwork save action
 */
export async function syncArtworkToShop(artworkId: string): Promise<{
	success: boolean;
	action: 'created' | 'updated' | 'removed' | 'skipped';
	shopProductId?: number;
	error?: string;
}> {
	try {
		// Get the artwork
		const [artwork] = await db.select().from(artworks).where(eq(artworks.id, artworkId)).limit(1);

		if (!artwork) {
			return { success: false, action: 'skipped', error: 'Artwork not found' };
		}

		// Check if artwork should be in shop
		const shouldBeInShop = artwork.is_for_sale === true && artwork.price !== null && artwork.price > 0;

		// Find existing shop product for this artwork
		const [existingProduct] = await db
			.select()
			.from(shopProducts)
			.where(eq(shopProducts.artwork_id, artworkId))
			.limit(1);

		if (!shouldBeInShop) {
			// Artwork should NOT be in shop
			if (existingProduct) {
				// Remove from shop
				await removeArtworkFromShop(artworkId);
				return { success: true, action: 'removed' };
			}
			return { success: true, action: 'skipped' };
		}

		// Artwork SHOULD be in shop
		if (existingProduct) {
			// Update existing product
			await updateShopProductFromArtwork(existingProduct.id, artwork);
			return { success: true, action: 'updated', shopProductId: existingProduct.id };
		} else {
			// Create new product
			const newProductId = await createShopProductFromArtwork(artwork);
			return { success: true, action: 'created', shopProductId: newProductId };
		}
	} catch (error) {
		console.error('Error syncing artwork to shop:', error);
		return { success: false, action: 'skipped', error: String(error) };
	}
}

/**
 * Create shopProduct from artwork
 */
async function createShopProductFromArtwork(artwork: Artwork): Promise<number> {
	// Create shop product
	const productData: NewShopProduct = {
		sku: `ART-${artwork.id}`,
		artwork_id: artwork.id,
		title_en: artwork.title_en,
		title_ru: artwork.title_ru,
		title_es: artwork.title_es,
		title_zh: artwork.title_zh,
		description_en: artwork.technique ? `${artwork.technique}${artwork.dimensions ? `, ${artwork.dimensions}` : ''}` : null,
		description_ru: artwork.technique ? `${artwork.technique}${artwork.dimensions ? `, ${artwork.dimensions}` : ''}` : null,
		description_es: artwork.technique ? `${artwork.technique}${artwork.dimensions ? `, ${artwork.dimensions}` : ''}` : null,
		description_zh: artwork.technique ? `${artwork.technique}${artwork.dimensions ? `, ${artwork.dimensions}` : ''}` : null,
		price_eur: artwork.price || 0,
		compare_price_eur: null,
		stock_quantity: 1, // Artworks are usually unique
		is_unlimited: false,
		shipping_class: 'fragile', // Artworks need careful handling
		weight_kg: null,
		dimensions_cm: artwork.dimensions,
		is_visible: true,
		is_featured: artwork.is_featured || false,
		order_index: 0
	};

	const [newProduct] = await db.insert(shopProducts).values(productData).returning();

	// Copy artwork images to shop product images
	await copyArtworkImagesToShopProduct(artwork.id, newProduct.id);

	return newProduct.id;
}

/**
 * Update shopProduct from artwork
 */
async function updateShopProductFromArtwork(productId: number, artwork: Artwork): Promise<void> {
	await db
		.update(shopProducts)
		.set({
			title_en: artwork.title_en,
			title_ru: artwork.title_ru,
			title_es: artwork.title_es,
			title_zh: artwork.title_zh,
			description_en: artwork.technique ? `${artwork.technique}${artwork.dimensions ? `, ${artwork.dimensions}` : ''}` : null,
			description_ru: artwork.technique ? `${artwork.technique}${artwork.dimensions ? `, ${artwork.dimensions}` : ''}` : null,
			description_es: artwork.technique ? `${artwork.technique}${artwork.dimensions ? `, ${artwork.dimensions}` : ''}` : null,
			description_zh: artwork.technique ? `${artwork.technique}${artwork.dimensions ? `, ${artwork.dimensions}` : ''}` : null,
			price_eur: artwork.price || 0,
			dimensions_cm: artwork.dimensions,
			is_featured: artwork.is_featured || false,
			updated_at: new Date().toISOString()
		})
		.where(eq(shopProducts.id, productId));

	// Optionally update images (only if artwork images changed)
	// For now, we'll just ensure images exist
	const existingImages = await db
		.select()
		.from(shopProductImages)
		.where(eq(shopProductImages.product_id, productId));

	if (existingImages.length === 0) {
		await copyArtworkImagesToShopProduct(artwork.id, productId);
	}
}

/**
 * Copy artwork images to shop product images
 */
async function copyArtworkImagesToShopProduct(artworkId: string, productId: number): Promise<void> {
	// Get artwork images
	const artworkImgs = await db
		.select({
			media_id: artworkImages.media_id,
			is_primary: artworkImages.is_primary,
			order_index: artworkImages.order_index
		})
		.from(artworkImages)
		.where(eq(artworkImages.artwork_id, artworkId))
		.orderBy(artworkImages.order_index);

	// Insert as shop product images
	for (const img of artworkImgs) {
		await db.insert(shopProductImages).values({
			product_id: productId,
			media_id: img.media_id,
			is_primary: img.is_primary,
			order_index: img.order_index
		});
	}
}

/**
 * Remove auto-created shopProduct for artwork
 * Only removes products that were auto-created (have artwork_id set)
 */
async function removeArtworkFromShop(artworkId: string): Promise<void> {
	// Find product linked to this artwork
	const [product] = await db
		.select({ id: shopProducts.id })
		.from(shopProducts)
		.where(eq(shopProducts.artwork_id, artworkId))
		.limit(1);

	if (!product) {
		return;
	}

	// Delete product images first (foreign key constraint)
	await db.delete(shopProductImages).where(eq(shopProductImages.product_id, product.id));

	// Delete the product
	await db.delete(shopProducts).where(eq(shopProducts.id, product.id));
}

/**
 * Bulk sync all artworks that have is_for_sale=true and price
 * Useful for initial migration
 */
export async function syncAllArtworksToShop(): Promise<{
	created: number;
	updated: number;
	removed: number;
	errors: string[];
}> {
	const stats = {
		created: 0,
		updated: 0,
		removed: 0,
		errors: [] as string[]
	};

	// Get all artworks
	const allArtworks = await db.select().from(artworks);

	for (const artwork of allArtworks) {
		const result = await syncArtworkToShop(artwork.id);

		if (result.success) {
			if (result.action === 'created') stats.created++;
			else if (result.action === 'updated') stats.updated++;
			else if (result.action === 'removed') stats.removed++;
		} else if (result.error) {
			stats.errors.push(`${artwork.id}: ${result.error}`);
		}
	}

	return stats;
}

/**
 * Check if an artwork has a linked shop product
 */
export async function hasShopProduct(artworkId: string): Promise<boolean> {
	const [product] = await db
		.select({ id: shopProducts.id })
		.from(shopProducts)
		.where(eq(shopProducts.artwork_id, artworkId))
		.limit(1);

	return product !== undefined;
}

/**
 * Get shop product for artwork
 */
export async function getShopProductForArtwork(artworkId: string): Promise<{
	id: number;
	slug: string;
} | null> {
	const result = await db
		.select({
			id: shopProducts.id,
			artworkSlug: artworks.slug
		})
		.from(shopProducts)
		.leftJoin(artworks, eq(shopProducts.artwork_id, artworks.id))
		.where(eq(shopProducts.artwork_id, artworkId))
		.limit(1);

	if (result.length === 0 || !result[0].artworkSlug) {
		return null;
	}

	return {
		id: result[0].id,
		slug: result[0].artworkSlug
	};
}
