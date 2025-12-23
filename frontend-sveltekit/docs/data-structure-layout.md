# Data Structure Design - Layout Components

**Date:** 2025-11-08
**Scope:** Menu + Footer data structures
**Phase:** Layout Migration (Step 2.5)
**Principle:** All 4 languages in ONE JSON file, SQLite-ready structure

---

## 🎯 Design Principles

### 1. Multilingual in Single File
```json
{
  "label": {
    "en": "Home",
    "ru": "Главная",
    "es": "Inicio",
    "zh": "首页"
  }
}
```

**Why?**
- ✅ Single source of truth
- ✅ Easy to add new languages
- ✅ No duplication
- ✅ SQLite migration path clear

---

### 2. Incremental Design

**What we're designing NOW:**
- ✅ Menu structure (header navigation)
- ✅ Footer structure (brand, social, contact)

**What we're NOT designing yet:**
- ❌ Homepage content (Sprint 2)
- ❌ Artworks data (Sprint 3)
- ❌ Exhibitions data (Sprint 5)
- ❌ etc.

**Rationale:** Design data structures as needed, not entire project upfront.

---

### 3. SQLite Migration Readiness

**JSON structure mirrors database tables:**
```
menu.json → menu_items table (eventually)
footer.json → footer_config table (eventually)
```

**Fields designed with DB in mind:**
- `id` - Primary key ready
- `parentId` - Foreign key for nested items
- `order` - Sorting without arrays
- Normalized structure

---

## 📊 Common Types (Reusable)

### Type 1: TranslatedString

```typescript
type TranslatedString = {
  en: string;
  ru: string;
  es: string;
  zh: string;
};
```

**Usage:** Any text that needs translation (menu labels, titles, descriptions).

---

### Type 2: Link

```typescript
type Link = {
  href: string;              // URL path
  external?: boolean;        // Is external link?
  target?: '_blank' | '_self';
};
```

**Usage:** Navigation links, social links, email links.

---

### Type 3: SocialLink

```typescript
type SocialLink = {
  id: string;                // Unique ID (e.g., "instagram-en")
  platform: string;          // Platform name ("Instagram", "Telegram", etc.)
  label: string;             // Short label ("IG", "TG", etc.)
  url: string;               // Full URL
  icon?: string;             // Icon name/class (optional)
  order: number;             // Display order
};
```

**Usage:** Footer social links.

---

## 📄 Menu Data Structure

### File: `data/menu.json`

