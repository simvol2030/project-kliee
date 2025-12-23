# Priority Implementation Plan - K-LIÉE Portfolio

**Created:** 2025-12-20
**Version:** 2.0 (Audited)
**Status:** Ready for Implementation

---

## AUDIT LOG (v2.0)

**Issues Fixed:**
- ✅ Added missing DB tables: `biography`, `education`, `awards`
- ✅ Fixed e-commerce schema: nullable `userId` for guest checkout
- ✅ Added `refundedAt`, `refundAmount` to orders
- ✅ Added `taxAmount`, `taxRate` to orders
- ✅ Added `reservedUntil` to cart for artwork reservation
- ✅ Added `updatedAt` to SEO pages
- ✅ Added DB initialization step before seeding
- ✅ Added admin seed script
- ✅ Added field mapping for catalog.json Russian fields
- ✅ Added URL conflict validation for SEO pages

---

## Current State Analysis

### What's Already Implemented

#### 1. Public Website (SvelteKit)
- **Layout:** Header, Footer, MobileMenu, Theme switching
- **i18n:** 4 languages (EN, RU, ES, ZH)
- **Pages:** Homepage, About, Works, Series (7), Exhibitions, Contact, NFT, Catalog
- **SEO:** Dynamic sitemap (60 URLs), robots.txt, meta tags
- **Performance:** Code splitting, preloading, security headers

#### 2. Data Layer
- **JSON files:** `data/*.json` (menu, footer, homepage, series, artworks, about, exhibitions, contact, nft)
- **Artworks:** 74 items in `data/artworks.json`
- **Format:** Multilingual TranslatedString structure

#### 3. Database Schema (Drizzle ORM) - Existing
```
Tables ready:
├── users           - public users
├── posts           - blog posts
├── admins          - admin users (roles: super-admin, editor, viewer)
├── series          - artwork series (7 collections)
├── artworks        - individual artworks (74 items)
├── exhibitions     - exhibitions list
└── artFairs        - art fair participations
```

#### 4. Admin Panel (Basic)
- **Routes:** `/dashboard`, `/login`, `/logout`, `/posts`, `/users`, `/settings`
- **Auth:** Session-based with bcrypt passwords
- **UI:** Responsive sidebar layout, role-based access

### Content in Static Site (to extract)

| Page | Content Available | Target Table |
|------|-------------------|--------------|
| `about.html` | Biography text | `biography` (NEW) |
| `about.html` | Education (4 items) | `education` (NEW) |
| `about.html` | Awards (18 items) | `awards` (NEW) |
| `exhibitions.html` | Exhibitions (9+) | `exhibitions` |
| `about.html` | Art Fairs (15 items) | `artFairs` |
| `catalog.json` | 74 artworks | `artworks` |
| `/ru/`, `/es/`, `/zh/` | Translations | All tables (multilingual columns) |

---

## Priority 1: Content Migration & Database Population

### 1.0 Prerequisites (CRITICAL)

```bash
# 1. Initialize database
cd frontend-sveltekit
npm run db:push          # Create tables from schema

# 2. Verify tables created
npm run db:studio        # Opens Drizzle Studio
```

### 1.1 Schema Extensions (NEW TABLES)

Add to `src/lib/server/db/schema.ts`:

