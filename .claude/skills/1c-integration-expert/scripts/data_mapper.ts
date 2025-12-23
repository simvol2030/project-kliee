/**
 * 1C Data Type Mapping Utilities
 *
 * Provides type-safe mappers for converting 1C data structures to database models.
 */

/**
 * 1C Product structure (from OData or HTTP Service)
 */
export interface Product1C {
  Ref_Key: string; // guid'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  Наименование: string; // Product name
  Артикул: string; // SKU
  Цена: number; // Price
  ДатаИзменения: string; // Last modified (ISO 8601)
  ПометкаУдаления: boolean; // Deletion mark
  Описание?: string; // Description (optional)
  ВидНоменклатуры?: {
    Ref_Key: string;
    Наименование: string;
  }; // Product type
}

/**
 * Database Product model
 */
export interface ProductDB {
  id: string; // UUID (cleaned)
  name: string;
  sku: string;
  price: number; // DECIMAL
  updated_at: Date;
  is_deleted: boolean;
  description?: string | null;
  category_id?: string | null;
}

/**
 * Maps 1C Product to database Product model
 */
export function map1CProductToDB(product1C: Product1C): ProductDB {
  return {
    id: cleanGUID(product1C.Ref_Key),
    name: product1C.Наименование,
    sku: product1C.Артикул,
    price: roundPrice(product1C.Цена),
    updated_at: parseISODate(product1C.ДатаИзменения),
    is_deleted: product1C.ПометкаУдаления,
    description: product1C.Описание || null,
    category_id: product1C.ВидНоменклатуры
      ? cleanGUID(product1C.ВидНоменклатуры.Ref_Key)
      : null
  };
}

/**
 * 1C Customer structure
 */
export interface Customer1C {
  Ref_Key: string;
  Наименование: string; // Full name
  ИНН?: string; // Tax ID
  Телефон?: string; // Phone
  Email?: string;
  ДатаРождения?: string; // Birth date
  ПометкаУдаления: boolean;
}

/**
 * Database Customer model
 */
export interface CustomerDB {
  id: string;
  name: string;
  tax_id?: string | null;
  phone?: string | null;
  email?: string | null;
  birth_date?: Date | null;
  is_deleted: boolean;
}

/**
 * Maps 1C Customer to database Customer model
 */
export function map1CCustomerToDB(customer1C: Customer1C): CustomerDB {
  return {
    id: cleanGUID(customer1C.Ref_Key),
    name: customer1C.Наименование,
    tax_id: customer1C.ИНН || null,
    phone: customer1C.Телефон || null,
    email: customer1C.Email || null,
    birth_date: customer1C.ДатаРождения
      ? parseISODate(customer1C.ДатаРождения)
      : null,
    is_deleted: customer1C.ПометкаУдаления
  };
}

/**
 * 1C Inventory structure
 */
export interface Inventory1C {
  Номенклатура_Key: string; // Product GUID
  Склад_Key: string; // Warehouse GUID
  Количество: number; // Quantity
  ДатаИзменения: string;
}

/**
 * Database Inventory model
 */
export interface InventoryDB {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  updated_at: Date;
}

/**
 * Maps 1C Inventory to database Inventory model
 */
export function map1CInventoryToDB(inventory1C: Inventory1C): InventoryDB {
  return {
    product_id: cleanGUID(inventory1C.Номенклатура_Key),
    warehouse_id: cleanGUID(inventory1C.Склад_Key),
    quantity: Math.max(0, Math.floor(inventory1C.Количество)), // Non-negative integer
    updated_at: parseISODate(inventory1C.ДатаИзменения)
  };
}

/**
 * 1C Price structure
 */
export interface Price1C {
  Номенклатура_Key: string; // Product GUID
  ВидЦены_Key: string; // Price type GUID
  Цена: number;
  ДатаНачала: string; // Effective from
}

/**
 * Database Price model
 */
export interface PriceDB {
  product_id: string;
  price_type_id: string;
  price: number;
  effective_from: Date;
}

/**
 * Maps 1C Price to database Price model
 */
export function map1CPriceToDB(price1C: Price1C): PriceDB {
  return {
    product_id: cleanGUID(price1C.Номенклатура_Key),
    price_type_id: cleanGUID(price1C.ВидЦены_Key),
    price: roundPrice(price1C.Цена),
    effective_from: parseISODate(price1C.ДатаНачала)
  };
}

/**
 * Utility: Clean GUID format from 1C
 *
 * 1C format: guid'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
 * Database format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
export function cleanGUID(guid1C: string): string {
  return guid1C.replace(/^guid'|'$/g, '');
}

/**
 * Utility: Format GUID for 1C requests
 *
 * Database format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * 1C format: guid'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
 */
export function format1CGUID(guid: string): string {
  return `guid'${guid}'`;
}

/**
 * Utility: Round price to 2 decimal places
 */
export function roundPrice(price: number): number {
  return Math.round(price * 100) / 100;
}

/**
 * Utility: Parse ISO 8601 date string to Date object
 */
export function parseISODate(dateString: string): Date {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }

  return date;
}

/**
 * Utility: Format Date to ISO string for 1C
 */
export function formatDateFor1C(date: Date): string {
  return date.toISOString();
}

/**
 * Utility: Batch mapper for arrays
 */
export function mapBatch<T, U>(
  items: T[],
  mapper: (item: T) => U
): U[] {
  return items.map(mapper);
}

/**
 * Example: Using mappers in sync function
 *
 * ```typescript
 * import { map1CProductToDB, mapBatch } from './data_mapper';
 * import { db } from './db';
 * import { products } from './db/schema';
 *
 * async function syncProducts(products1C: Product1C[]) {
 *   // Map entire batch
 *   const productsDB = mapBatch(products1C, map1CProductToDB);
 *
 *   // Insert/update in database
 *   await db.insert(products)
 *     .values(productsDB)
 *     .onConflictDoUpdate({
 *       target: products.id,
 *       set: {
 *         name: sql`EXCLUDED.name`,
 *         price: sql`EXCLUDED.price`,
 *         updated_at: sql`EXCLUDED.updated_at`
 *       }
 *     });
 *
 *   return productsDB.length;
 * }
 * ```
 */

/**
 * Example: Custom mapper for complex scenarios
 *
 * ```typescript
 * import { cleanGUID, roundPrice, parseISODate } from './data_mapper';
 *
 * interface ProductWithImages1C extends Product1C {
 *   Изображения: Array<{
 *     Ref_Key: string;
 *     Наименование: string;
 *     URL: string;
 *   }>;
 * }
 *
 * function mapProductWithImages(product1C: ProductWithImages1C) {
 *   return {
 *     id: cleanGUID(product1C.Ref_Key),
 *     name: product1C.Наименование,
 *     sku: product1C.Артикул,
 *     price: roundPrice(product1C.Цена),
 *     images: product1C.Изображения.map(img => img.URL),
 *     updated_at: parseISODate(product1C.ДатаИзменения)
 *   };
 * }
 * ```
 */
