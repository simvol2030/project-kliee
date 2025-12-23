# Production Migration Plan v2.0 - K-LIEE Portfolio

**Дата:** 2025-12-20
**Версия:** 2.0 (исправленная)
**Статус:** Готов к реализации

---

## Executive Summary

**Цель:** Завершить миграцию портфолио Svetlana K-LIEE на SvelteKit 5
**Текущая готовность:** ~30%
**Целевая готовность:** 100% (Production-ready)
**Оценка времени:** 65-85 часов

---

## Phase 0: Подготовка (Pre-requisites)

### Task 0.1: Миграция статических изображений
**Файлы:**
- `_old-static-site/images/` → `frontend-sveltekit/static/images/`

**Действия:**
1. Создать структуру директорий в `static/images/`
2. Скопировать изображения работ
3. Проверить пути в catalog.json

**Риски:** Большой объём файлов (~50MB)
**Время:** 1-2 часа

---

## Phase 1: Критические исправления (4-6 часов)

### Task 1.1: Исправить TypeScript ошибки
**Приоритет:** CRITICAL
**Блокирует:** Production build

#### Task 1.1.1: Установить недостающие типы
```bash
npm i -D @types/pg @playwright/test
```
**Время:** 5 минут

#### Task 1.1.2: Исправить role type в admin panel
**Файл:** `src/routes/(admin)/settings/+page.server.ts:61,110`
**Проблема:** `Type 'string' is not assignable to type '"super-admin" | "editor" | "viewer"'`
**Решение:** Type assertion или валидация
```typescript
const validRoles = ['super-admin', 'editor', 'viewer'] as const;
type AdminRole = typeof validRoles[number];
const role = formData.get('role') as AdminRole;
```
**Время:** 15 минут

#### Task 1.1.3: Исправить published field type
**Файл:** `src/routes/(admin)/dashboard/+page.svelte:71-72`
**Проблема:** `post.published === 1` vs boolean
**Решение:** Проверить схему БД и привести типы в соответствие
**Время:** 20 минут

#### Task 1.1.4: Исправить Playwright test types
**Файл:** `tests/qa-audit-fixes.spec.ts`
**Проблема:** 12 ошибок implicit any
**Решение:** После установки @playwright/test типы появятся автоматически
**Время:** 5 минут (проверка)

**Итого Task 1.1:** 45 минут

---

### Task 1.2: Исправить npm vulnerabilities
**Приоритет:** HIGH

#### Task 1.2.1: Автоматическое исправление
```bash
npm audit fix
```
**Исправит:** jws, js-yaml
**Время:** 5 минут

#### Task 1.2.2: Документировать unfixable
**Проблема:** sha.js, devalue, cookie - зависимости paraglide
**Решение:** Создать `docs/SECURITY_NOTES.md` с описанием рисков
**Время:** 15 минут

**Итого Task 1.2:** 20 минут

---

### Task 1.3: Исправить критические Accessibility warnings
**Приоритет:** MEDIUM

#### Task 1.3.1: Добавить keyboard events к modals
**Файлы:**
- `src/routes/(admin)/+layout.svelte:43`
- `src/routes/(admin)/posts/+page.svelte:99`
- `src/routes/(admin)/users/+page.svelte:119,163`

**Решение:** Добавить `onkeydown` handler
```svelte
<div
  class="modal-overlay"
  onclick={() => (showModal = false)}
  onkeydown={(e) => e.key === 'Escape' && (showModal = false)}
  role="button"
  tabindex="0"
>
```
**Время:** 30 минут

#### Task 1.3.2: Удалить redundant ARIA roles
**Файл:** `src/lib/components/home/Hero.svelte:52`
**Решение:** Удалить `role="region"` (section уже semantic)
**Время:** 5 минут

**Итого Task 1.3:** 35 минут

---

