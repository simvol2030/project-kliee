# Feedback v12 - Works DB Integration + Shop Link (Variant 2)

**Date:** 2026-01-05
**Environment:** https://k-liee.com
**Branch to create:** claude/works-db-integration-v12
**Score:** 19 (Developer task)

---

## Context

Works section currently uses JSON provider (`artworks-json.provider.ts`) created as quick fix (Variant 1). Now need to implement full DB integration (Variant 2) **with Shop integration**.

**Current state:**
- 74 artworks in `data/artworks.json`
- 8 series in `data/series.json`
- Works pages use `artworks-json.provider.ts` (sync, JSON)
- Admin panel already uses `artworks.provider.ts` (async, DB)
- DB tables already exist: `artworks`, `series`, `artworkImages`, `media`, `shopProducts`
- Shop currently reads ONLY from `shopProducts` table

**Key business requirement:**
> "Работы из раздела Works должны быть связаны с Shop. В админке должна быть галочка 'продаётся', и если стоит - работа появляется в магазине с ценой."

---

## Architecture Decision: Unified Approach

**Chosen approach:** Artworks with `is_for_sale=true` and `price` → automatically appear in Shop.

```
artworks table
├── is_for_sale = true/false (галочка в админке)
├── price = цена (EUR)
└── is_visible = видимость
        │
        │ if is_for_sale=true && price > 0
        ▼
Shop displays artwork as product
```

**Why:** Single point of truth. Artist edits artwork in one place, toggles "for sale", sets price → appears in Shop.

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
price                   →  price (integer, cents)
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

### Phase 3: Shop Integration (CRITICAL)

**Goal:** Shop displays artworks where `is_for_sale=true` AND `price > 0`.

#### ⚠️ CRITICAL COMPATIBILITY ISSUE

**Problem discovered during audit:**
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

**Implementation approach:**

**Step 3a: Create sync function** in `src/lib/data/artwork-shop-sync.ts`:

```typescript
/**
 * Sync artwork to shopProduct when is_for_sale changes
 * Called from artwork save action
 */
export async function syncArtworkToShop(artworkId: string): Promise<void> {
  const artwork = await getArtworkById(artworkId);

  if (!artwork || !artwork.is_for_sale || !artwork.price) {
    // Remove from shop if exists
    await removeArtworkFromShop(artworkId);
    return;
  }

  // Create or update shopProduct
  await upsertShopProductFromArtwork(artwork);
}
```

**Step 3b: Call sync on artwork save**

Modify `src/routes/(admin)/artworks/[id]/+page.server.ts`:
- After saving artwork, call `syncArtworkToShop(artworkId)`

**Step 3c: Migration script also syncs**

In migration script, after inserting artwork:
- If `is_for_sale=true` AND `price > 0` → create shopProduct

#### Benefits of this approach:
- ✅ Cart API unchanged (still uses product_id)
- ✅ Shop pages unchanged (still reads shopProducts)
- ✅ Single source of truth (artwork)
- ✅ Automatic sync on save
- ✅ Artist manages everything in /admin/artworks

### Phase 4: Admin UI Enhancement (Optional but recommended)

**In artworks admin edit page** (`src/routes/(admin)/artworks/[id]/+page.svelte`):

Already has:
- ✅ `isForSale` checkbox (line 35)
- ✅ `price` input (line 33)
- ✅ `currency` select (line 34)

**Consider adding:**
- Visual indicator when artwork will appear in Shop
- Preview link to Shop page

---

## Files Reference

### Existing (DO NOT MODIFY unless necessary):
- `src/lib/server/db/schema.ts` - DB schema (artworks, series, artworkImages, media)
- `src/lib/data/artworks.provider.ts` - DB provider with 13+ functions
- `src/routes/(admin)/artworks/` - Admin CRUD (already works with DB)

### To Create:
- `frontend-sveltekit/scripts/migrate-artworks-to-db.ts` - one-time migration
- `src/lib/data/artwork-shop-sync.ts` - sync artwork ↔ shopProduct

