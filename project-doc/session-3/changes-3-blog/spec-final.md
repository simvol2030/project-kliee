# Spec-final: Blog — Full Implementation

**Version:** final
**Status:** FOR DEVELOPER
**Score:** 25+ (Developer)

---

## Summary

Build a complete blog system: DB schema, admin CRUD with TipTap WYSIWYG editor, public list + article pages, 4-language support.

---

## Step 1: Database Schema

**File:** `src/lib/server/db/schema.ts`

New table `blogPosts`:

```
blog_posts:
  id             INTEGER PRIMARY KEY AUTOINCREMENT
  slug           TEXT NOT NULL UNIQUE
  author_id      INTEGER REFERENCES admins(id)

  -- Content (4 languages)
  title_en       TEXT NOT NULL DEFAULT ''
  title_ru       TEXT DEFAULT ''
  title_es       TEXT DEFAULT ''
  title_zh       TEXT DEFAULT ''

  excerpt_en     TEXT DEFAULT ''
  excerpt_ru     TEXT DEFAULT ''
  excerpt_es     TEXT DEFAULT ''
  excerpt_zh     TEXT DEFAULT ''

  content_en     TEXT DEFAULT ''    -- HTML from TipTap
  content_ru     TEXT DEFAULT ''
  content_es     TEXT DEFAULT ''
  content_zh     TEXT DEFAULT ''

  -- Media & metadata
  cover_image_id INTEGER REFERENCES media(id)
  tags           TEXT DEFAULT '[]'  -- JSON array stored as text

  -- Publishing
  is_published   INTEGER DEFAULT 0
  is_featured    INTEGER DEFAULT 0
  published_at   TEXT               -- ISO date string

  -- SEO
  seo_title_en       TEXT DEFAULT ''
  seo_title_ru       TEXT DEFAULT ''
  seo_title_es       TEXT DEFAULT ''
  seo_title_zh       TEXT DEFAULT ''
  seo_description_en TEXT DEFAULT ''
  seo_description_ru TEXT DEFAULT ''
  seo_description_es TEXT DEFAULT ''
  seo_description_zh TEXT DEFAULT ''

  -- Timestamps
  created_at     TEXT DEFAULT (datetime('now'))
  updated_at     TEXT DEFAULT (datetime('now'))
```

Run `npx drizzle-kit push` after schema change.

---

## Step 2: Admin — Blog List Page

**File:** `src/routes/(admin)/blog/+page.svelte` (NEW)
**File:** `src/routes/(admin)/blog/+page.server.ts` (NEW)

**Pattern:** Follow `/(admin)/exhibitions/+page.svelte`

Features:
- DataTable with columns: #, Title, Status (Published/Draft), Featured star, Date, Actions
- Search input (filters by title_en)
- Filter dropdown: All / Published / Draft
- Sort by date (newest first)
- "+ New Post" button → navigates to `/(admin)/blog/new`
- Row click → navigates to `/(admin)/blog/[id]`
- Delete with ConfirmDialog
- Toast notifications

Server load:
```typescript
// +page.server.ts
const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.created_at));
return { posts };
```

---

## Step 3: Admin — Blog Editor Page

**File:** `src/routes/(admin)/blog/[id]/+page.svelte` (NEW)
**File:** `src/routes/(admin)/blog/[id]/+page.server.ts` (NEW)

**Pattern:** Follow `/(admin)/exhibitions/` detail page pattern

**Layout (see ascii-blog.md for wireframe):**

Main area:
- LanguageTabs (EN/RU/ES/ZH)
- MultilingualInput for `title` (per language)
- MultilingualInput for `excerpt` (per language, textarea)
- TipTapEditor for `content` (per language — switch editor content on tab change)

Sidebar/meta fields:
- `slug` — text input, auto-generated from EN title (slugify), editable
- Cover Image — MediaPicker component
- `is_published` — checkbox
- `is_featured` — checkbox
- `published_at` — date input
- `tags` — text input (comma-separated, stored as JSON array)
- `author_id` — select dropdown (list from admins table)

SEO panel (collapsible):
- LanguageTabs
- `seo_title` per language
- `seo_description` per language

Actions:
- "Save" — POST/PATCH to API
- "Delete" — with confirmation

**API endpoints:**
- `POST /api/blog` — create new post
- `GET /api/blog/[id]` — get single post
- `PATCH /api/blog/[id]` — update post
- `DELETE /api/blog/[id]` — delete post

**Special: `id = 'new'`**
When `[id]` is "new", show empty form for creating a new post.

---

## Step 4: TipTap WYSIWYG Editor Component

**Install packages:**
```bash
npm install @tiptap/core @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
```

**File:** `src/lib/components/admin/TipTapEditor.svelte` (NEW)

Props:
```typescript
let { content = $bindable(''), placeholder = '' }: { content: string; placeholder?: string } = $props();
```

Toolbar buttons:
- **Bold** (Ctrl+B)
- **Italic** (Ctrl+I)
- **H2** heading
- **H3** heading
- **Bullet List**
- **Ordered List**
- **Blockquote**
- **Link** (prompt for URL)
- **Image** (integrate with MediaPicker or prompt for URL)

Output: HTML string stored in `content_{lang}` fields.

Key behavior:
- On `content` prop change (language tab switch): update editor content
- On editor change: emit new HTML back to parent via `$bindable`
- Style the editor area with min-height, border, proper typography

---

