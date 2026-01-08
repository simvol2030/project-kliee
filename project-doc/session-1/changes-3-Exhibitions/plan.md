# Implementation Plan: Exhibitions Module

**Date:** 2026-01-08
**Status:** Audited

---

## Phase 1: Database Schema Updates

### Task 1.1: Add new columns to exhibitions table

**Files:** `src/lib/server/db/schema.ts`

**Actions:**
1. Add `type: text('type')`
2. Add `year: integer('year')`
3. Add `slug: text('slug').unique()`
4. Add `featured: integer('featured', { mode: 'boolean' })`
5. Add `venue_en/ru/es/zh` columns (4 new)

**DoD:**
- [ ] All 6 new columns added to exhibitions table
- [ ] Types correct (text, integer, boolean)
- [ ] Slug has unique constraint

### Task 1.2: Create exhibitionImages table

**Files:** `src/lib/server/db/schema.ts`

**Actions:**
1. Create new table definition
2. Add id, exhibition_id (FK), media_id (FK)
3. Add order_index, caption_en/ru/es/zh
4. Add cascade delete on exhibition_id

**DoD:**
- [ ] Table `exhibition_images` defined
- [ ] Foreign keys set up correctly
- [ ] Cascade delete configured

### Task 1.3: Run migration

**Actions:**
1. Run `npx drizzle-kit push`
2. Verify tables updated

**DoD:**
- [ ] Migration runs without errors
- [ ] New columns exist in DB
- [ ] New table exists in DB

---

## Phase 2: Data Migration

### Task 2.1: Create migration script

**Files:** `src/lib/scripts/migrate-exhibitions.ts`

**Actions:**
1. Create new file
2. Import exhibitions JSON
3. Generate slugs from titles
4. Map 9 exhibitions to DB
5. Map 5 art fairs as type='art_fair'

**DoD:**
- [ ] Script created
- [ ] Can run without errors
- [ ] 14 total records inserted (9 + 5)

### Task 2.2: Run migration

**Actions:**
1. Execute migration script
2. Verify data in DB

**DoD:**
- [ ] 14 records in exhibitions table
- [ ] Types correctly set
- [ ] Years correctly set
- [ ] Slugs unique and valid

---

## Phase 3: Backend - Provider Update

### Task 3.1: Rewrite exhibitions provider

**Files:** `src/lib/data/exhibitions.provider.ts`

**Actions:**
1. Remove JSON import
2. Import db and exhibitions table
3. Rewrite `getAllExhibitions` as async
4. Rewrite `getCurrentExhibitions` as async
5. Rewrite `getPastExhibitions` as async (exclude art_fair)
6. Create `getArtFairs` function (type='art_fair')
7. Create `getExhibitionBySlug` function
8. Create `getExhibitionImages` function

**DoD:**
- [ ] Provider reads from DB
- [ ] All functions are async
- [ ] Art fairs filtered by type
- [ ] Past exhibitions exclude art_fairs
- [ ] Images function returns ordered list

---

## Phase 4: Frontend - Public Pages

### Task 4.1: Update exhibitions list page loader

**Files:** `src/routes/[lang=locale]/exhibitions/+page.ts`

**Actions:**
1. Use async provider functions
2. Fetch current, past, artFairs, seo

**DoD:**
- [ ] Page loads from DB
- [ ] All 3 sections populated

### Task 4.2: Create exhibition detail page

**Files:**
- `src/routes/[lang=locale]/exhibitions/[slug]/+page.server.ts`
- `src/routes/[lang=locale]/exhibitions/[slug]/+page.svelte`

**Actions:**
1. Create loader with getExhibitionBySlug
2. Load gallery images
3. Create page component with:
   - Breadcrumb
   - Header (title, venue, dates)
   - Image gallery with navigation
   - Description
   - Back link

**DoD:**
- [ ] Page loads for valid slug
- [ ] 404 for invalid slug
- [ ] Gallery shows all images
- [ ] Can navigate between images
- [ ] Description displays
- [ ] Breadcrumb works

---

## Phase 5: Admin - Exhibition Form Updates

### Task 5.1: Add missing fields to edit form

**Files:** `src/routes/(admin)/exhibitions/[id]/+page.svelte`

**Actions:**
1. Add type dropdown (solo/group/fair/festival/gallery/art_fair)
2. Add year input
3. Add slug input with auto-generate
4. Add venue multilingual fields
5. Add featured checkbox

**DoD:**
- [ ] Type dropdown visible and works
- [ ] Year input visible and works
- [ ] Slug input with auto-generate button
- [ ] Venue has 4 language inputs
- [ ] Featured checkbox works

### Task 5.2: Add gallery images management

**Files:** `src/routes/(admin)/exhibitions/[id]/+page.svelte`

**Actions:**
1. Add MultiImagePicker component
2. Load existing gallery images
3. Save gallery images on form submit

**DoD:**
- [ ] Can view existing gallery images
- [ ] Can add new images
- [ ] Can remove images
- [ ] Can reorder images
- [ ] Changes persist on save

### Task 5.3: Update server actions

**Files:** `src/routes/(admin)/exhibitions/[id]/+page.server.ts`

**Actions:**
1. Handle new fields (type, year, slug, venue_*, featured)
2. Handle gallery images save
3. Update on edit, insert on new

**DoD:**
- [ ] All new fields save correctly
- [ ] Gallery images save correctly
- [ ] Edit and create both work

---

## Phase 6: Testing & Verification

### Task 6.1: Full functionality test

**Actions:**
1. Run migration → verify 14 records
2. Visit /en/exhibitions → verify all display
3. Current section shows current
4. Past section shows past (no art fairs)
5. Art Fairs section shows art fairs
6. Click exhibition → detail page opens
7. Gallery navigation works
8. Edit exhibition in admin → saves
9. Add gallery images → displays
10. Add backdated exhibition → works

**DoD:**
- [ ] All test scenarios pass
- [ ] `npm run check` passes
- [ ] `npm run build` passes
- [ ] No console errors
- [ ] Image optimization works (webp)
- [ ] Duplicate detection works

---

## Audit Checklist

### Полнота (Completeness)
- [x] Schema updates (type, year, slug, featured, venue_*)
- [x] exhibitionImages table
- [x] JSON to DB migration
- [x] Art Fairs as type='art_fair'
- [x] Detail page with gallery
- [x] Admin form updates
- [x] Gallery image management

### Реалистичность (Realism)
- [x] Each DoD is specific and verifiable
- [x] Tasks are appropriately sized
- [x] No missing implementation steps

### Порядок (Order)
- [x] Schema before migration script
- [x] Migration before provider
- [x] Provider before frontend
- [x] Detail page before testing
- [x] Admin updates independent

---

*Plan audited and approved*
