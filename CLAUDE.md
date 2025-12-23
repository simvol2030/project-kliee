# CLAUDE.md - Управление контекстом проекта K-LIÉE

**Дата создания:** 2025-10-25
**Последнее обновление:** 2025-12-21
**Версия:** 3.0
**Статус:** CMS Admin Development

---

## 🎯 Обзор проекта

Миграция статического многоязычного сайта-портфолио художника Светланы К-Лие на современный full-stack SvelteKit с админкой, темизацией, и продвинутым SEO.

**Откуда:** Статический HTML/CSS/JS → **Куда:** SvelteKit + Drizzle ORM + Admin CMS

---

## 🗂️ Пути проекта (WSL)

**КРИТИЧЕСКИ ВАЖНО:** Проект находится в WSL окружении. Используй только эти пути:

### Рабочая директория:
```
/mnt/c/dev/project-kliee/project/project-box-combo-1/
```

### Git репозиторий:
- **Remote:** https://github.com/simvol2030/project-kliee.git
- **Local:** /mnt/c/dev/project-kliee/project/project-box-combo-1/.git

### Ключевые пути:
- **Frontend:** `/mnt/c/dev/project-kliee/project/project-box-combo-1/frontend-sveltekit/`
- **Backend:** `/mnt/c/dev/project-kliee/project/project-box-combo-1/backend-expressjs/`
- **Database:** `/mnt/c/dev/project-kliee/project/project-box-combo-1/data/db/sqlite/app.db`
- **Production:** `/opt/websites/k-liee.com` (SSH: webmaster@myappbutik.ru)

---

## 🔄 Workflow: Приём работы от Claude Code Web

### Обзор процесса

Claude Code Web реализует функционал в отдельной ветке. Твоя задача - интегрировать, протестировать и задеплоить.

### Workflow (10 шагов)

#### 1. Предварительное ознакомление

```bash
cd /mnt/c/dev/project-kliee/project/project-box-combo-1
git fetch origin

# Проверь commits в ветке
git log origin/claude/continue-previous-session-q6c54 --oneline -10

# Изучи изменения
git diff main origin/claude/continue-previous-session-q6c54 --stat
```

**Цель:** Понять объём работы и готовность к merge

---

#### 2. Дождаться завершения работы Claude Code Web

**Признаки завершения:**
- Финальный коммит с сообщением вида "Phase 5 complete" или "Integration & Testing"
- Claude Code Web явно сообщает о завершении работы
- Нет open issues или TODO в коммитах

**Действие:** НЕ мержить до явного подтверждения

---

#### 3. Merge в main

```bash
git checkout main
git pull origin main

# Merge с сохранением истории
git merge origin/claude/continue-previous-session-q6c54 --no-ff -m "feat: merge CMS admin panel implementation"

# Проверь конфликты
git status

# Если конфликты - разреши их и закоммить
git add .
git commit -m "fix: resolve merge conflicts"
```

**Проверка:** `git log --oneline -5` должен показать merge commit

---

#### 4. Pull локально и установка зависимостей

```bash
cd frontend-sveltekit

# Установи новые зависимости (если добавлялись)
npm install

# Проверь миграции БД
ls -la drizzle/migrations/

# Примени миграции
npx drizzle-kit push

# Проверь структуру БД
npx drizzle-kit studio
```

**Проверка:** База данных содержит все новые таблицы

---

#### 5. Проверка в браузере (локально)

##### 5.1. Запуск dev server

```bash
npm run dev
```

Открой: `http://localhost:5173`

##### 5.2. Проверка админки

Открой: `http://localhost:5173/login`

**Dashboard (`/dashboard`):**
- [ ] Статистика отображается (количество работ, серий, выставок)
- [ ] Быстрые действия работают
- [ ] График/метрики загружаются

**Layout → Menu (`/layout/menu`):**
- [ ] Список пунктов меню отображается
- [ ] CRUD операции: Create - можно добавить новый пункт
- [ ] CRUD операции: Update - можно редактировать
- [ ] CRUD операции: Delete - можно удалить
- [ ] Multilingual поля (EN/RU/ES/ZH) сохраняются

**Layout → Footer (`/layout/footer`):**
- [ ] Brand info редактируется (название, слоган)
- [ ] Social links редактируются (иконки, URL)
- [ ] Contact info редактируется (email, телефон)
- [ ] Сохранение обновляет БД

