# Implementation Plan: About Module

**Date:** 2026-01-08
**Status:** Audited

---

## Phase 1: Database Schema

### Task 1.1: Create about_artist table

**Files:** `src/lib/server/db/schema.ts`

**Actions:**
1. Create singleton table for artist info
2. Add name, image_id (FK), nationality, based_in
3. Add biography_en/ru/es/zh
4. Add seo_title_en/ru/es/zh
5. Add seo_description_en/ru/es/zh
6. Add updated_at

**DoD:**
- [ ] Table definition added
- [ ] Foreign key to media
- [ ] All language fields present

### Task 1.2: Create about_education table

**Files:** `src/lib/server/db/schema.ts`

**Actions:**
1. Create table with id, year, order_index
2. Add degree_en/ru/es/zh
3. Add institution_en/ru/es/zh

**DoD:**
- [ ] Table definition added
- [ ] Year as TEXT (for ranges)
- [ ] All language fields present

### Task 1.3: Create about_awards table

**Files:** `src/lib/server/db/schema.ts`

**Actions:**
1. Create table with id, year, order_index
2. Add title_en/ru/es/zh
3. Add organization_en/ru/es/zh

**DoD:**
- [ ] Table definition added
- [ ] All language fields present

### Task 1.4: Create about_residencies table

**Files:** `src/lib/server/db/schema.ts`

**Actions:**
1. Create table with id, year, order_index
2. Add location_en/ru/es/zh

**DoD:**
- [ ] Table definition added
- [ ] All language fields present

### Task 1.5: Run migration

**Actions:**
1. Run `npx drizzle-kit push`

**DoD:**
- [ ] Migration runs without errors
- [ ] All 4 tables exist in DB

---

## Phase 2: Data Migration

### Task 2.1: Create migration script

**Files:** `src/lib/scripts/migrate-about.ts`

**Actions:**
1. Import about.json
2. Insert artist info (1 record)
3. Insert education (3 records)
4. Insert awards (5 records)
5. Insert residencies (9 records)
6. Log completion

**DoD:**
- [ ] Script created
- [ ] All sections migrated
- [ ] Order preserved via order_index

### Task 2.2: Run migration

**Actions:**
1. Execute migration script

**DoD:**
- [ ] 1 artist record
- [ ] 3 education records
- [ ] 5 awards records
- [ ] 9 residencies records

---

## Phase 3: Backend - Provider Update

### Task 3.1: Rewrite about provider

**Files:** `src/lib/data/about.provider.ts`

**Actions:**
1. Remove JSON import
2. Add DB imports
3. Rewrite `getArtistInfo()` as async
4. Rewrite `getBiography(locale)` as async
5. Rewrite `getEducation(locale)` as async
6. Rewrite `getAwards(locale)` as async
7. Rewrite `getResidencies(locale)` as async
8. Rewrite `getSeoData(locale)` as async
9. Rewrite `getAboutData(locale)` as async

**DoD:**
- [ ] All functions read from DB
- [ ] All functions are async
- [ ] Localization works

### Task 3.2: Add CRUD functions for admin

**Files:** `src/lib/data/about.provider.ts`

**Actions:**
1. Add `updateArtist(data)` - upsert
2. Add `getArtistRaw()` - for admin form
3. Add education CRUD (add, update, delete)
4. Add awards CRUD (add, update, delete)
5. Add residencies CRUD (add, update, delete)
6. Add `getAllEducation()`, etc. for admin list

**DoD:**
- [ ] All CRUD functions work
- [ ] Upsert handles single row correctly
- [ ] Delete cascades safely

---

## Phase 4: Admin - About Page

### Task 4.1: Create about admin page

**Files:**
- `src/routes/(admin)/about/+page.svelte`
- `src/routes/(admin)/about/+page.server.ts`

**Actions:**
1. Create tabbed interface (Artist, Education, Awards, Residencies, SEO)
2. Artist tab: name, image (MediaPicker), nationality, based_in, biography (LanguageTabs)
3. Education tab: list with add/edit/delete
4. Awards tab: list with add/edit/delete
5. Residencies tab: list with add/edit/delete
6. SEO tab: title/description (LanguageTabs)
7. Create server actions for all operations

**DoD:**
- [ ] Page renders with tabs
- [ ] Can switch between tabs
- [ ] Artist info form works
- [ ] Can upload/change artist image
- [ ] Biography editable in 4 languages
- [ ] Education CRUD works
- [ ] Awards CRUD works
- [ ] Residencies CRUD works
- [ ] SEO form works
- [ ] All changes persist

### Task 4.2: Add About to admin navigation

**Files:** `src/routes/(admin)/+layout@.svelte`

**Actions:**
1. Add About link in Content section

**DoD:**
- [ ] About link visible in sidebar
- [ ] Clicking navigates to /about

---

## Phase 5: Frontend - About Page Update

### Task 5.1: Update about page loader

**Files:** `src/routes/[lang=locale]/about/+page.ts`

**Actions:**
1. Use async provider
2. Await getAboutData

**DoD:**
- [ ] Page loads from DB
- [ ] All sections display
- [ ] Language switching works

---

## Phase 6: Testing & Verification

### Task 6.1: Data integrity test

**Actions:**
1. Run migration
2. Verify /en/about displays correctly
3. All 3 education entries show
4. All 5 awards entries show
5. All 9 residencies entries show
6. Biography displays

**DoD:**
- [ ] All data migrated correctly
- [ ] No missing fields

### Task 6.2: Admin functionality test

**Actions:**
1. Edit artist name → verify on frontend
2. Upload new artist image → verify on frontend
3. Edit biography EN → verify on frontend
4. Edit biography RU → switch language, verify
5. Add education entry → appears
6. Edit education entry → changes persist
7. Delete education entry → removed
8. Same for awards (add/edit/delete)
9. Same for residencies (add/edit/delete)
10. Edit SEO → verify in page source

**DoD:**
- [ ] All 10 scenarios pass
- [ ] `npm run check` passes
- [ ] `npm run build` passes
- [ ] No console errors

---

## Audit Checklist

### Полнота (Completeness)
- [x] 4 database tables created
- [x] JSON to DB migration
- [x] Artist info editing
- [x] Image upload for artist
- [x] Biography 4 languages
- [x] Education CRUD
- [x] Awards CRUD
- [x] Residencies CRUD
- [x] SEO editing

### Реалистичность (Realism)
- [x] Each DoD is specific and verifiable
- [x] Tasks are appropriately sized
- [x] Complex admin UI broken into sections

### Порядок (Order)
- [x] Schema before migration
- [x] Migration before provider
- [x] Provider before admin
- [x] Admin before frontend update
- [x] Testing at end

---

*Plan audited and approved*
