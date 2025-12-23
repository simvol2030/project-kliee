# CLAUDE.local.md - Локальные особенности разработки

## 🚨 Критические проблемы и решения WSL2

### Проблема 1: File Watching зависает на WSL2 /mnt/c путях

**Симптомы:**
- `tsx watch src/index.ts` зависает после вывода "tsx watch src/index.ts"
- `react-router dev` зависает после вывода "react-router dev"
- Процесс работает, но сервер не стартует
- Порт не открывается, никаких ошибок не выводится

**Причина:**
WSL2 имеет критические проблемы с file watching на Windows файловых системах (`/mnt/c`, `/mnt/d` и т.д.). Инструменты с hot-reload (tsx watch, vite dev, webpack-dev-server) зависают из-за неэффективной работы inotify через FS bridge.

**Решение:**
```bash
# ❌ НЕ РАБОТАЕТ на WSL2 /mnt/c:
npm run dev              # tsx watch зависает
react-router dev         # vite dev зависает

# ✅ РАБОТАЕТ на WSL2 /mnt/c:

# Backend:
npx tsx src/index.ts     # Без watch режима

# Frontend:
npm run build            # Production build
npm start                # Production server
```

**Рекомендация для production-ready разработки:**
1. Используй production builds для финальных проверок
2. Для разработки с hot-reload - перенеси проект в WSL2 filesystem (`~/projects/`)
3. Или работай напрямую в Windows (не через WSL2)

---

### Проблема 2: Prisma Client генерация в monorepo структуре

**Изначальная ошибка:**
```
Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
```

**Причина:**
При генерации Prisma Client с `--schema=../prisma/schema.prisma`, клиент генерируется в `../node_modules/@prisma/client`, но код импортирует из локальных `./node_modules/@prisma/client`, где лежат только stub-файлы.

**❌ Неправильное решение (которое мы пробовали):**
```json
{
  "scripts": {
    "prisma:generate": "prisma generate --schema=../prisma/schema.prisma && cp -r ../node_modules/@prisma/client/* ./node_modules/@prisma/client/ && cp -r ../node_modules/.prisma ./node_modules/"
  }
}
```
Проблемы:
- Сложная команда с копированием
- Риск рассинхронизации
- Непонятная структура для других разработчиков

**✅ Правильное решение (применено в combo-2):**
Каждый проект (backend/frontend) имеет **собственную локальную копию** Prisma schema:

```
project-box-combo-1/
├── backend-hono/
│   ├── prisma/
│   │   └── schema.prisma          ← Локальная копия
│   └── src/
│       └── lib/
│           └── db.ts               ← Централизованный Prisma Client
├── frontend-remix/
│   ├── prisma/
│   │   └── schema.prisma          ← Локальная копия
│   └── app/
└── prisma/                         ← Root schema (для справки)
    └── schema.prisma
```

**package.json (упрощенный):**
```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  }
}
```

**src/lib/db.ts (централизованный Prisma Client):**
```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

**Использование в коде:**
```typescript
// ❌ НЕ ТАК:
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ✅ ТАК:
import { prisma } from './lib/db';
```

---

### Проблема 3: SQLite WAL mode конфигурация

**Стандартная конфигурация (медленная):**
```env
DATABASE_URL="file:../data/db/app.db"
```

**Production-ready конфигурация:**
```env
DATABASE_URL="file:../data/db/app.db?mode=rwc&journal_mode=WAL"
```

**Параметры:**
- `mode=rwc` - Read-Write-Create (создаёт БД если не существует)
- `journal_mode=WAL` - Write-Ahead Logging (concurrent reads во время writes)

**Преимущества WAL:**
- Concurrent reads при writes (важно для веб-приложений)
- Лучшая производительность (до 10x faster)
- Crash recovery
- Меньше file locks

**Применяй для всех проектов на SQLite!**

---

## 📋 Чеклист перед началом разработки нового проекта

### 1. Копирование заготовки
```bash
cp -r project-box-combo-1 my-new-project
cd my-new-project
```

### 2. Настройка Backend
```bash
cd backend-hono

# 1. Проверь prisma/schema.prisma (должен существовать локально)
ls -la prisma/schema.prisma

# 2. Установи зависимости
npm install

# 3. Сгенерируй Prisma Client
npx prisma generate

