# ASCII Homepage Structure + Data Mapping

**Purpose:** Map every field on the public homepage to its data source (JSON vs DB)

---

## Public Homepage Layout

```
+============================================================+
|                        HEADER / NAV                         |
+============================================================+

+------------------------------------------------------------+
|                     SECTION 1: HERO                         |
|------------------------------------------------------------|
|                                                            |
|  [Slide 1 Image]  [Slide 2 Image]  [Slide 3 Image]  ...   |
|  ←  ●  ●  ●  →                                            |
|                                                            |
|         "{quote_en}"                                       |
|                                                            |
|         TITLE_EN                                           |
|         subtitle_en                                        |
|                                                            |
|   [ Announcement Text → link ]                             |
|                                                            |
+------------------------------------------------------------+
  DB: homepage_hero (title/subtitle/quote/announcement × 4 langs)
  DB: hero_slides (image_id → media, alt_text, duration, order)
  MISSING IN DB: announcement_link (hero has announcement_text but no link)

+------------------------------------------------------------+
|              SECTION 2: FEATURED COLLECTIONS                |
|------------------------------------------------------------|
|                                                            |
|   "Featured Collections"                                   |
|                                                            |
|   +----------+  +----------+  +----------+                 |
|   | cover_img|  | cover_img|  | cover_img|                 |
|   |          |  |          |  |          |                 |
|   | title_en |  | title_en |  | title_en |                 |
|   |description|  |description|  |description|              |
|   | [View →] |  | [View →] |  | [View →] |                |
|   +----------+  +----------+  +----------+                 |
|                                                            |
|   +----------+  +----------+  +----------+                 |
|   | cover_img|  | cover_img|  | cover_img|                 |
|   | title_en |  | title_en |  | title_en |                 |
|   |description|  |description|  |description|              |
|   | [View →] |  | [View →] |  | [View →] |                |
|   +----------+  +----------+  +----------+                 |
|                                                            |
+------------------------------------------------------------+
  JSON: sections.featuredCollections.items[]
    { id, title_{lang}, description_{lang}, image, link }
  DB: NO TABLE EXISTS — needs new table homepage_featured_collections
  LINKS TO: series table (series_id FK)

+------------------------------------------------------------+
|             SECTION 3: EXHIBITIONS PREVIEW                  |
|------------------------------------------------------------|
|                                                            |
|   "Exhibitions"                                            |
|   "Current and upcoming exhibitions"                       |
|                                                            |
|   +--------------------------------------------------+     |
|   |                                                  |     |
|   |  [Exhibition Cover Image - large]                |     |
|   |                                                  |     |
|   |  Exhibition Title                                |     |
|   |  Location  •  Date Range                         |     |
|   |  Description text...                             |     |
|   |                                                  |     |
|   |  [ Learn More → ]                                |     |
|   +--------------------------------------------------+     |
|                                                            |
+------------------------------------------------------------+
  JSON: sections.exhibitionsPreview { title, subtitle, exhibition: {...} }
  DB: exhibitions table exists — but no "featured" flag
  NEEDS: way to select which exhibition shows on homepage
  SECTION TITLE/SUBTITLE: store in homepage_sections or separate config

+------------------------------------------------------------+
|               SECTION 4: ABOUT PREVIEW                      |
|------------------------------------------------------------|
|                                                            |
|   +------------------+  +-----------------------------+    |
|   |                  |  |  "About the Artist"         |    |
|   |  [Artist Photo]  |  |                             |    |
|   |                  |  |  Paragraph 1 text...        |    |
|   |                  |  |  Paragraph 2 text...        |    |
|   |                  |  |                             |    |
|   |                  |  |  [ Read More → ]            |    |
|   +------------------+  +-----------------------------+    |
|                                                            |
+------------------------------------------------------------+
  DB: homepage_about
    title_en/ru/es/zh, text_en/ru/es/zh (split by \n\n for paragraphs)
    image_id (FK → media), cta_text_en/ru/es/zh, cta_link
  STATUS: FULLY IN DB, admin tab exists

+------------------------------------------------------------+
|                 SECTION 5: NEWS GRID                        |
|------------------------------------------------------------|
|                                                            |
|   "Latest News"                                            |
|                                                            |
|   +----------+  +----------+  +----------+                 |
|   | news_img |  | news_img |  | news_img |                 |
|   |          |  |          |  |          |                 |
|   | date     |  | date     |  | date     |                 |
|   | title_en |  | title_en |  | title_en |                 |
|   | excerpt  |  | excerpt  |  | excerpt  |                 |
|   | [Read →] |  | [Read →] |  | [Read →] |                |
|   +----------+  +----------+  +----------+                 |
|                                                            |
+------------------------------------------------------------+
  DB: homepage_news
    title_en/ru/es/zh, excerpt_en/ru/es/zh
    image_id (FK → media), link, date, order_index, is_visible
  STATUS: FULLY IN DB, admin tab exists

+------------------------------------------------------------+
|              SECTION 6: TESTIMONIALS                        |
|------------------------------------------------------------|
|                                                            |
|   "What People Say"                                        |
|                                                            |
|   +---------------------+  +---------------------+         |
|   | "Quote text..."     |  | "Quote text..."     |         |
|   |                     |  |                     |         |
|   | [avatar] Author     |  | [avatar] Author     |         |
|   |          Role       |  |          Role       |         |
|   +---------------------+  +---------------------+         |
|                                                            |
|   +---------------------+  +---------------------+         |
|   | "Quote text..."     |  | "Quote text..."     |         |
|   | [avatar] Author     |  | [avatar] Author     |         |
|   |          Role       |  |          Role       |         |
|   +---------------------+  +---------------------+         |
|                                                            |
+------------------------------------------------------------+
  DB: homepage_testimonials
    quote_en/ru/es/zh, author_name_en/ru/es/zh, author_role_en/ru/es/zh
    avatar_image_id (FK → media), order_index, is_visible
  STATUS: FULLY IN DB, admin tab exists

+------------------------------------------------------------+
|              SECTION 7: CREATIVE PROCESS                    |
|------------------------------------------------------------|
|                                                            |
|   "Creative Process"                                       |
|                                                            |
|   [1]──────────[2]──────────[3]──────────[4]               |
|   icon          icon         icon         icon              |
|   title_en      title_en     title_en     title_en          |
|   description   description  description  description       |
|                                                            |
+------------------------------------------------------------+
  DB: homepage_process
    step_number, icon (text), title_en/ru/es/zh, description_en/ru/es/zh
    order_index, is_visible
  JSON also has: image field (DB only has icon text!)
  MISSING IN DB: image_id (FK → media) — DB only stores icon name

+============================================================+
|                          FOOTER                             |
+============================================================+
```

