# Technical Specification: NFT Module

**Date:** 2026-01-08
**Based on:** research.md, spec-final.md
**Status:** Ready for implementation

---

## Overview

Create complete NFT management system from scratch: database table, admin panel with validation, detail page with video player, video upload support.

---

## Database Changes

### 1. Create nfts table

**File:** `src/lib/server/db/schema.ts`

```typescript
export const nfts = sqliteTable('nfts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),

  // Title (REQUIRED, 4 languages)
  title_en: text('title_en').notNull(),
  title_ru: text('title_ru').notNull(),
  title_es: text('title_es').notNull(),
  title_zh: text('title_zh').notNull(),

  // Description (REQUIRED, 4 languages)
  description_en: text('description_en').notNull(),
  description_ru: text('description_ru').notNull(),
  description_es: text('description_es').notNull(),
  description_zh: text('description_zh').notNull(),

  // Media (REQUIRED)
  image_id: integer('image_id')
    .notNull()
    .references(() => media.id),
  video_id: integer('video_id')
    .notNull()
    .references(() => media.id),

  // Additional info
  technique: text('technique'),
  year: integer('year'),
  price: real('price'),
  currency: text('currency').default('ETH'),
  opensea_url: text('opensea_url'),
  blockchain: text('blockchain').default('Polygon'),

  // Management
  is_featured: integer('is_featured', { mode: 'boolean' }).default(true),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
  order_index: integer('order_index').default(0),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
```

### 2. Run migration

```bash
npx drizzle-kit push
```

---

## Backend Changes

### 1. Create NFT Provider

**File:** `src/lib/data/nft.provider.ts`

Replace JSON import with DB queries:

```typescript
import { db } from '$lib/server/db';
import { nfts, media } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { LanguageCode } from '$lib/types/i18n.types';

function mapNftLocalized(row: typeof nfts.$inferSelect, locale: LanguageCode) {
  const titleKey = `title_${locale}` as keyof typeof row;
  const descKey = `description_${locale}` as keyof typeof row;

  return {
    id: row.id,
    slug: row.slug,
    title: row[titleKey] as string,
    description: row[descKey] as string,
    image: buildMediaUrl(row.image_id),
    video: buildMediaUrl(row.video_id),
    technique: row.technique,
    year: row.year,
    price: row.price,
    currency: row.currency,
    openSeaUrl: row.opensea_url,
    blockchain: row.blockchain,
  };
}

export async function getAllNfts(locale: LanguageCode) {
  const rows = await db
    .select()
    .from(nfts)
    .where(eq(nfts.is_visible, true))
    .orderBy(nfts.order_index);

  return rows.map(row => mapNftLocalized(row, locale));
}

export async function getFeaturedNfts(locale: LanguageCode) {
  const rows = await db
    .select()
    .from(nfts)
    .where(eq(nfts.is_featured, true))
    .orderBy(nfts.order_index);

  return rows.map(row => mapNftLocalized(row, locale));
}

export async function getNftBySlug(slug: string, locale: LanguageCode) {
  const [row] = await db
    .select()
    .from(nfts)
    .where(eq(nfts.slug, slug))
    .limit(1);

  if (!row) return null;
  return mapNftLocalized(row, locale);
}

export async function getNftById(id: number) {
  const [row] = await db
    .select()
    .from(nfts)
    .where(eq(nfts.id, id))
    .limit(1);

  return row || null;
}

// CRUD operations
export async function createNft(data: InsertNft) {
  const [result] = await db.insert(nfts).values(data).returning();
  return result;
}

export async function updateNft(id: number, data: Partial<InsertNft>) {
  await db.update(nfts).set(data).where(eq(nfts.id, id));
}

export async function deleteNft(id: number) {
  await db.delete(nfts).where(eq(nfts.id, id));
}

// Keep page content from JSON for now (hero, cta, seo)
import pageData from '../../../../data/nft.json';

export function getPageContent(locale: LanguageCode) {
  return {
    hero: {
      title: pageData.page.hero.title[locale],
      subtitle: pageData.page.hero.subtitle[locale],
    },
    description: pageData.page.description[locale],
  };
}

export function getOpenSeaCollection() {
  return pageData.openSeaCollection;
}

export function getSeoData(locale: LanguageCode) {
  return {
    title: pageData.seo.title[locale],
    description: pageData.seo.description[locale],
  };
}
```

### 2. Extend Media Upload for Video

**File:** `src/routes/api/media/upload/+server.ts`

