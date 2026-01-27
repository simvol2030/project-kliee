# Feedback v28 - Video Upload in Popup + Form Save UX

**Дата:** 2026-01-27
**Session:** После deploy feedback-v27
**Коммит main:** 03b35ca
**Branch to create:** `claude/video-upload-form-ux-v28`

---

## Bug 1: NFT Video - нет функционала загрузки в popup

- **Score:** 9 (Сложность: 2×3=6, Файлы: 2×2=4, Риск: 0×2=0, Время: 0×1=0)
- **Где:** `src/routes/(admin)/nft/[id]/+page.svelte` (Video Picker Modal)

### Симптом

1. Открыть https://k-liee.com/nft/2
2. Выбрать "Upload Video" (radio button)
3. Нажать "Select Video"
4. Popup показывает: **"No videos available. Upload videos in Media section first."**
5. **Нет кнопки загрузки видео** в popup

### Проблема

Video Picker Modal (строки 412-437) не имеет функционала загрузки:

```svelte
<!-- Video Picker Modal - ТЕКУЩИЙ КОД -->
{#if showVideoPicker}
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Select Video</h3>
        <!-- НЕТ кнопки Upload! -->
        <button class="btn-close">×</button>
      </div>
      <div class="media-grid video-grid">
        {#if videoMedia.length === 0}
          <p class="no-media">No videos available...</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
```

### Как должно быть

Добавить кнопку "Upload Video" в modal header, аналогично Image Picker в MediaPicker.svelte:

```svelte
<div class="modal-header">
  <h3>Select Video</h3>
  <div class="header-actions">
    <label class="upload-btn" class:uploading={videoUploading}>
      {videoUploading ? 'Uploading...' : 'Upload Video'}
      <input
        type="file"
        accept="video/mp4,video/webm,video/mov"
        onchange={handleVideoUpload}
        disabled={videoUploading}
        hidden
      />
    </label>
    <button class="btn-close">×</button>
  </div>
</div>
```

### Файлы для изменения

| Файл | Изменения |
|------|-----------|
| `src/routes/(admin)/nft/[id]/+page.svelte` | Добавить upload в Video Picker Modal |
| `src/routes/api/media/upload/+server.ts` | Проверить поддержку video/* mime types |

### Референс

Смотри как сделан upload в `MediaPicker.svelte` (строки 53-93, 149-152):
- `handleUpload()` function
- `<label class="upload-btn">` с hidden input

---

## Bug 2: About Page - поля показываются пустыми после сохранения

- **Score:** 8 (Сложность: 2×3=6, Файлы: 1×2=2, Риск: 0×2=0, Время: 0×1=0)
- **Где:** `src/routes/(admin)/about/+page.svelte`

### Симптом

1. Открыть https://k-liee.com/about
2. Изменить Biography (English)
3. Нажать "Save Artist Info"
4. **После сохранения:** Все поля (Biography, Name, etc.) показываются ПУСТЫМИ
5. Страх что данные потеряны
6. **После refresh страницы:** Данные на месте, изменения сохранены

### Root Cause

Локальные `$state` переменные инициализируются из `data.artist`, но НЕ синхронизируются когда `data` обновляется после form submission:

```svelte
// ТЕКУЩИЙ КОД - строки 25-30
let bioFields = $state<BioFields>({
  biography_en: data.artist?.biography_en || '',
  biography_ru: data.artist?.biography_ru || '',
  // ...
});

// Эти значения НЕ обновляются когда data меняется!
```

### Решение

Добавить `$effect` для синхронизации состояния (паттерн из chatbot/settings):

```svelte
// Sync bioFields when data changes (после form submission)
$effect(() => {
  bioFields = {
    biography_en: data.artist?.biography_en || '',
    biography_ru: data.artist?.biography_ru || '',
    biography_es: data.artist?.biography_es || '',
    biography_zh: data.artist?.biography_zh || ''
  };
});

// Sync artist basic info
$effect(() => {
  artistName = data.artist?.name || '';
  artistNationality = data.artist?.nationality || '';
  artistBasedIn = data.artist?.based_in || '';
});

// Sync SEO fields
$effect(() => {
  seoFields = {
    seo_title_en: data.artist?.seo_title_en || '',
    seo_title_ru: data.artist?.seo_title_ru || '',
    // ... все остальные поля
  };
});
```

### Референс

**Chatbot Settings** (строки 12-15) уже использует этот паттерн:

```svelte
// Sync avatarUrl when data changes
$effect(() => {
  avatarUrl = data.settings.avatar_url || '';
});
```

### Файлы для изменения

| Файл | Изменения |
|------|-----------|
| `src/routes/(admin)/about/+page.svelte` | Добавить $effect для bioFields, artistName, seoFields, imageId |

### Затронутые разделы

Проверить аналогичную проблему в других admin страницах:
- `nft/[id]/+page.svelte` - multiLang, videoUrl, etc.
- `exhibitions/[id]/+page.svelte`
- `series/[id]/+page.svelte`

---

## Порядок выполнения

1. **Bug 2 (About Save UX)** — влияет на UX, паттерн уже есть
2. **Bug 1 (Video Upload)** — новый функционал

---

## Чек-лист после исправления

### Bug 1: Video Upload
- [ ] NFT → Upload Video → Select Video → popup имеет кнопку "Upload Video"
- [ ] Upload Video → файл загружается успешно
- [ ] После загрузки видео появляется в grid
- [ ] Можно выбрать загруженное видео

### Bug 2: About Save UX
- [ ] About → Artist → изменить Biography → Save
- [ ] После Save поля НЕ пустые, показывают сохранённые данные
- [ ] Нет необходимости refresh страницы
- [ ] То же для Education, Awards, Residencies, SEO tabs

---

## После исправления

```bash
git checkout main
git pull origin main
git checkout -b claude/video-upload-form-ux-v28

# После фикса
git add .
git commit -m "feat(admin): video upload in NFT popup, fix About save UX - feedback v28"
git push origin claude/video-upload-form-ux-v28
```

**Уведомить CLI:** "Готово, ветка claude/video-upload-form-ux-v28 готова к интеграции"

---

*Feedback создан: 2026-01-27*
*Интегратор: Claude Code CLI*
