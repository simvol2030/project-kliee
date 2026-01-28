# Спецификация: Footer - переключение на SQLite

**Версия:** final
**Дата:** 2026-01-28
**Score:** 18 (Developer)

---

## Проблема

Footer на сайте показывает **статические данные из JSON**, а админка `/layout/footer` редактирует **данные в SQLite базе**. Эти источники не связаны, поэтому изменения в админке не влияют на сайт.

---

## Есть сейчас vs Должно быть

| Аспект | Есть сейчас | Должно быть |
|--------|-------------|-------------|
| Footer data source | JSON файл `data/footer.json` | SQLite таблицы через Drizzle |
| Админка `/layout/footer` | Редактирует SQLite | Редактирует SQLite (без изменений) |
| Связь сайт-админка | НЕТ (разные источники) | ДА (единый источник - SQLite) |
| Управление соцсетями | Через JSON файл вручную | Через админку |

---

## Файлы для изменения

### 1. Удалить/переименовать (больше не нужен)

```
data/footer.json  →  data/footer.json.backup (или удалить)
```

### 2. Переписать: `footer.provider.ts`

**Путь:** `frontend-sveltekit/src/lib/data/footer.provider.ts`

**Сейчас:** Читает из JSON файла
```typescript
import footerDataRaw from '../../../../data/footer.json';
```

**Нужно:** Читать из SQLite через Drizzle

**ВАЖНО:** Этот провайдер используется в клиентском компоненте `Footer.svelte`. Нужно переделать архитектуру:

**Вариант A (рекомендуется):** Передавать данные через `+layout.server.ts`
- В `+layout.server.ts` загружать footer данные из БД
- Передавать через `data` в layout
- Footer.svelte получает данные через props от layout

**Вариант B:** Создать API endpoint `/api/footer` и fetch на клиенте

### 3. Изменить: `Footer.svelte`

**Путь:** `frontend-sveltekit/src/lib/components/layout/Footer.svelte`

**Сейчас:**
```typescript
import { getFooterData } from '$lib/data/footer.provider';
const footerData = $derived(getFooterData(locale));
```

**Нужно (Вариант A):**
```typescript
interface Props {
  footerData: FooterDataLocalized;
}
let { footerData }: Props = $props();
```

### 4. Изменить: `+layout.server.ts` (или `+layout.ts`)

**Путь:** `frontend-sveltekit/src/routes/[lang=locale]/+layout.server.ts`

Добавить загрузку footer данных из БД:

```typescript
import { db } from '$lib/server/db/client';
import { footerBrand, footerSocialLinks, footerContact } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export const load = async ({ params }) => {
  const locale = params.lang || 'en';

  // Load footer data from DB
  const [brand] = await db.select().from(footerBrand).limit(1);
  const socialLinks = await db.select()
    .from(footerSocialLinks)
    .where(eq(footerSocialLinks.is_visible, true))
    .orderBy(asc(footerSocialLinks.order_index));
  const [contact] = await db.select().from(footerContact).limit(1);

  // Transform to localized format
  const footerData = {
    brand: {
      title: brand?.title || 'K-LIÉE',
      subtitle: brand?.[`subtitle_${locale}`] || brand?.subtitle_en || '',
      quote: brand?.[`quote_${locale}`] || brand?.quote_en || ''
    },
    social: {
      title: getLocalizedSocialTitle(locale),
      links: socialLinks.map(link => ({
        platform: link.platform,
        label: link.label,
        badge: link.badge,
        url: link.url,
        icon: link.icon
      }))
    },
    contact: {
      title: contact?.[`title_${locale}`] || contact?.title_en || 'Contact',
      email: contact?.email || ''
    },
    copyright: `© ${new Date().getFullYear()} K-LIÉE. All rights reserved.`
  };

  return {
    locale,
    footerData
    // ... existing data
  };
};
```

### 5. Изменить: `+layout.svelte`

**Путь:** `frontend-sveltekit/src/routes/[lang=locale]/+layout.svelte`

Передать footerData в Footer:

```svelte
<Footer footerData={data.footerData} />
```

### 6. Seed данных в БД (одноразово)

Если таблицы `footer_*` пустые, нужно заполнить из JSON (migration script или вручную через админку).

Текущие данные в JSON:
- Brand: "Svetlana K-Liée", с subtitle и quote на 4 языках
- Social: 7 ссылок (Instagram ×2, Telegram, YouTube, Pinterest, TikTok, OpenSea)
- Contact: email "info@k-lie.com"

---

## Схема БД (уже есть)

```typescript
// footer_brand
{ id, title, subtitle_en, subtitle_ru, subtitle_es, subtitle_zh, quote_en, quote_ru, quote_es, quote_zh }

// footer_social_links
{ id, platform, label, badge, url, icon, order_index, is_visible }

// footer_contact
{ id, title_en, title_ru, title_es, title_zh, email, phone }
```

---

## Критерии успеха

- [ ] Footer на сайте показывает данные из SQLite
- [ ] Изменения в админке `/layout/footer` сразу отражаются на сайте (после refresh)
- [ ] Social links: отображаются ссылки с `is_visible = true`, сортировка по `order_index`
- [ ] i18n работает: subtitle, quote, contact title переводятся по locale
- [ ] Удалён/backup'лен `data/footer.json` (больше не используется)
- [ ] `npm run check` без ошибок
- [ ] `npm run build` успешен

---

## Чек-лист браузера

- [ ] https://k-liee.com/en - футер показывает актуальные соцсети
- [ ] https://k-liee.com/ru - футер на русском (subtitle, quote, contact title)
- [ ] Админка `/layout/footer` - добавить новую соцсеть
- [ ] Сайт - новая соцсеть появилась в футере (после refresh)
- [ ] Админка - скрыть соцсеть (is_visible = false)
- [ ] Сайт - скрытая соцсеть не отображается
- [ ] Консоль браузера без ошибок

---

## Дополнительные заметки

### Social Title локализация

В JSON есть `social.title` с переводами:
```json
{
  "en": "Follow",
  "ru": "Подписаться",
  "es": "Seguir",
  "zh": "关注"
}
```

Но в БД схеме `footer_social_links` нет поля для title секции. Варианты:
1. Добавить колонки `social_title_en/ru/es/zh` в `footer_brand` или отдельную таблицу
2. Захардкодить в провайдере (временно)
3. Использовать i18n translations (paraglide)

**Рекомендация:** Вариант 3 - использовать translations из paraglide для "Follow"/"Подписаться".

### Типы

Интерфейс `FooterDataLocalized` уже определён в `$lib/types/layout.types.ts`. Проверить совместимость.

---

**Автор:** CLI (Integrator)
**Для:** Developer (Claude Code Web)