```json
{
  "version": "1.0",
  "lastUpdated": "2025-11-08",
  "items": [
    {
      "id": "home",
      "label": {
        "en": "Home",
        "ru": "Главная",
        "es": "Inicio",
        "zh": "首页"
      },
      "href": "/",
      "parentId": null,
      "hasDropdown": false,
      "order": 1
    },
    {
      "id": "about",
      "label": {
        "en": "About",
        "ru": "О художнике",
        "es": "Acerca de",
        "zh": "关于"
      },
      "href": "/about",
      "parentId": null,
      "hasDropdown": false,
      "order": 2
    },
    {
      "id": "works",
      "label": {
        "en": "Works",
        "ru": "Работы",
        "es": "Obras",
        "zh": "作品"
      },
      "href": "/works",
      "parentId": null,
      "hasDropdown": true,
      "order": 3
    },
    {
      "id": "works-chebu-rasha",
      "label": {
        "en": "CHEBU-RASHA",
        "ru": "ЧЕБУ-РАША",
        "es": "CHEBU-RASHA",
        "zh": "切布拉什卡"
      },
      "href": "/works/chebu-rasha",
      "parentId": "works",
      "hasDropdown": false,
      "order": 1
    },
    {
      "id": "works-last-supper",
      "label": {
        "en": "THE LAST SUPPER",
        "ru": "ТАЙНАЯ ВЕЧЕРЯ",
        "es": "LA ÚLTIMA CENA",
        "zh": "最后的晚餐"
      },
      "href": "/works/last-supper",
      "parentId": "works",
      "hasDropdown": false,
      "order": 2
    },
    {
      "id": "works-sbsa",
      "label": {
        "en": "SBSA",
        "ru": "ЧУЖОЙ БУДУАР, ЧУЖАЯ БОЙНЯ",
        "es": "SBSA",
        "zh": "某人的闺房，某人的屠宰场"
      },
      "href": "/works/sbsa",
      "parentId": "works",
      "hasDropdown": false,
      "order": 3
    },
    {
      "id": "works-the-bull",
      "label": {
        "en": "THE BULL",
        "ru": "БЫК",
        "es": "EL TORO",
        "zh": "公牛"
      },
      "href": "/works/the-bull",
      "parentId": "works",
      "hasDropdown": false,
      "order": 4
    },
    {
      "id": "works-hotel-series",
      "label": {
        "en": "Hotel Series",
        "ru": "Серия Отель",
        "es": "Serie Hotel",
        "zh": "酒店系列"
      },
      "href": "/works/hotel-series",
      "parentId": "works",
      "hasDropdown": false,
      "order": 5
    },
    {
      "id": "works-sculptures",
      "label": {
        "en": "Sculptures",
        "ru": "Скульптуры",
        "es": "Esculturas",
        "zh": "雕塑"
      },
      "href": "/works/sculptures",
      "parentId": "works",
      "hasDropdown": false,
      "order": 6
    },
    {
      "id": "works-porcelain",
      "label": {
        "en": "Porcelain",
        "ru": "Фарфор",
        "es": "Porcelana",
        "zh": "瓷器"
      },
      "href": "/works/porcelain",
      "parentId": "works",
      "hasDropdown": false,
      "order": 7
    },
    {
      "id": "exhibitions",
      "label": {
        "en": "Exhibitions",
        "ru": "Выставки",
        "es": "Exposiciones",
        "zh": "展览"
      },
      "href": "/exhibitions",
      "parentId": null,
      "hasDropdown": false,
      "order": 4
    },
    {
      "id": "nft",
      "label": {
        "en": "NFT",
        "ru": "NFT",
        "es": "NFT",
        "zh": "NFT"
      },
      "href": "/nft",
      "parentId": null,
      "hasDropdown": false,
      "order": 5
    },
    {
      "id": "contact",
      "label": {
        "en": "Contact",
        "ru": "Контакты",
        "es": "Contacto",
        "zh": "联系"
      },
      "href": "/contact",
      "parentId": null,
      "hasDropdown": false,
      "order": 6
    }
  ]
}
```

### TypeScript Interface: MenuItem

```typescript
interface TranslatedString {
  en: string;
  ru: string;
  es: string;
  zh: string;
}

interface MenuItem {
  id: string;                      // Unique identifier
  label: TranslatedString;         // Multilingual label
  href: string;                    // URL path
  parentId: string | null;         // Parent menu item ID (null for top-level)
  hasDropdown: boolean;            // Has submenu?
  order: number;                   // Display order
}

interface MenuData {
  version: string;
  lastUpdated: string;
  items: MenuItem[];
}
```

### Data Provider Function

```typescript
// src/lib/data-providers/menu.provider.ts
import menuData from '$data/menu.json';

export function getMenuItems(locale: string = 'en'): MenuItem[] {
  return menuData.items.map(item => ({
    ...item,
    // Flatten translated label for easier use
    labelText: item.label[locale as keyof TranslatedString]
  }));
}

export function getTopLevelMenuItems(locale: string = 'en'): MenuItem[] {
  return getMenuItems(locale).filter(item => item.parentId === null);
}

export function getSubMenuItems(parentId: string, locale: string = 'en'): MenuItem[] {
  return getMenuItems(locale)
    .filter(item => item.parentId === parentId)
    .sort((a, b) => a.order - b.order);
}
```

---

## 📄 Footer Data Structure

### File: `data/footer.json`