Already covered in changes-1-shop-modul tech-spec.

---

## Admin Pages

### 1. Create NFT List Page

**File:** `src/routes/(admin)/nft/+page.svelte`

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import DataTable from '$lib/components/admin/DataTable.svelte';
  import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let deleteDialogOpen = $state(false);
  let selectedId = $state<number | null>(null);
</script>

<div class="page-header">
  <h1>NFT Management</h1>
  <a href="/nft/new" class="btn btn-primary">+ Add NFT</a>
</div>

<DataTable
  items={data.nfts}
  columns={[
    { key: 'title', label: 'Title' },
    { key: 'technique', label: 'Technique' },
    { key: 'year', label: 'Year' },
    { key: 'price', label: 'Price' },
  ]}
  onEdit={(item) => goto(`/nft/${item.id}`)}
  onDelete={(item) => {
    selectedId = item.id;
    deleteDialogOpen = true;
  }}
/>

<ConfirmDialog
  open={deleteDialogOpen}
  title="Delete NFT"
  message="Are you sure you want to delete this NFT?"
  onConfirm={async () => {
    await fetch(`/api/nft/${selectedId}`, { method: 'DELETE' });
    invalidateAll();
  }}
  onCancel={() => deleteDialogOpen = false}
/>
```

**File:** `src/routes/(admin)/nft/+page.server.ts`

```typescript
import { getAllNfts } from '$lib/data/nft.provider';

export const load = async () => {
  const nfts = await getAllNfts('en');
  return { nfts };
};
```

### 2. Create NFT Edit Page

**File:** `src/routes/(admin)/nft/[id]/+page.svelte`

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import MultilingualInput from '$lib/components/admin/MultilingualInput.svelte';
  import MultilingualTextarea from '$lib/components/admin/MultilingualTextarea.svelte';
  import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let imageId = $state(data.nft?.image_id || null);
  let videoId = $state(data.nft?.video_id || null);

  // Validation state
  let errors = $state<Record<string, string>>({});

  function validateForm() {
    errors = {};

    if (!imageId) errors.image = 'Image is required';
    if (!videoId) errors.video = 'Video is required';

    // Check descriptions
    const descFields = ['description_en', 'description_ru', 'description_es', 'description_zh'];
    for (const field of descFields) {
      const input = document.querySelector(`[name="${field}"]`) as HTMLTextAreaElement;
      if (!input?.value || input.value.length < 10) {
        errors[field] = `Description (${field.split('_')[1].toUpperCase()}) is required (min 10 chars)`;
      }
    }

    return Object.keys(errors).length === 0;
  }
</script>

<form method="POST" action="?/save" use:enhance={() => {
  if (!validateForm()) {
    return ({ cancel }) => cancel();
  }
}}>
  <h1>{data.nft ? 'Edit NFT' : 'Create NFT'}</h1>

  {#if form?.error}
    <div class="alert alert-error">{form.error}</div>
  {/if}

  <!-- Slug -->
  <div class="form-group">
    <label for="slug">Slug *</label>
    <input type="text" name="slug" id="slug" value={data.nft?.slug || ''} required />
  </div>

  <!-- Title (4 languages) -->
  <MultilingualInput
    name="title"
    label="Title"
    required
    values={{
      en: data.nft?.title_en || '',
      ru: data.nft?.title_ru || '',
      es: data.nft?.title_es || '',
      zh: data.nft?.title_zh || '',
    }}
  />

  <!-- Description (4 languages) - REQUIRED -->
  <MultilingualTextarea
    name="description"
    label="Description"
    required
    minLength={10}
    values={{
      en: data.nft?.description_en || '',
      ru: data.nft?.description_ru || '',
      es: data.nft?.description_es || '',
      zh: data.nft?.description_zh || '',
    }}
  />
  {#each ['description_en', 'description_ru', 'description_es', 'description_zh'] as field}
    {#if errors[field]}
      <p class="error">{errors[field]}</p>
    {/if}
  {/each}

  <!-- Image - REQUIRED -->
  <div class="form-group">
    <label>Image * {#if errors.image}<span class="error">{errors.image}</span>{/if}</label>
    <MediaPicker
      value={imageId}
      onSelect={(id) => imageId = id}
      folder="nft/images"
      accept="image/*"
    />
    <input type="hidden" name="image_id" value={imageId} />
  </div>

  <!-- Video - REQUIRED -->
  <div class="form-group">
    <label>Video * {#if errors.video}<span class="error">{errors.video}</span>{/if}</label>
    <MediaPicker
      value={videoId}
      onSelect={(id) => videoId = id}
      folder="nft/videos"
      accept="video/mp4,video/webm"
    />
    <input type="hidden" name="video_id" value={videoId} />
  </div>

  <!-- Additional fields -->
  <div class="form-row">
    <div class="form-group">
      <label for="technique">Technique</label>
      <input type="text" name="technique" value={data.nft?.technique || ''} />
    </div>
    <div class="form-group">
      <label for="year">Year</label>
      <input type="number" name="year" value={data.nft?.year || ''} />
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="price">Price</label>
      <input type="number" step="0.001" name="price" value={data.nft?.price || ''} />
    </div>
    <div class="form-group">
      <label for="currency">Currency</label>
      <input type="text" name="currency" value={data.nft?.currency || 'ETH'} />
    </div>
  </div>

  <div class="form-group">
    <label for="opensea_url">OpenSea URL</label>
    <input type="url" name="opensea_url" value={data.nft?.opensea_url || ''} />
  </div>

  <div class="form-group">
    <label for="blockchain">Blockchain</label>
    <input type="text" name="blockchain" value={data.nft?.blockchain || 'Polygon'} />
  </div>

  <div class="form-actions">
    <a href="/nft" class="btn btn-secondary">Cancel</a>
    <button type="submit" class="btn btn-primary">Save</button>
  </div>
</form>
```

