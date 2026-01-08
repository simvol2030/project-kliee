# Technical Specification: About Module

**Date:** 2026-01-08
**Based on:** research.md, spec-final.md
**Status:** Ready for implementation

---

## Overview

Create database tables for About content, build admin panel with section management, migrate JSON data, update provider to use DB.

---

## Database Changes

### 1. Create about_artist table (singleton)

**File:** `src/lib/server/db/schema.ts`

```typescript
export const aboutArtist = sqliteTable('about_artist', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Artist info
  name: text('name').notNull(),
  image_id: integer('image_id').references(() => media.id),
  nationality: text('nationality'),
  based_in: text('based_in'),

  // Biography (4 languages)
  biography_en: text('biography_en'),
  biography_ru: text('biography_ru'),
  biography_es: text('biography_es'),
  biography_zh: text('biography_zh'),

  // SEO (4 languages)
  seo_title_en: text('seo_title_en'),
  seo_title_ru: text('seo_title_ru'),
  seo_title_es: text('seo_title_es'),
  seo_title_zh: text('seo_title_zh'),
  seo_description_en: text('seo_description_en'),
  seo_description_ru: text('seo_description_ru'),
  seo_description_es: text('seo_description_es'),
  seo_description_zh: text('seo_description_zh'),

  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
```

### 2. Create about_education table

```typescript
export const aboutEducation = sqliteTable('about_education', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: text('year').notNull(),  // TEXT for ranges like "2001-2005"

  // Degree (4 languages)
  degree_en: text('degree_en').notNull(),
  degree_ru: text('degree_ru').notNull(),
  degree_es: text('degree_es').notNull(),
  degree_zh: text('degree_zh').notNull(),

  // Institution (4 languages)
  institution_en: text('institution_en').notNull(),
  institution_ru: text('institution_ru').notNull(),
  institution_es: text('institution_es').notNull(),
  institution_zh: text('institution_zh').notNull(),

  order_index: integer('order_index').default(0),
});
```

### 3. Create about_awards table

```typescript
export const aboutAwards = sqliteTable('about_awards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: text('year').notNull(),

  // Title (4 languages)
  title_en: text('title_en').notNull(),
  title_ru: text('title_ru').notNull(),
  title_es: text('title_es').notNull(),
  title_zh: text('title_zh').notNull(),

  // Organization (4 languages)
  organization_en: text('organization_en').notNull(),
  organization_ru: text('organization_ru').notNull(),
  organization_es: text('organization_es').notNull(),
  organization_zh: text('organization_zh').notNull(),

  order_index: integer('order_index').default(0),
});
```

### 4. Create about_residencies table

```typescript
export const aboutResidencies = sqliteTable('about_residencies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: text('year').notNull(),

  // Location (4 languages)
  location_en: text('location_en').notNull(),
  location_ru: text('location_ru').notNull(),
  location_es: text('location_es').notNull(),
  location_zh: text('location_zh').notNull(),

  order_index: integer('order_index').default(0),
});
```

### 5. Run migration

```bash
npx drizzle-kit push
```

---

## Backend Changes

### 1. Update About Provider

**File:** `src/lib/data/about.provider.ts`

