# Implementation Plan: NFT Module

**Date:** 2026-01-08
**Status:** Audited

---

## Phase 1: Database Schema

### Task 1.1: Create nfts table

**Files:** `src/lib/server/db/schema.ts`

**Actions:**
1. Create `nfts` table definition
2. Add all columns from tech-spec:
   - id, slug (required)
   - title_en/ru/es/zh (NOT NULL)
   - description_en/ru/es/zh (NOT NULL)
   - image_id, video_id (NOT NULL, FK)
   - technique, year, price, currency
   - opensea_url, blockchain
   - is_featured, is_visible, order_index
   - created_at

**DoD:**
- [ ] Table definition added
- [ ] All required fields marked NOT NULL
- [ ] Foreign keys reference media table

### Task 1.2: Run migration

**Actions:**
1. Run `npx drizzle-kit push`

**DoD:**
- [ ] Migration runs without errors
- [ ] nfts table exists in DB
- [ ] Foreign key constraints active

---

## Phase 2: Backend - NFT Provider

### Task 2.1: Create NFT provider functions

**Files:** `src/lib/data/nft.provider.ts`

**Actions:**
1. Keep page content functions (read from JSON for hero/seo)
2. Add `getAllNfts(locale)` - DB query
3. Add `getFeaturedNfts(locale)` - DB query
4. Add `getNftBySlug(slug, locale)` - DB query
5. Add `getNftById(id)` - for admin
6. Add `createNft(data)` - insert
7. Add `updateNft(id, data)` - update
8. Add `deleteNft(id)` - delete
9. Add helper to build media URLs

**DoD:**
- [ ] All query functions work
- [ ] CRUD functions work
- [ ] Page content still reads from JSON
- [ ] Type safety maintained

---

## Phase 3: Admin - NFT Pages

### Task 3.1: Create NFT list page

**Files:**
- `src/routes/(admin)/nft/+page.svelte`
- `src/routes/(admin)/nft/+page.server.ts`

**Actions:**
1. Create list page with DataTable
2. Show title, technique, year, price columns
3. Add "Add NFT" button
4. Add edit/delete actions
5. Create loader to fetch NFTs

**DoD:**
- [ ] List page renders
- [ ] Shows all NFTs from DB
- [ ] Edit button navigates to edit page
- [ ] Delete button with confirmation

### Task 3.2: Create NFT edit page

**Files:**
- `src/routes/(admin)/nft/[id]/+page.svelte`
- `src/routes/(admin)/nft/[id]/+page.server.ts`

**Actions:**
1. Create form with all fields
2. Use MultilingualInput for title
3. Use MultilingualTextarea for description
4. Use MediaPicker for image (required)
5. Use MediaPicker for video (required)
6. Add validation for required fields
7. Show error if missing image/video/description
8. Create server actions for save

**DoD:**
- [ ] Form displays all fields
- [ ] Image picker visible and required
- [ ] Video picker visible and required
- [ ] Description fields visible and required
- [ ] Cannot save without image → shows error
- [ ] Cannot save without video → shows error
- [ ] Cannot save without description → shows error
- [ ] Valid form saves correctly

### Task 3.3: Add NFT to admin navigation

**Files:** `src/routes/(admin)/+layout@.svelte`

**Actions:**
1. Add NFT link in Content section
2. Use appropriate icon

**DoD:**
- [ ] NFT link visible in sidebar
- [ ] Clicking navigates to /nft

---

## Phase 4: Frontend - Public Pages

### Task 4.1: Update NFT list page loader

**Files:** `src/routes/[lang=locale]/nft/+page.ts`

**Actions:**
1. Use async provider functions
2. Fetch nfts, pageContent, collection, seo

**DoD:**
- [ ] Page loads NFTs from DB
- [ ] Hero/description still from JSON

### Task 4.2: Create NFT detail page

**Files:**
- `src/routes/[lang=locale]/nft/[slug]/+page.server.ts`
- `src/routes/[lang=locale]/nft/[slug]/+page.svelte`

**Actions:**
1. Create loader with getNftBySlug
2. Create page component with:
   - Breadcrumb navigation
   - Video player (primary content)
   - Image as poster
   - Title
   - Description
   - Details (technique, year, price)
   - OpenSea buy button
   - Back link

**DoD:**
- [ ] Page loads for valid slug
- [ ] 404 for invalid slug
- [ ] Video plays with controls
- [ ] Image shows as poster
- [ ] Description displays (localized)
- [ ] OpenSea link works
- [ ] Theme switching works

---

## Phase 5: Data Migration

### Task 5.1: Create migration script

**Files:** `src/lib/scripts/migrate-nfts.ts`

**Note:** This task requires:
- Video files (_1_.mp4 to _5_.mp4) to be uploaded first
- Descriptions translated to RU/ES/ZH
- Images created from video thumbnails or provided separately

**Actions:**
1. Create script skeleton
2. Document required input data
3. Prepare for manual data entry via admin

**DoD:**
- [ ] Script structure created
- [ ] Requirements documented
- [ ] Can be run when assets available

---

## Phase 6: Testing & Verification

### Task 6.1: Validation testing

**Actions:**
1. Admin: Try to create NFT without image → error
2. Admin: Try to create NFT without video → error
3. Admin: Try to create NFT without description EN → error
4. Admin: Try to create NFT without description RU → error
5. Admin: Create NFT with all fields → success

**DoD:**
- [ ] All 5 validation scenarios pass

### Task 6.2: Full functionality test

**Actions:**
1. Create test NFT with all required fields
2. Verify appears in list
3. Edit test NFT → changes persist
4. Visit public NFT list → shows item
5. Click NFT → detail page opens
6. Video plays
7. Switch language → description changes
8. Delete test NFT → removed

**DoD:**
- [ ] All test scenarios pass
- [ ] `npm run check` passes
- [ ] `npm run build` passes
- [ ] No console errors

---

## Audit Checklist

### Полнота (Completeness)
- [x] nfts table with required fields
- [x] Required validation (image, video, description x4)
- [x] Admin CRUD
- [x] Detail page with video
- [x] OpenSea integration
- [x] Multilingual descriptions

### Реалистичность (Realism)
- [x] Each DoD is specific and verifiable
- [x] Tasks are appropriately sized
- [x] Migration marked as asset-dependent

### Порядок (Order)
- [x] Schema before provider
- [x] Provider before admin
- [x] Admin before public pages
- [x] Testing at end

---

*Plan audited and approved*
