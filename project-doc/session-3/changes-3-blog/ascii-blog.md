# ASCII Blog Wireframes

**Purpose:** Visual layout for 4 blog pages (2 public + 2 admin)

---

## Page 1: Public Blog List — `/[lang]/blog/`

```
+============================================================+
|                        HEADER / NAV                         |
+============================================================+

+------------------------------------------------------------+
|                                                            |
|   Blog                                                     |
|   Stories, insights, and updates from the studio            |
|                                                            |
+------------------------------------------------------------+

+------------------------------------------------------------+
|                      FEATURED POST                          |
|------------------------------------------------------------|
|                                                            |
|  +--------------------------------------------------+      |
|  |                                                  |      |
|  |           [Cover Image — large]                  |      |
|  |                                                  |      |
|  +--------------------------------------------------+      |
|  |  FEATURED                                        |      |
|  |  Post Title (Large)                              |      |
|  |  Feb 15, 2026  •  5 min read                     |      |
|  |  Excerpt text preview goes here up to 2-3        |      |
|  |  lines of text...                                |      |
|  |  [ Read More → ]                                 |      |
|  +--------------------------------------------------+      |
|                                                            |
+------------------------------------------------------------+

+------------------------------------------------------------+
|                       POST GRID                             |
|------------------------------------------------------------|
|                                                            |
|   +----------+  +----------+  +----------+                  |
|   | cover_img|  | cover_img|  | cover_img|                  |
|   |          |  |          |  |          |                  |
|   +----------+  +----------+  +----------+                  |
|   | Feb 10   |  | Feb 5    |  | Jan 28   |                  |
|   | Title    |  | Title    |  | Title    |                  |
|   | Excerpt  |  | Excerpt  |  | Excerpt  |                  |
|   | text...  |  | text...  |  | text...  |                  |
|   +----------+  +----------+  +----------+                  |
|                                                            |
|   +----------+  +----------+  +----------+                  |
|   | cover_img|  | cover_img|  | cover_img|                  |
|   | Date     |  | Date     |  | Date     |                  |
|   | Title    |  | Title    |  | Title    |                  |
|   | Excerpt  |  | Excerpt  |  | Excerpt  |                  |
|   +----------+  +----------+  +----------+                  |
|                                                            |
|               [ Load More Posts ]                           |
|                                                            |
+------------------------------------------------------------+

+============================================================+
|                          FOOTER                             |
+============================================================+
```

**Data per card:**
- `cover_image` → media table (cover_image_id FK)
- `published_at` → date display
- `title_{lang}` → localized title
- `excerpt_{lang}` → localized excerpt (plain text)
- `slug` → URL: `/[lang]/blog/[slug]`
- `is_featured` → boolean, featured post shown at top

---

## Page 2: Public Blog Article — `/[lang]/blog/[slug]`

```
+============================================================+
|                        HEADER / NAV                         |
+============================================================+

+------------------------------------------------------------+
|                                                            |
|   ← Back to Blog                                          |
|                                                            |
|   +--------------------------------------------------+     |
|   |                                                  |     |
|   |           [Cover Image — full width]             |     |
|   |                                                  |     |
|   +--------------------------------------------------+     |
|                                                            |
|   Post Title (H1)                                          |
|                                                            |
|   [avatar] Author Name  •  Feb 15, 2026  •  5 min read    |
|                                                            |
|   Tags: [ Art ] [ Studio ] [ Process ]                     |
|                                                            |
|   ─────────────────────────────────────────────────        |
|                                                            |
|   <article>                                                |
|     HTML content rendered from TipTap editor               |
|     with headings, paragraphs, images, links,              |
|     blockquotes, lists, etc.                               |
|                                                            |
|     Content supports rich formatting:                      |
|     - Bold, Italic                                         |
|     - H2, H3 headings                                      |
|     - Ordered/Unordered lists                              |
|     - Links                                                |
|     - Inline images                                        |
|     - Blockquotes                                          |
|   </article>                                               |
|                                                            |
|   ─────────────────────────────────────────────────        |
|                                                            |
|   Share: [Twitter] [Facebook] [Copy Link]                  |
|                                                            |
+------------------------------------------------------------+

+------------------------------------------------------------+
|                     RELATED POSTS                           |
|------------------------------------------------------------|
|   +----------+  +----------+  +----------+                  |
|   | cover    |  | cover    |  | cover    |                  |
|   | Date     |  | Date     |  | Date     |                  |
|   | Title    |  | Title    |  | Title    |                  |
|   +----------+  +----------+  +----------+                  |
+------------------------------------------------------------+

+============================================================+
|                          FOOTER                             |
+============================================================+
```

**Data for article:**
- `title_{lang}`, `content_{lang}` (HTML from TipTap)
- `cover_image_id` → media
- `author_id` → admins table (name)
- `published_at`, `tags` (JSON array)
- `seo_title_{lang}`, `seo_description_{lang}` → meta tags

---

## Page 3: Admin Blog List — `/(admin)/blog/`