```typescript
import { db } from '$lib/server/db';
import { aboutArtist, aboutEducation, aboutAwards, aboutResidencies, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { LanguageCode } from '$lib/types/i18n.types';

export async function getArtistInfo() {
  const [artist] = await db
    .select()
    .from(aboutArtist)
    .limit(1);

  if (!artist) return null;

  let imageUrl = null;
  if (artist.image_id) {
    const [mediaRow] = await db
      .select()
      .from(media)
      .where(eq(media.id, artist.image_id));
    imageUrl = mediaRow ? buildImageUrl(mediaRow) : null;
  }

  return {
    name: artist.name,
    image: imageUrl,
    nationality: artist.nationality,
    basedIn: artist.based_in,
  };
}

export async function getBiography(locale: LanguageCode) {
  const [artist] = await db
    .select()
    .from(aboutArtist)
    .limit(1);

  if (!artist) return '';

  const key = `biography_${locale}` as keyof typeof artist;
  return artist[key] as string || '';
}

export async function getEducation(locale: LanguageCode) {
  const rows = await db
    .select()
    .from(aboutEducation)
    .orderBy(asc(aboutEducation.order_index));

  return rows.map(row => ({
    year: row.year,
    degree: row[`degree_${locale}` as keyof typeof row] as string,
    institution: row[`institution_${locale}` as keyof typeof row] as string,
  }));
}

export async function getAwards(locale: LanguageCode) {
  const rows = await db
    .select()
    .from(aboutAwards)
    .orderBy(asc(aboutAwards.order_index));

  return rows.map(row => ({
    year: row.year,
    title: row[`title_${locale}` as keyof typeof row] as string,
    organization: row[`organization_${locale}` as keyof typeof row] as string,
  }));
}

export async function getResidencies(locale: LanguageCode) {
  const rows = await db
    .select()
    .from(aboutResidencies)
    .orderBy(asc(aboutResidencies.order_index));

  return rows.map(row => ({
    year: row.year,
    location: row[`location_${locale}` as keyof typeof row] as string,
  }));
}

export async function getSeoData(locale: LanguageCode) {
  const [artist] = await db
    .select()
    .from(aboutArtist)
    .limit(1);

  if (!artist) return { title: '', description: '' };

  return {
    title: artist[`seo_title_${locale}` as keyof typeof artist] as string || '',
    description: artist[`seo_description_${locale}` as keyof typeof artist] as string || '',
  };
}

export async function getAboutData(locale: LanguageCode) {
  const [artist, biography, education, awards, residencies, seo] = await Promise.all([
    getArtistInfo(),
    getBiography(locale),
    getEducation(locale),
    getAwards(locale),
    getResidencies(locale),
    getSeoData(locale),
  ]);

  return {
    artist,
    biography,
    education,
    awards,
    residencies,
    seo,
  };
}

// CRUD operations for admin
export async function updateArtist(data: Partial<typeof aboutArtist.$inferInsert>) {
  const [existing] = await db.select().from(aboutArtist).limit(1);

  if (existing) {
    await db.update(aboutArtist).set(data).where(eq(aboutArtist.id, existing.id));
  } else {
    await db.insert(aboutArtist).values(data as typeof aboutArtist.$inferInsert);
  }
}

// Education CRUD
export async function addEducation(data: typeof aboutEducation.$inferInsert) {
  return db.insert(aboutEducation).values(data).returning();
}

export async function updateEducation(id: number, data: Partial<typeof aboutEducation.$inferInsert>) {
  await db.update(aboutEducation).set(data).where(eq(aboutEducation.id, id));
}

export async function deleteEducation(id: number) {
  await db.delete(aboutEducation).where(eq(aboutEducation.id, id));
}

// Similar CRUD for awards and residencies...
```

---

## Admin Pages

### 1. Create About Admin Page

**File:** `src/routes/(admin)/about/+page.svelte`

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import LanguageTabs from '$lib/components/admin/LanguageTabs.svelte';
  import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
  import DataTable from '$lib/components/admin/DataTable.svelte';
  import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let activeSection = $state('artist');
  let imageId = $state(data.artist?.image_id || null);

  // Education state
  let editingEducation = $state<number | null>(null);
  let showEducationForm = $state(false);

  // Similar for awards and residencies
</script>

