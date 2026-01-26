# Feedback v21 - Avatar Upload для Melena Chatbot

**Дата:** 2026-01-26
**Session:** Chatbot Avatar Feature
**Коммит main:** a554398
**Branch to create:** `claude/chatbot-avatar-v21`

---

## Контекст задачи

Нужно добавить возможность загружать аватар (фото) для AI-консультанта Melena в чат-виджете.

**Требования:**
1. В админке (Chatbot Settings) должна быть возможность загрузить изображение аватара
2. Загруженный аватар должен отображаться в чат-виджете вместо буквы "M"
3. Если аватар не загружен — показывать fallback "M"

---

## Что уже сделано (CLI) - НО MODERATOR НЕ ДОВОЛЕН

Код добавлен, но нужна проверка и исправление:

### 1. Schema (`src/lib/server/db/schema.ts:835`)
```typescript
avatar_url: text('avatar_url'), // Avatar image URL for chat widget
```

### 2. API (`src/routes/api/chat/+server.ts:149-154`)
```typescript
return json({
  enabled: settings.is_enabled,
  greeting,
  model: settings.model,
  avatarUrl: settings.avatar_url || null  // <-- добавлено
});
```

### 3. ChatStore (`src/lib/stores/chat.svelte.ts`)
```typescript
// Строка 30:
avatarUrl = $state<string | null>(null);

// В init() строка 50:
this.avatarUrl = data.avatarUrl || null;
```

### 4. ChatWidget (`src/lib/components/chat/ChatWidget.svelte`)
```svelte
<!-- Строки 99-105 -->
<div class="chat-avatar">
  {#if chatStore.avatarUrl}
    <img src={chatStore.avatarUrl} alt="Melena" />
  {:else}
    M
  {/if}
</div>
```

CSS добавлены стили для `.chat-avatar img` (overflow: hidden, object-fit: cover)

### 5. Admin Settings Page

**+page.server.ts:**
- Строка 49: `const avatar_url = formData.get('avatar_url') as string;`
- Строка 73: `avatar_url: avatar_url || null,` в update
- Строка 89: `avatar_url: avatar_url || null,` в insert

**+page.svelte:**
- Строка 20: `let avatarUrl = $state(data.settings.avatar_url || '');`
- Строка 35: `avatarUrl = s.avatar_url || '';` в $effect
- Строки 39-76: функции `handleAvatarUpload()` и `removeAvatar()`
- Строки 183-217: секция "Avatar" с UI
- Строки 464-548: CSS стили для avatar upload

---

## Что нужно проверить и исправить

### Task 1: Проверить загрузку аватара в админке
- [ ] Открыть https://k-liee.com/login → Dashboard → Chatbot Settings
- [ ] Найти секцию "Avatar"
- [ ] Загрузить изображение
- [ ] Проверить появляется ли preview
- [ ] Сохранить настройки
- [ ] Проверить сохраняется ли URL в БД

**Возможные проблемы:**
- CSRF token mismatch при upload (см. логи PM2)
- URL не сохраняется в hidden input
- Проблемы с /api/media/upload endpoint

### Task 2: Проверить отображение в виджете
- [ ] Открыть публичную страницу (например https://k-liee.com/en)
- [ ] Нажать на FAB кнопку чата
- [ ] Проверить header виджета — отображается ли аватар?

**Возможные проблемы:**
- ChatStore не получает avatarUrl из API
- Условный рендеринг в ChatWidget не работает
- Стили неправильные

### Task 3: End-to-end тест
1. Загрузить аватар в админке
2. Сохранить
3. Открыть виджет на сайте
4. Убедиться что аватар отображается
5. Удалить аватар в админке
6. Сохранить
7. Проверить что в виджете снова показывается "M"

---

## Файлы для проверки

```
frontend-sveltekit/src/lib/server/db/schema.ts
frontend-sveltekit/src/routes/api/chat/+server.ts
frontend-sveltekit/src/lib/stores/chat.svelte.ts
frontend-sveltekit/src/lib/components/chat/ChatWidget.svelte
frontend-sveltekit/src/routes/(admin)/chatbot/settings/+page.server.ts
frontend-sveltekit/src/routes/(admin)/chatbot/settings/+page.svelte
```

---

## Логи сервера (для диагностики)

```bash
# PM2 логи
pm2 logs k-liee-frontend --lines 50

# Проверить колонку в БД
sqlite3 /opt/websites/k-liee.com/data/db/sqlite/app.db "SELECT avatar_url FROM chatbot_settings;"
```

---

## После исправления

```bash
git checkout main
git pull origin main
git checkout -b claude/chatbot-avatar-v21

# После фикса
git add .
git commit -m "fix(chatbot): avatar upload and display - feedback v21"
git push origin claude/chatbot-avatar-v21
```

**Уведомить CLI:** "Готово, ветка claude/chatbot-avatar-v21 готова к интеграции"

---

*Feedback создан: 2026-01-26*
*Интегратор: Claude Code CLI*
