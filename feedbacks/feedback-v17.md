# Feedback v17 - Exhibitions не соответствует спецификации + мелкие правки

**Дата:** 2026-01-09
**Environment:** https://k-liee.com
**Branch to create:** claude/session-1-exhibitions-spec-compliance
**Spec reference:** `project-doc/session-1/changes-3-Exhibitions/spec-final.md`

---

## Что работает

- [x] Миграция JSON → БД выполнена (14 выставок)
- [x] Провайдер переключен на БД
- [x] Мультиязычность (4 языка) работает
- [x] Art Fairs отображаются в отдельной секции
- [x] Админка /exhibitions: CRUD работает
- [x] About: языковые табы работают везде
- [x] Works: изображения серий и artworks отображаются

---

## Критические баги (Exhibitions - не соответствует спецификации)

### Bug E-3: Выставки не кликабельны - нет детальной страницы
- **Score:** 14 (Сложность=3×3 + Файлы=2×2 + Риск=1×2 + Время=1×1)
- **URL:** https://k-liee.com/ru/exhibitions
- **Spec requirement:** "Страница отдельной выставки — `/[lang]/exhibitions/[slug]` с галереей и описанием"
- **Steps:**
  1. Открыть /ru/exhibitions
  2. Попытаться кликнуть на любую выставку
- **Expected:** Переход на страницу `/ru/exhibitions/[slug]` с галереей и описанием
- **Actual:** Выставки не кликабельны (article элементы без href)
- **Root cause:** Route `/[lang]/exhibitions/[slug]` не создан
- **Files to create:**
  - `src/routes/[lang]/exhibitions/[slug]/+page.svelte`
  - `src/routes/[lang]/exhibitions/[slug]/+page.ts`

### Bug E-4: Нет секции "Current/Upcoming" выставки
- **Score:** 8 (Сложность=2×3 + Файлы=1×2 + Риск=0×2 + Время=0×1)
- **URL:** https://k-liee.com/ru/exhibitions
- **Spec requirement:** "3 секции: Current, Past Exhibitions, Art Fairs"
- **Steps:**
  1. Открыть /ru/exhibitions
- **Expected:** 3 секции: Current/Upcoming, Past Exhibitions, Art Fairs
- **Actual:** Только 2 секции: "Прошедшие выставки", "Арт-ярмарки". Секция "Current" отсутствует
- **Files to modify:**
  - `src/routes/[lang]/exhibitions/+page.svelte`

### Bug E-5: Нет изображений выставок в списке
- **Score:** 8 (Сложность=2×3 + Файлы=1×2 + Риск=0×2 + Время=0×1)
- **URL:** https://k-liee.com/ru/exhibitions
- **Spec requirement:** "У текущих выставок отображаются изображения"
- **Steps:**
  1. Открыть /ru/exhibitions
- **Expected:** Выставки с изображениями (cover_image)
- **Actual:** Только текстовый список без изображений
- **Files to modify:**
  - `src/routes/[lang]/exhibitions/+page.svelte`
  - `src/lib/data/exhibitions.provider.ts` (если не возвращает cover_image)

### Bug E-6: Нет галереи фотографий на странице выставки
- **Score:** 11 (Сложность=3×3 + Файлы=1×2 + Риск=0×2 + Время=0×1)
- **Spec requirement:** "Галерея фотографий с перелистыванием"
- **Depends on:** E-3 (сначала создать страницу)
- **Implementation:**
  - Использовать таблицу `exhibition_images` (уже создана)
  - Компонент галереи с навигацией
  - Подписи к фото на 4 языках

### Bug E-7: Нет описания выставки
- **Score:** 6 (Сложность=1×3 + Файлы=1×2 + Риск=0×2 + Время=1×1)
- **Spec requirement:** "Описание (мультиязычное)"
- **Depends on:** E-3 (сначала создать страницу)
- **Note:** Поля description_en/ru/es/zh есть в БД, нужно отображать на странице

---

## Мелкие баги (score 0-5)

### Bug W-1: 404 для placeholder-artwork.jpg
- **Score:** 3 (Сложность=1×3 + Файлы=1×2 + Риск=0×2 + Время=0×1)
- **URL:** https://k-liee.com/ru/works
- **Console error:** `GET /images/placeholder-artwork.jpg 404`
- **Fix:** Создать файл `/images/placeholder-artwork.jpg` или исправить путь в коде
- **Files:** Проверить где используется этот путь

---

## Разъяснения (не баги)

### About - фото художника
- **Status:** НЕ БАГ
- **Explanation:** Кнопка "Select Image" есть в админке /about → Artist tab. Просто фото не выбрано. UX понятен.

### Works - управление через админку
- **Status:** НЕ БАГ
- **Explanation:**
  - **Series** (`/series`) - управление группами работ (cover image, название, описание)
  - **Artworks** (`/artworks`) - отдельные работы, привязываются к Series через поле series_id
  - На публичной странице `/works` отображаются Series, внутри - Artworks этой серии

---

## Приоритет реализации

1. **E-3** (страница выставки) - блокирует E-6, E-7
2. **E-5** (изображения в списке)
3. **E-4** (секция Current)
4. **E-6** (галерея) - после E-3
5. **E-7** (описание) - после E-3
6. **W-1** (placeholder) - можно сделать параллельно

---

## Чек-лист после исправления

### Exhibitions:
- [ ] На /exhibitions есть 3 секции: Current, Past, Art Fairs
- [ ] Выставки с изображениями (cover image)
- [ ] Клик на выставку → детальная страница /exhibitions/[slug]
- [ ] На странице выставки: название, описание, галерея фотографий
- [ ] Галерея с навигацией (вперед/назад)
- [ ] Работает на 4 языках
- [ ] Работает в светлой/темной теме

### Works:
- [ ] Нет 404 для placeholder-artwork.jpg

---

*Создано: CLI Integrator | 2026-01-09*
