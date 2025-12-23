/**
 * Complete Example: Sync Products from 1C to Database
 *
 * This script demonstrates a complete product synchronization workflow:
 * 1. Fetch products from 1C OData API (with pagination)
 * 2. Map 1C data types to database schema
 * 3. Batch insert/update to PostgreSQL/SQLite
 * 4. Error handling and logging
 */

import { create1CClient } from './1c_http_client';
import { map1CProductToDB, mapBatch, type Product1C } from './data_mapper';

/**
 * Configuration
 */
const CONFIG = {
  // 1C OData endpoint
  odataBaseURL: process.env.C1_ODATA_URL || 'http://1c-server/database/odata/standard.odata',
  username: process.env.C1_USERNAME!,
  password: process.env.C1_PASSWORD!,

  // Pagination
  batchSize: 100,

  // Delays (to avoid overloading 1C)
  delayBetweenBatches: 100 // ms
};

/**
 * Fetch products from 1C OData API with pagination
 */
async function fetchProductsFrom1C(): Promise<Product1C[]> {
  const allProducts: Product1C[] = [];
  let skip = 0;
  let hasMore = true;

  const authHeader = 'Basic ' + Buffer.from(
    `${CONFIG.username}:${CONFIG.password}`
  ).toString('base64');

  while (hasMore) {
    const url = `${CONFIG.odataBaseURL}/Catalog_Номенклатура?` +
      `$select=Ref_Key,Наименование,Артикул,Цена,ДатаИзменения,ПометкаУдаления&` +
      `$filter=ПометкаУдаления eq false&` + // Only non-deleted products
      `$orderby=ДатаИзменения desc&` +
      `$top=${CONFIG.batchSize}&` +
      `$skip=${skip}&` +
      `$format=json`;

    console.log(`Fetching products: batch ${Math.floor(skip / CONFIG.batchSize) + 1}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`1C OData request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const products = data.value as Product1C[];

      allProducts.push(...products);

      console.log(`Fetched ${products.length} products (total: ${allProducts.length})`);

      // Check if there are more pages
      hasMore = products.length === CONFIG.batchSize;
      skip += CONFIG.batchSize;

      // Small delay to avoid overloading 1C
      if (hasMore) {
        await sleep(CONFIG.delayBetweenBatches);
      }
    } catch (error) {
      console.error('Error fetching products from 1C:', error);
      throw error;
    }
  }

  return allProducts;
}

/**
 * Save products to database (example with Drizzle ORM)
 */
async function saveProductsToDB(productsDB: any[]): Promise<number> {
  // This is a placeholder - replace with your actual database implementation

  console.log(`Saving ${productsDB.length} products to database...`);

  // Example with Drizzle ORM:
  /*
  import { db } from './db';
  import { products } from './db/schema';
  import { sql } from 'drizzle-orm';

  await db.insert(products)
    .values(productsDB)
    .onConflictDoUpdate({
      target: products.id,
      set: {
        name: sql`EXCLUDED.name`,
        sku: sql`EXCLUDED.sku`,
        price: sql`EXCLUDED.price`,
        updated_at: sql`EXCLUDED.updated_at`,
        is_deleted: sql`EXCLUDED.is_deleted`
      }
    });
  */

  // For demonstration, just log
  productsDB.forEach((p, i) => {
    if (i < 3) { // Show first 3
      console.log(`  - ${p.sku}: ${p.name} (${p.price}₽)`);
    }
  });

  if (productsDB.length > 3) {
    console.log(`  ... and ${productsDB.length - 3} more`);
  }

  return productsDB.length;
}

/**
 * Main sync function
 */
export async function syncProducts(): Promise<{ synced: number; errors: number }> {
  const startTime = Date.now();
  console.log('=== Starting product sync from 1C ===');

  try {
    // 1. Fetch products from 1C
    const products1C = await fetchProductsFrom1C();
    console.log(`Fetched ${products1C.length} products from 1C`);

    if (products1C.length === 0) {
      console.log('No products to sync');
      return { synced: 0, errors: 0 };
    }

    // 2. Map to database schema
    console.log('Mapping products to database schema...');
    const productsDB = mapBatch(products1C, map1CProductToDB);

    // 3. Save to database
    const synced = await saveProductsToDB(productsDB);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`=== Product sync completed in ${duration}s ===`);
    console.log(`Synced: ${synced} products`);

    return { synced, errors: 0 };
  } catch (error) {
    console.error('=== Product sync failed ===');
    console.error(error);

    return { synced: 0, errors: 1 };
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Example: Run sync as standalone script
 *
 * ```bash
 * # Set environment variables
 * export C1_ODATA_URL="http://1c-server/database/odata/standard.odata"
 * export C1_USERNAME="api_user"
 * export C1_PASSWORD="secure_password"
 *
 * # Run sync
 * npx tsx scripts/sync_products.ts
 * ```
 */

/**
 * Example: Schedule sync with cron
 *
 * ```typescript
 * import cron from 'node-cron';
 * import { syncProducts } from './scripts/sync_products';
 *
 * // Sync every hour
 * cron.schedule('0 * * * *', async () => {
 *   console.log('[Cron] Starting product sync...');
 *   const result = await syncProducts();
 *   if (result.errors > 0) {
 *     // Send alert to admin
 *     console.error('[Cron] Product sync failed!');
 *   }
 * });
 * ```
 */

/**
 * Example: Add to Bull queue
 *
 * ```typescript
 * import { Queue, Worker } from 'bullmq';
 * import { syncProducts } from './scripts/sync_products';
 *
 * const syncQueue = new Queue('1c-sync', {
 *   connection: { host: 'localhost', port: 6379 }
 * });
 *
 * // Add job
 * await syncQueue.add('sync-products', {}, {
 *   repeat: {
 *     pattern: '0 * * * *' // Every hour
 *   }
 * });
 *
 * // Worker
 * const worker = new Worker('1c-sync', async (job) => {
 *   if (job.name === 'sync-products') {
 *     const result = await syncProducts();
 *     return result;
 *   }
 * }, {
 *   connection: { host: 'localhost', port: 6379 }
 * });
 * ```
 */

// If running as standalone script
if (require.main === module) {
  syncProducts()
    .then((result) => {
      console.log('Result:', result);
      process.exit(result.errors > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
