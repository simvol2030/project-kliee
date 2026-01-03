# Feedback v11 - Critical Bugs After Shop Products Integration (v10)

**Date:** 2025-12-23
**Priority:** CRITICAL
**Score:** 24
**Branch:** `claude/fix-shop-integration-v11`

---

## Summary

After deploying feedback-v10 (Shop Products Integration), multiple critical bugs appeared:
- Product detail pages return 500 error
- Cart API returns 500 error
- Wishlist shows empty (images not displaying)
- Add to cart functionality broken

**Root Causes:**
1. DB migration NOT applied (`drizzle-kit push` not run)
2. Missing `related` field in product detail page load
3. Type mismatch: code expects `product_id` (number), old data uses `artwork_id` (string)
4. Wishlist store incompatible with new shop_products system

---

## Bug 1: Database Migration Not Applied (CRITICAL)

### Error
```
SqliteError: no such column: cart_items.product_id
GET /api/shop/cart - 500
```

### Root Cause
Server `schema.ts` was updated to use `product_id`:
```typescript
// Server schema.ts (current)
export const cartItems = sqliteTable('cart_items', {
  product_id: integer('product_id')
    .notNull()
    .references(() => shopProducts.id, { onDelete: 'cascade' }),
  // ...
});
```

But the actual database still has the old schema:
```sql
-- Production DB (current)
CREATE TABLE cart_items (
  artwork_id INTEGER NOT NULL,  -- OLD column!
  -- ...
);
```

### Fix
Run database migration on production:
```bash
ssh webmaster@myappbutik.ru
cd /opt/websites/k-liee.com/frontend-sveltekit
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npx drizzle-kit push
```

**WARNING:** This will drop existing cart data. Need to handle migration carefully.

### Files
- `src/lib/server/db/schema.ts` - Schema definition (already correct)
- Database file: `/opt/websites/k-liee.com/data/db/sqlite/app.db`

---

## Bug 2: Product Detail Page 500 Error (CRITICAL)

### Error
```
[500] GET /en/shop/chebu-rasha-throwing-up-eyes
TypeError: Cannot read properties of undefined (reading 'length')
```

### Root Cause
`+page.svelte` line 292 accesses `data.related.length`, but `+page.ts` doesn't return `related`:

**+page.ts returns:**
```typescript
return {
  product: productData.product,
  currencyRates: currenciesData.rates || [],
  lang
};
// Missing: related!
```

**+page.svelte expects:**
```svelte
{#if data.related.length > 0}  <!-- line 292 - CRASHES -->
```

### Fix Options

**Option A:** Add related products to load function
```typescript
// +page.ts
return {
  product: productData.product,
  currencyRates: currenciesData.rates || [],
  lang,
  related: productData.related || []  // Add this
};
```

**Option B:** Guard check in template
```svelte
{#if data.related?.length > 0}
```

### Files
- `src/routes/[lang=locale]/shop/[slug]/+page.ts` - Load function
- `src/routes/[lang=locale]/shop/[slug]/+page.svelte` - Template (line 292)
- `src/routes/api/shop/products/[slug]/+server.ts` - May need to return `related`

---

## Bug 3: Wishlist Images Not Displaying (HIGH)

### Symptoms
- Wishlist badge shows "1" (item count correct)
- Wishlist page shows "Your wishlist is empty"
- Products not rendering

### Root Cause
Type mismatch between old and new ID systems:

**wishlist.svelte.ts stores:**
```typescript
interface WishlistItem {
  artwork_id: string;  // e.g., "chebu-rasha-throwing-up-eyes"
}
```

**wishlist/+page.svelte fetches:**
```typescript
const artworkIds = wishlistStore.artworkIds; // strings!
const response = await fetch(`/api/shop/products?ids=${artworkIds.join(',')}`);
```

**But API expects:**
```
product_id: number (integer like 1, 2, 3)
```

### Fix
**Option A:** Update wishlist store to use product_id
```typescript
interface WishlistItem {
  product_id: number;  // shop_products.id
  added_at: string;
}
```

**Option B:** Update API to accept artwork slugs
```typescript
// /api/shop/products endpoint
// Accept both ?ids=1,2,3 and ?slugs=slug1,slug2
```

**Option C:** Keep backward compatibility - translate artwork_id to product_id
```typescript
// In wishlist page, first get product_ids from artwork slugs
const products = await fetch(`/api/shop/products?slugs=${artworkIds.join(',')}`);
```

### Files
- `src/lib/stores/wishlist.svelte.ts` - Store definition
- `src/routes/[lang=locale]/wishlist/+page.svelte` - Wishlist page
- `src/routes/api/shop/products/+server.ts` - Products API
- `src/lib/components/shop/ProductCard.svelte` - Add to wishlist button

