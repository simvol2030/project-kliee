# Research: About Module

**Date:** 2026-01-08
**Status:** Complete

---

## Executive Summary

The About module has a **fully working frontend** that reads from JSON (`data/about.json`), but **no database tables or admin panel exist**. All content (artist info, biography, education, awards, residencies) is stored in a single JSON file. The spec requires creating 4 new tables and a comprehensive admin interface.

---

## Current Architecture

```
Frontend: JSON file -> about.provider.ts -> Public About page
Admin: DOES NOT EXIST
Database: NO about_* tables (only homepage_about for homepage preview)
Status: Frontend works, admin missing
```

---

## Database Schema Analysis

### About Tables: **DO NOT EXIST**

After reviewing `schema.ts`:
- No `about_artist` table
- No `about_education` table
- No `about_awards` table
- No `about_residencies` table

### Related Table: `homepage_about` (`schema.ts:222-238`)

This is for the **homepage preview section**, NOT the main about page:

```typescript
homepageAbout = sqliteTable('homepage_about', {
  id: integer('id').primaryKey(),
  title_en/ru/es/zh: text(...),
  text_en/ru/es/zh: text(...),
  image_id: integer('image_id').references(() => media.id),
  cta_text_en/ru/es/zh: text(...),
  cta_href: text('cta_href')
});
```

---

## JSON Data Structure

### File: `data/about.json`

```json
{
  "version": "1.0",
  "lastUpdated": "2025-12-20",

  "artist": {
    "name": "Svetlana K-Liee",
    "image": "/images/about/ELT_5672.jpg",
    "birthYear": null,
    "nationality": "Russian-British",
    "basedIn": "England"
  },

  "biography": {
    "en": "...", "ru": "...", "es": "...", "zh": "..."
  },

  "education": [
    {
      "year": "2000",  // STRING for ranges like "2001-2005"
      "degree": { "en": "...", "ru": "...", "es": "...", "zh": "..." },
      "institution": { "en": "...", "ru": "...", "es": "...", "zh": "..." }
    }
    // 3 entries
  ],

  "awards": [
    {
      "year": "2004",
      "title": { "en": "...", "ru": "...", "es": "...", "zh": "..." },
      "organization": { "en": "...", "ru": "...", "es": "...", "zh": "..." }
    }
    // 5 entries
  ],

  "residencies": [
    {
      "year": "2006",
      "location": { "en": "...", "ru": "...", "es": "...", "zh": "..." }
    }
    // 9 entries
  ],

  "seo": {
    "title": { ... },
    "description": { ... }
  }
}
```

**Current data counts:**
- 1 artist profile
- 3 education entries
- 5 awards entries
- 9 residencies entries

---

## Key Files

| Purpose | Path | Status |
|---------|------|--------|
| About JSON | `data/about.json` | EXISTS |
| About Provider | `src/lib/data/about.provider.ts` | EXISTS (JSON) |
| About Types | `src/lib/types/content.types.ts:172-252` | EXISTS |
| About Page | `src/routes/[lang=locale]/about/+page.svelte` | EXISTS |
| About Admin | - | MISSING |

---

## Provider Analysis

### Current Provider (`about.provider.ts`)

```typescript
import aboutDataRaw from '../../../../data/about.json';

export function getAboutData(locale) { ... }
export function getBiography(locale) { ... }
export function getArtistInfo() { ... }
export function getEducation(locale) { ... }
export function getAwards(locale) { ... }
export function getResidencies(locale) { ... }
export function getSeoData(locale) { ... }
```

**All functions read from JSON synchronously**

---

## TypeScript Types

### Current Types (`content.types.ts:172-252`)

```typescript
interface ArtistInfo {
  name: string;
  image: string;
  birthYear: number | null;
  nationality: string;
  basedIn: string;
}

interface Education {
  year: string;  // String for ranges!
  degree: TranslatedString;
  institution: TranslatedString;
}

interface Award {
  year: string;
  title: TranslatedString;
  organization: TranslatedString;
}

interface Residency {
  year: string;
  location: TranslatedString;
}
```

---

## Frontend Status

### About Page (`/[lang]/about/`)

**Status:** Fully working

**Sections:**
1. Hero - Artist photo, name, nationality, location
2. Biography - Full text
3. Education - Timeline list
4. Awards - Timeline list
5. Residencies - Card grid