### Task 1.4: Очистить unused CSS selectors
**Приоритет:** LOW
**Решение:** Удалить или применить .dark селекторы
**Файлы:** Hero.svelte, +error.svelte
**Время:** 30 минут

---

**Phase 1 Итого:** 2-3 часа
**Checkpoint:** `npm run check` = 0 errors

---

## Phase 2: Content Migration (35-45 часов)

### Stage 2.1: JSON Data Files (6-8 часов)

#### Task 2.1.1: Создать artworks.json
**Источник:** `_old-static-site/catalog.json` (113 работ)
**Цель:** `data/artworks.json`
**Формат:**
```json
{
  "version": "1.0",
  "lastUpdated": "2025-12-20",
  "artworks": [
    {
      "id": "artwork-001",
      "title": { "en": "...", "ru": "...", "es": "...", "zh": "..." },
      "series": "chebu-rasha",
      "technique": { "en": "Mixed media", ... },
      "year": 2020,
      "dimensions": "60x80 cm",
      "price": null,
      "images": ["images/works/chebu-rasha/7_2.jpg"],
      "available": true
    }
  ]
}
```
**Время:** 2-3 часа (включая перевод)

#### Task 2.1.2: Создать series.json
**Цель:** `data/series.json`
**Серии:** CHEBU-RASHA, GENESIS, PLAY WITH YOURSELF, RED REVOLUTION, REST ZONE, STONES AND FLOWERS, SWEET DREAM
```json
{
  "version": "1.0",
  "series": [
    {
      "id": "chebu-rasha",
      "slug": "chebu-rasha",
      "title": { "en": "CHEBU-RASHA", ... },
      "description": { "en": "...", ... },
      "coverImage": "images/works/chebu-rasha/cover.jpg",
      "artworkCount": 15,
      "order": 1
    }
  ]
}
```
**Время:** 1-1.5 часа

#### Task 2.1.3: Создать exhibitions.json
**Источник:** `_old-static-site/exhibitions.html`
**Цель:** `data/exhibitions.json`
**Время:** 1-1.5 часа

#### Task 2.1.4: Создать about.json
**Источник:** `_old-static-site/about.html`
**Цель:** `data/about.json`
**Время:** 1 час

#### Task 2.1.5: Создать contact.json
**Источник:** `_old-static-site/contact.html`
**Цель:** `data/contact.json`
**Время:** 30 минут

#### Task 2.1.6: Создать nft.json
**Цель:** `data/nft.json`
**Время:** 30 минут

#### Task 2.1.7: Обновить Data Providers
**Файлы:**
- `src/lib/data/artworks.provider.ts` (новый)
- `src/lib/data/series.provider.ts` (новый)
- `src/lib/data/exhibitions.provider.ts` (новый)
- `src/lib/data/about.provider.ts` (новый)
- `src/lib/data/contact.provider.ts` (новый)
- `src/lib/data/nft.provider.ts` (новый)

**Паттерн:** Аналогично существующим `menu.provider.ts`
**Время:** 1-1.5 часа

---

### Stage 2.2: TypeScript Types (2-3 часа)

#### Task 2.2.1: Создать artwork.types.ts
**Файл:** `src/lib/types/artwork.types.ts`
```typescript
export interface Artwork {
  id: string;
  title: TranslatedString;
  series: string;
  technique: TranslatedString;
  year: number;
  dimensions: string;
  price: number | null;
  images: string[];
  available: boolean;
}

export interface Series {
  id: string;
  slug: string;
  title: TranslatedString;
  description: TranslatedString;
  coverImage: string;
  artworkCount: number;
  order: number;
}
```
**Время:** 45 минут

#### Task 2.2.2: Создать exhibition.types.ts
**Время:** 30 минут

#### Task 2.2.3: Создать about.types.ts
**Время:** 20 минут

#### Task 2.2.4: Создать contact.types.ts
**Время:** 20 минут

#### Task 2.2.5: Создать nft.types.ts
**Время:** 20 минут

