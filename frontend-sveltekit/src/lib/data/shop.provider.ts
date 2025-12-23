/**
 * Shop Products Data Provider
 *
 * CRUD operations for shop products management.
 * Reads from SQLite database via Drizzle ORM.
 *
 * @version 1.0
 * @date 2025-12-23
 */

import { db } from '$lib/server/db/client';
import {
	shopProducts,
	shopProductImages,
	media,
	artworks,
	artworkImages,
	type ShopProduct,
	type NewShopProduct
} from '$lib/server/db/schema';
import { eq, desc, asc, and, like, or } from 'drizzle-orm';
import type { LanguageCode } from '$lib/types/content.types';

export interface ShopProductWithDetails extends ShopProduct {
	primaryImage?: {
		id: number;
		url: string;
		folder: string;
		filename: string;
	} | null;
	artworkTitle?: string | null;
}

export interface ShopProductLocalized {
	id: number;
	sku: string | null;
	title: string;
	description: string | null;
	price_eur: number;
	compare_price_eur: number | null;
	stock_quantity: number | null;
	is_unlimited: boolean | null;
	shipping_class: string | null;
	is_visible: boolean | null;
	is_featured: boolean | null;
	primaryImage: string | null;
	artwork_id: string | null;
}

/**
 * Get localized title
 */
function getLocalizedTitle(product: ShopProduct, locale: LanguageCode): string {
	switch (locale) {
		case 'ru':
			return product.title_ru;
		case 'es':
			return product.title_es;
		case 'zh':
			return product.title_zh;
		default:
			return product.title_en;
	}
}

/**
 * Get localized description
 */
function getLocalizedDescription(product: ShopProduct, locale: LanguageCode): string | null {
	switch (locale) {
		case 'ru':
			return product.description_ru;
		case 'es':
			return product.description_es;
		case 'zh':
			return product.description_zh;
		default:
			return product.description_en;
	}
}

/**
 * Get all shop products with primary images
 */
export async function getAllShopProducts(): Promise<ShopProductWithDetails[]> {
	const result = await db
		.select({
			product: shopProducts,
			imageId: media.id,
			imageFilename: media.stored_filename,
			imageFolder: media.folder,
			artworkTitle: artworks.title_en
		})
		.from(shopProducts)
		.leftJoin(
			shopProductImages,
			and(eq(shopProductImages.product_id, shopProducts.id), eq(shopProductImages.is_primary, true))
		)
		.leftJoin(media, eq(shopProductImages.media_id, media.id))
		.leftJoin(artworks, eq(shopProducts.artwork_id, artworks.id))
		.orderBy(asc(shopProducts.order_index), desc(shopProducts.created_at));

	return result.map((row) => ({
		...row.product,
		primaryImage: row.imageFilename
			? {
					id: row.imageId!,
					url: `/uploads/${row.imageFolder || 'products'}/${row.imageFilename}`,
					folder: row.imageFolder || 'products',
					filename: row.imageFilename
				}
			: null,
		artworkTitle: row.artworkTitle
	}));
}

/**
 * Get visible shop products for public display
 */
export async function getVisibleShopProducts(locale: LanguageCode = 'en'): Promise<ShopProductLocalized[]> {
	const products = await db
		.select({
			product: shopProducts,
			imageFilename: media.stored_filename,
			imageFolder: media.folder
		})
		.from(shopProducts)
		.leftJoin(
			shopProductImages,
			and(eq(shopProductImages.product_id, shopProducts.id), eq(shopProductImages.is_primary, true))
		)
		.leftJoin(media, eq(shopProductImages.media_id, media.id))
		.where(eq(shopProducts.is_visible, true))
		.orderBy(asc(shopProducts.order_index));

	return products.map((row) => ({
		id: row.product.id,
		sku: row.product.sku,
		title: getLocalizedTitle(row.product, locale),
		description: getLocalizedDescription(row.product, locale),
		price_eur: row.product.price_eur,
		compare_price_eur: row.product.compare_price_eur,
		stock_quantity: row.product.stock_quantity,
		is_unlimited: row.product.is_unlimited,
		shipping_class: row.product.shipping_class,
		is_visible: row.product.is_visible,
		is_featured: row.product.is_featured,
		primaryImage: row.imageFilename
			? `/uploads/${row.imageFolder || 'products'}/${row.imageFilename}`
			: null,
		artwork_id: row.product.artwork_id
	}));
}

