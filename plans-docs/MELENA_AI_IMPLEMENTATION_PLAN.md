# План Реализации AI-консультанта «Мелена»

**Дата создания:** 2026-01-25
**Версия:** 1.0
**Статус:** План утверждён

---

## Результаты Анализа Проекта

### Текущий Стек
- **Framework:** SvelteKit 2.x + Svelte 5 (runes: $state, $derived, $effect)
- **TypeScript:** Полная типизация
- **ORM:** Drizzle ORM + SQLite (better-sqlite3)
- **Темизация:** mode-watcher (light/dark CSS variables)
- **i18n:** paraglide-sveltekit (EN/RU/ES/ZH)
- **Паттерны Store:** Class-based stores с Svelte 5 runes

### Структура Проекта
```
frontend-sveltekit/
├── src/
│   ├── lib/
│   │   ├── components/    ← Новый компонент виджета
│   │   ├── stores/        ← Новый chat store
│   │   └── server/db/     ← Расширение schema.ts
│   └── routes/
│       ├── (admin)/       ← Новые страницы админки
│       └── api/           ← Новый endpoint /api/chat
```

### Существующие Паттерны (Следовать)
- API: `+server.ts` с `RequestHandler`, `json()`, `error()`
- Stores: Class с `$state`, экспорт singleton
- Компоненты: Svelte 5 с `$props()`, `$derived`, `$effect`
- Стили: CSS variables, dark mode через `:global(.dark)`

---

## Архитектура Решения

### Компоненты Системы