```typescript
/**
 * Biography - artist bio text (one record per language approach: store all in one row)
 */
export const biography = sqliteTable('biography', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contentEn: text('content_en').notNull(),
  contentRu: text('content_ru'),
  contentEs: text('content_es'),
  contentZh: text('content_zh'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

/**
 * Education - education history items
 */
export const education = sqliteTable('education', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: text('year').notNull(), // "2000" or "2001 - 2005"
  institutionEn: text('institution_en').notNull(),
  institutionRu: text('institution_ru'),
  institutionEs: text('institution_es'),
  institutionZh: text('institution_zh'),
  descriptionEn: text('description_en'),
  descriptionRu: text('description_ru'),
  descriptionEs: text('description_es'),
  descriptionZh: text('description_zh'),
  order: integer('order').default(0).notNull()
});

/**
 * Awards - awards and residencies
 */
export const awards = sqliteTable('awards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: integer('year').notNull(),
  titleEn: text('title_en').notNull(),
  titleRu: text('title_ru'),
  titleEs: text('title_es'),
  titleZh: text('title_zh'),
  locationEn: text('location_en'),
  locationRu: text('location_ru'),
  locationEs: text('location_es'),
  locationZh: text('location_zh'),
  type: text('type', { enum: ['award', 'residency', 'shortlist'] }).notNull(),
  order: integer('order').default(0).notNull()
});

/**
 * Page Content - editable page sections
 */
export const pageContent = sqliteTable('page_content', {
  id: text('id').primaryKey(), // 'homepage-hero', 'about-intro', etc.
  page: text('page').notNull(), // 'homepage', 'about', 'contact'
  section: text('section').notNull(), // 'hero', 'intro', 'cta'
  contentEn: text('content_en'),
  contentRu: text('content_ru'),
  contentEs: text('content_es'),
  contentZh: text('content_zh'),
  metadata: text('metadata'), // JSON for additional data
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

/**
 * Menu Items - navigation structure
 */
export const menuItems = sqliteTable('menu_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  labelEn: text('label_en').notNull(),
  labelRu: text('label_ru'),
  labelEs: text('label_es'),
  labelZh: text('label_zh'),
  href: text('href').notNull(),
  order: integer('order').default(0).notNull(),
  parentId: integer('parent_id'),
  isExternal: integer('is_external', { mode: 'boolean' }).default(false)
});
```

### 1.2 Content Extraction Scripts

```
scripts/
├── extract-content.ts      # Main extraction script
├── seed-database.ts        # Seed all tables
├── seed-admin.ts           # Create first admin user
└── backup-database.ts      # Backup before migrations
```

**Field Mapping for catalog.json (Russian → English):**
```typescript
const FIELD_MAP = {
  'ID': 'id',
  'Категория': 'series',
  'Название': 'title',
  'Тип/Техника': 'technique',
  'Цена': 'price',
  'Путь к изображению': 'imagePath',
  'Файл существует': 'imageExists',
  'Примечание': 'note'
};
```

### 1.3 Data Migration Strategy

**Decision: MERGE approach**
- Keep existing `data/artworks.json` structure
- Extract additional content from static HTML
- Seed database from combined JSON
- JSON files remain as backup/fallback

### 1.4 Data Provider Migration

Update providers to support both JSON and DB:

```typescript
// src/lib/data/artworks.provider.ts
const USE_DATABASE = process.env.USE_DATABASE === 'true';

export function getAllArtworks(locale: LanguageCode): ArtworkLocalized[] {
  if (USE_DATABASE) {
    return db.select().from(artworks).all().map(a => localizeArtwork(a, locale));
  }
  // Fallback to JSON
  return artworksData.artworks.map(a => localizeArtwork(a, locale));
}
```

### 1.5 Implementation Steps

```
Step 1.0: Add new tables to schema.ts
Step 1.1: Run npm run db:push (create tables)
Step 1.2: Create seed-admin.ts script
Step 1.3: Create extract-content.ts script
Step 1.4: Run extraction from static site
Step 1.5: Create seed-database.ts script
Step 1.6: Run seeding
Step 1.7: Update providers with DB flag
Step 1.8: Test public site with USE_DATABASE=true
```

**Deliverable:** All content in database, providers support DB mode

---

## Priority 2: Admin Panel CMS

### 2.0 Admin User Setup

```typescript
// scripts/seed-admin.ts
import bcrypt from 'bcrypt';
import { db } from '../src/lib/server/db';
import { admins } from '../src/lib/server/db/schema';

const DEFAULT_ADMIN = {
  email: 'admin@k-liee.com',
  password: await bcrypt.hash('changeme123', 10),
  name: 'Administrator',
  role: 'super-admin'
};

await db.insert(admins).values(DEFAULT_ADMIN);
console.log('Admin created. CHANGE PASSWORD IMMEDIATELY!');
```

