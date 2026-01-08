# Implementation Plan: Works/Series Module

**Date:** 2026-01-08
**Status:** Audited

---

## Phase 1: Database & Migration

### Task 1.1: Add file_hash to media (shared with Shop)

**Files:** `src/lib/server/db/schema.ts`

**Note:** If already done in changes-1, skip this task.

**DoD:**
- [ ] Column `file_hash` exists in media table
- [ ] Migration runs without errors

### Task 1.2: Create migration script for series

**Files:** `src/lib/scripts/migrate-series.ts`

**Actions:**
1. Create new file
2. Import series JSON and DB modules
3. Map JSON structure to DB columns
4. Insert 8 series records
5. Log progress

**DoD:**
- [ ] Script runs without errors
- [ ] 8 series records exist in DB
- [ ] Names on all 4 languages populated
- [ ] Descriptions populated

---

## Phase 2: Backend - Series Provider Update

### Task 2.1: Convert series provider to async DB

**Files:** `src/lib/data/series.provider.ts`

**Actions:**
1. Remove JSON import
2. Import db and series table
3. Rewrite `getAllSeries(locale)` as async
4. Add dynamic artwork count query
5. Rewrite `getSeriesBySlug(slug, locale)` as async
6. Rewrite `getSeriesById(id, locale)` as async

**DoD:**
- [ ] Provider imports from DB, not JSON
- [ ] `getAllSeries` returns series with dynamic artworkCount
- [ ] All functions are async
- [ ] Type safety maintained

---

## Phase 3: Backend - Artworks Provider Update

### Task 3.1: Add getArtworkWithAllImages function

**Files:** `src/lib/data/artworks.provider.ts`

**Actions:**
1. Create `getArtworkWithAllImages(id, locale)` function
2. Query artworkImages with media join
3. Return artwork with full images array

**DoD:**
- [ ] Function returns artwork with all images
- [ ] Images ordered by order_index
- [ ] Image URLs built correctly

### Task 3.2: Create API endpoint for artwork images

**Files:** `src/routes/api/artworks/[id]/images/+server.ts`

**Actions:**
1. Create new endpoint
2. Call `getArtworkWithAllImages`
3. Return JSON response

**DoD:**
- [ ] GET /api/artworks/[id]/images returns artwork with images
- [ ] Includes locale parameter
- [ ] Returns 404 for invalid ID

---

## Phase 4: Frontend - Works Pages Update

### Task 4.1: Update Works overview page loader

**Files:** `src/routes/[lang=locale]/works/+page.ts`

**Actions:**
1. Change to use async series provider
2. Add await for getAllSeries call

**DoD:**
- [ ] Page loads with series from DB
- [ ] All 8 series visible
- [ ] Artwork counts are dynamic

### Task 4.2: Update Works overview page component

**Files:** `src/routes/[lang=locale]/works/+page.svelte`

**Actions:**
1. Verify data binding works with new structure
2. Test series cards display correctly

**DoD:**
- [ ] Series cards display correctly
- [ ] Cover images load
- [ ] Artwork counts show

### Task 4.3: Update Series detail page loader

**Files:** `src/routes/[lang=locale]/works/[slug]/+page.server.ts`

**Actions:**
1. Use async series provider
2. Keep artworks provider (already async)

**DoD:**
- [ ] Page loads series from DB
- [ ] Artworks load correctly
- [ ] Series not found returns 404

### Task 4.4: Update modal for multi-image navigation

**Files:** `src/routes/[lang=locale]/works/[slug]/+page.svelte`

**Actions:**
1. Add state for artwork images array
2. Fetch full artwork on modal open
3. Add prev/next navigation for images
4. Show image counter
5. Add description display

**DoD:**
- [ ] Modal shows all artwork images
- [ ] Prev/next arrows work
- [ ] Image counter shows current/total
- [ ] Description displays if available
- [ ] Keyboard navigation (arrows) works

---

## Phase 5: Admin - Series Improvements

### Task 5.1: Add MediaPicker to series edit

**Files:** `src/routes/(admin)/series/[id]/+page.svelte`

**Actions:**
1. Import MediaPicker component
2. Replace cover_image_id input with MediaPicker
3. Add hidden input for form submission

**DoD:**
- [ ] MediaPicker visible in series edit form
- [ ] Can select image from media library
- [ ] Can upload new image
- [ ] Selected image saves correctly

---

## Phase 6: Testing & Verification

### Task 6.1: Full functionality test

**Actions:**
1. Run migration script
2. Verify /ru/works shows 8 series
3. Verify artwork counts match actual
4. Click series → verify artworks load
5. Click artwork → verify modal opens
6. Navigate images in modal
7. Verify description shows
8. Edit series in admin → verify saves
9. Select cover image → verify displays

**DoD:**
- [ ] All test scenarios pass
- [ ] `npm run check` passes
- [ ] `npm run build` passes
- [ ] No console errors
- [ ] Language switching works
- [ ] Theme switching works

---

## Audit Checklist

### Полнота (Completeness)
- [x] Series migration from JSON to DB
- [x] Dynamic artwork count
- [x] All images in modal
- [x] Description in modal
- [x] MediaPicker for cover image
- [x] Duplicate detection (via file_hash)

### Реалистичность (Realism)
- [x] Each DoD is specific and verifiable
- [x] Tasks are appropriately sized
- [x] No missing implementation steps

### Порядок (Order)
- [x] Migration script before provider update
- [x] Provider before frontend pages
- [x] API endpoint before modal changes
- [x] Testing phase at end

---

*Plan audited and approved*
