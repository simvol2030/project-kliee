# Claude Code Web Session Plan: Полноценная CMS для K-LIÉE

**Дата создания**: 2025-12-21
**Дата аудита v2**: 2025-12-21
**Дата аудита v3**: 2025-12-21
**Дата аудита v3.1**: 2025-12-21
**Версия**: 3.1 (FULL CMS + Page Builder)
**Статус**: Ready for Execution
**Приоритет**: CRITICAL

---

## 🔍 АУДИТ v3.1: Финальная версия

### История изменений

| Версия | Цель | Что добавлено |
|--------|------|---------------|
| v1.0 | JSON → DB миграция | Базовая миграция |
| v2.0 | + Схема БД, Edge cases | Схема, rollback |
| v3.0 | Полноценная CMS | Media Manager, 8 админок |
| **v3.1** | **Финальная CMS** | **Page Builder, все секции Homepage, сохранение существующих админок** |

### Что добавлено в v3.1 (относительно v3.0)

| Компонент | v3.0 | v3.1 |
|-----------|------|------|
| Homepage: About Preview | ❌ | ✅ |
| Homepage: News Grid | ❌ | ✅ |
| Homepage: Testimonials | ❌ | ✅ |
| Homepage: Process | ❌ | ✅ |
| **Page Builder (создание страниц)** | ❌ | ✅ |
| **/works общая страница** | ❌ | ✅ |
| **Сохранение Dashboard** | Неявно | ✅ Явно |
| **Сохранение Users** | Неявно | ✅ Явно |
| **Сохранение Posts** | Неявно | ✅ Явно |
| **Сохранение Settings** | Неявно | ✅ Явно |
| Чек-листы на каждую задачу | ❌ | ✅ |
| Критерии успешности | ❌ | ✅ |

---

## 🎯 Цели проекта (Финальные требования)

### Что должно быть на выходе:

1. ✅ **Зайти в админку** — авторизация уже работает
2. ✅ **Редактировать ВСЕ страницы** — включая все секции Homepage
3. ✅ **Создавать НОВЫЕ страницы** — Page Builder
4. ✅ **Загружать изображения** — Media Manager
5. ✅ **Каждое поле на 4 языках** — EN/RU/ES/ZH табы
6. ✅ **Редактировать Layout** — Menu, Header, Footer
7. ✅ **Сохранить существующие админки** — Dashboard, Users, Posts, Settings

---

## 📋 Полный список страниц и сущностей

### Публичные страницы

| Страница | URL | Как редактировать | Секции |
|----------|-----|-------------------|--------|
| Homepage | `/` | `/admin/homepage/*` | 7 секций (см. ниже) |
| About | `/about` | `/admin/pages/about` | Контент + фото |
| Works (общая) | `/works` | `/admin/works` | Заголовок + список серий |
| Series (каждая) | `/works/[slug]` | `/admin/series/[id]` | Инфо + работы |
| Exhibitions | `/exhibitions` | `/admin/exhibitions` | Список выставок |
| NFT | `/nft` | `/admin/pages/nft` | Контент |
| Contact | `/contact` | `/admin/pages/contact` | Форма + инфо |

### Homepage секции (7 штук)

| # | Секция | Компонент | Админка |
|---|--------|-----------|---------|
| 1 | Hero + Slides | Hero.svelte | `/admin/homepage/hero` |
| 2 | Featured Collections | FeaturedCollections.svelte | `/admin/homepage/collections` |
| 3 | About Preview | AboutPreview.svelte | `/admin/homepage/about` |
| 4 | Current Exhibition | ExhibitionsPreview.svelte | `/admin/homepage/exhibitions` |
| 5 | News Grid | NewsGrid.svelte | `/admin/homepage/news` |
| 6 | Testimonials | TestimonialGrid.svelte | `/admin/homepage/testimonials` |
| 7 | Creative Process | ProcessGrid.svelte | `/admin/homepage/process` |

### Существующие админ-разделы (СОХРАНИТЬ!)

| Раздел | URL | Статус |
|--------|-----|--------|
| Dashboard | `/admin/dashboard` | ✅ Сохранить |
| Users | `/admin/users` | ✅ Сохранить |
| Posts | `/admin/posts` | ✅ Сохранить |
| Settings | `/admin/settings` | ✅ Сохранить |
| Login | `/admin/login` | ✅ Сохранить |

---

## 🏗️ PHASE 0: Database Foundation

**Время:** 2-3 часа
**Зависимости:** Нет

### Задачи

#### Task 0.1: Обновить схему БД

**Описание:** Добавить все таблицы в schema.ts

**Чек-лист:**
- [ ] Бэкап текущей schema.ts
- [ ] Добавить таблицу `media`
- [ ] Добавить таблицу `media_thumbnails`
- [ ] Добавить таблицу `menu_items`
- [ ] Добавить таблицы footer: `footer_brand`, `footer_social_links`, `footer_contact`
- [ ] Добавить таблицы homepage: `homepage_hero`, `hero_slides`, `homepage_sections`
- [ ] Добавить таблицы homepage v3.1: `homepage_about`, `homepage_news`, `homepage_testimonials`, `homepage_process`
- [ ] Добавить таблицу `series`
- [ ] Добавить таблицы artworks: `artworks`, `artwork_images`
- [ ] Добавить таблицы exhibitions: `exhibitions`, `exhibition_artworks`
- [ ] Добавить таблицу `pages` (для Page Builder)
- [ ] Добавить таблицу `page_blocks`
- [ ] Добавить таблицу `works_page` (для /works)
- [ ] Проверить все foreign keys