```
┌─────────────────────────────────────────────────────────────────┐
│                        КЛИЕНТСКАЯ ЧАСТЬ                          │
├─────────────────────────────────────────────────────────────────┤
│  ChatWidget.svelte          ChatStore.svelte.ts                  │
│  ├── ChatButton             ├── messages: Message[]              │
│  ├── ChatWindow             ├── isOpen: boolean                  │
│  │   ├── ChatHeader         ├── isTyping: boolean                │
│  │   ├── ChatMessages       ├── sendMessage()                    │
│  │   ├── ChatInput          └── sessionStorage sync              │
│  │   └── ChatTyping                                              │
│  └── Responsive/Mobile                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  /api/chat/+server.ts                                            │
│  ├── POST: Отправка сообщения                                    │
│  │   ├── 1. Поиск в FAQ (grounding)                              │
│  │   ├── 2. Формирование контекста                               │
│  │   ├── 3. Запрос к OpenRouter                                  │
│  │   └── 4. Сохранение в историю                                 │
│  └── GET: Получение истории                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     БАЗА ДАННЫХ (Drizzle)                        │
├─────────────────────────────────────────────────────────────────┤
│  chatbotSettings           chatFaq                               │
│  ├── system_prompt         ├── question                          │
│  ├── model                 ├── answer                            │
│  ├── temperature           └── is_active                         │
│  └── greeting_message                                            │
│                                                                  │
│  chatbotSessions           chatbotMessages                       │
│  ├── session_id            ├── session_id                        │
│  ├── visitor_id            ├── role (user/assistant)             │
│  └── started_at            ├── content                           │
│                            └── created_at                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     АДМИН ПАНЕЛЬ                                 │
├─────────────────────────────────────────────────────────────────┤
│  /admin/chatbot                                                  │
│  ├── /settings    - Настройки промпта и модели                   │
│  ├── /faq         - База знаний (CRUD)                           │
│  └── /history     - История переписок                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Фазы Реализации

### ФАЗА 1: База Данных и Типы

#### Задача 1.1: Расширение schema.ts
**Файл:** `src/lib/server/db/schema.ts`

Добавить таблицы:
```typescript
// Chatbot Settings (singleton)
export const chatbotSettings = sqliteTable('chatbot_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  system_prompt: text('system_prompt').notNull(),
  model: text('model').notNull().default('anthropic/claude-3-haiku'),
  temperature: text('temperature').default('0.7'),
  max_tokens: integer('max_tokens').default(1024),
  greeting_en: text('greeting_en'),
  greeting_ru: text('greeting_ru'),
  greeting_es: text('greeting_es'),
  greeting_zh: text('greeting_zh'),
  is_enabled: integer('is_enabled', { mode: 'boolean' }).default(true),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// FAQ Knowledge Base
export const chatFaq = sqliteTable('chat_faq', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  question_en: text('question_en').notNull(),
  question_ru: text('question_ru'),
  question_es: text('question_es'),
  question_zh: text('question_zh'),
  answer_en: text('answer_en').notNull(),
  answer_ru: text('answer_ru'),
  answer_es: text('answer_es'),
  answer_zh: text('answer_zh'),
  keywords: text('keywords'), // JSON array for search
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  order_index: integer('order_index').default(0),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Chat Sessions (renamed to avoid conflict with cart_sessions)
export const chatbotSessions = sqliteTable('chatbot_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  session_id: text('session_id').notNull().unique(),
  visitor_id: text('visitor_id'),
  lang: text('lang').default('en'),
  started_at: text('started_at').default(sql`CURRENT_TIMESTAMP`),
  last_message_at: text('last_message_at'),
  is_saved: integer('is_saved', { mode: 'boolean' }).default(false),
  admin_note: text('admin_note')
});

// Chat Messages
export const chatbotMessages = sqliteTable('chatbot_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  session_id: text('session_id')
    .notNull()
    .references(() => chatbotSessions.session_id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  tokens_used: integer('tokens_used'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});
```

#### Задача 1.2: TypeScript типы
**Файл:** `src/lib/types/chat.types.ts`

```typescript
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSettings {
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  greeting: Record<string, string>;
  isEnabled: boolean;
}

export interface FaqItem {
  id: number;
  question: Record<string, string>;
  answer: Record<string, string>;
  keywords: string[];
  isActive: boolean;
}
```

#### Задача 1.3: Миграция БД
```bash
npm run db:push
```

---

### ФАЗА 2: Chat Store (Svelte 5 Runes)

#### Задача 2.1: Создание ChatStore
**Файл:** `src/lib/stores/chat.svelte.ts`

```typescript
class ChatStore {
  // State
  messages = $state<ChatMessage[]>([]);
  isOpen = $state(false);
  isTyping = $state(false);
  error = $state<string | null>(null);
  sessionId = $state<string | null>(null);

  // Methods
  async sendMessage(content: string, lang: string): Promise<void> {}
  async loadHistory(): Promise<void> {}
  toggle(): void {}
  clear(): void {}

  // sessionStorage sync in $effect
}

export const chatStore = new ChatStore();
```

---

### ФАЗА 3: Клиентский Виджет

#### Задача 3.1: Основной компонент
**Файл:** `src/lib/components/chat/ChatWidget.svelte`

Структура:
- ChatButton (плавающая кнопка)
- ChatWindow (окно чата)
  - ChatHeader (заголовок с названием и кнопкой закрытия)
  - ChatMessages (список сообщений с автоскроллом)
  - ChatTyping (индикатор набора)
  - ChatInput (поле ввода)

#### Задача 3.2: Стили
- CSS Variables для консистентности с проектом
- Dark mode через `:global(.dark)`
- Адаптивность: полноэкранный режим на мобильных
- Плавные анимации (появление, typing indicator)

#### Задача 3.3: Интеграция в Layout
**Файл:** `src/routes/+layout.svelte`

Добавить `<ChatWidget />` в конец body.

---

### ФАЗА 4: API Endpoint

#### Задача 4.1: Chat API
**Файл:** `src/routes/api/chat/+server.ts`

```typescript
// POST /api/chat
// 1. Получить сообщение пользователя
// 2. Поиск в FAQ (grounding)
// 3. Формирование контекста с system prompt
// 4. Запрос к OpenRouter API
// 5. Сохранение в БД
// 6. Возврат ответа

// GET /api/chat?session_id=xxx
// Получение истории для session_id
```

#### Задача 4.2: OpenRouter Integration
**Файл:** `src/lib/server/openrouter.ts`

```typescript
export async function queryOpenRouter(
  messages: Array<{role: string; content: string}>,
  settings: ChatSettings
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://k-liee.com',
      'X-Title': 'K-LIEE Art Consultant'
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens
    })
  });

  // Parse and return
}
```

#### Задача 4.3: FAQ Search (Grounding)
**Файл:** `src/lib/server/faq-search.ts`

```typescript
export async function searchFaq(
  query: string,
  lang: string
): Promise<FaqItem[]> {
  // Простой поиск по keywords и вопросам
  // Возврат релевантных FAQ для контекста
}
```

---

### ФАЗА 5: Панель Администратора

#### Задача 5.1: Структура роутов
```
src/routes/(admin)/chatbot/
├── +page.svelte          # Редирект на /settings
├── settings/
│   ├── +page.server.ts   # Load/Save settings
│   └── +page.svelte      # UI настроек
├── faq/
│   ├── +page.server.ts   # CRUD FAQ
│   ├── +page.svelte      # Список FAQ
│   ├── new/
│   │   └── +page.svelte  # Создание FAQ
│   └── [id]/
│       └── +page.svelte  # Редактирование FAQ
└── history/
    ├── +page.server.ts   # Load sessions
    ├── +page.svelte      # Список сессий
    └── [id]/
        └── +page.svelte  # Просмотр диалога
