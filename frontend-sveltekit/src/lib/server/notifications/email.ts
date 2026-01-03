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
	const fromName = SMTP_FROM_NAME || 'K-LIÉE';

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
			return `Заказ ${orderNumber} подтверждён - K-LIÉE`;
		case 'es':
			return `Pedido ${orderNumber} confirmado - K-LIÉE`;
		case 'zh':
			return `订单 ${orderNumber} 已确认 - K-LIÉE`;
		default:
			return `Order ${orderNumber} confirmed - K-LIÉE`;
	}
}

/**
 * Get email translations
 */
function getTranslations(lang: string) {
	switch (lang) {
		case 'ru':
			return {
				greeting: 'Здравствуйте',
				thankYou: 'Спасибо за ваш заказ!',
				orderNumber: 'Номер заказа',
				orderDetails: 'Детали заказа',
				shippingTo: 'Доставка',
				total: 'Итого',
				nextSteps: 'Мы свяжемся с вами в ближайшее время для подтверждения деталей доставки и оплаты.',
				questions: 'Есть вопросы?',
				contactUs: 'Свяжитесь с нами'
			};
		case 'es':
			return {
				greeting: 'Hola',
				thankYou: '¡Gracias por tu pedido!',
				orderNumber: 'Número de pedido',
				orderDetails: 'Detalles del pedido',
				shippingTo: 'Envío a',
				total: 'Total',
				nextSteps: 'Nos pondremos en contacto contigo pronto para confirmar los detalles de envío y pago.',
				questions: '¿Tienes preguntas?',
				contactUs: 'Contáctanos'
			};
		case 'zh':
			return {
				greeting: '您好',
				thankYou: '感谢您的订单！',
				orderNumber: '订单号',
				orderDetails: '订单详情',
				shippingTo: '收货地址',
				total: '总计',
				nextSteps: '我们将尽快与您联系，确认配送和付款详情。',
				questions: '有问题？',
				contactUs: '联系我们'
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
		EUR: '€',
		USD: '$',
		RUB: '₽',
		CNY: '¥'
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
			<h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">K-LIÉE</h1>
		</div>

		<div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
			${content}
		</div>

		<p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
			${footer || `© ${new Date().getFullYear()} K-LIÉE. All rights reserved.`}
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
			closing: 'Best regards,<br>K-LIÉE Team'
		},
		ru: {
			title: 'Спасибо за ваше сообщение!',
			body: 'Мы получили ваше сообщение и ответим вам в ближайшее время. Обычно в течение 1-2 рабочих дней.',
			closing: 'С уважением,<br>Команда K-LIÉE'
		},
		es: {
			title: '¡Gracias por contactarnos!',
			body: 'Hemos recibido tu mensaje y te responderemos lo antes posible. Normalmente dentro de 1-2 días hábiles.',
			closing: 'Saludos cordiales,<br>Equipo K-LIÉE'
		},
		zh: {
			title: '感谢您的留言！',
			body: '我们已收到您的消息，将尽快回复您。通常在1-2个工作日内。',
			closing: '此致敬礼,<br>K-LIÉE 团队'
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

	const itemsList = data.items.map((i) => `- ${i.title}: €${i.price}`).join('\n');

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
				Total: €${data.totalEur} (${data.currencyCode} ${data.totalLocal})
			</p>
		</div>

		<div style="margin-top: 25px; text-align: center;">
			<a href="${env.PUBLIC_BASE_URL || 'https://k-liee.com'}/admin/orders" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">View in Admin Panel</a>
		</div>
	`;

	return sendEmail({
		to: ADMIN_EMAIL,
		subject: `[K-LIÉE] New Order ${data.orderNumber}`,
		html: generateEmailTemplate(content)
	});
}

/**
 * Send contact form notification to admin
 */
export async function sendContactFormEmail(data: ContactFormData): Promise<boolean> {
	const { ADMIN_EMAIL } = env;

	if (!ADMIN_EMAIL) {
		console.log('[Email] ADMIN_EMAIL not configured, skipping contact notification');
		return false;
	}

	const html = generateContactEmailHtml(data);

	return sendEmail({
		to: ADMIN_EMAIL,
		subject: `[K-LIÉE Contact] ${data.subject}`,
		html,
		replyTo: data.email
	});
}

/**
 * Send auto-reply to contact form submitter
 */
export async function sendContactAutoReply(data: ContactFormData): Promise<boolean> {
	const translations: Record<string, string> = {
		en: 'Thank you for your message - K-LIÉE',
		ru: 'Спасибо за ваше сообщение - K-LIÉE',
		es: 'Gracias por tu mensaje - K-LIÉE',
		zh: '感谢您的留言 - K-LIÉE'
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
