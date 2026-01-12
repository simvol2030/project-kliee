# Feedback v19 - Sharp Module STILL NOT WORKING

**Дата:** 2026-01-12
**Environment:** https://k-liee.com/media
**Severity:** CRITICAL - Media upload still broken
**Previous:** feedback-v18.md

---

## Что попробовано (НЕ работает)

### 1. CLI попробовал (feedback-v18):
```typescript
ssr: { external: ['sharp'] }
```
**Результат:** Не работает

### 2. Developer попробовал (коммит 29b97ea):
```typescript
ssr: {
  external: ['sharp', '@img/sharp-linux-x64', '@img/sharp-darwin-arm64', '@img/sharp-win32-x64']
},
optimizeDeps: {
  exclude: ['sharp', '@img/sharp-linux-x64', '@img/sharp-darwin-arm64', '@img/sharp-win32-x64']
},
// + skip in manualChunks
if (id.includes('sharp') || id.includes('@img/sharp')) return undefined;
```
**Результат:** Не работает

### 3. CLI попробовал reinstall на сервере:
```bash
npm install --os=linux --cpu=x64 sharp
rm -rf build .svelte-kit
npm run build
pm2 restart k-liee-frontend
```
**Результат:** Не работает

---

## Актуальная ошибка

```
Error: Could not load the "sharp" module using the linux-x64 runtime

undefined: Could not dynamically require "@img/sharp-linux-x64/sharp.node".
Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option
of @rollup/plugin-commonjs appropriately for this require call to work.

at requireSharp (file:///opt/websites/k-liee.com/frontend-sveltekit/build/server/chunks/v4-EDzXhFaV.js:2744:10)
```

---

## Анализ проблемы

**Почему не работает ssr.external:**

SvelteKit adapter-node использует Rollup для bundling серверного кода. Несмотря на `ssr.external`, Rollup всё равно бандлит JS-обёртку sharp в `v4-EDzXhFaV.js`.

Когда этот бандл запускается на сервере, он пытается `dynamicRequire` native .node файл, но:
1. .node файл не скопирован в build/
2. Путь в бандле не соответствует реальному расположению в node_modules

**Ключевое:** `ssr.external` НЕ работает для native modules в SvelteKit adapter-node!

---

## Рекомендуемое решение: Вариант D - Заменить sharp на jimp

**Почему jimp:**
- Pure JavaScript - нет native modules
- Работает везде без проблем с bundling
- Достаточно функционала для thumbnails

**Что нужно изменить:**

Файл: `src/routes/api/media/upload/+server.ts`

```typescript
// БЫЛО:
import sharp from 'sharp';

// СТАНЕТ:
import Jimp from 'jimp';

// БЫЛО (metadata):
metadata = await sharp(buffer).metadata();

// СТАНЕТ:
const image = await Jimp.read(buffer);
metadata = {
  width: image.getWidth(),
  height: image.getHeight(),
  format: image.getMIME().split('/')[1]
};

// БЫЛО (thumbnails):
await sharp(buffer)
  .resize(size.width, size.height, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(thumbPath);

// СТАНЕТ:
const thumb = await Jimp.read(buffer);
await thumb
  .scaleToFit(size.width, size.height)
  .quality(80)
  .writeAsync(thumbPath.replace('.webp', '.jpg')); // jimp не поддерживает webp
```

**Установка:**
```bash
npm uninstall sharp
npm install jimp
```

---

## Альтернатива: Вариант E - Динамический import

Если хотим сохранить sharp, можно попробовать динамический import:

```typescript
// Вместо статического import
// import sharp from 'sharp';

// Использовать динамический
const sharp = await import('sharp').then(m => m.default);
```

Это МОЖЕТ помочь, но не гарантировано.

---

## Score

**21+** (выше порога)
- Сложность: 3 × 3 = 9 (замена библиотеки)
- Файлы: 2 × 2 = 4 (upload/+server.ts, package.json)
- Риск: 3 × 2 = 6 (API endpoint)
- Время: 2 × 1 = 2 (>10 min)

---

## Чек-лист после fix

- [ ] `npm uninstall sharp` выполнен
- [ ] `npm install jimp` выполнен
- [ ] upload/+server.ts изменён на jimp API
- [ ] `npm run check` проходит без ошибок
- [ ] `npm run build` успешен
- [ ] POST /api/media/upload возвращает 200/201
- [ ] Изображение сохраняется в static/uploads/
- [ ] Thumbnails создаются (.jpg вместо .webp)
- [ ] PM2 логи без ошибок

---

**Создано:** CLI Integrator
**Для:** Claude Code Web (Developer)
**Рекомендация:** Вариант D (jimp) - наиболее надёжное решение