/**
 * Get shop product by ID
 */
export async function getShopProductById(id: number): Promise<ShopProductWithDetails | null> {
	const result = await db
		.select({
			product: shopProducts,
			imageId: media.id,
			imageFilename: media.stored_filename,
			imageFolder: media.folder,
			artworkTitle: artworks.title_en
		})
		.from(shopProducts)
		.leftJoin(
			shopProductImages,
			and(eq(shopProductImages.product_id, shopProducts.id), eq(shopProductImages.is_primary, true))
		)
		.leftJoin(media, eq(shopProductImages.media_id, media.id))
		.leftJoin(artworks, eq(shopProducts.artwork_id, artworks.id))
		.where(eq(shopProducts.id, id))
		.limit(1);

	if (result.length === 0) {
		return null;
	}

	const row = result[0];
	return {
		...row.product,
		primaryImage: row.imageFilename
			? {
					id: row.imageId!,
					url: `/uploads/${row.imageFolder || 'products'}/${row.imageFilename}`,
					folder: row.imageFolder || 'products',
					filename: row.imageFilename
				}
			: null,
		artworkTitle: row.artworkTitle
	};
}

/**
 * Get all images for a product
 */
export async function getProductImages(productId: number) {
	const result = await db
		.select({
			id: shopProductImages.id,
			media_id: shopProductImages.media_id,
			is_primary: shopProductImages.is_primary,
			order_index: shopProductImages.order_index,
			filename: media.stored_filename,
			folder: media.folder
		})
		.from(shopProductImages)
		.leftJoin(media, eq(shopProductImages.media_id, media.id))
		.where(eq(shopProductImages.product_id, productId))
		.orderBy(asc(shopProductImages.order_index));

	return result.map((row) => ({
		id: row.id,
		media_id: row.media_id,
		is_primary: row.is_primary,
		order_index: row.order_index,
		url: row.filename ? `/uploads/${row.folder || 'products'}/${row.filename}` : null
	}));
}

/**
 * Create a new shop product
 */
export async function createShopProduct(data: NewShopProduct): Promise<ShopProduct> {
	const result = await db.insert(shopProducts).values(data).returning();
	return result[0];
}

/**
 * Update an existing shop product
 */
export async function updateShopProduct(
	id: number,
	data: Partial<NewShopProduct>
): Promise<ShopProduct | null> {
	const result = await db
		.update(shopProducts)
		.set({ ...data, updated_at: new Date().toISOString() })
		.where(eq(shopProducts.id, id))
		.returning();

	return result[0] || null;
}

/**
 * Delete a shop product
 */
export async function deleteShopProduct(id: number): Promise<boolean> {
	const result = await db.delete(shopProducts).where(eq(shopProducts.id, id)).returning();
	return result.length > 0;
}

/**
 * Add image to product
 */
export async function addProductImage(
	productId: number,
	mediaId: number,
	isPrimary: boolean = false,
	orderIndex: number = 0
) {
	// If this is primary, unset other primary images
	if (isPrimary) {
		await db
			.update(shopProductImages)
			.set({ is_primary: false })
			.where(eq(shopProductImages.product_id, productId));
	}

	const result = await db
		.insert(shopProductImages)
		.values({
			product_id: productId,
			media_id: mediaId,
			is_primary: isPrimary,
			order_index: orderIndex
		})
		.returning();

	return result[0];
}

/**
 * Remove image from product
 */