**Homepage Sections (`/homepage/*`):**
- [ ] Hero секция - загрузка изображения, текст на 4 языках
- [ ] About секция - биография, фото
- [ ] News секция - добавление/редактирование новостей
- [ ] Testimonials - отзывы клиентов
- [ ] Process - этапы работы

**Media Library (`/media`):**
- [ ] Upload изображений работает
- [ ] Thumbnails генерируются
- [ ] Поиск/фильтр работает
- [ ] Удаление изображений работает

**Series (`/series`):**
- [ ] Список серий отображается
- [ ] Создание новой серии (мультиязычные поля)
- [ ] Редактирование серии
- [ ] Удаление серии
- [ ] Привязка работ к серии

**Artworks (`/artworks`):**
- [ ] Каталог работ отображается
- [ ] Создание новой работы (multilingual title, description)
- [ ] Upload изображения через MediaPicker
- [ ] Редактирование работы
- [ ] Удаление работы
- [ ] Фильтр по серии/статусу

**Exhibitions (`/exhibitions`):**
- [ ] Список выставок
- [ ] Создание выставки (даты, место, описание)
- [ ] Редактирование выставки
- [ ] Удаление выставки
- [ ] Привязка работ к выставке

**Pages (`/pages`):**
- [ ] Page Builder работает
- [ ] Drag-and-drop блоков
- [ ] Редактирование контента блоков
- [ ] Предпросмотр страницы
- [ ] Публикация/снятие с публикации

##### 5.3. Проверка публичного сайта

Открой: `http://localhost:5173/en`

**Header:**
- [ ] Меню загружается из БД (проверь, что изменения в админке отражаются)
- [ ] Язык переключается (EN → RU → ES → ZH)
- [ ] Тема переключается (Light ↔ Dark)
- [ ] Mobile menu работает

**Footer:**
- [ ] Контент загружается из БД
- [ ] Social links работают
- [ ] Contact info отображается

**Homepage:**
- [ ] Hero секция загружается из БД
- [ ] About секция загружается из БД
- [ ] Featured Works отображаются
- [ ] Все секции responsive (проверь на 375px, 768px, 1920px)

**Темы:**
- [ ] Light theme - все элементы читаемы
- [ ] Dark theme - все элементы читаемы
- [ ] Переключение сохраняется (localStorage)

**Языки (EN/RU/ES/ZH):**
- [ ] Контент на каждом языке корректный
- [ ] URL меняется правильно (/en, /ru, /es, /zh)
- [ ] Fallback на EN если перевод отсутствует

##### 5.4. TypeScript проверка

```bash
npm run check
```

**Ожидается:** `0 errors`

**Если есть ошибки:**
- Прочитай каждую ошибку внимательно
- Исправь в соответствующем файле
- Перезапусти `npm run check`

---

#### 6. Фиксация багов и недоработок

**Создай список:**

```markdown
## Bugs Found (Local Testing - 2025-12-21)

### CRITICAL
- [ ] Админка: MediaPicker не сохраняет выбранное изображение
- [ ] Публичный сайт: Footer не обновляется после изменений в админке

### HIGH
- [ ] Админка: Series CRUD - ошибка при удалении (foreign key constraint)
- [ ] Публичный сайт: Mobile menu не закрывается на клик вне меню

### MEDIUM
- [ ] Админка: Dashboard статистика показывает неверные цифры
- [ ] Публичный сайт: Dark theme - текст плохо виден на некоторых секциях

### LOW
- [ ] Админка: Форма редактирования - отсутствует индикация загрузки
- [ ] Публичный сайт: Анимации не плавные на слабых устройствах
```

**Исправляй немедленно:**
- CRITICAL и HIGH баги - обязательно исправить перед деплоем
- MEDIUM и LOW - можно исправить в следующей итерации

**После исправления каждого бага:**
```bash
git add .
git commit -m "fix: [описание бага]"
```

**Критерий готовности к деплою:**
- [ ] TypeScript: 0 errors (`npm run check`)
- [ ] Консоль: 0 критических ошибок
- [ ] CRUD операции сохраняют в БД
- [ ] Админка → Публичный сайт интеграция работает
- [ ] Все CRITICAL и HIGH баги исправлены

---

#### 7. Commit, Push, Deploy на Production

##### 7.1. Финальный commit и push

```bash
# Убедись что все изменения закоммичены
git status

# Если есть незакоммиченные изменения
git add .
git commit -m "feat: CMS admin panel complete - all phases tested and verified"

# Push в main
git push origin main
```

##### 7.2. SSH на production сервер

