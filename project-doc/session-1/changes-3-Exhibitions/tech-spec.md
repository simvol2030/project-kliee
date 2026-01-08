# Technical Specification: Exhibitions Module

**Date:** 2026-01-08
**Based on:** research.md, spec-final.md
**Status:** Ready for implementation

---

## Overview

Migrate exhibitions from JSON to SQLite, add missing schema fields (type, year, slug), create gallery support, build detail page, consolidate admin.

---

## Database Changes

### 1. Add columns to exhibitions table

**File:** `src/lib/server/db/schema.ts`

Add to existing `exhibitions` table definition:

```typescript
// Add these columns
type: text('type'),  // solo/group/fair/festival/gallery/art_fair
year: integer('year'),
slug: text('slug').unique(),
featured: integer('featured', { mode: 'boolean' }).default(false),

// Add multilingual venue (currently single language)
venue_en: text('venue_en'),
venue_ru: text('venue_ru'),
venue_es: text('venue_es'),
venue_zh: text('venue_zh'),
```

### 2. Create exhibitionImages table

```typescript
export const exhibitionImages = sqliteTable('exhibition_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  exhibition_id: integer('exhibition_id')
    .notNull()
    .references(() => exhibitions.id, { onDelete: 'cascade' }),
  media_id: integer('media_id')
    .notNull()
    .references(() => media.id),
  order_index: integer('order_index').default(0),
  caption_en: text('caption_en'),
  caption_ru: text('caption_ru'),
  caption_es: text('caption_es'),
  caption_zh: text('caption_zh'),
});
```

### 3. Run migration

```bash
npx drizzle-kit push
```

---

## Data Migration

### 1. Create migration script

**File:** `src/lib/scripts/migrate-exhibitions.ts`

```typescript
import exhibitionsData from '../../data/exhibitions.json';
import { db } from '$lib/server/db';
import { exhibitions } from '$lib/server/db/schema';

export async function migrateExhibitionsToDB() {
  // Migrate exhibitions
  for (const ex of exhibitionsData.exhibitions) {
    const slug = generateSlug(ex.title.en, ex.year);

    await db.insert(exhibitions).values({
      title_en: ex.title.en,
      title_ru: ex.title.ru,
      title_es: ex.title.es,
      title_zh: ex.title.zh,
      venue_en: ex.venue.en,
      venue_ru: ex.venue.ru,
      venue_es: ex.venue.es,
      venue_zh: ex.venue.zh,
      city: ex.location.en, // Or parse city from location
      type: ex.type,
      year: ex.year,
      slug: slug,
      is_current: ex.current,
      is_visible: true,
      // Handle image: need to import to media or use path
    });
  }

  // Migrate art fairs as type='art_fair'
  for (const af of exhibitionsData.artFairs) {
    const slug = generateSlug(af.title.en, af.year);

    await db.insert(exhibitions).values({
      title_en: af.title.en,
      title_ru: af.title.ru,
      title_es: af.title.es,
      title_zh: af.title.zh,
      venue_en: af.gallery?.en || '',
      venue_ru: af.gallery?.ru || '',
      venue_es: af.gallery?.es || '',
      venue_zh: af.gallery?.zh || '',
      city: af.location.en,
      type: 'art_fair',
      year: af.year,
      slug: slug,
      is_current: false,
      is_visible: true,
    });
  }
}

function generateSlug(title: string, year: number): string {
  return `${year}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}
```

---

## Backend Changes

### 1. Update Exhibitions Provider

**File:** `src/lib/data/exhibitions.provider.ts`

```typescript
import { db } from '$lib/server/db';
import { exhibitions, exhibitionImages, media } from '$lib/server/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

function mapExhibitionLocalized(row: typeof exhibitions.$inferSelect, locale: LanguageCode) {
  const titleKey = `title_${locale}` as keyof typeof row;
  const venueKey = `venue_${locale}` as keyof typeof row;
  const descKey = `description_${locale}` as keyof typeof row;

  return {
    id: row.id,
    slug: row.slug,
    title: row[titleKey] as string,
    venue: row[venueKey] as string,
    description: row[descKey] as string | null,
    city: row.city,
    year: row.year,
    type: row.type,
    isCurrent: row.is_current,
    coverImage: row.cover_image_id ? buildImageUrl(row.cover_image_id) : null,
  };
}

