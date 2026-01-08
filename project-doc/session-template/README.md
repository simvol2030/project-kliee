# Session Template

## Как использовать

1. **Скопируй папку:**
   ```bash
   cp -r session-template session-N
   ```

2. **Переименуй changes:**
   ```bash
   mv session-N/changes-template session-N/changes-1-название
   ```

3. **Заполни файлы** по порядку:
   - `spec-v1.md` — Moderator наговаривает
   - CLI структурирует → `spec-v2.md`
   - Итерации → `spec-final.md`
   - Developer: `research.md` → `tech-spec.md` → `plan.md`

4. **Обнови roadmap-start.md**

---

## Структура

```
session-N/
├── changes-1-название/
│   ├── spec-v1.md      ← Moderator
│   ├── spec-v2.md      ← CLI
│   ├── spec-final.md   ← Финал
│   ├── research.md     ← Developer
│   ├── tech-spec.md    ← Developer
│   └── plan.md         ← Developer
├── roadmap-start.md    ← Moderator + CLI
└── roadmap-final.md    ← Developer
```