```bash
ssh webmaster@myappbutik.ru
```

##### 7.3. Deploy на сервере

```bash
cd /opt/websites/k-liee.com

# Pull последних изменений
git pull origin main

# Перейди в frontend
cd frontend-sveltekit

# Установи зависимости (если package.json изменился)
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm install

# Примени миграции БД
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npx drizzle-kit push

# Проверь, что миграции применились
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npx drizzle-kit studio
# (Ctrl+C для выхода из Studio)

# Build для production
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm run build

# Проверь, что build прошёл успешно
ls -la build/

# Перезапусти PM2
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 restart k-liee-frontend

# Проверь статус PM2
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 list
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 logs k-liee-frontend --lines 50
```

**Проверка:** PM2 показывает статус "online", логи без ошибок

---

#### 8. Проверка на production сервере

##### 8.1. Проверка публичного сайта

Открой: `https://k-liee.com/en`

**Header:**
- [ ] Меню загружается из БД
- [ ] Язык переключается
- [ ] Тема переключается
- [ ] Mobile menu работает

**Homepage:**
- [ ] Все секции отображаются
- [ ] Изображения загружаются
- [ ] Контент на всех языках корректный

**Performance:**
- [ ] First Contentful Paint < 2s
- [ ] No console errors
- [ ] No visual glitches

##### 8.2. Проверка админки

Открой: `https://k-liee.com/login`

**Login:**
- [ ] Форма логина работает
- [ ] Аутентификация работает
- [ ] Редирект на dashboard после логина

**Dashboard:**
- [ ] Статистика загружается
- [ ] Быстрые действия работают

**CRUD операции:**
Проверь хотя бы одну секцию (например, Menu):
- [ ] Create - добавление нового пункта меню
- [ ] Read - список отображается
- [ ] Update - редактирование работает
- [ ] Delete - удаление работает
- [ ] Изменения отражаются на публичном сайте

##### 8.3. Security check

```bash
# На сервере проверь права доступа к БД
ls -la /opt/websites/k-liee.com/data/db/sqlite/

# Проверь, что .env не доступен публично
curl https://k-liee.com/.env
# Ожидается: 404 Not Found

# Проверь HTTPS
curl -I https://k-liee.com
# Ожидается: HTTP/2 200, Strict-Transport-Security header
```

---

#### 9. Отладка (если что-то не работает)

##### 9.1. БД не обновляется

**Проблема:** Изменения в админке не сохраняются

**Решение:**
```bash
# Проверь DATABASE_URL в .env
cat /opt/websites/k-liee.com/frontend-sveltekit/.env

# Проверь права на БД
ls -la /opt/websites/k-liee.com/data/db/sqlite/app.db

# Проверь, что миграции применились
cd /opt/websites/k-liee.com/frontend-sveltekit
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npx drizzle-kit studio

# Если миграции не применились - примени вручную
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npx drizzle-kit push --force
```

##### 9.2. PM2 не перезапускается

**Проблема:** `pm2 restart` не применяет изменения

**Решение:**
```bash
# Останови процесс
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 stop k-liee-frontend

# Удали из PM2
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 delete k-liee-frontend

# Запусти заново из ecosystem.config.js
cd /opt/websites/k-liee.com/frontend-sveltekit
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 start ecosystem.config.js

# Сохрани конфигурацию
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 save

# Проверь статус
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 list
```

##### 9.3. Build fails

**Проблема:** `npm run build` выдаёт ошибки

**Решение:**
```bash
# Очисти кэш
rm -rf .svelte-kit
rm -rf build
rm -rf node_modules/.cache

# Переустанови зависимости
rm -rf node_modules
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm install

# Попробуй собрать снова
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm run build

# Проверь логи на ошибки TypeScript
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm run check
```

##### 9.4. 500 Internal Server Error

**Проблема:** Публичный сайт отдаёт 500 ошибку

**Решение:**
```bash
# Проверь логи PM2
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 logs k-liee-frontend --lines 100

# Проверь логи nginx
sudo tail -f /var/log/nginx/error.log

# Проверь, что БД доступна
ls -la /opt/websites/k-liee.com/data/db/sqlite/app.db

# Проверь переменные окружения
cat /opt/websites/k-liee.com/frontend-sveltekit/.env
```

##### 9.5. Rollback (если всё сломалось)

**Критическая ситуация:** Production не работает, нужен откат

