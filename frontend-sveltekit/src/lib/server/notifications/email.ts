/**
 * Email notification service
 * Uses Nodemailer with sendmail (server's built-in mail) or SMTP
 *
 * Optional env vars for SMTP (if not set, uses sendmail):
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASSWORD
 * - SMTP_FROM_EMAIL
 * - SMTP_FROM_NAME
 *
 * Required:
 * - ADMIN_EMAIL (for notifications)
 */

import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Singleton transporter instance
let transporter: Transporter | null = null;

/**
 * Get or create nodemailer transporter
 * Uses SMTP if configured, otherwise falls back to sendmail
 */
function getTransporter(): Transporter {
	if (transporter) {
		return transporter;
	}

	const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_PORT } = env;

	// If SMTP is configured, use it
	if (SMTP_HOST && SMTP_USER && SMTP_PASSWORD) {
		console.log('[Email] Using SMTP transport:', SMTP_HOST);
		transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: parseInt(SMTP_PORT || '587'),
			secure: SMTP_PORT === '465',
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASSWORD
			}
		});
	} else {
		// Use sendmail (server's built-in mail system)
		console.log('[Email] Using sendmail transport');
		transporter = nodemailer.createTransport({
			sendmail: true,
			newline: 'unix',
			path: '/usr/sbin/sendmail'
		});
	}

	return transporter;
}

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
	replyTo?: string;
}

interface OrderEmailData {
	orderNumber: string;
	customerName: string;
	customerEmail: string;
	items: Array<{
		title: string;
		price: number;
	}>;
	totalEur: number;
	totalLocal: number;
	currencyCode: string;
	shippingCountry: string;
	shippingCity: string;
	lang: string;
}

interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	message: string;
	lang?: string;
}

/**
 * Send email using sendmail or SMTP
 * Returns true if sent successfully, false otherwise
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
	const { SMTP_FROM_EMAIL, SMTP_FROM_NAME } = env;

	const transport = getTransporter();
	const fromEmail = SMTP_FROM_EMAIL || 'noreply@k-liee.com';
	const fromName = SMTP_FROM_NAME || 'K-LI\u00C9E';

	try {
		const info = await transport.sendMail({
			from: `"${fromName}" <${fromEmail}>`,
			to: options.to,
			subject: options.subject,
			html: options.html,
			text: options.text,
			replyTo: options.replyTo
		});

		console.log('[Email] Sent successfully:', info.messageId || info.envelope?.to);
		return true;
	} catch (err) {
		console.error('[Email] Failed to send:', err);
		return false;
	}
}

/**
 * Get email subject by language for orders
 */
function getOrderSubject(orderNumber: string, lang: string): string {
	switch (lang) {
		case 'ru':
			return `\u0417\u0430\u043a\u0430\u0437 ${orderNumber} \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d - K-LI\u00C9E`;
		case 'es':
			return `Pedido ${orderNumber} confirmado - K-LI\u00C9E`;
		case 'zh':
			return `\u8ba2\u5355 ${orderNumber} \u5df2\u786e\u8ba4 - K-LI\u00C9E`;
		default:
			return `Order ${orderNumber} confirmed - K-LI\u00C9E`;
	}
}

/**
 * Get email translations
 */