---

### Stage 2.3: Database Schemas (2-3 часа)

#### Task 2.3.1: Добавить artworks schema
**Файл:** `src/lib/server/db/schema.ts`
```typescript
export const artworks = sqliteTable('artworks', {
  id: text('id').primaryKey(),
  titleEn: text('title_en').notNull(),
  titleRu: text('title_ru').notNull(),
  titleEs: text('title_es').notNull(),
  titleZh: text('title_zh').notNull(),
  series: text('series').notNull(),
  techniqueEn: text('technique_en'),
  techniqueRu: text('technique_ru'),
  techniqueEs: text('technique_es'),
  techniqueZh: text('technique_zh'),
  year: integer('year'),
  dimensions: text('dimensions'),
  price: integer('price'),
  images: text('images'), // JSON array
  available: integer('available').default(1),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});
```
**Время:** 1 час

#### Task 2.3.2: Добавить exhibitions schema
**Время:** 30 минут

#### Task 2.3.3: Добавить series schema
**Время:** 30 минут

#### Task 2.3.4: Создать seeding scripts
**Файл:** `scripts/seed-artworks.ts`
**Время:** 1 час

---

### Stage 2.4: Pages Implementation (25-30 часов)

#### Task 2.4.1: About Page (4-5 часов)
**Файлы:**
- `src/routes/[lang=locale]/about/+page.svelte`
- `src/routes/[lang=locale]/about/+page.server.ts`
- `src/lib/components/about/Biography.svelte`
- `src/lib/components/about/Timeline.svelte`
- `src/lib/components/about/Awards.svelte`

**Зависимости:** about.json, about.types.ts, about.provider.ts

#### Task 2.4.2: Contact Page (3-4 часа)
**Файлы:**
- `src/routes/[lang=locale]/contact/+page.svelte`
- `src/routes/[lang=locale]/contact/+page.server.ts`
- `src/routes/api/contact/+server.ts` (email endpoint)
- `src/lib/components/contact/ContactForm.svelte`

**Edge Cases:**
- Server-side email validation
- CSRF protection (CsrfToken.svelte уже есть)
- Rate limiting

#### Task 2.4.3: NFT Page (3-4 часа)
**Файлы:**
- `src/routes/[lang=locale]/nft/+page.svelte`
- `src/routes/[lang=locale]/nft/+page.server.ts`
- `src/lib/components/nft/NFTGallery.svelte`
- `src/lib/components/nft/OpenSeaLink.svelte`

#### Task 2.4.4: Works Overview Page (4-5 часов)
**Файлы:**
- `src/routes/[lang=locale]/works/+page.svelte`
- `src/routes/[lang=locale]/works/+page.server.ts`
- `src/lib/components/works/SeriesCard.svelte`
- `src/lib/components/works/SeriesGrid.svelte`

**Зависимости:** series.json, series.types.ts

#### Task 2.4.5: Individual Series Pages (6-8 часов)
**Файлы:**
- `src/routes/[lang=locale]/works/[slug]/+page.svelte`
- `src/routes/[lang=locale]/works/[slug]/+page.server.ts`
- `src/params/slug.ts` (param matcher)
- `src/lib/components/works/ArtworkCard.svelte`
- `src/lib/components/works/ArtworkGallery.svelte`
- `src/lib/components/ui/Lightbox.svelte`

**Edge Cases:**
- Серия без работ → показать сообщение
- Artwork без images → placeholder image
- Invalid slug → 404

#### Task 2.4.6: Exhibitions Page (4-5 часов)
**Файлы:**
- `src/routes/[lang=locale]/exhibitions/+page.svelte`
- `src/routes/[lang=locale]/exhibitions/+page.server.ts`
- `src/lib/components/exhibitions/ExhibitionCard.svelte`
- `src/lib/components/exhibitions/ExhibitionTimeline.svelte`