```bash
# Найди последний рабочий commit
git log --oneline -10

# Откатись на него
git checkout <commit-hash>

# Собери и перезапусти
cd frontend-sveltekit
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm run build
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 restart k-liee-frontend
```

---

#### 10. Финальная проверка и документация

##### 10.1. Smoke test

**Публичный сайт:**
- [ ] Открывается https://k-liee.com
- [ ] Header/Footer загружаются
- [ ] Язык переключается
- [ ] Тема переключается
- [ ] Все страницы доступны

**Админка:**
- [ ] Логин работает
- [ ] Dashboard загружается
- [ ] CRUD операции работают
- [ ] Изменения отражаются на публичном сайте

##### 10.2. Обновление документации

Зафиксируй выполненную работу:

```bash
# Локально обнови CHANGELOG.md
vim CHANGELOG.md
```

Добавь запись:
```markdown
## [1.2.0] - 2025-12-21

### Added
- CMS Admin Panel (5 phases)
  - Media Manager - upload, thumbnails, library
  - Layout Admin - Menu, Footer management
  - Homepage Admin - 5 sections (Hero, About, News, Testimonials, Process)
  - Content Admin - Series, Artworks, Exhibitions, Pages
  - Integration & Testing - Dashboard, MediaPicker, LanguageTabs

### Database
- 25 new tables created (media, menu_items, footer_*, homepage_*, series, artworks, exhibitions, pages)

### Dependencies
- sharp - image processing
- @types/pg - PostgreSQL types
- uuid - unique identifiers

### Fixed
- [Список багов, которые ты исправил]

### Performance
- [Если были улучшения производительности]
```

```bash
git add CHANGELOG.md
git commit -m "docs: update changelog for CMS admin v1.2.0"
git push origin main
```

##### 10.3. Отчёт

Напиши краткий отчёт:

```markdown
## CMS Admin Panel - Deployment Report (2025-12-21)

### Status: ✅ Successfully Deployed

### Implementation Summary:
- Branch: claude/continue-previous-session-q6c54
- Commits: 7 (Phase 0 → Phase 5)
- Database: 25 new tables
- Features: Media Manager, Layout Admin, Homepage Admin, Content Admin

### Testing Results:

**Local Testing:**
- TypeScript: 0 errors
- Console: 0 critical errors
- CRUD: All operations work
- Admin → Public integration: ✅ Working

**Production Testing:**
- Public Site: ✅ All pages load
- Admin Panel: ✅ Login, Dashboard, CRUD work
- Performance: FCP < 2s, no errors
- Security: HTTPS, .env protected

### Bugs Fixed:
1. [Список багов с номерами коммитов]

### Known Issues:
1. [Если остались MEDIUM/LOW баги]

### Next Steps:
1. Monitor production logs for 24h
2. User acceptance testing
3. [Другие задачи если есть]
```

---

## 📋 Чек-лист готовности к production

Используй этот чеклист перед каждым деплоем:

### Pre-Deployment
- [ ] Все коммиты смержены в main
- [ ] `npm run check` - 0 errors
- [ ] No console errors in browser (local)
- [ ] All CRITICAL and HIGH bugs fixed
- [ ] Database migrations applied (local)
- [ ] CHANGELOG.md updated

### Deployment
- [ ] Git pull на production сервере
- [ ] npm install (если нужно)
- [ ] Database migrations applied (production)
- [ ] npm run build successful
- [ ] PM2 restarted
- [ ] PM2 status: online

