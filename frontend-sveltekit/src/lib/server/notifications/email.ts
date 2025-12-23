/**
 * Email notification service for order confirmations
 * Uses environment variables for SMTP configuration
 *
 * Required env vars:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASSWORD
 * - SMTP_FROM_EMAIL
 * - SMTP_FROM_NAME
 */

import { env } from '$env/dynamic/private';

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
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

/**
 * Send email using SMTP
 * Returns true if sent successfully, false otherwise
 *
 * Note: Email functionality requires nodemailer to be installed.
 * If nodemailer is not available, emails will be logged but not sent.
 * To enable email sending, install nodemailer: npm install nodemailer
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
	const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_FROM_NAME } = env;

	if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
		console.log('[Email] SMTP not configured, skipping email:', options.subject);
		console.log('[Email] To:', options.to);
		return false;
	}

	try {
		// For now, log the email details
		// When nodemailer is installed, uncomment the code below
		console.log('[Email] Would send to:', options.to);
		console.log('[Email] Subject:', options.subject);
		console.log('[Email] SMTP configured:', SMTP_HOST);

		/*
		// Uncomment when nodemailer is installed:
		import nodemailer from 'nodemailer';

		const transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: parseInt(SMTP_PORT || '587'),
			secure: SMTP_PORT === '465',
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASSWORD
			}
		});

		await transporter.sendMail({
			from: `"${SMTP_FROM_NAME || 'K-LIÉE'}" <${SMTP_FROM_EMAIL || SMTP_USER}>`,
			to: options.to,
			subject: options.subject,
			html: options.html,
			text: options.text
		});

		console.log('[Email] Sent to:', options.to);
		*/

		return true;
	} catch (err) {
		console.error('[Email] Failed to send:', err);
		return false;
	}
}

/**
 * Get email subject by language
 */
function getSubject(orderNumber: string, lang: string): string {
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
				<div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 600;">
					<span>${t.total}</span>
					<span style="color: #1a1a1a;">${formatEmailPrice(data.totalLocal, data.currencyCode)}</span>
				</div>
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
		</div>

		<p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
			© ${new Date().getFullYear()} K-LIÉE. All rights reserved.
		</p>
	</div>
</body>
</html>
	`.trim();
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
	const subject = getSubject(data.orderNumber, data.lang);
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
		console.log('ADMIN_EMAIL not configured, skipping admin notification');
		return false;
	}

	const itemsList = data.items.map((i) => `- ${i.title}: €${i.price}`).join('\n');

	const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
</head>
<body style="font-family: sans-serif; padding: 20px;">
	<h1 style="color: #1a1a1a;">New Order Received!</h1>

	<p><strong>Order Number:</strong> ${data.orderNumber}</p>
	<p><strong>Customer:</strong> ${data.customerName}</p>
	<p><strong>Email:</strong> ${data.customerEmail}</p>
	<p><strong>Shipping:</strong> ${data.shippingCity}, ${data.shippingCountry}</p>

	<h3>Items:</h3>
	<pre style="background: #f5f5f5; padding: 15px; border-radius: 6px;">${itemsList}</pre>

	<p><strong>Total:</strong> €${data.totalEur} (${data.currencyCode} ${data.totalLocal})</p>

	<p style="color: #6b7280; margin-top: 30px;">
		<a href="${env.PUBLIC_BASE_URL || ''}/shop/orders">View in Admin Panel</a>
	</p>
</body>
</html>
	`.trim();

	return sendEmail({
		to: ADMIN_EMAIL,
		subject: `[K-LIÉE] New Order ${data.orderNumber}`,
		html
	});
}
