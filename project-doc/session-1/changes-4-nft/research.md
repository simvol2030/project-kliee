# Research: NFT Module

**Date:** 2026-01-08
**Status:** Complete

---

## Executive Summary

The NFT module needs to be **built from scratch**. There's no database table, no admin panel, and the frontend reads from a minimal JSON file with placeholder images, no descriptions, and no video support. The spec requires mandatory video, image, and 4-language descriptions for each NFT.

---

## Current Architecture

```
Frontend: JSON file -> nft.provider.ts -> Public NFT page
Admin: DOES NOT EXIST
Database: NO nfts table
Status: Minimal frontend, everything else missing
```

---

## Database Schema Analysis

### NFT Table: **DOES NOT EXIST**

After reviewing `schema.ts` (775 lines):
- No `nfts` table
- No NFT-related tables

### Media Table (`schema.ts:53-68`)

Current media table supports:
- Images: jpeg, png, webp, gif
- No explicit video support
- `mime_type` field could be extended

**Missing for NFT:**
- `nfts` table
- Video file handling

---

## JSON Data Structure

### File: `data/nft.json`

```json
{
  "page": {
    "hero": { "title": {...}, "subtitle": {...} },
    "description": {...}
  },
  "openSeaCollection": {
    "url": "https://opensea.io/collection/kliee",
    "collectionName": "K-Liee Art",
    "blockchain": "Ethereum"
  },
  "featuredNfts": [
    {
      "id": "nft-001",
      "title": { "en": "Cats", "ru": "...", "es": "...", "zh": "..." },
      "technique": "Bronze",
      "year": 2003,
      "image": "/images/works/nft/Screenshot_2023-02-2-v2.png",
      "openSeaUrl": null  // ALL NULL
    }
    // 4 NFTs total
  ],
  "seo": { ... }
}
```

**Problems:**
- All NFTs use same placeholder image
- All `openSeaUrl` values are null
- **No description field** per NFT
- **No video field**
- Only 4 NFTs, spec mentions 5

---

## Spec Data Requirements

From `spec-final.md`, 5 NFTs need to be created:

| NFT | Video | OpenSea URL |
|-----|-------|-------------|
| Ophelia Hamlet Metamorphosis | _1_.mp4 | Provided |
| Woman with a pillow | _2_.mp4 | Provided |
| Squatting down | _3_.mp4 | Provided |
| Cherry | _4_.mp4 | Provided |
| Cats | _5_.mp4 | Provided |

**Video files location:** `project/nft/_1_.mp4` to `_5_.mp4`

**Status:** Video files NOT found in repository

---

## Key Files

| Purpose | Path | Status |
|---------|------|--------|
| NFT JSON | `data/nft.json` | EXISTS |
| NFT Provider | `src/lib/data/nft.provider.ts` | EXISTS (JSON) |
| NFT Types | `src/lib/types/content.types.ts:364-446` | EXISTS |
| NFT Public Page | `src/routes/[lang=locale]/nft/+page.svelte` | EXISTS |
| NFT Admin | - | MISSING |
| NFT Detail Page | - | MISSING |
| Video files | `project/nft/*.mp4` | MISSING |

---

## Provider Analysis

### Current Provider (`nft.provider.ts`)

```typescript
import nftDataRaw from '../../../../data/nft.json';

export function getNftData(locale) { ... }
export function getFeaturedNfts(locale) { ... }
export function getNftById(id, locale) { ... }
export function getOpenSeaCollection() { ... }
export function getSeoData(locale) { ... }
```

**All functions read from JSON**

---

## TypeScript Types

### Current NFT Type (`content.types.ts:364-398`)

```typescript
interface FeaturedNft {
  id: string;
  title: TranslatedString;
  technique: string;
  year: number;
  price: number | null;
  currency: string | null;
  image: string;
  openSeaUrl: string | null;
  // NO description
  // NO video
}
```

**Needs to be extended** with:
- `description: TranslatedString` (required)
- `video: string` (required)

---

## Frontend Status

### NFT List Page (`/[lang]/nft/`)

**Status:** Working with JSON data

**Features:**
- Hero section
- NFT grid
- OpenSea CTA button
- Light/dark theme
- Multi-language

**Missing:**
- Individual NFT detail page
- Video display
- Description display

---

## Admin Navigation

Current admin sidebar (`+layout@.svelte`):
- Content: Media, Artworks, Series, Exhibitions
- **NO NFT section**

---

## What Needs to Be Created

### 1. Database Table

```typescript
nfts = sqliteTable('nfts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),

  // Title (required, 4 langs)
  title_en: text('title_en').notNull(),
  title_ru: text('title_ru').notNull(),
  title_es: text('title_es').notNull(),
  title_zh: text('title_zh').notNull(),

  // Description (REQUIRED, 4 langs)
  description_en: text('description_en').notNull(),
  description_ru: text('description_ru').notNull(),
  description_es: text('description_es').notNull(),
  description_zh: text('description_zh').notNull(),

  // Media (REQUIRED)
  image_id: integer('image_id').notNull().references(() => media.id),
  video_id: integer('video_id').notNull().references(() => media.id),

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

### 2. Video Upload Support

Extend `/api/media/upload/+server.ts`:
```typescript
ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm'  // NEW
];
MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB
```

### 3. Admin Pages

- `/routes/(admin)/nft/+page.svelte` - List
- `/routes/(admin)/nft/[id]/+page.svelte` - Edit
- Add to admin navigation

### 4. Detail Page

- `/routes/[lang]/nft/[slug]/+page.svelte`
- Video player
- Description
- OpenSea link

### 5. Provider Update

Switch from JSON to DB queries

### 6. Data Migration

- Migrate 4 existing NFTs from JSON
- Add 5th NFT (Ophelia)
- Upload video files (when available)
- Translate descriptions to RU/ES/ZH

---

## Dependencies

No new packages needed:
- HTML5 video player is native
- Existing upload patterns work for video

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Video files missing | HIGH | Request from client |
| Descriptions missing | HIGH | Translate from spec |
| Large video upload | MEDIUM | Chunked upload, 50MB limit |
| OpenSea blockchain mismatch | LOW | Use Polygon as in spec |

---

## REQUIRED Fields (from spec)

**Per NFT must have:**
1. Image - NOT NULL
2. Video - NOT NULL
3. Description EN - NOT NULL
4. Description RU - NOT NULL
5. Description ES - NOT NULL
6. Description ZH - NOT NULL

**Admin must validate all fields before save**

---

*Research complete*
