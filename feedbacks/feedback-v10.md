# Feedback v10 - Shop Products Integration (Public + Admin)

**Date:** 2025-12-23
**Priority:** CRITICAL
**Score:** 18
**Branch:** `claude/shop-products-integration-v10`

---

## Summary

Feedback v9 создал админку для shop_products, но она **не связана** с публичным магазином.
Нужно интегрировать: изменения в админке должны отображаться на сайте.

---

## Текущая проблема

```
Админка (/shop/products) → управляет shop_products (пустая)
Публичный магазин (/en/shop) → читает artworks

= Нет связи. Изменения в админке не влияют на сайт.
```

---

## Целевая архитектура

```
┌─────────────────┐         ┌─────────────────┐
│    artworks     │◄────────│  shop_products  │
│  (каталог работ)│artwork_id│ (товары магазина)│
│  - изображения  │         │  - price_eur    │
│  - описания     │         │  - stock        │
│  - техника      │         │  - is_visible   │
└─────────────────┘         └────────┬────────┘
                                     │
                            ┌────────┴────────┐
                            ▼                 ▼
                    ┌──────────────┐  ┌──────────────┐
                    │Публичный магазин│  │   Админка    │
                    │  /en/shop    │  │/shop/products│
                    └──────────────┘  └──────────────┘
```

**Принцип работы:**
- `shop_products.artwork_id` → ссылка на artwork для изображений/описаний
- `shop_products.artwork_id = NULL` → standalone товар (мерч, принты)
- Публичный магазин читает ТОЛЬКО из `shop_products`

---

## Шаг 1: Миграция данных

Создать скрипт миграции artworks → shop_products:

**Файл:** `src/lib/server/db/migrate-shop-products.ts`

```typescript
import { db } from './index';
import { artworks, shopProducts } from './schema';
import { eq } from 'drizzle-orm';

export async function migrateArtworksToShopProducts() {
  // Получить все artworks с is_for_sale = true
  const forSaleArtworks = await db
    .select()
    .from(artworks)
    .where(eq(artworks.is_for_sale, true));

  for (const artwork of forSaleArtworks) {
    // Проверить, не существует ли уже
    const existing = await db
      .select()
      .from(shopProducts)
      .where(eq(shopProducts.artwork_id, artwork.id));

    if (existing.length === 0) {
      await db.insert(shopProducts).values({
        artwork_id: artwork.id,
        title_en: artwork.title_en,
        title_ru: artwork.title_ru,
        title_es: artwork.title_es,
        title_zh: artwork.title_zh,
        price_eur: artwork.price || 0,
        stock_quantity: 1,
        is_unlimited: false, // оригиналы - единственный экземпляр
        shipping_class: 'fragile',
        is_visible: true,
        is_featured: false,
        order_index: artwork.order_index || 0
      });
    }
  }

  return { migrated: forSaleArtworks.length };
}
```

**API endpoint для запуска:** `src/routes/api/admin/migrate-products/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { migrateArtworksToShopProducts } from '$lib/server/db/migrate-shop-products';

export async function POST({ locals }) {
  if (!locals.admin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await migrateArtworksToShopProducts();
  return json(result);
}
```

---

## Шаг 2: Shop Provider для публичного магазина

**Файл:** `src/lib/data/shop.provider.ts` — добавить функции:

