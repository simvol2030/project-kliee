/**
 * Production-Ready 1C HTTP Client
 *
 * Provides a robust HTTP client for interacting with 1C:Enterprise HTTP Services
 * with built-in retry logic, error handling, and logging.
 *
 * Usage:
 * ```typescript
 * import { create1CClient } from './1c_http_client';
 *
 * const client = create1CClient({
 *   baseURL: process.env.C1_BASE_URL,
 *   username: process.env.C1_USERNAME,
 *   password: process.env.C1_PASSWORD,
 *   timeout: 30000,
 *   maxRetries: 3
 * });
 *
 * // Get products
 * const products = await client.get('/products');
 *
 * // Post transaction
 * await client.post('/transactions', { amount: 1000, points: 100 });
 * ```
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface C1ClientConfig {
  baseURL: string;
  username: string;
  password: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  logRequests?: boolean;
}

export interface C1ClientInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determines if error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error.response) {
    // Network errors (ECONNREFUSED, ETIMEDOUT, etc.)
    return true;
  }

  const status = error.response.status;

  // Retry server errors and rate limiting
  if (status >= 500 || status === 429) {
    return true;
  }

  // Don't retry client errors
  return false;
}

/**
 * Creates a configured 1C HTTP client with retry logic
 */
export function create1CClient(config: C1ClientConfig): C1ClientInstance {
  const {
    baseURL,
    username,
    password,
    timeout = 30000,
    maxRetries = 3,
    retryDelay = 1000,
    logRequests = false
  } = config;

  // Create axios instance
  const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout,
    auth: {
      username,
      password
    },
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });

  // Request interceptor for logging
  axiosInstance.interceptors.request.use(
    (config) => {
      if (logRequests) {
        console.log(`[1C Request] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => {
      console.error('[1C Request Error]', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging
  axiosInstance.interceptors.response.use(
    (response) => {
      if (logRequests) {
        console.log(`[1C Response] ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error) => {
      if (error.response) {
        console.error(
          `[1C Response Error] ${error.response.status} ${error.config?.url}`,
          error.response.data
        );
      } else if (error.request) {
        console.error('[1C Network Error]', error.message);
      } else {
        console.error('[1C Error]', error.message);
      }
      return Promise.reject(error);
    }
  );

  /**
   * Retry wrapper for HTTP requests
   */
  async function retryRequest<T>(
    fn: () => Promise<AxiosResponse<T>>
  ): Promise<AxiosResponse<T>> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Don't retry if error is not retryable
        if (!isRetryableError(error)) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries - 1) {
          break;
        }

        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        console.log(`[1C Retry] Attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await sleep(delay);
      }
    }

    throw lastError;
  }

  // Return client interface
  return {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
      return retryRequest(() => axiosInstance.get<T>(url, config));
    },

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
      return retryRequest(() => axiosInstance.post<T>(url, data, config));
    },

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
      return retryRequest(() => axiosInstance.put<T>(url, data, config));
    },

    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
      return retryRequest(() => axiosInstance.delete<T>(url, config));
    }
  };
}

/**
 * Example: Using with environment variables
 *
 * .env file:
 * C1_BASE_URL=http://1c-server/database/hs/loyalty
 * C1_USERNAME=api_user
 * C1_PASSWORD=secure_password
 *
 * Code:
 * ```typescript
 * import 'dotenv/config';
 * import { create1CClient } from './1c_http_client';
 *
 * const client = create1CClient({
 *   baseURL: process.env.C1_BASE_URL!,
 *   username: process.env.C1_USERNAME!,
 *   password: process.env.C1_PASSWORD!,
 *   timeout: 30000,
 *   maxRetries: 3,
 *   logRequests: process.env.NODE_ENV === 'development'
 * });
 *
 * export { client };
 * ```
 */

/**
 * Example: Using with SvelteKit
 *
 * File: src/lib/server/1c/client.ts
 * ```typescript
 * import { C1_BASE_URL, C1_USERNAME, C1_PASSWORD } from '$env/static/private';
 * import { create1CClient } from './1c_http_client';
 *
 * export const c1Client = create1CClient({
 *   baseURL: C1_BASE_URL,
 *   username: C1_USERNAME,
 *   password: C1_PASSWORD,
 *   timeout: 30000,
 *   maxRetries: 3
 * });
 * ```
 *
 * File: src/routes/api/products/sync/+server.ts
 * ```typescript
 * import { c1Client } from '$lib/server/1c/client';
 * import type { RequestHandler } from './$types';
 *
 * export const POST: RequestHandler = async () => {
 *   try {
 *     const response = await c1Client.get('/products');
 *     const products = response.data;
 *
 *     // Process and save products...
 *
 *     return new Response(JSON.stringify({ success: true, count: products.length }));
 *   } catch (error: any) {
 *     return new Response(
 *       JSON.stringify({ error: error.message }),
 *       { status: 500 }
 *     );
 *   }
 * };
 * ```
 */

/**
 * Example: Using with Express
 *
 * File: src/1c/client.ts
 * ```typescript
 * import 'dotenv/config';
 * import { create1CClient } from './1c_http_client';
 *
 * export const c1Client = create1CClient({
 *   baseURL: process.env.C1_BASE_URL!,
 *   username: process.env.C1_USERNAME!,
 *   password: process.env.C1_PASSWORD!
 * });
 * ```
 *
 * File: src/routes/products.ts
 * ```typescript
 * import express from 'express';
 * import { c1Client } from '../1c/client';
 *
 * const router = express.Router();
 *
 * router.post('/sync', async (req, res) => {
 *   try {
 *     const response = await c1Client.get('/products');
 *     // Process products...
 *     res.json({ success: true });
 *   } catch (error: any) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 *
 * export default router;
 * ```
 */
