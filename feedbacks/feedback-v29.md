# Feedback v29 - Footer: переключение на SQLite

**Дата:** 2026-01-28
**Environment:** https://k-liee.com
**Branch to create:** `claude/footer-db-integration`

---

## Проблема

Footer на сайте показывает **статические данные из JSON**, а админка `/layout/footer` редактирует **данные в SQLite базе**. Эти источники не связаны, поэтому изменения в админке не влияют на сайт.

**Обнаружено:** Moderator заметил, что соцсети в админке не соответствуют тому, что на сайте.

---

## Текущая архитектура (неправильная)

```
Сайт (Footer.svelte)
    ↓ читает
data/footer.json (статический файл)

Админка (/layout/footer)
    ↓ редактирует
SQLite (footer_brand, footer_social_links, footer_contact)
```

**Результат:** Два несвязанных источника данных.

---

## Целевая архитектура

```
Сайт (Footer.svelte)
    ↓ получает props от layout
+layout.server.ts
    ↓ читает
SQLite (footer_brand, footer_social_links, footer_contact)
    ↑ редактирует
Админка (/layout/footer)
```

**Результат:** Единый источник данных — SQLite.

---

## Файлы для изменения

### 1. `src/lib/data/footer.provider.ts`
**Действие:** Удалить или переименовать в `.backup`
**Причина:** Больше не нужен, данные идут из layout

### 2. `src/lib/components/layout/Footer.svelte`
**Сейчас:** Импортирует `getFooterData` из провайдера
```typescript
import { getFooterData } from '$lib/data/footer.provider';
const footerData = $derived(getFooterData(locale));
```

**Нужно:** Получать данные через props
```typescript
interface Props {
  footerData: FooterDataLocalized;
}
let { footerData }: Props = $props();
```

### 3. `src/routes/[lang=locale]/+layout.server.ts`
**Добавить:** Загрузку footer данных из БД

```typescript
import { db } from '$lib/server/db/client';
import { footerBrand, footerSocialLinks, footerContact } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const load = async ({ params }) => {
  const locale = params.lang || 'en';

  // Load footer from DB
  const [brand] = await db.select().from(footerBrand).limit(1);
  const socialLinks = await db.select()
    .from(footerSocialLinks)
    .where(eq(footerSocialLinks.is_visible, true))
    .orderBy(asc(footerSocialLinks.order_index));
  const [contact] = await db.select().from(footerContact).limit(1);

  const footerData = {
    brand: {
      title: brand?.title || 'K-LIÉE',
      subtitle: brand?.[`subtitle_${locale}`] || brand?.subtitle_en || '',
      quote: brand?.[`quote_${locale}`] || brand?.quote_en || ''
    },
    social: {
      title: locale === 'ru' ? 'Подписаться' : locale === 'es' ? 'Seguir' : locale === 'zh' ? '关注' : 'Follow',
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
    footerData,
    // ... existing return data
  };
};
```

### 4. `src/routes/[lang=locale]/+layout.svelte`
**Изменить:** Передать footerData в Footer

```svelte
<Footer footerData={data.footerData} />
```

### 5. `data/footer.json`
**Действие:** Переименовать в `footer.json.backup` или удалить

---

## Схема БД (уже существует)

```sql
-- footer_brand
id, title, subtitle_en, subtitle_ru, subtitle_es, subtitle_zh,
quote_en, quote_ru, quote_es, quote_zh

-- footer_social_links
id, platform, label, badge, url, icon, order_index, is_visible

-- footer_contact
id, title_en, title_ru, title_es, title_zh, email, phone
```

---

## Seed данных (если БД пустая)

Текущие данные в JSON для переноса:

**Brand:**
- title: "Svetlana K-Liée"
- subtitle (4 языка): "Contemporary Artist" / "Современный художник" / ...
- quote (4 языка): "I am the Artist - This is my Vision" / ...

**Social Links (7 шт):**
1. Instagram (Official.k.liee)
2. Instagram RU (svetlana.k.liee) — badge: "RU"
3. Telegram (SvetlanaKliee)
4. YouTube (@SvetlanaKLiee)
5. Pinterest (svetaklie)
6. TikTok (@svetlanakliee_art)
7. OpenSea (k-lieesculptures)

**Contact:**
- email: info@k-lie.com

---

## Критерии успеха (DoD)

- [ ] Footer на сайте показывает данные из SQLite
- [ ] Изменения в админке `/layout/footer` отражаются на сайте (после refresh)
- [ ] Social links: только `is_visible = true`, сортировка по `order_index`
- [ ] i18n работает: subtitle, quote, contact title переводятся по locale
- [ ] `data/footer.json` удалён или backup
- [ ] `npm run check` — 0 ошибок
- [ ] `npm run build` — успешен

---

## Чек-лист браузера

- [ ] https://k-liee.com/en — футер показывает соцсети из БД
- [ ] https://k-liee.com/ru — футер на русском (subtitle, quote)
- [ ] Админка → добавить соцсеть → сайт показывает её
- [ ] Админка → скрыть соцсеть (is_visible=false) → сайт не показывает
- [ ] Консоль браузера без ошибок

---

## Score

| Критерий | Значение | Множитель | Итого |
|----------|----------|-----------|-------|
| Сложность | 2 (логика) | ×3 | 6 |
| Файлы | 3 (4-6 файлов) | ×2 | 6 |
| Риск | 2 (компоненты) | ×2 | 4 |
| Время | 2 (10-30 мин) | ×1 | 2 |
| **ИТОГО** | | | **18** |

**→ Developer task**

---

*Создано: CLI (Integrator)*