### 2.1 Content Management Routes

```
src/routes/(admin)/
├── artworks/
│   ├── +page.svelte           # List all artworks (DataTable)
│   ├── +page.server.ts        # Load artworks from DB
│   ├── new/
│   │   ├── +page.svelte       # Create artwork form
│   │   └── +page.server.ts    # Handle create
│   └── [id]/
│       ├── +page.svelte       # Edit artwork form
│       └── +page.server.ts    # Load/Update/Delete
│
├── series/
│   ├── +page.svelte           # List all series
│   ├── +page.server.ts
│   ├── new/+page.svelte
│   └── [id]/+page.svelte
│
├── exhibitions/
│   ├── +page.svelte           # List exhibitions
│   ├── +page.server.ts
│   ├── new/+page.svelte
│   └── [id]/+page.svelte
│
├── pages/
│   ├── +page.svelte           # List editable pages
│   ├── about/+page.svelte     # Edit About page (bio, education, awards)
│   ├── contact/+page.svelte   # Edit Contact page
│   └── homepage/+page.svelte  # Edit Homepage sections
│
├── menu/
│   ├── +page.svelte           # Edit menu items (drag & drop order)
│   └── +page.server.ts
│
└── media/
    ├── +page.svelte           # Media library (list images)
    └── +page.server.ts        # Upload handling (dev mode)
```

### 2.2 Reusable Admin Components

```
src/lib/components/admin/
├── MultilingualInput.svelte   # Tabs for EN/RU/ES/ZH
├── MultilingualTextarea.svelte # Rich text per language
├── ImageUpload.svelte         # Single image upload
├── ImageGallery.svelte        # Multiple images with ordering
├── DataTable.svelte           # Sortable, filterable table
├── ConfirmDialog.svelte       # Delete confirmation
├── Toast.svelte               # Success/error notifications
├── FormField.svelte           # Label + input wrapper
└── SaveButton.svelte          # With loading state
```

### 2.3 Multilingual Editor Component

```svelte
<!-- MultilingualInput.svelte -->
<script lang="ts">
  interface Props {
    field: string;
    value: { en: string; ru: string; es: string; zh: string };
    label: string;
    required?: boolean;
  }

  let { field, value = $bindable(), label, required = false }: Props = $props();

  let activeTab = $state<'en' | 'ru' | 'es' | 'zh'>('en');

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
  ];

  function copyFromEnglish() {
    value.ru = value.en;
    value.es = value.en;
    value.zh = value.en;
  }
</script>

<div class="multilingual-input">
  <label>{label} {required ? '*' : ''}</label>

  <div class="lang-tabs">
    {#each languages as lang}
      <button
        class:active={activeTab === lang.code}
        onclick={() => activeTab = lang.code}
      >
        {lang.flag} {lang.code.toUpperCase()}
        {#if value[lang.code]}
          <span class="filled">✓</span>
        {/if}
      </button>
    {/each}
    <button class="copy-btn" onclick={copyFromEnglish}>Copy EN → All</button>
  </div>

  <input
    type="text"
    bind:value={value[activeTab]}
    placeholder={`${label} in ${languages.find(l => l.code === activeTab)?.label}`}
  />

  <span class="char-count">{value[activeTab]?.length || 0} chars</span>
</div>
```

### 2.4 Image Upload (Development Mode)

```typescript
// src/routes/api/admin/upload/+server.ts
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const category = formData.get('category') as string; // 'works', 'exhibitions', etc.

  if (!file) {
    return json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const relativePath = `/images/${category}/${filename}`;
  const absolutePath = join(process.cwd(), 'static', relativePath);

  // Save file
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return json({ path: relativePath });
};
```

### 2.5 Optimistic Locking (Concurrent Edit Protection)

```typescript
// In +page.server.ts for edit pages
export const actions = {
  update: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');
    const updatedAt = formData.get('updatedAt'); // From hidden field

    // Check if record was modified since form load
    const current = await db.select().from(artworks).where(eq(artworks.id, id)).get();

    if (current.updatedAt !== updatedAt) {
      return fail(409, {
        error: 'This record was modified by another user. Please refresh and try again.'
      });
    }

    // Proceed with update...
  }
};
```

