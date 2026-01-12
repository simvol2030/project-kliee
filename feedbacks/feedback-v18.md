# Feedback v18 - Media Upload Sharp Module Error

**Дата:** 2026-01-12
**Environment:** https://k-liee.com/media
**Severity:** CRITICAL - Media upload completely broken

---

## Что работает
- [x] Страница /media загружается
- [x] Кнопка "Upload Images" открывает file chooser
- [x] Файл выбирается и отправляется на сервер

## Что НЕ работает
- [ ] POST /api/media/upload возвращает 500 ошибку
- [ ] Изображения не загружаются вообще

---

## Bug 1: Sharp native module cannot load

**Score:** 18+
- Сложность: 3 (native module bundling) × 3 = 9
- Файлы: 2-3 (vite.config, possibly rollup config, api endpoint) × 2 = 4-6
- Риск: 2 (build/bundling system) × 2 = 4
- Время: 2 (>10 min) × 1 = 2
- **Total: ~18-21**

### Описание проблемы

При загрузке изображения Sharp (native Node.js image processing library) не может загрузить свой native binary (.node файл).

### Точная ошибка (из PM2 логов)

```
Error: Could not load the "sharp" module using the linux-x64 runtime

Possible solutions:
- Install with verbose logging and look for errors: "npm install --ignore-scripts=false --foreground-scripts --verbose sharp"
- Install for the current linux-x64 runtime: "npm install --platform=linux --arch=x64 sharp"
- Consult the installation documentation: https://sharp.pixelplumbing.com/install

undefined: Could not dynamically require "@img/sharp-linux-x64/sharp.node".
Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.
```

### Файлы задействованы

1. **`src/routes/api/media/upload/+server.ts`** - использует sharp:
   ```typescript
   import sharp from 'sharp';
   // Строка ~109: metadata = await sharp(buffer).metadata();
   // Строки ~180-186: thumbnails creation
   await sharp(buffer)
     .resize(size.width, size.height, { fit: 'inside', withoutEnlargement: true })
     .webp({ quality: 80 })
     .toFile(thumbPath);
   ```

2. **`vite.config.ts`** - уже добавлен fix (не работает):
   ```typescript
   ssr: {
     // Sharp is a native module - must be loaded from node_modules at runtime
     external: ['sharp']
   }
   ```

### Что уже попробовано (CLI)

1. Добавил `ssr: { external: ['sharp'] }` в vite.config.ts
2. Закоммитил и запушил
3. На сервере:
   - `git pull origin main`
   - Удалил `build/` и `.svelte-kit/`
   - `npm run build` (чистая сборка)
   - `pm2 restart k-liee-frontend`
4. **Результат:** Та же 500 ошибка

### Почему не работает

SvelteKit с adapter-node при сборке использует Rollup. Опция `ssr.external` должна исключить sharp из bundling, но:
- Либо Rollup всё равно пытается его бандлить
- Либо @rollup/plugin-commonjs требует дополнительной конфигурации для dynamic requires
- Либо native .node файлы не копируются в build директорию

### Предлагаемые решения (для Developer)

**Вариант A: Настройка Rollup/CommonJS plugin**
Добавить в vite.config.ts или отдельный rollup.config:
```typescript
commonjs({
  ignoreDynamicRequires: true,
  // или
  dynamicRequireTargets: ['node_modules/@img/sharp-*/sharp.node']
})
```

**Вариант B: Использовать noExternal + external вместе**
```typescript
ssr: {
  external: ['sharp', '@img/sharp-linux-x64'],
  noExternal: [] // убедиться что не конфликтует
}
```

**Вариант C: Переустановить sharp с platform флагами на сервере**
```bash
npm install --platform=linux --arch=x64 sharp
```

**Вариант D: Заменить sharp на jimp (pure JS альтернатива)**
- Плюс: Нет native modules, работает везде
- Минус: Медленнее, меньше функций
- Требует рефакторинг createThumbnails()

**Вариант E: Вынести обработку изображений в отдельный worker/microservice**
- Самый надёжный, но сложный

### Рекомендация

Попробовать **Вариант A или B** сначала (наименьшие изменения). Если не помогает - **Вариант C** на сервере. **Вариант D** как последний резорт.

---

## Steps to reproduce

1. Зайти на https://k-liee.com/login
2. Авторизоваться (admin@kliee.com)
3. Перейти на https://k-liee.com/media
4. Нажать "Upload Images"
5. Выбрать любое изображение
6. Получить ошибку в консоли: `POST /api/media/upload 500`

---

## Чек-лист для проверки после fix

- [ ] POST /api/media/upload возвращает 200/201
- [ ] Изображение сохраняется в static/uploads/
- [ ] Thumbnails создаются
- [ ] Изображение появляется в галерее на странице /media
- [ ] Консоль браузера без 500 ошибок
- [ ] PM2 логи без ошибок Sharp

---

**Создано:** CLI Integrator
**Для:** Claude Code Web (Developer)
