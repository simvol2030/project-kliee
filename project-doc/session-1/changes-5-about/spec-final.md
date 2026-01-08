# Спецификация: Раздел About — редактирование через админку

**Версия:** FINAL
**Дата:** 2026-01-08
**Автор:** Moderator + CLI
**Статус:** Готово для Developer

---

## Текущее состояние (проверено в браузере и коде)

### Хранение данных

| Компонент | Где сейчас | Что нужно |
|-----------|------------|-----------|
| **Данные About** | JSON файл `data/about.json` | Перенести в БД |
| **Таблицы в БД** | НЕТ | Создать для всех секций |
| **Админка About** | НЕТ | Создать |
| **Изображение художника** | Статичный путь в JSON | Возможность менять через админку |

### Структура данных в JSON

**about.json содержит:**

1. **artist** — информация о художнике:
   - name: "Svetlana K-Liée"
   - image: "/images/about/ELT_5672.jpg"
   - nationality: "Russian-British"
   - basedIn: "England"

2. **biography** — текст биографии на 4 языках (EN/RU/ES/ZH)

3. **education** — образование (3 записи):
   - year, degree (4 языка), institution (4 языка)

4. **awards** — награды (5 записей):
   - year, title (4 языка), organization (4 языка)

5. **residencies** — резиденции (9 записей):
   - year, location (4 языка)

6. **seo** — title и description на 4 языках

### Что работает на фронтенде

- Страница `/[lang]/about` отображается корректно
- 5 секций: Hero, Biography, Education, Awards, Residencies
- Мультиязычность (4 языка) работает
- Светлая/тёмная тема работает
- Изображение художника отображается

### Что НЕ работает / отсутствует

- **Таблицы в БД** — НЕТ
- **Админка** — НЕТ
- **Редактирование изображения** — невозможно
- **Редактирование контента** — невозможно (только через JSON)

---

## Сопоставление: Есть сейчас vs Должно быть

| Аспект | Есть сейчас | Должно быть |
|--------|-------------|-------------|
| **Хранение данных** | JSON | SQLite БД |
| **Админка** | НЕТ | Редактирование всех секций |
| **Изображение художника** | Статичное | Загрузка/замена через админку |
| **Биография** | JSON (4 языка) | Редактируемая (4 языка) |
| **Education** | JSON (3 записи) | CRUD через админку |
| **Awards** | JSON (5 записей) | CRUD через админку |
| **Residencies** | JSON (9 записей) | CRUD через админку |
| **SEO** | JSON | Редактируемые через админку |

**URL фронтенда:** https://k-liee.com/en/about
**Админка:** НЕТ (нужно создать)

---

## Что на выходе

1. **Таблицы в БД** — для artist, education, awards, residencies
2. **Миграция данных** — из JSON в БД без потерь
3. **Админка About** — редактирование всех секций
4. **Загрузка изображения** — возможность менять фото художника
5. **Фронтенд из БД** — провайдер переключен на SQLite
6. **Сохранение структуры** — фронтенд остаётся без изменений

---

## Что нужно сделать

### 1. Создать таблицы в БД

**Таблица `about_artist`** (одна запись — singleton):
```sql
CREATE TABLE about_artist (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  image_id INTEGER REFERENCES media(id),
  nationality TEXT,
  based_in TEXT,
  biography_en TEXT,
  biography_ru TEXT,
  biography_es TEXT,
  biography_zh TEXT,
  seo_title_en TEXT,
  seo_title_ru TEXT,
  seo_title_es TEXT,
  seo_title_zh TEXT,
  seo_description_en TEXT,
  seo_description_ru TEXT,
  seo_description_es TEXT,
  seo_description_zh TEXT
);
```

**Таблица `about_education`**:
```sql
CREATE TABLE about_education (
  id INTEGER PRIMARY KEY,
  year TEXT NOT NULL,
  degree_en TEXT NOT NULL,
  degree_ru TEXT NOT NULL,
  degree_es TEXT NOT NULL,
  degree_zh TEXT NOT NULL,
  institution_en TEXT NOT NULL,
  institution_ru TEXT NOT NULL,
  institution_es TEXT NOT NULL,
  institution_zh TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);
```

**Таблица `about_awards`**:
```sql
CREATE TABLE about_awards (
  id INTEGER PRIMARY KEY,
  year TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  title_es TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  organization_en TEXT NOT NULL,
  organization_ru TEXT NOT NULL,
  organization_es TEXT NOT NULL,
  organization_zh TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);
```

**Таблица `about_residencies`**:
```sql
CREATE TABLE about_residencies (
  id INTEGER PRIMARY KEY,
  year TEXT NOT NULL,
  location_en TEXT NOT NULL,
  location_ru TEXT NOT NULL,
  location_es TEXT NOT NULL,
  location_zh TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);
```

### 2. Создать админку для About

**Путь:** `/about`

**Структура админки:**

