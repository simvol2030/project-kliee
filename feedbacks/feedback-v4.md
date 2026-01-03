# HOTFIX: Build Error - Server Import in Client Code

**Priority:** CRITICAL (блокирует deploy)
**Branch:** `claude/implement-assignment-PD1v7`

---

## Ошибка

```
Cannot import $lib/server/db/client.ts into code that runs in the browser

src/routes/[lang=locale]/catalog/+page.ts imports
  $lib/data/artworks.provider.ts imports
   $lib/server/db/client.ts
```

## Причина

`artworks.provider.ts` теперь использует Drizzle ORM (серверный код), но импортируется в `+page.ts` который может выполняться на клиенте.

## Решение

Переименовать `+page.ts` → `+page.server.ts` для всех файлов которые используют `artworks.provider.ts`:

1. `src/routes/[lang=locale]/catalog/+page.ts` → `+page.server.ts`
2. `src/routes/[lang=locale]/works/[slug]/+page.ts` → возможно тоже

Или создать отдельный серверный provider.

## Файлы для проверки

```
src/routes/[lang=locale]/catalog/+page.ts
src/routes/[lang=locale]/works/[slug]/+page.ts
src/lib/data/artworks.provider.ts
```

## После исправления

```bash
npm run build  # должен пройти без ошибок
git add . && git commit -m "fix: move catalog data loading to server"
git push origin claude/implement-assignment-PD1v7
```

Сообщи когда готово - я сделаю повторный merge и deploy.
