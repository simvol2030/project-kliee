# Task: Shop Page - Complete Functionality Implementation

**Status:** In Progress
**Assignee:** Claude Code
**Priority:** HIGH
**Last Updated:** 2025-12-21

---

## 📋 Overview

Fix and implement missing functionality on Shop page (https://k-liee.com/en/shop). The goal is to have a **fully working e-commerce flow**:
1. Browse products → 2. Add to Cart/Wishlist → 3. Checkout → 4. Order Confirmation
5. Admin can manage products and orders

---

## ✅ Already Implemented (Verified)

### Backend API
- ✅ **Cart API** (`/api/shop/cart`) - Full CRUD (GET, POST, DELETE)
- ✅ **Orders API** (`/api/shop/orders`) - Create order, get order details
- ✅ **Products API** (`/api/shop/products`) - List with filters, pagination, sorting
- ✅ **Currencies API** (`/api/shop/currencies`) - Currency rates for multi-currency support

### Frontend Stores (Svelte 5 Runes)
- ✅ **cartStore** (`src/lib/stores/cart.svelte.ts`) - Full cart management with API sync
- ✅ **wishlistStore** (`src/lib/stores/wishlist.svelte.ts`) - localStorage-based wishlist

### Pages
- ✅ **Shop page** (`/[lang]/shop`) - Products grid with filters
- ✅ **Cart page** (`/[lang]/cart`) - Cart contents, totals
- ✅ **Checkout page** (`/[lang]/checkout`) - Order form
- ✅ **Order confirmation** (`/[lang]/order-confirmation`) - Success page
- ✅ **Wishlist page** (`/[lang]/wishlist`) - Saved items

### Admin Panel
- ✅ **Orders management** (`/admin/shop/orders`) - View orders, update status
- ✅ **Shop settings** (`/admin/shop/settings`) - Currency settings

### Components
- ✅ **ProductCard** - With cart/wishlist action handlers
- ✅ **CartIcon, CartDropdown** - Header cart widget
- ✅ **WishlistIcon** - Header wishlist widget
- ✅ **Filters** - SeriesFilter, PriceRangeFilter, SortSelect

---

## 🐛 Issues to Fix

### 1. **Add to Cart/Wishlist - Not Connected to Stores**
**File:** `frontend-sveltekit/src/routes/[lang=locale]/shop/+page.svelte`

**Current Problem:**
```typescript
function handleAddToCart(productId: number) {
    console.log('Add to cart:', productId);
    // TODO: Implement in Phase 4
}

function handleToggleWishlist(productId: number) {
    console.log('Toggle wishlist:', productId);
    // TODO: Implement in Phase 5
}
```

**Solution:**
- Import and use existing `cartStore` and `wishlistStore`
- Add visual feedback (button state change)
- Handle errors gracefully

---

### 2. **Icons Not Visible on Desktop (Hover Required)**
**File:** `frontend-sveltekit/src/lib/components/shop/ProductCard.svelte`

**Current Problem:**
```css
.quick-actions {
    opacity: 0;  /* Hidden by default */
}
.product-card:hover .quick-actions {
    opacity: 1;  /* Only visible on hover */
}
```

**Solution:**
- Make icons always visible on all devices
- Use `@media (hover: none)` for touch devices
- Keep subtle hover effect for desktop

---

### 3. **Load More Button - 404 Error**
**File:** `frontend-sveltekit/src/routes/[lang=locale]/shop/+page.svelte`

**Current Problem:**
- Clicking "Load More" changes URL to `?page=2` but may return 404
- Uses client-side `+page.ts` not `+page.server.ts`

**Solution:**
- Debug `+page.ts` load function
- Verify `/api/shop/products?page=2` returns correct data
- Implement proper pagination or infinite scroll

---

### 4. **Admin Panel - Artworks CRUD Missing**
**Location:** Should be at `/admin/artworks` or `/admin/shop/products`

**Current State:**
- `/admin/shop/orders` exists (order management)
- `/admin/shop/settings` exists (shop settings)
- **Artworks CRUD is missing!**

**Required:**
- Create `/admin/artworks` page
- CRUD operations: Create, Read, Update, Delete artworks
- Image upload/management
- Price, title, description editing
- Series assignment
- is_for_sale toggle

---

### 5. **Cart Count in Header - Not Updating**
**Files:** `Header.svelte`, `CartIcon.svelte`

**Solution:**
- Initialize `cartStore` on layout mount
- Subscribe CartIcon to `cartStore.count`
- Update count reactively when items added/removed

---

## 🛠️ Implementation Plan

### Phase 1: Quick Fixes (CSS & Pagination)
1. Fix ProductCard CSS - make icons always visible
2. Debug and fix Load More pagination
3. Verify cart/wishlist pages work correctly

### Phase 2: Connect Frontend to Stores
1. Import cartStore/wishlistStore in shop page
2. Implement `handleAddToCart()` using `cartStore.addItem()`
3. Implement `handleToggleWishlist()` using `wishlistStore.toggle()`
4. Add loading states and error handling
5. Update Header to show cart count

### Phase 3: Admin Artworks CRUD
1. Create `/admin/artworks/+page.svelte` - artworks list
2. Create `/admin/artworks/[id]/+page.svelte` - edit artwork
3. Create `/admin/artworks/new/+page.svelte` - create artwork
4. Implement image upload via existing media API
5. Add series selection dropdown

### Phase 4: Full Flow Testing
1. Test complete purchase flow:
   - Browse shop → Add to cart → Checkout → Order created
2. Test wishlist flow:
   - Add to wishlist → View wishlist → Move to cart
3. Test admin flow:
   - Create artwork → Edit → View in shop → Delete
4. Test all 4 languages (EN/RU/ES/ZH)

---

## 📁 Files to Modify

### Modify Existing:
1. `src/routes/[lang=locale]/shop/+page.svelte` - Connect to stores
2. `src/lib/components/shop/ProductCard.svelte` - Fix CSS visibility
3. `src/lib/components/layout/Header.svelte` - Add cartStore subscription
4. `src/routes/+layout.svelte` - Initialize cartStore on mount

### Create New (Admin Artworks):
5. `src/routes/(admin)/artworks/+page.svelte` - Artworks list
6. `src/routes/(admin)/artworks/+page.server.ts` - List data loader
7. `src/routes/(admin)/artworks/[id]/+page.svelte` - Edit form
8. `src/routes/(admin)/artworks/[id]/+page.server.ts` - Edit actions
9. `src/routes/(admin)/artworks/new/+page.svelte` - Create form
10. `src/routes/api/admin/artworks/+server.ts` - Admin API

---

## ✅ Definition of Done

### Shop Page
- [ ] Add to Cart button works (uses cartStore)
- [ ] Add to Wishlist button works (uses wishlistStore)
- [ ] Icons visible on all devices (mobile/tablet/desktop)
- [ ] Load More pagination works without errors
- [ ] Cart count updates in header when items added

### E-commerce Flow
- [ ] Can add items to cart from shop page
- [ ] Can view cart at `/[lang]/cart`
- [ ] Can checkout at `/[lang]/checkout`
- [ ] Order confirmation shows after purchase
- [ ] Email notification sent (if configured)

### Wishlist Flow
- [ ] Can add/remove items from wishlist
- [ ] Wishlist persists after page reload (localStorage)
- [ ] Wishlist page shows saved items
- [ ] Can move items from wishlist to cart

### Admin Panel
- [ ] Can view all artworks at `/admin/artworks`
- [ ] Can create new artwork with images
- [ ] Can edit existing artwork
- [ ] Can delete artwork
- [ ] Can manage orders at `/admin/shop/orders`

### Quality
- [ ] No console errors
- [ ] TypeScript: 0 errors (`npm run check`)
- [ ] Works in all 4 languages
- [ ] Mobile responsive
- [ ] Code committed with clear messages

---

## 🔧 Technical Notes

### Cart Store Usage
```typescript
import { cartStore } from '$lib/stores/cart.svelte.ts';

// Initialize on page load
onMount(() => cartStore.init());

// Add to cart
async function handleAddToCart(productId: number) {
    const result = await cartStore.addItem(productId);
    if (result.success) {
        // Show success feedback
    } else {
        // Handle error (e.g., already in cart)
    }
}
```

### Wishlist Store Usage
```typescript
import { wishlistStore } from '$lib/stores/wishlist.svelte.ts';

// Toggle wishlist (localStorage-based, no API needed)
function handleToggleWishlist(productId: number) {
    const isNowInWishlist = wishlistStore.toggle(productId);
    // Update UI state
}

// Check if in wishlist
const isInWishlist = wishlistStore.isInWishlist(productId);
```

### CSS Fix for Icons
```css
/* Make actions always visible */
.quick-actions {
    opacity: 1;
    transform: translateY(0);
}

/* Subtle hover effect on desktop */
@media (hover: hover) {
    .action-btn:hover {
        transform: scale(1.1);
        background: var(--color-primary);
        color: var(--color-background);
    }
}
```

---

## 📊 Priority Order

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1 | CSS Fix (icons visibility) | 5 min | HIGH |
| 2 | Connect cart/wishlist to stores | 30 min | HIGH |
| 3 | Fix pagination | 15 min | MEDIUM |
| 4 | Update Header cart count | 15 min | MEDIUM |
| 5 | Admin Artworks CRUD | 2 hours | HIGH |
| 6 | Full flow testing | 30 min | HIGH |

---

## 🚀 Ready to Implement!

Start with Phase 1 (quick fixes) for immediate visual improvement, then Phase 2 (stores integration) to make buttons work, and finally Phase 3 (admin) for full shop management.

---

**Updated:** 2025-12-21
