# Feedback v12 - Works DB Integration + Shop Link (Variant 2)

**Date:** 2026-01-05
**Environment:** https://k-liee.com
**Branch to create:** claude/works-db-integration-v12
**Score:** 19 (Developer task)

---

## Context

Works section currently uses JSON provider (`artworks-json.provider.ts`) created as quick fix (Variant 1). Now need to implement full DB integration (Variant 2) **with Shop link**.

**Current state:**
- 74 artworks in `data/artworks.json`
- 8 series in `data/series.json`
- Works pages use `artworks-json.provider.ts` (sync, JSON)
- Admin panel already uses `artworks.provider.ts` (async, DB)
- DB tables already exist: `artworks`, `series`, `artworkImages`, `media`, `shopProducts`
- Shop currently reads ONLY from `shopProducts` table

---

## Business Logic (IMPORTANT)

### Works vs Shop - разделение:

| Раздел | Что показывает | Назначение |
|--------|----------------|------------|
| **Works** | ВСЕ работы (74 шт) | Портфолио/презентация |
| **Shop** | Только продающиеся | Магазин/покупка |

### Логика отображения в Works:

```
/works/[series] - галерея работ
│
├── Работа с is_for_sale=false:
│   └── Просто карточка (изображение, название, техника)
│
└── Работа с is_for_sale=true + price:
    ├── Карточка + бейдж "В продаже"
    ├── Показываем цену
    └── Ссылка → страница товара в Shop
```

### Принципы:

1. **Works (artworks) независимы** - добавляются в админке как портфолио
2. **Shop (shopProducts)** - автоматически создаётся когда `is_for_sale=true + price`
3. **Принты** - создаются вручную как отдельный shopProduct (другая цена, количество)
4. **Вариации** - пока не реализуем (принт = отдельный товар)

---

## Architecture

```
              ┌─────────────────────────────────┐
              │      Admin /artworks/[id]       │
              │  ☑ is_for_sale   💰 price       │
              └───────────────┬─────────────────┘
                              │ save
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
     ┌────────────────┐            ┌─────────────────┐
     │   artworks     │            │  shopProducts   │
     │  (все работы)  │───sync────▶│ (авто-создаётся │
     │                │            │  если is_for_sale)
     └────────┬───────┘            └────────┬────────┘
              │                             │
              ▼                             ▼
     ┌────────────────┐            ┌─────────────────┐
     │  /works/[slug] │            │     /shop       │
     │  ВСЕ работы    │            │  Только товары  │
     │  + "В продаже" │───ссылка──▶│  + корзина      │
     │  + цена        │            │                 │
     └────────────────┘            └─────────────────┘
```

---

## Task Phases

### Phase 1: Create Migration Script

**Create file:** `frontend-sveltekit/scripts/migrate-artworks-to-db.ts`

**What it should do:**
1. Read `data/artworks.json` (74 artworks)
2. Read `data/series.json` (8 series)
3. For each series:
   - Insert into `series` table if not exists (use slug as id)
4. For each artwork:
   - Check if exists by ID, skip if yes
   - Lookup series_id by slug
   - Insert into `artworks` table
   - For images: create media records, link via `artworkImages`
5. Log results

**Data mapping:**
```
JSON                    →  DB Column
--------------------------------------------
id                      →  id (text)
title.en/ru/es/zh       →  title_en/ru/es/zh
series (slug)           →  series_id (FK lookup by slug)
technique.en            →  technique (use English only)
year                    →  year
dimensions              →  dimensions
price                   →  price (integer, cents) - NULL if not set
currency                →  currency (default 'EUR')
images[]                →  artworkImages → media
available               →  is_for_sale (boolean)
```

**Image path handling:**
```
JSON: "/images/works/chebu-rasha/photo.jpg"
  ↓
Media: folder="works/chebu-rasha", stored_filename="photo.jpg"
  ↓
ArtworkImages: artwork_id=X, media_id=Y, is_primary=true (for first image)
```