```
+------------------+------------------------------------------+
|                  |                                          |
|   SIDEBAR        |   Blog Posts                             |
|                  |   Manage blog posts and articles         |
|   Content:       |                                          |
|     Media        |   [ + New Post ]                [ Search ]|
|     Artworks     |                                          |
|     Series       |   Filter: [All ▾] [Published ▾] [Date ▾]|
|     Exhibitions  |                                          |
|     NFT          |   +------------------------------------+ |
|     About        |   | # | Title     | Status | Date     | |
|     Contact      |   |----|-----------|--------|----------| |
|   > Blog  ←NEW   |   | 1 | Post One  | Draft  | Feb 15   | |
|                  |   | 2 | Post Two  | Pub    | Feb 10   | |
|   Layout:        |   | 3 | Post Three| Draft  | Feb 5    | |
|     Menu         |   | 4 | Post Four | Pub    | Jan 28   | |
|     Footer       |   | 5 | Post Five | Pub    | Jan 20   | |
|     Homepage     |   +------------------------------------+ |
|                  |                                          |
|   Shop:          |   Showing 1-5 of 12    [< 1 2 3 >]      |
|     Products     |                                          |
|     Orders       |                                          |
|     Settings     |                                          |
|                  |                                          |
+------------------+------------------------------------------+
```

**DataTable columns:**
- `#` — id
- `Title` — title_en (or current admin lang)
- `Status` — Published / Draft (from `is_published`)
- `Featured` — star icon (from `is_featured`)
- `Date` — `published_at` or `created_at`
- `Actions` — Edit, Delete buttons

**Row click** → navigate to `/(admin)/blog/[id]`

---

## Page 4: Admin Blog Editor — `/(admin)/blog/[id]`

```
+------------------+------------------------------------------+
|                  |                                          |
|   SIDEBAR        |   ← Back to Blog                        |
|                  |                                          |
|   (same as       |   Edit Post: "Post Title"                |
|    page 3)       |                                          |
|                  |   +------------------------------------+ |
|                  |   | [EN] [RU] [ES] [ZH]  ← LanguageTabs| |
|                  |   |                                    | |
|                  |   | Title *                             | |
|                  |   | [___________________________]       | |
|                  |   |                                    | |
|                  |   | Excerpt                             | |
|                  |   | [___________________________]       | |
|                  |   | [___________________________]       | |
|                  |   |                                    | |
|                  |   | Content *                           | |
|                  |   | +--------------------------------+ | |
|                  |   | | B I H2 H3 UL OL " 🔗 🖼️ |   | | |
|                  |   | |--------------------------------| | |
|                  |   | |                                | | |
|                  |   | |  TipTap WYSIWYG Editor         | | |
|                  |   | |  (rich text editing area)      | | |
|                  |   | |                                | | |
|                  |   | |  Supports:                     | | |
|                  |   | |  - Bold, Italic                | | |
|                  |   | |  - Headings (H2, H3)           | | |
|                  |   | |  - Lists (ordered, unordered)  | | |
|                  |   | |  - Links                       | | |
|                  |   | |  - Images (from MediaPicker)   | | |
|                  |   | |  - Blockquotes                 | | |
|                  |   | |                                | | |
|                  |   | +--------------------------------+ | |
|                  |   +------------------------------------+ |
|                  |                                          |
|                  |   +-- Sidebar Fields --+                  |
|                  |   |                    |                  |
|                  |   | Slug               |                  |
|                  |   | [post-title-here ] |                  |
|                  |   | (auto from EN title)|                 |
|                  |   |                    |                  |
|                  |   | Cover Image        |                  |
|                  |   | [MediaPicker]      |                  |
|                  |   | [image preview]    |                  |
|                  |   |                    |                  |
|                  |   | Published          |                  |
|                  |   | [x] Is Published   |                  |
|                  |   | [x] Is Featured    |                  |
|                  |   |                    |                  |
|                  |   | Date               |                  |
|                  |   | [2026-02-15]       |                  |
|                  |   |                    |                  |
|                  |   | Tags               |                  |
|                  |   | [art, studio, ...]  |                 |
|                  |   |                    |                  |
|                  |   | Author             |                  |
|                  |   | [Admin Name ▾]     |                  |
|                  |   +--------------------+                  |
|                  |                                          |
|                  |   +-- SEO Panel (collapsible) --+         |
|                  |   | [EN] [RU] [ES] [ZH]         |        |
|                  |   | SEO Title                    |        |
|                  |   | [___________________]        |        |
|                  |   | SEO Description               |       |
|                  |   | [___________________]        |        |
|                  |   +-------------------------------+       |
|                  |                                          |
|                  |   [ Save Draft ]  [ Publish ]  [ Delete ] |
|                  |                                          |
+------------------+------------------------------------------+
```

**Editor layout:**
- Main area: LanguageTabs + Title + Excerpt + TipTap Content (per language)
- Right sidebar (or below on mobile): Slug, Cover Image, Publish settings, Tags, Author, SEO
- TipTap toolbar: Bold, Italic, H2, H3, UL, OL, Blockquote, Link, Image

**Key components reused:**
- `LanguageTabs` — switch between en/ru/es/zh
- `MultilingualInput` — title, excerpt inputs per language
- `MediaPicker` — cover image selection
- `TipTapEditor` (NEW) — rich text editor per language

---

*Created: 2026-02-19*
