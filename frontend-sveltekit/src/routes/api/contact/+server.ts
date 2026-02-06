/**
 * Contact Form API Endpoint
 *
 * Handles contact form submissions with validation, rate limiting, and email notifications.
 * Reads settings (recipient email, form enabled, auto-reply) from DB.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendContactFormEmail, sendContactAutoReply } from '$lib/server/notifications/email';
import { db } from '$lib/server/db/client';
import { settings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Simple in-memory rate limiting (production should use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	message: string;
	lang?: string;
}

function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
	return input
		.trim()
		.replace(/<[^>]*>/g, '') // Remove HTML tags
		.slice(0, 5000); // Limit length
}

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(ip);

	if (!record || now > record.resetTime) {
		rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
		return true;
	}

	if (record.count >= RATE_LIMIT) {
		return false;
	}

	record.count++;
	return true;
}

/**
 * Helper to read a contact setting from the DB
 */
async function getContactSetting(key: string): Promise<string | null> {
	const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
	return row?.value ?? null;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const clientIP = getClientAddress();

	// Rate limiting check
	if (!checkRateLimit(clientIP)) {
		return json(
			{ error: 'Too many requests. Please try again later.' },
			{ status: 429 }
		);
	}

	try {
		// Check if form is enabled
		const formEnabled = await getContactSetting('contact_form_enabled');
		if (formEnabled === 'false') {
			return json(
				{ error: 'Contact form is currently disabled.' },
				{ status: 503 }
			);
		}

		const data: ContactFormData = await request.json();

		// Validation
		const errors: string[] = [];

		if (!data.name || data.name.trim().length < 2) {
			errors.push('Name is required (minimum 2 characters)');
		}

		if (!data.email || !validateEmail(data.email)) {
			errors.push('Valid email is required');
		}

		if (!data.subject || data.subject.trim().length < 3) {
			errors.push('Subject is required (minimum 3 characters)');
		}

		if (!data.message || data.message.trim().length < 10) {
			errors.push('Message is required (minimum 10 characters)');
		}

		if (errors.length > 0) {
			return json({ error: 'Validation failed', details: errors }, { status: 400 });
		}

		// Sanitize inputs
		const sanitizedData = {
			name: sanitizeInput(data.name),
			email: data.email.trim().toLowerCase(),
			subject: sanitizeInput(data.subject),
			message: sanitizeInput(data.message),
			lang: data.lang || 'en'
		};

		// Log the contact request
		console.log('[Contact Form] New submission:', {
			timestamp: new Date().toISOString(),
			from: sanitizedData.email,
			name: sanitizedData.name,
			subject: sanitizedData.subject,
			messageLength: sanitizedData.message.length
		});

		// Read settings from DB
		const recipientEmail = await getContactSetting('contact_recipient_email');
		const autoReplyEnabled = await getContactSetting('contact_auto_reply_enabled');

		// Send admin notification (with DB recipient override)
		const adminEmailSent = await sendContactFormEmail(sanitizedData, recipientEmail || undefined);

		// Send auto-reply only if enabled
		let autoReplySent = false;
		if (autoReplyEnabled !== 'false') {
			autoReplySent = await sendContactAutoReply(sanitizedData);
		}

		console.log('[Contact Form] Email status:', { adminEmailSent, autoReplySent });

		return json({
			success: true,
			message: 'Thank you for your message. We will get back to you soon.',
			emailSent: adminEmailSent
		});

	} catch (error) {
		console.error('[Contact Form] Error:', error);
		return json(
			{ error: 'Failed to process your request. Please try again.' },
			{ status: 500 }
		);
	}
};

// Cleanup old rate limit entries periodically
setInterval(() => {
	const now = Date.now();
	for (const [ip, record] of rateLimitMap.entries()) {
		if (now > record.resetTime) {
			rateLimitMap.delete(ip);
		}
	}
}, 60 * 60 * 1000); // Every hour
