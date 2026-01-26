/**
 * Image Processor Module
 *
 * Handles image processing with Sharp:
 * - WebP conversion
 * - Watermark overlay
 * - Thumbnail generation
 * - Quality optimization
 */

import sharp from 'sharp';
import { db } from '$lib/server/db/client';
import { settings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Default settings
const DEFAULT_SETTINGS = {
	watermark_text: 'K-LIÉE',
	watermark_enabled: true,
	watermark_opacity: 0.75, // Increased from 0.6 for better visibility
	watermark_position: 'bottom-right',
	image_quality: 92,
	image_format: 'webp'
};

// Thumbnail sizes
export const THUMBNAIL_SIZES = [
	{ name: 'thumb', width: 150, height: 150 },
	{ name: 'small', width: 300, height: 300 },
	{ name: 'medium', width: 600, height: 600 },
	{ name: 'large', width: 1200, height: 1200 }
];

export interface MediaSettings {
	watermark_text: string;
	watermark_enabled: boolean;
	watermark_opacity: number;
	watermark_position: string;
	image_quality: number;
	image_format: 'webp' | 'jpeg';
}

export interface ProcessedImage {
	buffer: Buffer;
	width: number;
	height: number;
	format: string;
}

export interface ThumbnailResult {
	size_name: string;
	width: number;
	height: number;
	stored_filename: string;
	buffer: Buffer;
}

/**
 * Get media settings from database
 */
export async function getMediaSettings(): Promise<MediaSettings> {
	const result: MediaSettings = { ...DEFAULT_SETTINGS } as MediaSettings;

	try {
		const rows = await db
			.select()
			.from(settings)
			.where(eq(settings.group, 'media'));

		for (const row of rows) {
			const key = row.key as keyof MediaSettings;
			if (key in result) {
				if (key === 'watermark_enabled') {
					result[key] = row.value === 'true';
				} else if (key === 'watermark_opacity' || key === 'image_quality') {
					result[key] = parseFloat(row.value || '0');
				} else {
					(result as any)[key] = row.value;
				}
			}
		}
	} catch (err) {
		console.warn('Could not load media settings, using defaults:', err);
	}

	return result;
}

/**
 * Save media settings to database
 */
export async function saveMediaSettings(newSettings: Partial<MediaSettings>): Promise<void> {
	for (const [key, value] of Object.entries(newSettings)) {
		const stringValue = String(value);

		// Try to update existing setting
		const existing = await db
			.select()
			.from(settings)
			.where(eq(settings.key, key))
			.limit(1);

		if (existing.length > 0) {
			await db
				.update(settings)
				.set({ value: stringValue })
				.where(eq(settings.key, key));
		} else {
			await db.insert(settings).values({
				key,
				value: stringValue,
				type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string',
				group: 'media'
			});
		}
	}
}

/**
 * Create SVG watermark with text
 */
function createWatermarkSvg(
	text: string,
	imageWidth: number,
	imageHeight: number,
	opacity: number
): Buffer {
	// Calculate font size: 3-5% of image width, min 16px, max 48px
	const fontSize = Math.max(16, Math.min(48, Math.floor(imageWidth * 0.035)));
	const padding = 20;

	// Estimate text width (rough approximation)
	const textWidth = text.length * fontSize * 0.6;
	const textHeight = fontSize * 1.2;

	// Position: bottom-right with padding
	const x = imageWidth - textWidth - padding;
	const y = imageHeight - padding;

	const svg = `
		<svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
					<feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.7)"/>
				</filter>
				<style>
					@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&amp;display=swap');
				</style>
			</defs>
			<text
				x="${x}"
				y="${y}"
				font-family="'Playfair Display', Georgia, serif"
				font-size="${fontSize}"
				font-weight="600"
				fill="rgba(255,255,255,${opacity})"
				filter="url(#shadow)"
			>${text}</text>
		</svg>
	`;

	return Buffer.from(svg);
}

/**
 * Create simple text watermark without external fonts
 * (More reliable - doesn't depend on Google Fonts)
 * Enhanced for better visibility with stroke and shadow
 */
function createSimpleWatermarkSvg(
	text: string,
	imageWidth: number,
	imageHeight: number,
	opacity: number
): Buffer {
	// Calculate font size: 3-5% of image width, min 20px, max 56px (increased from 16/48)
	const fontSize = Math.max(20, Math.min(56, Math.floor(imageWidth * 0.04)));
	const padding = 25;
	const strokeWidth = Math.max(1, Math.floor(fontSize / 20));

	// Estimate text width
	const textWidth = text.length * fontSize * 0.55;

	// Position: bottom-right with padding
	const x = imageWidth - textWidth - padding;
	const y = imageHeight - padding;

	const svg = `
		<svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
					<feOffset dx="2" dy="2"/>
					<feComponentTransfer>
						<feFuncA type="linear" slope="0.7"/>
					</feComponentTransfer>
					<feMerge>
						<feMergeNode/>
						<feMergeNode in="SourceGraphic"/>
					</feMerge>
				</filter>
			</defs>
			<!-- Dark outline for contrast on light backgrounds -->
			<text
				x="${x}"
				y="${y}"
				font-family="Georgia, 'Times New Roman', serif"
				font-size="${fontSize}"
				font-weight="700"
				fill="none"
				stroke="rgba(0,0,0,${opacity * 0.6})"
				stroke-width="${strokeWidth * 2}"
				text-anchor="start"
			>${escapeXml(text)}</text>
			<!-- Main white text with shadow -->
			<text
				x="${x}"
				y="${y}"
				font-family="Georgia, 'Times New Roman', serif"
				font-size="${fontSize}"
				font-weight="700"
				fill="rgba(255,255,255,${opacity})"
				stroke="rgba(255,255,255,${opacity * 0.3})"
				stroke-width="${strokeWidth}"
				filter="url(#shadow)"
				text-anchor="start"
			>${escapeXml(text)}</text>
		</svg>
	`;

	return Buffer.from(svg);
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Process image: convert to WebP and add watermark
 */
export async function processImage(
	buffer: Buffer,
	mediaSettings: MediaSettings
): Promise<ProcessedImage> {
	let pipeline = sharp(buffer);

	// Get image metadata
	const metadata = await pipeline.metadata();
	const width = metadata.width || 800;
	const height = metadata.height || 600;

	// Add watermark if enabled
	if (mediaSettings.watermark_enabled && mediaSettings.watermark_text) {
		const watermarkSvg = createSimpleWatermarkSvg(
			mediaSettings.watermark_text,
			width,
			height,
			mediaSettings.watermark_opacity
		);

		pipeline = pipeline.composite([{
			input: watermarkSvg,
			top: 0,
			left: 0
		}]);
	}

	// Convert to WebP with high quality
	const outputBuffer = await pipeline
		.webp({
			quality: mediaSettings.image_quality,
			effort: 4, // Balance between speed and compression
			smartSubsample: true
		})
		.toBuffer();

	return {
		buffer: outputBuffer,
		width,
		height,
		format: 'webp'
	};
}

/**
 * Create thumbnails with watermark
 */
export async function createThumbnails(
	buffer: Buffer,
	baseName: string,
	mediaSettings: MediaSettings
): Promise<ThumbnailResult[]> {
	const thumbnails: ThumbnailResult[] = [];

	for (const size of THUMBNAIL_SIZES) {
		try {
			let pipeline = sharp(buffer)
				.resize(size.width, size.height, {
					fit: 'inside',
					withoutEnlargement: true
				});

			// Get resized dimensions
			const resizedMeta = await sharp(buffer)
				.resize(size.width, size.height, {
					fit: 'inside',
					withoutEnlargement: true
				})
				.metadata();

			const resizedWidth = resizedMeta.width || size.width;
			const resizedHeight = resizedMeta.height || size.height;

			// Add watermark if enabled
			if (mediaSettings.watermark_enabled && mediaSettings.watermark_text) {
				const watermarkSvg = createSimpleWatermarkSvg(
					mediaSettings.watermark_text,
					resizedWidth,
					resizedHeight,
					mediaSettings.watermark_opacity
				);

				pipeline = pipeline.composite([{
					input: watermarkSvg,
					top: 0,
					left: 0
				}]);
			}

			// Convert to WebP
			const thumbBuffer = await pipeline
				.webp({
					quality: mediaSettings.image_quality,
					effort: 4,
					smartSubsample: true
				})
				.toBuffer();

			const thumbFilename = `${baseName}_${size.name}.webp`;

			thumbnails.push({
				size_name: size.name,
				width: resizedWidth,
				height: resizedHeight,
				stored_filename: thumbFilename,
				buffer: thumbBuffer
			});
		} catch (err) {
			console.error(`Failed to create ${size.name} thumbnail:`, err);
		}
	}

	return thumbnails;
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
	const metadata = await sharp(buffer).metadata();
	return {
		width: metadata.width || 0,
		height: metadata.height || 0
	};
}