```

#### Задача 5.2: Settings Page
- Редактирование System Prompt
- Выбор модели (dropdown)
- Настройка temperature (slider)
- Приветственные сообщения (i18n)
- Включение/выключение бота

#### Задача 5.3: FAQ Management
- Таблица с вопросами/ответами
- Drag-and-drop для сортировки
- Мультиязычность
- Активация/деактивация

#### Задача 5.4: History Viewer
- Список сессий с датой и количеством сообщений
- Просмотр полного диалога
- Флаг "Сохранить" для важных чатов
- Заметки администратора

---

### ФАЗА 6: Конфигурация и Безопасность

#### Задача 6.1: Environment Variables
**Файл:** `.env.example` (добавить)

```env
# OpenRouter AI
OPENROUTER_API_KEY=your-api-key-here
```

#### Задача 6.2: Валидация и Безопасность
- Rate limiting на /api/chat
- Санитизация пользовательского ввода
- Фильтрация off-topic через system prompt
- Защита API ключа (только server-side)

---

## Порядок Выполнения

1. **Фаза 1** → База данных и типы
2. **Фаза 4** → API (чтобы можно было тестировать)
3. **Фаза 2** → Chat Store
4. **Фаза 3** → Клиентский виджет
5. **Фаза 5** → Админ панель
6. **Фаза 6** → Конфигурация и безопасность

---

## Риски и Митигации

| Риск | Митигация |
|------|-----------|
| OpenRouter API недоступен | Fallback сообщение + retry logic |
| Высокая нагрузка | Rate limiting, кэширование FAQ |
| Off-topic вопросы | Строгий system prompt |
| XSS через ввод | Санитизация, escape HTML |
| Потеря сессии | sessionStorage + server sync |

---

## Тестовый Чеклист

- [ ] Виджет отображается на всех страницах
- [ ] Анимации плавные, без лагов
- [ ] Dark mode корректный
- [ ] Мобильная версия полноэкранная
- [ ] FAQ работает как grounding
- [ ] История сохраняется в sessionStorage
- [ ] Админка: все CRUD операции
- [ ] API защищён rate limiting
- [ ] TypeScript без ошибок
- [ ] Build проходит успешно

---

**Готов к реализации!**