```json
{
  "version": "1.0",
  "lastUpdated": "2025-11-08",
  "brand": {
    "title": "Svetlana K-Liée",
    "subtitle": {
      "en": "Contemporary Artist",
      "ru": "Современный художник",
      "es": "Artista Contemporánea",
      "zh": "当代艺术家"
    },
    "quote": {
      "en": "\"I am the Artist - This is my Vision\"",
      "ru": "\"Я художник - это моё видение\"",
      "es": "\"Soy la Artista - Esta es mi Visión\"",
      "zh": "\"我是艺术家 - 这是我的愿景\""
    }
  },
  "social": {
    "title": {
      "en": "Follow",
      "ru": "Подписаться",
      "es": "Seguir",
      "zh": "关注"
    },
    "links": [
      {
        "id": "instagram-en",
        "platform": "Instagram",
        "label": "IG",
        "url": "https://instagram.com/Official.k.liee",
        "icon": "instagram",
        "order": 1
      },
      {
        "id": "instagram-ru",
        "platform": "Instagram",
        "label": "IG RU",
        "url": "https://instagram.com/svetlana.k.liee",
        "icon": "instagram",
        "order": 2
      },
      {
        "id": "telegram",
        "platform": "Telegram",
        "label": "TG",
        "url": "https://t.me/SvetlanaKliee",
        "icon": "telegram",
        "order": 3
      },
      {
        "id": "youtube",
        "platform": "YouTube",
        "label": "YT",
        "url": "https://www.youtube.com/@SvetlanaKLiee",
        "icon": "youtube",
        "order": 4
      },
      {
        "id": "pinterest",
        "platform": "Pinterest",
        "label": "PIN",
        "url": "https://uk.pinterest.com/svetaklie/_profile/",
        "icon": "pinterest",
        "order": 5
      },
      {
        "id": "tiktok",
        "platform": "TikTok",
        "label": "TT",
        "url": "https://www.tiktok.com/@svetlanakliee_art",
        "icon": "tiktok",
        "order": 6
      },
      {
        "id": "opensea",
        "platform": "OpenSea",
        "label": "OS",
        "url": "https://opensea.io/collection/k-lieesculptures",
        "icon": "opensea",
        "order": 7
      }
    ]
  },
  "contact": {
    "title": {
      "en": "Contact",
      "ru": "Контакты",
      "es": "Contacto",
      "zh": "联系"
    },
    "email": "info@k-lie.com"
  },
  "copyright": "© 2025 K-LIÉE. All rights reserved."
}
```

### TypeScript Interface: FooterData

```typescript
interface FooterBrand {
  title: string;                   // Artist name (no translation)
  subtitle: TranslatedString;      // "Contemporary Artist"
  quote: TranslatedString;         // Artist quote
}

interface SocialLink {
  id: string;                      // Unique ID
  platform: string;                // "Instagram", "Telegram", etc.
  label: string;                   // "IG", "TG", etc.
  url: string;                     // Full URL
  icon: string;                    // Icon identifier
  order: number;                   // Display order
}

interface FooterSocial {
  title: TranslatedString;         // "Follow"
  links: SocialLink[];
}

interface FooterContact {
  title: TranslatedString;         // "Contact"
  email: string;
}

interface FooterData {
  version: string;
  lastUpdated: string;
  brand: FooterBrand;
  social: FooterSocial;
  contact: FooterContact;
  copyright: string;               // Same in all languages
}
```

### Data Provider Function

```typescript
// src/lib/data-providers/footer.provider.ts
import footerData from '$data/footer.json';

export function getFooterData(locale: string = 'en') {
  return {
    brand: {
      title: footerData.brand.title,
      subtitle: footerData.brand.subtitle[locale as keyof TranslatedString],
      quote: footerData.brand.quote[locale as keyof TranslatedString]
    },
    social: {
      title: footerData.social.title[locale as keyof TranslatedString],
      links: footerData.social.links.sort((a, b) => a.order - b.order)
    },
    contact: {
      title: footerData.contact.title[locale as keyof TranslatedString],
      email: footerData.contact.email
    },
    copyright: footerData.copyright
  };
}
```

---

## 🗄️ SQLite Migration Path

### Future Database Schema

When migrating from JSON to SQLite (Drizzle ORM), the structure will map as follows:

#### Table: `menu_items`

```typescript
// src/lib/server/db/schemas/menu.schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const menuItems = sqliteTable('menu_items', {
  id: text('id').primaryKey(),
  labelEn: text('label_en').notNull(),
  labelRu: text('label_ru').notNull(),
  labelEs: text('label_es').notNull(),
  labelZh: text('label_zh').notNull(),
  href: text('href').notNull(),
  parentId: text('parent_id').references(() => menuItems.id),
  hasDropdown: integer('has_dropdown', { mode: 'boolean' }).notNull().default(false),
  order: integer('order').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});
```

#### Table: `footer_config`

```typescript
// src/lib/server/db/schemas/footer.schema.ts
export const footerConfig = sqliteTable('footer_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  section: text('section').notNull(), // 'brand', 'social', 'contact'
  key: text('key').notNull(),          // 'title', 'subtitle', 'quote', etc.
  valueEn: text('value_en'),
  valueRu: text('value_ru'),
  valueEs: text('value_es'),
  valueZh: text('value_zh'),
  metadata: text('metadata'),          // JSON for links, etc.
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const socialLinks = sqliteTable('social_links', {
  id: text('id').primaryKey(),
  platform: text('platform').notNull(),
  label: text('label').notNull(),
  url: text('url').notNull(),
  icon: text('icon'),
  order: integer('order').notNull()
});
```