### 2.6 Implementation Steps

```
Step 2.0: Run seed-admin.ts to create first admin
Step 2.1: Create DataTable component
Step 2.2: Create MultilingualInput component
Step 2.3: Create artworks list page
Step 2.4: Create artworks new/edit pages
Step 2.5: Create series CRUD
Step 2.6: Create exhibitions CRUD
Step 2.7: Create pages editor (about, contact, homepage)
Step 2.8: Create menu management
Step 2.9: Create media library with upload
Step 2.10: Add Toast notifications
```

**Deliverable:** Full CMS for managing all content types

---

## Priority 3: E-commerce / Shop

### 3.1 Database Schema (CORRECTED)

```typescript
// Add to schema.ts

/**
 * Products - items for sale (linked to artworks)
 */
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  artworkId: text('artwork_id').references(() => artworks.id),
  sku: text('sku').unique().notNull(),
  // Prices in cents (integer for precision)
  priceGBP: integer('price_gbp').notNull(),
  priceEUR: integer('price_eur'),
  priceUSD: integer('price_usd'),
  // Stock
  stock: integer('stock').default(1).notNull(),
  reservedStock: integer('reserved_stock').default(0).notNull(), // Items in carts
  // Product type
  isDigital: integer('is_digital', { mode: 'boolean' }).default(false),
  downloadUrl: text('download_url'),
  // Status
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

/**
 * Orders - customer orders
 */
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  // Customer (nullable for guest checkout)
  userId: integer('user_id').references(() => users.id),
  guestEmail: text('guest_email'),
  guestName: text('guest_name'),
  // Status
  status: text('status', {
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  }).notNull().default('pending'),
  // Amounts (in cents)
  subtotal: integer('subtotal').notNull(),
  taxAmount: integer('tax_amount').default(0),
  taxRate: text('tax_rate'), // e.g., "20% VAT"
  shippingAmount: integer('shipping_amount').default(0),
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').notNull().default('GBP'),
  // Addresses (JSON)
  billingAddress: text('billing_address'),
  shippingAddress: text('shipping_address'),
  // Payment
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  paidAt: text('paid_at'),
  // Refund
  refundedAt: text('refunded_at'),
  refundAmount: integer('refund_amount'),
  refundReason: text('refund_reason'),
  // Tracking
  trackingNumber: text('tracking_number'),
  shippedAt: text('shipped_at'),
  deliveredAt: text('delivered_at'),
  // Timestamps
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

/**
 * Order Items - line items in orders
 */
export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: text('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull().default(1),
  priceAtPurchase: integer('price_at_purchase').notNull(),
  // For digital products
  downloadCount: integer('download_count').default(0),
  downloadLimit: integer('download_limit').default(3)
});

/**
 * Cart - shopping cart (session-based)
 */
export const cart = sqliteTable('cart', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull(),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  // Reservation expires after 30 minutes
  reservedUntil: text('reserved_until'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Index for cart cleanup
// CREATE INDEX idx_cart_session ON cart(session_id);
// CREATE INDEX idx_cart_reserved ON cart(reserved_until);
```

### 3.2 Shop Routes

```
src/routes/[lang=locale]/shop/
├── +page.svelte               # Shop listing (grid of products)
├── +page.ts                   # Load products
├── [slug]/
│   ├── +page.svelte           # Product detail page
│   └── +page.ts               # Load single product
├── cart/
│   ├── +page.svelte           # Full cart page
│   └── +page.server.ts        # Add/remove/update actions
└── checkout/
    ├── +page.svelte           # Checkout form (billing, shipping)
    ├── +page.server.ts        # Create order, redirect to Stripe
    ├── success/
    │   ├── +page.svelte       # Thank you page
    │   └── +page.server.ts    # Verify payment, show order
    └── cancel/+page.svelte    # Payment cancelled
```

### 3.3 Cart Reservation Logic