**Критерии успешности:**
- [ ] `npm run check` — 0 ошибок TypeScript
- [ ] Все таблицы определены с правильными типами
- [ ] Foreign keys указывают на существующие таблицы

---

#### Task 0.2: Запустить миграции

**Описание:** Сгенерировать и применить миграции Drizzle

**Чек-лист:**
- [ ] `npx drizzle-kit generate` — успешно
- [ ] Проверить сгенерированные SQL файлы
- [ ] `npx drizzle-kit push` — успешно
- [ ] Проверить что таблицы созданы в БД

**Критерии успешности:**
- [ ] Все таблицы созданы в SQLite
- [ ] Нет ошибок миграции
- [ ] Можно выполнить SELECT на каждую таблицу

---

#### Task 0.3: Создать seed скрипты

**Описание:** Миграция данных из JSON в БД

**Чек-лист:**
- [ ] Создать `scripts/seed-menu.ts` — из `menu.json`
- [ ] Создать `scripts/seed-footer.ts` — из `footer.json`
- [ ] Создать `scripts/seed-homepage.ts` — из `homepage.json`
- [ ] Создать `scripts/seed-all.ts` — запускает все
- [ ] Выполнить seed скрипты
- [ ] Проверить данные в БД

**Критерии успешности:**
- [ ] Все данные из JSON перенесены в БД
- [ ] Данные корректны для всех 4 языков
- [ ] Нет дубликатов

---

## 📤 PHASE 1: Media Manager

**Время:** 3-4 часа
**Зависимости:** Phase 0

### Задачи

#### Task 1.1: Установить зависимости

**Описание:** Установить пакеты для работы с изображениями

**Чек-лист:**
- [ ] `npm install sharp`
- [ ] `npm install uuid`
- [ ] `npm install -D @types/uuid`
- [ ] Проверить что sharp работает (может требовать rebuild)

**Критерии успешности:**
- [ ] `npm run build` — успешно
- [ ] Нет ошибок при импорте sharp

---

#### Task 1.2: Создать API для загрузки

**Описание:** Endpoint для загрузки изображений

**Чек-лист:**
- [ ] Создать `/api/media/upload/+server.ts`
- [ ] Валидация: типы файлов (jpeg, png, webp, gif)
- [ ] Валидация: размер (max 10MB)
- [ ] Генерация UUID имени файла
- [ ] Сохранение в `static/uploads/[folder]/`
- [ ] Создание thumbnails (thumb, small, medium, large)
- [ ] Конвертация в WebP
- [ ] Сохранение в БД (media + media_thumbnails)
- [ ] Возврат URL и ID

**Критерии успешности:**
- [ ] POST запрос с файлом возвращает 200
- [ ] Файл сохраняется на диск
- [ ] 4 thumbnail создаются
- [ ] Запись появляется в таблице media

---

#### Task 1.3: Создать API для списка медиа

**Описание:** Endpoint для получения списка изображений

**Чек-лист:**
- [ ] Создать `/api/media/+server.ts` (GET)
- [ ] Фильтрация по папке
- [ ] Пагинация (limit, offset)
- [ ] Поиск по имени файла
- [ ] Возврат URL thumbnails

**Критерии успешности:**
- [ ] GET возвращает массив медиа
- [ ] Фильтр по folder работает
- [ ] Thumbnails URLs корректны

---

#### Task 1.4: Создать MediaPicker компонент

**Описание:** UI компонент для выбора изображения

**Чек-лист:**
- [ ] Создать `$lib/components/admin/MediaPicker.svelte`
- [ ] Модальное окно с галереей
- [ ] Drag-drop загрузка
- [ ] Выбор существующего изображения
- [ ] Превью выбранного
- [ ] Events: `select`, `upload`

**Критерии успешности:**
- [ ] Компонент открывается как модалка
- [ ] Можно загрузить новый файл
- [ ] Можно выбрать существующий
- [ ] Событие select срабатывает

---

#### Task 1.5: Создать страницу Media Library

**Описание:** Админ-страница для управления медиа

**Чек-лист:**
- [ ] Создать `/(admin)/media/+page.svelte`
- [ ] Создать `/(admin)/media/+page.server.ts`
- [ ] Галерея всех изображений
- [ ] Фильтр по папкам
- [ ] Drag-drop зона для загрузки
- [ ] Редактирование alt-текста (4 языка)
- [ ] Удаление с подтверждением
- [ ] Проверка использования перед удалением

**Критерии успешности:**
- [ ] Страница загружается без ошибок
- [ ] Видны все загруженные изображения
- [ ] Загрузка работает
- [ ] Удаление работает
- [ ] Alt-текст сохраняется

---

## 🧭 PHASE 2: Layout Admin

**Время:** 2-3 часа
**Зависимости:** Phase 1

### Задачи

#### Task 2.1: Menu CRUD

**Описание:** Управление навигацией сайта