# 4. Примени миграции (создаст БД с WAL)
npx prisma migrate deploy

# 5. Запусти сервер (без watch на WSL2)
npx tsx src/index.ts

# Проверь: curl http://localhost:3001/health
```

### 3. Настройка Frontend
```bash
cd frontend-remix

# 1. Проверь prisma/schema.prisma (должен существовать локально)
ls -la prisma/schema.prisma

# 2. Установи зависимости
npm install

# 3. Сгенерируй Prisma Client
npx prisma generate

# 4. Собери production build
npm run build

# 5. Запусти production server
npm start

# Проверь: curl http://localhost:3000
```

### 4. Проверка в браузере
- Frontend: http://localhost:3000
- Backend Health: http://localhost:3001/health
- Backend API: http://localhost:3001/api/users

---

## 🛠 Работа с Prisma Schema

### Изменение схемы БД

**Правило:** Всегда синхронизируй schema между backend и frontend

```bash
# 1. Измени schema в backend-hono/prisma/schema.prisma
vim backend-hono/prisma/schema.prisma

# 2. Создай миграцию
cd backend-hono
npx prisma migrate dev --name add_new_field

# 3. Скопируй schema в frontend
cp backend-hono/prisma/schema.prisma frontend-remix/prisma/

# 4. Регенерируй Prisma Client в frontend
cd frontend-remix
npx prisma generate
```

### Добавление новой модели

Пример:
```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]   // Добавь relation
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

Затем:
```bash
npx prisma migrate dev --name add_posts
npx prisma generate
```

---

## 🚀 Production Deployment

### Переменные окружения

**Development (.env):**
```env
DATABASE_URL="file:../data/db/app.db?mode=rwc&journal_mode=WAL"
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

**Production (.env.production):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS="https://yourdomain.com"
```

### Переход на PostgreSQL

1. Обнови `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Было: sqlite
  url      = env("DATABASE_URL")
}
```

2. Пересоздай миграции:
```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

3. Обнови DATABASE_URL в .env

---

## 📝 Типичные ошибки и решения

### Ошибка: "prisma generate зависает"
**Причина:** WSL2 file system performance
**Решение:**
```bash
# Убей процесс и скопируй из рабочего проекта:
cp -r ../project-box-combo-2/backend-hono/node_modules/@prisma ./node_modules/
cp -r ../project-box-combo-2/backend-hono/node_modules/.prisma ./node_modules/
```

### Ошибка: "Port 3001 already in use"
**Решение:**
```bash
# Найди процесс
lsof -ti:3001

# Убей процесс
kill -9 $(lsof -ti:3001)
```

### Ошибка: "Database connection failed"
**Проверь:**
1. Существует ли `data/db/app.db`?
2. Применены ли миграции? `npx prisma migrate deploy`
3. Правильный ли DATABASE_URL в .env?

### Frontend не собирается
**Решение:**
```bash
# Очисти и пересобери
rm -rf build
rm -rf node_modules/.cache
npm run build
```

---

## 🎯 Best Practices для разработки

### 1. Git
Добавь в `.gitignore`:
```gitignore
# Database
data/
*.db
*.db-shm
*.db-wal

# Build outputs
build/
dist/
.react-router/

# Dependencies
node_modules/

# Environment
.env.local
.env.production
```

### 2. Структура проекта
```
my-app/
├── backend-hono/
│   ├── src/
│   │   ├── lib/
│   │   │   └── db.ts           ← Централизованный Prisma
│   │   ├── routes/             ← API routes
│   │   ├── middleware/         ← Middleware
│   │   └── index.ts            ← Entry point
│   ├── prisma/
│   │   ├── schema.prisma       ← Локальная schema
│   │   └── migrations/         ← Миграции
│   └── .env                    ← Локальный .env
├── frontend-remix/
│   ├── app/
│   │   ├── routes/             ← React Router routes
│   │   └── lib/                ← Utilities
│   ├── prisma/
│   │   └── schema.prisma       ← Локальная schema
│   └── .env                    ← Локальный .env
└── data/
    └── db/                     ← SQLite databases (git-ignored)
```

### 3. API Design
```typescript
// backend-hono/src/routes/posts.ts
import { Hono } from 'hono';
import { prisma } from '../lib/db';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const posts = new Hono();

