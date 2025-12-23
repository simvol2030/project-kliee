# CLAUDE.md - Управление контекстом проекта K-LIÉE

**Дата создания:** 2025-10-25
**Последнее обновление:** 2025-12-22
**Версия:** 4.0
**Статус:** CMS Admin + Shop Development

---

## 🎯 Обзор проекта

Миграция статического многоязычного сайта-портфолио художника Светланы К-Лие на современный full-stack SvelteKit с админкой.

**Откуда:** Статический HTML/CSS/JS сайт
**Куда:** SvelteKit + Drizzle ORM + CMS Admin Panel

---

## 🗂️ Пути проекта

### ⚠️ КРИТИЧЕСКИ ВАЖНО: Актуальные пути (WSL native)

Проект перенесён в WSL native filesystem для производительности!

| Среда | Путь |
|-------|------|
| **Локально (WSL)** | `/home/solo18/dev/project-kliee/project/project-box-combo-1/` |
| **Production сервер** | `/opt/websites/k-liee.com/` |
| **GitHub** | `https://github.com/simvol2030/project-kliee.git` |

### Детальные локальные пути (WSL):

```
/home/solo18/dev/project-kliee/project/project-box-combo-1/  # ← Git repo root
├── CLAUDE.md                    # Инструкции проекта
├── CLAUDE.local.md              # Workflow v4.2 (Single Branch)
├── feedbacks/                   # QA feedback файлы
├── frontend-sveltekit/          # SvelteKit приложение
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/
│   │   │   ├── stores/          # Svelte 5 stores (cart, wishlist)
│   │   │   └── server/db/       # Drizzle ORM schema
│   │   └── routes/
│   │       ├── (admin)/         # CMS Admin Panel
│   │       ├── api/             # API endpoints
│   │       └── [lang]/          # Public site (EN/RU/ES/ZH)
│   └── static/uploads/          # Uploaded media (in .gitignore)
├── backend-expressjs/           # Express.js API (optional)
└── data/db/sqlite/app.db        # SQLite Database
```

### Production сервер:

```
/opt/websites/k-liee.com/
├── frontend-sveltekit/
│   ├── build/                   # Production build
│   ├── src/                     # Source (для hot-fixes)
│   └── static/uploads/          # Media files
├── data/db/sqlite/app.db        # Production DB
└── ecosystem.config.js          # PM2 config
```

### SSH доступ:
```bash
ssh webmaster@myappbutik.ru
# Node.js: /home/webmaster/.nvm/versions/node/v22.15.0/bin/
```

---

## 🔀 Git Branching Strategy (Single Branch)

### Ветки

| Ветка | Назначение | Кто пушит |
|-------|------------|-----------|
| `main` | Единственная постоянная ветка | CLI, Server |
| `claude/*` | Временные ветки для фич | Claude Code Web |

**НЕТ ветки `dev`!** Работаем напрямую с `main`.

### Workflow диаграмма

```
Claude Code Web (разработка)
        │
        ▼
    claude/* ветка
    (commit + push)
        │
        ▼
    ┌───────────────┐
    │  CLI: merge   │──► сразу в main
    └───────────────┘
        │
        ▼
    Deploy на production
    (git pull → build → pm2 restart)
        │
        ▼
    QA на production
        │
    ┌───┴───┐
    │       │
   Баги?   OK ✅
    │
    ▼
  Hot-fix → push main
```

### Команды

```bash
# Посмотреть все ветки
git branch -a

# Merge ветки Claude Web в main
git fetch origin
git merge origin/claude/feature-name --no-ff -m "feat: description"
git push origin main

# Hot-fix на сервере
git add . && git commit -m "fix: description"
git push origin main
```

---

## 🔄 Production-First Workflow (v4.0 Single Branch)

### Роли

| Роль | Агент | Ответственность |
|------|-------|-----------------|
| **Moderator** | Пользователь | Задачи, решения, координация |
| **Developer** | Claude Code Web | Код, фичи, баги (score 6+) |
| **Integrator** | Claude Code CLI | SSH, merge в main, deploy, QA, hot-fix (0-5) |

### Цикл разработки

```
1. Moderator    → Ставит задачу
2. Developer    → Код в ветке claude/*, commit, push
3. Integrator   → SSH на сервер, merge в main
4. Integrator   → Build + Deploy (pm2 restart)
5. Integrator   → QA на production
6. Integrator   → Hot-fix если нужен → push main
7. Integrator   → Если баги score 6+ → feedback → Developer
8. [Повтор 2-7 пока не OK]
```

### Скоринг задач

**Формула:** `Score = (Сложность × 3) + (Файлы × 2) + (Риск × 2) + (Время × 1)`

| Score | Кто делает |
|-------|------------|
| 0-5 | CLI делает сам |
| 6-10 | Обсуждаем |
| 11+ | Claude Code Web |

---

## 🚀 Deploy Commands

### Полный деплой с нуля