**Чек-лист:**
- [ ] Создать `/(admin)/menu/+page.svelte`
- [ ] Создать `/(admin)/menu/+page.server.ts`
- [ ] Список пунктов меню с drag-drop сортировкой
- [ ] Создание нового пункта
- [ ] Редактирование (label 4 языка, href, icon)
- [ ] Удаление с подтверждением
- [ ] Вложенные пункты (parent_id)
- [ ] Visibility toggle

**Критерии успешности:**
- [ ] Список меню отображается
- [ ] Можно создать новый пункт
- [ ] Можно изменить порядок
- [ ] Изменения сохраняются в БД
- [ ] Header на сайте обновляется

---

#### Task 2.2: Footer CRUD

**Описание:** Управление футером

**Чек-лист:**
- [ ] Создать `/(admin)/footer/+page.svelte`
- [ ] Tab 1: Brand (title, subtitle 4 языка, quote 4 языка)
- [ ] Tab 2: Social Links (platform, url, icon, order)
- [ ] Tab 3: Contact (title 4 языка, email, phone)
- [ ] Form actions для каждого таба

**Критерии успешности:**
- [ ] Все три таба работают
- [ ] Данные сохраняются
- [ ] Footer на сайте обновляется

---

#### Task 2.3: Обновить Layout providers

**Описание:** Переключить Layout на БД

**Чек-лист:**
- [ ] Обновить `menu.provider.ts` → читать из БД
- [ ] Обновить `footer.provider.ts` → читать из БД
- [ ] Добавить fallback на JSON при ошибке БД
- [ ] Обновить `+layout.server.ts`

**Критерии успешности:**
- [ ] Header показывает данные из БД
- [ ] Footer показывает данные из БД
- [ ] При ошибке БД — fallback на JSON

---

## 🏠 PHASE 3: Homepage Admin

**Время:** 4-5 часов
**Зависимости:** Phase 2

### Задачи

#### Task 3.1: Hero Section

**Описание:** Управление главным баннером

**Чек-лист:**
- [ ] Создать `/(admin)/homepage/hero/+page.svelte`
- [ ] Редактирование текстов (title, subtitle, quote — 4 языка)
- [ ] Announcement (highlight, text — 4 языка)
- [ ] Управление слайдами (добавить, удалить, сортировка)
- [ ] Для каждого слайда: выбор изображения, alt, duration

**Критерии успешности:**
- [ ] Тексты редактируются
- [ ] Слайды добавляются/удаляются
- [ ] Hero на сайте обновляется

---

#### Task 3.2: Featured Collections

**Описание:** Выбор серий для отображения на главной

**Чек-лист:**
- [ ] Создать `/(admin)/homepage/collections/+page.svelte`
- [ ] Заголовок секции (title, subtitle — 4 языка)
- [ ] Выбор серий из списка (checkbox или drag-drop)
- [ ] Сортировка выбранных

**Критерии успешности:**
- [ ] Серии выбираются
- [ ] Порядок меняется
- [ ] На сайте отображаются выбранные

---

#### Task 3.3: About Preview

**Описание:** Превью секции "О художнике" на главной

**Чек-лист:**
- [ ] Создать `/(admin)/homepage/about/+page.svelte`
- [ ] Заголовок (title — 4 языка)
- [ ] Краткий текст (text — 4 языка)
- [ ] Выбор фото
- [ ] CTA кнопка (text, href)

**Критерии успешности:**
- [ ] Все поля редактируются
- [ ] Фото меняется через MediaPicker
- [ ] Секция на сайте обновляется

---

#### Task 3.4: Current Exhibition

**Описание:** Текущая выставка на главной

**Чек-лист:**
- [ ] Создать `/(admin)/homepage/exhibitions/+page.svelte`
- [ ] Заголовок секции (title, subtitle — 4 языка)
- [ ] Выбор выставки из списка
- [ ] Или ручной ввод данных

**Критерии успешности:**
- [ ] Выставка выбирается
- [ ] Отображается на главной

---

#### Task 3.5: News Grid (NEW in v3.1)

**Описание:** Секция новостей на главной

**Чек-лист:**
- [ ] Создать `/(admin)/homepage/news/+page.svelte`
- [ ] Заголовок секции (title — 4 языка)
- [ ] Список новостей (до 3 штук)
- [ ] Для каждой: title, excerpt, image, link, date

**Критерии успешности:**
- [ ] Новости редактируются
- [ ] NewsGrid на сайте показывает данные из БД

---

#### Task 3.6: Testimonials (NEW in v3.1)

**Описание:** Отзывы на главной

**Чек-лист:**
- [ ] Создать `/(admin)/homepage/testimonials/+page.svelte`
- [ ] Заголовок секции
- [ ] Список отзывов (до 3 штук)
- [ ] Для каждого: quote (4 языка), author, role, avatar

**Критерии успешности:**
- [ ] Отзывы редактируются
- [ ] TestimonialGrid на сайте обновляется

---

#### Task 3.7: Creative Process (NEW in v3.1)

**Описание:** Этапы творческого процесса

**Чек-лист:**
- [ ] Создать `/(admin)/homepage/process/+page.svelte`
- [ ] Заголовок секции
- [ ] Список этапов (4 штуки)
- [ ] Для каждого: title (4 языка), description (4 языка), icon/number

**Критерии успешности:**
- [ ] Этапы редактируются
- [ ] ProcessGrid на сайте обновляется

---

#### Task 3.8: Обновить homepage provider

**Описание:** Переключить Homepage на БД

