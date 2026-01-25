import { db } from '$lib/server/db/client';
import { chatFaq } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const faqs = await db
		.select()
		.from(chatFaq)
		.orderBy(asc(chatFaq.order_index));

	return { faqs };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();

		const question_en = formData.get('question_en') as string;
		const answer_en = formData.get('answer_en') as string;
		const question_ru = formData.get('question_ru') as string;
		const answer_ru = formData.get('answer_ru') as string;
		const question_es = formData.get('question_es') as string;
		const answer_es = formData.get('answer_es') as string;
		const question_zh = formData.get('question_zh') as string;
		const answer_zh = formData.get('answer_zh') as string;
		const keywords = formData.get('keywords') as string;

		if (!question_en || !answer_en) {
			return fail(400, { error: 'English question and answer are required' });
		}

		try {
			// Get max order_index
			const existing = await db.select().from(chatFaq);
			const maxOrder = Math.max(0, ...existing.map((f) => f.order_index || 0));

			await db.insert(chatFaq).values({
				question_en,
				answer_en,
				question_ru: question_ru || null,
				answer_ru: answer_ru || null,
				question_es: question_es || null,
				answer_es: answer_es || null,
				question_zh: question_zh || null,
				answer_zh: answer_zh || null,
				keywords: keywords ? JSON.stringify(keywords.split(',').map((k) => k.trim())) : null,
				is_active: true,
				order_index: maxOrder + 1
			});

			return { success: true };
		} catch (err) {
			console.error('Failed to create FAQ:', err);
			return fail(500, { error: 'Failed to create FAQ' });
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		try {
			await db.delete(chatFaq).where(eq(chatFaq.id, id));
			return { success: true };
		} catch (err) {
			console.error('Failed to delete FAQ:', err);
			return fail(500, { error: 'Failed to delete FAQ' });
		}
	},

	toggle: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);
		const is_active = formData.get('is_active') === 'true';

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		try {
			await db
				.update(chatFaq)
				.set({ is_active: !is_active })
				.where(eq(chatFaq.id, id));
			return { success: true };
		} catch (err) {
			console.error('Failed to toggle FAQ:', err);
			return fail(500, { error: 'Failed to toggle FAQ' });
		}
	}
};