```typescript
// When adding to cart, reserve the item
async function addToCart(sessionId: string, productId: string) {
  const product = await db.select().from(products).where(eq(products.id, productId)).get();

  // Check available stock (total - reserved)
  const availableStock = product.stock - product.reservedStock;
  if (availableStock < 1) {
    throw new Error('Item is no longer available');
  }

  // Reserve for 30 minutes
  const reservedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  await db.transaction(async (tx) => {
    // Add to cart
    await tx.insert(cart).values({
      sessionId,
      productId,
      quantity: 1,
      reservedUntil
    });

    // Increment reserved stock
    await tx.update(products)
      .set({ reservedStock: product.reservedStock + 1 })
      .where(eq(products.id, productId));
  });
}

// Cleanup job: release expired reservations
async function releaseExpiredReservations() {
  const now = new Date().toISOString();

  const expired = await db.select()
    .from(cart)
    .where(lt(cart.reservedUntil, now));

  for (const item of expired) {
    await db.transaction(async (tx) => {
      // Remove from cart
      await tx.delete(cart).where(eq(cart.id, item.id));

      // Decrement reserved stock
      await tx.update(products)
        .set({ reservedStock: sql`reserved_stock - 1` })
        .where(eq(products.id, item.productId));
    });
  }
}
```

### 3.4 Stripe Integration

```typescript
// src/routes/api/shop/checkout/+server.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const POST: RequestHandler = async ({ request, cookies }) => {
  const sessionId = cookies.get('cart_session');
  const { email, billingAddress, shippingAddress } = await request.json();

  // Get cart items
  const cartItems = await getCartItems(sessionId);
  if (cartItems.length === 0) {
    return json({ error: 'Cart is empty' }, { status: 400 });
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.20); // 20% VAT
  const shippingAmount = 1500; // £15 flat rate
  const totalAmount = subtotal + taxAmount + shippingAmount;

  // Create order
  const orderId = `order_${Date.now()}`;
  await db.insert(orders).values({
    id: orderId,
    guestEmail: email,
    subtotal,
    taxAmount,
    taxRate: '20% VAT',
    shippingAmount,
    totalAmount,
    currency: 'GBP',
    billingAddress: JSON.stringify(billingAddress),
    shippingAddress: JSON.stringify(shippingAddress)
  });

  // Add order items
  for (const item of cartItems) {
    await db.insert(orderItems).values({
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.price
    });
  }

  // Create Stripe Checkout Session
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: cartItems.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: { name: item.name },
        unit_amount: item.price
      },
      quantity: item.quantity
    })),
    mode: 'payment',
    success_url: `${process.env.PUBLIC_URL}/shop/checkout/success?order=${orderId}`,
    cancel_url: `${process.env.PUBLIC_URL}/shop/checkout/cancel`,
    metadata: { orderId }
  });

  return json({ url: stripeSession.url });
};
```

### 3.5 Webhook Handler

```typescript
// src/routes/api/shop/webhook/+server.ts
export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orderId = session.metadata.orderId;

      await db.update(orders)
        .set({
          status: 'paid',
          paidAt: new Date().toISOString(),
          stripePaymentIntentId: session.payment_intent
        })
        .where(eq(orders.id, orderId));

      // Clear cart and decrement stock
      await finalizeOrder(orderId);

      // Send confirmation email
      await sendOrderConfirmation(orderId);
      break;
    }

    case 'charge.refunded': {
      // Handle refund...
      break;
    }
  }

  return new Response('OK');
};
```

### 3.6 Email Notifications (Resend)