### To Modify:
- `src/routes/[lang=locale]/works/[slug]/+page.server.ts` - switch provider
- `src/routes/(admin)/artworks/[id]/+page.server.ts` - call sync on save

### Data Sources:
- `data/artworks.json` - 74 artworks with multilingual fields
- `data/series.json` - 8 series definitions

---

## Important Notes

1. **Technique field:** JSON has `{en, ru, es, zh}`, DB has single `technique`. Use English only.

2. **Series foreign key:** Series must exist before artworks. Migrate series first.

3. **Duplicate handling:** Check by ID before insert, skip existing.

4. **Images:** Create media records pointing to existing paths. Files already served via nginx at `/images/works/`.

5. **DB location:** `../data/db/sqlite/app.db` (relative to frontend-sveltekit)

6. **Price format:** JSON has `price: null` for most items. These will have `is_for_sale=true` but no price → visible in Works but NOT in Shop until price is set in admin.

7. **Shop compatibility:** Artworks appearing in Shop must return same `PublicShopProduct` interface used by existing Shop components.

---

## Schema Reference

### artworks table (existing):
```sql
id TEXT PRIMARY KEY
slug TEXT UNIQUE
series_id TEXT REFERENCES series(id)
title_en, title_ru, title_es, title_zh TEXT
description_en, _ru, _es, _zh TEXT
technique TEXT
dimensions TEXT
year INTEGER
price INTEGER              -- Price in cents
currency TEXT DEFAULT 'EUR'
is_featured BOOLEAN
is_for_sale BOOLEAN        -- ← KEY FIELD for Shop
is_visible BOOLEAN
order_index INTEGER
seo_* fields
created_at, updated_at
```

### series table (existing):
```sql
id TEXT PRIMARY KEY
slug TEXT UNIQUE
name_en, name_ru, name_es, name_zh TEXT
description_en, _ru, _es, _zh TEXT
cover_image_id INTEGER REFERENCES media(id)
order_index INTEGER
is_visible BOOLEAN
show_in_shop BOOLEAN       -- ← Can filter Shop by series
```

---

## Verification Checklist

After implementation:

**Phase 1 - Migration:**
- [ ] Migration script runs without errors
- [ ] 8 series in `series` table
- [ ] 74 artworks in `artworks` table
- [ ] Media records created for images
- [ ] artworkImages linked correctly

**Phase 2 - Works pages:**
- [ ] All 8 Works pages display artworks correctly
- [ ] Admin artworks list shows all 74 items

**Phase 3 - Shop sync:**
- [ ] `artwork-shop-sync.ts` created with sync functions
- [ ] Artworks with is_for_sale=true + price → have shopProduct
- [ ] shopProduct.artwork_id links back to artwork
- [ ] Setting is_for_sale=true + price=1000 in admin → shopProduct created
- [ ] Setting is_for_sale=false in admin → shopProduct removed
- [ ] Shop page shows synced products
- [ ] Cart add works for artwork-based shopProducts
- [ ] Checkout flow works

**Quality:**
- [ ] No TypeScript errors (`npm run check`)
- [ ] Build passes (`npm run build`)

---

## Rollback Plan

If something breaks:
1. Revert `+page.server.ts` to use JSON provider
2. Revert shop.provider.ts changes
3. Works pages will use JSON again (Variant 1)
4. Shop continues to work with shopProducts only
5. DB data remains for admin panel

---

## Testing Scenarios

1. **Works page:** Visit /en/works/chebu-rasha → see artworks
2. **Shop page:** Visit /en/shop → see artworks with is_for_sale=true AND price
3. **Admin toggle:** Edit artwork → set is_for_sale=true, price=1000 → appears in Shop
4. **Admin untoggle:** Edit artwork → set is_for_sale=false → disappears from Shop
5. **Cart:** Add artwork to cart → proceed to checkout

---

*Integrator: Claude Code CLI*
*Ready for: Claude Code Web Developer*
*Last updated: 2026-01-05 (added Shop integration phase)*