1. **Основная информация (Artist)**
   - Имя художника
   - Загрузка/замена изображения
   - Nationality, Based in
   - Биография (4 языка) — textarea
   - SEO title и description (4 языка)

2. **Education (таблица + CRUD)**
   - Список записей образования
   - Добавление новой записи
   - Редактирование: год, степень (4 языка), учреждение (4 языка)
   - Удаление записи
   - Сортировка (order_index)

3. **Awards (таблица + CRUD)**
   - Список наград
   - Добавление новой награды
   - Редактирование: год, название (4 языка), организация (4 языка)
   - Удаление записи
   - Сортировка

4. **Residencies (таблица + CRUD)**
   - Список резиденций
   - Добавление новой резиденции
   - Редактирование: год, место (4 языка)
   - Удаление записи
   - Сортировка

### 3. Миграция данных из JSON

**Источник:** `data/about.json`

**Задачи:**
- Перенести artist info + biography + SEO в `about_artist`
- Перенести 3 записи education в `about_education`
- Перенести 5 записей awards в `about_awards`
- Перенести 9 записей residencies в `about_residencies`
- Загрузить изображение в media и связать

### 4. Переключить фронтенд на БД

- Переписать `about.provider.ts` для работы с БД
- Заменить импорт JSON на запросы к SQLite
- Сохранить интерфейс функций (getAboutData, getBiography, etc.)

### 5. Загрузка изображения художника

- Возможность загрузить новое изображение
- Автоматическая оптимизация в webp (1500x1500, 80-85%)
- Замена существующего изображения
- Без дублирования (проверка по хэшу)

---

## Факторы реализации

- **Не потерять данные** — сначала миграция JSON → БД
- **Сохранить структуру фронтенда** — дизайн страницы не меняется
- **Одна запись artist** — это singleton, не список
- **Мультиязычность** — 4 языка (EN/RU/ES/ZH) для всех текстов
- **Темы** — светлая/тёмная работают, не сломать
- **Изображение** — оптимизация webp, без дублирования

---

## Критерии успеха

- [ ] Таблицы созданы в БД
- [ ] Данные мигрированы из JSON (1 artist + 3 education + 5 awards + 9 residencies)
- [ ] Админка: можно редактировать информацию о художнике
- [ ] Админка: можно загрузить/заменить изображение
- [ ] Админка: можно редактировать биографию (4 языка)
- [ ] Админка: CRUD для Education
- [ ] Админка: CRUD для Awards
- [ ] Админка: CRUD для Residencies
- [ ] Фронтенд: страница отображается корректно из БД
- [ ] Фронтенд: переключение языков работает
- [ ] Фронтенд: светлая/тёмная тема работает
- [ ] Изображение: оптимизируется в webp при загрузке
- [ ] Изображение: без дублирования (проверка по хэшу)

---

## Чек-лист для проверки в браузере

**Миграция (проверить что данные не потеряны):**
- [ ] Страница /en/about отображается корректно
- [ ] Изображение художника загружается
- [ ] Биография на всех 4 языках корректна
- [ ] Education: все 3 записи отображаются
- [ ] Awards: все 5 записей отображаются
- [ ] Residencies: все 9 записей отображаются

**Админка About — основная информация:**
- [ ] Открыть раздел About в админке
- [ ] Изменить имя художника → сохранить → проверить на фронтенде
- [ ] Загрузить новое изображение → проверить на фронтенде
- [ ] Изменить биографию (EN) → проверить
- [ ] Изменить биографию (RU) → проверить
- [ ] Изменить SEO title → проверить

**Админка About — Education:**
- [ ] Добавить новую запись образования
- [ ] Редактировать существующую запись
- [ ] Удалить тестовую запись
- [ ] Изменить порядок записей

**Админка About — Awards:**
- [ ] Добавить новую награду
- [ ] Редактировать существующую награду
- [ ] Удалить тестовую запись

**Админка About — Residencies:**
- [ ] Добавить новую резиденцию
- [ ] Редактировать существующую резиденцию
- [ ] Удалить тестовую запись

**Фронтенд:**
- [ ] Переключить язык (EN → RU) — все тексты меняются
- [ ] Переключить тему (светлая ↔ тёмная) — всё корректно

**Загрузка изображения:**
- [ ] Загрузить новое изображение → оптимизируется в webp
- [ ] Загрузить то же изображение повторно → НЕ дублируется

---

## Файлы для изменения (предварительно)

| Файл | Изменение |
|------|-----------|
| `src/lib/server/db/schema.ts` | Создать таблицы about_artist, about_education, about_awards, about_residencies |
| `src/lib/data/about.provider.ts` | Переключить на БД |
| `data/about.json` | Источник для миграции → бэкап |
| `src/routes/(admin)/about/+page.svelte` | Создать админку About |
| `src/routes/(admin)/about/+page.server.ts` | Server actions для CRUD |

---

*FINAL — одобрено Moderator, готово для Developer*
