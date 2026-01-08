# Research: Works/Series Module

**Date:** 2026-01-08
**Status:** Complete

---

## Executive Summary

The Works/Series module has a **hybrid architecture**: Series data is served from JSON (`data/series.json`), while Artworks have been migrated to SQLite. Both have complete DB schemas defined. Admin panels exist for both Series and Artworks with full CRUD. The main gap is that the **Series provider reads JSON instead of DB**, and the public works page needs to show all artwork images (not just primary).

---

## Current Architecture

```
Series: JSON file -> series.provider.ts (sync) -> Frontend
Artworks: SQLite -> artworks.provider.ts (async) -> Frontend
Admin: Both work with SQLite via Drizzle ORM
```

---

## Database Schema Analysis

### Series Table (`schema.ts:305-331`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (PK) | e.g., "ser_timestamp_random" |
| `slug` | TEXT | Unique |
| `name_en/ru/es/zh` | TEXT | 4 languages (NOT NULL) |
| `description_en/ru/es/zh` | TEXT | 4 languages |
| `cover_image_id` | INTEGER (FK) | -> media |
| `order_index` | INTEGER | |
| `is_visible` | BOOLEAN | |
| `is_featured` | BOOLEAN | |
| `show_in_shop` | BOOLEAN | |
| `seo_title_en/ru/es/zh` | TEXT | |
| `seo_description_en/ru/es/zh` | TEXT | |
| `created_at`, `updated_at` | TEXT | |

**Status:** Table defined and used by admin, but frontend reads JSON

### Artworks Table (`schema.ts:363-395`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (PK) | e.g., "art_timestamp_random" |
| `slug` | TEXT | Unique |
| `series_id` | TEXT (FK) | -> series |
| `title_en/ru/es/zh` | TEXT | 4 languages (NOT NULL) |
| `description_en/ru/es/zh` | TEXT | 4 languages |
| `technique` | TEXT | |
| `dimensions` | TEXT | |
| `year` | INTEGER | |
| `price` | INTEGER | In cents |
| `currency` | TEXT | Default 'EUR' |
| `is_featured` | BOOLEAN | |
| `is_for_sale` | BOOLEAN | |
| `is_visible` | BOOLEAN | |
| `order_index` | INTEGER | |

**Status:** Fully migrated to DB

### Artwork Images Table (`schema.ts:400-410`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER (PK) | |
| `artwork_id` | TEXT (FK) | -> artworks (CASCADE) |
| `media_id` | INTEGER (FK) | -> media |
| `is_primary` | BOOLEAN | |
| `order_index` | INTEGER | |

**Status:** Working, supports multi-image

---

## Data Sources

### JSON Series Data (`data/series.json`)

```json
{
  "series": [
    {
      "id": "chebu-rasha",
      "slug": "chebu-rasha",
      "title": { "en": "...", "ru": "...", "es": "...", "zh": "..." },
      "description": { "en": "...", "ru": "...", "es": "...", "zh": "..." },
      "coverImage": "/images/works/chebu-rasha/cheburasha.jpg",
      "artworkCount": 17,  // HARDCODED - not dynamic
      "order": 1
    }
    // ... 8 series total
  ]
}
```

### Series Provider (`src/lib/data/series.provider.ts`)

**Current behavior:** Reads directly from JSON
- `getAllSeries(locale)` - Get all series
- `getSeriesBySlug(slug, locale)` - Get single series
- `getSeriesById(id, locale)` - Get by ID

**Problem:** Uses synchronous JSON import, not DB queries

### Artworks Provider (`src/lib/data/artworks.provider.ts`)

**Current behavior:** Reads from SQLite (async)
- `getAllArtworks(locale)` - All visible artworks
- `getArtworksBySeries(seriesSlug, locale)` - Artworks in series
- `getArtworkById(id, locale)` - Single artwork with primary image only

**Problem:** Only returns primary image, not all images

---

## Key Files

| Purpose | Path |
|---------|------|
| DB Schema | `src/lib/server/db/schema.ts` |
| Series JSON | `data/series.json` |
| Artworks JSON | `data/artworks.json` (legacy) |
| Series Provider | `src/lib/data/series.provider.ts` |
| Artworks Provider (DB) | `src/lib/data/artworks.provider.ts` |
| Admin Series List | `src/routes/(admin)/series/+page.svelte` |
| Admin Series Detail | `src/routes/(admin)/series/[id]/+page.svelte` |
| Admin Artworks List | `src/routes/(admin)/artworks/+page.svelte` |
| Admin Artworks Detail | `src/routes/(admin)/artworks/[id]/+page.svelte` |
| MultiImagePicker | `src/lib/components/admin/MultiImagePicker.svelte` |
| Works Page | `src/routes/[lang=locale]/works/+page.svelte` |
| Series Detail | `src/routes/[lang=locale]/works/[slug]/+page.svelte` |

---

## Admin Status

### Series Admin

**Status:** Exists and works with DB

**Features:**
- List with DataTable
- Create/Edit with multilingual inputs
- Cover image ID (manual entry - needs MediaPicker)
- Order, visibility, featured flags

**Gap:** Cover image picker is just an ID input

### Artworks Admin

**Status:** Fully functional

**Features:**
- List with Table and Reorder views
- Create/Edit with multilingual inputs
- MultiImagePicker for images (drag & drop, reorder)
- Series dropdown
- Shop sync on save

---

## Frontend Status

### Works Overview (`/[lang]/works/`)

**Data Source:** Series from JSON provider
**Display:** Grid of series cards with cover images

### Series Detail (`/[lang]/works/[slug]/`)

**Data Sources:**
- Series info from JSON
- Artworks from DB (async)

**Features:**
- Grid of artworks
- Lightbox modal with multi-image navigation
- "Buy Now" links to shop

**Gap:** Uses JSON for series, should use DB

---

## What Needs to Change

### 1. Migrate Series to DB

- **Already in DB schema** - just need data migration
- Create migration script from JSON
- Switch provider to use DB

### 2. Update Series Provider

```typescript
// Current (sync, JSON):
import seriesDataRaw from '../../../../data/series.json';

// Needed (async, DB):
export async function getAllSeries(locale: LanguageCode) {
  const rows = await db.select().from(series).where(eq(series.is_visible, true));
  return rows.map(row => mapToLocalized(row, locale));
}
```

### 3. Dynamic Artwork Count

Replace hardcoded `artworkCount` with:
```sql
SELECT COUNT(*) FROM artworks WHERE series_id = ? AND is_visible = true
```

### 4. All Images in Artwork Provider

Update `getArtworkById` to return all images, not just primary

### 5. Add MediaPicker to Series Admin

Replace manual cover_image_id input with MediaPicker component

---

## Dependencies

No new packages needed - all patterns already exist in codebase.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Provider sync->async breaks pages | Update all consumers to await |
| JSON artworkCount is static | Implement count query |
| Image paths mix /images/ and /uploads/ | Keep buildImageUrl() compatible |

---

*Research complete*