export async function removeProductImage(imageId: number): Promise<boolean> {
	const result = await db.delete(shopProductImages).where(eq(shopProductImages.id, imageId)).returning();
	return result.length > 0;
}

/**
 * Set primary image for product
 */
export async function setPrimaryImage(productId: number, imageId: number): Promise<void> {
	// Unset all primary images for this product
	await db
		.update(shopProductImages)
		.set({ is_primary: false })
		.where(eq(shopProductImages.product_id, productId));

	// Set the new primary image
	await db
		.update(shopProductImages)
		.set({ is_primary: true })
		.where(eq(shopProductImages.id, imageId));
}

/**
 * Search shop products
 */
export async function searchShopProducts(query: string): Promise<ShopProductWithDetails[]> {
	const searchTerm = `%${query}%`;

	const result = await db
		.select({
			product: shopProducts,
			imageId: media.id,
			imageFilename: media.stored_filename,
			imageFolder: media.folder,
			artworkTitle: artworks.title_en
		})
		.from(shopProducts)
		.leftJoin(
			shopProductImages,
			and(eq(shopProductImages.product_id, shopProducts.id), eq(shopProductImages.is_primary, true))
		)
		.leftJoin(media, eq(shopProductImages.media_id, media.id))
		.leftJoin(artworks, eq(shopProducts.artwork_id, artworks.id))
		.where(
			or(
				like(shopProducts.title_en, searchTerm),
				like(shopProducts.title_ru, searchTerm),
				like(shopProducts.sku, searchTerm)
			)
		)
		.orderBy(asc(shopProducts.order_index));

	return result.map((row) => ({
		...row.product,
		primaryImage: row.imageFilename
			? {
					id: row.imageId!,
					url: `/uploads/${row.imageFolder || 'products'}/${row.imageFilename}`,
					folder: row.imageFolder || 'products',
					filename: row.imageFilename
				}
			: null,
		artworkTitle: row.artworkTitle
	}));
}

/**
 * Get featured shop products
 */
export async function getFeaturedShopProducts(
	locale: LanguageCode = 'en',
	limit: number = 6
): Promise<ShopProductLocalized[]> {
	const products = await db
		.select({
			product: shopProducts,
			imageFilename: media.stored_filename,
			imageFolder: media.folder
		})
		.from(shopProducts)
		.leftJoin(
			shopProductImages,
			and(eq(shopProductImages.product_id, shopProducts.id), eq(shopProductImages.is_primary, true))
		)
		.leftJoin(media, eq(shopProductImages.media_id, media.id))
		.where(and(eq(shopProducts.is_visible, true), eq(shopProducts.is_featured, true)))
		.orderBy(asc(shopProducts.order_index))
		.limit(limit);

	return products.map((row) => ({
		id: row.product.id,
		sku: row.product.sku,
		title: getLocalizedTitle(row.product, locale),
		description: getLocalizedDescription(row.product, locale),
		price_eur: row.product.price_eur,
		compare_price_eur: row.product.compare_price_eur,
		stock_quantity: row.product.stock_quantity,
		is_unlimited: row.product.is_unlimited,
		shipping_class: row.product.shipping_class,
		is_visible: row.product.is_visible,
		is_featured: row.product.is_featured,
		primaryImage: row.imageFilename
			? `/uploads/${row.imageFolder || 'products'}/${row.imageFilename}`
			: null,
		artwork_id: row.product.artwork_id
	}));
}

/**
 * Get products count
 */
export async function getShopProductsCount(): Promise<number> {
	const result = await db.select({ id: shopProducts.id }).from(shopProducts);
	return result.length;
}

/**
 * Update product order
 */
export async function updateProductOrder(products: { id: number; order_index: number }[]): Promise<void> {
	for (const product of products) {
		await db
			.update(shopProducts)
			.set({ order_index: product.order_index })
			.where(eq(shopProducts.id, product.id));
	}
}