function getTranslations(lang: string) {
	switch (lang) {
		case 'ru':
			return {
				greeting: '\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435',
				thankYou: '\u0421\u043f\u0430\u0441\u0438\u0431\u043e \u0437\u0430 \u0432\u0430\u0448 \u0437\u0430\u043a\u0430\u0437!',
				orderNumber: '\u041d\u043e\u043c\u0435\u0440 \u0437\u0430\u043a\u0430\u0437\u0430',
				orderDetails: '\u0414\u0435\u0442\u0430\u043b\u0438 \u0437\u0430\u043a\u0430\u0437\u0430',
				shippingTo: '\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430',
				total: '\u0418\u0442\u043e\u0433\u043e',
				nextSteps: '\u041c\u044b \u0441\u0432\u044f\u0436\u0435\u043c\u0441\u044f \u0441 \u0432\u0430\u043c\u0438 \u0432 \u0431\u043b\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043c\u044f \u0434\u043b\u044f \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u0434\u0435\u0442\u0430\u043b\u0435\u0439 \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438 \u0438 \u043e\u043f\u043b\u0430\u0442\u044b.',
				questions: '\u0415\u0441\u0442\u044c \u0432\u043e\u043f\u0440\u043e\u0441\u044b?',
				contactUs: '\u0421\u0432\u044f\u0436\u0438\u0442\u0435\u0441\u044c \u0441 \u043d\u0430\u043c\u0438'
			};
		case 'es':
			return {
				greeting: 'Hola',
				thankYou: '\u00a1Gracias por tu pedido!',
				orderNumber: 'N\u00famero de pedido',
				orderDetails: 'Detalles del pedido',
				shippingTo: 'Env\u00edo a',
				total: 'Total',
				nextSteps: 'Nos pondremos en contacto contigo pronto para confirmar los detalles de env\u00edo y pago.',
				questions: '\u00bfTienes preguntas?',
				contactUs: 'Cont\u00e1ctanos'
			};
		case 'zh':
			return {
				greeting: '\u60a8\u597d',
				thankYou: '\u611f\u8c22\u60a8\u7684\u8ba2\u5355\uff01',
				orderNumber: '\u8ba2\u5355\u53f7',
				orderDetails: '\u8ba2\u5355\u8be6\u60c5',
				shippingTo: '\u6536\u8d27\u5730\u5740',
				total: '\u603b\u8ba1',
				nextSteps: '\u6211\u4eec\u5c06\u5c3d\u5feb\u4e0e\u60a8\u8054\u7cfb\uff0c\u786e\u8ba4\u914d\u9001\u548c\u4ed8\u6b3e\u8be6\u60c5\u3002',
				questions: '\u6709\u95ee\u9898\uff1f',
				contactUs: '\u8054\u7cfb\u6211\u4eec'
			};
		default:
			return {
				greeting: 'Hello',
				thankYou: 'Thank you for your order!',
				orderNumber: 'Order Number',
				orderDetails: 'Order Details',
				shippingTo: 'Shipping to',
				total: 'Total',
				nextSteps: 'We will contact you shortly to confirm shipping and payment details.',
				questions: 'Have questions?',
				contactUs: 'Contact us'
			};
	}
}

/**
 * Format price for email
 */
function formatEmailPrice(amount: number, currency: string): string {
	const symbols: Record<string, string> = {
		EUR: '\u20ac',
		USD: '$',
		RUB: '\u20bd',
		CNY: '\u00a5'
	};
	return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
}

/**
 * Generate base email template
 */
function generateEmailTemplate(content: string, footer?: string): string {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
	<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
		<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
			<h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">K-LI\u00C9E</h1>
		</div>

		<div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
			${content}
		</div>

		<p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
			${footer || `\u00a9 ${new Date().getFullYear()} K-LI\u00C9E. All rights reserved.`}
		</p>
	</div>
</body>
</html>
	`.trim();
}

/**
 * Generate order confirmation email HTML
 */
function generateOrderEmailHtml(data: OrderEmailData): string {
	const t = getTranslations(data.lang);
	const itemsHtml = data.items
		.map(
			(item) => `
			<tr>
				<td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${item.title}</td>
				<td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatEmailPrice(item.price, 'EUR')}</td>
			</tr>
		`
		)
		.join('');

	const content = `
		<h2 style="margin: 0 0 10px; color: #1a1a1a; font-size: 24px;">${t.greeting}, ${data.customerName}!</h2>
		<p style="color: #6b7280; font-size: 16px; margin: 0 0 25px;">${t.thankYou}</p>

		<div style="background: #f9fafb; padding: 15px 20px; border-radius: 6px; margin-bottom: 25px;">
			<span style="color: #6b7280; font-size: 14px;">${t.orderNumber}</span>
			<p style="margin: 5px 0 0; color: #d4af37; font-size: 20px; font-weight: 600; font-family: monospace;">${data.orderNumber}</p>
		</div>

		<h3 style="margin: 0 0 15px; color: #1a1a1a; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">${t.orderDetails}</h3>
		<table style="width: 100%; border-collapse: collapse;">
			${itemsHtml}
		</table>

		<div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
			<table style="width: 100%;">
				<tr>
					<td style="font-size: 18px; font-weight: 600;">${t.total}</td>
					<td style="font-size: 18px; font-weight: 600; text-align: right; color: #1a1a1a;">${formatEmailPrice(data.totalLocal, data.currencyCode)}</td>
				</tr>
			</table>
		</div>

		<div style="margin-top: 25px; padding: 15px 20px; background: #f9fafb; border-radius: 6px;">
			<p style="margin: 0; color: #6b7280; font-size: 14px;">
				<strong>${t.shippingTo}:</strong> ${data.shippingCity}, ${data.shippingCountry}
			</p>
		</div>

		<p style="margin-top: 25px; color: #6b7280; font-size: 14px; line-height: 1.6;">
			${t.nextSteps}
		</p>

		<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

		<p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
			${t.questions} ${t.contactUs}: <a href="mailto:info@k-liee.com" style="color: #d4af37;">info@k-liee.com</a>
		</p>
	`;

	return generateEmailTemplate(content);
}

/**
 * Generate contact form email HTML for admin
 */
function generateContactEmailHtml(data: ContactFormData): string {
	const content = `
		<h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 20px;">New Contact Form Submission</h2>

		<table style="width: 100%; border-collapse: collapse;">
			<tr>
				<td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 100px;"><strong>From:</strong></td>
				<td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
			</tr>
			<tr>
				<td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Email:</strong></td>
				<td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
					<a href="mailto:${data.email}" style="color: #667eea;">${data.email}</a>
				</td>
			</tr>
			<tr>
				<td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Subject:</strong></td>
				<td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${data.subject}</td>
			</tr>
		</table>

		<div style="margin-top: 25px;">
			<h3 style="margin: 0 0 10px; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Message</h3>
			<div style="background: #f9fafb; padding: 20px; border-radius: 6px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #374151;">
