import { getMediaSettings, saveMediaSettings } from '$lib/server/image-processor';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const settings = await getMediaSettings();

	return {
		settings
	};
};

export const actions: Actions = {
	save: async ({ request }) => {
		const formData = await request.formData();

		const watermark_text = formData.get('watermark_text') as string;
		const watermark_enabled = formData.get('watermark_enabled') === 'on';
		const watermark_opacity = parseFloat(formData.get('watermark_opacity') as string) || 0.6;
		const image_quality = parseInt(formData.get('image_quality') as string) || 92;

		// Validate
		if (!watermark_text || watermark_text.trim().length === 0) {
			return fail(400, { error: 'Watermark text is required' });
		}

		if (watermark_opacity < 0.1 || watermark_opacity > 1.0) {
			return fail(400, { error: 'Opacity must be between 0.1 and 1.0' });
		}

		if (image_quality < 50 || image_quality > 100) {
			return fail(400, { error: 'Quality must be between 50 and 100' });
		}

		try {
			await saveMediaSettings({
				watermark_text: watermark_text.trim(),
				watermark_enabled,
				watermark_opacity,
				image_quality
			});

			return { success: true };
		} catch (err) {
			console.error('Failed to save media settings:', err);
			return fail(500, { error: 'Failed to save settings' });
		}
	}
};
