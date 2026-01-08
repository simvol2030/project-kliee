# Technical Specification: Works/Series Module

**Date:** 2026-01-08
**Based on:** research.md, spec-final.md
**Status:** Ready for implementation

---

## Overview

Migrate series from JSON to SQLite, add dynamic artwork count, show all images in modals, improve series admin with MediaPicker.

---

## Database Changes

### 1. No schema changes needed

Series table already exists with all required fields in `schema.ts:305-331`.

### 2. Add `file_hash` to media table (shared with Shop)

```typescript
file_hash: text('file_hash'),
```

---

## Data Migration

### 1. Create migration script

**File:** `src/lib/scripts/migrate-series.ts`

```typescript
import seriesData from '../../data/series.json';
import { db } from '$lib/server/db';
import { series } from '$lib/server/db/schema';

export async function migrateSeriesToDB() {
  for (const s of seriesData.series) {
    // Check if already exists
    const existing = await db.select()
      .from(series)
      .where(eq(series.slug, s.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Series ${s.slug} already exists, skipping`);
      continue;
    }

    // Map JSON to DB schema
    await db.insert(series).values({
      id: s.id,
      slug: s.slug,
      name_en: s.title.en,
      name_ru: s.title.ru,
      name_es: s.title.es,
      name_zh: s.title.zh,
      description_en: s.description?.en || null,
      description_ru: s.description?.ru || null,
      description_es: s.description?.es || null,
      description_zh: s.description?.zh || null,
      order_index: s.order,
      is_visible: true,
      // cover_image_id will need manual setup or separate migration
    });
  }
}
```

**Run via:** API endpoint or CLI script

---

## Backend Changes

### 1. Update Series Provider

**File:** `src/lib/data/series.provider.ts`

**Convert from sync JSON to async DB:**

```typescript
import { db } from '$lib/server/db';
import { series, artworks } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import type { LanguageCode } from '$lib/types/i18n.types';

// Helper to map row to localized object
function mapSeriesLocalized(row: typeof series.$inferSelect, locale: LanguageCode) {
  const nameKey = `name_${locale}` as keyof typeof row;
  const descKey = `description_${locale}` as keyof typeof row;

  return {
    id: row.id,
    slug: row.slug,
    title: row[nameKey] as string,
    description: row[descKey] as string | null,
    coverImage: row.cover_image_id ? buildImageUrl(row.cover_image_id) : null,
    order: row.order_index,
  };
}

// Get all series with dynamic artwork count
export async function getAllSeries(locale: LanguageCode) {
  const rows = await db
    .select()
    .from(series)
    .where(eq(series.is_visible, true))
    .orderBy(series.order_index);

  const result = [];
  for (const row of rows) {
    // Get artwork count dynamically
    const countResult = await db
      .select({ count: count() })
      .from(artworks)
      .where(
        and(
          eq(artworks.series_id, row.id),
          eq(artworks.is_visible, true)
        )
      );

    const mapped = mapSeriesLocalized(row, locale);
    result.push({
      ...mapped,
      artworkCount: countResult[0]?.count || 0,
    });
  }
  return result;
}

export async function getSeriesBySlug(slug: string, locale: LanguageCode) {
  const [row] = await db
    .select()
    .from(series)
    .where(eq(series.slug, slug))
    .limit(1);

  if (!row) return null;

  return mapSeriesLocalized(row, locale);
}

export async function getSeriesById(id: string, locale: LanguageCode) {
  const [row] = await db
    .select()
    .from(series)
    .where(eq(series.id, id))
    .limit(1);

  if (!row) return null;

  return mapSeriesLocalized(row, locale);
}
```

### 2. Update Artworks Provider

**File:** `src/lib/data/artworks.provider.ts`

**Add function to get all images:**

```typescript
// Get artwork with ALL images (not just primary)
export async function getArtworkWithAllImages(id: string, locale: LanguageCode) {
  const artwork = await getArtworkById(id, locale);
  if (!artwork) return null;

  // Get all images ordered
  const images = await db
    .select({
      id: artworkImages.id,
      media_id: artworkImages.media_id,
      is_primary: artworkImages.is_primary,
      order_index: artworkImages.order_index,
      stored_filename: media.stored_filename,
      folder: media.folder,
    })
    .from(artworkImages)
    .leftJoin(media, eq(artworkImages.media_id, media.id))
    .where(eq(artworkImages.artwork_id, id))
    .orderBy(artworkImages.order_index);

  return {
    ...artwork,
    images: images.map(img => buildImageUrl(img.stored_filename, img.folder)),
  };
}
```

---

## Frontend Changes

### 1. Update Works Overview Page

**File:** `src/routes/[lang=locale]/works/+page.ts`

**Change to async:**

```typescript
import { getAllSeries } from '$lib/data/series.provider';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { locale } = await parent();
  const series = await getAllSeries(locale);  // Now async
  return { series };
};
```

### 2. Update Series Detail Page

**File:** `src/routes/[lang=locale]/works/[slug]/+page.server.ts`

```typescript
import { getSeriesBySlug } from '$lib/data/series.provider';
import { getArtworksBySeries } from '$lib/data/artworks.provider';

