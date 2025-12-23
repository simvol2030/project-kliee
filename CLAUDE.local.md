# CLAUDE.local.md - Workflow v4.2 (Single Branch)

## Роли

| Роль | Агент | Ответственность |
|------|-------|-----------------|
| **Moderator** | Пользователь | Задачи, решения, координация |
| **Developer** | Claude Code Web | Код, фичи, баги (score 6+) |
| **Integrator** | Claude Code CLI | Deploy, QA, hot-fix, merge в main (score 0-5) |

---

## Главное правило v4.2

> **Работаем только с веткой `main`**. Ветки `dev` нет!

```
GitHub:
├── main              ← единственная постоянная ветка
└── claude/*          ← временные ветки (удаляются после merge)
```

---

## Полная схема (Single Branch)

```
┌─────────────────────────────────────────────────────────┐
│  Claude Code Web (разработка)                           │
│  ветка claude/* → commit → push                         │
└─────────────────────────────────────────────────────────┘
                         ↓ merge сразу в main
┌─────────────────────────────────────────────────────────┐
│  main ветка (GitHub)                                    │
│  - единственный source of truth                         │
└─────────────────────────────────────────────────────────┘
                         ↓ deploy
┌─────────────────────────────────────────────────────────┐
│  Production (сервер)                                    │
│  git pull origin main → build → pm2 restart             │
└─────────────────────────────────────────────────────────┘
                         ↓ QA
┌─────────────────────────────────────────────────────────┐
│  Баги найдены?                                          │
│  Score 0-5: CLI фиксит → push main                      │
│  Score 6+: feedback → Claude Web                        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Локально (WSL) - pull когда нужно                      │
│  git pull origin main                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Быстрый цикл

```
Claude Web → claude/* → merge main → deploy → QA → hot-fix → push main
```

Локальный pull делаем только когда нужна стабильная версия.

---

## Скоринг задач

**Формула:**
```
Score = (Сложность × 3) + (Файлы × 2) + (Риск × 2) + (Время × 1)
```

| Критерий | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| Сложность (×3) | Текст/опечатки | Конфиги | CSS/простая логика | Бизнес-логика |
| Файлы (×2) | 1 файл | 2-3 | 4-6 | 7+ |
| Риск (×2) | Контент/стили | Компоненты | БД/API/auth | - |
| Время (×1) | <2 мин | 2-10 мин | >10 мин | - |

**Классификация:**
- **0-5** → CLI делает сам
- **6-10** → Обсуждаем
- **11+** → Claude Web делает

---

## Feedbacks

**Директория:** `/feedbacks/`

**Формат:** `feedback-v1.md`, `feedback-v2.md`, ...

**Структура файла:**
```markdown
# Feedback vX - [Краткое описание]

**Дата:** YYYY-MM-DD
**Environment:** Production URL
**Branch to create:** claude/task-name-vX

## Что работает
- ...

## Баги (score 6+)
### Bug 1: [Название]
- **Score:** X
- **Steps:** ...
- **Expected/Actual:** ...
- **Files:** ...

## Мелкие правки (score 0-5) - уже сделано CLI
- ...
```

---

## Цикл разработки

```
1. Moderator    → Ставит задачу
2. Developer    → Код в ветке claude/*, commit, push
3. Integrator   → SSH, merge в main, build, deploy
4. Integrator   → QA (playwright), скоринг
5. Integrator   → Hot-fix (0-5) → push main
6. Integrator   → feedback-vX.md (если баги 6+)
7. Moderator    → Передаёт feedback Developer'у
8. [Повтор 2-7 пока не OK]
```

---

## CLI Integrator - быстрая справка

**Делаю:**
- Deploy: `git pull main → build → pm2 restart`
- QA в браузере (playwright)
- Hot-fix на сервере (score 0-5) → push main
- Скоринг багов
- `feedback-vX.md` для Claude Web

**НЕ делаю:**
- Сложные баги (score 6+) → Claude Web
- Новые фичи → Claude Web
- Рефакторинг → Claude Web

---

## Команды

### Deploy на production:
```bash
ssh webmaster@myappbutik.ru
cd /opt/websites/k-liee.com
git pull origin main
cd frontend-sveltekit
/home/webmaster/.nvm/versions/node/v22.15.0/bin/npm run build
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 restart k-liee-frontend
```

### Merge ветки Claude Web:
```bash
# На сервере
cd /opt/websites/k-liee.com
git fetch origin
git merge origin/claude/branch-name --no-ff -m "feat: description"
# Затем build + restart
```

### Hot-fix на сервере:
```bash
cd /opt/websites/k-liee.com
# Внести правки...
git add . && git commit -m "fix: description"
git push origin main
```

### Локальная синхронизация:
```bash
cd /home/solo18/dev/project-kliee/project/project-box-combo-1
git pull origin main
```

### Health check:
```bash
curl -s https://k-liee.com/en | grep -q "K-LIÉE" && echo "OK"
```

### Rollback:
```bash
git revert HEAD
npm run build && pm2 restart k-liee-frontend
```

---

## Структура веток

```
GitHub:
├── main              ← единственная постоянная ветка
└── claude/*          ← временные ветки Claude Web

Сервер:
└── main              ← всегда на main

Локально:
└── main              ← синхронизируется с GitHub
```

**НЕТ ветки `dev`!**

---

## Очистка Git репозитория

Если git раздулся из-за изображений (проверка: `du -sh .git`):

**Решение - чистый старт:**
```bash
# 1. GitHub: переименовать старый репо → project-OLD
# 2. GitHub: создать новый пустой репо

# 3. На сервере:
rm -rf .git
git init
git add .
git commit -m "Clean start"
git remote add origin git@github.com:USER/PROJECT.git
git push -u origin main

# 4. Локально:
rm -rf project-folder
git clone git@github.com:USER/PROJECT.git
```

**Важно:** `.gitignore` должен содержать `*.jpg`, `*.png`, `static-images/`

---

*Версия: 4.2 | Обновлено: 2025-12-23 | Single Branch (main only)*
