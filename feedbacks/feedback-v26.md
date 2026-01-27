# Feedback v26 - Media Picker CSS Bug

**Дата:** 2026-01-27
**Session:** После deploy feedback-v25
**Коммит main:** 0e8c771
**Branch to create:** `claude/media-picker-css-v26`

---

## Контекст

После deploy feedback-v25 обнаружен CSS баг в Media Picker. Основные задачи v25 выполнены:
- ✅ CSRF Chatbot
- ✅ NFT Video URL (radio buttons, YouTube/Vimeo support)
- ✅ Публичная страница NFT (табы при наличии обоих медиа)

---

## Bug: Горизонтальные линии в Media Picker grid

- **Score:** 5 (Сложность: 1×3=3, Файлы: 1×2=2, Риск: 0×2=0, Время: 0×1=0)
- **Где:** `src/lib/components/admin/MediaPicker.svelte`

### Steps to reproduce

1. Открыть https://k-liee.com/nft/1
2. Нажать кнопку "Change" у Image
3. Открывается Media Picker popup
4. **Ожидается:** Grid с изображениями, чётко разделёнными
5. **Фактически:** Под каждым изображением множество горизонтальных линий ("гармошка")

### Скриншот

См. `.playwright-mcp/media-picker-grid-check.png` — под каждой картинкой видны горизонтальные полосы.

### Вероятная причина

В feedback-v25 были добавлены стили для grid items. Возможно:
1. `aspect-ratio` конфликтует с flex/grid
2. Placeholder или loading state отображается некорректно
3. Border или pseudo-elements размножаются
4. Dark mode стили создают артефакты

### Файл для исправления

```
src/lib/components/admin/MediaPicker.svelte
```

### Предложение

1. Проверить добавленные в v25 стили для `.media-item`
2. Убрать или исправить источник горизонтальных линий
3. Протестировать в light и dark mode

---

## После исправления

```bash
git checkout main
git pull origin main
git checkout -b claude/media-picker-css-v26

# После фикса
git add .
git commit -m "fix(admin): remove horizontal lines in MediaPicker grid - feedback v26"
git push origin claude/media-picker-css-v26
```

**Уведомить CLI:** "Готово, ветка claude/media-picker-css-v26 готова к интеграции"

---

*Feedback создан: 2026-01-27*
*Интегратор: Claude Code CLI*
