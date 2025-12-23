/**
 * Singleton utility for server-side instances
 *
 * This utility ensures that expensive-to-create instances
 * (like database connections) are created only once and
 * reused across server rebuilds in development mode.
 *
 * Based on Remix best practices for manual mode:
 * https://v2.remix.run/docs/guides/manual-mode
 */

// Store instances in global scope to survive rebuilds
const globalSingleton = globalThis as unknown as {
  __singletons?: Map<string, unknown>;
};

// Initialize singletons map if it doesn't exist
if (!globalSingleton.__singletons) {
  globalSingleton.__singletons = new Map();
}

/**
 * Create or retrieve a singleton instance
 *
 * @param key - Unique identifier for this singleton
 * @param create - Factory function to create the instance
 * @returns The singleton instance
 *
 * @example
 * ```typescript
 * import { singleton } from "~/utils/singleton.server";
 * import { PrismaClient } from "@prisma/client";
 *
 * export const db = singleton("prisma", () => new PrismaClient());
 * ```
 */
export function singleton<T>(
  key: string,
  create: () => T
): T {
  const singletons = globalSingleton.__singletons!;

  if (!singletons.has(key)) {
    singletons.set(key, create());
  }

  return singletons.get(key) as T;
}