/**
 * Get artworks available for linking (not already linked to a product)
 */
export async function getAvailableArtworksForLinking() {
	// Get all artwork IDs that are already linked to products
	const linkedArtworkIds = await db
		.select({ artwork_id: shopProducts.artwork_id })
		.from(shopProducts)
		.where(eq(shopProducts.artwork_id, shopProducts.artwork_id));

	const linkedIds = linkedArtworkIds
		.map((r) => r.artwork_id)
		.filter((id): id is string => id !== null);

	// Get artworks with their primary images
	const result = await db
		.select({
			artwork: artworks,
			imageFilename: media.stored_filename,
			imageFolder: media.folder
		})
		.from(artworks)
		.leftJoin(
			artworkImages,
			and(eq(artworkImages.artwork_id, artworks.id), eq(artworkImages.is_primary, true))
		)
		.leftJoin(media, eq(artworkImages.media_id, media.id))
		.where(eq(artworks.is_visible, true))
		.orderBy(desc(artworks.created_at));

	return result
		.filter((row) => !linkedIds.includes(row.artwork.id))
		.map((row) => ({
			id: row.artwork.id,
			title_en: row.artwork.title_en,
			title_ru: row.artwork.title_ru,
			price: row.artwork.price,
			currency: row.artwork.currency,
			primaryImage: row.imageFilename
				? `/uploads/${row.imageFolder || 'products'}/${row.imageFilename}`
				: null
		}));
}

// ============================================
// PUBLIC SHOP FUNCTIONS
// ============================================

export interface PublicShopProduct {
	id: number;
	slug: string; // artwork slug or product id
	title: string;
	description: string | null;
	price_eur: number;
	compare_price_eur: number | null;
	stock_quantity: number | null;
	is_unlimited: boolean | null;
	is_featured: boolean | null;
	is_available: boolean;
	primary_image: {
		url: string;
		alt: string | null;
		width: number | null;
		height: number | null;
	} | null;
	artwork_id: string | null;
	// Artwork-specific fields (if linked)
	technique: string | null;
	dimensions: string | null;
	year: number | null;
}

export interface PublicProductDetail extends PublicShopProduct {
	images: Array<{
		url: string;
		alt: string | null;
		width: number | null;
		height: number | null;
		is_primary: boolean;
	}>;
}

/**
 * Get visible shop products for public display (paginated)
 */
