/**
 * Contact Form API Endpoint
 *
 * Handles contact form submissions with validation and rate limiting
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Simple in-memory rate limiting (production should use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	message: string;
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
			message: sanitizeInput(data.message)
		};

		// Log the contact request (in production, send email)
		console.log('[Contact Form] New submission:', {
			timestamp: new Date().toISOString(),
			from: sanitizedData.email,
			name: sanitizedData.name,
			subject: sanitizedData.subject,
			messageLength: sanitizedData.message.length
		});

		// TODO: Implement actual email sending
		// Options:
		// 1. SendGrid: import { MailService } from '@sendgrid/mail'
		// 2. Nodemailer: import nodemailer from 'nodemailer'
		// 3. Resend: import { Resend } from 'resend'
		//
		// Example with environment variables:
		// const SMTP_HOST = import.meta.env.SMTP_HOST;
		// const SMTP_USER = import.meta.env.SMTP_USER;
		// const SMTP_PASS = import.meta.env.SMTP_PASS;
		// const RECIPIENT_EMAIL = import.meta.env.CONTACT_EMAIL || 'info@k-lie.com';

		// For now, simulate successful submission
		// In production, uncomment and configure email sending

		/*
		const transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: 587,
			secure: false,
			auth: { user: SMTP_USER, pass: SMTP_PASS }
		});

		await transporter.sendMail({
			from: `"${sanitizedData.name}" <${sanitizedData.email}>`,
			to: RECIPIENT_EMAIL,
			subject: `[K-LIEE Contact] ${sanitizedData.subject}`,
			text: sanitizedData.message,
			replyTo: sanitizedData.email
		});
		*/

		return json({
			success: true,
			message: 'Thank you for your message. We will get back to you soon.'
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
