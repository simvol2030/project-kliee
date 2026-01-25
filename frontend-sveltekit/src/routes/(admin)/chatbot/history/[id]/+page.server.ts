import { db } from '$lib/server/db/client';
import { chatbotSessions, chatbotMessages } from '$lib/server/db/schema';
import { error, fail } from '@sveltejs/kit';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const session_id = params.id;

	// Get session
	const [session] = await db
		.select()
		.from(chatbotSessions)
		.where(eq(chatbotSessions.session_id, session_id))
		.limit(1);

	if (!session) {
		throw error(404, 'Session not found');
	}

	// Get messages
	const messages = await db
		.select()
		.from(chatbotMessages)
		.where(eq(chatbotMessages.session_id, session_id))
		.orderBy(asc(chatbotMessages.created_at));

	return { session, messages };
};

export const actions: Actions = {
	updateNote: async ({ request, params }) => {
		const session_id = params.id;
		const formData = await request.formData();
		const admin_note = formData.get('admin_note') as string;

		try {
			await db
				.update(chatbotSessions)
				.set({ admin_note })
				.where(eq(chatbotSessions.session_id, session_id));
			return { success: true };
		} catch (err) {
			console.error('Failed to update note:', err);
			return fail(500, { error: 'Failed to update note' });
		}
	}
};