```typescript
// src/lib/email/send.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(orderId: string) {
  const order = await getOrderWithItems(orderId);

  await resend.emails.send({
    from: 'orders@k-liee.com',
    to: order.guestEmail || order.user.email,
    subject: `Order Confirmation #${orderId}`,
    html: renderOrderEmail(order)
  });
}
```

### 3.7 Implementation Steps

```
Step 3.0: Add shop schema to schema.ts
Step 3.1: Run npm run db:push
Step 3.2: Create shop listing page
Step 3.3: Create product detail page
Step 3.4: Create cart page with add/remove
Step 3.5: Implement cart reservation logic
Step 3.6: Create checkout page
Step 3.7: Integrate Stripe Checkout
Step 3.8: Create webhook handler
Step 3.9: Create success/cancel pages
Step 3.10: Set up Resend for emails
Step 3.11: Create admin orders page
Step 3.12: Add refund functionality
```

**Deliverable:** Full e-commerce with cart, checkout, payments, emails

---

## Priority 4: Programmatic SEO Pages

### 4.1 SEO Pages Schema (CORRECTED)

```typescript
export const seoPages = sqliteTable('seo_pages', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  template: text('template', {
    enum: ['technique', 'style', 'category', 'location', 'custom']
  }).notNull(),
  // Keywords per language
  keywordEn: text('keyword_en').notNull(),
  keywordRu: text('keyword_ru'),
  keywordEs: text('keyword_es'),
  keywordZh: text('keyword_zh'),
  // SEO Title
  titleEn: text('title_en').notNull(),
  titleRu: text('title_ru'),
  titleEs: text('title_es'),
  titleZh: text('title_zh'),
  // Meta Description
  descriptionEn: text('description_en'),
  descriptionRu: text('description_ru'),
  descriptionEs: text('description_es'),
  descriptionZh: text('description_zh'),
  // Page Content (rich text)
  contentEn: text('content_en'),
  contentRu: text('content_ru'),
  contentEs: text('content_es'),
  contentZh: text('content_zh'),
  // Related artworks (JSON array of IDs)
  relatedArtworks: text('related_artworks'),
  // Publishing
  published: integer('published', { mode: 'boolean' }).default(false),
  // Sitemap settings
  sitemapPriority: text('sitemap_priority').default('0.7'),
  sitemapChangefreq: text('sitemap_changefreq').default('monthly'),
  // Timestamps
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Reserved slugs that cannot be used for SEO pages
const RESERVED_SLUGS = [
  'about', 'works', 'exhibitions', 'contact', 'nft',
  'catalog', 'shop', 'cart', 'checkout', 'admin'
];
```

### 4.2 URL Conflict Validation

```typescript
// src/lib/server/seo/validate-slug.ts
export async function validateSeoSlug(slug: string): Promise<{ valid: boolean; error?: string }> {
  // Check reserved slugs
  if (RESERVED_SLUGS.includes(slug)) {
    return { valid: false, error: `"${slug}" is a reserved page name` };
  }

  // Check existing SEO pages
  const existing = await db.select()
    .from(seoPages)
    .where(eq(seoPages.slug, slug))
    .get();

  if (existing) {
    return { valid: false, error: `SEO page with slug "${slug}" already exists` };
  }

  // Check series slugs
  const seriesMatch = await db.select()
    .from(series)
    .where(eq(series.slug, slug))
    .get();

  if (seriesMatch) {
    return { valid: false, error: `"${slug}" conflicts with artwork series` };
  }

  return { valid: true };
}
```

### 4.3 Dynamic Routes

```
src/routes/[lang=locale]/
├── art/
│   └── [technique]/
│       ├── +page.svelte      # Template: technique pages
│       └── +page.ts          # Load by slug
├── artist/
│   └── [style]/
│       ├── +page.svelte      # Template: style pages
│       └── +page.ts
├── buy/
│   └── [category]/
│       ├── +page.svelte      # Template: category pages
│       └── +page.ts
└── [seoSlug]/
    ├── +page.svelte          # Catch-all for custom SEO pages
    └── +page.ts              # Check if SEO page exists
```

### 4.4 Sitemap Integration

```typescript
// src/routes/sitemap.xml/+server.ts - Updated
export const GET: RequestHandler = async () => {
  const baseUrl = 'https://k-liee.com';
  const languages = ['en', 'ru', 'es', 'zh'];

  // ... existing static pages ...

  // Add SEO pages
  const seoPagesList = await db.select()
    .from(seoPages)
    .where(eq(seoPages.published, true));

  for (const page of seoPagesList) {
    const template = getTemplatePrefix(page.template); // 'art/', 'buy/', etc.

    for (const lang of languages) {
      urls.push({
        loc: `${baseUrl}/${lang}/${template}${page.slug}`,
        lastmod: page.updatedAt,
        changefreq: page.sitemapChangefreq,
        priority: page.sitemapPriority,
        alternates: languages.map(l => ({
          hreflang: l,
          href: `${baseUrl}/${l}/${template}${page.slug}`
        }))
      });
    }
  }

  // Generate XML...
};
```

### 4.5 Implementation Steps

```
Step 4.0: Add seoPages schema to schema.ts
Step 4.1: Run npm run db:push
Step 4.2: Create slug validation utility
Step 4.3: Create dynamic routes for templates
Step 4.4: Create catch-all SEO page route
Step 4.5: Update sitemap to include SEO pages
Step 4.6: Create admin SEO pages list
Step 4.7: Create admin SEO page editor
Step 4.8: Add Schema.org structured data
```

**Deliverable:** Scalable programmatic SEO system

---

## Implementation Checklist

### Phase A: Database Setup (Session 1)
- [ ] Add new tables to schema.ts (biography, education, awards, pageContent, menuItems)
- [ ] Run `npm run db:push`
- [ ] Create `scripts/seed-admin.ts`
- [ ] Run admin seeding
- [ ] Verify with `npm run db:studio`

### Phase B: Content Migration (Session 1-2)
- [ ] Create `scripts/extract-content.ts`
- [ ] Extract from about.html (EN)
- [ ] Extract from /ru/about.html, /es/about.html, /zh/about.html
- [ ] Create `scripts/seed-database.ts`
- [ ] Seed all content tables
- [ ] Update data providers with USE_DATABASE flag
- [ ] Test public site

### Phase C: Admin CMS Core (Session 2-3)
- [ ] Create MultilingualInput component
- [ ] Create DataTable component
- [ ] Create artworks CRUD
- [ ] Create series CRUD
- [ ] Create exhibitions CRUD

### Phase D: Admin CMS Extended (Session 3-4)
- [ ] Create pages editor
- [ ] Create menu management
- [ ] Create media library
- [ ] Add image upload (dev mode)
- [ ] Add Toast notifications

### Phase E: E-commerce MVP (Session 4-5)
- [ ] Add shop schema
- [ ] Create shop listing
- [ ] Create product detail
- [ ] Create cart with reservation

### Phase F: E-commerce Complete (Session 5-6)
- [ ] Create checkout flow
- [ ] Integrate Stripe
- [ ] Create webhook handler
- [ ] Set up Resend emails
- [ ] Create admin orders

### Phase G: Programmatic SEO (Session 6-7)
- [ ] Add SEO schema
- [ ] Create dynamic routes
- [ ] Create admin editor
- [ ] Update sitemap

---

## Environment Variables

```bash
# .env.example
# Database
DATABASE_URL=./data/db/sqlite/kliee.db
USE_DATABASE=true

# Admin
ADMIN_EMAIL=admin@k-liee.com
ADMIN_PASSWORD=changeme123

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# App
PUBLIC_URL=https://k-liee.com
NODE_ENV=production
```

---

## Success Metrics

| Phase | Deliverable | Verification |
|-------|-------------|--------------|
| A | Database ready | `npm run db:studio` opens |
| B | Content migrated | All tables have data |
| C | Admin CMS core | Can create/edit artwork |
| D | Admin CMS full | Can edit all pages |
| E | Shop MVP | Can add to cart |
| F | Shop complete | Can complete test purchase |
| G | SEO pages | New pages in sitemap |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Backup JSON files, use transactions |
| Stripe integration fails | Test with test keys first, add detailed logging |
| Image upload security | Validate file types, size limits, unique filenames |
| Concurrent editing | Optimistic locking with updatedAt |
| Cart reservation abuse | 30-minute expiry, cleanup job |

---

**Document Version:** 2.0
**Last Updated:** 2025-12-20
**Status:** Audited, Ready for Implementation
