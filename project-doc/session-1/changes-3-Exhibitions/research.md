# Research: Exhibitions Module

**Date:** 2026-01-08
**Status:** Complete

---

## Executive Summary

The Exhibitions module has a **dual-source problem**: frontend reads from JSON (`data/exhibitions.json`) while admin operates on an **empty** SQLite table. Two admin interfaces exist - one form-based, one modal-based. The DB schema is missing key fields (`type`, `year`, `slug`). Migration needed for 9 exhibitions + 5 art fairs.

---

## Current Architecture

```
Frontend: JSON file -> exhibitions.provider.ts -> Public pages
Admin: SQLite (empty) -> Form/API actions -> Admin pages
Status: DISCONNECTED - frontend and admin use different data sources
```

---

## Database Schema Analysis

### Exhibitions Table (`schema.ts:419-442`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER (PK) | Auto-increment |
| `title_en/ru/es/zh` | TEXT | 4 languages |
| `description_en/ru/es/zh` | TEXT | 4 languages |
| `venue` | TEXT | **SINGLE language - problem!** |
| `city` | TEXT | |
| `country` | TEXT | |
| `address` | TEXT | |
| `start_date` | TEXT | |
| `end_date` | TEXT | |
| `opening_hours` | TEXT | |
| `cover_image_id` | INTEGER (FK) | -> media |
| `gallery_link` | TEXT | |
| `is_current` | BOOLEAN | |
| `is_visible` | BOOLEAN | |
| `order_index` | INTEGER | |
| `created_at` | TEXT | |

**Missing fields:**
- `type` - solo/group/fair/festival/art_fair
- `year` - For timeline grouping
- `slug` - URL-friendly identifier
- `featured` - For homepage display
- `venue_en/ru/es/zh` - Multilingual venue

### Exhibition Artworks Table (`schema.ts:447-456`)

| Column | Type | Notes |
|--------|------|-------|
| `exhibition_id` | INTEGER (FK) | -> exhibitions (CASCADE) |
| `artwork_id` | TEXT (FK) | -> artworks |
| `order_index` | INTEGER | |

**Status:** Defined but not used

### Missing Table: `exhibitionImages`

No gallery support for exhibitions - only single cover_image_id

---

## JSON Data Structure

### File: `data/exhibitions.json`

```json
{
  "exhibitions": [
    {
      "id": "ex-2024-paris",           // String ID
      "year": 2024,                     // For timeline
      "title": { "en": "...", ... },   // 4 langs
      "venue": { "en": "...", ... },   // 4 langs
      "location": { "en": "...", ... },// 4 langs
      "type": "solo",                   // Exhibition type
      "current": true,
      "image": "/images/exhibitions/..."
    }
    // 9 exhibitions total
  ],
  "artFairs": [
    {
      "id": "af-2024-miami",
      "year": 2024,
      "title": { ... },
      "gallery": { ... },
      "location": { ... }
    }
    // 5 art fairs total
  ],
  "seo": { ... }
}
```

**Total records to migrate:** 14 (9 exhibitions + 5 art fairs)

---

## Key Files

| Purpose | Path |
|---------|------|
| DB Schema | `src/lib/server/db/schema.ts` |
| Exhibitions JSON | `data/exhibitions.json` |
| Exhibitions Provider | `src/lib/data/exhibitions.provider.ts` |
| Admin List (Form) | `src/routes/(admin)/exhibitions/+page.svelte` |
| Admin Edit (Form) | `src/routes/(admin)/exhibitions/[id]/+page.svelte` |
| Admin (Modal) | `src/routes/(admin)/content/exhibitions/+page.svelte` |
| API Endpoints | `src/routes/api/content/exhibitions/` |
| Public Page | `src/routes/[lang=locale]/exhibitions/+page.svelte` |

---

## Admin Status

### Interface 1: Form-based (`/exhibitions`)

**Status:** Works with empty DB

**Features:**
- DataTable list
- Form-based edit page
- MultilingualInput components
- MediaPicker (manual ID)

**Missing:**
- Type field
- Year field
- Gallery images

### Interface 2: Modal-based (`/content/exhibitions`)

**Status:** Alternative implementation

**Features:**
- Modal UI
- LanguageTabs
- API-based CRUD

**Recommendation:** Keep Interface 1, deprecate Interface 2

---

## Frontend Status

### Exhibitions Page (`/[lang]/exhibitions/`)

**Data Source:** JSON provider

**Sections:**
- Current exhibitions (with images)
- Past exhibitions timeline (grouped by year)
- Art Fairs (separate grid)

**Missing:**
- Individual exhibition detail page (`/[lang]/exhibitions/[slug]`)
- Gallery support

---

## Provider Analysis

### Current Provider (`exhibitions.provider.ts`)

```typescript
import exhibitionsDataRaw from '../../../../data/exhibitions.json';

export function getAllExhibitions(locale) { ... }
export function getCurrentExhibitions(locale) { ... }
export function getPastExhibitions(locale) { ... }
export function getAllArtFairs(locale) { ... }
export function getExhibitionsByYear(year, locale) { ... }
```

**Problem:** All functions read from JSON, not DB

---

## What Needs to Change

### 1. Update Schema

Add missing columns:
```typescript
type: text('type'), // solo/group/fair/festival/gallery/art_fair
year: integer('year'),
slug: text('slug').unique(),
featured: integer('featured', { mode: 'boolean' }),
venue_en: text('venue_en'),
venue_ru: text('venue_ru'),
venue_es: text('venue_es'),
venue_zh: text('venue_zh'),
```

### 2. Create Exhibition Images Table

```typescript
exhibitionImages = sqliteTable('exhibition_images', {
  id: integer('id').primaryKey(),
  exhibition_id: integer('exhibition_id').references(() => exhibitions.id, { onDelete: 'cascade' }),
  media_id: integer('media_id').references(() => media.id),
  order_index: integer('order_index').default(0),
  caption_en: text('caption_en'),
  caption_ru: text('caption_ru'),
  caption_es: text('caption_es'),
  caption_zh: text('caption_zh'),
});
```

### 3. Migrate JSON Data

- Import 9 exhibitions with type field
- Import 5 art fairs as type='art_fair'
- Handle image paths

### 4. Update Provider

Switch from JSON to DB queries (async)

### 5. Create Detail Page

Route: `/[lang]/exhibitions/[slug]/+page.svelte`

Content:
- Exhibition info
- Image gallery
- Related artworks

### 6. Add Type and Year to Admin

Update form to include:
- Type dropdown
- Year input
- Gallery image management

---

## Dependencies

No new packages needed.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Dual admin confusion | Deprecate modal interface |
| Schema changes | Use drizzle-kit push |
| JSON→DB migration | Create script, keep JSON backup |
| Image paths differ | Handle /images/ and /uploads/ |

---

*Research complete*
