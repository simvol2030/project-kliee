# Technical Specification: Shop Module - Media Upload Fix

**Date:** 2026-01-08
**Based on:** research.md, spec-final.md
**Status:** Ready for implementation

---

## Overview

Fix shop product media management: add direct image upload to product edit page, support multiple images with sorting, add video support.

---

## Database Changes

### 1. Add `file_hash` to media table

**File:** `src/lib/server/db/schema.ts`

```typescript
// Add to media table definition
file_hash: text('file_hash'),  // MD5 or SHA256 for deduplication
```

**Migration:** Run `npx drizzle-kit push`

---

## Backend Changes

### 1. Extend Media Upload API

**File:** `src/routes/api/media/upload/+server.ts`

**Changes:**

```typescript
// Line ~10: Add video types
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm'
];

// Line ~11: Separate limits
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB

// Add hash calculation before save
import { createHash } from 'crypto';

function calculateFileHash(buffer: Buffer): string {
  return createHash('md5').update(buffer).digest('hex');
}

// In POST handler:
// 1. Calculate hash
// 2. Check if media with same hash exists
// 3. If exists, return existing media record
// 4. If not, save new file and create record
```

### 2. Add Shop Provider Functions

**File:** `src/lib/data/shop.provider.ts`

**Add functions:**

```typescript
// Get all images for product with media data
export async function getProductImagesWithMedia(productId: number) {
  return db
    .select({
      id: shopProductImages.id,
      media_id: shopProductImages.media_id,
      is_primary: shopProductImages.is_primary,
      order_index: shopProductImages.order_index,
      stored_filename: media.stored_filename,
      folder: media.folder,
      mime_type: media.mime_type,
    })
    .from(shopProductImages)
    .leftJoin(media, eq(shopProductImages.media_id, media.id))
    .where(eq(shopProductImages.product_id, productId))
    .orderBy(shopProductImages.order_index);
}

// Reorder images
export async function reorderProductImages(
  productId: number,
  imageOrders: { id: number; order_index: number }[]
) {
  for (const item of imageOrders) {
    await db
      .update(shopProductImages)
      .set({ order_index: item.order_index })
      .where(
        and(
          eq(shopProductImages.id, item.id),
          eq(shopProductImages.product_id, productId)
        )
      );
  }
}
```

---

## Frontend Changes

### 1. Add Direct Upload to Product Edit Page

**File:** `src/routes/(admin)/shop/products/[id]/+page.svelte`

**Add in Images section (~line 341-381):**

```svelte
<!-- Direct Upload Input -->
<div class="upload-zone">
  <input
    type="file"
    accept="image/*,video/mp4,video/webm"
    multiple
    on:change={handleFileUpload}
    class="hidden"
    bind:this={fileInput}
  />
  <button type="button" onclick={() => fileInput.click()}>
    + Upload Images
  </button>
</div>

<script>
  let fileInput: HTMLInputElement;
  let uploading = $state(false);
  let uploadProgress = $state(0);

  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    uploading = true;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        // Add to product images
        await addImageToProduct(result.id);
      }
      uploadProgress = ((i + 1) / files.length) * 100;
    }
    uploading = false;
    uploadProgress = 0;
    // Refresh images
    await loadProductImages();
  }
</script>
```

### 2. Add Drag-and-Drop Reordering

**File:** `src/routes/(admin)/shop/products/[id]/+page.svelte`

Use existing `SortableList` component pattern from artworks admin:

```svelte
<SortableList
  items={productImages}
  onReorder={handleReorder}
  itemKey="id"
>
  {#snippet item(image)}
    <div class="image-card">
      {#if isVideo(image.mime_type)}
        <video src={buildUrl(image)} />
      {:else}
        <img src={buildUrl(image)} alt="" />
      {/if}
      <div class="actions">
        <button onclick={() => setPrimary(image.id)}>
          {image.is_primary ? '★' : '☆'}
        </button>
        <button onclick={() => removeImage(image.id)}>×</button>
      </div>
    </div>
  {/snippet}
</SortableList>
```

### 3. Update ProductGallery for Video

**File:** `src/lib/components/shop/ProductGallery.svelte`

**Add video rendering:**

```svelte
{#if isVideo(currentMedia.mime_type)}
  <video
    src={currentMedia.url}
    controls
    autoplay
    muted
    loop
    class="gallery-video"
  />
{:else}
  <img src={currentMedia.url} alt={product.title} />
{/if}

<script>
  function isVideo(mimeType: string): boolean {
    return mimeType?.startsWith('video/');
  }
</script>
```

---

## Server Actions

### 1. Add reorderImages action

**File:** `src/routes/(admin)/shop/products/[id]/+page.server.ts`

```typescript
export const actions = {
  // ... existing actions ...

  reorderImages: async ({ request, params }) => {
    const formData = await request.formData();
    const orderData = JSON.parse(formData.get('order') as string);

    await reorderProductImages(Number(params.id), orderData);

    return { success: true };
  }
};
```

---

## API Endpoints

### 1. Update media upload response

**File:** `src/routes/api/media/upload/+server.ts`

Response should include:
```json
{
  "id": 123,
  "filename": "original.jpg",
  "stored_filename": "uuid.webp",
  "mime_type": "image/webp",
  "width": 1500,
  "height": 1000,
  "folder": "products",
  "is_duplicate": false,
  "url": "/uploads/products/uuid.webp"
}
```

If duplicate detected:
```json
{
  "id": 45,
  "filename": "original.jpg",
  "is_duplicate": true,
  "message": "Image already exists, using existing file",
  "url": "/uploads/products/existing.webp"
}
```

---

## Validation Requirements

### Image Upload
- Max size: 10MB
- Formats: JPEG, PNG, WebP, GIF
- Auto-optimize to WebP
- Max dimensions: 1500x1500px

### Video Upload
- Max size: 50MB
- Formats: MP4, WebM
- No server-side processing (use as-is)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/server/db/schema.ts` | Add `file_hash` to media |
| `src/routes/api/media/upload/+server.ts` | Add video support, hash checking |
| `src/lib/data/shop.provider.ts` | Add `getProductImagesWithMedia`, `reorderProductImages` |
| `src/routes/(admin)/shop/products/[id]/+page.svelte` | Add direct upload, reordering |
| `src/routes/(admin)/shop/products/[id]/+page.server.ts` | Add `reorderImages` action |
| `src/lib/components/shop/ProductGallery.svelte` | Add video rendering |

---

## Dependencies

No new packages required:
- `crypto` - Built-in Node.js
- `sharp` - Already installed for image processing
- `uuid` - Already installed for filenames

---

## Testing Checklist

- [ ] Upload single image → saves and links to product
- [ ] Upload multiple images → all save correctly
- [ ] Upload duplicate image → returns existing, shows message
- [ ] Upload video (mp4) → saves correctly
- [ ] Reorder images → order persists
- [ ] Set primary image → star updates
- [ ] Remove image → unlinks (doesn't delete if used elsewhere)
- [ ] Frontend gallery → shows all images with navigation
- [ ] Frontend gallery → plays video

---

*Tech-spec complete*