**Чек-лист:**
- [ ] Обновить `homepage.provider.ts`
- [ ] Читать все 7 секций из БД
- [ ] Fallback на JSON

**Критерии успешности:**
- [ ] Homepage полностью работает с БД
- [ ] Все 7 секций отображаются корректно

---

## 🖼️ PHASE 4: Content Admin

**Время:** 5-6 часов
**Зависимости:** Phase 3

### Задачи

#### Task 4.1: Series CRUD

**Описание:** Управление коллекциями работ

**Чек-лист:**
- [ ] Создать `/(admin)/series/+page.svelte` — список
- [ ] Создать `/(admin)/series/new/+page.svelte` — создание
- [ ] Создать `/(admin)/series/[id]/+page.svelte` — редактирование
- [ ] Поля: slug, name (4 языка), description (4 языка)
- [ ] Cover image через MediaPicker
- [ ] SEO поля (title, description — 4 языка)
- [ ] Visibility, featured, order

**Критерии успешности:**
- [ ] Серии создаются
- [ ] Серии редактируются
- [ ] Страницы /works/[slug] показывают данные из БД

---

#### Task 4.2: Works Page (NEW in v3.1)

**Описание:** Управление общей страницей /works

**Чек-лист:**
- [ ] Создать `/(admin)/works/+page.svelte`
- [ ] Заголовок страницы (title — 4 языка)
- [ ] Описание (description — 4 языка)
- [ ] Порядок отображения серий
- [ ] SEO настройки

**Критерии успешности:**
- [ ] /works показывает данные из БД
- [ ] Порядок серий настраивается

---

#### Task 4.3: Artworks CRUD

**Описание:** Управление отдельными работами

**Чек-лист:**
- [ ] Создать `/(admin)/artworks/+page.svelte` — список с фильтром по серии
- [ ] Создать `/(admin)/artworks/new/+page.svelte`
- [ ] Создать `/(admin)/artworks/[id]/+page.svelte`
- [ ] Поля: title (4 языка), description (4 языка)
- [ ] Technique, dimensions, year, price, currency
- [ ] Галерея изображений (множественный MediaPicker)
- [ ] Привязка к серии
- [ ] Featured, for_sale, visible

**Критерии успешности:**
- [ ] Работы создаются с привязкой к серии
- [ ] Галерея изображений работает
- [ ] На страницах серий отображаются работы

---

#### Task 4.4: Exhibitions CRUD

**Описание:** Управление выставками

**Чек-лист:**
- [ ] Создать `/(admin)/exhibitions/+page.svelte` — список
- [ ] Создать `/(admin)/exhibitions/new/+page.svelte`
- [ ] Создать `/(admin)/exhibitions/[id]/+page.svelte`
- [ ] Поля: title (4 языка), description (4 языка)
- [ ] Venue, city, country, address
- [ ] Start date, end date, opening hours
- [ ] Cover image
- [ ] Gallery link
- [ ] Current, visible
- [ ] Связь с работами

**Критерии успешности:**
- [ ] Выставки создаются
- [ ] Страница /exhibitions работает с БД
- [ ] Текущая выставка выделяется

---

#### Task 4.5: Pages (About, Contact, NFT)

**Описание:** Редактирование статических страниц

**Чек-лист:**
- [ ] Создать `/(admin)/pages/+page.svelte` — список страниц
- [ ] Создать `/(admin)/pages/[slug]/+page.svelte` — редактор
- [ ] Rich text editor для content (4 языка)
- [ ] Featured image
- [ ] SEO поля
- [ ] Published status

**Критерии успешности:**
- [ ] About, Contact, NFT редактируются
- [ ] Контент отображается на сайте

---

#### Task 4.6: Page Builder (NEW in v3.1)

**Описание:** Создание новых страниц произвольного типа

**Чек-лист:**
- [ ] Добавить кнопку "Create New Page" в `/admin/pages`
- [ ] Форма создания: slug, title, template type
- [ ] Редактор блоков: text, image, gallery, video, html
- [ ] Drag-drop сортировка блоков
- [ ] Preview режим

**Критерии успешности:**
- [ ] Можно создать новую страницу
- [ ] Страница доступна по /[slug]
- [ ] Блоки редактируются

---

## 🔧 PHASE 5: Integration & Testing

**Время:** 2-3 часа
**Зависимости:** Phase 4

### Задачи

#### Task 5.1: Обновить все public routes

**Описание:** Переключить публичный сайт на БД

**Чек-лист:**
- [ ] `/[lang]/+page.svelte` — Homepage
- [ ] `/[lang]/about/+page.svelte`
- [ ] `/[lang]/works/+page.svelte`
- [ ] `/[lang]/works/[slug]/+page.svelte`
- [ ] `/[lang]/exhibitions/+page.svelte`
- [ ] `/[lang]/nft/+page.svelte`
- [ ] `/[lang]/contact/+page.svelte`
- [ ] Все load functions → DB providers

**Критерии успешности:**
- [ ] Все страницы работают
- [ ] Данные из БД отображаются
- [ ] Мультиязычность работает

---

#### Task 5.2: Fallback на JSON

**Описание:** Автоматический fallback при ошибке БД

**Чек-лист:**
- [ ] Каждый provider: try/catch с fallback
- [ ] Логирование ошибок БД
- [ ] Graceful degradation