**File:** `src/routes/(admin)/nft/[id]/+page.server.ts`

```typescript
import { fail, redirect } from '@sveltejs/kit';
import { getNftById, createNft, updateNft } from '$lib/data/nft.provider';

export const load = async ({ params }) => {
  if (params.id === 'new') {
    return { nft: null };
  }

  const nft = await getNftById(Number(params.id));
  if (!nft) throw error(404, 'NFT not found');

  return { nft };
};

export const actions = {
  save: async ({ request, params }) => {
    const formData = await request.formData();

    // Validation
    const imageId = formData.get('image_id');
    const videoId = formData.get('video_id');
    const descriptionEn = formData.get('description_en') as string;
    const descriptionRu = formData.get('description_ru') as string;
    const descriptionEs = formData.get('description_es') as string;
    const descriptionZh = formData.get('description_zh') as string;

    if (!imageId) {
      return fail(400, { error: 'Image is required' });
    }
    if (!videoId) {
      return fail(400, { error: 'Video is required' });
    }
    if (!descriptionEn || descriptionEn.length < 10) {
      return fail(400, { error: 'Description (EN) is required (min 10 chars)' });
    }
    if (!descriptionRu || descriptionRu.length < 10) {
      return fail(400, { error: 'Description (RU) is required (min 10 chars)' });
    }
    if (!descriptionEs || descriptionEs.length < 10) {
      return fail(400, { error: 'Description (ES) is required (min 10 chars)' });
    }
    if (!descriptionZh || descriptionZh.length < 10) {
      return fail(400, { error: 'Description (ZH) is required (min 10 chars)' });
    }

    const data = {
      slug: formData.get('slug') as string,
      title_en: formData.get('title_en') as string,
      title_ru: formData.get('title_ru') as string,
      title_es: formData.get('title_es') as string,
      title_zh: formData.get('title_zh') as string,
      description_en: descriptionEn,
      description_ru: descriptionRu,
      description_es: descriptionEs,
      description_zh: descriptionZh,
      image_id: Number(imageId),
      video_id: Number(videoId),
      technique: formData.get('technique') as string || null,
      year: formData.get('year') ? Number(formData.get('year')) : null,
      price: formData.get('price') ? Number(formData.get('price')) : null,
      currency: formData.get('currency') as string || 'ETH',
      opensea_url: formData.get('opensea_url') as string || null,
      blockchain: formData.get('blockchain') as string || 'Polygon',
    };

    if (params.id === 'new') {
      await createNft(data);
    } else {
      await updateNft(Number(params.id), data);
    }

    throw redirect(303, '/nft');
  },
};
```

### 3. Add to Admin Navigation

**File:** `src/routes/(admin)/+layout@.svelte`

Add NFT link in Content section (~line 80):

```svelte
<a href="/nft" class="nav-link">
  <span class="icon">🎨</span>
  NFT
</a>
```

---

## Public Pages

### 1. Update NFT List Page

**File:** `src/routes/[lang=locale]/nft/+page.ts`