export async function getPublicShopProducts(
	locale: LanguageCode = 'en',
	options: {
		page?: number;
		limit?: number;
		sort?: 'price_asc' | 'price_desc' | 'newest' | 'featured';
		minPrice?: number;
		maxPrice?: number;
		ids?: number[];
	} = {}
): Promise<{ products: PublicShopProduct[]; total: number; hasMore: boolean }> {
	const { page = 1, limit = 12, sort = 'featured', minPrice, maxPrice, ids } = options;
	const offset = (page - 1) * limit;

	// Build base query
	const products = await db
		.select({
			product: shopProducts,
			artworkSlug: artworks.slug,
			artworkTechnique: artworks.technique,
			artworkDimensions: artworks.dimensions,
			artworkYear: artworks.year,
			// Primary image from shop_product_images
			imageFilename: media.stored_filename,
			imageFolder: media.folder,
			imageAltEn: media.alt_en,
			imageAltRu: media.alt_ru,
			imageAltEs: media.alt_es,
			imageAltZh: media.alt_zh,
			imageWidth: media.width,
			imageHeight: media.height
		})
		.from(shopProducts)
		.leftJoin(artworks, eq(shopProducts.artwork_id, artworks.id))
		.leftJoin(
			shopProductImages,
			and(eq(shopProductImages.product_id, shopProducts.id), eq(shopProductImages.is_primary, true))
		)
		.leftJoin(media, eq(shopProductImages.media_id, media.id))
		.where(eq(shopProducts.is_visible, true))
		.orderBy(
			sort === 'price_asc'
				? asc(shopProducts.price_eur)
				: sort === 'price_desc'
					? desc(shopProducts.price_eur)
					: sort === 'newest'
						? desc(shopProducts.created_at)
						: desc(shopProducts.is_featured)
		)
		.limit(limit)
		.offset(offset);

	// Get total count
	const countResult = await db
		.select({ id: shopProducts.id })
		.from(shopProducts)
		.where(eq(shopProducts.is_visible, true));
	const total = countResult.length;

	const mappedProducts = products.map((row): PublicShopProduct => {
		const product = row.product;
		const slug = row.artworkSlug || `product-${product.id}`;
		const isAvailable = product.is_unlimited || (product.stock_quantity ?? 0) > 0;

		// Get localized alt text
		const altText =
			locale === 'ru'
				? row.imageAltRu
				: locale === 'es'
					? row.imageAltEs
					: locale === 'zh'
						? row.imageAltZh
						: row.imageAltEn;

		return {
			id: product.id,
			slug,
			title: getLocalizedTitle(product, locale),
			description: getLocalizedDescription(product, locale),
			price_eur: product.price_eur,
			compare_price_eur: product.compare_price_eur,
			stock_quantity: product.stock_quantity,
			is_unlimited: product.is_unlimited,
			is_featured: product.is_featured,
			is_available: isAvailable,
			primary_image: row.imageFilename
				? {
						url: `/uploads/${row.imageFolder || 'products'}/${row.imageFilename}`,
						alt: altText,
						width: row.imageWidth,
						height: row.imageHeight
					}
				: null,
			artwork_id: product.artwork_id,
			technique: row.artworkTechnique,
			dimensions: row.artworkDimensions || product.dimensions_cm,
			year: row.artworkYear
		};
	});

	return {
		products: mappedProducts,
		total,
		hasMore: offset + products.length < total
	};
}

/**
 * Get product by slug (for product detail page)
 */
export async function getPublicProductBySlug(
	slug: string,
	locale: LanguageCode = 'en'
): Promise<PublicProductDetail | null> {
	// Try to find by artwork slug first
	const resultByArtwork = await db
		.select({
			product: shopProducts,
			artworkSlug: artworks.slug,
			artworkTechnique: artworks.technique,
			artworkDimensions: artworks.dimensions,
			artworkYear: artworks.year
		})
		.from(shopProducts)
		.leftJoin(artworks, eq(shopProducts.artwork_id, artworks.id))
		.where(and(eq(artworks.slug, slug), eq(shopProducts.is_visible, true)))
		.limit(1);

	// If not found by artwork slug, try by product-{id} pattern
	let productRow = resultByArtwork[0];
	if (!productRow && slug.startsWith('product-')) {
		const productId = parseInt(slug.replace('product-', ''));
		if (!isNaN(productId)) {
			const resultById = await db
				.select({
					product: shopProducts,
					artworkSlug: artworks.slug,
					artworkTechnique: artworks.technique,
					artworkDimensions: artworks.dimensions,
					artworkYear: artworks.year
				})
				.from(shopProducts)
				.leftJoin(artworks, eq(shopProducts.artwork_id, artworks.id))
				.where(and(eq(shopProducts.id, productId), eq(shopProducts.is_visible, true)))
				.limit(1);
			productRow = resultById[0];
		}
	}

	if (!productRow) {
		return null;
	}

	const product = productRow.product;
	const actualSlug = productRow.artworkSlug || `product-${product.id}`;

	// Get all images for this product
	const images = await db
		.select({
			filename: media.stored_filename,
			folder: media.folder,
			alt_en: media.alt_en,
			alt_ru: media.alt_ru,
			alt_es: media.alt_es,
			alt_zh: media.alt_zh,
			width: media.width,
			height: media.height,
			is_primary: shopProductImages.is_primary,
			order_index: shopProductImages.order_index
		})
		.from(shopProductImages)
		.leftJoin(media, eq(shopProductImages.media_id, media.id))
		.where(eq(shopProductImages.product_id, product.id))
		.orderBy(desc(shopProductImages.is_primary), asc(shopProductImages.order_index));

	const isAvailable = product.is_unlimited || (product.stock_quantity ?? 0) > 0;

	// Map images
	const mappedImages = images.map((img) => {
		const altText =
			locale === 'ru'
				? img.alt_ru
				: locale === 'es'
					? img.alt_es
					: locale === 'zh'
						? img.alt_zh
						: img.alt_en;

		return {
			url: img.filename ? `/uploads/${img.folder || 'products'}/${img.filename}` : '',
			alt: altText,
			width: img.width,
			height: img.height,
			is_primary: img.is_primary ?? false
		};
	}).filter((img) => img.url);

	const primaryImage = mappedImages.find((img) => img.is_primary) || mappedImages[0] || null;

	return {
		id: product.id,
		slug: actualSlug,
		title: getLocalizedTitle(product, locale),
		description: getLocalizedDescription(product, locale),
		price_eur: product.price_eur,
		compare_price_eur: product.compare_price_eur,
		stock_quantity: product.stock_quantity,
		is_unlimited: product.is_unlimited,
		is_featured: product.is_featured,
		is_available: isAvailable,
		primary_image: primaryImage,
		artwork_id: product.artwork_id,
		technique: productRow.artworkTechnique,
		dimensions: productRow.artworkDimensions || product.dimensions_cm,
		year: productRow.artworkYear,
		images: mappedImages
	};
}