**Критерии успешности:**
- [ ] При отключении БД сайт работает с JSON
- [ ] Ошибки логируются

---

#### Task 5.3: Мультиязычность в админке

**Описание:** Создать компонент LanguageTabs

**Чек-лист:**
- [ ] Создать `$lib/components/admin/LanguageTabs.svelte`
- [ ] Табы: EN, RU, ES, ZH с флагами
- [ ] Snippet для контента
- [ ] Применить во всех формах админки

**Критерии успешности:**
- [ ] Все формы имеют табы языков
- [ ] Переключение работает
- [ ] Данные сохраняются для всех языков

---

#### Task 5.4: Preview перед публикацией

**Описание:** Предпросмотр изменений

**Чек-лист:**
- [ ] Кнопка "Preview" в формах
- [ ] Открывает страницу в новом табе с ?preview=true
- [ ] Показывает несохранённые изменения

**Критерии успешности:**
- [ ] Preview открывается
- [ ] Видны текущие изменения

---

#### Task 5.5: Финальное тестирование

**Описание:** Проверка всей системы

**Чек-лист:**
- [ ] Создать новый menu item → виден на сайте
- [ ] Изменить footer → обновляется на сайте
- [ ] Изменить hero slide → обновляется
- [ ] Создать серию → страница создаётся
- [ ] Добавить artwork → виден в серии
- [ ] Создать выставку → видна в списке
- [ ] Редактировать About page → контент обновляется
- [ ] Создать новую страницу → доступна по URL
- [ ] Загрузить изображение → появляется в библиотеке
- [ ] Проверить все 4 языка
- [ ] Проверить мобильную версию

**Критерии успешности:**
- [ ] Все проверки пройдены
- [ ] Нет ошибок в консоли
- [ ] Нет 404 ошибок

---

## 🗄️ Полная схема БД (Drizzle ORM)

