# Feedback после Production QA - k-liee.com Shop Page

**Deploy date:** 2025-12-21 18:00 UTC
**Environment:** Production (https://k-liee.com/en/shop)
**Branch tested:** main (commit: 01fbca4)
**QA performed by:** Claude Code CLI (playwright browser testing)
**Status:** ⚠️ PARTIAL DEPLOY - TypeScript clean, но runtime API errors

---

## 📊 Summary

- **TypeScript errors:** 0 ✅ (исправлено в commit 01fbca4)
- **Deploy status:** ✅ SUCCESS (сайт работает)
- **Runtime errors:** 3 CRITICAL bugs (API 502/500 errors)
- **Working features:** Wishlist ✅, UI/UX ✅, Images ✅
- **Broken features:** Cart ❌, Product Detail ❌, Pagination ❌

---

## ✅ Что работает отлично:

1. **Shop page loads** - https://k-liee.com/en/shop загружается ✅
   - 12 товаров отображаются с изображениями
   - UI responsive и красивый
   - Цены, названия, Featured badges видны

2. **Wishlist functionality** - работает ИДЕАЛЬНО ✅
   - Кнопка "Add to Wishlist" → "Remove from Wishlist"
   - Счетчик в header обновляется (0 → 1)
   - Без ошибок в консоли
   - Визуально корректно

3. **Header/Footer** - загружаются из БД ✅
4. **Theme switching** - Light/Dark mode работает ✅
5. **Language switching** - EN/RU/ES/ZH работает ✅

---

## 🐛 КРИТИЧЕСКИЕ Баги (требуют срочного исправления):

### Bug 1: Cart API возвращает 502 Bad Gateway ❌
**Score:** 19 (Сложность:3 × 3=9, Файлы:2 × 2=4, Риск:2 × 2=4, Время:2 × 1=2)
**Priority:** CRITICAL
**Impact:** Пользователи **НЕ МОГУТ** добавлять товары в корзину - **магазин не работает!**

**Симптомы в консоли:**
```javascript
[ERROR] Failed to load resource: the server responded with a status of 502 () @ https://k-liee.com/a...
[ERROR] Cart init error: Error: Failed to fetch cart
    at E.init (https://k-liee.com/_app/immutable/...)
[ERROR] Add to cart error: Error: Failed to add item
    at E.addItem (https://k-liee.com/_app/immutable/...)
```

**Steps to reproduce:**
1. Открыть https://k-liee.com/en/shop
2. Нажать "Add to Cart" на любом товаре
3. **Expected:** Товар добавлен в корзину, счетчик cart обновился, success toast
4. **Actual:**
   - Error toast: "Failed to add item"
   - Console: 502 Bad Gateway
   - Cart counter остается 0

**Console errors при загрузке страницы:**
- `Cart init error: Error: Failed to fetch cart` (повторяется 3+ раза)
- Каждая попытка инициализации корзины падает с 502

**API endpoint (предположительно):**
- `GET /api/shop/cart` → 502 (fetch cart on init)
- `POST /api/shop/cart` → 502 (add item to cart)

**Files involved:**
- Cart store: вероятно `src/lib/stores/cart.ts` или аналог
- API route: `src/routes/api/shop/cart/+server.ts`
- Shop page: `src/routes/[lang=locale]/shop/+page.svelte`

**Root cause (гипотеза):**
Backend API endpoint не работает. Возможные причины:
1. **Backend Express.js не запущен** - проверь PM2
2. **Nginx proxy не настроен** для `/api/*` routes
3. **Route handler отсутствует** или имеет ошибки
4. **CORS issues** - API блокирует запросы от frontend

**Suggested fix:**

**Step 1: Проверь backend status**
```bash
# SSH на production
ssh webmaster@myappbutik.ru

# Проверь PM2 процессы
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 list

# Должен быть backend process, например:
# ┌─────┬────────────────────┬─────────┬─────────┐
# │ id  │ name               │ status  │ restart │
# ├─────┼────────────────────┼─────────┼─────────┤
# │ 0   │ k-liee-frontend    │ online  │ 0       │
# │ 1   │ k-liee-backend     │ online  │ 0       │ ← Должен быть!
# └─────┴────────────────────┴─────────┴─────────┘

# Если backend нет - запусти его!
```

**Step 2: Проверь nginx config**
```bash
# Проверь nginx конфигурацию
cat /etc/nginx/sites-available/k-liee.com | grep -A 10 "location /api"

# Должно быть что-то вроде:
# location /api/ {
#     proxy_pass http://localhost:3001/;  # Backend port
#     proxy_http_version 1.1;
#     # ... другие proxy headers
# }
```

**Step 3: Проверь backend logs**
```bash
# Логи backend
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 logs k-liee-backend --lines 50

# Ищи ошибки при инициализации или обработке /api/shop/cart
```

**Step 4: Убедись что cart API endpoint существует**
```typescript
// backend-expressjs/src/routes/cart.ts (или аналог)
// Должны быть handlers:

// GET /api/shop/cart - получить корзину по session_id
router.get('/cart', async (req, res) => {
  const sessionId = req.cookies.cart_session_id || generateSessionId();
  const cart = await getCartBySessionId(sessionId);
  res.json(cart);
});

// POST /api/shop/cart - добавить товар
router.post('/cart', async (req, res) => {
  const { artworkId, quantity } = req.body;
  const sessionId = req.cookies.cart_session_id || generateSessionId();
  await addItemToCart(sessionId, artworkId, quantity);
  res.json({ success: true });
});

// DELETE /api/shop/cart/:itemId - удалить товар
router.delete('/cart/:itemId', async (req, res) => {
  await removeItemFromCart(req.params.itemId);
  res.json({ success: true });
});
```

---

### Bug 2: Product detail page возвращает 502 ❌
**Score:** 17 (Сложность:3 × 3=9, Файлы:1 × 2=2, Риск:2 × 2=4, Время:2 × 1=2)
**Priority:** CRITICAL
**Impact:** Пользователи **НЕ МОГУТ** посмотреть детали товара - **конверсия 0%!**

**Steps to reproduce:**
1. Открыть https://k-liee.com/en/shop
2. Кликнуть на любой товар (например, "Chebu-Rasha Throwing Up Eyes")
3. **Expected:** Открывается детальная страница:
   - Большие изображения (lightbox/gallery)
   - Полное описание на текущем языке
   - Кнопка "Add to Cart"
   - Цена, размеры, техника
4. **Actual:**
   - Белая страница с "502 Server Error"
   - URL: https://k-liee.com/en/shop/chebu-rasha-throwing-up-eyes
   - Page Title: `502 - K-LIÉE`
   - Error message: "Something went wrong on our end. Please try again later."

**Console errors:**
```
[ERROR] Failed to load resource: 502 @ https://k-liee.com/a...
```

**Files involved:**
- `src/routes/[lang=locale]/shop/[slug]/+page.server.ts` - SSR load function
- `src/routes/[lang=locale]/shop/[slug]/+page.svelte` - detail page UI
- Backend API: `GET /api/artworks/:slug` или `GET /api/shop/products/:slug`

**Root cause (гипотеза):**
1. **Load function делает fetch к несуществующему API endpoint**
2. **Backend API endpoint существует но возвращает 502** (тот же backend issue что и Bug 1)
3. **Load function падает с ошибкой** (unhandled exception → 502)

**Suggested fix:**

**Step 1: Проверь load function**
```typescript
// src/routes/[lang=locale]/shop/[slug]/+page.server.ts
export async function load({ params, fetch }) {
  try {
    // Проверь какой URL используется!
    const response = await fetch(`/api/shop/products/${params.slug}`);

    // Добавь error handling!
    if (!response.ok) {
      console.error(`Product API error: ${response.status} ${response.statusText}`);
      throw error(response.status, `Product not found: ${params.slug}`);
    }

    const product = await response.json();
    return { product };
  } catch (err) {
    console.error('Load function error:', err);
    throw error(500, 'Failed to load product');
  }
}
```

**Step 2: Проверь backend API endpoint**
```bash
# Тест напрямую через curl
curl https://k-liee.com/api/shop/products/chebu-rasha-throwing-up-eyes

# Ожидается: JSON с данными товара
# Если 502/500 - backend не работает
```

**Step 3: Проверь slug mapping**
```typescript
// Убедись что slug корректно конвертируется в ID или используется напрямую
// Возможно проблема в camelCase vs snake_case при query к БД
```

---

### Bug 3: Load More pagination возвращает 500 ❌
**Score:** 15 (Сложность:3 × 3=9, Файлы:1 × 2=2, Риск:1 × 2=2, Время:2 × 1=2)
**Priority:** HIGH (не критично, но ухудшает UX)
**Impact:** Пользователи видят только первые 12 из 37 товаров - **65% товаров скрыто!**

**Steps to reproduce:**
1. Открыть https://k-liee.com/en/shop
2. Показывается: "Showing 12 of 37 artworks"
3. Скроллить вниз до кнопки "Load More"
4. Нажать "Load More"
5. **Expected:**
   - Загружаются следующие 12 товаров (13-24)
   - Кнопка остается, показывает "Showing 24 of 37"
   - Или если все загружены - кнопка исчезает
6. **Actual:**
   - Page перезагружается на `/shop?page=2`
   - Показывается "500 Server Error"
   - Page Title: `500 - K-LIÉE`

**Console errors:**
```javascript
[ERROR] Failed to load resource: 502 @ https://k-liee.com/a...
[ERROR] SyntaxError: Failed to execute 'json' on 'Response': Unexpected token '<', "<html>
<h"... is not valid JSON
```

**Root cause:**
- Backend API возвращает **HTML error page** вместо JSON
- Frontend пытается парсить HTML как JSON → SyntaxError
- Load function не обрабатывает ошибку корректно

**Files involved:**
- `src/routes/[lang=locale]/shop/+page.server.ts` - pagination logic
- `src/routes/[lang=locale]/shop/+page.svelte` - Load More button
- Backend API: `GET /api/shop/products?page=2&limit=12`

**Suggested fix:**

**Step 1: Проверь load function**
```typescript
// src/routes/[lang=locale]/shop/+page.server.ts
export async function load({ url, fetch }) {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 12;
  const offset = (page - 1) * limit;

  try {
    const apiUrl = `/api/shop/products?offset=${offset}&limit=${limit}`;
    console.log('Fetching:', apiUrl);

    const response = await fetch(apiUrl);

    // Проверь content-type ПЕРЕД парсингом JSON!
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.error('API returned non-JSON:', contentType);
      const text = await response.text();
      console.error('Response:', text);
      throw error(500, 'Invalid API response');
    }

    if (!response.ok) {
      throw error(response.status, 'Failed to load products');
    }

    const data = await response.json();
    return {
      products: data.products || [],
      total: data.total || 0,
      page,
      limit
    };
  } catch (err) {
    console.error('Load error:', err);
    throw error(500, 'Failed to load products');
  }
}
```

**Step 2: Проверь backend pagination endpoint**
```bash
# Тест pagination
curl "https://k-liee.com/api/shop/products?offset=12&limit=12"

# Ожидается: JSON вида:
# {
#   "products": [...],
#   "total": 37,
#   "offset": 12,
#   "limit": 12
# }
```

**Step 3: Frontend Load More button**
```svelte
<!-- Убедись что Load More делает правильный request -->
<button
  onclick={() => {
    // Option A: Client-side pagination (рекомендуется)
    page++;
    goto(`?page=${page}`, { invalidateAll: true });

    // Option B: Infinite scroll (более сложно)
    // fetchMoreProducts().then(newProducts => products = [...products, ...newProducts]);
  }}
>
  Load More
</button>
```

---

## 🔍 Root Cause Analysis

### Общая проблема: Backend API не работает

**Все 3 бага связаны с одной проблемой:** Backend API endpoints возвращают 502/500 вместо JSON.

**Возможные причины:**

1. **Backend Express.js сервер не запущен**
   ```bash
   pm2 list | grep backend
   # Если нет - запусти backend!
   ```

2. **Nginx proxy не настроен для /api/ routes**
   ```nginx
   # /etc/nginx/sites-available/k-liee.com
   location /api/ {
       proxy_pass http://localhost:3001/;  # Backend port
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```

3. **Backend API routes не реализованы**
   ```typescript
   // backend-expressjs/src/index.ts
   import cartRouter from './routes/cart';
   import productsRouter from './routes/products';

   app.use('/api/shop', cartRouter);
   app.use('/api/shop', productsRouter);
   ```

4. **CORS issues** - backend блокирует frontend запросы
   ```typescript
   // backend-expressjs/src/index.ts
   import cors from 'cors';
   app.use(cors({
     origin: 'https://k-liee.com',
     credentials: true
   }));
   ```

---

## 📝 Implementation Checklist

**Приоритет 1: Запусти backend (если не запущен)**
- [ ] SSH на production
- [ ] `pm2 list` - проверь статус backend
- [ ] Если нет - запусти: `cd backend-expressjs && pm2 start ecosystem.config.js`
- [ ] `pm2 logs backend-name` - проверь логи на ошибки

**Приоритет 2: Проверь nginx proxy**
- [ ] `cat /etc/nginx/sites-available/k-liee.com | grep -A 10 location`
- [ ] Убедись что `/api/` routes проксируются на backend port
- [ ] Если изменения нужны - `sudo nginx -t && sudo systemctl reload nginx`

**Приоритет 3: Реализуй API endpoints**
- [ ] Cart API: `GET /api/shop/cart`, `POST /api/shop/cart`, `DELETE /api/shop/cart/:id`
- [ ] Products API: `GET /api/shop/products?offset=X&limit=Y`
- [ ] Product detail API: `GET /api/shop/products/:slug`
- [ ] Добавь error handling и CORS

**Приоритет 4: Добавь proper error handling**
- [ ] Load functions - проверка content-type перед JSON parsing
- [ ] Backend - возвращай JSON errors, не HTML
- [ ] Frontend - graceful error messages для пользователей

**После исправления:**
```bash
# Локально (если есть backend):
cd backend-expressjs
npm run dev

# Тест endpoints:
curl http://localhost:3001/api/shop/cart
curl http://localhost:3001/api/shop/products
curl http://localhost:3001/api/shop/products/chebu-rasha-throwing-up-eyes

# Commit + push:
git add .
git commit -m "fix(backend): implement shop API endpoints

- Added cart API (GET, POST, DELETE)
- Added products API with pagination
- Added product detail API by slug
- Fixed CORS configuration
- Added error handling
"
git push origin claude/your-branch
```

---

## 💡 Recommendations

### 1. Centralized API client
```typescript
// lib/utils/api.ts
export async function apiClient(url: string, options = {}) {
  const response = await fetch(url, options);

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error('API returned non-JSON response');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}
```

### 2. Backend health check endpoint
```typescript
// backend-expressjs/src/routes/health.ts
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test: curl https://k-liee.com/api/health
```

### 3. Frontend error boundaries
```svelte
<!-- lib/components/ErrorBoundary.svelte -->
{#if error}
  <div class="error-message">
    <h2>Oops! Something went wrong</h2>
    <p>{error.message}</p>
    <button onclick={retry}>Try Again</button>
  </div>
{:else}
  <slot />
{/if}
```

---

## 🎯 Expected Outcome

После исправления:

**1. Cart должна работать:**
```
✅ Open /shop
✅ Click "Add to Cart"
✅ Cart counter увеличивается (0 → 1)
✅ Success toast: "Added to cart"
✅ No console errors
```

**2. Product detail должна работать:**
```
✅ Click на товар
✅ Открывается /shop/:slug
✅ Показываются изображения, описание, цена
✅ "Add to Cart" работает
```

**3. Pagination должна работать:**
```
✅ Click "Load More"
✅ URL: /shop?page=2
✅ Загружаются следующие 12 товаров
✅ Общий счетчик: "Showing 24 of 37"
```

---

## 📞 Next Steps

1. **Запусти backend** - проверь PM2, nginx
2. **Реализуй API endpoints** - cart, products, product detail
3. **Тест локально** - curl endpoints
4. **Deploy на production**
5. **Сообщи мне** - я выполню повторное QA

**Отличная работа с frontend! Теперь нужен backend для полного функционала.** 🚀

---

**Сгенерировано:** Claude Code CLI
**Дата:** 2025-12-21 18:15 UTC
**Workflow:** v2.0 (CLI = QA → Feedback, Web = Development → Fix)
