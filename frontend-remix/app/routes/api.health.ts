/**
 * Health Check API Route
 *
 * Provides system health information including:
 * - Server status
 * - Database connectivity
 * - Memory usage
 * - Uptime statistics
 * - Node.js version
 *
 * Usage: GET /api/health
 */

import type { LoaderFunctionArgs } from "react-router";
import { db } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`;

    // Gather system metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return Response.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: Math.round(uptime),
        database: "connected",
        version: "1.0.0",
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    // Database connection failed
    return Response.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}
