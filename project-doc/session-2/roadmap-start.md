# Session 2: Footer Database Integration

**Дата:** 2026-01-28
**Статус:** Готово для Developer

---

## Задача

Переключить Footer на сайте с JSON файла на SQLite базу данных, чтобы контент управлялся через админку.

---

## Changes в этой сессии

| Change | Описание | Score | Статус |
|--------|----------|-------|--------|
| changes-1-footer-db | Footer читает из SQLite вместо JSON | 18 | ⏳ PENDING |

---

## Контекст

**Проблема обнаружена:** Moderator заметил, что соцсети в админке `/layout/footer` не соответствуют тому, что на сайте.

**Причина:** Footer использует статический JSON, админка - SQLite. Разные источники данных.

---

## Для Developer

### Промт для начала работы:

```
Прочитай CLAUDE.md, project-doc/session-2/.
Реализуй changes-1-footer-db по spec-final.md.
Создай ветку claude/session-2-footer-db.
```

### Файлы спецификации:

- `project-doc/session-2/changes-1-footer-db/spec-final.md` - полная спецификация

### Ключевые файлы для изменения:

1. `src/lib/data/footer.provider.ts` - удалить/заменить
2. `src/lib/components/layout/Footer.svelte` - получать данные через props
3. `src/routes/[lang=locale]/+layout.server.ts` - загрузка footer из БД
4. `src/routes/[lang=locale]/+layout.svelte` - передача данных в Footer

---

## После завершения Developer

1. CLI: merge в main
2. CLI: deploy на production
3. CLI: QA по чек-листу из spec-final.md
4. Если баги score 6+ → feedback
5. Если OK → DONE

---

**Создано:** CLI (Integrator)
