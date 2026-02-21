# Spec-final: Homepage CMS — Connect Public Page to Database

**Version:** final
**Status:** FOR DEVELOPER
**Score:** 21 (Developer)

---

## Problem

The public homepage reads from `static/data/homepage.json` (via `homepage.provider.ts`), while the admin panel writes to DB tables (`homepage_hero`, `homepage_about`, etc.). They are completely disconnected — admin changes don't show on the public site.

## Goal

Make the public homepage read from the database, so admin CMS changes appear immediately.

---

## What Needs to Be Done

### Step 1: Rewrite `homepage.provider.ts` (CRITICAL)

**File:** `src/lib/data/homepage.provider.ts`

Replace `readFileSync(homepage.json)` with async Drizzle queries:

```
getHomepageDataFromDb() → async
├── homepage_hero + hero_slides → Hero section
├── homepage_about → About section (split text by \n\n for paragraphs[])
├── homepage_news → News section
├── homepage_testimonials → Testimonials section
├── homepage_process → Process section
├── homepage_featured_collections (NEW) → FeaturedCollections section
└── exhibitions (with featured flag) → ExhibitionsPreview section
```

Keep JSON as fallback: if DB returns empty, fall back to JSON data.

**File:** `src/routes/[lang=locale]/+page.server.ts`
- Change `getHomepageData()` to `await getHomepageDataFromDb()`

### Step 2: New Table — `homepage_featured_collections`

**File:** `src/lib/server/db/schema.ts`

```
homepage_featured_collections:
  id INTEGER PRIMARY KEY
  series_id INTEGER REFERENCES series(id)    -- links to existing series
  title_override_en TEXT                      -- optional, falls back to series.title_en
  title_override_ru TEXT
  title_override_es TEXT
  title_override_zh TEXT
  description_override_en TEXT
  description_override_ru TEXT
  description_override_es TEXT
  description_override_zh TEXT
  cover_image_id INTEGER REFERENCES media(id) -- optional, falls back to series cover
  link TEXT                                    -- custom URL override
  order_index INTEGER DEFAULT 0
  is_visible INTEGER DEFAULT 1
```

### Step 3: Exhibitions Preview — Featured Selection

Add a way to mark which exhibition shows on homepage:

Option A: Add `is_homepage_featured INTEGER DEFAULT 0` to `exhibitions` table
Option B: Store exhibition ID in `homepage_sections` with `section_type='exhibitions_preview'`

Recommended: Option A (simpler query)

Also store section title/subtitle for exhibitions preview (use `homepage_sections` table with content JSON).

### Step 4: Schema Fixes

| Table | Missing Field | Type | Purpose |
|-------|---------------|------|---------|
| `homepage_process` | `image_id` | `INTEGER REFERENCES media(id)` | Process step image (JSON has `image`, DB only has `icon`) |
| `homepage_hero` | `announcement_link` | `TEXT` | Link for the announcement banner |

### Step 5: New Admin Tabs

**File:** `src/routes/(admin)/homepage/+page.svelte`

Add new tab: **"Featured Collections"**
- List of collections linked to series
- Drag/reorder (or order_index input)
- Override title/description per language
- MediaPicker for cover image override
- Visibility toggle

**File:** `src/routes/api/homepage/collections/+server.ts` (NEW)
- GET: list all featured collections (join with series for defaults)
- POST: create new featured collection
- API for individual: `/api/homepage/collections/[id]` — PATCH, DELETE

### Step 6: Section Visibility

Add ability to show/hide each section on the homepage:

Either:
- Add `is_visible` field to each section's main table (hero, about, etc.)
- Or use `homepage_sections` table with `section_type` + `is_visible` flag

The provider should filter by `is_visible` when building the response.

---

## Key Files to Modify

| File | Action |
|------|--------|
| `src/lib/data/homepage.provider.ts` | **Rewrite**: JSON → DB queries |
| `src/lib/server/db/schema.ts` | **Add**: `homepage_featured_collections` table, fix missing fields |
| `src/routes/[lang=locale]/+page.server.ts` | **Update**: async call |
| `src/routes/(admin)/homepage/+page.svelte` | **Add**: Featured Collections tab |
| `src/routes/api/homepage/collections/+server.ts` | **Create**: CRUD API |
| `src/routes/api/homepage/collections/[id]/+server.ts` | **Create**: individual CRUD |

## Key Files to Reference

| File | Pattern |
|------|---------|
| `src/routes/(admin)/homepage/+page.svelte` | Existing admin tabs (news, testimonials) |
| `src/routes/api/homepage/news/+server.ts` | CRUD API pattern |
| `src/routes/api/homepage/hero/+server.ts` | Hero API pattern |

---

## Verification

- [ ] Admin changes to Hero → visible on public homepage
- [ ] Admin changes to About → visible on public homepage
- [ ] Admin News items → visible on public homepage
- [ ] Admin Testimonials → visible on public homepage
- [ ] Admin Process steps → visible on public homepage
- [ ] New Featured Collections tab works in admin
- [ ] Featured Collections appear on public homepage
- [ ] Exhibition selection for homepage works
- [ ] Section visibility toggles work
- [ ] Empty DB → falls back to JSON data
- [ ] No regression: existing admin tabs still work

---

*Created: 2026-02-19*