${data.message}
			</div>
		</div>

		<div style="margin-top: 25px; text-align: center;">
			<a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Reply to ${data.name}</a>
		</div>
	`;

	return generateEmailTemplate(content);
}

/**
 * Generate auto-reply email for contact form
 */
function generateContactAutoReplyHtml(data: ContactFormData): string {
	const translations: Record<string, { title: string; body: string; closing: string }> = {
		en: {
			title: 'Thank you for contacting us!',
			body: 'We have received your message and will get back to you as soon as possible. Usually within 1-2 business days.',
			closing: 'Best regards,<br>K-LI\u00C9E Team'
		},
		ru: {
			title: '\u0421\u043f\u0430\u0441\u0438\u0431\u043e \u0437\u0430 \u0432\u0430\u0448\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435!',
			body: '\u041c\u044b \u043f\u043e\u043b\u0443\u0447\u0438\u043b\u0438 \u0432\u0430\u0448\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0438 \u043e\u0442\u0432\u0435\u0442\u0438\u043c \u0432\u0430\u043c \u0432 \u0431\u043b\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043c\u044f. \u041e\u0431\u044b\u0447\u043d\u043e \u0432 \u0442\u0435\u0447\u0435\u043d\u0438\u0435 1-2 \u0440\u0430\u0431\u043e\u0447\u0438\u0445 \u0434\u043d\u0435\u0439.',
			closing: '\u0421 \u0443\u0432\u0430\u0436\u0435\u043d\u0438\u0435\u043c,<br>\u041a\u043e\u043c\u0430\u043d\u0434\u0430 K-LI\u00C9E'
		},
		es: {
			title: '\u00a1Gracias por contactarnos!',
			body: 'Hemos recibido tu mensaje y te responderemos lo antes posible. Normalmente dentro de 1-2 d\u00edas h\u00e1biles.',
			closing: 'Saludos cordiales,<br>Equipo K-LI\u00C9E'
		},
		zh: {
			title: '\u611f\u8c22\u60a8\u7684\u7559\u8a00\uff01',
			body: '\u6211\u4eec\u5df2\u6536\u5230\u60a8\u7684\u6d88\u606f\uff0c\u5c06\u5c3d\u5feb\u56de\u590d\u60a8\u3002\u901a\u5e38\u57281-2\u4e2a\u5de5\u4f5c\u65e5\u5185\u3002',
			closing: '\u6b64\u81f4\u656c\u793c,<br>K-LI\u00C9E \u56e2\u961f'
		}
	};

	const t = translations[data.lang || 'en'] || translations.en;

	const content = `
		<h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px;">${t.title}</h2>

		<p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
			${t.body}
		</p>

		<div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
			<p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;"><strong>Your message:</strong></p>
			<p style="margin: 0; color: #374151; font-size: 14px; font-style: italic;">"${data.message.slice(0, 200)}${data.message.length > 200 ? '...' : ''}"</p>
		</div>

		<p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
			${t.closing}
		</p>
	`;

	return generateEmailTemplate(content);
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
	const subject = getOrderSubject(data.orderNumber, data.lang);
	const html = generateOrderEmailHtml(data);

	return sendEmail({
		to: data.customerEmail,
		subject,
		html
	});
}

/**
 * Send order notification to admin
 */
export async function sendAdminOrderNotification(data: OrderEmailData): Promise<boolean> {
	const { ADMIN_EMAIL } = env;

	if (!ADMIN_EMAIL) {
		console.log('[Email] ADMIN_EMAIL not configured, skipping admin notification');
		return false;
	}

	const itemsList = data.items.map((i) => `- ${i.title}: \u20ac${i.price}`).join('\n');

	const content = `
		<h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 20px;">New Order Received!</h2>

		<table style="width: 100%; border-collapse: collapse;">
			<tr>
				<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 120px;"><strong>Order Number:</strong></td>
				<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace; color: #d4af37;">${data.orderNumber}</td>
			</tr>
			<tr>
				<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Customer:</strong></td>
				<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.customerName}</td>
			</tr>
			<tr>
				<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Email:</strong></td>
				<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
					<a href="mailto:${data.customerEmail}" style="color: #667eea;">${data.customerEmail}</a>
				</td>
			</tr>
			<tr>
				<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Shipping:</strong></td>
				<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.shippingCity}, ${data.shippingCountry}</td>
			</tr>
		</table>

		<div style="margin-top: 20px;">
			<h3 style="margin: 0 0 10px; color: #374151; font-size: 14px;">Items:</h3>
			<pre style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 0; font-size: 13px;">${itemsList}</pre>
		</div>

		<div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 6px;">
			<p style="margin: 0; font-size: 18px; font-weight: 600; color: #166534;">
				Total: \u20ac${data.totalEur} (${data.currencyCode} ${data.totalLocal})
			</p>
		</div>

		<div style="margin-top: 25px; text-align: center;">
			<a href="${env.PUBLIC_BASE_URL || 'https://k-liee.com'}/admin/orders" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">View in Admin Panel</a>
		</div>
	`;

	return sendEmail({
		to: ADMIN_EMAIL,
		subject: `[K-LI\u00C9E] New Order ${data.orderNumber}`,
		html: generateEmailTemplate(content)
	});
}

/**
 * Send contact form notification to admin
 * @param data - Contact form data
 * @param recipientOverride - Optional email override (from DB settings). Falls back to ADMIN_EMAIL env var.
 */
export async function sendContactFormEmail(data: ContactFormData, recipientOverride?: string): Promise<boolean> {
	const recipient = recipientOverride || env.ADMIN_EMAIL;

	if (!recipient) {
		console.log('[Email] No recipient configured (neither DB setting nor ADMIN_EMAIL env), skipping contact notification');
		return false;
	}

	const html = generateContactEmailHtml(data);

	return sendEmail({
		to: recipient,
		subject: `[K-LI\u00C9E Contact] ${data.subject}`,
		html,
		replyTo: data.email
	});
}

/**
 * Send auto-reply to contact form submitter
 */
export async function sendContactAutoReply(data: ContactFormData): Promise<boolean> {
	const translations: Record<string, string> = {
		en: 'Thank you for your message - K-LI\u00C9E',
		ru: '\u0421\u043f\u0430\u0441\u0438\u0431\u043e \u0437\u0430 \u0432\u0430\u0448\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 - K-LI\u00C9E',
		es: 'Gracias por tu mensaje - K-LI\u00C9E',
		zh: '\u611f\u8c22\u60a8\u7684\u7559\u8a00 - K-LI\u00C9E'
	};

	const subject = translations[data.lang || 'en'] || translations.en;
	const html = generateContactAutoReplyHtml(data);

	return sendEmail({
		to: data.email,
		subject,
		html
	});
}

/**
 * Verify email transport (SMTP or sendmail)
 */
export async function verifyEmailConfig(): Promise<{ configured: boolean; connected: boolean; transport: string; error?: string }> {
	const { SMTP_HOST } = env;
	const transportType = SMTP_HOST ? 'SMTP' : 'sendmail';

	try {
		const transport = getTransporter();
		// For sendmail, we can't really verify - just check it was created
		if (!SMTP_HOST) {
			return { configured: true, connected: true, transport: transportType };
		}
		// For SMTP, verify connection
		await transport.verify();
		return { configured: true, connected: true, transport: transportType };
	} catch (err) {
		return {
			configured: true,
			connected: false,
			transport: transportType,
			error: err instanceof Error ? err.message : 'Unknown error'
		};
	}
}