// GET /api/posts
posts.get('/', async (c) => {
  const posts = await prisma.post.findMany({
    include: { author: true }
  });
  return c.json(posts);
});

// POST /api/posts
const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional(),
  authorId: z.number()
});

posts.post('/', zValidator('json', createPostSchema), async (c) => {
  const data = c.req.valid('json');
  const post = await prisma.post.create({ data });
  return c.json(post, 201);
});

export default posts;
```

### 4. Error Handling
```typescript
// backend-hono/src/middleware/errorHandler.ts
import { Context } from 'hono';

export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    return c.json({ error: 'Database error' }, 500);
  }

  return c.json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  }, 500);
};
```

---

## 📚 Полезные команды

### Prisma
```bash
# Открыть Prisma Studio (GUI для БД)
npx prisma studio

# Пересоздать БД с нуля
npx prisma migrate reset

# Применить миграции на production
npx prisma migrate deploy

# Проверка schema на ошибки
npx prisma validate

# Форматирование schema
npx prisma format
```

### Backend
```bash
# Development (без watch на WSL2)
npx tsx src/index.ts

# Production build
npm run build
npm start

# TypeScript проверка
npx tsc --noEmit
```

### Frontend
```bash
# Development build
npm run build
npm start

# TypeScript проверка
npm run typecheck

