import { db } from '$lib/server/db/client';
import { chatbotSettings } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { DEFAULT_SYSTEM_PROMPT, AVAILABLE_MODELS } from '$lib/server/openrouter';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Get settings (or create default)
	let [settings] = await db.select().from(chatbotSettings).limit(1);

	if (!settings) {
		const [newSettings] = await db
			.insert(chatbotSettings)
			.values({
				system_prompt: DEFAULT_SYSTEM_PROMPT,
				model: 'anthropic/claude-3-haiku',
				temperature: '0.7',
				max_tokens: 1024,
				greeting_en: 'Hello! I\'m Melena, your art consultant. How can I help you today?',
				greeting_ru: 'Здравствуйте! Я Мелена, ваш консультант по искусству. Чем могу помочь?',
				greeting_es: 'Hola! Soy Melena, tu asesora de arte. Como puedo ayudarte hoy?',
				greeting_zh: '你好！我是Melena，您的艺术顾问。今天我能帮您什么？',
				is_enabled: true
			})
			.returning();
		settings = newSettings;
	}

	return {
		settings,
		availableModels: AVAILABLE_MODELS
	};
};

export const actions: Actions = {
	save: async ({ request }) => {
		const formData = await request.formData();

		const api_key = formData.get('api_key') as string;
		const system_prompt = formData.get('system_prompt') as string;
		const model = formData.get('model') as string;
		const temperature = formData.get('temperature') as string;
		const max_tokens = parseInt(formData.get('max_tokens') as string) || 1024;
		const greeting_en = formData.get('greeting_en') as string;
		const greeting_ru = formData.get('greeting_ru') as string;
		const greeting_es = formData.get('greeting_es') as string;
		const greeting_zh = formData.get('greeting_zh') as string;
		const avatar_url = formData.get('avatar_url') as string;
		const is_enabled = formData.get('is_enabled') === 'on';

		if (!system_prompt || !model) {
			return fail(400, { error: 'System prompt and model are required' });
		}

		try {
			// Get existing settings ID
			const [existing] = await db.select().from(chatbotSettings).limit(1);

			if (existing) {
				await db
					.update(chatbotSettings)
					.set({
						api_key: api_key || null,
						system_prompt,
						model,
						temperature,
						max_tokens,
						greeting_en,
						greeting_ru,
						greeting_es,
						greeting_zh,
						avatar_url: avatar_url || null,
						is_enabled,
						updated_at: new Date().toISOString()
					})
					.where(eq(chatbotSettings.id, existing.id));
			} else {
				await db.insert(chatbotSettings).values({
					api_key: api_key || null,
					system_prompt,
					model,
					temperature,
					max_tokens,
					greeting_en,
					greeting_ru,
					greeting_es,
					greeting_zh,
					is_enabled,
					avatar_url: avatar_url || null
				});
			}

			return { success: true };
		} catch (err) {
			console.error('Failed to save settings:', err);
			return fail(500, { error: 'Failed to save settings' });
		}
	}
};