## Step 5: Public — Blog List Page

**File:** `src/routes/[lang=locale]/blog/+page.svelte` (NEW)
**File:** `src/routes/[lang=locale]/blog/+page.server.ts` (NEW)

Server load:
```typescript
const posts = await db.select()
  .from(blogPosts)
  .where(eq(blogPosts.is_published, 1))
  .orderBy(desc(blogPosts.published_at));
// Also join with media for cover images
```

Page layout (see ascii-blog.md):
- Hero: featured post (large card) if `is_featured` post exists
- Grid: remaining posts as cards (cover image, date, title, excerpt)
- Pagination or "Load More" button
- Localized: use `title_{lang}`, `excerpt_{lang}` based on current locale

SEO:
- Page title: "Blog | K-LIEE"
- Description: generic blog description per language
- og:type: "website"

---

## Step 6: Public — Blog Article Page

**File:** `src/routes/[lang=locale]/blog/[slug]/+page.svelte` (NEW)
**File:** `src/routes/[lang=locale]/blog/[slug]/+page.server.ts` (NEW)

Server load:
```typescript
const [post] = await db.select()
  .from(blogPosts)
  .where(and(eq(blogPosts.slug, params.slug), eq(blogPosts.is_published, 1)))
  .limit(1);
if (!post) throw error(404);
// Join with admins for author name, media for cover image
```

Page layout (see ascii-blog.md):
- Back link to `/[lang]/blog`
- Cover image (full width)
- Title (H1)
- Author name, date, reading time estimate
- Tags as chips/badges
- Article body: render `content_{lang}` HTML (use `{@html content}`)
- Related posts section (optional, latest 3 posts excluding current)

SEO:
- Use `seo_title_{lang}` (fallback to `title_{lang}`)
- Use `seo_description_{lang}` (fallback to `excerpt_{lang}`)
- og:type: "article"
- og:image: cover image URL
- article:published_time, article:author

**Security note:** Content is admin-authored HTML from TipTap — safe to render with `{@html}`. No user-generated content.

---

## Step 7: Navigation Integration

**File:** `src/routes/(admin)/+layout@.svelte`
- Add "Blog" link in Content section (after "Contact", before Layout section)
- Path: `/blog`
- Icon: same style as other links

**Public navigation:**
- Add "Blog" to menu items via admin Menu settings (or hardcode in nav if menu is static)
- Path: `/[lang]/blog`

---

## Step 8: Legacy Posts — DO NOT TOUCH

The existing `posts` table and `/(admin)/posts/` route are a separate legacy system.
- DO NOT modify the `posts` table
- DO NOT rename or redirect `/(admin)/posts/`
- The new blog is a completely separate `blog_posts` table + `/(admin)/blog/` routes

---

## Key Files Summary

### New Files
| File | Purpose |
|------|---------|
| `src/routes/(admin)/blog/+page.svelte` | Admin list |
| `src/routes/(admin)/blog/+page.server.ts` | Admin list loader |
| `src/routes/(admin)/blog/[id]/+page.svelte` | Admin editor |
| `src/routes/(admin)/blog/[id]/+page.server.ts` | Admin editor loader |
| `src/lib/components/admin/TipTapEditor.svelte` | WYSIWYG editor |
| `src/routes/[lang=locale]/blog/+page.svelte` | Public list |
| `src/routes/[lang=locale]/blog/+page.server.ts` | Public list loader |
| `src/routes/[lang=locale]/blog/[slug]/+page.svelte` | Public article |
| `src/routes/[lang=locale]/blog/[slug]/+page.server.ts` | Public article loader |
| `src/routes/api/blog/+server.ts` | Blog API (list + create) |
| `src/routes/api/blog/[id]/+server.ts` | Blog API (get + update + delete) |

### Modified Files
| File | Change |
|------|--------|
| `src/lib/server/db/schema.ts` | Add `blogPosts` table |
| `src/routes/(admin)/+layout@.svelte` | Add Blog link to sidebar |

### Reference Files (copy patterns from)
| File | Pattern |
|------|---------|
| `src/routes/(admin)/exhibitions/+page.svelte` | DataTable CRUD |
| `src/routes/[lang=locale]/exhibitions/+page.svelte` | Public page |
| `src/lib/components/admin/MultilingualInput.svelte` | Language inputs |
| `src/lib/components/admin/MediaPicker.svelte` | Image selection |
| `src/lib/components/admin/LanguageTabs.svelte` | Language tabs |

---

## Verification

- [ ] `npx drizzle-kit push` succeeds (schema migration)
- [ ] Admin: `/blog` shows empty list initially
- [ ] Admin: create new post with title, content in EN, cover image
- [ ] Admin: edit existing post — TipTap loads saved HTML
- [ ] Admin: switch language tabs — content switches per language
- [ ] Admin: publish post (is_published = true)
- [ ] Admin: set featured post
- [ ] Public: `/en/blog` shows published posts
- [ ] Public: `/en/blog/[slug]` shows full article with rendered HTML
- [ ] Public: featured post highlighted at top of list
- [ ] Public: localized content (try `/ru/blog`)
- [ ] Blog link in admin sidebar works
- [ ] Delete post works with confirmation
- [ ] SEO meta tags present on public pages
- [ ] Dark mode works for all admin pages
- [ ] Mobile responsive for all pages
- [ ] `npm run check` passes
- [ ] `npm run build` passes

---

*Created: 2026-02-19*