export async function getAllExhibitions(locale: LanguageCode) {
  const rows = await db
    .select()
    .from(exhibitions)
    .where(eq(exhibitions.is_visible, true))
    .orderBy(desc(exhibitions.year), exhibitions.order_index);

  return rows.map(row => mapExhibitionLocalized(row, locale));
}

export async function getCurrentExhibitions(locale: LanguageCode) {
  const rows = await db
    .select()
    .from(exhibitions)
    .where(
      and(
        eq(exhibitions.is_visible, true),
        eq(exhibitions.is_current, true)
      )
    )
    .orderBy(exhibitions.order_index);

  return rows.map(row => mapExhibitionLocalized(row, locale));
}

export async function getPastExhibitions(locale: LanguageCode) {
  const rows = await db
    .select()
    .from(exhibitions)
    .where(
      and(
        eq(exhibitions.is_visible, true),
        eq(exhibitions.is_current, false),
        // Exclude art_fairs
        sql`${exhibitions.type} != 'art_fair'`
      )
    )
    .orderBy(desc(exhibitions.year));

  return rows.map(row => mapExhibitionLocalized(row, locale));
}

export async function getArtFairs(locale: LanguageCode) {
  const rows = await db
    .select()
    .from(exhibitions)
    .where(
      and(
        eq(exhibitions.is_visible, true),
        eq(exhibitions.type, 'art_fair')
      )
    )
    .orderBy(desc(exhibitions.year));

  return rows.map(row => mapExhibitionLocalized(row, locale));
}

export async function getExhibitionBySlug(slug: string, locale: LanguageCode) {
  const [row] = await db
    .select()
    .from(exhibitions)
    .where(eq(exhibitions.slug, slug))
    .limit(1);

  if (!row) return null;
  return mapExhibitionLocalized(row, locale);
}

export async function getExhibitionImages(exhibitionId: number) {
  return db
    .select({
      id: exhibitionImages.id,
      media_id: exhibitionImages.media_id,
      order_index: exhibitionImages.order_index,
      caption_en: exhibitionImages.caption_en,
      caption_ru: exhibitionImages.caption_ru,
      caption_es: exhibitionImages.caption_es,
      caption_zh: exhibitionImages.caption_zh,
      stored_filename: media.stored_filename,
      folder: media.folder,
    })
    .from(exhibitionImages)
    .leftJoin(media, eq(exhibitionImages.media_id, media.id))
    .where(eq(exhibitionImages.exhibition_id, exhibitionId))
    .orderBy(exhibitionImages.order_index);
}
```

---

## Frontend Changes

### 1. Create Exhibition Detail Page

**File:** `src/routes/[lang=locale]/exhibitions/[slug]/+page.server.ts`

```typescript
import { error } from '@sveltejs/kit';
import { getExhibitionBySlug, getExhibitionImages } from '$lib/data/exhibitions.provider';

export const load = async ({ params, parent }) => {
  const { locale } = await parent();

  const exhibition = await getExhibitionBySlug(params.slug, locale);

  if (!exhibition) {
    throw error(404, 'Exhibition not found');
  }

  const images = await getExhibitionImages(exhibition.id);

  return {
    exhibition,
    images,
  };
};
```

**File:** `src/routes/[lang=locale]/exhibitions/[slug]/+page.svelte`

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  export let data: PageData;

  let currentImageIndex = $state(0);
</script>

<svelte:head>
  <title>{data.exhibition.title}</title>
</svelte:head>

<main class="exhibition-detail">
  <!-- Breadcrumb -->
  <nav class="breadcrumb">
    <a href="/{$page.params.lang}/exhibitions">Exhibitions</a>
    <span>/</span>
    <span>{data.exhibition.title}</span>
  </nav>

  <!-- Header -->
  <header>
    <h1>{data.exhibition.title}</h1>
    <p class="venue">{data.exhibition.venue}, {data.exhibition.city}</p>
    <p class="dates">{data.exhibition.year}</p>
  </header>

  <!-- Gallery -->
  {#if data.images.length > 0}
    <section class="gallery">
      <div class="main-image">
        <img
          src={buildImageUrl(data.images[currentImageIndex])}
          alt={data.exhibition.title}
        />
      </div>

      {#if data.images.length > 1}
        <div class="thumbnails">
          {#each data.images as image, index}
            <button
              class:active={index === currentImageIndex}
              onclick={() => currentImageIndex = index}
            >
              <img src={buildThumbnailUrl(image)} alt="" />
            </button>
          {/each}
        </div>
      {/if}
    </section>
  {/if}

  <!-- Description -->
  {#if data.exhibition.description}
    <section class="description">
      <p>{data.exhibition.description}</p>
    </section>
  {/if}

  <!-- Back link -->
  <a href="/{$page.params.lang}/exhibitions" class="back-link">
    ← Back to Exhibitions
  </a>
</main>
```