/**
 * Get product by ID (for cart)
 */
export async function getPublicProductById(
	productId: number,
	locale: LanguageCode = 'en'
): Promise<PublicShopProduct | null> {
	const result = await db
		.select({
			product: shopProducts,
			artworkSlug: artworks.slug,
			artworkTechnique: artworks.technique,
			artworkDimensions: artworks.dimensions,
			artworkYear: artworks.year,
			imageFilename: media.stored_filename,
			imageFolder: media.folder,
			imageAltEn: media.alt_en,
			imageAltRu: media.alt_ru,
			imageAltEs: media.alt_es,
			imageAltZh: media.alt_zh,
			imageWidth: media.width,
			imageHeight: media.height
		})
		.from(shopProducts)
		.leftJoin(artworks, eq(shopProducts.artwork_id, artworks.id))
		.leftJoin(
			shopProductImages,
			and(eq(shopProductImages.product_id, shopProducts.id), eq(shopProductImages.is_primary, true))
		)
		.leftJoin(media, eq(shopProductImages.media_id, media.id))
		.where(eq(shopProducts.id, productId))
		.limit(1);

	if (result.length === 0) {
		return null;
	}

	const row = result[0];
	const product = row.product;
	const slug = row.artworkSlug || `product-${product.id}`;
	const isAvailable = product.is_unlimited || (product.stock_quantity ?? 0) > 0;

	const altText =
		locale === 'ru'
			? row.imageAltRu
			: locale === 'es'
				? row.imageAltEs
				: locale === 'zh'
					? row.imageAltZh
					: row.imageAltEn;

	return {
		id: product.id,
		slug,
		title: getLocalizedTitle(product, locale),
		description: getLocalizedDescription(product, locale),
		price_eur: product.price_eur,
		compare_price_eur: product.compare_price_eur,
		stock_quantity: product.stock_quantity,
		is_unlimited: product.is_unlimited,
		is_featured: product.is_featured,
		is_available: isAvailable,
		primary_image: row.imageFilename
			? {
					url: `/uploads/${row.imageFolder || 'products'}/${row.imageFilename}`,
					alt: altText,
					width: row.imageWidth,
					height: row.imageHeight
				}
			: null,
		artwork_id: product.artwork_id,
		technique: row.artworkTechnique,
		dimensions: row.artworkDimensions || product.dimensions_cm,
		year: row.artworkYear
	};
}
