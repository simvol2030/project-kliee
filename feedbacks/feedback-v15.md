# Feedback v15 - Session-1 Audit: UI Concept Violations + Critical Bugs

**Date:** 2026-01-09
**Environment:** Production (https://k-liee.com)
**Prepared by:** CLI (Integrator)
**For:** Developer (Claude Code Web)
**Priority:** HIGH - Multiple UI violations + critical errors

---

## Executive Summary

Full audit of Session-1 implementation revealed:
- 1 section implemented correctly (Shop Products)
- 4 sections with UI concept violations
- 2 critical bugs blocking functionality
- Data migration incomplete in some sections
- **NEW: Media Library critical path bug - images not displaying**

---

## UI Concept Requirement

**STANDARD (from Shop Products):**
```
┌─────────────────────────────────────────┐
│ [EN] [RU] [ES] [ZH]    ← Language TABS  │
├─────────────────────────────────────────┤
│ Title: [________________]               │
│ Description: [______________]           │
└─────────────────────────────────────────┘
```
Switching tabs changes content. Compact, clean.

**VIOLATION (found in NFT, About):**
```
┌─────────────────────────────────────────┐
│ Title (English): [________________]     │
│ Title (Russian): [________________]     │
│ Title (Spanish): [________________]     │
│ Title (Chinese): [________________]     │
│ Description (English): [__________]     │
│ Description (Russian): [__________]     │
│ Description (Spanish): [__________]     │
│ Description (Chinese): [__________]     │
└─────────────────────────────────────────┘
```
8 fields instead of 2 + tabs. Bloated, confusing.

---

## 🔴 NEW: Media Library Critical Bugs

### Bug M-1: Image Path Duplication (Score 8 - CRITICAL)

**Where:** `/media` admin page and all MediaPicker dialogs

**Problem:** Image URLs are DOUBLED, causing 404 errors for all old images.

**Network Request Example:**
```
ACTUAL (broken):
https://k-liee.com/uploads/images/works/chebu-rasha//images/works/chebu-rasha/7_2.jpg
                                                    ↑↑ DUPLICATED PATH

EXPECTED (correct):
https://k-liee.com/uploads/images/works/chebu-rasha/7_2.jpg
```

**Symptoms:**
- Media Library shows broken image placeholders
- All old images show "0 B" file size
- 404 errors in console for `/uploads/...//.../filename.jpg`

**Root Cause:** When constructing image URL, the code concatenates:
- Base path: `/uploads`
- DB stored path: `/images/works/chebu-rasha/7_2.jpg`

But if DB already stores full path starting with `/images/...`, it gets duplicated.

**Fix Required:** Check how image URLs are constructed in:
- `src/routes/(admin)/media/+page.svelte` (display)
- `src/lib/components/MediaPicker.svelte` (if exists)
- API that returns media list

**Impact:**
- ~65 images broken in admin
- NFT/Series/Exhibitions can't display existing images
- Only newly uploaded images (with correct paths like `chebu-rasha-blue.jpg`) work

---

### Bug M-2: No Video Upload Capability (Score 6)

**Where:** Media Library upload functionality

**Problem:** Cannot upload videos anywhere in admin.

**Flow:**
1. Go to NFT edit → Click "Select Video"
2. Dialog shows: "No videos available. Upload videos in Media section first."
3. Go to Media section → Only "Upload Images" button exists
4. **No way to upload videos!**

**Fix Required:** Add video upload support to Media Library:
- Allow `.mp4`, `.webm`, `.mov` file types
- Store in `/uploads/videos/` or similar
- Display in MediaPicker when `type="video"`

**Impact:** NFT section cannot have videos attached

---

## Section-by-Section Analysis

### 1. Shop Products ✅ CORRECT

| Aspect | Status | Notes |
|--------|--------|-------|
| Language TABS | ✅ | EN/RU/ES/ZH buttons work |
| Images | ✅ | 51 products with images |
| CRUD | ✅ | Create/Read/Update/Delete works |
| MediaPicker | ✅ | Upload + Select from Media |

**No action needed.**

---

### 2. Series (Works) ⚠️ PARTIAL

| Aspect | Plan | Fact | Status |
|--------|------|------|--------|
| Language TABS for Name | Yes | Yes | ✅ |
| Language TABS for Description | Yes | Yes | ✅ |
| Cover Image MediaPicker | MediaPicker | Spinbutton (ID number) | ❌ |
| Dynamic artwork count | SELECT COUNT(*) | Shows "—" for all | ❌ |

**Issues:**

**Bug S-1: Cover Image = Spinbutton (Score 4)**
- Where: `/series/[slug]` edit form
- Expected: MediaPicker button to select/upload image
- Actual: `<spinbutton>` requiring manual ID number input
- Impact: Users cannot easily select cover images

**Bug S-2: Artwork Count Not Dynamic (Score 3)**
- Where: `/series` list, column "Artworks"
- Expected: Count from `SELECT COUNT(*) FROM artworks WHERE series_id = ?`
- Actual: Shows "—" for all 8 series
- Impact: Cannot see how many works in each series

---

### 3. Exhibitions 🔴 CRITICAL BUGS

| Aspect | Plan | Fact | Status |
|--------|------|------|--------|
| Edit form accessible | Yes | 400 Error | ❌ CRITICAL |
| Year column display | Show year | Shows "—" | ❌ |
| Venue column display | Show venue | Shows "—" | ❌ |
| Current column display | Show status | Shows "—" | ❌ |
| Language TABS | Not tested | Cannot access form | ❓ |

**Critical Bugs:**

**Bug E-1: Edit Returns 400 (Score 10 - CRITICAL)**
- Where: Click Edit on any exhibition
- URL: `/exhibitions/tales-xenophobia-paris-2024`
- Expected: Edit form opens
- Actual: `400 - Invalid exhibition ID`
- Root Cause: Route expects numeric ID but receives slug
- Impact: **ALL exhibition editing is broken**

**Bug E-2: Columns Show "—" (Score 5)**
- Where: `/exhibitions` list
- Columns: Year, Venue, Current = all "—"
- Expected: Display data from DB
- Actual: No data shown despite 14 records in DB
- Root Cause: Provider not returning year/venue/is_current fields

**Bug E-3: Data Mismatch (Score 4)**
- Where: Database vs JSON source
- JSON `data/exhibitions.json` contains: Tales of Xenophobia, Lev Tolstoy, Scope Miami Beach, Hotel-Hempel, Meat, Vesna Hempel...
- DB contains: Tales of Xenophobia, Tribute to Picasso, The Shaman Series, The Circus Series...
- Impact: Wrong/test data in production

---

### 4. NFT 🔴 UI VIOLATION

| Aspect | Plan | Fact | Status |
|--------|------|------|--------|
| Language TABS for Title | TABS (EN/RU/ES/ZH) | Separate fields ×4 | ❌ VIOLATION |
| Language TABS for Description | TABS | Separate fields ×4 | ❌ VIOLATION |
| Image attached | Required | "No image" all 4 | ❌ |
| Video attached | Required | "Video is required" all 4 | ❌ |
| Data from JSON | 4+1 NFTs | 4 records, no media | ⚠️ |

**Issues:**

**Bug N-1: UI Violation - Separate Fields Instead of TABS (Score 8)**
- Where: `/nft/[id]` edit form
- Expected:
  ```
  [EN] [RU] [ES] [ZH] tabs
  Title: [___________]
  Description: [___________]
  ```
- Actual:
  ```
  Title (English): [___________]
  Title (Russian): [___________]
  Title (Spanish): [___________]
  Title (Chinese): [___________]
  Description (English): [___________]
  Description (Russian): [___________]
  Description (Spanish): [___________]
  Description (Chinese): [___________]
  ```
- Impact: 8 fields instead of 2+tabs, bloated form

**Bug N-2: No Images Attached (Score 6)**
- Where: `/nft` list, all 4 NFTs
- Expected: Image thumbnails
- Actual: "No image" for all
- Impact: NFTs appear broken

**Bug N-3: No Videos Attached (Score 6)**
- Where: `/nft/[id]` edit form
- Expected: Video file selected
- Actual: "Video is required" warning
- Impact: NFT videos missing

---

### 5. About ⚠️ PARTIAL UI VIOLATION

| Aspect | Plan | Fact | Status |
|--------|------|------|--------|
| Section TABS (Artist/Education/Awards/Residencies/SEO) | Yes | Yes | ✅ |
| Language TABS for Biography | TABS | Separate fields ×4 | ❌ VIOLATION |
| Artist Image | MediaPicker | "Select Image" (empty) | ❌ |
| Education Add form | All 4 languages | Only EN fields | ❌ |
| Awards Add form | All 4 languages | Not tested | ❓ |
| Residencies Add form | All 4 languages | Not tested | ❓ |
| Data migrated | 3 edu, 5 awards, 9 residencies | 3 edu visible | ⚠️ |

**Issues:**

**Bug A-1: Biography UI Violation (Score 6)**
- Where: `/about` Artist tab
- Expected: Language TABS for biography
- Actual: 4 separate textareas (English, Russian, Spanish, Chinese)
- Impact: Inconsistent with Shop Products UI pattern

**Bug A-2: Artist Image Not Attached (Score 4)**
- Where: `/about` Artist tab
- Expected: Image visible with Replace option
- Actual: Just "Select Image" button, no image
- Impact: Artist photo missing in admin

**Bug A-3: Education Add Only EN (Score 5)**
- Where: `/about` Education tab, Add form
- Expected: Fields for Degree/Institution in all 4 languages
- Actual: Only "Degree (EN)", "Institution (EN)"
- Impact: Cannot add multilingual education entries

---

## Priority Task List for Developer

### CRITICAL (Must Fix First)

| ID | Task | Score | Section |
|----|------|-------|---------|
| E-1 | Fix Exhibition edit 400 error | 10 | Exhibitions |
| **M-1** | **Fix Media Library image path duplication** | **8** | **Media** |

### HIGH (UI Violations + Media)

| ID | Task | Score | Section |
|----|------|-------|---------|
| N-1 | Convert NFT Title/Description to TABS | 8 | NFT |
| M-2 | Add video upload to Media Library | 6 | Media |
| N-2 | Attach images to NFTs | 6 | NFT |
| N-3 | Attach videos to NFTs | 6 | NFT |
| A-1 | Convert About Biography to TABS | 6 | About |

### MEDIUM (Functionality)

| ID | Task | Score | Section |
|----|------|-------|---------|
| E-2 | Fix Exhibitions list columns (Year/Venue/Current) | 5 | Exhibitions |
| A-3 | Add RU/ES/ZH fields to Education Add form | 5 | About |
| S-1 | Replace Series Cover Image spinbutton with MediaPicker | 4 | Series |
| E-3 | Re-migrate exhibitions from correct JSON source | 4 | Exhibitions |
| A-2 | Attach Artist image in About | 4 | About |

### LOW

| ID | Task | Score | Section |
|----|------|-------|---------|
| S-2 | Implement dynamic artwork count in Series list | 3 | Series |

---

## Implementation Guide

### Fixing M-1 (Media Library Image Paths)

**Step 1:** Find where URLs are constructed. Check:
```
src/routes/(admin)/media/+page.svelte
src/routes/(admin)/media/+page.server.ts
src/lib/server/db/media.ts (if exists)
```

**Step 2:** The bug is likely in URL construction:
```typescript
// WRONG:
const url = `/uploads${media.path}`;  // path already contains /images/...

// CORRECT:
const url = media.path.startsWith('/uploads')
  ? media.path
  : `/uploads${media.path}`;

// OR if path should be just filename:
const url = `/uploads/images/${media.filename}`;
```

**Step 3:** Check database `media` table to see what `path` field actually contains.

---

### Fixing M-2 (Video Upload)

**Step 1:** Modify Media Library upload to accept videos:
```typescript
// In upload handler
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
```

**Step 2:** Add video filter tab to Media Library:
```svelte
<button on:click={() => filter = 'videos'}>Videos</button>
```

**Step 3:** Update MediaPicker to filter by type:
```svelte
{#if type === 'video'}
  {#each media.filter(m => m.mime_type.startsWith('video/')) as item}
{:else}
  {#each media.filter(m => m.mime_type.startsWith('image/')) as item}
{/if}
```

---

### Converting to TABS (for N-1, A-1)

Reference implementation: `src/routes/(admin)/shop/products/[id]/+page.svelte`

```svelte
<!-- CORRECT: TABS pattern -->
<div class="language-tabs">
  <button class:active={activeLang === 'en'} on:click={() => activeLang = 'en'}>EN</button>
  <button class:active={activeLang === 'ru'} on:click={() => activeLang = 'ru'}>RU</button>
  <button class:active={activeLang === 'es'} on:click={() => activeLang = 'es'}>ES</button>
  <button class:active={activeLang === 'zh'} on:click={() => activeLang = 'zh'}>ZH</button>
</div>

{#if activeLang === 'en'}
  <input bind:value={title_en} />
  <textarea bind:value={description_en} />
{:else if activeLang === 'ru'}
  <input bind:value={title_ru} />
  <textarea bind:value={description_ru} />
{:else if activeLang === 'es'}
  ...
{:else if activeLang === 'zh'}
  ...
{/if}
```

### Fixing E-1 (Exhibition Edit 400)

Check route parameter handling:
```
src/routes/(admin)/exhibitions/[id]/+page.server.ts
```

Issue: Route likely expects numeric ID but link uses slug.
Solution A: Change links to use numeric ID: `/exhibitions/1`
Solution B: Change route to accept slug: `/exhibitions/[slug]`

---

## Verification Checklist (Post-Fix)

### Media Library (CRITICAL)
- [ ] `/media` shows ALL images (no broken placeholders)
- [ ] Old images show correct file sizes (not "0 B")
- [ ] No 404 errors in console for image URLs
- [ ] Video upload available in Media section
- [ ] Video MediaPicker shows uploaded videos

### Admin Sections
- [ ] NFT edit form: Language TABS work (EN/RU/ES/ZH)
- [ ] About biography: Language TABS work
- [ ] Exhibition edit: Opens without error
- [ ] Exhibition list: Year/Venue/Current columns show data
- [ ] NFT list: Images display
- [ ] Series edit: MediaPicker for cover image
- [ ] About Education: Can add entry with all 4 languages

### Build
- [ ] `npm run check` returns 0 errors
- [ ] `npm run build` succeeds

---

## Branch to Create

```
claude/session-1-ui-fixes-v15
```

---

*Prepared by: CLI Integrator*
*For: Claude Code Web Developer*
*Action Required: Fix critical bugs first, then UI violations*
*Expected outcome: Consistent TABS pattern across all admin sections*
