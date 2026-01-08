# Implementation Plan: Shop Module - Media Upload Fix

**Date:** 2026-01-08
**Status:** Audited

---

## Phase 1: Database Schema Updates

### Task 1.1: Add file_hash to media table

**Files:** `src/lib/server/db/schema.ts`

**Actions:**
1. Add `file_hash: text('file_hash')` to media table definition
2. Run `npx drizzle-kit push`

**DoD:**
- [ ] Column `file_hash` exists in media table
- [ ] Migration runs without errors
- [ ] `npm run check` passes

---

## Phase 2: Backend - Media Upload Enhancement

### Task 2.1: Add video support to upload API

**Files:** `src/routes/api/media/upload/+server.ts`

**Actions:**
1. Add `video/mp4`, `video/webm` to ALLOWED_TYPES
2. Add MAX_VIDEO_SIZE (50MB) constant
3. Check file type to apply correct size limit

**DoD:**
- [ ] Can upload mp4 files
- [ ] Can upload webm files
- [ ] Video files up to 50MB accepted
- [ ] Images still limited to 10MB

### Task 2.2: Add hash-based duplicate detection

**Files:** `src/routes/api/media/upload/+server.ts`

**Actions:**
1. Import `createHash` from 'crypto'
2. Calculate MD5 hash of file buffer
3. Query media table for existing hash
4. If found, return existing record with `is_duplicate: true`
5. If not, save new file and record hash

**DoD:**
- [ ] Uploading same file twice returns existing ID
- [ ] Response includes `is_duplicate: true` for duplicates
- [ ] Hash stored in `file_hash` column
- [ ] New files save normally

---

## Phase 3: Backend - Shop Provider Updates

### Task 3.1: Add product images functions

**Files:** `src/lib/data/shop.provider.ts`

**Actions:**
1. Add `getProductImagesWithMedia(productId)` function
2. Add `reorderProductImages(productId, imageOrders)` function
3. Export both functions

**DoD:**
- [ ] `getProductImagesWithMedia` returns all images with media data
- [ ] `reorderProductImages` updates order_index for each image
- [ ] Both functions work with existing data

---

## Phase 4: Frontend - Admin Product Edit

### Task 4.1: Add direct upload to product page

**Files:** `src/routes/(admin)/shop/products/[id]/+page.svelte`

**Actions:**
1. Add hidden file input for images/videos
2. Add "Upload Images" button
3. Create `handleFileUpload` function
4. Call `/api/media/upload` for each file
5. Immediately add uploaded media to product

**DoD:**
- [ ] "Upload Images" button visible in Images section
- [ ] File picker opens when clicked
- [ ] Multiple files can be selected
- [ ] Files upload and appear in product images
- [ ] Progress indicator shows during upload

### Task 4.2: Add drag-and-drop reordering

**Files:** `src/routes/(admin)/shop/products/[id]/+page.svelte`

**Actions:**
1. Import or create sortable list logic
2. Wrap image grid in sortable container
3. Call `reorderImages` action on drop

**DoD:**
- [ ] Images can be dragged to reorder
- [ ] Order persists after save
- [ ] Order persists after page reload

### Task 4.3: Add reorderImages server action

**Files:** `src/routes/(admin)/shop/products/[id]/+page.server.ts`

**Actions:**
1. Add `reorderImages` action
2. Parse order JSON from form data
3. Call `reorderProductImages` from provider

**DoD:**
- [ ] Action accepts order data
- [ ] Order updates in database
- [ ] No errors on valid input

---

## Phase 5: Frontend - Product Gallery Video Support

### Task 5.1: Add video rendering to gallery

**Files:** `src/lib/components/shop/ProductGallery.svelte`

**Actions:**
1. Add `isVideo(mimeType)` helper function
2. Conditionally render `<video>` or `<img>` based on mime type
3. Add video controls, autoplay, muted, loop

**DoD:**
- [ ] Video files play in gallery
- [ ] Videos have controls visible
- [ ] Videos autoplay and loop
- [ ] Images still display correctly

---

## Phase 6: Testing & Verification

### Task 6.1: Full functionality test

**Actions:**
1. Upload single image → verify saves and links
2. Upload multiple images → verify all save
3. Upload duplicate → verify returns existing
4. Upload video → verify saves correctly
5. Reorder images → verify order persists
6. Set primary image → verify updates
7. Remove image → verify unlinks
8. Check frontend gallery → verify navigation works
9. Check frontend gallery → verify video plays

**DoD:**
- [ ] All 9 test scenarios pass
- [ ] `npm run check` passes
- [ ] `npm run build` passes
- [ ] No console errors

---

## Audit Checklist

### Полнота (Completeness)
- [x] All spec-final requirements covered
- [x] Image upload fix included
- [x] Multi-image support included
- [x] Video support included
- [x] Duplicate detection included

### Реалистичность (Realism)
- [x] Each DoD is specific and verifiable
- [x] Tasks are appropriately sized
- [x] No missing implementation steps

### Порядок (Order)
- [x] Schema changes before API changes
- [x] Backend before frontend
- [x] Provider functions before admin pages
- [x] Testing phase at end

---

*Plan audited and approved*
