# i18n Setup Instructions - paraglide-sveltekit

**Date:** 2025-11-08
**Status:** Setup Instructions
**Languages:** EN, RU, ES, ZH

---

## 📋 Overview

This document provides instructions for setting up `paraglide-sveltekit` for internationalization with 4 languages.

**Note:** The Layout components (Header, Footer, MobileMenu) are already built with i18n support and will work once paraglide is configured.

---

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
cd /mnt/c/dev/project-kliee/project-box-v3-orm/frontend-sveltekit
npm install @inlang/paraglide-sveltekit
```

### Step 2: Initialize Paraglide

```bash
npx @inlang/paraglide-sveltekit init
```

This creates:
- `project.inlang/` directory
- `messages/` directory for translations
- Updates `svelte.config.js`

### Step 3: Configure Languages

Edit `project.inlang/settings.json`:

```json
{
  "$schema": "https://inlang.com/schema/project-settings",
  "sourceLanguageTag": "en",
  "languageTags": ["en", "ru", "es", "zh"],
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@latest/dist/index.js"
  ],
  "plugin.inlang.messageFormat": {
    "pathPattern": "./messages/{languageTag}.json"
  }
}
```

### Step 4: Create Translation Files

Create `messages/` directory and translation files:

#### `messages/en.json`
```json
{
  "lang.english": "English",
  "lang.russian": "Русский",
  "lang.spanish": "Español",
  "lang.chinese": "中文"
}
```

#### `messages/ru.json`
```json
{
  "lang.english": "Английский",
  "lang.russian": "Русский",
  "lang.spanish": "Испанский",
  "lang.chinese": "Китайский"
}
```

#### `messages/es.json`
```json
{
  "lang.english": "Inglés",
  "lang.russian": "Ruso",
  "lang.spanish": "Español",
  "lang.chinese": "Chino"
}
```

#### `messages/zh.json`
```json
{
  "lang.english": "英语",
  "lang.russian": "俄语",
  "lang.spanish": "西班牙语",
  "lang.chinese": "中文"
}
```

### Step 5: Update `svelte.config.js`

Add paraglide preprocessor:

```javascript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { paraglide } from '@inlang/paraglide-sveltekit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),

    // Add paraglide plugin
    plugins: [
      paraglide({
        project: './project.inlang',
        outdir: './src/lib/paraglide'
      })
    ]
  }
};

export default config;
```

### Step 6: Create i18n Routing Hook

Create `src/hooks.server.ts` (or add to existing):

```typescript
import { i18n } from '$lib/paraglide/i18n';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = i18n.handle();
```

### Step 7: Update Root Layout

The root layout (`src/routes/+layout.svelte`) needs to include the i18n provider.

This is already handled in Step 9 of the workflow.

---

## 🌐 URL Structure

After setup, the app will have language-based routing:

- `/en` - English
- `/ru` - Russian
- `/es` - Spanish
- `/zh` - Chinese

The LanguageSwitcher component is already built to handle this routing.

---

## 📝 Usage in Components

In Svelte components, use the `m` function for translations:

```svelte
<script>
  import * as m from '$lib/paraglide/messages';
</script>

<p>{m.lang_english()}</p>
```

However, for the Layout components, we're using the JSON-first approach with `menu.json` and `footer.json` for content, so paraglide translations are primarily for UI strings.

---

## ✅ Verification

After completing setup:

1. Run `npm run dev`
2. Navigate to `http://localhost:5173/en`
3. Verify language switcher works
4. Check URLs change correctly (`/en`, `/ru`, `/es`, `/zh`)
5. Verify menu items and footer content display in correct language

---

## 🔄 Integration with Existing Components

The following components are already built with i18n support:

- **Header.svelte** - Uses `$page.data.locale` to get current language
- **Footer.svelte** - Uses `$page.data.locale` to get current language
- **MobileMenu.svelte** - Accepts `locale` prop
- **LanguageSwitcher.svelte** - Handles language switching via URL routing

All components use the data providers (`menu.provider.ts`, `footer.provider.ts`) which accept a `locale` parameter and return localized content from JSON files.

---

## 📊 Current Status

- ✅ Components built with i18n support
- ✅ Data providers created with locale parameter
- ✅ JSON data files with 4 languages
- ⏳ Awaiting paraglide installation and configuration
- ⏳ Awaiting root layout integration (Step 9)

---

## 🚧 Next Steps

After completing paraglide setup:

1. Proceed to Step 9 - Root Layout creation
2. Test all 4 languages
3. Run TypeScript type checking
4. Visual verification on all languages

---

**Setup Time Estimate:** 15-20 minutes
**Difficulty:** Intermediate
**Dependencies:** None (paraglide is standalone)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-08
