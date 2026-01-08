# Research: Shop Module - Media Upload Fix

**Date:** 2026-01-08
**Status:** Complete

---

## Executive Summary

The Shop module has comprehensive infrastructure for multi-image products, but **image uploads are not saving properly**. The root cause is a workflow gap: the product edit page uses a Media Picker that only selects existing media - there's no direct upload capability from the product edit form.

---

## Current Architecture

```
Project: SvelteKit 2.x + Drizzle ORM + SQLite
Database: ../data/db/sqlite/app.db
Upload Path: static/uploads/
```

---

## Database Schema Analysis

### Shop Products Table (`schema.ts:639-663`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER (PK) | Auto-increment |
| `artwork_id` | TEXT (FK) | Optional link to artwork |
| `sku` | TEXT | Unique |
| `title_en/ru/es/zh` | TEXT | 4 languages (NOT NULL) |
| `description_en/ru/es/zh` | TEXT | 4 languages |
| `price_eur` | INTEGER | In cents (NOT NULL) |
| `compare_price_eur` | INTEGER | For discounts |
| `stock_quantity` | INTEGER | Default 1 |
| `is_unlimited` | BOOLEAN | |
| `shipping_class` | ENUM | standard/fragile/oversized |
| `is_visible` | BOOLEAN | |
| `is_featured` | BOOLEAN | |
| `order_index` | INTEGER | |

### Shop Product Images Table (`schema.ts:668-678`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER (PK) | |
| `product_id` | INTEGER (FK) | -> shop_products (CASCADE) |
| `media_id` | INTEGER (FK) | -> media |
| `is_primary` | BOOLEAN | |
| `order_index` | INTEGER | |

### Media Table (`schema.ts:53-68`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER (PK) | |
| `filename` | TEXT | Original filename |
| `stored_filename` | TEXT | UUID-based, unique |
| `mime_type` | TEXT | |
| `size` | INTEGER | |
| `width`, `height` | INTEGER | |
| `alt_en/ru/es/zh` | TEXT | |
| `folder` | TEXT | Default 'uploads' |
| `uploaded_at` | TEXT | |
| `uploaded_by` | INTEGER (FK) | -> admins |

**Missing:** `file_hash` field for duplicate detection

---

## Key Files

| Purpose | Path |
|---------|------|
| DB Schema | `src/lib/server/db/schema.ts` |
| Shop Provider | `src/lib/data/shop.provider.ts` |
| Admin Product Edit (Server) | `src/routes/(admin)/shop/products/[id]/+page.server.ts` |
| Admin Product Edit (UI) | `src/routes/(admin)/shop/products/[id]/+page.svelte` |
| Media Upload API | `src/routes/api/media/upload/+server.ts` |
| Media List API | `src/routes/api/media/+server.ts` |
| Product Gallery | `src/lib/components/shop/ProductGallery.svelte` |
| Public Product Page | `src/routes/[lang=locale]/shop/[slug]/+page.svelte` |

---

## Root Cause Analysis

### Issue 1: No Direct Upload in Product Edit

**Location:** `shop/products/[id]/+page.svelte:438-481`

The Media Picker Modal only allows selecting **existing** media from the library. Users must:
1. Go to Media Library (`/media`)
2. Upload images there
3. Return to product edit
4. Select from modal

**This is confusing UX and likely why "images don't save"**

### Issue 2: Static Uploads Folder Status

The `static/uploads/` directory may not exist or have correct permissions on the server.

### Issue 3: Video Support Missing

Current allowed types in upload API:
```typescript
ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
```

No video support (mp4, webm).

---

## Existing Patterns

### Image URL Construction

```typescript
function buildShopImageUrl(storedFilename: string | null, folder: string | null): string | null {
  if (!storedFilename) return null;
  if (storedFilename.startsWith('/')) return storedFilename;  // Static paths
  return `/uploads/${folder || 'products'}/${storedFilename}`;
}
```

### Primary Image Handling

When adding/setting primary image:
1. Unset all existing primary flags
2. Set new primary

### Form Actions Pattern

```typescript
export const actions = {
  save: async ({ request }) => { ... },
  addImage: async ({ request }) => { ... },
  removeImage: async ({ request }) => { ... },
  setPrimary: async ({ request }) => { ... }
}
```

---

## Frontend Gallery Status

**ProductGallery.svelte features:**
- Multiple images support
- Thumbnails navigation
- Lightbox with keyboard navigation
- Swipe support for mobile

**Status: WORKING** - frontend can display multiple images if they exist

---

## What Needs to Change

1. **Add direct upload to product edit page**
   - File input in Images section
   - Call `/api/media/upload` on file select
   - Immediately link to product via `addProductImage()`

2. **Add video support**
   - Extend ALLOWED_TYPES: `video/mp4`, `video/webm`
   - Add `media_type` field to distinguish images/videos
   - Update frontend to render video player

3. **Add duplicate detection**
   - Add `file_hash` to media table
   - Check hash before saving
   - Return existing media if duplicate

4. **Improve error handling**
   - Show server errors in admin UI
   - Better validation messages

---

## Dependencies

- `sharp` - Image processing (already installed)
- `uuid` - File naming (already installed)
- No additional packages needed for video (native HTML5)

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking existing image paths | Keep `buildShopImageUrl()` backward compatible |
| Large video files | Limit to 50MB, consider chunked upload |
| DB migration for file_hash | Simple ALTER TABLE, safe |

---

*Research complete*