```typescript
export const load: PageLoad = async ({ parent }) => {
  const { locale } = await parent();

  const [nfts, pageContent, collection, seo] = await Promise.all([
    getFeaturedNfts(locale),
    getPageContent(locale),
    getOpenSeaCollection(),
    getSeoData(locale),
  ]);

  return { nfts, pageContent, collection, seo };
};
```

### 2. Create NFT Detail Page

**File:** `src/routes/[lang=locale]/nft/[slug]/+page.server.ts`

```typescript
import { error } from '@sveltejs/kit';
import { getNftBySlug } from '$lib/data/nft.provider';

export const load = async ({ params, parent }) => {
  const { locale } = await parent();

  const nft = await getNftBySlug(params.slug, locale);

  if (!nft) {
    throw error(404, 'NFT not found');
  }

  return { nft };
};
```

**File:** `src/routes/[lang=locale]/nft/[slug]/+page.svelte`

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>{data.nft.title}</title>
</svelte:head>

<main class="nft-detail">
  <nav class="breadcrumb">
    <a href="/{$page.params.lang}/nft">NFT Collection</a>
    <span>/</span>
    <span>{data.nft.title}</span>
  </nav>

  <div class="nft-content">
    <!-- Video (primary) -->
    <div class="nft-video">
      <video
        src={data.nft.video}
        controls
        autoplay
        muted
        loop
        poster={data.nft.image}
      />
    </div>

    <!-- Info -->
    <div class="nft-info">
      <h1>{data.nft.title}</h1>

      <div class="description">
        <p>{data.nft.description}</p>
      </div>

      <dl class="details">
        {#if data.nft.technique}
          <dt>Technique</dt>
          <dd>{data.nft.technique}</dd>
        {/if}
        {#if data.nft.year}
          <dt>Year</dt>
          <dd>{data.nft.year}</dd>
        {/if}
        {#if data.nft.price}
          <dt>Price</dt>
          <dd>{data.nft.price} {data.nft.currency}</dd>
        {/if}
        <dt>Blockchain</dt>
        <dd>{data.nft.blockchain}</dd>
      </dl>

      {#if data.nft.openSeaUrl}
        <a href={data.nft.openSeaUrl} target="_blank" rel="noopener" class="btn btn-primary">
          Buy on OpenSea
        </a>
      {/if}
    </div>
  </div>

  <a href="/{$page.params.lang}/nft" class="back-link">
    ← Back to Collection
  </a>
</main>
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/routes/(admin)/nft/+page.svelte` | Admin list |
| `src/routes/(admin)/nft/+page.server.ts` | Admin list loader |
| `src/routes/(admin)/nft/[id]/+page.svelte` | Admin edit form |
| `src/routes/(admin)/nft/[id]/+page.server.ts` | Admin edit actions |
| `src/routes/[lang=locale]/nft/[slug]/+page.svelte` | Public detail |
| `src/routes/[lang=locale]/nft/[slug]/+page.server.ts` | Public detail loader |
| `src/lib/scripts/migrate-nfts.ts` | Migration script |

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/server/db/schema.ts` | Add nfts table |
| `src/lib/data/nft.provider.ts` | Switch to DB, keep page content from JSON |
| `src/routes/[lang=locale]/nft/+page.ts` | Use async provider |
| `src/routes/(admin)/+layout@.svelte` | Add NFT to navigation |

---

## Data Migration

**From spec-final.md:**

5 NFTs with OpenSea URLs and video files:

1. Ophelia Hamlet Metamorphosis - _1_.mp4
2. Woman with a pillow - _2_.mp4
3. Squatting down - _3_.mp4
4. Cherry - _4_.mp4
5. Cats - _5_.mp4

**Note:** Video files must be provided/uploaded manually. Descriptions need translation to RU/ES/ZH.

---

## Testing Checklist

- [ ] nfts table created
- [ ] Admin: List page shows NFTs
- [ ] Admin: Cannot save without image → error
- [ ] Admin: Cannot save without video → error
- [ ] Admin: Cannot save without description (any lang) → error
- [ ] Admin: Save with all fields → success
- [ ] Admin: Edit existing NFT → works
- [ ] Admin: Delete NFT → works
- [ ] Public: NFT list page shows items
- [ ] Public: Click NFT → opens detail page
- [ ] Public: Video plays
- [ ] Public: Description shows (localized)
- [ ] Public: OpenSea link works
- [ ] Language switch → description changes

---

*Tech-spec complete*
