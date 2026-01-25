# Watermark + WebP + Quality Implementation Plan

**Дата:** 2026-01-25
**Версия:** 1.0
**Статус:** Planning

---

## 1. Обзор задачи

Добавить watermark, конвертацию в WebP и улучшить качество изображений при загрузке.

### Требования:
- **Watermark:** Текст "K-LIÉE" (настраиваемый через админку)
- **Формат:** WebP (качество 92-95)
- **Позиция:** Правый нижний угол, отступ 15-25px
- **Прозрачность:** 0.5-0.7
- **Тень:** Обязательно для видимости на светлых фото
- **Шрифт:** Playfair Display (как в Hero)
- **Размер:** Адаптивный (3-5% от ширины)
- **Применение:** Оригиналы + все thumbnails

---

## 2. Технический стек

### Текущий (Jimp):
- Нет нативного WebP
- JPEG quality 80
- Нет поддержки текстового watermark с тенью

### Новый (Sharp):
- Нативный WebP высокого качества
- SVG-based text watermark (composite)
- Отличная производительность
- Контроль качества

---

## 3. Архитектура

### 3.1 База данных

Использую существующую таблицу `settings` (key-value):

```sql
-- Watermark настройки
INSERT INTO settings (key, value, type, group) VALUES
('watermark_text', 'K-LIÉE', 'string', 'media'),
('watermark_enabled', 'true', 'boolean', 'media'),
('watermark_opacity', '0.6', 'number', 'media'),
('watermark_position', 'bottom-right', 'string', 'media'),
('image_quality', '92', 'number', 'media'),
('image_format', 'webp', 'string', 'media');
```

### 3.2 Модульная структура

```
src/lib/server/
├── image-processor.ts      # NEW: Обработка изображений (Sharp)
└── db/
    └── schema.ts           # Существующая схема (settings table)

src/routes/api/media/
├── upload/+server.ts       # MODIFY: Использовать image-processor
└── settings/+server.ts     # NEW: API настроек watermark

src/routes/(admin)/media/
└── settings/
    ├── +page.server.ts     # NEW: Load/save настроек
    └── +page.svelte        # NEW: UI настроек
```

---

## 4. Детальный план реализации

### Этап 1: Установка Sharp

```bash
npm install sharp
```

**Риск:** Sharp требует нативные модули. На сервере нужен build environment.
**Митигация:** Sharp имеет pre-built binaries для большинства платформ.

### Этап 2: Модуль обработки изображений

**Файл:** `src/lib/server/image-processor.ts`

```typescript
interface ProcessingOptions {
  watermarkText: string;
  watermarkEnabled: boolean;
  watermarkOpacity: number;
  imageQuality: number;
  imageFormat: 'webp' | 'jpeg';
}

interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}

// Основные функции:
- getMediaSettings(): Promise<ProcessingOptions>
- processImage(buffer: Buffer, options: ProcessingOptions): Promise<ProcessedImage>
- createWatermarkSvg(text: string, width: number, opacity: number): string
- createThumbnails(buffer: Buffer, options: ProcessingOptions): Promise<Thumbnail[]>
```

### Этап 3: Обновление upload endpoint

**Файл:** `src/routes/api/media/upload/+server.ts`

Изменения:
1. Импорт `processImage`, `createThumbnails` из image-processor
2. Замена Jimp на Sharp
3. Сохранение в WebP формате
4. Добавление watermark на оригинал и thumbnails

### Этап 4: API настроек

**Файл:** `src/routes/api/media/settings/+server.ts`

```typescript
GET  /api/media/settings  → { watermark_text, watermark_enabled, ... }
POST /api/media/settings  → Сохранение настроек
```

### Этап 5: Админка

**Файлы:**
- `src/routes/(admin)/media/settings/+page.server.ts`
- `src/routes/(admin)/media/settings/+page.svelte`

UI:
- Текст watermark (input)
- Включить watermark (checkbox)
- Прозрачность (slider 0.3-1.0)
- Качество изображений (slider 80-100)
- Preview watermark

### Этап 6: Обновление sidebar

**Файл:** `src/routes/(admin)/+layout@.svelte`

Добавить ссылку в секцию Media:
```
Media Settings → /media/settings
```

---

## 5. Форматы и качество

### WebP настройки:
- **Quality:** 92 (по умолчанию)
- **Effort:** 4 (баланс скорость/качество)
- **Smart subsample:** true

### Thumbnail sizes (без изменений):
- thumb: 150x150
- small: 300x300
- medium: 600x600
- large: 1200x1200

### Watermark:
- **Font:** Playfair Display (Google Fonts - embedded SVG)
- **Size:** 3% от ширины изображения (min 16px, max 48px)
- **Position:** 20px от правого и нижнего края
- **Color:** #FFFFFF
- **Shadow:** 2px blur, rgba(0,0,0,0.7)
- **Opacity:** 0.6

---

## 6. Риски и митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Sharp не установится на сервере | Низкая | Высокое | Pre-built binaries, fallback на Jimp |
| Шрифт не рендерится | Средняя | Среднее | Использовать SVG с inline шрифтом |
| Падение производительности | Низкая | Среднее | Sharp быстрее Jimp |
| Большие файлы WebP | Низкая | Низкое | Quality 92 даёт хороший баланс |

---

## 7. Файлы для изменения

### Новые файлы:
1. `src/lib/server/image-processor.ts`
2. `src/routes/api/media/settings/+server.ts`
3. `src/routes/(admin)/media/settings/+page.server.ts`
4. `src/routes/(admin)/media/settings/+page.svelte`

### Изменяемые файлы:
1. `src/routes/api/media/upload/+server.ts`
2. `src/routes/(admin)/+layout@.svelte`
3. `package.json` (добавить sharp)

---

## 8. Тестирование

После реализации проверить:
1. [ ] npm run check - без ошибок
2. [ ] npm run build - успешно
3. [ ] Загрузка JPEG → WebP с watermark
4. [ ] Загрузка PNG → WebP с watermark
5. [ ] Все thumbnails с watermark
6. [ ] Админка: изменение текста watermark
7. [ ] Админка: выключение watermark
8. [ ] Preview watermark в админке

---

## 9. Оценка времени

| Этап | Оценка |
|------|--------|
| Этап 1: Sharp setup | 5 мин |
| Этап 2: image-processor.ts | 30 мин |
| Этап 3: upload endpoint | 20 мин |
| Этап 4: API settings | 15 мин |
| Этап 5: Admin UI | 25 мин |
| Этап 6: Sidebar link | 5 мин |
| **Итого** | ~100 мин |

---

*План создан: 2026-01-25*