```bash
# 1. SSH на сервер
ssh webmaster@myappbutik.ru

# 2. Перейти в проект
cd /opt/websites/k-liee.com

# 3. Pull изменений
git pull origin main

# 4. Установить зависимости
cd frontend-sveltekit
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm install

# 5. Применить миграции БД
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npx drizzle-kit push

# 6. Build
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm run build

# 7. Restart PM2
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 restart k-liee-frontend

# 8. Проверка
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 logs k-liee-frontend --lines 30
```

### Quick deploy (только код, без зависимостей)

```bash
ssh webmaster@myappbutik.ru
cd /opt/websites/k-liee.com
git pull origin main
cd frontend-sveltekit
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm run build
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 restart k-liee-frontend
```

### Мониторинг

```bash
# PM2 статус
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 list

# Логи в реальном времени
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 logs k-liee-frontend

# Размер БД
ls -lh /opt/websites/k-liee.com/data/db/sqlite/app.db
```

---

## 🛠️ Локальная разработка

### Запуск

```bash
cd /home/solo18/dev/project-kliee/project/project-box-combo-1/frontend-sveltekit

# Dev server
npm run dev

# TypeScript check
npm run check

# Build
npm run build

# Drizzle Studio (GUI для БД)
npm run db:studio
```

### Проверка изменений перед push

```bash
# 1. TypeScript без ошибок
npm run check

# 2. Build проходит
npm run build

# 3. Git status чистый (или осознанные изменения)
git status
```

---

## 📊 Текущий статус проекта

### ✅ Завершено:
- База данных (25+ таблиц через Drizzle ORM)
- Layout components (Header, Footer, MobileMenu)
- CMS Admin Panel (Dashboard, Media, Layout, Homepage, Content)
- Темизация (light/dark с mode-watcher)
- i18n (EN/RU/ES/ZH через paraglide)
- Cart API с cookie-based sessions
- Cart store (Svelte 5 runes)

### 🚧 В работе:
- Shop functionality (cart, wishlist, checkout)
- feedback-v3: Cart images, Checkout flow, Admin fixes

### 📅 Следующие задачи:
- Checkout flow (Bug 2 в feedback-v3)
- Order management
- Payment integration

---

## 🛠️ Tech Stack

### Frontend:
- **SvelteKit 2.x** + **Svelte 5** (runes: $state, $derived, $effect)
- **TypeScript**
- **mode-watcher** - темизация
- **paraglide-sveltekit** - i18n

### Backend:
- **Drizzle ORM** - Type-safe ORM
- **SQLite** - Database
- **Better-SQLite3** - Sync driver

### DevOps:
- **PM2** - Process manager
- **Nginx** - Reverse proxy
- **SSH-MCP** - Remote deployment
- **GitHub MCP** - Repository operations

---

## 📝 Changelog

### 2025-12-23 - Single Branch Workflow v4.2
- ✅ **Убрана ветка `dev`** - работаем только с `main`
- ✅ Очищен git репозиторий от изображений (240MB → 5MB)
- ✅ Создан новый чистый репозиторий на GitHub
- ✅ Исправлены изображения: NFT, Exhibitions, Shop
- ✅ Обновлён workflow: main + временные claude/*
- 📝 Статус: Single Branch Ready

### 2025-12-22 - WSL Native Migration
- ✅ Перенесён проект в WSL native filesystem
- ✅ Обновлены пути: `/mnt/c/dev/` → `/home/solo18/dev/`
- ✅ Синхронизированы изменения с сервера (artwork_id type fix)

### 2025-12-21 - Workflow v3.0
- ✅ Добавлен Production-First подход
- ✅ Скоринг система для классификации задач
- ✅ Роли: Moderator, Developer, Integrator

---

## ⚠️ Важные замечания

### Типы artwork_id
В cart системе `artwork_id` имеет тип `text` (не integer):
- `schema.ts`: `artwork_id: text('artwork_id')`
- `cart.svelte.ts`: `addItem(artworkId: string)`
- `+server.ts`: `artwork_id: string` в интерфейсах

---

## 🔄 Hot-fix на сервере (Server → GitHub main)

**Настроено:** 2025-12-23

Сервер имеет полноценный git repo с SSH ключом для push в GitHub.

### Hot-fix workflow:
```bash
# На сервере (SSH)
cd /opt/websites/k-liee.com

# 1. Внести исправления
vim frontend-sveltekit/src/...

# 2. Commit и push в main
git add .
git commit -m "fix: описание"
git push origin main

# 3. Rebuild если нужно
cd frontend-sveltekit
npm run build && pm2 restart k-liee-frontend
```

### Локальная синхронизация:
```bash
# Локально (WSL) - когда нужна актуальная версия
cd /home/solo18/dev/project-kliee/project/project-box-combo-1
git pull origin main
```

### Схема:
```
Production (сервер)
       ↓ hot-fix → push main
GitHub (main branch)
       ↓ git pull (когда нужно)
Локальный репо (main)
```

---

**Последнее обновление:** 2025-12-23
**Версия документа:** 4.2
**Статус проекта:** Shop Development (Single Branch)

---

**Удачи в разработке!** 🚀
