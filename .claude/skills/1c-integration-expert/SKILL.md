---
name: 1c-integration-expert
description: Expert-level 1C:Enterprise integration for loyalty systems and e-commerce. Use when integrating with 1C for product catalog synchronization, inventory updates, price management, customer data exchange, transaction posting, or order processing. Covers HTTP Services, OData v4 protocol, data type mapping, error handling, retry logic, job queues (Bull/BullMQ), webhooks, and cron-based synchronization patterns.
---

# 1C Integration Expert

## Overview

This skill provides production-ready patterns for integrating Node.js/TypeScript applications with 1C:Enterprise (1С:Предприятие). It covers the most common integration scenarios for loyalty systems and e-commerce: product synchronization, inventory updates, transaction posting, and customer management.

Use this skill when:
- Synchronizing product catalogs from 1C to application database
- Reading inventory levels and prices from 1C
- Posting loyalty transactions back to 1C accounting
- Exchanging customer data between systems
- Setting up real-time or scheduled data synchronization
- Handling 1C data types and converting to PostgreSQL/SQLite
- Implementing error handling and retry logic for 1C API calls
- Configuring webhooks from 1C to application endpoints

## Core Capabilities

### 1. HTTP Services (REST API)

1C HTTP Services provide RESTful endpoints for data exchange. This is the recommended approach for modern integrations.

**1C Setup Requirements:**

1C administrator must create HTTP Service (HTTPСервис) with methods for:
- Getting products (`GET /products`)
- Getting inventory (`GET /inventory`)
- Posting transactions (`POST /transactions`)
- Getting customers (`GET /customers`)

Typical 1C HTTP Service endpoint format:
```
http://1c-server:port/database/hs/loyalty/products
```

**Client Implementation:**

Refer to `scripts/1c_http_client.ts` for complete production-ready implementation.

Basic usage pattern:
```typescript
import { create1CClient } from './scripts/1c_http_client';

const client = create1CClient({
  baseURL: 'http://1c-server/database/hs/loyalty',
  username: process.env.C1_USERNAME,
  password: process.env.C1_PASSWORD,
  timeout: 30000
});

// Get products
const products = await client.get('/products');

// Get inventory for specific product
const inventory = await client.get('/inventory', {
  params: { productId: 'PROD-001' }
});

// Post transaction
await client.post('/transactions', {
  customerId: 'CUST-123',
  amount: 1000,
  points: 100,
  date: new Date().toISOString()
});
```

**Authentication:**
- 1C uses Basic Authentication (username:password encoded in Base64)
- Credentials must be configured in 1C for HTTP Service access
- Store credentials in environment variables

**Best Practices:**
- Set timeout (30s recommended) to prevent hanging requests
- Implement retry logic for transient failures
- Log all requests/responses for debugging
- Cache responses when appropriate (products, prices)
- Use connection pooling for high-throughput scenarios

---

### 2. OData v4 Protocol

OData (Open Data Protocol) allows querying 1C data using standardized REST-like syntax. Ideal for reading catalogs, documents, and registers.

**1C OData Endpoint Format:**
```
http://1c-server/database/odata/standard.odata/Catalog_Номенклатура
```

**Common 1C Objects:**
- `Catalog_Номенклатура` - Product catalog
- `Catalog_Контрагенты` - Customers/Suppliers
- `Document_РеализацияТоваровУслуг` - Sales documents
- `InformationRegister_ЦеныНоменклатуры` - Price register
- `InformationRegister_ОстаткиТоваров` - Inventory register

**Query Examples:**

```typescript
// Get all products
const response = await fetch(
  'http://1c-server/database/odata/standard.odata/Catalog_Номенклатура?$format=json',
  {
    headers: {
      'Authorization': 'Basic ' + Buffer.from('user:pass').toString('base64')
    }
  }
);

// Get specific product by Ref_Key (GUID)
const product = await fetch(
  `http://1c-server/database/odata/standard.odata/Catalog_Номенклатура(guid'${refKey}')?$format=json`
);