---

## Data Source Summary

| Section | JSON | DB Table | Admin Tab | Gap |
|---------|------|----------|-----------|-----|
| Hero | Yes | `homepage_hero` + `hero_slides` | Yes | `announcement_link` missing in DB |
| Featured Collections | Yes | **NO TABLE** | **No** | Need new table + admin tab |
| Exhibitions Preview | Yes | `exhibitions` (general) | No (homepage) | No "featured" selection for homepage |
| About Preview | Yes | `homepage_about` | Yes | None |
| News Grid | Yes | `homepage_news` | Yes | None |
| Testimonials | Yes | `homepage_testimonials` | Yes | None |
| Process | Yes | `homepage_process` | Yes | `image_id` missing (only `icon` text) |
| Section Visibility | No | No | No | Need toggle per section |

---

## Current Data Flow (BROKEN)

```
static/data/homepage.json
        ↓ readFileSync()
homepage.provider.ts → getHomepageData()
        ↓
+page.server.ts → load()
        ↓
+page.svelte (renders all 7 sections)

Meanwhile:
Admin → API → DB tables (homepage_hero, homepage_about, etc.)
        ↓
DB has different data than JSON!
```

## Target Data Flow (FIXED)

```
DB tables (homepage_hero, homepage_about, homepage_news, etc.)
        ↓ Drizzle queries
homepage.provider.ts → getHomepageDataFromDb()  (async!)
        ↓
+page.server.ts → load()
        ↓
+page.svelte (renders all 7 sections)

JSON file: kept as seed/fallback only
```

---

*Created: 2026-02-19*
