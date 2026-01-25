/**
 * Media Settings API
 *
 * GET /api/media/settings - Get current watermark and image settings
 * POST /api/media/settings - Save watermark and image settings
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMediaSettings, saveMediaSettings, type MediaSettings } from '$lib/server/image-processor';

/**
 * GET /api/media/settings
 * Returns current media processing settings
 */
export const GET: RequestHandler = async () => {
	try {
		const settings = await getMediaSettings();
		return json({
			success: true,
			settings
		});
	} catch (err) {
		console.error('Failed to get media settings:', err);
		throw error(500, 'Failed to get media settings');
	}
};

/**
 * POST /api/media/settings
 * Save media processing settings
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Validate required fields
		const newSettings: Partial<MediaSettings> = {};

		if (typeof body.watermark_text === 'string') {
			newSettings.watermark_text = body.watermark_text.trim();
		}

		if (typeof body.watermark_enabled === 'boolean') {
			newSettings.watermark_enabled = body.watermark_enabled;
		}

		if (typeof body.watermark_opacity === 'number') {
			// Clamp opacity between 0.1 and 1.0
			newSettings.watermark_opacity = Math.max(0.1, Math.min(1.0, body.watermark_opacity));
		}

		if (typeof body.watermark_position === 'string') {
			newSettings.watermark_position = body.watermark_position;
		}

		if (typeof body.image_quality === 'number') {
			// Clamp quality between 50 and 100
			newSettings.image_quality = Math.max(50, Math.min(100, body.image_quality));
		}

		if (typeof body.image_format === 'string' && ['webp', 'jpeg'].includes(body.image_format)) {
			newSettings.image_format = body.image_format as 'webp' | 'jpeg';
		}

		// Save settings
		await saveMediaSettings(newSettings);

		// Return updated settings
		const updatedSettings = await getMediaSettings();

		return json({
			success: true,
			settings: updatedSettings
		});
	} catch (err) {
		console.error('Failed to save media settings:', err);
		throw error(500, 'Failed to save media settings');
	}
};