// Filter products by criteria
const filtered = await fetch(
  `http://1c-server/database/odata/standard.odata/Catalog_Номенклатура?$filter=Наименование eq 'iPhone 15'&$format=json`
);

// Select specific fields only
const minimal = await fetch(
  `http://1c-server/database/odata/standard.odata/Catalog_Номенклатура?$select=Ref_Key,Наименование,Артикул&$format=json`
);
```

**OData Query Options:**
- `$filter` - Filter results (eq, ne, gt, lt, and, or)
- `$select` - Choose specific fields
- `$expand` - Include related entities
- `$orderby` - Sort results
- `$top` - Limit results (pagination)
- `$skip` - Skip results (pagination)
- `$format=json` - Response format (always use json)

**Pagination Pattern:**
```typescript
let skip = 0;
const top = 100;
let hasMore = true;

while (hasMore) {
  const url = `${baseURL}?$top=${top}&$skip=${skip}&$format=json`;
  const response = await fetch(url, { headers });
  const data = await response.json();

  await processProducts(data.value);

  skip += top;
  hasMore = data.value.length === top;
}
```

**Important Notes:**
- OData is read-only for most catalogs
- Use HTTP Services for writing data back to 1C
- Field names are in Russian (Cyrillic) by default
- GUIDs (Ref_Key) are used as primary keys
- Dates are in ISO 8601 format
- Refer to `references/odata_guide.md` for complete OData reference

---

### 3. Data Type Mapping

Proper mapping between 1C data types and PostgreSQL/SQLite/TypeScript ensures data integrity.

**Type Conversion Table:**

| 1C Type | PostgreSQL | TypeScript | Example | Notes |
|---------|-----------|------------|---------|-------|
| Строка (String) | TEXT / VARCHAR | string | "iPhone 15" | Variable length text |
| Число (Number) | DECIMAL / INTEGER | number | 12.50 | Use DECIMAL for prices |
| Дата (Date) | TIMESTAMP | Date | "2025-01-15T10:30:00" | ISO 8601 format |
| Булево (Boolean) | BOOLEAN | boolean | true | true/false |
| Ссылка (Reference) | UUID | string | "guid'abc-123...'" | GUID format |
| ХранилищеЗначения | BYTEA / TEXT | string | Base64 | Serialized data |

**Mapping Implementation:**

Refer to `scripts/data_mapper.ts` for complete implementation.

```typescript
interface Product1C {
  Ref_Key: string; // GUID
  Наименование: string; // Name
  Артикул: string; // SKU
  Цена: number; // Price
  ДатаИзменения: string; // Last modified
  ПометкаУдаления: boolean; // Deletion mark
}

interface ProductDB {
  id: string; // UUID
  name: string;
  sku: string;
  price: number;
  updated_at: Date;
  is_deleted: boolean;
}

function map1CProductToDB(product1C: Product1C): ProductDB {
  return {
    id: product1C.Ref_Key.replace(/^guid'|'$/g, ''),
    name: product1C.Наименование,
    sku: product1C.Артикул,
    price: Math.round(product1C.Цена * 100) / 100,
    updated_at: new Date(product1C.ДатаИзменения),
    is_deleted: product1C.ПометкаУдаления
  };
}
```

**Critical Mapping Rules:**
- Strip `guid'...'` wrapper from GUIDs before storing
- Use DECIMAL type for prices to prevent rounding errors
- Parse ISO strings to Date objects, store as TIMESTAMP
- Handle deletion marks (ПометкаУдаления) - 1C marks, doesn't delete
- Create clean English aliases in database schema

Refer to `references/1c_data_types.md` for comprehensive type mapping guide.

---

### 4. Synchronization Patterns

Choose synchronization pattern based on data freshness requirements and system load.

#### Pattern 1: Scheduled Sync (Cron Jobs)

Use when data changes infrequently (products, prices).

**Implementation with node-cron:**
```typescript
import cron from 'node-cron';
import { syncProducts } from './sync/products';