<div class="admin-page about-admin">
  <h1>About Page Management</h1>

  {#if form?.success}
    <div class="alert alert-success">{form.message}</div>
  {/if}

  <!-- Section tabs -->
  <nav class="section-tabs">
    <button class:active={activeSection === 'artist'} onclick={() => activeSection = 'artist'}>
      Artist Info
    </button>
    <button class:active={activeSection === 'education'} onclick={() => activeSection = 'education'}>
      Education ({data.education.length})
    </button>
    <button class:active={activeSection === 'awards'} onclick={() => activeSection = 'awards'}>
      Awards ({data.awards.length})
    </button>
    <button class:active={activeSection === 'residencies'} onclick={() => activeSection = 'residencies'}>
      Residencies ({data.residencies.length})
    </button>
    <button class:active={activeSection === 'seo'} onclick={() => activeSection = 'seo'}>
      SEO
    </button>
  </nav>

  <!-- Artist Info Section -->
  {#if activeSection === 'artist'}
    <form method="POST" action="?/saveArtist" use:enhance>
      <div class="form-section">
        <h2>Artist Information</h2>

        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" name="name" id="name" value={data.artist?.name || ''} />
        </div>

        <div class="form-group">
          <label>Photo</label>
          <MediaPicker
            value={imageId}
            onSelect={(id) => imageId = id}
            folder="about"
          />
          <input type="hidden" name="image_id" value={imageId} />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="nationality">Nationality</label>
            <input type="text" name="nationality" value={data.artist?.nationality || ''} />
          </div>
          <div class="form-group">
            <label for="based_in">Based In</label>
            <input type="text" name="based_in" value={data.artist?.based_in || ''} />
          </div>
        </div>

        <h3>Biography</h3>
        <LanguageTabs name="biography" type="textarea" rows={10} values={{
          en: data.artist?.biography_en || '',
          ru: data.artist?.biography_ru || '',
          es: data.artist?.biography_es || '',
          zh: data.artist?.biography_zh || '',
        }} />

        <button type="submit" class="btn btn-primary">Save Artist Info</button>
      </div>
    </form>
  {/if}

  <!-- Education Section -->
  {#if activeSection === 'education'}
    <div class="form-section">
      <div class="section-header">
        <h2>Education</h2>
        <button class="btn btn-primary" onclick={() => showEducationForm = true}>
          + Add Education
        </button>
      </div>

      <DataTable
        items={data.education}
        columns={[
          { key: 'year', label: 'Year' },
          { key: 'degree_en', label: 'Degree' },
          { key: 'institution_en', label: 'Institution' },
        ]}
        onEdit={(item) => editingEducation = item.id}
        onDelete={(item) => deleteEducationItem(item.id)}
      />

      {#if showEducationForm || editingEducation}
        <!-- Education form modal -->
        <div class="modal">
          <form method="POST" action={editingEducation ? '?/updateEducation' : '?/addEducation'} use:enhance>
            {#if editingEducation}
              <input type="hidden" name="id" value={editingEducation} />
            {/if}

            <div class="form-group">
              <label>Year</label>
              <input type="text" name="year" required />
            </div>

            <LanguageTabs name="degree" label="Degree" values={{en:'',ru:'',es:'',zh:''}} />
            <LanguageTabs name="institution" label="Institution" values={{en:'',ru:'',es:'',zh:''}} />

            <div class="form-actions">
              <button type="button" onclick={() => { showEducationForm = false; editingEducation = null; }}>
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Awards Section (similar to Education) -->
  {#if activeSection === 'awards'}
    <!-- Similar structure -->
  {/if}

  <!-- Residencies Section (similar to Education) -->
  {#if activeSection === 'residencies'}
    <!-- Similar structure -->
  {/if}

  <!-- SEO Section -->
  {#if activeSection === 'seo'}
    <form method="POST" action="?/saveSeo" use:enhance>
      <div class="form-section">
        <h2>SEO Settings</h2>

        <LanguageTabs name="seo_title" label="Page Title" values={{
          en: data.artist?.seo_title_en || '',
          ru: data.artist?.seo_title_ru || '',
          es: data.artist?.seo_title_es || '',
          zh: data.artist?.seo_title_zh || '',
        }} />

        <LanguageTabs name="seo_description" label="Meta Description" type="textarea" values={{
          en: data.artist?.seo_description_en || '',
          ru: data.artist?.seo_description_ru || '',
          es: data.artist?.seo_description_es || '',
          zh: data.artist?.seo_description_zh || '',
        }} />

        <button type="submit" class="btn btn-primary">Save SEO</button>
      </div>
    </form>
  {/if}
</div>
```

**File:** `src/routes/(admin)/about/+page.server.ts`

```typescript
import { fail } from '@sveltejs/kit';
import {
  getArtistRaw,
  getAllEducation,
  getAllAwards,
  getAllResidencies,
  updateArtist,
  addEducation,
  updateEducation,
  deleteEducation,
  addAward,
  updateAward,
  deleteAward,
  addResidency,
  updateResidency,
  deleteResidency,
} from '$lib/data/about.provider';

export const load = async () => {
  const [artist, education, awards, residencies] = await Promise.all([
    getArtistRaw(),
    getAllEducation(),
    getAllAwards(),
    getAllResidencies(),
  ]);

  return { artist, education, awards, residencies };
};

export const actions = {
  saveArtist: async ({ request }) => {
    const formData = await request.formData();

    await updateArtist({
      name: formData.get('name') as string,
      image_id: formData.get('image_id') ? Number(formData.get('image_id')) : null,
      nationality: formData.get('nationality') as string,
      based_in: formData.get('based_in') as string,
      biography_en: formData.get('biography_en') as string,
      biography_ru: formData.get('biography_ru') as string,
      biography_es: formData.get('biography_es') as string,
      biography_zh: formData.get('biography_zh') as string,
    });

    return { success: true, message: 'Artist info saved' };
  },

  saveSeo: async ({ request }) => {
    const formData = await request.formData();

    await updateArtist({
      seo_title_en: formData.get('seo_title_en') as string,
      seo_title_ru: formData.get('seo_title_ru') as string,
      seo_title_es: formData.get('seo_title_es') as string,
      seo_title_zh: formData.get('seo_title_zh') as string,
      seo_description_en: formData.get('seo_description_en') as string,
      seo_description_ru: formData.get('seo_description_ru') as string,
      seo_description_es: formData.get('seo_description_es') as string,
      seo_description_zh: formData.get('seo_description_zh') as string,
    });

    return { success: true, message: 'SEO settings saved' };
  },

  addEducation: async ({ request }) => {
    const formData = await request.formData();

    await addEducation({
      year: formData.get('year') as string,
      degree_en: formData.get('degree_en') as string,
      degree_ru: formData.get('degree_ru') as string,
      degree_es: formData.get('degree_es') as string,
      degree_zh: formData.get('degree_zh') as string,
      institution_en: formData.get('institution_en') as string,
      institution_ru: formData.get('institution_ru') as string,
      institution_es: formData.get('institution_es') as string,
      institution_zh: formData.get('institution_zh') as string,
    });

    return { success: true, message: 'Education added' };
  },

  updateEducation: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get('id'));

    await updateEducation(id, {
      year: formData.get('year') as string,
      degree_en: formData.get('degree_en') as string,
      degree_ru: formData.get('degree_ru') as string,
      degree_es: formData.get('degree_es') as string,
      degree_zh: formData.get('degree_zh') as string,
      institution_en: formData.get('institution_en') as string,
      institution_ru: formData.get('institution_ru') as string,
      institution_es: formData.get('institution_es') as string,
      institution_zh: formData.get('institution_zh') as string,
    });

    return { success: true, message: 'Education updated' };
  },

  deleteEducation: async ({ request }) => {
    const formData = await request.formData();
    await deleteEducation(Number(formData.get('id')));
    return { success: true, message: 'Education deleted' };
  },

  // Similar actions for awards and residencies...
};
```

### 2. Add to Admin Navigation

**File:** `src/routes/(admin)/+layout@.svelte`

Add About link in Content section:

```svelte
<a href="/about" class="nav-link">
  <span class="icon">👤</span>
  About
</a>
```

---

## Public Page Updates

### 1. Update About Page Loader

**File:** `src/routes/[lang=locale]/about/+page.ts`

```typescript
import { getAboutData } from '$lib/data/about.provider';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { locale } = await parent();
  const about = await getAboutData(locale);  // Now async
  return { about };
};
```

---

## Data Migration

### 1. Create migration script

**File:** `src/lib/scripts/migrate-about.ts`

```typescript
import aboutData from '../../data/about.json';
import { db } from '$lib/server/db';
import { aboutArtist, aboutEducation, aboutAwards, aboutResidencies } from '$lib/server/db/schema';

export async function migrateAboutToDB() {
  // Migrate artist info
  await db.insert(aboutArtist).values({
    name: aboutData.artist.name,
    nationality: aboutData.artist.nationality,
    based_in: aboutData.artist.basedIn,
    biography_en: aboutData.biography.en,
    biography_ru: aboutData.biography.ru,
    biography_es: aboutData.biography.es,
    biography_zh: aboutData.biography.zh,
    seo_title_en: aboutData.seo.title.en,
    seo_title_ru: aboutData.seo.title.ru,
    seo_title_es: aboutData.seo.title.es,
    seo_title_zh: aboutData.seo.title.zh,
    seo_description_en: aboutData.seo.description.en,
    seo_description_ru: aboutData.seo.description.ru,
    seo_description_es: aboutData.seo.description.es,
    seo_description_zh: aboutData.seo.description.zh,
    // image_id will need to be set manually after uploading
  });

  // Migrate education (3 entries)
  for (let i = 0; i < aboutData.education.length; i++) {
    const edu = aboutData.education[i];
    await db.insert(aboutEducation).values({
      year: edu.year,
      degree_en: edu.degree.en,
      degree_ru: edu.degree.ru,
      degree_es: edu.degree.es,
      degree_zh: edu.degree.zh,
      institution_en: edu.institution.en,
      institution_ru: edu.institution.ru,
      institution_es: edu.institution.es,
      institution_zh: edu.institution.zh,
      order_index: i,
    });
  }

  // Migrate awards (5 entries)
  for (let i = 0; i < aboutData.awards.length; i++) {
    const award = aboutData.awards[i];
    await db.insert(aboutAwards).values({
      year: award.year,
      title_en: award.title.en,
      title_ru: award.title.ru,
      title_es: award.title.es,
      title_zh: award.title.zh,
      organization_en: award.organization.en,
      organization_ru: award.organization.ru,
      organization_es: award.organization.es,
      organization_zh: award.organization.zh,
      order_index: i,
    });
  }

  // Migrate residencies (9 entries)
  for (let i = 0; i < aboutData.residencies.length; i++) {
    const res = aboutData.residencies[i];
    await db.insert(aboutResidencies).values({
      year: res.year,
      location_en: res.location.en,
      location_ru: res.location.ru,
      location_es: res.location.es,
      location_zh: res.location.zh,
      order_index: i,
    });
  }

  console.log('About data migration complete');
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/routes/(admin)/about/+page.svelte` | Admin page UI |
| `src/routes/(admin)/about/+page.server.ts` | Admin actions |
| `src/lib/scripts/migrate-about.ts` | Migration script |

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/server/db/schema.ts` | Add 4 new tables |
| `src/lib/data/about.provider.ts` | Switch to DB queries |
| `src/routes/[lang=locale]/about/+page.ts` | Use async provider |
| `src/routes/(admin)/+layout@.svelte` | Add About to navigation |

---

## Testing Checklist

- [ ] All 4 tables created
- [ ] Migration runs: 1 artist + 3 education + 5 awards + 9 residencies
- [ ] Public page displays correctly from DB
- [ ] Admin: Can edit artist name → saves
- [ ] Admin: Can upload/change image
- [ ] Admin: Can edit biography (4 langs)
- [ ] Admin: Can add education entry
- [ ] Admin: Can edit education entry
- [ ] Admin: Can delete education entry
- [ ] Admin: Can reorder education
- [ ] Admin: Same CRUD for awards
- [ ] Admin: Same CRUD for residencies
- [ ] Admin: Can edit SEO (4 langs)
- [ ] Language switch works on public page
- [ ] Theme switch works

---

*Tech-spec complete*