```typescript
// src/lib/server/db/schema.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================
// EXISTING TABLES (СОХРАНИТЬ!)
// ============================================

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'),
  published: integer('published', { mode: 'boolean' }).default(false).notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const admins = sqliteTable('admins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['super-admin', 'editor', 'viewer'] }).notNull().default('viewer'),
  name: text('name').notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ============================================
// MEDIA LIBRARY
// ============================================

export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  stored_filename: text('stored_filename').notNull().unique(),
  mime_type: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  alt_en: text('alt_en'),
  alt_ru: text('alt_ru'),
  alt_es: text('alt_es'),
  alt_zh: text('alt_zh'),
  folder: text('folder').default('uploads'),
  uploaded_at: text('uploaded_at').default(sql`CURRENT_TIMESTAMP`),
  uploaded_by: integer('uploaded_by').references(() => admins.id)
});

export const mediaThumbnails = sqliteTable('media_thumbnails', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  media_id: integer('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  size_name: text('size_name').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  stored_filename: text('stored_filename').notNull()
});

// ============================================
// NAVIGATION
// ============================================

export const menuItems = sqliteTable('menu_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  href: text('href').notNull(),
  label_en: text('label_en').notNull(),
  label_ru: text('label_ru').notNull(),
  label_es: text('label_es').notNull(),
  label_zh: text('label_zh').notNull(),
  parent_id: integer('parent_id'),
  has_dropdown: integer('has_dropdown', { mode: 'boolean' }).default(false),
  order_index: integer('order_index').notNull().default(0),
  icon: text('icon'),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// ============================================
// FOOTER
// ============================================

export const footerBrand = sqliteTable('footer_brand', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  subtitle_en: text('subtitle_en'),
  subtitle_ru: text('subtitle_ru'),
  subtitle_es: text('subtitle_es'),
  subtitle_zh: text('subtitle_zh'),
  quote_en: text('quote_en'),
  quote_ru: text('quote_ru'),
  quote_es: text('quote_es'),
  quote_zh: text('quote_zh')
});

export const footerSocialLinks = sqliteTable('footer_social_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  platform: text('platform').notNull(),
  label: text('label').notNull(),
  badge: text('badge'),
  url: text('url').notNull(),
  icon: text('icon').notNull(),
  order_index: integer('order_index').default(0),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

export const footerContact = sqliteTable('footer_contact', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title_en: text('title_en'),
  title_ru: text('title_ru'),
  title_es: text('title_es'),
  title_zh: text('title_zh'),
  email: text('email'),
  phone: text('phone')
});

// ============================================
// HOMEPAGE
// ============================================

export const homepageHero = sqliteTable('homepage_hero', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title_en: text('title_en').notNull(),
  title_ru: text('title_ru').notNull(),
  title_es: text('title_es').notNull(),
  title_zh: text('title_zh').notNull(),
  subtitle_en: text('subtitle_en'),
  subtitle_ru: text('subtitle_ru'),
  subtitle_es: text('subtitle_es'),
  subtitle_zh: text('subtitle_zh'),
  quote_en: text('quote_en'),
  quote_ru: text('quote_ru'),
  quote_es: text('quote_es'),
  quote_zh: text('quote_zh'),
  announcement_highlight_en: text('announcement_highlight_en'),
  announcement_highlight_ru: text('announcement_highlight_ru'),
  announcement_highlight_es: text('announcement_highlight_es'),
  announcement_highlight_zh: text('announcement_highlight_zh'),
  announcement_text_en: text('announcement_text_en'),
  announcement_text_ru: text('announcement_text_ru'),
  announcement_text_es: text('announcement_text_es'),
  announcement_text_zh: text('announcement_text_zh')
});

export const heroSlides = sqliteTable('hero_slides', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hero_id: integer('hero_id').references(() => homepageHero.id, { onDelete: 'cascade' }),
  media_id: integer('media_id').references(() => media.id),
  alt_en: text('alt_en'),
  alt_ru: text('alt_ru'),
  alt_es: text('alt_es'),
  alt_zh: text('alt_zh'),
  duration: integer('duration').default(4000),
  order_index: integer('order_index').default(0),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

export const homepageSections = sqliteTable('homepage_sections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  section_type: text('section_type').notNull(),
  title_en: text('title_en'),
  title_ru: text('title_ru'),
  title_es: text('title_es'),
  title_zh: text('title_zh'),
  subtitle_en: text('subtitle_en'),
  subtitle_ru: text('subtitle_ru'),
  subtitle_es: text('subtitle_es'),
  subtitle_zh: text('subtitle_zh'),
  content_json: text('content_json'),
  order_index: integer('order_index').default(0),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

// Homepage About Preview (NEW in v3.1)
export const homepageAbout = sqliteTable('homepage_about', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title_en: text('title_en'),
  title_ru: text('title_ru'),
  title_es: text('title_es'),
  title_zh: text('title_zh'),
  text_en: text('text_en'),
  text_ru: text('text_ru'),
  text_es: text('text_es'),
  text_zh: text('text_zh'),
  image_id: integer('image_id').references(() => media.id),
  cta_text_en: text('cta_text_en'),
  cta_text_ru: text('cta_text_ru'),
  cta_text_es: text('cta_text_es'),
  cta_text_zh: text('cta_text_zh'),
  cta_href: text('cta_href')
});

// Homepage News (NEW in v3.1)
export const homepageNews = sqliteTable('homepage_news', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title_en: text('title_en'),
  title_ru: text('title_ru'),
  title_es: text('title_es'),
  title_zh: text('title_zh'),
  excerpt_en: text('excerpt_en'),
  excerpt_ru: text('excerpt_ru'),
  excerpt_es: text('excerpt_es'),
  excerpt_zh: text('excerpt_zh'),
  image_id: integer('image_id').references(() => media.id),
  link: text('link'),
  date: text('date'),
  order_index: integer('order_index').default(0),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

// Homepage Testimonials (NEW in v3.1)
export const homepageTestimonials = sqliteTable('homepage_testimonials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  quote_en: text('quote_en'),
  quote_ru: text('quote_ru'),
  quote_es: text('quote_es'),
  quote_zh: text('quote_zh'),
  author: text('author'),
  role_en: text('role_en'),
  role_ru: text('role_ru'),
  role_es: text('role_es'),
  role_zh: text('role_zh'),
  avatar_id: integer('avatar_id').references(() => media.id),
  order_index: integer('order_index').default(0),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

// Homepage Process Steps (NEW in v3.1)
export const homepageProcess = sqliteTable('homepage_process', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title_en: text('title_en'),
  title_ru: text('title_ru'),
  title_es: text('title_es'),
  title_zh: text('title_zh'),
  description_en: text('description_en'),
  description_ru: text('description_ru'),
  description_es: text('description_es'),
  description_zh: text('description_zh'),
  icon: text('icon'),
  step_number: integer('step_number'),
  order_index: integer('order_index').default(0),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

// ============================================
// SERIES (Collections)
// ============================================

export const series = sqliteTable('series', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name_en: text('name_en').notNull(),
  name_ru: text('name_ru').notNull(),
  name_es: text('name_es').notNull(),
  name_zh: text('name_zh').notNull(),
  description_en: text('description_en'),
  description_ru: text('description_ru'),
  description_es: text('description_es'),
  description_zh: text('description_zh'),
  cover_image_id: integer('cover_image_id').references(() => media.id),
  order_index: integer('order_index').default(0),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
  is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
  seo_title_en: text('seo_title_en'),
  seo_title_ru: text('seo_title_ru'),
  seo_title_es: text('seo_title_es'),
  seo_title_zh: text('seo_title_zh'),
  seo_description_en: text('seo_description_en'),
  seo_description_ru: text('seo_description_ru'),
  seo_description_es: text('seo_description_es'),
  seo_description_zh: text('seo_description_zh'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Works Page Config (NEW in v3.1)
export const worksPage = sqliteTable('works_page', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title_en: text('title_en'),
  title_ru: text('title_ru'),
  title_es: text('title_es'),
  title_zh: text('title_zh'),
  description_en: text('description_en'),
  description_ru: text('description_ru'),
  description_es: text('description_es'),
  description_zh: text('description_zh'),
  seo_title_en: text('seo_title_en'),
  seo_title_ru: text('seo_title_ru'),
  seo_title_es: text('seo_title_es'),
  seo_title_zh: text('seo_title_zh'),
  seo_description_en: text('seo_description_en'),
  seo_description_ru: text('seo_description_ru'),
  seo_description_es: text('seo_description_es'),
  seo_description_zh: text('seo_description_zh')
});

// ============================================
// ARTWORKS
// ============================================

export const artworks = sqliteTable('artworks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  series_id: integer('series_id').references(() => series.id),
  title_en: text('title_en').notNull(),
  title_ru: text('title_ru').notNull(),
  title_es: text('title_es').notNull(),
  title_zh: text('title_zh').notNull(),
  description_en: text('description_en'),
  description_ru: text('description_ru'),
  description_es: text('description_es'),
  description_zh: text('description_zh'),
  technique: text('technique'),
  dimensions: text('dimensions'),
  year: integer('year'),
  price: integer('price'),
  currency: text('currency').default('EUR'),
  is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
  is_for_sale: integer('is_for_sale', { mode: 'boolean' }).default(true),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
  order_index: integer('order_index').default(0),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const artworkImages = sqliteTable('artwork_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  artwork_id: integer('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  media_id: integer('media_id').notNull().references(() => media.id),
  is_primary: integer('is_primary', { mode: 'boolean' }).default(false),
  order_index: integer('order_index').default(0)
});

// ============================================
// EXHIBITIONS
// ============================================

export const exhibitions = sqliteTable('exhibitions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title_en: text('title_en').notNull(),
  title_ru: text('title_ru').notNull(),
  title_es: text('title_es').notNull(),
  title_zh: text('title_zh').notNull(),
  description_en: text('description_en'),
  description_ru: text('description_ru'),
  description_es: text('description_es'),
  description_zh: text('description_zh'),
  venue: text('venue'),
  city: text('city'),
  country: text('country'),
  address: text('address'),
  start_date: text('start_date'),
  end_date: text('end_date'),
  opening_hours: text('opening_hours'),
  cover_image_id: integer('cover_image_id').references(() => media.id),
  gallery_link: text('gallery_link'),
  is_current: integer('is_current', { mode: 'boolean' }).default(false),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true),
  order_index: integer('order_index').default(0),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const exhibitionArtworks = sqliteTable('exhibition_artworks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  exhibition_id: integer('exhibition_id').notNull().references(() => exhibitions.id, { onDelete: 'cascade' }),
  artwork_id: integer('artwork_id').notNull().references(() => artworks.id),
  order_index: integer('order_index').default(0)
});

// ============================================
// PAGES (Static + Dynamic via Page Builder)
// ============================================

export const pages = sqliteTable('pages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  page_type: text('page_type').default('static'), // 'static', 'custom'
  template: text('template').default('default'), // 'default', 'full-width', 'sidebar'
  title_en: text('title_en').notNull(),
  title_ru: text('title_ru').notNull(),
  title_es: text('title_es').notNull(),
  title_zh: text('title_zh').notNull(),
  content_en: text('content_en'),
  content_ru: text('content_ru'),
  content_es: text('content_es'),
  content_zh: text('content_zh'),
  seo_title_en: text('seo_title_en'),
  seo_title_ru: text('seo_title_ru'),
  seo_title_es: text('seo_title_es'),
  seo_title_zh: text('seo_title_zh'),
  seo_description_en: text('seo_description_en'),
  seo_description_ru: text('seo_description_ru'),
  seo_description_es: text('seo_description_es'),
  seo_description_zh: text('seo_description_zh'),
  featured_image_id: integer('featured_image_id').references(() => media.id),
  is_published: integer('is_published', { mode: 'boolean' }).default(true),
  is_in_menu: integer('is_in_menu', { mode: 'boolean' }).default(false),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Page Blocks for Page Builder (NEW in v3.1)
export const pageBlocks = sqliteTable('page_blocks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  page_id: integer('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  block_type: text('block_type').notNull(), // 'text', 'image', 'gallery', 'video', 'html', 'quote'
  content_en: text('content_en'),
  content_ru: text('content_ru'),
  content_es: text('content_es'),
  content_zh: text('content_zh'),
  settings_json: text('settings_json'), // Block-specific settings
  media_id: integer('media_id').references(() => media.id),
  order_index: integer('order_index').default(0),
  is_visible: integer('is_visible', { mode: 'boolean' }).default(true)
});

// ============================================
// SETTINGS (Global)
// ============================================

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  type: text('type').default('string'),
  group: text('group').default('general')
});
```