// Sync products every hour
cron.schedule('0 * * * *', async () => {
  console.log('Starting product sync...');
  try {
    await syncProducts();
    console.log('Product sync completed');
  } catch (error) {
    console.error('Product sync failed:', error);
  }
});

// Sync inventory every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  await syncInventory();
});

// Sync prices daily at 3 AM
cron.schedule('0 3 * * *', async () => {
  await syncPrices();
});
```

**Common Cron Patterns:**
- Every 5 minutes: `*/5 * * * *`
- Every hour: `0 * * * *`
- Daily at 2 AM: `0 2 * * *`
- Every Monday at 9 AM: `0 9 * * 1`

#### Pattern 2: Real-Time Sync (Webhooks)

Use when immediate updates are required (inventory changes, orders).

1C must send HTTP POST to webhook URL when data changes.

**Webhook Endpoint Implementation:**
```typescript
app.post('/webhooks/1c/inventory', async (req, res) => {
  const { productId, quantity, timestamp } = req.body;

  // Validate webhook signature
  const signature = req.headers['x-1c-signature'];
  if (!validateSignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Update inventory in database
  await db.update(products)
    .set({ stock: quantity, updated_at: new Date(timestamp) })
    .where(eq(products.sku, productId));

  res.json({ success: true });
});
```

#### Pattern 3: Queue-Based Sync (Bull/BullMQ)

Use when heavy processing required, need retry logic, or batch operations.

**Implementation:**
```typescript
import { Queue, Worker } from 'bullmq';

const syncQueue = new Queue('1c-sync', {
  connection: { host: 'localhost', port: 6379 }
});

// Add job to queue
await syncQueue.add('sync-products', {
  type: 'full',
  batchSize: 100
});

// Worker to process jobs
const worker = new Worker('1c-sync', async (job) => {
  if (job.name === 'sync-products') {
    const { batchSize } = job.data;

    await job.updateProgress(10);
    const products = await fetch1CProducts(batchSize);

    await job.updateProgress(50);
    await saveProductsToDB(products);

    await job.updateProgress(100);
    return { synced: products.length };
  }
}, {
  connection: { host: 'localhost', port: 6379 },
  concurrency: 5
});
```

Refer to `references/integration_patterns.md` for detailed pattern comparisons and architecture diagrams.

---

### 5. Transaction Posting to 1C

Post loyalty transactions to 1C for accounting and reporting.

**Scenario:** Customer earns 100 loyalty points for 1000₽ purchase.

**Implementation:**
```typescript
interface LoyaltyTransaction {
  transactionId: string;
  customerId: string;
  amount: number;
  points: number;
  type: 'earn' | 'spend';
  date: Date;
  storeId: string;
}

async function postTransactionTo1C(transaction: LoyaltyTransaction) {
  const client = create1CClient(config);

  const payload = {
    НомерТранзакции: transaction.transactionId,
    Контрагент: transaction.customerId,
    СуммаПокупки: transaction.amount,
    Баллы: transaction.type === 'earn' ? transaction.points : -transaction.points,
    Дата: transaction.date.toISOString(),
    Магазин: transaction.storeId
  };

  try {
    const response = await client.post('/transactions', payload);
    const documentRef = response.data.Ref_Key;

    // Save 1C document reference
    await db.update(transactions)
      .set({ c1_document_ref: documentRef })
      .where(eq(transactions.id, transaction.transactionId));

    return { success: true, documentRef };
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('1C validation error:', error.response.data);
    }
    throw error;
  }
}
```

**1C Side Requirements:**

1C HTTP Service method must:
1. Validate incoming data
2. Find customer by GUID
3. Create document (e.g., "БонуснаяОперация")
4. Post document (Провести)
5. Return document Ref_Key

**Error Handling Strategy:**
- Customer not found (404): Retry with customer sync
- Duplicate transaction (409): Skip
- Validation error (400): Log and alert
- Server error (500): Retry with exponential backoff

---

### 6. Error Handling & Retry Logic

Implement robust retry logic to handle 1C server slowness and network failures.

**Exponential Backoff Retry:**
```typescript
async function retry1CRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry client errors (400-499)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      if (attempt === maxRetries - 1) break;

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError!;
}
```

**Circuit Breaker Pattern:**
```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: number;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime! > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      if (this.state === 'half-open') {
        this.state = 'closed';
      }
      this.failureCount = 0;

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.threshold) {
        this.state = 'open';
        console.error('Circuit breaker opened!');
      }

      throw error;
    }
  }
}
```

**Retry Decision Rules:**
- Retry: Network errors, 5xx errors, 429 Too Many Requests
- Don't retry: 4xx client errors, authentication errors

---

### 7. Performance Optimization

Optimize synchronization for handling thousands of records efficiently.

**Batch Processing:**
```typescript
async function syncProductsInBatches() {
  const BATCH_SIZE = 100;
  let skip = 0;
  let processed = 0;

  while (true) {
    const url = `${baseURL}/odata/standard.odata/Catalog_Номенклатура?$top=${BATCH_SIZE}&$skip=${skip}&$format=json`;
    const response = await fetch(url, { headers });
    const data = await response.json();

    if (data.value.length === 0) break;

    const mapped = data.value.map(map1CProductToDB);

    await db.insert(products)
      .values(mapped)
      .onConflictDoUpdate({
        target: products.id,
        set: mapped[0]
      });

    processed += data.value.length;
    skip += BATCH_SIZE;

    console.log(`Processed ${processed} products...`);
    await sleep(100);
  }

  return { total: processed };
}
```

**Optimization Strategies:**
- Use `$select` in OData to fetch only required fields
- Batch inserts/updates (100-1000 records)
- Use connection pooling for PostgreSQL
- Cache frequently accessed data (Redis)
- Process batches in parallel with Promise.all (with concurrency limit)
- Add database indexes on frequently queried fields

---

### 8. Security Considerations

Protect 1C credentials and sensitive business data.

**Security Checklist:**
- Store 1C credentials in environment variables
- Never log credentials
- Use HTTPS for 1C connections (when available)
- Implement webhook signature validation
- Rate limit 1C API calls
- Rotate credentials periodically
- Monitor for suspicious activity
- Use least-privilege accounts (read-only when possible)
- Encrypt credentials at rest
- Audit all 1C data access

**Webhook Signature Validation Example:**
```typescript
import crypto from 'crypto';