### 2. Update Exhibitions List Page

**File:** `src/routes/[lang=locale]/exhibitions/+page.ts`

```typescript
export const load: PageLoad = async ({ parent }) => {
  const { locale } = await parent();

  const [current, past, artFairs, seo] = await Promise.all([
    getCurrentExhibitions(locale),
    getPastExhibitions(locale),
    getArtFairs(locale),
    getSeoData(locale),
  ]);

  return { current, past, artFairs, seo };
};
```

### 3. Update Admin Exhibition Form

**File:** `src/routes/(admin)/exhibitions/[id]/+page.svelte`

Add missing fields:

```svelte
<!-- Type dropdown -->
<div class="form-group">
  <label for="type">Type</label>
  <select name="type" id="type" value={data.exhibition?.type || 'solo'}>
    <option value="solo">Solo Exhibition</option>
    <option value="group">Group Exhibition</option>
    <option value="fair">Fair</option>
    <option value="festival">Festival</option>
    <option value="gallery">Gallery</option>
    <option value="art_fair">Art Fair</option>
  </select>
</div>

<!-- Year -->
<div class="form-group">
  <label for="year">Year</label>
  <input type="number" name="year" id="year" value={data.exhibition?.year} />
</div>

<!-- Slug -->
<div class="form-group">
  <label for="slug">Slug</label>
  <input type="text" name="slug" id="slug" value={data.exhibition?.slug} />
</div>

<!-- Multilingual Venue -->
<MultilingualInput
  name="venue"
  label="Venue"
  values={{
    en: data.exhibition?.venue_en || '',
    ru: data.exhibition?.venue_ru || '',
    es: data.exhibition?.venue_es || '',
    zh: data.exhibition?.venue_zh || '',
  }}
/>

<!-- Gallery Images -->
<section class="gallery-section">
  <h3>Gallery Images</h3>
  <MultiImagePicker
    images={galleryImages}
    onUpdate={(images) => galleryImages = images}
    folder="exhibitions"
  />
</section>
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/routes/[lang=locale]/exhibitions/[slug]/+page.server.ts` | Detail page loader |
| `src/routes/[lang=locale]/exhibitions/[slug]/+page.svelte` | Detail page UI |
| `src/lib/scripts/migrate-exhibitions.ts` | Migration script |

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/server/db/schema.ts` | Add columns, create exhibitionImages |
| `src/lib/data/exhibitions.provider.ts` | Switch to DB queries |
| `src/routes/[lang=locale]/exhibitions/+page.ts` | Use async provider |
| `src/routes/(admin)/exhibitions/[id]/+page.svelte` | Add type, year, slug, gallery |
| `src/routes/(admin)/exhibitions/[id]/+page.server.ts` | Handle new fields |

---

## Migration Steps

1. Update schema.ts with new columns and table
2. Run `npx drizzle-kit push`
3. Run migration script
4. Verify 14 records in DB (9 exhibitions + 5 art fairs)
5. Update provider
6. Update frontend pages
7. Update admin forms
8. Test all functionality

---

## Testing Checklist

- [ ] Schema migration runs without errors
- [ ] All 9 exhibitions migrated
- [ ] All 5 art fairs migrated as type='art_fair'
- [ ] Exhibition list page shows all items
- [ ] Current exhibitions section works
- [ ] Past exhibitions timeline works
- [ ] Art Fairs section works
- [ ] Exhibition detail page loads
- [ ] Gallery navigation works
- [ ] Admin can edit type, year, slug
- [ ] Admin can add gallery images
- [ ] Images optimize to webp
- [ ] Duplicate detection works

---

*Tech-spec complete*
