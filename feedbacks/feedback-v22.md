# Feedback v22

**Дата:** 2026-01-26
**Session:** Chatbot Admin Testing
**Branch:** main
**Тестировал:** Integrator (CLI)

---

## Что работает

- [x] Chatbot Settings - страница открывается, настройки отображаются
- [x] Chat History - список сессий отображается
- [x] Chat History - просмотр отдельной сессии работает
- [x] FAQ - страница открывается
- [x] Wishlist (Shop) - добавление/удаление из избранного работает
- [x] Enable Chatbot checkbox - присутствует в UI

---

## Баги (CSRF token mismatch)

**Корневая причина:** Все формы в модуле Chatbot НЕ включают `csrf_token` hidden field.

### Bug 1: Chatbot Settings - сохранение не работает

- **Score:** 8
- **Где:** `/chatbot/settings` → Save Settings
- **Ошибка в логах:** `CSRF token mismatch for POST /chatbot/settings`
- **Steps to reproduce:**
  1. Открыть https://k-liee.com/chatbot/settings
  2. Изменить любое поле
  3. Нажать "Save Settings"
  4. Страница не показывает ни ошибку, ни успех (silent fail)
- **Expected:** "Settings saved successfully!"
- **Actual:** Ничего не происходит, в логах 403 CSRF
- **Файл для исправления:** `src/routes/(admin)/chatbot/settings/+page.svelte`
- **Исправление:** Добавить `<input type="hidden" name="csrf_token" value={data.csrfToken} />` в форму

---

### Bug 2: FAQ - создание не работает

- **Score:** 8
- **Где:** `/chatbot/faq` → Add FAQ
- **Ошибка:** 500 Server Error
- **Steps to reproduce:**
  1. Открыть https://k-liee.com/chatbot/faq
  2. Нажать "Add FAQ"
  3. Заполнить Question и Answer
  4. Нажать "Add FAQ" (submit)
  5. Показывается страница 500 ошибки
- **Console:** `403 @ https://k-liee.com/chatbot/faq?/create`
- **Файл для исправления:** `src/routes/(admin)/chatbot/faq/+page.svelte`
- **Исправление:** Добавить `<input type="hidden" name="csrf_token" value={data.csrfToken} />` в форму создания FAQ

---

### Bug 3: History - "Сохранить в избранное" не работает

- **Score:** 7
- **Где:** `/chatbot/history` → кнопка ☆
- **Ошибка:** 500 Server Error
- **Steps to reproduce:**
  1. Открыть https://k-liee.com/chatbot/history
  2. Нажать ☆ (звёздочку) напротив любой сессии
  3. Показывается страница 500 ошибки
- **Console:** `403 @ https://k-liee.com/chatbot/history?/toggleSaved`
- **Файл для исправления:** `src/routes/(admin)/chatbot/history/+page.svelte`
- **Исправление:** Форма с action `?/toggleSaved` должна включать csrf_token

---

### Bug 4: History - сохранение заметки не работает

- **Score:** 7
- **Где:** `/chatbot/history/{id}` → Save Note
- **Ошибка:** 500 Server Error
- **Steps to reproduce:**
  1. Открыть любую сессию из истории (кнопка 👁)
  2. Ввести текст в поле "Admin Note"
  3. Нажать "Save Note"
  4. Показывается страница 500 ошибки
- **Console:** `403 @ https://k-liee.com/chatbot/history/{id}?/updateNote`
- **Файл для исправления:** `src/routes/(admin)/chatbot/history/[id]/+page.svelte`
- **Исправление:** Форма с action `?/updateNote` должна включать csrf_token

---

### Bug 5: History - удаление сессии (вероятно не работает)

- **Score:** 6
- **Где:** `/chatbot/history` → кнопка ✕
- **Примечание:** Не тестировал (confirm dialog), но скорее всего та же проблема
- **Файл для исправления:** `src/routes/(admin)/chatbot/history/+page.svelte`
- **Исправление:** Форма с action `?/delete` должна включать csrf_token

---

## Паттерн исправления (для всех багов)

**Пример из Media Settings (уже исправлено):**

```svelte
<form method="POST" action="?/save" use:enhance={...}>
  <input type="hidden" name="csrf_token" value={data.csrfToken} />
  <!-- остальные поля -->
</form>
```

**Файлы для исправления:**

| Файл | Формы |
|------|-------|
| `src/routes/(admin)/chatbot/settings/+page.svelte` | save |
| `src/routes/(admin)/chatbot/faq/+page.svelte` | create, update, delete |
| `src/routes/(admin)/chatbot/history/+page.svelte` | toggleSaved, delete |
| `src/routes/(admin)/chatbot/history/[id]/+page.svelte` | updateNote |

---

## Feature Request: Проверить работу "Enable Chatbot"

После исправления CSRF, нужно проверить:

1. Выключить чекбокс "Enable Chatbot"
2. Сохранить настройки
3. Открыть публичную страницу (например https://k-liee.com/en)
4. **Ожидание:** Кнопка "Chat with Melena" НЕ должна отображаться
5. Включить обратно
6. **Ожидание:** Кнопка "Chat with Melena" появляется

---

## Тестирование после исправления

- [ ] Chatbot Settings → Save → "Settings saved successfully!"
- [ ] FAQ → Add FAQ → FAQ появляется в списке
- [ ] FAQ → Edit FAQ → изменения сохраняются
- [ ] FAQ → Delete FAQ → FAQ удаляется
- [ ] History → ☆ → сессия помечается как избранная (★)
- [ ] History → ✕ → сессия удаляется
- [ ] History → [id] → Save Note → заметка сохраняется
- [ ] Enable Chatbot OFF → виджет скрыт на публичном сайте
- [ ] Enable Chatbot ON → виджет виден на публичном сайте

---

*Feedback создан: 2026-01-26 12:15*
