# Feedback v21 - Melena AI: Menu Links + CSRF Issue

**Дата:** 2026-01-25
**Session:** Melena AI Implementation
**Branch:** main (после merge)
**Коммит:** e9ae5b9

---

## Что работает

- [x] Таблицы chatbot созданы в БД (вручную через SQL)
- [x] Страница /chatbot/settings открывается и отображает форму
- [x] Страница /chatbot/faq доступна
- [x] Страница /chatbot/history доступна
- [x] Виджет чата появляется на публичном сайте (кнопка "Chat with Melena")
- [x] Виджет открывается при клике
- [x] Поле API Key в настройках работает

---

## Баги (score 6+)

### Bug 1: Нет ссылок на Chatbot в sidebar админки

- **Score:** 7 (Сложность 1×3 + Файлы 1×2 + Риск 1×2 = 7)
- **Проблема:** В боковом меню админки (/dashboard) нет секции "Chatbot" со ссылками
- **Где:** Sidebar компонент в `(admin)/+layout.svelte` или аналогичный файл
- **Ожидание:** Добавить секцию:
  ```
  Chatbot
  ├── 🤖 Settings → /chatbot/settings
  ├── 📚 FAQ → /chatbot/faq
  └── 💬 History → /chatbot/history
  ```
- **Примечание:** Страницы работают, просто нет навигации к ним

---

### Bug 2: CSRF token mismatch на POST /api/chat

- **Score:** 9 (Сложность 2×3 + Файлы 2×2 + Риск 2×2 = 14, упрощаю до 9)
- **Проблема:** При отправке сообщения в чат возвращается ошибка 403
- **Лог сервера:**
  ```
  CSRF token mismatch for POST /api/chat
  ```
- **Файлы:**
  - `src/routes/api/chat/+server.ts` - API endpoint
  - `src/lib/stores/chat.svelte.ts` - клиентский store
  - `src/hooks.server.ts` - CSRF middleware

**Варианты исправления:**

**Вариант A (рекомендуется):** Добавить исключение для /api/chat в CSRF hook
```typescript
// hooks.server.ts
const csrfExemptPaths = ['/api/chat']; // Публичный endpoint
if (csrfExemptPaths.some(path => event.url.pathname.startsWith(path))) {
  // Skip CSRF for this path
}
```

**Вариант B:** Передавать CSRF токен из клиента
```typescript
// chat.svelte.ts - получить токен из cookie и отправить в header
const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1];
fetch('/api/chat', {
  headers: { 'x-csrf-token': csrfToken }
});
```

---

## Прямые URL (пока нет меню)

- Настройки: https://k-liee.com/chatbot/settings
- FAQ: https://k-liee.com/chatbot/faq
- История: https://k-liee.com/chatbot/history

---

## Тестирование после фикса

1. Проверить что в sidebar появился раздел Chatbot
2. Проверить отправку сообщения в чат (не должно быть 403)
3. Если API ключ введён - проверить ответ от AI

---

## Git команды

```bash
git checkout main
git pull origin main
git checkout -b claude/melena-hotfix-v21

# После фикса
git add .
git commit -m "fix: Add chatbot menu links and fix CSRF for /api/chat (feedback-v21)"
git push origin claude/melena-hotfix-v21
```

---

*Feedback создан: 2026-01-25*
*Интегратор: Claude Code CLI*
