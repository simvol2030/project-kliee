/**
 * Telegram notification service for order alerts
 * Uses environment variables for configuration
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

/**
 * Send message to Telegram
 */
async function sendTelegramMessage(
	chatId: string,
	text: string,
	parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> {
	const { TELEGRAM_BOT_TOKEN } = env;

	if (!TELEGRAM_BOT_TOKEN) {
		console.log('TELEGRAM_BOT_TOKEN not configured, skipping Telegram notification');
		return false;
	}

	try {
		const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
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
 * Send test message to verify Telegram configuration
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