function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

---

## Resources

### scripts/
- **1c_http_client.ts** - Production-ready HTTP client for 1C with retry logic and error handling
- **data_mapper.ts** - Type mapping functions for converting 1C data types to PostgreSQL/TypeScript
- **sync_products.ts** - Complete example of syncing products from 1C OData to database

### references/
- **odata_guide.md** - Complete OData v4 query reference with 1C-specific examples and field mappings
- **1c_data_types.md** - Comprehensive guide to 1C data types and their PostgreSQL/SQLite/TypeScript equivalents
- **integration_patterns.md** - Architecture patterns, best practices, and decision trees for choosing integration approaches

---

## Quick Reference

**Common Operations:**

```typescript
// 1. Sync products (scheduled)
cron.schedule('0 * * * *', () => syncProducts());

// 2. Get product from 1C
const product = await client.get(`/products/${guid}`);

// 3. Post transaction to 1C
await client.post('/transactions', transactionData);

// 4. Query with OData
const url = `${baseURL}/odata/standard.odata/Catalog_Номенклатура?$filter=Артикул eq 'SKU-001'&$format=json`;

// 5. Map 1C data to database
const dbProduct = map1CProductToDB(product1C);

// 6. Retry on failure
const result = await retry1CRequest(() => client.get('/products'), 3);
```

**Critical Rules:**
- ALWAYS use retry logic for 1C requests
- NEVER log 1C credentials
- ALWAYS validate data before saving to database
- USE batch processing for large datasets
- IMPLEMENT circuit breaker for failing 1C servers