---

## Bug 4: Cart API Type Mismatch (HIGH)

### Current Server Code
```typescript
// cart/+server.ts (server)
const { product_id } = body;
if (!product_id || typeof product_id !== 'number') {
  throw error(400, 'product_id is required and must be a number');
}
```

### Cart Store (server)
```typescript
// cart.svelte.ts (server)
async addItem(productId: number): Promise<...>
isInCart(productId: number): boolean
```

### Problem
Components that add to cart might still be passing `artwork_id` (string) instead of `product_id` (number).

### Files to Check
- `src/lib/components/shop/ProductCard.svelte` - "Add to Cart" button
- `src/routes/[lang=locale]/shop/[slug]/+page.svelte` - Product detail "Add to Cart"
- `src/routes/[lang=locale]/wishlist/+page.svelte` - "Add to Cart" from wishlist

---

## Bug 5: Local Repository Out of Sync (MEDIUM)

### Problem
Local code (WSL) has old `artwork_id` version, server has new `product_id` version.

**Local cart/+server.ts:**
```typescript
artwork_id: cartItems.artwork_id,  // OLD
```

**Server cart/+server.ts:**
```typescript
product_id: cartItems.product_id,  // NEW
```

### Fix
```bash
cd /home/solo18/dev/project-kliee/project/project-box-combo-1
git pull origin main
```

---

## Implementation Order

### Phase 1: Database Migration (CRITICAL - Do First!)
1. Backup production DB
2. Run `drizzle-kit push` on server
3. Re-run shop products migration to populate data

```bash
ssh webmaster@myappbutik.ru
cd /opt/websites/k-liee.com

# Backup
cp data/db/sqlite/app.db data/db/sqlite/app.db.backup-v11

# Apply schema changes
cd frontend-sveltekit
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npx drizzle-kit push

# Rebuild
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm run build
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 restart k-liee-frontend
```

### Phase 2: Fix Product Detail Page
1. Update `+page.ts` to return `related: []`
2. OR add `related` data from API
3. Test: `/en/shop/chebu-rasha-throwing-up-eyes` should load

### Phase 3: Fix Wishlist
1. Update wishlist store to use `product_id` (number)
2. Update ProductCard to pass `product_id` to wishlist
3. Update wishlist page to fetch by product IDs
4. Test: Add to wishlist, view wishlist page

### Phase 4: Verify Cart Flow
1. Test: Add product to cart from shop
2. Test: View cart page with images
3. Test: Checkout flow
4. Test: Order creation

---

## Acceptance Criteria

### Must Have:
- [ ] `/en/shop/[slug]` - Product detail pages load without 500 error
- [ ] `/api/shop/cart` - Cart API returns 200, not 500
- [ ] `/en/cart` - Cart page shows items with images
- [ ] `/en/wishlist` - Wishlist page shows items with images
- [ ] Add to cart works from product detail page
- [ ] Add to cart works from shop list page
- [ ] Checkout flow completes successfully
- [ ] Admin panel still works (no regression)

### Testing Checklist:
1. [ ] Navigate to `/en/shop` - products display with images
2. [ ] Click on product - detail page loads
3. [ ] Click "Add to Cart" - item added
4. [ ] Go to `/en/cart` - item shows with image
5. [ ] Click heart icon on product - added to wishlist
6. [ ] Go to `/en/wishlist` - item shows with image
7. [ ] Complete checkout - order created
8. [ ] Admin `/shop/products` - still works

---

## After Completion

```bash
npm run check  # 0 errors
npm run build  # success

git add .
git commit -m "fix: resolve shop integration bugs (cart, wishlist, product detail)"
git push origin claude/fix-shop-integration-v11
```

---

## Technical Notes

### ID Type Reference

| Entity | ID Type | Example |
|--------|---------|---------|
| `artworks.id` | text (UUID-like) | "chebu-rasha-throwing-up-eyes" |
| `shop_products.id` | integer | 1, 2, 3, ... |
| `shop_products.artwork_id` | text (FK) | "chebu-rasha-throwing-up-eyes" |
| `cart_items.product_id` | integer (FK) | 1, 2, 3, ... |

### Data Flow After Fix:

```
User clicks "Add to Cart"
        │
        ▼
ProductCard passes product_id (number)
        │
        ▼
cartStore.addItem(productId: number)
        │
        ▼
POST /api/shop/cart { product_id: 1 }
        │
        ▼
cart_items table (product_id column)
        │
        ▼
JOIN shop_products → artworks → media
        │
        ▼
Return cart with images
```

---

*Generated by Claude Code CLI (Integrator)*
*Workflow v4.2 | 2025-12-23*