export const load = async ({ params, parent }) => {
  const { locale } = await parent();

  const [seriesData, artworks] = await Promise.all([
    getSeriesBySlug(params.slug, locale),
    getArtworksBySeries(params.slug, locale),
  ]);

  if (!seriesData) {
    throw error(404, 'Series not found');
  }

  return {
    series: seriesData,
    artworks,
  };
};
```

### 3. Update Modal for Multi-Image

**File:** `src/routes/[lang=locale]/works/[slug]/+page.svelte`

In the lightbox modal section (~lines 225-289), ensure navigation works with all images:

```svelte
<script>
  let currentImageIndex = $state(0);
  let selectedArtwork = $state<ArtworkWithImages | null>(null);

  async function openLightbox(artwork: ArtworkLocalized) {
    // Load full artwork with all images
    const full = await fetchArtworkWithImages(artwork.id);
    selectedArtwork = full;
    currentImageIndex = 0;
  }

  function nextImage() {
    if (selectedArtwork && currentImageIndex < selectedArtwork.images.length - 1) {
      currentImageIndex++;
    }
  }

  function prevImage() {
    if (currentImageIndex > 0) {
      currentImageIndex--;
    }
  }
</script>

{#if selectedArtwork}
  <div class="lightbox">
    <img src={selectedArtwork.images[currentImageIndex]} alt={selectedArtwork.title} />

    <!-- Navigation -->
    {#if selectedArtwork.images.length > 1}
      <button onclick={prevImage} disabled={currentImageIndex === 0}>←</button>
      <span>{currentImageIndex + 1} / {selectedArtwork.images.length}</span>
      <button onclick={nextImage} disabled={currentImageIndex === selectedArtwork.images.length - 1}>→</button>
    {/if}

    <!-- Artwork details -->
    <h3>{selectedArtwork.title}</h3>
    <p>{selectedArtwork.technique}</p>
    {#if selectedArtwork.description}
      <p>{selectedArtwork.description}</p>
    {/if}
  </div>
{/if}
```

### 4. Add MediaPicker to Series Admin

**File:** `src/routes/(admin)/series/[id]/+page.svelte`

Replace manual cover_image_id input with MediaPicker:

```svelte
<script>
  import MediaPicker from '$lib/components/admin/MediaPicker.svelte';

  let coverImageId = $state(data.series?.cover_image_id || null);
</script>

<!-- Replace input with MediaPicker -->
<div class="form-group">
  <label>Cover Image</label>
  <MediaPicker
    value={coverImageId}
    onSelect={(id) => coverImageId = id}
    folder="series"
  />
  <input type="hidden" name="cover_image_id" value={coverImageId} />
</div>
```

---

## API Endpoints

### 1. Add artwork images endpoint

**File:** `src/routes/api/artworks/[id]/images/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { getArtworkWithAllImages } from '$lib/data/artworks.provider';

export async function GET({ params, url }) {
  const locale = url.searchParams.get('locale') || 'en';
  const artwork = await getArtworkWithAllImages(params.id, locale);

  if (!artwork) {
    return json({ error: 'Not found' }, { status: 404 });
  }

  return json(artwork);
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/server/db/schema.ts` | Add `file_hash` to media (shared) |
| `src/lib/data/series.provider.ts` | Convert to async DB queries |
| `src/lib/data/artworks.provider.ts` | Add `getArtworkWithAllImages` |
| `src/routes/[lang=locale]/works/+page.ts` | Use async series |
| `src/routes/[lang=locale]/works/[slug]/+page.server.ts` | Use async series |
| `src/routes/[lang=locale]/works/[slug]/+page.svelte` | Multi-image modal |
| `src/routes/(admin)/series/[id]/+page.svelte` | Add MediaPicker |
| `src/routes/api/artworks/[id]/images/+server.ts` | Create new |
| `src/lib/scripts/migrate-series.ts` | Create migration script |

---

## Migration Steps

1. Run migration script to copy JSON data to DB
2. Verify 8 series exist in DB
3. Update provider to use DB
4. Test frontend works page
5. Test admin series page
6. Remove JSON import (optional, keep as backup)

---

## Testing Checklist

- [ ] Migration script runs without errors
- [ ] All 8 series appear on /ru/works
- [ ] Artwork counts are dynamic (match actual count)
- [ ] Series detail page loads artworks correctly
- [ ] Modal shows all images for artwork
- [ ] Image navigation (prev/next) works
- [ ] Description shows in modal
- [ ] Admin series list shows all series
- [ ] Admin can edit series with MediaPicker
- [ ] Cover image displays correctly

---

*Tech-spec complete*
