# Feedback v25 - CSRF Chatbot + NFT Video + Media Picker

**Дата:** 2026-01-27
**Session:** Admin Panel Improvements
**Коммит main:** 8209d79 (после feedback v24)
**Branch to create:** `claude/chatbot-nft-media-v25`

---

## Задачи в этом feedback

| # | Категория | Score | Описание |
|---|-----------|-------|----------|
| 1 | CSRF | 8 | 5 форм в Chatbot без csrf_token |
| 2 | NFT Video | 10 | Добавить загрузку видео + URL (YouTube) |
| 3 | UI/UX | 7 | Переключатель фото/видео на публичном сайте |
| 4 | CSS | 6 | Media Picker popup - фото накладываются друг на друга |

---

## Bug 1: CSRF token отсутствует в Chatbot модуле

- **Score:** 8 (из feedback-v22, НЕ было исправлено!)
- **Где:** 4 файла в `src/routes/(admin)/chatbot/`

### Проблема

Все формы в модуле Chatbot НЕ включают `csrf_token`. При сабмите получаем 403 CSRF mismatch.

### Файлы для исправления

| Файл | Формы (actions) |
|------|-----------------|
| `chatbot/settings/+page.svelte` | `?/save` |
| `chatbot/faq/+page.svelte` | `?/create`, `?/update`, `?/delete` |
| `chatbot/history/+page.svelte` | `?/toggleSaved`, `?/delete` |
| `chatbot/history/[id]/+page.svelte` | `?/updateNote` |

### Паттерн исправления

Добавить в каждую форму:

```svelte
<form method="POST" action="?/save" use:enhance>
  <input type="hidden" name="csrf_token" value={data.csrfToken} />
  <!-- остальные поля -->
</form>
```

### Чек-лист после исправления

- [ ] Chatbot Settings → Save → "Settings saved successfully!"
- [ ] FAQ → Add FAQ → FAQ появляется в списке
- [ ] FAQ → Edit FAQ → изменения сохраняются
- [ ] FAQ → Delete FAQ → FAQ удаляется
- [ ] History → ☆ → сессия помечается как избранная (★)
- [ ] History → ✕ → сессия удаляется
- [ ] History → [id] → Save Note → заметка сохраняется

---

## Bug 2: NFT Video - нет функционала загрузки/URL

- **Score:** 10
- **Где:** `src/routes/(admin)/nft/[id]/+page.svelte`

### Текущее состояние

1. Поле Video помечено как Optional (исправлено в v24)
2. Кнопка "Select Video" открывает popup с "No videos available"
3. Media Library НЕ поддерживает загрузку видео
4. **Результат:** Невозможно добавить видео к NFT

### Требования (решение Moderator)

Реализовать ДВА способа добавления видео (на выбор пользователя):

**Способ 1: Загрузка файла**
- Добавить загрузку видео в Media Library (mp4, webm)
- Фильтр "Videos" в Media picker
- Picker для выбора видео в NFT форме

**Способ 2: URL видео**
- Текстовое поле для URL
- Поддержка YouTube, Vimeo, прямые ссылки
- Валидация URL формата

### UI в форме NFT

```
Video (Optional)
┌─────────────────────────────────────────┐
│ ○ Upload Video    ○ Video URL           │ ← Radio buttons
├─────────────────────────────────────────┤
│ [Select Video]     OR   [URL input____] │
│ (opens MediaPicker      https://youtu.be│
│  filtered by video)     /xxxxxxxxxxx    │
└─────────────────────────────────────────┘
```

### Файлы для изменения

```
src/routes/(admin)/nft/[id]/+page.svelte       # Форма с radio buttons
src/routes/(admin)/nft/[id]/+page.server.ts    # Обработка video_url или video_id
src/routes/(admin)/media/+page.svelte          # Добавить загрузку видео
src/routes/api/media/upload/+server.ts         # Расширить для видео
src/lib/components/admin/MediaPicker.svelte    # Фильтр по типу (images/videos)
```

---

## Bug 3: Переключатель фото/видео на публичном сайте

- **Score:** 7
- **Где:** Публичная страница NFT (например `/[lang]/nft/[slug]`)

### Требования (решение Moderator)

Если NFT имеет И фото И видео — показывать переключатель (табы):

```
┌──────────────────────────────────────────┐
│  [Photo]  [Video]                        │ ← Tabs
├──────────────────────────────────────────┤
│                                          │
│     [ Изображение или Видео ]            │
│                                          │
└──────────────────────────────────────────┘
```

### Логика отображения

| Есть фото | Есть видео | Показываем |
|-----------|------------|------------|
| ✓ | ✗ | Только фото (без табов) |
| ✗ | ✓ | Только видео (без табов) |
| ✓ | ✓ | Табы [Photo] [Video] |
| ✗ | ✗ | Placeholder "No media" |

### Файлы для изменения

```
src/routes/[lang=locale]/nft/[slug]/+page.svelte
```

---

## Bug 4: Media Picker popup - фото накладываются

- **Score:** 6
- **Где:** `src/lib/components/admin/MediaPicker.svelte:356-396`

### Текущее состояние

Пользователь сообщает: "фото как гармошка из жопы, скомканные одна на другую, эффект безобразия, фото не отделены, друг на друга перекрывают их рассмотреть невозможно"

### Текущий CSS (строки 356-396)

```css
.media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
}

.media-item {
    aspect-ratio: 1;
    /* ... */
}
```

### Возможные причины

1. `aspect-ratio: 1` не работает в flex-контейнере
2. Dark mode: модальное окно белое, может быть конфликт стилей
3. Отсутствует `min-height` для grid items
4. Конфликт с глобальными стилями

### Предложение исправления

1. Добавить явную высоту для `.media-item`
2. Проверить стили в dark mode
3. Добавить `isolation: isolate` для предотвращения конфликтов
4. Протестировать в обоих режимах (light/dark)

```css
.media-item {
    aspect-ratio: 1;
    min-height: 120px;
    max-height: 160px;
    isolation: isolate;
    /* ... */
}

:global(.dark) .modal-content {
    background: var(--color-bg-secondary, #1f2937);
}
```

---

## Порядок выполнения

1. **Bug 1 (CSRF)** — быстрый fix, критично для работы Chatbot
2. **Bug 4 (CSS)** — быстрый fix для UX
3. **Bug 2 (NFT Video)** — основная работа
4. **Bug 3 (Табы)** — после Bug 2, зависит от него

---

## После исправления

```bash
git checkout main
git pull origin main
git checkout -b claude/chatbot-nft-media-v25

# После фикса
git add .
git commit -m "feat(admin): CSRF chatbot, NFT video upload/URL, media picker fix - feedback v25"
git push origin claude/chatbot-nft-media-v25
```

**Уведомить CLI:** "Готово, ветка claude/chatbot-nft-media-v25 готова к интеграции"

---

*Feedback создан: 2026-01-27*
*Интегратор: Claude Code CLI*
