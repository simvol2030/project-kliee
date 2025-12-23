/**
 * Prisma Database Client (Server-Side Only)
 *
 * This module provides a singleton Prisma client instance that:
 * - Survives server rebuilds in development mode
 * - Reuses the same database connection
 * - Prevents connection pool exhaustion
 * - Only runs on the server (never in browser)
 *
 * Usage:
 * ```typescript
 * import { db } from "~/utils/db.server";
 *
 * export async function loader() {
 *   const users = await db.user.findMany();
 *   return json({ users });
 * }
 * ```
 */

import { PrismaClient } from "@prisma/client";
import { singleton } from "./singleton.server";

// Hard-code a unique key so we can look up the client when this module gets re-imported
export const db = singleton("prisma", () => {
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  // Graceful shutdown
  prisma.$connect();

  return prisma;
});

/**
 * Disconnect from database
 * Call this during application shutdown
 */
export async function disconnect() {
  await db.$disconnect();
}