### Phase 2: Switch Works Pages to DB Provider

**Modify:** `src/routes/[lang=locale]/works/[slug]/+page.server.ts`

**Change:**
```typescript
// FROM:
import { getArtworksBySeriesFromJson } from '$lib/data/artworks-json.provider';
const artworks = getArtworksBySeriesFromJson(slug, localeCode);

// TO:
import { getArtworksBySeries } from '$lib/data/artworks.provider';
const artworks = await getArtworksBySeries(slug, localeCode);
```

**Note:** DB provider is async, add `await`. Return type is same `ArtworkLocalized[]`.

### Phase 3: Works UI - "В продаже" indicator

**Goal:** На странице Works показывать для продающихся работ:
- Бейдж "В продаже" / "For Sale"
- Цену
- Ссылку на страницу товара в Shop

**Modify:** `src/routes/[lang=locale]/works/[slug]/+page.svelte`

**What to add to artwork card:**
```svelte
{#if artwork.is_for_sale && artwork.price}
  <div class="sale-badge">В продаже</div>
  <div class="price">{formatPrice(artwork.price, artwork.currency)}</div>
  <a href="/{lang}/shop/{artwork.slug}">Купить →</a>
{/if}
```

**Also need:**
- Check if corresponding shopProduct exists (by artwork_id)
- Get shopProduct.slug for link to Shop page

**Modify provider** `src/lib/data/artworks.provider.ts`:
- Add `shop_slug` field to `ArtworkLocalized` (slug of linked shopProduct, if exists)
- Join with shopProducts to get slug

### Phase 4: Shop Integration - Auto-sync

**Goal:** When artwork saved with `is_for_sale=true` + `price` → auto-create shopProduct.

#### ⚠️ CRITICAL COMPATIBILITY ISSUE

**Problem:**
- Cart API uses `product_id: number` → `shopProducts.id` (INTEGER)
- Artworks table uses `id: TEXT`
- Cart cannot directly add artworks!

#### Solution: Auto-create shopProduct for artworks

**When artwork has `is_for_sale=true` AND `price > 0`:**
1. Automatically create/update corresponding `shopProduct` record
2. Link via `shopProduct.artwork_id = artwork.id`
3. Sync: `shopProduct.price_eur = artwork.price`
4. Sync: `shopProduct.title_* = artwork.title_*`
5. Sync: images from `artworkImages` → `shopProductImages`

**When artwork has `is_for_sale=false` OR no price:**
1. Remove corresponding shopProduct (if exists and was auto-created)

**Create file:** `src/lib/data/artwork-shop-sync.ts`

```typescript
/**
 * Sync artwork to shopProduct when is_for_sale changes
 * Called from artwork save action
 */
export async function syncArtworkToShop(artworkId: string): Promise<void> {
  const artwork = await getArtworkById(artworkId);

  if (!artwork || !artwork.is_for_sale || !artwork.price) {
    // Remove from shop if exists (only auto-created ones)
    await removeArtworkFromShop(artworkId);
    return;
  }

  // Create or update shopProduct
  await upsertShopProductFromArtwork(artwork);
}

/**
 * Create or update shopProduct from artwork
 */
async function upsertShopProductFromArtwork(artwork: Artwork): Promise<void> {
  // Find existing shopProduct by artwork_id
  // If exists: update price, title, images
  // If not: create new with artwork_id reference
}

/**
 * Remove auto-created shopProduct for artwork
 */
async function removeArtworkFromShop(artworkId: string): Promise<void> {
  // Delete shopProduct where artwork_id = artworkId
  // Note: only delete if it was auto-created (not manually created prints)
}
```

**Modify:** `src/routes/(admin)/artworks/[id]/+page.server.ts`
- After saving artwork, call `syncArtworkToShop(artworkId)`

**Migration script also syncs:**
- After inserting artwork, if `is_for_sale=true` AND `price > 0` → create shopProduct