```typescript
// Для публичного магазина - получить видимые товары
export async function getVisibleProducts(locale: string = 'en') {
  const result = await db
    .select({
      id: shopProducts.id,
      artwork_id: shopProducts.artwork_id,
      title: shopProducts[`title_${locale}` as keyof typeof shopProducts],
      price_eur: shopProducts.price_eur,
      compare_price_eur: shopProducts.compare_price_eur,
      stock_quantity: shopProducts.stock_quantity,
      is_unlimited: shopProducts.is_unlimited,
      is_featured: shopProducts.is_featured,
      // Данные из artwork
      artwork_title: artworks[`title_${locale}` as keyof typeof artworks],
      artwork_slug: artworks.slug,
      artwork_technique: artworks.technique,
      artwork_dimensions: artworks.dimensions,
      artwork_year: artworks.year,
      // Изображение
      image_filename: media.stored_filename,
      image_folder: media.folder
    })
    .from(shopProducts)
    .leftJoin(artworks, eq(shopProducts.artwork_id, artworks.id))
    .leftJoin(media, eq(artworks.primary_image_id, media.id))
    .where(eq(shopProducts.is_visible, true))
    .orderBy(shopProducts.order_index);

  return result.map(row => ({
    id: row.id,
    artwork_id: row.artwork_id,
    title: row.title || row.artwork_title || 'Untitled',
    slug: row.artwork_slug || `product-${row.id}`,
    price_eur: row.price_eur,
    compare_price_eur: row.compare_price_eur,
    stock_quantity: row.stock_quantity,
    is_unlimited: row.is_unlimited,
    is_featured: row.is_featured,
    technique: row.artwork_technique,
    dimensions: row.artwork_dimensions,
    year: row.artwork_year,
    image: row.image_filename ? {
      url: `/uploads/${row.image_folder || 'artworks'}/${row.image_filename}`,
      folder: row.image_folder,
      filename: row.image_filename
    } : null
  }));
}

// Для страницы товара - получить по slug
export async function getProductBySlug(slug: string, locale: string = 'en') {
  const result = await db
    .select({
      id: shopProducts.id,
      artwork_id: shopProducts.artwork_id,
      sku: shopProducts.sku,
      title: shopProducts[`title_${locale}` as keyof typeof shopProducts],
      description: shopProducts[`description_${locale}` as keyof typeof shopProducts],
      price_eur: shopProducts.price_eur,
      compare_price_eur: shopProducts.compare_price_eur,
      stock_quantity: shopProducts.stock_quantity,
      is_unlimited: shopProducts.is_unlimited,
      shipping_class: shopProducts.shipping_class,
      weight_kg: shopProducts.weight_kg,
      dimensions_cm: shopProducts.dimensions_cm,
      // Artwork data
      artwork: artworks
    })
    .from(shopProducts)
    .leftJoin(artworks, eq(shopProducts.artwork_id, artworks.id))
    .where(eq(artworks.slug, slug))
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];

  // Получить изображения
  const images = await getProductImages(row.id, row.artwork_id);

  return {
    ...row,
    title: row.title || row.artwork?.[`title_${locale}`] || 'Untitled',
    description: row.description || row.artwork?.[`description_${locale}`],
    images
  };
}

// Получить изображения товара
async function getProductImages(productId: number, artworkId: string | null) {
  // Сначала проверить shop_product_images
  const productImages = await db
    .select()
    .from(shopProductImages)
    .leftJoin(media, eq(shopProductImages.media_id, media.id))
    .where(eq(shopProductImages.product_id, productId))
    .orderBy(shopProductImages.order_index);

  if (productImages.length > 0) {
    return productImages.map(img => ({
      url: `/uploads/${img.media?.folder || 'products'}/${img.media?.stored_filename}`,
      is_primary: img.shop_product_images.is_primary
    }));
  }

  // Fallback на artwork images
  if (artworkId) {
    const artworkImages = await db
      .select()
      .from(artworkImages)
      .leftJoin(media, eq(artworkImages.media_id, media.id))
      .where(eq(artworkImages.artwork_id, artworkId))
      .orderBy(artworkImages.order_index);

    return artworkImages.map(img => ({
      url: `/uploads/${img.media?.folder || 'artworks'}/${img.media?.stored_filename}`,
      is_primary: img.artwork_images.is_primary
    }));
  }

  return [];
}

// Для корзины - получить товар по ID
export async function getProductById(productId: number, locale: string = 'en') {
  // Similar to getProductBySlug but by ID
}
```

---

## Шаг 3: Обновить публичный магазин

### 3.1 Список товаров

**Файл:** `src/routes/[lang=locale]/shop/+page.server.ts`

```typescript
import { getVisibleProducts } from '$lib/data/shop.provider';

export async function load({ params }) {
  const locale = params.lang;
  const products = await getVisibleProducts(locale);

  return {
    products,
    locale
  };
}
```