---

## 📁 Финальная структура админ-панели

```
/(admin)/
├── +layout.svelte              # Sidebar + Header (СОХРАНИТЬ!)
├── +layout.server.ts           # Auth check (СОХРАНИТЬ!)
│
├── dashboard/                   # ✅ СОХРАНИТЬ
│   └── +page.svelte
│
├── login/                       # ✅ СОХРАНИТЬ
│   └── +page.svelte
│
├── users/                       # ✅ СОХРАНИТЬ
│   ├── +page.svelte
│   └── +page.server.ts
│
├── posts/                       # ✅ СОХРАНИТЬ
│   ├── +page.svelte
│   └── +page.server.ts
│
├── settings/                    # ✅ СОХРАНИТЬ
│   └── +page.svelte
│
├── media/                       # 🆕 NEW
│   ├── +page.svelte
│   ├── +page.server.ts
│   └── [id]/
│       └── +page.svelte
│
├── menu/                        # 🆕 NEW
│   ├── +page.svelte
│   └── +page.server.ts
│
├── footer/                      # 🆕 NEW
│   ├── +page.svelte
│   └── +page.server.ts
│
├── homepage/                    # 🆕 NEW
│   ├── +page.svelte             # Overview
│   ├── hero/
│   │   └── +page.svelte
│   ├── collections/
│   │   └── +page.svelte
│   ├── about/                   # NEW in v3.1
│   │   └── +page.svelte
│   ├── exhibitions/
│   │   └── +page.svelte
│   ├── news/                    # NEW in v3.1
│   │   └── +page.svelte
│   ├── testimonials/            # NEW in v3.1
│   │   └── +page.svelte
│   └── process/                 # NEW in v3.1
│       └── +page.svelte
│
├── works/                       # 🆕 NEW in v3.1
│   ├── +page.svelte             # Works page config
│   └── +page.server.ts
│
├── series/                      # 🆕 NEW
│   ├── +page.svelte
│   ├── +page.server.ts
│   ├── new/
│   │   └── +page.svelte
│   └── [id]/
│       └── +page.svelte
│
├── artworks/                    # 🆕 NEW
│   ├── +page.svelte
│   ├── +page.server.ts
│   ├── new/
│   │   └── +page.svelte
│   └── [id]/
│       └── +page.svelte
│
├── exhibitions/                 # 🆕 NEW
│   ├── +page.svelte
│   ├── +page.server.ts
│   ├── new/
│   │   └── +page.svelte
│   └── [id]/
│       └── +page.svelte
│
└── pages/                       # 🆕 NEW
    ├── +page.svelte             # List + Create New
    ├── +page.server.ts
    └── [slug]/
        └── +page.svelte         # Edit with blocks
```