**Features:**
- Multi-language (EN/RU/ES/ZH)
- Light/dark theme
- Responsive layout

---

## Admin Navigation

Current admin sidebar:
- Content: Media, Artworks, Series, Exhibitions
- **NO About section**

---

## What Needs to Be Created

### 1. Database Tables

**about_artist (singleton)**
```typescript
aboutArtist = sqliteTable('about_artist', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  image_id: integer('image_id').references(() => media.id),
  nationality: text('nationality'),
  based_in: text('based_in'),
  biography_en: text('biography_en'),
  biography_ru: text('biography_ru'),
  biography_es: text('biography_es'),
  biography_zh: text('biography_zh'),
  seo_title_en: text('seo_title_en'),
  seo_title_ru: text('seo_title_ru'),
  seo_title_es: text('seo_title_es'),
  seo_title_zh: text('seo_title_zh'),
  seo_description_en: text('seo_description_en'),
  seo_description_ru: text('seo_description_ru'),
  seo_description_es: text('seo_description_es'),
  seo_description_zh: text('seo_description_zh'),
});
```

**about_education**
```typescript
aboutEducation = sqliteTable('about_education', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: text('year').notNull(),  // TEXT for ranges
  degree_en: text('degree_en').notNull(),
  degree_ru: text('degree_ru').notNull(),
  degree_es: text('degree_es').notNull(),
  degree_zh: text('degree_zh').notNull(),
  institution_en: text('institution_en').notNull(),
  institution_ru: text('institution_ru').notNull(),
  institution_es: text('institution_es').notNull(),
  institution_zh: text('institution_zh').notNull(),
  order_index: integer('order_index').default(0),
});
```

**about_awards**
```typescript
aboutAwards = sqliteTable('about_awards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: text('year').notNull(),
  title_en: text('title_en').notNull(),
  title_ru: text('title_ru').notNull(),
  title_es: text('title_es').notNull(),
  title_zh: text('title_zh').notNull(),
  organization_en: text('organization_en').notNull(),
  organization_ru: text('organization_ru').notNull(),
  organization_es: text('organization_es').notNull(),
  organization_zh: text('organization_zh').notNull(),
  order_index: integer('order_index').default(0),
});
```

**about_residencies**
```typescript
aboutResidencies = sqliteTable('about_residencies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: text('year').notNull(),
  location_en: text('location_en').notNull(),
  location_ru: text('location_ru').notNull(),
  location_es: text('location_es').notNull(),
  location_zh: text('location_zh').notNull(),
  order_index: integer('order_index').default(0),
});
```

### 2. Admin Page

**Single page with sections:** `/routes/(admin)/about/+page.svelte`

Sections:
1. **Artist Info** - Name, image (MediaPicker), nationality, location
2. **Biography** - LanguageTabs with textarea
3. **Education** - CRUD table
4. **Awards** - CRUD table
5. **Residencies** - CRUD table
6. **SEO** - Title and description (4 langs)

### 3. Provider Update

Switch from JSON to DB queries (async)

### 4. Data Migration

- Migrate artist info
- Migrate biography
- Migrate 3 education entries
- Migrate 5 awards entries
- Migrate 9 residencies entries
- Handle image path

---

## Existing Patterns to Follow

### Admin Page Pattern

Use `/routes/(admin)/homepage/+page.svelte` as template:
- Section-based layout
- LanguageTabs for multilingual
- MediaPicker for images
- Form actions for CRUD

### Components Available

- `LanguageTabs.svelte` - Tab interface for 4 languages
- `MediaPicker.svelte` - Image selection
- `MultilingualInput.svelte` - Text input with tabs
- `MultilingualTextarea.svelte` - Textarea with tabs

---

## Dependencies

No new packages needed - all patterns exist.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Provider sync→async | Update consumers |
| Year as string (ranges) | Keep as TEXT in DB |
| Image path mismatch | Handle /images/ and /uploads/ |
| Homepage About confusion | Clear naming in UI |

---

## Artist Image Path

**Current:** `/images/about/ELT_5672.jpg`

**Status:** Directory may not exist, file needs verification

**Solution:** Use MediaPicker for upload, store in media table

---

*Research complete*
