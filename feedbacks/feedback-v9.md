# Feedback v9 - Admin Panel: New Features Required

**Date:** 2025-12-23
**Priority:** HIGH
**Score:** 18
**Branch:** `claude/admin-shop-products-v9`

---

## Summary

Admin panel audit completed. All 12 existing sections now work after DB schema fixes.
**Missing critical feature: Shop Products management section.**

---

## Current Admin Panel Structure

```
📊 Dashboard          ✅ Works
📷 Media              ✅ Works
🖼️ Artworks           ✅ Works
📚 Series             ✅ Works
🏛️ Exhibitions        ✅ Works
🔗 Menu (Layout)      ✅ Works
📑 Footer (Layout)    ✅ Works
🏠 Homepage           ✅ Works
🛒 Orders (Shop)      ✅ Works
💰 Shop Settings      ✅ Works
👥 Users              ✅ Works
⚙️ Settings           ✅ Works
```

---

## Feature Request 1: Shop Products Management

### Problem
The admin panel has **Shop > Orders** and **Shop > Shop Settings**, but **NO way to manage shop products**.

Currently, artworks from the `artworks` table are displayed in the shop, but:
- No way to mark which artworks are for sale
- No way to set shop-specific fields (shipping, stock, variants)
- No dedicated product management interface

### Required: New Admin Section `/shop/products`

**Location in Sidebar:** Shop section, between "Orders" and "Shop Settings"

**Icon suggestion:** 🛍️ or 📦

**Features needed:**

1. **Product List View**
   - Table with: Image, Title, Price, Stock, Status, Actions
   - Search/filter functionality
   - Bulk actions (enable/disable for shop)

2. **Product Edit View**
   - Select artwork from existing artworks (link to artwork)
   - OR create standalone shop product
   - Shop-specific fields:
     - `is_for_sale` (boolean)
     - `shop_price_eur` (may differ from artwork price)
     - `stock_quantity` (for prints/merch)
     - `is_unlimited` (for originals - always 1)
     - `shipping_class` (standard, fragile, oversized)
     - `weight_kg`, `dimensions_cm`
   - Product variants (for prints: different sizes)

3. **Database Schema**

   Option A: Add shop fields to `artworks` table
   ```sql
   ALTER TABLE artworks ADD COLUMN is_for_sale INTEGER DEFAULT 0;
   ALTER TABLE artworks ADD COLUMN shop_price_eur INTEGER;
   ALTER TABLE artworks ADD COLUMN stock_quantity INTEGER DEFAULT 1;
   ALTER TABLE artworks ADD COLUMN shipping_class TEXT DEFAULT 'standard';
   ```

   Option B: Create separate `shop_products` table (recommended for flexibility)
   ```typescript
   export const shopProducts = sqliteTable('shop_products', {
     id: integer('id').primaryKey({ autoIncrement: true }),
     artwork_id: text('artwork_id').references(() => artworks.id),
     title_en: text('title_en'), // Override or use artwork title
     title_ru: text('title_ru'),
     title_es: text('title_es'),
     title_zh: text('title_zh'),
     price_eur: integer('price_eur').notNull(),
     compare_price_eur: integer('compare_price_eur'), // For sales
     stock_quantity: integer('stock_quantity').default(1),
     is_unlimited: integer('is_unlimited', { mode: 'boolean' }).default(false),
     shipping_class: text('shipping_class').default('standard'),
     weight_kg: text('weight_kg'),
     dimensions_cm: text('dimensions_cm'),
     is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
     is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
     order_index: integer('order_index').default(0),
     created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
     updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
   });
   ```

---

## Feature Request 2: Sidebar Shop Section Update

### Current:
```
Shop
├── 🛒 Orders
└── 💰 Shop Settings
```

### Should be:
```
Shop
├── 🛍️ Products       ← NEW
├── 🛒 Orders
└── 💰 Shop Settings
```

### File to modify:
`src/routes/(admin)/+layout.svelte` - Add new link to sidebar navigation

---

## Files to Create/Modify

### New Files:
1. `src/routes/(admin)/shop/products/+page.svelte` - Products list
2. `src/routes/(admin)/shop/products/+page.server.ts` - Load products
3. `src/routes/(admin)/shop/products/[id]/+page.svelte` - Edit product
4. `src/routes/(admin)/shop/products/[id]/+page.server.ts` - Load/save product
5. `src/routes/(admin)/shop/products/new/+page.svelte` - New product form

### Modify:
1. `src/routes/(admin)/+layout.svelte` - Add Products link to sidebar
2. `src/lib/server/db/schema.ts` - Add shop_products table (if Option B)
3. `src/lib/data/shop.provider.ts` - Add product CRUD functions

---

## Acceptance Criteria

### Must Have:
- [ ] `/shop/products` - List all products with pagination
- [ ] `/shop/products/new` - Create new product form
- [ ] `/shop/products/[id]` - Edit existing product
- [ ] Delete product functionality
- [ ] Link product to existing artwork OR standalone product
- [ ] Price management in EUR
- [ ] Stock quantity tracking
- [ ] Sidebar updated with Products link

### Nice to Have:
- [ ] Product variants (sizes for prints)
- [ ] Bulk enable/disable products
- [ ] Product categories/tags
- [ ] Featured products flag

---

## Technical Notes

### Current Shop Flow:
1. Public shop (`/[lang]/shop`) queries `artworks` table
2. Product detail (`/[lang]/shop/[slug]`) uses artwork data
3. Cart stores `artwork_id`
4. Checkout creates order with artwork references

### After Implementation:
- Shop should query `shop_products` (or filtered artworks)
- Products link to artworks for images/descriptions
- Shop-specific pricing and inventory separate from artwork catalog

---

## After Completion

```bash
npm run check  # 0 errors
npm run build  # success

git add .
git commit -m "feat: admin shop products management section"
git push origin claude/admin-shop-products-v9
```

---

*Generated by Claude Code CLI (Integrator)*
*Workflow v4.2 | 2025-12-23*