---

## ⏱️ Общая оценка времени

| Фаза | Время | Зависимости |
|------|-------|-------------|
| Phase 0: Database | 2-3 часа | - |
| Phase 1: Media | 3-4 часа | Phase 0 |
| Phase 2: Layout | 2-3 часа | Phase 1 |
| Phase 3: Homepage | 4-5 часов | Phase 2 |
| Phase 4: Content | 5-6 часов | Phase 3 |
| Phase 5: Integration | 2-3 часа | Phase 4 |
| **ИТОГО** | **18-24 часа** | - |

**Рекомендуемое разбиение на сессии:**
- Сессия 1: Phase 0 + Phase 1 (5-7 часов)
- Сессия 2: Phase 2 + Phase 3 (6-8 часов)
- Сессия 3: Phase 4 (5-6 часов)
- Сессия 4: Phase 5 (2-3 часа)

---

## ✅ Success Criteria v3.1 (Финальные)

### Must Have (Обязательно)

- [ ] **Media Manager**: загрузка изображений работает
- [ ] **Menu CRUD**: навигация редактируется, Header обновляется
- [ ] **Footer CRUD**: бренд, соцсети, контакты редактируются
- [ ] **Homepage Hero**: тексты и слайды редактируются
- [ ] **Homepage Collections**: серии выбираются
- [ ] **Homepage About**: превью редактируется
- [ ] **Homepage Exhibition**: выставка выбирается
- [ ] **Homepage News**: новости редактируются
- [ ] **Homepage Testimonials**: отзывы редактируются
- [ ] **Homepage Process**: этапы редактируются
- [ ] **Works Page**: /works редактируется
- [ ] **Series CRUD**: коллекции создаются/редактируются
- [ ] **Artworks CRUD**: работы создаются с галереей
- [ ] **Exhibitions CRUD**: выставки создаются
- [ ] **Pages CRUD**: About, Contact, NFT редактируются
- [ ] **Page Builder**: новые страницы создаются
- [ ] **Мультиязычность**: табы EN/RU/ES/ZH в каждой форме
- [ ] **Сохранение существующих**: Dashboard, Users, Posts, Settings работают
- [ ] **Публичный сайт**: обновляется после сохранения

### Should Have (Желательно)

- [ ] Drag-drop сортировка элементов
- [ ] Preview перед публикацией
- [ ] WebP thumbnails автоматически
- [ ] Поиск в Media Library
- [ ] Валидация форм

### Nice to Have (Опционально)

- [ ] История изменений
- [ ] Bulk операции
- [ ] Import/Export JSON
- [ ] Роли и права

---

## 🔄 Rollback Strategy

### Если что-то пошло не так:

1. **БД недоступна** → Fallback на JSON (автоматически)
2. **Миграция сломала данные** → Восстановить из backup
3. **Новая админка не работает** → Git revert

### Backup перед началом:

```bash
# Дата для backup
DATE=$(date +%Y%m%d_%H%M%S)

# JSON data
cp -r data/ backup-$DATE/data/

# Database (если есть)
cp data/db/sqlite/*.db backup-$DATE/ 2>/dev/null || true

# Uploaded images
cp -r frontend-sveltekit/static/uploads/ backup-$DATE/uploads/ 2>/dev/null || true

echo "Backup created: backup-$DATE/"
```

---

## 📚 Зависимости для установки

```bash
cd frontend-sveltekit

# Image processing
npm install sharp

# UUID для имён файлов
npm install uuid
npm install -D @types/uuid

# Rich text editor (опционально для Page Builder)
npm install @tiptap/core @tiptap/starter-kit
```

---

**Status**: Ready for Execution (v3.1 FINAL)
**Audit Date**: 2025-12-21
**Estimated Time**: 18-24 hours (4 sessions)
**Complexity**: High
**Risk**: Medium

---

**Let's build a complete CMS! 🚀**