**Edge Cases:**
- Выставка без дат → "Date TBA"
- Прошедшие vs текущие vs будущие

#### Task 2.4.7: Catalog Page (10-12 часов)
**Самая сложная страница!**

**Файлы:**
- `src/routes/[lang=locale]/catalog/+page.svelte`
- `src/routes/[lang=locale]/catalog/+page.server.ts`
- `src/lib/components/catalog/ArtworkCard.svelte` (переиспользовать из works)
- `src/lib/components/catalog/FilterPanel.svelte`
- `src/lib/components/catalog/SearchBar.svelte`
- `src/lib/components/catalog/Pagination.svelte`
- `src/lib/components/ui/LoadingSpinner.svelte`
- `src/lib/components/ui/Skeleton.svelte`

**Функционал:**
- Фильтрация по серии
- Фильтрация по технике
- Фильтрация по году
- Поиск по названию
- Пагинация (12 работ на страницу)
- URL-параметры для фильтров

---

## Phase 3: Quality Assurance (12-15 часов)

### Task 3.1: E2E Testing Setup (4-5 часов)
**Файлы:**
- `playwright.config.ts` (обновить)
- `tests/homepage.spec.ts`
- `tests/navigation.spec.ts`
- `tests/catalog.spec.ts`

### Task 3.2: Image Optimization (5-6 часов)
**Действия:**
1. Установить vite-imagetools
2. Конвертировать в WebP
3. Создать srcset для responsive
4. Настроить lazy loading

### Task 3.3: SEO Optimization (3-4 часа)
**Файлы:**
- `src/routes/sitemap.xml/+server.ts`
- `static/robots.txt`
- Meta tags для всех страниц
- OpenGraph images

---

## Phase 4: Performance (5-7 часов)

### Task 4.1: Bundle Analysis
```bash
npm run build -- --analyze
```

### Task 4.2: Code Splitting
- Lazy load тяжёлых компонентов
- Dynamic imports для Lightbox

### Task 4.3: Preloading
- Preload критических ресурсов
- Prefetch следующих страниц

---

## Риски и Mitigation

| Риск | Вероятность | Влияние | Mitigation |
|------|-------------|---------|------------|
| npm vulnerabilities unfixable | HIGH | MEDIUM | Документировать, мониторить updates |
| Image conversion затягивается | MEDIUM | LOW | Можно отложить, использовать JPG |
| Catalog фильтры complex | HIGH | MEDIUM | MVP с базовыми фильтрами |
| Переводы неполные | MEDIUM | MEDIUM | Fallback на English |

---

## Зависимости между задачами

```
Phase 0 (images) ─┐
                  ├─→ Phase 1 (fixes) ─→ Phase 2 (content) ─→ Phase 3 (QA) ─→ Phase 4 (perf)
                  │
                  │   Stage 2.1 (JSON) ─┐
                  │                     ├─→ Stage 2.4 (Pages)
                  │   Stage 2.2 (Types)─┤
                  │                     │
                  │   Stage 2.3 (DB)────┘
```

---

## Checkpoint Criteria

### После Phase 1:
- [ ] `npm run check` = 0 errors
- [ ] `npm audit` = no critical unfixed
- [ ] Accessibility warnings < 20

### После Phase 2:
- [ ] Все 7 страниц работают
- [ ] Все 4 языка переключаются
- [ ] Данные загружаются из JSON

### После Phase 3:
- [ ] E2E тесты проходят
- [ ] Lighthouse Performance > 90
- [ ] SEO score > 95

### После Phase 4:
- [ ] Bundle size < 300kb
- [ ] FCP < 1.5s
- [ ] TTI < 3s

---

## Commit Strategy

- После каждой Task → commit
- После каждого Stage → push
- Формат: `feat(scope): description` или `fix(scope): description`

---

**Версия:** 2.0
**Автор:** Claude Code AI
**Дата создания:** 2025-12-20
