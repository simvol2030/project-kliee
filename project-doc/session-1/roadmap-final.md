# Roadmap FINAL: Session-1 CMS Admin Panels

**Date:** 2026-01-08
**Version:** FINAL
**Status:** Ready for Implementation
**Prepared by:** Claude Code Web (Developer)

---

## Executive Summary

This roadmap covers 5 changes for the K-Liée CMS Admin Panels:

| Change | Priority | Scope | Est. Tasks |
|--------|----------|-------|------------|
| **changes-1-shop-modul** | HIGH | Fix media upload, add video | 11 tasks |
| **changes-2-work** | HIGH | Series migration, multi-image modal | 10 tasks |
| **changes-3-Exhibitions** | MEDIUM | DB migration, detail page, gallery | 12 tasks |
| **changes-4-nft** | MEDIUM | New table, admin, video player | 11 tasks |
| **changes-5-about** | MEDIUM | 4 tables, admin CRUD | 12 tasks |

**Total:** 56 tasks across 5 changes

---

## Implementation Order

```
Phase 1: Shared Schema Updates
    └── file_hash in media table (used by all)

Phase 2: changes-1-shop-modul (HIGH)
    └── Fix upload, add video, deduplication

Phase 3: changes-2-work (HIGH)
    └── Series migration, modal improvements

Phase 4: changes-3-Exhibitions (MEDIUM)
    └── Schema + migration + detail page

Phase 5: changes-4-nft (MEDIUM)
    └── New table + admin + public page

Phase 6: changes-5-about (MEDIUM)
    └── 4 tables + admin + migration

Phase 7: Final Verification
    └── Build, TypeScript, browser testing
```

---

## Detailed Task List

### 0. Shared Setup

| ID | Task | Files | DoD |
|----|------|-------|-----|
| 0.1 | Add file_hash to media table | schema.ts | Column exists, migration runs |
| 0.2 | Run drizzle-kit push | CLI | No errors |

---

### 1. changes-1-shop-modul

| ID | Task | Files | DoD |
|----|------|-------|-----|
| 1.1 | Add video types to upload API | api/media/upload | mp4, webm upload works |
| 1.2 | Add hash-based duplicate detection | api/media/upload | Duplicate returns existing |
| 1.3 | Add getProductImagesWithMedia | shop.provider.ts | Returns images with media |
| 1.4 | Add reorderProductImages | shop.provider.ts | Order updates |
| 1.5 | Add direct upload to product page | products/[id]/+page.svelte | Upload button works |
| 1.6 | Add drag-and-drop reordering | products/[id]/+page.svelte | Drag to reorder |
| 1.7 | Add reorderImages server action | products/[id]/+page.server.ts | Order persists |
| 1.8 | Add video rendering to gallery | ProductGallery.svelte | Videos play |
| 1.9 | Test: upload, duplicate, video, reorder | Browser | All pass |

---

### 2. changes-2-work

| ID | Task | Files | DoD |
|----|------|-------|-----|
| 2.1 | Create series migration script | scripts/migrate-series.ts | Script runs, 8 records |
| 2.2 | Convert series provider to async DB | series.provider.ts | Reads from DB |
| 2.3 | Add dynamic artwork count | series.provider.ts | Count from query |
| 2.4 | Add getArtworkWithAllImages | artworks.provider.ts | Returns all images |
| 2.5 | Create artwork images API endpoint | api/artworks/[id]/images | Returns images |
| 2.6 | Update works overview loader | works/+page.ts | Async series |
| 2.7 | Update series detail loader | works/[slug]/+page.server.ts | Async series |
| 2.8 | Update modal for multi-image | works/[slug]/+page.svelte | Navigation works |
| 2.9 | Add MediaPicker to series admin | series/[id]/+page.svelte | Image picker works |
| 2.10 | Test: migration, modal, admin | Browser | All pass |

---

### 3. changes-3-Exhibitions

| ID | Task | Files | DoD |
|----|------|-------|-----|
| 3.1 | Add type, year, slug, venue_* columns | schema.ts | Columns added |
| 3.2 | Create exhibitionImages table | schema.ts | Table created |
| 3.3 | Run migration | CLI | No errors |
| 3.4 | Create exhibitions migration script | scripts/migrate-exhibitions.ts | 14 records |
| 3.5 | Run migration | CLI | Data in DB |
| 3.6 | Rewrite exhibitions provider | exhibitions.provider.ts | Reads from DB |
| 3.7 | Update exhibitions list loader | exhibitions/+page.ts | Uses DB |
| 3.8 | Create exhibition detail page | exhibitions/[slug]/ | Page works |
| 3.9 | Add type, year, slug to admin form | exhibitions/[id]/+page.svelte | Fields work |
| 3.10 | Add gallery management to admin | exhibitions/[id]/+page.svelte | Gallery works |
| 3.11 | Update server actions | exhibitions/[id]/+page.server.ts | All save |
| 3.12 | Test: migration, detail, admin | Browser | All pass |

---

### 4. changes-4-nft

| ID | Task | Files | DoD |
|----|------|-------|-----|
| 4.1 | Create nfts table | schema.ts | Table with required fields |
| 4.2 | Run migration | CLI | No errors |
| 4.3 | Create NFT provider functions | nft.provider.ts | CRUD works |
| 4.4 | Create NFT list admin page | nft/+page.svelte | List displays |
| 4.5 | Create NFT edit admin page | nft/[id]/+page.svelte | Form with validation |
| 4.6 | Add required validation | nft/[id]/+page.server.ts | Cannot save without image/video/desc |
| 4.7 | Add NFT to admin navigation | +layout@.svelte | Link visible |
| 4.8 | Update NFT list page loader | nft/+page.ts | Uses DB |
| 4.9 | Create NFT detail page | nft/[slug]/ | Video plays, desc shows |
| 4.10 | Create migration script stub | scripts/migrate-nfts.ts | Ready for assets |
| 4.11 | Test: validation, CRUD, public | Browser | All pass |

