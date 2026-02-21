# Spec-final: Changes-3 — Admin Sidebar Restructure

**Дата:** 2026-02-21
**Score:** 8
**Кто делает:** Developer (Claude Code Web)
**Ветка:** `claude/session-4-sidebar`

---

## Проблема

Текущий порядок секций в сайдбаре нелогичный:
- Blog спрятан в конце Content-секции
- Homepage находится в Layout-секции (не очевидно)
- Media Settings отдельно от Media (лишний пункт)
- Shop, Chatbot секции занимают слишком много места в навигации

## Текущая структура

```
Dashboard
── Content ──
  Media
  Media Settings    ← отдельно, не логично
  Artworks
  Series
  Exhibitions
  NFT
  About
  Contact
  Blog              ← в конце Content
── Layout ──
  Menu
  Footer
  Homepage          ← Homepage в Layout?
── Shop ──
  Products
  Orders
  Shop Settings
── Chatbot ──
  Settings
  FAQ
  History
── System ──
  Users
  Settings
```

## Новая структура

```
Dashboard
── Content ──
  Artworks
  Series
  Exhibitions
  NFT
  Blog              ← ближе к контенту
  About
  Contact
── Media ──
  Media Library     (переименовать из "Media")
  Media Settings
── Pages ──          (переименовать из "Layout")
  Homepage          ← Homepage перемещена сюда
  Menu
  Footer
── Shop ──
  Products
  Orders
  Shop Settings
── Chatbot ──
  Settings
  FAQ
  History
── System ──
  Users
  Settings
```

---

## Файл для изменения

```
frontend-sveltekit/src/routes/(admin)/+layout@.svelte
```

Вся логика навигации — в `<nav class="sidebar-nav">` (строки ~59-156).

---

## Конкретные изменения

### 1. Переименовать секцию "Content"

```svelte
<!-- Было: -->
<p class="nav-section">Content</p>

<!-- Остаётся Content, но порядок меняется: -->
<p class="nav-section">Content</p>
<a href="/artworks" ...>Artworks</a>
<a href="/series" ...>Series</a>
<a href="/exhibitions" ...>Exhibitions</a>
<a href="/nft" ...>NFT</a>
<a href="/blog" ...>Blog</a>        ← перемещён выше
<a href="/about" ...>About</a>
<a href="/contact" ...>Contact</a>
```

### 2. Создать секцию "Media" (выделить из Content)

```svelte
<p class="nav-section">Media</p>
<a href="/media" ...>
  <span class="icon">📷</span>
  <span>Media Library</span>        ← переименовать
</a>
<a href="/media/settings" ...>
  <span class="icon">🖼️</span>
  <span>Media Settings</span>
</a>
```

### 3. Переименовать "Layout" → "Pages"

```svelte
<!-- Было: -->
<p class="nav-section">Layout</p>
<a href="/layout/menu" ...>Menu</a>
<a href="/layout/footer" ...>Footer</a>
<a href="/homepage" ...>Homepage</a>

<!-- Стало: -->
<p class="nav-section">Pages</p>
<a href="/homepage" ...>            ← Homepage первым
  <span class="icon">🏠</span>
  <span>Homepage</span>
</a>
<a href="/layout/menu" ...>
  <span class="icon">🔗</span>
  <span>Menu</span>
</a>
<a href="/layout/footer" ...>
  <span class="icon">📑</span>
  <span>Footer</span>
</a>
```

---

## ASCII-макет нового сайдбара

```
┌────────────────────┐
│  Admin Panel       │
│  super-admin       │
├────────────────────┤
│  📊 Dashboard      │
├────────────────────┤
│  — CONTENT —       │
│  🖼️ Artworks       │
│  📚 Series         │
│  🏛️ Exhibitions    │
│  💎 NFT            │
│  ✍️ Blog           │
│  👤 About          │
│  📧 Contact        │
├────────────────────┤
│  — MEDIA —         │
│  📷 Media Library  │
│  🖼️ Media Settings │
├────────────────────┤
│  — PAGES —         │
│  🏠 Homepage       │
│  🔗 Menu           │
│  📑 Footer         │
├────────────────────┤
│  — SHOP —          │
│  🛍️ Products       │
│  🛒 Orders         │
│  💰 Shop Settings  │
├────────────────────┤
│  — CHATBOT —       │
│  🤖 Settings       │
│  📚 FAQ            │
│  💬 History        │
├────────────────────┤
│  — SYSTEM —        │
│  👥 Users          │
│  ⚙️ Settings       │
├────────────────────┤
│  [user name]       │
│  [user email]      │
│  [Logout]          │
└────────────────────┘
```

---

## Что НЕ меняем

- Все href-ссылки остаются теми же (только порядок меняется)
- CSS стили сайдбара не трогаем
- `active` detection логика (`class:active`) не меняется
- Роль-зависимые элементы (`super-admin`) сохраняются

---

## Критерии приёмки

- [ ] Dashboard — первый пункт
- [ ] Content: Artworks, Series, Exhibitions, NFT, Blog, About, Contact (в таком порядке)
- [ ] Media (отдельная секция): Media Library, Media Settings
- [ ] Pages (бывший Layout): Homepage, Menu, Footer
- [ ] Shop: Products, Orders, Shop Settings
- [ ] Chatbot: Settings, FAQ, History
- [ ] System: Users, Settings (только для super-admin)
- [ ] Все ссылки кликабельны и ведут на правильные страницы
- [ ] Active-состояние подсвечивает правильный пункт