### Phase 5: Admin UI Enhancement (Optional)

**In artworks admin edit page** (`src/routes/(admin)/artworks/[id]/+page.svelte`):

Already has:
- ✅ `isForSale` checkbox
- ✅ `price` input
- ✅ `currency` select

**Consider adding:**
- Visual indicator: "Эта работа появится в магазине"
- Preview link to Shop page (if shopProduct exists)

---

## Files Reference

### Existing (DO NOT MODIFY unless necessary):
- `src/lib/server/db/schema.ts` - DB schema
- `src/lib/data/artworks.provider.ts` - DB provider
- `src/routes/(admin)/artworks/` - Admin CRUD
- `src/lib/data/shop.provider.ts` - Shop provider

### To Create:
- `frontend-sveltekit/scripts/migrate-artworks-to-db.ts` - one-time migration
- `src/lib/data/artwork-shop-sync.ts` - sync artwork ↔ shopProduct

### To Modify:
- `src/routes/[lang=locale]/works/[slug]/+page.server.ts` - switch to DB provider
- `src/routes/[lang=locale]/works/[slug]/+page.svelte` - add "Купить" link
- `src/lib/data/artworks.provider.ts` - fix image paths + add slug to response
- `src/lib/types/content.types.ts` - add slug to ArtworkLocalized interface
- `src/routes/(admin)/artworks/[id]/+page.server.ts` - call sync on save

### Data Sources:
- `data/artworks.json` - 74 artworks with multilingual fields
- `data/series.json` - 8 series definitions

---

## Important Notes

1. **Technique field:** JSON has `{en, ru, es, zh}`, DB has single `technique`. Use English only.

2. **Series foreign key:** Series must exist before artworks. Migrate series first.

3. **Duplicate handling:** Check by ID before insert, skip existing.

4. **DB location:** `../data/db/sqlite/app.db` (relative to frontend-sveltekit)

5. **Price format:** JSON has `price: null` for most items. These will have `is_for_sale=true` but no price → visible in Works but NOT in Shop until price is set in admin.

6. **Shop compatibility:** Auto-created shopProducts must work with existing Cart, Wishlist, Checkout.

7. **Manual shopProducts:** Artist can also create shopProducts manually (prints, merch) - these are independent.

---

## ⚠️ CRITICAL: Image Paths Issue (Found in Audit)

**Problem:** Current DB provider hardcodes `/uploads/` prefix:
```typescript
// artworks.provider.ts line 43
images.push(`/uploads/${folder}/${primaryImageFilename}`);
```

But JSON images use `/images/works/...` paths served by nginx.

**Solution:**

**Step A: Modify `artworks.provider.ts` (line 41-44):**
```typescript
// Build images array - handle both uploaded and static images
const images: string[] = [];
if (primaryImageFilename) {
  // If stored_filename starts with "/" - it's a full path (migrated from JSON)
  if (primaryImageFilename.startsWith('/')) {
    images.push(primaryImageFilename);
  } else {
    // Otherwise it's an uploaded file
    const folder = primaryImageFolder || 'products';
    images.push(`/uploads/${folder}/${primaryImageFilename}`);
  }
}
```

**Step B: In migration script, store full path:**
```typescript
// When creating media record for migrated images:
const mediaRecord = {
  filename: 'photo.jpg',
  stored_filename: '/images/works/chebu-rasha/photo.jpg',  // FULL PATH!
  folder: 'works/chebu-rasha',  // For reference only
  // ...
};
```

---

## ⚠️ CRITICAL: Missing `slug` in ArtworkLocalized (Found in Audit)

**Problem:** `ArtworkLocalized` interface doesn't have `slug` field, but we need it for Shop link.

**Solution:**

**Step A: Add `slug` to interface** (`src/lib/types/content.types.ts`):
```typescript
export interface ArtworkLocalized {
  id: string;
  slug: string;  // ← ADD THIS
  title: string;
  series: string;
  // ...
}
```