### Post-Deployment
- [ ] Public site loads (https://k-liee.com)
- [ ] Admin panel accessible (https://k-liee.com/login)
- [ ] CRUD operations work
- [ ] No errors in PM2 logs
- [ ] No errors in nginx logs
- [ ] Performance acceptable (FCP < 2s)

### Documentation
- [ ] CHANGELOG.md updated
- [ ] Deployment report written
- [ ] Known issues documented

---

## 🛠️ Tech Stack

### Frontend
- **SvelteKit 2.x** - Full-stack framework
- **Svelte 5** - Runes ($state, $derived, $effect)
- **TypeScript** - Type safety
- **mode-watcher** - SSR-safe theme switching
- **paraglide-sveltekit** - i18n routing

### Backend & Database
- **Drizzle ORM** - Type-safe ORM
- **SQLite** (dev) / **PostgreSQL** (prod ready)
- **Better-SQLite3** - Synchronous driver

### DevOps
- **PM2** - Process manager
- **Nginx** - Reverse proxy
- **Vite** - Build tool
- **Playwright** - E2E testing

---

## 📁 Структура проекта

```
project-box-combo-1/
│
├── CLAUDE.md                          # ← Этот файл
├── CLAUDE.local.md                    # WSL-специфичные проблемы и решения
├── CHANGELOG.md                       # История изменений
│
├── frontend-sveltekit/                # SvelteKit приложение
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/
│   │   │   │   ├── layout/            # Header, Footer, MobileMenu
│   │   │   │   ├── admin/             # Admin компоненты
│   │   │   │   │   ├── MediaPicker.svelte
│   │   │   │   │   └── LanguageTabs.svelte
│   │   │   │   └── ui/                # Переиспользуемые UI
│   │   │   ├── server/
│   │   │   │   ├── db/
│   │   │   │   │   ├── schemas/       # Drizzle схемы (25 tables)
│   │   │   │   │   ├── queries/       # DB queries
│   │   │   │   │   └── seeds/         # Seed данные
│   │   │   │   └── auth/              # Аутентификация
│   │   │   └── i18n/                  # Переводы (paraglide)
│   │   ├── routes/
│   │   │   ├── (admin)/               # Админка
│   │   │   │   ├── dashboard/
│   │   │   │   ├── layout/            # Menu, Footer admin
│   │   │   │   ├── homepage/          # Homepage sections admin
│   │   │   │   ├── media/             # Media Manager
│   │   │   │   ├── series/            # Series CRUD
│   │   │   │   ├── artworks/          # Artworks CRUD
│   │   │   │   ├── exhibitions/       # Exhibitions CRUD
│   │   │   │   └── pages/             # Page Builder
│   │   │   ├── +layout.svelte         # Root layout
│   │   │   └── +page.svelte           # Homepage
│   │   └── app.css                    # Глобальные стили + темы
│   ├── drizzle/
│   │   └── migrations/                # Database migrations
│   ├── static/
│   │   └── uploads/                   # Загруженные изображения
│   └── package.json
│
├── backend-expressjs/                 # Express.js API (если нужно)
│
└── data/
    └── db/
        └── sqlite/
            └── app.db                 # SQLite база данных
```

---

## 🔗 Полезные ссылки

### Документация
- [SvelteKit](https://kit.svelte.dev/docs)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/overview)
- [Drizzle ORM](https://orm.drizzle.team/)
- [mode-watcher](https://github.com/svecosystem/mode-watcher)

### Production сервер
- SSH: `ssh webmaster@myappbutik.ru`
- Site: `https://k-liee.com`
- Admin: `https://k-liee.com/login`
- Server path: `/opt/websites/k-liee.com`

---

## 📝 Changelog проекта

### 2025-12-21 - CMS Admin Development Workflow v3.0
- ✅ Добавлен **10-шаговый workflow** для приёма работы от Claude Code Web
- ✅ Добавлены **детальные чек-листы** для тестирования админки (Dashboard, Layout, Homepage, Content)
- ✅ Добавлено **руководство по отладке** с решениями типичных проблем (БД, PM2, Build, 500 errors, Rollback)
- ✅ Обновлена структура проекта с учётом CMS admin panel
- ✅ Удалена устаревшая информация о sprint-based методологии
- ✅ Добавлен чек-лист готовности к production
- 📝 Статус: Готов к интеграции CMS admin panel

### 2025-12-20 - WSL Paths Configuration v2.1
- ✅ Зафиксированы пути проекта в WSL
- ✅ Добавлены пути к Frontend, Backend, Database, Production
- 📝 Статус: Пути зафиксированы

### 2025-11-08 - Workflow Documentation v2
- ✅ Создан универсальный workflow для Static → SvelteKit миграции
- ✅ Добавлены обязательные проверки (Desktop/Tablet/Mobile, Light/Dark, 4 языка)
- 📝 Статус: Методология зафиксирована

---

## 🎯 Следующие шаги

**Текущая задача:** Дождаться завершения работы Claude Code Web над веткой `claude/continue-previous-session-q6c54`

**После завершения:**
1. Смержить в main (Workflow шаг 3)
2. Pull локально и протестировать (Workflow шаг 4-6)
3. Задеплоить на production (Workflow шаг 7-8)
4. Отладить если нужно (Workflow шаг 9)
5. Финальная проверка и документация (Workflow шаг 10)

---

**Последнее обновление:** 2025-12-21
**Версия документа:** 3.0
**Статус проекта:** CMS Admin Development → Ready for Integration

---

**Удачи в интеграции! 💪**
