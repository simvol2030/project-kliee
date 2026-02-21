/**
 * Telegram notification service for order and contact alerts
 * Uses environment variables for configuration, with optional DB overrides
 *
 * Required env vars:
 * - TELEGRAM_BOT_TOKEN
 * - TELEGRAM_CHAT_ID (admin chat or channel ID)
 */

import { env } from '$env/dynamic/private';

interface OrderNotificationData {
	orderNumber: string;
	customerName: string;
	customerEmail: string;
	customerPhone?: string | null;
	items: Array<{
		title: string;
		price: number;
	}>;
	totalEur: number;
	totalLocal: number;
	currencyCode: string;
	shippingCountry: string;
	shippingCity: string;
	shippingAddress: string;
	note?: string | null;
}

interface ContactNotificationData {
	name: string;
	email: string;
	subject: string;
	message: string;
}

/**
 * Send message to Telegram
 * Accepts optional botToken override (from DB settings), falls back to env var
 */
async function sendTelegramMessage(
	chatId: string,
	text: string,
	parseMode: 'HTML' | 'Markdown' = 'HTML',
	botToken?: string
): Promise<boolean> {
	const token = botToken || env.TELEGRAM_BOT_TOKEN;

	if (!token) {
		console.log('TELEGRAM_BOT_TOKEN not configured, skipping Telegram notification');
		return false;
	}

	try {
		const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				chat_id: chatId,
				text,
				parse_mode: parseMode,
				disable_web_page_preview: true
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Telegram API error:', errorData);
			return false;
		}

		console.log('Telegram notification sent to:', chatId);
		return true;
	} catch (err) {
		console.error('Failed to send Telegram message:', err);
		return false;
	}
}

/**
 * Escape HTML special characters for Telegram
 */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Format order notification message for Telegram
 */
function formatOrderMessage(data: OrderNotificationData): string {
	const itemsList = data.items
		.map((item) => `  • ${escapeHtml(item.title)}: €${item.price}`)
		.join('\n');

	let message = `
🛒 <b>NEW ORDER!</b>

<b>Order:</b> <code>${data.orderNumber}</code>

<b>Customer:</b>
${escapeHtml(data.customerName)}
📧 ${escapeHtml(data.customerEmail)}`;

	if (data.customerPhone) {
		message += `\n📱 ${escapeHtml(data.customerPhone)}`;
	}

	message += `

<b>Items:</b>
${itemsList}

<b>Total:</b> €${data.totalEur.toLocaleString()}`;

	if (data.currencyCode !== 'EUR') {
		message += ` (${data.currencyCode} ${data.totalLocal.toLocaleString()})`;
	}

	message += `

<b>Shipping:</b>
📍 ${escapeHtml(data.shippingCity)}, ${escapeHtml(data.shippingCountry)}
${escapeHtml(data.shippingAddress)}`;

	if (data.note) {
		message += `

<b>Note:</b>
<i>${escapeHtml(data.note)}</i>`;
	}

	message += `

⏰ ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Madrid' })}`;

	return message.trim();
}

/**
 * Send order notification to admin via Telegram
 */
export async function sendTelegramOrderNotification(
	data: OrderNotificationData
): Promise<boolean> {
	const { TELEGRAM_CHAT_ID } = env;

	if (!TELEGRAM_CHAT_ID) {
		console.log('TELEGRAM_CHAT_ID not configured, skipping Telegram notification');
		return false;
	}

	const message = formatOrderMessage(data);
	return sendTelegramMessage(TELEGRAM_CHAT_ID, message, 'HTML');
}

/**
 * Send test message to verify Telegram configuration (orders)
 */
export async function sendTelegramTestMessage(): Promise<boolean> {
	const { TELEGRAM_CHAT_ID } = env;

	if (!TELEGRAM_CHAT_ID) {
		console.log('TELEGRAM_CHAT_ID not configured');
		return false;
	}

	const message = `
✅ <b>K-LIÉE Shop Notification Test</b>

Your Telegram notifications are configured correctly!

<i>This is a test message from the shop system.</i>
	`.trim();

	return sendTelegramMessage(TELEGRAM_CHAT_ID, message, 'HTML');
}

/**
 * Format contact form notification message for Telegram
 */
function formatContactMessage(data: ContactNotificationData): string {
	const truncatedMessage = data.message.length > 800
		? data.message.slice(0, 800) + '...'
		: data.message;

	return `
📩 <b>NEW CONTACT MESSAGE</b>

<b>From:</b> ${escapeHtml(data.name)}
📧 ${escapeHtml(data.email)}

<b>Subject:</b> ${escapeHtml(data.subject)}

<b>Message:</b>
<i>${escapeHtml(truncatedMessage)}</i>

⏰ ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Madrid' })}
	`.trim();
}

/**
 * Send contact form notification to admin via Telegram
 * Uses DB settings (botToken, chatId) with fallback to env vars
 */
export async function sendTelegramContactNotification(
	data: ContactNotificationData,
	botToken?: string,
	chatId?: string
): Promise<boolean> {
	const resolvedChatId = chatId || env.TELEGRAM_CHAT_ID;

	if (!resolvedChatId) {
		console.log('Telegram chat ID not configured, skipping contact notification');
		return false;
	}

	const message = formatContactMessage(data);
	return sendTelegramMessage(resolvedChatId, message, 'HTML', botToken);
}

/**
 * Send test message to verify contact Telegram configuration
 * Uses provided botToken/chatId (from admin settings)
 */
export async function sendTelegramContactTestMessage(
	botToken?: string,
	chatId?: string
): Promise<boolean> {
	const resolvedChatId = chatId || env.TELEGRAM_CHAT_ID;
	const resolvedToken = botToken || env.TELEGRAM_BOT_TOKEN;

	if (!resolvedChatId || !resolvedToken) {
		console.log('Telegram bot token or chat ID not configured');
		return false;
	}

	const message = `
✅ <b>K-LIÉE Contact Notification Test</b>

Your contact form Telegram notifications are configured correctly!

<i>This is a test message from the contact settings.</i>
	`.trim();

	return sendTelegramMessage(resolvedChatId, message, 'HTML', resolvedToken);
}