**Step B: Update `artworks.provider.ts`** - add slug to mapArtworkToLocalized:
```typescript
return {
  id: artwork.id,
  slug: artwork.slug || artwork.id,  // ← ADD THIS
  title,
  // ...
};
```

---

## ⚠️ Works UI Already Shows Price (Found in Audit)

**Good news:** Works page already shows price and "Available" status!

Location: `src/routes/[lang=locale]/works/[slug]/+page.svelte` lines 172-182

**Current code:**
```svelte
{#if artwork.available && artwork.price}
  <span class="price">€{artwork.price}</span>
  <span class="status available">{labels.available[locale]}</span>
{:else if !artwork.available}
  <span class="status sold">{labels.sold[locale]}</span>
{/if}
```

**What to ADD:**
```svelte
{#if artwork.available && artwork.price}
  <span class="price">€{artwork.price}</span>
  <a href="/{locale}/shop/{artwork.slug}" class="buy-link">
    {labels.buyNow[locale]}
  </a>
{:else if !artwork.available}
  <span class="status sold">{labels.sold[locale]}</span>
{/if}
```

Add label:
```typescript
buyNow: {
  en: 'Buy Now',
  ru: 'Купить',
  es: 'Comprar',
  zh: '购买'
}
```

---

## Verification Checklist

After implementation:

**Phase 1 - Migration:**
- [ ] Migration script runs without errors
- [ ] 8 series in `series` table
- [ ] 74 artworks in `artworks` table
- [ ] Media records created with FULL PATHS (e.g., `/images/works/...`)
- [ ] artworkImages linked correctly

**Phase 2 - Works pages from DB:**
- [ ] All 8 Works pages display artworks correctly
- [ ] **Images load correctly** (not 404!)
- [ ] Admin artworks list shows all 74 items

**Phase 3 - Works UI "Купить" link:**
- [ ] Artworks with available=true + price show price
- [ ] "Купить" link appears for for-sale artworks
- [ ] Link navigates to correct Shop page (`/shop/{artwork.slug}`)
- [ ] Non-sale artworks show no link

**Phase 4 - Shop sync:**
- [ ] `artwork-shop-sync.ts` created
- [ ] Setting is_for_sale=true + price → shopProduct created
- [ ] Setting is_for_sale=false → shopProduct removed
- [ ] Shop page shows synced products
- [ ] Cart works with artwork-based shopProducts

**Critical fixes:**
- [ ] `artworks.provider.ts` handles both `/images/` and `/uploads/` paths
- [ ] `ArtworkLocalized` has `slug` field
- [ ] Works UI has "Купить" link with correct href

**Quality:**
- [ ] No TypeScript errors (`npm run check`)
- [ ] Build passes (`npm run build`)

---

## Rollback Plan

If something breaks:
1. Revert `+page.server.ts` to use JSON provider
2. Revert Works UI changes
3. Works pages will use JSON again (Variant 1)
4. Shop continues to work with manually created shopProducts
5. DB data remains for admin panel

---

## Testing Scenarios

1. **Works page:** Visit /en/works/chebu-rasha → see all artworks
2. **For-sale artwork in Works:** See badge, price, link to Shop
3. **Non-sale artwork in Works:** No badge, no price, no link
4. **Shop page:** Visit /en/shop → see only for-sale items
5. **Admin toggle ON:** Edit artwork → is_for_sale=true, price=5000 → appears in Shop
6. **Admin toggle OFF:** Edit artwork → is_for_sale=false → disappears from Shop
7. **Cart:** Add artwork-based product to cart → checkout works
8. **Manual product:** Create print manually in /admin/shop/products → works independently

---

*Integrator: Claude Code CLI*
*Ready for: Claude Code Web Developer*
*Last updated: 2026-01-05 (added Works UI phase, clarified business logic)*