### Migration Strategy

**Phase 1 (Current):**
- JSON files in `data/`
- Data providers read JSON
- Components consume via providers

**Phase 2 (Future - Sprint 8+):**
1. Create Drizzle schemas
2. Write migration script (JSON → SQLite)
3. Update data providers to read from DB
4. Components unchanged (same interface)

**Key Benefit:** Clean separation - components don't care about data source.

---

## 🔄 Data Provider Pattern

### Benefits

✅ **Abstraction Layer**
- Components don't know if data is JSON or DB
- Easy migration path
- Centralized data logic

✅ **Type Safety**
- TypeScript ensures correctness
- IDE autocomplete
- Compile-time errors

✅ **Testability**
- Mock providers for testing
- No database dependency in component tests

### Usage in Components

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { getTopLevelMenuItems, getSubMenuItems } from '$lib/data-providers/menu.provider';

  const locale = $page.data.locale || 'en';
  const topMenuItems = getTopLevelMenuItems(locale);
</script>

<nav>
  <ul>
    {#each topMenuItems as item}
      <li>
        <a href={item.href}>{item.labelText}</a>
        {#if item.hasDropdown}
          <ul class="dropdown-menu">
            {#each getSubMenuItems(item.id, locale) as subItem}
              <li><a href={subItem.href}>{subItem.labelText}</a></li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>
</nav>
```

---

## 📝 Design Decisions

### 1. Why `parentId` instead of nested arrays?

**JSON with nested arrays:**
```json
{
  "label": "Works",
  "children": [
    { "label": "CHEBU-RASHA", ... },
    { "label": "THE LAST SUPPER", ... }
  ]
}
```

**Our flat structure with `parentId`:**
```json
{ "id": "works", "parentId": null, ... },
{ "id": "works-chebu-rasha", "parentId": "works", ... }
```

**Why flat?**
- ✅ SQLite migration easier (foreign keys)
- ✅ No arbitrary nesting depth
- ✅ Queries simpler
- ✅ Updates easier (change parent without restructuring)

---

### 2. Why `order` field?

**Without `order`:**
```json
{ "items": ["home", "about", "works", ...] }
```

**With `order`:**
```json
{ "id": "home", "order": 1 },
{ "id": "about", "order": 2 }
```

**Why `order`?**
- ✅ Database-friendly (ORDER BY order)
- ✅ Explicit ordering (no array index dependency)
- ✅ Easy reordering (change number, not array position)

---

### 3. Why separate `social.links` array?

Could have stored as:
```json
{
  "social": {
    "instagram-en": { "url": "...", ... },
    "instagram-ru": { "url": "...", ... }
  }
}
```

**Why array?**
- ✅ Easier to iterate in Svelte (`{#each}`)
- ✅ Built-in ordering
- ✅ Matches future `social_links` table

---

## 🎯 Validation Rules

### Menu Items

```typescript
// Validation rules (future: Zod schema)
const menuItemRules = {
  id: /^[a-z0-9-]+$/,              // Lowercase alphanumeric + hyphens
  href: /^\/[a-z0-9-/]*$/,         // Must start with /
  order: (val: number) => val > 0, // Positive integers
  parentId: (val: string) => menuItemIds.includes(val) // Must exist
};
```

### Footer Data

```typescript
const footerRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // Valid email
  url: /^https?:\/\/.+/,                 // Valid URL
  order: (val: number) => val >= 1 && val <= 10 // 1-10 range
};
```

---

## 🚀 Summary

### What We've Designed

✅ **menu.json** - 13 items (6 top-level + 7 submenu)
✅ **footer.json** - Brand, Social (7 links), Contact
✅ **TypeScript types** - MenuItem, FooterData, etc.
✅ **Data providers** - Clean abstraction layer
✅ **SQLite migration path** - Clear table schemas

### Key Decisions

1. **All languages in ONE file** ✅
2. **Flat structure with `parentId`** ✅
3. **Explicit `order` field** ✅
4. **Data provider pattern** ✅
5. **SQLite-ready design** ✅

### Next Step

⏭️ **Step 3: Specification** - Create detailed component specs using these data structures.

---

**Data Structure Design Complete:** ✅
**Time Spent:** ~30 minutes
**Ready for:** Component Specification (Step 3)