---

### 5. changes-5-about

| ID | Task | Files | DoD |
|----|------|-------|-----|
| 5.1 | Create about_artist table | schema.ts | Table created |
| 5.2 | Create about_education table | schema.ts | Table created |
| 5.3 | Create about_awards table | schema.ts | Table created |
| 5.4 | Create about_residencies table | schema.ts | Table created |
| 5.5 | Run migration | CLI | All 4 tables exist |
| 5.6 | Create about migration script | scripts/migrate-about.ts | 18 records total |
| 5.7 | Run migration | CLI | Data in DB |
| 5.8 | Rewrite about provider | about.provider.ts | Reads from DB |
| 5.9 | Add CRUD functions | about.provider.ts | All CRUD works |
| 5.10 | Create about admin page | about/+page.svelte | Tabbed interface |
| 5.11 | Add About to admin navigation | +layout@.svelte | Link visible |
| 5.12 | Test: migration, admin, public | Browser | All pass |

---

### 6. Final Verification

| ID | Task | Command | DoD |
|----|------|---------|-----|
| 6.1 | TypeScript check | `npm run check` | 0 errors |
| 6.2 | Build | `npm run build` | Success |
| 6.3 | Browser test: Shop | Manual | Upload, video, reorder work |
| 6.4 | Browser test: Works | Manual | Modal, images, admin work |
| 6.5 | Browser test: Exhibitions | Manual | List, detail, admin work |
| 6.6 | Browser test: NFT | Manual | Validation, video, detail work |
| 6.7 | Browser test: About | Manual | All CRUD, public work |

---

## Files Created/Modified Summary

### New Files

| File | Change |
|------|--------|
| `src/lib/scripts/migrate-series.ts` | changes-2 |
| `src/lib/scripts/migrate-exhibitions.ts` | changes-3 |
| `src/lib/scripts/migrate-nfts.ts` | changes-4 |
| `src/lib/scripts/migrate-about.ts` | changes-5 |
| `src/routes/api/artworks/[id]/images/+server.ts` | changes-2 |
| `src/routes/[lang]/exhibitions/[slug]/+page.server.ts` | changes-3 |
| `src/routes/[lang]/exhibitions/[slug]/+page.svelte` | changes-3 |
| `src/routes/(admin)/nft/+page.svelte` | changes-4 |
| `src/routes/(admin)/nft/+page.server.ts` | changes-4 |
| `src/routes/(admin)/nft/[id]/+page.svelte` | changes-4 |
| `src/routes/(admin)/nft/[id]/+page.server.ts` | changes-4 |
| `src/routes/[lang]/nft/[slug]/+page.server.ts` | changes-4 |
| `src/routes/[lang]/nft/[slug]/+page.svelte` | changes-4 |
| `src/routes/(admin)/about/+page.svelte` | changes-5 |
| `src/routes/(admin)/about/+page.server.ts` | changes-5 |

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/server/db/schema.ts` | file_hash, exhibitions cols, exhibitionImages, nfts, about_* tables |
| `src/routes/api/media/upload/+server.ts` | Video types, hash detection |
| `src/lib/data/shop.provider.ts` | Image functions |
| `src/routes/(admin)/shop/products/[id]/+page.svelte` | Direct upload, reorder |
| `src/routes/(admin)/shop/products/[id]/+page.server.ts` | reorderImages action |
| `src/lib/components/shop/ProductGallery.svelte` | Video rendering |
| `src/lib/data/series.provider.ts` | Async DB queries |
| `src/lib/data/artworks.provider.ts` | getArtworkWithAllImages |
| `src/routes/[lang]/works/+page.ts` | Async loader |
| `src/routes/[lang]/works/[slug]/+page.server.ts` | Async series |
| `src/routes/[lang]/works/[slug]/+page.svelte` | Multi-image modal |
| `src/routes/(admin)/series/[id]/+page.svelte` | MediaPicker |
| `src/lib/data/exhibitions.provider.ts` | DB queries |
| `src/routes/[lang]/exhibitions/+page.ts` | Async loader |
| `src/routes/(admin)/exhibitions/[id]/+page.svelte` | New fields, gallery |
| `src/routes/(admin)/exhibitions/[id]/+page.server.ts` | New fields |
| `src/lib/data/nft.provider.ts` | DB queries, CRUD |
| `src/routes/[lang]/nft/+page.ts` | Async loader |
| `src/lib/data/about.provider.ts` | DB queries, CRUD |
| `src/routes/[lang]/about/+page.ts` | Async loader |
| `src/routes/(admin)/+layout@.svelte` | Add NFT, About links |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Provider async changes break pages | Update all consumers simultaneously |
| JSON backup lost | Keep JSON files as backup |
| Migration data loss | Test migration locally first |
| Video files too large | 50MB limit enforced |
| NFT assets missing | Create stub script, enter via admin |

---

## Success Criteria

- [ ] All 5 changes implemented
- [ ] TypeScript: 0 errors
- [ ] Build: Success
- [ ] All browser tests pass
- [ ] No console errors
- [ ] Light/dark theme works
- [ ] Language switching works
- [ ] Image optimization (webp) works
- [ ] Duplicate detection works

---

*Roadmap FINAL approved for implementation*
