# Feedback v3 - Cart Images, Checkout Flow, Admin Panel Fixes

**Date:** 2025-12-23
**Environment:** Production https://k-liee.com
**Tested by:** Claude Code CLI (Integrator)
**Branch to create:** `claude/shop-checkout-v3`

---

## ⚠️ CRITICAL: Before Starting (READ THIS FIRST!)

### 1. You MUST start from the latest `dev` branch!

The `dev` branch contains critical fixes (pagination, schema changes, etc.) that are NOT in `main` yet.

```bash
# ОБЯЗАТЕЛЬНО выполни эти команды ПЕРЕД началом работы:
git fetch origin
git checkout -b claude/shop-checkout-v3 origin/dev

# Проверь, что ты на правильной ветке:
git log --oneline -3
# Должен быть коммит: "qa: feedback-v3 - cart images, checkout flow, admin fixes"
```

**WARNING:** If you branch from `main` instead of `dev`, you will have old bugs and your work will be rejected!

### 2. DO NOT modify these files (data preservation):

These files contain PRODUCTION DATA that must NOT be overwritten:

| File/Directory | Contains | Action |
|----------------|----------|--------|
| `data/artworks.json` | 37 artworks with images | DO NOT MODIFY |
| `data/menu.json` | Menu structure | DO NOT MODIFY |
| `data/db/sqlite/app.db` | Production database | DO NOT TOUCH |
| `static/uploads/*` | Uploaded images | IN .gitignore - DO NOT ADD TO GIT |
| `static/images/*` | Site images | IN .gitignore - DO NOT ADD TO GIT |

### 2.1 IMPORTANT: Images are NOT in git!

The `static/uploads/` and `static/images/` directories are in `.gitignore`.
Images exist ONLY on the production server at `/opt/websites/k-liee.com/static-images/`

**When working with images:**
- Reference images using paths like `/uploads/products/...` or `/images/works/...`
- DO NOT create new image files locally
- DO NOT use `git add` on any image files
- The production server serves images via `hooks.server.ts` staticFilesHandler

### 3. For Bug 4 (Catalog Data Source):

When switching from JSON to database:
- Create a **new** provider that reads from DB
- DO NOT delete the JSON files
- The migration of data from JSON to DB will be done by CLI during deploy

### 4. Database Schema Changes:

If you need to add new tables (e.g., `orders`, `order_items`):
- Add schema definitions to `src/lib/server/db/schema.ts`
- Use Drizzle migrations: `npx drizzle-kit generate`
- DO NOT use `drizzle-kit push` - CLI will apply migrations on production

---

## Bug 1: Cart/Wishlist Images Not Displaying (HIGH)

**Score:** 12
**Priority:** HIGH

**Steps to reproduce:**
1. Open https://k-liee.com/en/shop
2. Add any product to cart (click cart icon on product card)
3. Open cart (click cart icon in header)
4. Product image shows placeholder/broken instead of actual image

**Same issue for Wishlist:**
1. Add product to wishlist (heart icon)
2. Open wishlist
3. Images not displaying correctly

**Expected:** Cart and wishlist items show product images
**Actual:** Placeholder or broken images

**Files to investigate:**
- `src/lib/components/shop/CartDrawer.svelte` (if exists)
- `src/lib/components/shop/WishlistDrawer.svelte` (if exists)
- `src/lib/stores/cart.svelte.ts`
- Cart API endpoints (`src/routes/api/shop/cart/`)
- Image path construction in cart items

**Root cause hypothesis:**
When adding item to cart, the image path might not be stored correctly, or the component uses wrong path format.

---

## Bug 2: Complete Checkout Flow (CRITICAL)

**Score:** 18
**Priority:** CRITICAL

**Current state:**
- Cart API works (add/remove items)
- Cart displays items
- BUT: Cannot complete a purchase, no checkout flow exists

**Required implementation:**

### 2.1 Checkout Page
Create `/[lang=locale]/checkout/+page.svelte`:
- Customer contact form (name, email, phone)
- Shipping address form (for physical products)
- Order summary (list of cart items with totals)
- Place Order button

### 2.2 Order Processing
Create order creation flow:
1. Validate cart is not empty
2. Collect customer info
3. Create order in database
4. Clear cart after successful order
5. Show confirmation page

### 2.3 Database Schema
Verify these tables exist (or create them):
- `orders` table (id, customer_name, email, phone, address, status, total, created_at)
- `order_items` table (id, order_id, artwork_id, quantity, price_at_purchase)

### 2.4 Order Confirmation
Create `/[lang=locale]/checkout/success/+page.svelte`:
- "Thank you for your order" message
- Order number
- Email confirmation notice

