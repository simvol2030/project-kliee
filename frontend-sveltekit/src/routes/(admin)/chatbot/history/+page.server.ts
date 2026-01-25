import { db } from '$lib/server/db/client';
import { chatbotSessions, chatbotMessages } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	// Get sessions with message count
	const sessions = await db
		.select({
			id: chatbotSessions.id,
			session_id: chatbotSessions.session_id,
			visitor_id: chatbotSessions.visitor_id,
			lang: chatbotSessions.lang,
			started_at: chatbotSessions.started_at,
			last_message_at: chatbotSessions.last_message_at,
			is_saved: chatbotSessions.is_saved,
			admin_note: chatbotSessions.admin_note,
			message_count: sql<number>`(SELECT COUNT(*) FROM chatbot_messages WHERE session_id = ${chatbotSessions.session_id})`
		})
		.from(chatbotSessions)
		.orderBy(desc(chatbotSessions.started_at))
		.limit(100);

	return { sessions };
};

export const actions: Actions = {
	toggleSaved: async ({ request }) => {
		const formData = await request.formData();
		const session_id = formData.get('session_id') as string;
		const is_saved = formData.get('is_saved') === 'true';

		if (!session_id) {
			return fail(400, { error: 'Session ID is required' });
		}

		try {
			await db
				.update(chatbotSessions)
				.set({ is_saved: !is_saved })
				.where(eq(chatbotSessions.session_id, session_id));
			return { success: true };
		} catch (err) {
			console.error('Failed to toggle saved:', err);
			return fail(500, { error: 'Failed to update session' });
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const session_id = formData.get('session_id') as string;

		if (!session_id) {
			return fail(400, { error: 'Session ID is required' });
		}

		try {
			await db.delete(chatbotSessions).where(eq(chatbotSessions.session_id, session_id));
			return { success: true };
		} catch (err) {
			console.error('Failed to delete session:', err);
			return fail(500, { error: 'Failed to delete session' });
		}
	}
};
