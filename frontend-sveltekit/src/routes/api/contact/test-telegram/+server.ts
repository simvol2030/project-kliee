import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendTelegramContactTestMessage } from '$lib/server/notifications/telegram';

// POST - send test Telegram message
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { bot_token, chat_id } = body;

		if (!bot_token || !chat_id) {
			throw error(400, 'Bot token and chat ID are required');
		}

		const sent = await sendTelegramContactTestMessage(bot_token, chat_id);

		return json({
			success: sent,
			message: sent ? 'Test message sent to Telegram' : 'Failed to send test message'
		});
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error sending test Telegram message:', err);
		throw error(500, 'Failed to send test Telegram message');
	}
};