**Files to create/modify:**
- `src/routes/[lang=locale]/checkout/+page.svelte`
- `src/routes/[lang=locale]/checkout/+page.server.ts`
- `src/routes/[lang=locale]/checkout/success/+page.svelte`
- `src/routes/api/shop/orders/+server.ts`
- `src/lib/server/db/schema.ts` (if orders table missing)

**Note:** Payment integration NOT required for v1. Just order placement and tracking.

---

## Bug 3: Admin Panel - Broken Menu Links (HIGH)

**Score:** 13
**Priority:** HIGH

**Problem:**
Admin sidebar has menu items that lead to 404 pages.

**Broken links (verified via playwright):**
| Menu Item | URL | Status |
|-----------|-----|--------|
| Art Fairs | `/content/art-fairs` | 404 |
| Education | `/content/education` | 404 |
| Awards | `/content/awards` | 404 |
| Pages | `/pages` | 404 |
| Products | `/products` | 404 |
| Orders | `/orders` | 404 |

**Working links:**
- Dashboard, Media, Layout (Menu/Footer), Homepage sections, Artworks, Series, Exhibitions

**Files to fix:**
Option A (recommended): Remove broken links from sidebar navigation
- `src/routes/(admin)/+layout@.svelte` (lines 59-124)

Option B: Create missing pages (more work, can be done later)

**Suggested fix for v3:**
Comment out or remove the broken menu items from admin sidebar until pages are implemented.

---

## Bug 4: Catalog Data Source Mismatch (MEDIUM)

**Score:** 14
**Priority:** MEDIUM

**Problem:**
- Admin panel Artworks CRUD saves to **database** (`artworks` table)
- Public catalog (`/en/catalog`) reads from **JSON file** (`data/artworks.json`)
- Result: Admin changes don't appear on public site!

**Current architecture:**
```
Admin Artworks → DB (artworks table) → NOT connected to public
Public Catalog → JSON (data/artworks.json) → displays on site
```

**Required fix:**
Update `src/lib/data/artworks.provider.ts` to read from database instead of JSON.

**Files to modify:**
- `src/lib/data/artworks.provider.ts` - change from JSON import to DB query

**Reference working pattern:**
Look at how `menu.provider.ts` was updated to read from DB (if done in v2).

---

## Summary

| # | Bug | Priority | Score |
|---|-----|----------|-------|
| 1 | Cart/Wishlist Images | HIGH | 12 |
| 2 | Complete Checkout Flow | CRITICAL | 18 |
| 3 | Admin Broken Links | HIGH | 13 |
| 4 | Catalog Data Mismatch | MEDIUM | 14 |

**Total estimated score:** 57 (complex multi-file task)

---

## Acceptance Criteria

### Bug 1:
- [ ] Cart drawer shows product images
- [ ] Wishlist drawer shows product images

### Bug 2:
- [ ] `/checkout` page exists with form
- [ ] Customer can enter contact info
- [ ] "Place Order" button creates order in DB
- [ ] Cart clears after successful order
- [ ] Success page shows order confirmation

### Bug 3:
- [ ] No 404 errors when navigating admin sidebar

### Bug 4:
- [ ] Artworks created in admin appear in public catalog
- [ ] No JSON dependency for artworks data

---

## After Completion

1. Push changes to `claude/shop-checkout-v3` branch
2. Run `npm run check` - must be 0 errors
3. Notify CLI that work is complete
4. CLI will:
   - **Backup production DB** before any changes
   - Merge to `dev`
   - Test locally
   - Merge to `main`
   - Deploy to production (with data migration if needed)
   - QA on production

---

## CLI Deploy Checklist (for Integrator)

Before merge/deploy, CLI will perform these safety steps:

```bash
# 1. Backup production database
ssh webmaster@myappbutik.ru
cp /opt/websites/k-liee.com/data/db/sqlite/app.db \
   /opt/websites/k-liee.com/data/db/sqlite/app.db.backup-$(date +%Y%m%d-%H%M%S)

# 2. Backup JSON data files
cp /opt/websites/k-liee.com/data/*.json /opt/websites/k-liee.com/data/backup/

# 3. Check what files changed
git diff origin/dev origin/claude/shop-checkout-v3 --stat

# 4. Verify no data files were modified
git diff origin/dev origin/claude/shop-checkout-v3 -- data/

# 5. Apply Drizzle migrations safely
cd /opt/websites/k-liee.com/frontend-sveltekit
npx drizzle-kit push --dry-run  # Preview first
npx drizzle-kit push            # Apply if safe
```

---

*Generated by Claude Code CLI (Integrator)*
*Workflow v4.0 | 2025-12-23*