### 3.2 Страница товара

**Файл:** `src/routes/[lang=locale]/shop/[slug]/+page.server.ts`

```typescript
import { getProductBySlug } from '$lib/data/shop.provider';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const product = await getProductBySlug(params.slug, params.lang);

  if (!product) {
    throw error(404, 'Product not found');
  }

  return {
    product,
    locale: params.lang
  };
}
```

### 3.3 Обновить Svelte компоненты

**`/shop/+page.svelte`** — использовать `data.products` вместо `data.artworks`

**`/shop/[slug]/+page.svelte`** — использовать `data.product` вместо `data.artwork`

---

## Шаг 4: Обновить Cart API

**Файл:** `src/routes/api/shop/cart/+server.ts`

Изменить структуру cart item:
- Было: `artwork_id`
- Стало: `product_id`

```typescript
interface CartItem {
  product_id: number;  // ← изменено с artwork_id
  quantity: number;
}
```

При добавлении в корзину проверять stock из shop_products.

---

## Шаг 5: Обновить Checkout

**Файл:** `src/routes/[lang=locale]/checkout/+page.server.ts`

При создании заказа:
- Сохранять `product_id` вместо `artwork_id`
- Уменьшать `stock_quantity` в shop_products
- Проверять наличие перед оформлением

---

## Шаг 6: Обновить схему orders (если нужно)

**Файл:** `src/lib/server/db/schema.ts`

Добавить в `order_items`:
```typescript
product_id: integer('product_id').references(() => shopProducts.id)
```

---

## Файлы для изменения

### Новые файлы:
1. `src/lib/server/db/migrate-shop-products.ts`
2. `src/routes/api/admin/migrate-products/+server.ts`

### Изменить:
1. `src/lib/data/shop.provider.ts` — добавить функции для публичного магазина
2. `src/routes/[lang=locale]/shop/+page.server.ts` — читать из shop_products
3. `src/routes/[lang=locale]/shop/+page.svelte` — адаптировать под новую структуру
4. `src/routes/[lang=locale]/shop/[slug]/+page.server.ts` — читать из shop_products
5. `src/routes/[lang=locale]/shop/[slug]/+page.svelte` — адаптировать
6. `src/routes/api/shop/cart/+server.ts` — product_id вместо artwork_id
7. `src/routes/[lang=locale]/cart/+page.svelte` — адаптировать
8. `src/routes/[lang=locale]/checkout/+page.svelte` — адаптировать
9. `src/lib/stores/cart.svelte.ts` — product_id вместо artwork_id

---

## Порядок выполнения

1. ✅ Создать миграционный скрипт
2. ✅ Добавить функции в shop.provider.ts
3. ✅ Обновить /shop (список)
4. ✅ Обновить /shop/[slug] (деталка)
5. ✅ Обновить Cart API и store
6. ✅ Обновить Checkout
7. ✅ npm run check — 0 errors
8. ✅ npm run build — success
9. ✅ Запустить миграцию данных

---

## Acceptance Criteria

### Must Have:
- [ ] Публичный магазин показывает товары из shop_products
- [ ] Изменение цены в админке → цена меняется на сайте
- [ ] Изменение is_visible=false → товар исчезает из магазина
- [ ] Изменение stock=0 → показывает "Нет в наличии"
- [ ] Добавление нового товара → появляется в магазине
- [ ] Корзина работает с product_id
- [ ] Checkout создаёт заказ с product_id

### Testing:
1. Запустить миграцию artworks → shop_products
2. Проверить /en/shop — товары отображаются
3. В админке изменить цену → проверить на сайте
4. В админке скрыть товар → проверить исчезновение
5. Добавить товар в корзину → оформить заказ

---

## После завершения

```bash
npm run check  # 0 errors
npm run build  # success

git add .
git commit -m "feat: integrate shop_products with public shop"
git push origin claude/shop-products-integration-v10
```

---

*Generated by Claude Code CLI (Integrator)*
*Workflow v4.2 | 2025-12-23*
