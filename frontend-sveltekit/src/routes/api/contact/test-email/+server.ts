import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendEmail, verifyEmailConfig } from '$lib/server/notifications/email';

// POST - send test email
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { to } = body;

		if (!to) {
			throw error(400, 'Recipient email (to) is required');
		}

		// First verify transport
		const config = await verifyEmailConfig();
		if (!config.connected) {
			return json({
				success: false,
				error: `Email transport not connected: ${config.error || 'unknown error'}`,
				transport: config.transport
			}, { status: 503 });
		}

		// Send test email
		const sent = await sendEmail({
			to,
			subject: '[K-LIÉE] Test Email',
			html: `
				<div style="font-family: sans-serif; padding: 20px;">
					<h2>Test Email from K-LIÉE</h2>
					<p>This is a test email sent from the admin panel.</p>
					<p>If you received this, your email configuration is working correctly.</p>
					<hr>
					<p style="color: #666; font-size: 12px;">
						Transport: ${config.transport}<br>
						Sent at: ${new Date().toISOString()}
					</p>
				</div>
			`
		});

		return json({
			success: sent,
			transport: config.transport,
			message: sent ? 'Test email sent successfully' : 'Failed to send test email'
		});
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error sending test email:', err);
		throw error(500, 'Failed to send test email');
	}
};
