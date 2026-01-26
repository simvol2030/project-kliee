import { db } from '$lib/server/db/client';
import { chatFaq } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid FAQ ID');
	}

	const [faq] = await db.select().from(chatFaq).where(eq(chatFaq.id, id)).limit(1);

	if (!faq) {
		throw error(404, 'FAQ not found');
	}

	return { faq };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = parseInt(params.id);
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
			await db
				.update(chatFaq)
				.set({
					question_en,
					answer_en,
					question_ru: question_ru || null,
					answer_ru: answer_ru || null,
					question_es: question_es || null,
					answer_es: answer_es || null,
					question_zh: question_zh || null,
					answer_zh: answer_zh || null,
					keywords: keywords ? JSON.stringify(keywords.split(',').map((k) => k.trim())) : null
				})
				.where(eq(chatFaq.id, id));

			throw redirect(303, '/chatbot/faq');
		} catch (err) {
			if (err instanceof Response || (err && typeof err === "object" && "status" in err)) throw err;
			console.error('Failed to update FAQ:', err);
			return fail(500, { error: 'Failed to update FAQ' });
		}
	}
};
