import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { randomBytes } from 'crypto';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';

// Supported languages
const LANGUAGES = ['en', 'ru', 'es', 'zh'];
const DEFAULT_LANGUAGE = 'en';

/**
 * Security Headers Hook
 * Adds important security headers to all responses
 */
const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Content Security Policy - защита от XSS атак
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"img-src 'self' data: https:",
		"font-src 'self' data: https://fonts.gstatic.com",
		"connect-src 'self'",
		"frame-ancestors 'none'",
		"base-uri 'self'",
		"form-action 'self'"
	].join('; ');

	response.headers.set('Content-Security-Policy', csp);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Permissions-Policy',
		'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=()'
	);

	if (process.env.NODE_ENV === 'production') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	}

	return response;
};

/**
 * CSRF Protection Hook
 */
const csrfProtection: Handle = async ({ event, resolve }) => {
	const { request, cookies } = event;

	if (request.method === 'GET') {
		let csrfToken = cookies.get('csrf_token');
		if (!csrfToken) {
			csrfToken = randomBytes(32).toString('base64');
			cookies.set('csrf_token', csrfToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24
			});
		}
		event.locals.csrfToken = csrfToken;
	}

	if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
		const cookieToken = cookies.get('csrf_token');
		const isLoginEndpoint = event.url.pathname === '/login';

		if (!isLoginEndpoint) {
			const headerToken = request.headers.get('x-csrf-token');
			let formToken: string | null = null;
			const contentType = request.headers.get('content-type') || '';

			// Check form data for CSRF token (both urlencoded and multipart)
			if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
				try {
					const formData = await request.clone().formData();
					formToken = formData.get('csrf_token')?.toString() || null;
				} catch {
					// Continue without form token
				}
			}

			const submittedToken = headerToken || formToken;
			if (!cookieToken || !submittedToken || cookieToken !== submittedToken) {
				const publicEndpoints = ['/api/health'];
				const isShopApi = event.url.pathname.startsWith('/api/shop/');
				if (!publicEndpoints.includes(event.url.pathname) && !isShopApi) {
					console.warn(`CSRF token mismatch for ${request.method} ${event.url.pathname}`);
					if (process.env.NODE_ENV === 'production') {
						return new Response('CSRF token validation failed', { status: 403 });
					}
				}
			}
		}
	}

	return resolve(event);
};

/**
 * Request Logging Hook
 */
const requestLogger: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const response = await resolve(event);
	const duration = Date.now() - start;

	if (process.env.NODE_ENV !== 'production') {
		console.log(`${event.request.method} ${event.url.pathname} - ${response.status} (${duration}ms)`);
	}

	return response;
};

/**
 * Language Redirect Hook
 */
const languageRedirect: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/') {
		throw redirect(307, `/${DEFAULT_LANGUAGE}`);
	}
	return resolve(event);
};

/**
 * Static Files Hook
 * Serves static images from external directory
 * Maps /uploads/* and /images/* to static-images directory
 * Production-ready: works with any deploy, no nginx config needed
 */
const STATIC_IMAGES_PATH = process.env.STATIC_IMAGES_PATH || '/opt/websites/k-liee.com/static-images';

const MIME_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon'
};

const staticFilesHandler: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	// Handle /uploads/products/* -> static-images/products/*
	// Handle /images/* -> static-images/*
	let filePath: string | null = null;

	if (pathname.startsWith('/uploads/')) {
		// /uploads/products/file.jpg -> static-images/products/file.jpg
		filePath = join(STATIC_IMAGES_PATH, pathname.replace('/uploads/', ''));
	} else if (pathname.startsWith('/images/') && !pathname.startsWith('/images/placeholder')) {
		// /images/products/file.jpg -> static-images/products/file.jpg
		// /images/works/file.jpg -> static-images/works/file.jpg
		filePath = join(STATIC_IMAGES_PATH, pathname.replace('/images/', ''));
	}

	if (filePath) {
		try {
			// Security: prevent path traversal
			const normalizedPath = join(STATIC_IMAGES_PATH, filePath.replace(STATIC_IMAGES_PATH, ''));
			if (!normalizedPath.startsWith(STATIC_IMAGES_PATH)) {
				return new Response('Forbidden', { status: 403 });
			}

			// Check if file exists
			const fileStat = await stat(filePath);
			if (!fileStat.isFile()) {
				return resolve(event); // Let SvelteKit handle it
			}

			// Read file and serve
			const fileContent = await readFile(filePath);
			const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
			const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

			return new Response(fileContent, {
				status: 200,
				headers: {
					'Content-Type': mimeType,
					'Cache-Control': 'public, max-age=2592000, immutable', // 30 days
					'X-Content-Type-Options': 'nosniff'
				}
			});
		} catch {
			// File not found or error - let SvelteKit handle it
			return resolve(event);
		}
	}

	return resolve(event);
};

/**
 * Комбинируем все hooks в правильном порядке
 */
export const handle = sequence(
	staticFilesHandler, // 0. Static files (first! before any redirects)
	languageRedirect,   // 1. Language redirect
	requestLogger,      // 2. Логирование
	securityHeaders,    // 3. Security headers
	csrfProtection      // 4. CSRF защита
);
