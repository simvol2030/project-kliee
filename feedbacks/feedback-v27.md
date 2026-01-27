# Feedback v27 - Media URLs Duplicated Paths

**Дата:** 2026-01-27
**Session:** После deploy feedback-v26
**Коммит main:** 19d4d31
**Branch to create:** `claude/media-urls-fix-v27`

---

## Bug: Двойные пути в URL изображений Media Library

- **Score:** 8 (Сложность: 2×3=6, Файлы: 1×2=2, Риск: 0×2=0, Время: 0×1=0)
- **Где:** API `/api/media` или БД таблица `media`

### Симптом

В Media Picker изображения не загружаются. В консоли браузера много 404 ошибок с **дублированными путями**:

```
/images/works/chebu-rasha//images/works/chebu-rasha/che3.jpg
/images/works/the-bull//images/works/the-bull/bull4.png
/images/works/hotel-series//images/works/hotel-series/IMG_6374.JPG
```

Путь `/images/works/folder/` повторяется дважды!

### Root Cause (вероятно)

1. В БД `media.url` хранится полный путь: `/images/works/chebu-rasha/che3.jpg`
2. При формировании URL добавляется folder prefix: `/images/works/chebu-rasha/`
3. Результат: `/images/works/chebu-rasha/` + `/images/works/chebu-rasha/che3.jpg`

### Файлы для проверки

```
src/routes/api/media/+server.ts     # GET handler - как формируется url
src/lib/server/db/schema.ts         # media table - что хранится в url
src/lib/components/admin/MediaPicker.svelte  # как используется url
```

### Предложение исправления

**Вариант A:** Исправить API - не добавлять prefix если url уже содержит его

```typescript
// В API
const imageUrl = item.url.startsWith('/images/')
  ? item.url
  : `/images/works/${folder}/${item.url}`;
```

**Вариант B:** Исправить данные в БД - убрать prefix из url, хранить только filename

```sql
UPDATE media SET url = REPLACE(url, '/images/works/chebu-rasha/', '')
WHERE url LIKE '/images/works/chebu-rasha/%';
```

### Визуальный эффект

На скриншоте Media Picker показывает "гармошку" - это **broken image placeholders** от браузера, а не CSS баг. Множество горизонтальных линий = множество 404 ошибок.

---

## После исправления

```bash
git checkout main
git pull origin main
git checkout -b claude/media-urls-fix-v27

# После фикса
git add .
git commit -m "fix(media): remove duplicate paths in image URLs - feedback v27"
git push origin claude/media-urls-fix-v27
```

**Уведомить CLI:** "Готово, ветка claude/media-urls-fix-v27 готова к интеграции"

---

*Feedback создан: 2026-01-27*
*Интегратор: Claude Code CLI*