# Production build
npm run build
NODE_ENV=production npm start
```

---

## 🎓 Выводы из отладки

### Что работает на WSL2 /mnt/c:
✅ Production builds
✅ Static servers
✅ tsx без watch
✅ Prisma generate (медленно, но работает)
✅ npm install (медленно, но работает)

### Что НЕ работает на WSL2 /mnt/c:
❌ tsx watch
❌ react-router dev (vite dev)
❌ webpack-dev-server
❌ nodemon
❌ Любые file watchers

### Систематический подход при отладке:
1. Собери факты (проверь процессы, порты, логи)
2. Найди паттерн (изучи рабочую конфигурацию)
3. Примени решение (адаптируй рабочую конфигурацию)
4. Проверь результат (протестируй в браузере)

**НЕ делай хаотичные правки sed'ом - это приводит к новым багам!**

---

## 🔗 Ссылки

- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
- [Hono Documentation](https://hono.dev/)
- [React Router v7 Docs](https://reactrouter.com/docs)
- [WSL2 File System Performance](https://learn.microsoft.com/en-us/windows/wsl/filesystems)

---

**Этот документ создан на основе реального опыта отладки. Следуй этим рекомендациям, чтобы избежать тех же проблем!**

---

## 🔄 Workflow v4.0: Single Branch (main only)

**Дата обновления:** 2025-12-23

### ⚠️ КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ v4.0

**Убрана ветка `dev`!** Работаем только с `main`.

**Почему:**
- Ветка dev создавала путаницу и рассинхронизацию
- Один источник правды = меньше ошибок
- Упрощённый workflow

### Принцип разделения ролей

**👨‍💼 Moderator (Пользователь)**
- Ставит задачи
- Принимает решения
- Координирует процесс
- Обменивается фидбеками между агентами

**🤖 Developer (Claude Code Web)** = **Primary Developer**
- Пишет код в ветках `claude/*`
- Реализует фичи
- Исправляет баги (score 6+)
- Делает commits + push

**🔧 Integrator (Claude Code CLI)** = **Integration & Deployment Manager**
- SSH на production сервер
- Merge веток сразу на сервере в **main**
- npm run build + pm2 restart
- QA в браузере (playwright)
- Скоринг багов
- Создание feedback-vX.md
- Hot-fix на сервере → push в **main**
- Мелкие правки (score 0-5)

### 🌿 Структура веток (v4.0)

```
GitHub:
├── main              ← единственная постоянная ветка
└── claude/*          ← временные ветки Claude Web (удаляются после merge)

Сервер:
└── main              ← всегда на main

Локально (WSL):
└── main              ← синхронизировано с GitHub
```

**НЕТ ветки dev!**

### ⚡ Production-First подход

```
Claude Web → claude/* ветка → push
     ↓
CLI: SSH на сервер → merge в main → build → deploy
     ↓
QA на production
     ↓
[Hot-fix если нужен] → push в main
     ↓
Локально: git pull main (когда стабильно)
```

**Преимущества:**
- Быстрее на 5-10 минут каждый цикл
- Production = source of truth
- Нет рассинхронизации
- Меньше веток = меньше путаницы

**Локальный pull:**
- Делаем ТОЛЬКО когда версия стабильная
- `git pull origin main`

---

### 🧮 Скоринг-система для классификации задач

Используй эту систему для определения **кто должен делать задачу**.

#### Формула

```
Score = (Сложность × 3) + (Файлы × 2) + (Риск × 2) + (Время × 1)
```

#### Критерии оценки

| Критерий | Вес | Описание | Баллы |
|----------|-----|----------|-------|
| **Сложность** | x3 | 0 = Текст/опечатки<br>1 = Конфиги/пути<br>2 = CSS/простая логика<br>3 = Бизнес-логика/TypeScript | 0-3 |
| **Файлы** | x2 | 0 = 1 файл<br>1 = 2-3 файла<br>2 = 4-6 файлов<br>3 = 7+ файлов | 0-3 |
| **Риск** | x2 | 0 = Контент/стили/статика<br>1 = Компоненты/роуты<br>2 = БД/API/auth/core | 0-2 |
| **Время** | x1 | 0 = < 2 минут<br>1 = 2-10 минут<br>2 = > 10 минут | 0-2 |

#### Классификация

| Score | Кто делает | Действие |
|-------|------------|----------|
| **0-5** | CLI (я) | Делаю сам → коммичу в feedback ветку |
| **6-10** | Решаем ситуативно | Обсуждаем с пользователем |
| **11+** | Claude Code Web | Создаю задачу → отправляю Web |

#### Примеры расчета

**Пример 1: Опечатка в заголовке**
- Сложность: 0 × 3 = 0
- Файлы: 0 × 2 = 0
- Риск: 0 × 2 = 0
- Время: 0 × 1 = 0
- **Score: 0** → Я делаю сам ✅

**Пример 2: Изменить путь к изображению в ProductCard**
- Сложность: 1 × 3 = 3
- Файлы: 0 × 2 = 0
- Риск: 0 × 2 = 0
- Время: 0 × 1 = 0
- **Score: 3** → Я делаю сам ✅

**Пример 3: Исправить баг wishlist (не сохраняется в БД)**
- Сложность: 3 × 3 = 9
- Файлы: 1 × 2 = 2
- Риск: 2 × 2 = 4
- Время: 2 × 1 = 2
- **Score: 17** → Claude Code Web 🤖

**Пример 4: Изменить цвет кнопок в 5 компонентах**
- Сложность: 2 × 3 = 6
- Файлы: 2 × 2 = 4
- Риск: 0 × 2 = 0
- Время: 1 × 1 = 1
- **Score: 11** → Claude Code Web 🤖

---

### 📁 Директория Feedbacks

#### Концепция v3.0

Вместо одного `FEEDBACK.md` файла — **директория с нумерованными версиями**:

```
/feedbacks/
├── feedback-v1.md    ← Первый feedback (начальные баги)
├── feedback-v2.md    ← После первого фикса
├── feedback-v3.md    ← После второго фикса
└── ...               ← История накапливается
```

**Преимущества:**
- Видна история итераций
- Можно ссылаться на конкретную версию
- Не теряется контекст предыдущих проблем

#### Формат имени файла

```
feedback-v{номер}.md

Примеры:
- feedback-v1.md
- feedback-v2.md
- feedback-v3.md
```

#### Production-First Workflow (v4.0)

**Шаг 1: Claude Code Web завершает работу**

Ждём пока Claude Code Web:
- Сделает финальный commit
- Напишет сообщение "Готово для QA" или "Phase complete"
- Push в свою ветку `claude/task-name-xxx`

**Шаг 2: SSH на production и merge**

```bash
# SSH на production
ssh webmaster@myappbutik.ru
cd /opt/websites/k-liee.com

# Fetch и merge
git fetch origin
git merge origin/claude/task-name-xxx --no-ff -m "feat: merge [description]"
```

**Шаг 3: Build и Deploy**

```bash
cd frontend-sveltekit

# Install dependencies (если изменился package.json)
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm install

# Build (ОБЯЗАТЕЛЬНО проверяем перед restart!)
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm run build

# Только если build успешен:
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 restart k-liee-frontend

# Quick health check
curl -s https://k-liee.com/en | grep -q "K-LIÉE" && echo "✅ Site OK"
```

**Шаг 4: QA в браузере (playwright)**

```bash
# На локальной машине запускаем playwright
mcp__playwright__browser_navigate https://k-liee.com/en/shop
# Тестируем функционал, смотрим консоль
```

**Шаг 5: Создание feedback (если есть баги)**

```bash
# Создаём директорию feedbacks (если не существует)
mkdir -p /mnt/c/dev/project-kliee/project/project-box-combo-1/feedbacks

# Создаём новый feedback файл
# feedback-v1.md, feedback-v2.md, etc.
```

**Шаг 6: Push feedback и передача Claude Code Web**

```bash
cd /mnt/c/dev/project-kliee/project/project-box-combo-1
git add feedbacks/
git commit -m "qa: feedback-v1 - [краткое описание багов]"
git push origin main
```

**Шаг 7: Локальный pull (только когда стабильно!)**

```bash
# ТОЛЬКО когда версия стабильная и все баги исправлены
cd /mnt/c/dev/project-kliee/project/project-box-combo-1
git pull origin main
```

**Формат commit message:**
```
<type>: <описание> (score: X)

Примеры:
- fix: опечатка в About секции (score: 0)
- qa: feedback-v1 - 3 API bugs found
- feat: merge shop functionality from Claude Web
```

---

### 📋 Быстрая справка для CLI

#### Когда нашёл баг/правку после QA:

```bash
# 1. Оценить по скорингу
# Score = (Сложность × 3) + (Файлы × 2) + (Риск × 2) + (Время × 1)

# 2А. Если score 0-5 (делаю сам на сервере):
ssh webmaster@myappbutik.ru
cd /opt/websites/PROJECT
# [делаю правку]
git add . && git commit -m "fix: описание (score: X)"
git push origin main

# 2Б. Если score 6+ (передаю Claude Code Web):
# Создать feedbacks/feedback-vX.md с описанием проблемы
# Push в main
# Сообщить Claude Code Web

# 3. После правки всегда:
cd frontend-sveltekit
npm run build  # Проверка сборки
npm run check  # TypeScript проверка
pm2 restart APP-NAME
```

#### Hot-fix на сервере (Reverse Deploy):

```bash
# На сервере после hot-fix:
cd /opt/websites/PROJECT
git add .
git commit -m "fix: описание hot-fix"
git push origin main

# Локально (синхронизация):
git pull origin main
```

---

### 📄 Формат FEEDBACK.md для Claude Code Web

Создавай файл `FEEDBACK.md` когда передаёшь баги Claude Code Web:

```markdown
# Feedback после QA - k-liee.com Shop Page

**Deploy date:** 2025-12-21 14:30
**Environment:** Production (https://k-liee.com/en/shop)
**Branch tested:** main (merged from claude/shop-functionality-xxx)

---

## ✅ Что работает отлично:
1. Wishlist добавление/удаление
2. Cart добавление товаров
3. Icons видны на всех устройствах

---

## 🐛 Баги (требуют исправления):

### Bug 1: Cart counter не обновляется после добавления
**Score:** 12 (логика + несколько файлов)
**Priority:** HIGH
**Steps to reproduce:**
1. Открыть /en/shop
2. Добавить товар в корзину
3. Counter в хедере остается 0

**Expected:** Counter должен увеличиться на 1
**Actual:** Counter = 0

**Files involved:**
- src/routes/[lang=locale]/shop/+page.svelte:174
- src/lib/components/layout/Header.svelte

**Suggested fix:**
- Создать cart store (Svelte 5 runes)
- Обновлять store после API call
- Header слушает store

---

## 🎨 Мелкие правки (уже сделаны в main):

1. ✅ Опечатка "Prodcuts" → "Products" (score: 0)
   - File: src/routes/[lang=locale]/shop/+page.svelte:45
   - Commit: fix: typo in shop page title (score: 0)

**Эти правки уже в main. Перед началом работы:**
```bash
git pull origin main
```

---

## 📊 Summary:
- **Критичные баги:** 1 (Bug 1 - HIGH)
- **Мелкие правки:** 1 (уже в feedback branch)
```

---

### ✅ Что я ДЕЛАЮ (CLI Integrator):

1. **SSH на production** - работаю напрямую на сервере
2. **Merge веток** от Claude Code Web (сразу на сервере!)
3. **Build + Deploy** - npm run build, pm2 restart
4. **QA в браузере** (playwright) - тестирую на production
5. **Скоринг багов** - оцениваю по формуле
6. **Создание feedback-vX.md** - детальный отчёт для Claude Web
7. **Push feedbacks** в GitHub
8. **Мелкие правки (score 0-5)** - делаю сам, коммичу в main
9. **Контроль возможности отката** - слежу чтобы PM2 мог вернуться к рабочей версии
10. **Локальный pull** - ТОЛЬКО когда версия стабильная

### ❌ Что я НЕ ДЕЛАЮ (CLI Integrator):

1. ~~Локальное тестирование~~ - работаем сразу на production
2. Большие фичи/рефакторинг **(score 11+)** → Claude Code Web
3. Исправление сложных багов **(score 6+)** → Claude Code Web
4. Долгие исследования кодовой базы → Claude Code Web
5. Создание новых компонентов с нуля → Claude Code Web

---

### 🚀 Полный цикл (Production-First Workflow v4.0)

```mermaid
graph TD
    A[👨‍💼 Moderator: ставит задачу] --> B[🤖 Claude Web: разрабатывает в ветке]
    B --> C[🔧 CLI: SSH → merge на сервере]
    C --> D[🔧 CLI: npm run build]
    D --> E{Build OK?}
    E -->|❌ Fail| F[🔧 CLI: НЕ рестартим PM2, ищем причину]
    F --> B
    E -->|✅ Success| G[🔧 CLI: pm2 restart]
    G --> H[🔧 CLI: QA в playwright]
    H --> I{Баги?}
    I -->|Есть баги| J{Score?}
    J -->|0-5| K[🔧 CLI: fix сам, commit в main]
    J -->|6+| L[🔧 CLI: создаёт feedback-vX.md]
    L --> M[👨‍💼 Moderator: передаёт Claude Web]
    M --> B
    K --> H
    I -->|Всё ОК ✅| N[🔧 CLI: локальный pull когда стабильно]
    N --> O[✅ Цикл завершён]
    O --> A
```

### 📊 Визуальная схема ролей

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW v4.0 (main only)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👨‍💼 MODERATOR                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Ставит задачи                                         │   │
│  │ • Координирует процесс                                  │   │
│  │ • Передаёт feedbacks между агентами                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  🤖 DEVELOPER (Claude Web)     🔧 INTEGRATOR (CLI)             │
│  ┌────────────────────────┐   ┌────────────────────────────┐   │
│  │ • Код в ветке claude/* │   │ • SSH → merge в MAIN       │   │
│  │ • Фичи, баги (6+)      │   │ • Build + Deploy           │   │
│  │ • Commits + Push       │   │ • QA (playwright)          │   │
│  └────────────────────────┘   │ • Hot-fix → push MAIN      │   │
│            ▲                   │ • Скоринг багов            │   │
│            │                   │ • Мелкие правки (0-5)      │   │
│            │                   └────────────────────────────┘   │
│            │                              │                     │
│            └──────── feedbacks ◀──────────┘                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Ветки:                                                         │
│  ├── main           ← единственная постоянная ветка            │
│  └── claude/*       ← временные (удаляются после merge)        │
│                                                                 │
│  НЕТ ветки dev!                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 🧹 Очистка Git репозитория от изображений

Если git репо раздулось из-за изображений (проверка: `du -sh .git`):

**Симптомы:**
- `.git` папка > 50 МБ
- Push/pull занимает много времени
- GitHub показывает большой размер репо

**Решение - чистый старт:**

```bash
# 1. На GitHub: переименовать старый репо → project-OLD
# 2. На GitHub: создать новый пустой репо с тем же именем

# 3. На сервере:
cd /opt/websites/PROJECT
rm -rf .git
git init
git add .
git commit -m "Clean start"
git remote add origin git@github.com:USER/PROJECT.git
git branch -M main
git push -u origin main

# 4. Локально:
rm -rf project-folder
git clone git@github.com:USER/PROJECT.git project-folder
```

**Важно:**
- Убедиться что `.gitignore` содержит `*.jpg`, `*.png`, `static-images/`
- Изображения хранить в отдельной папке (не в git)
- Deploy key нужно перенести на новый репо

---

**Последнее обновление:** 2025-12-23 (Workflow v4.0 - Single Branch)
