/**
 * Image Cropping API Endpoint
 *
 * Processes image cropping using sharp library.
 * Supports cropping, resizing, and format conversion.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { db } from '$lib/server/db/client';
import { media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

interface CropRequest {
	mediaId: number;
	crop: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	resize?: {
		width?: number;
		height?: number;
		fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
	};
	format?: 'jpeg' | 'png' | 'webp';
	quality?: number;
	replaceOriginal?: boolean;
}

const UPLOADS_DIR = path.join(process.cwd(), 'static', 'uploads');

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data: CropRequest = await request.json();
		const { mediaId, crop, resize, format, quality = 85, replaceOriginal = false } = data;

		// Validate crop dimensions
		if (!crop || crop.width <= 0 || crop.height <= 0) {
			throw error(400, 'Invalid crop dimensions');
		}

		// Get media record
		const [mediaRecord] = await db.select().from(media).where(eq(media.id, mediaId));

		if (!mediaRecord) {
			throw error(404, 'Media not found');
		}

		// Construct file path
		const folder = mediaRecord.folder || 'general';
		const storedFilename = mediaRecord.stored_filename;
		const inputPath = path.join(UPLOADS_DIR, folder, storedFilename);

		if (!existsSync(inputPath)) {
			throw error(404, 'File not found on disk');
		}

		// Read and process image
		const imageBuffer = await readFile(inputPath);
		let pipeline = sharp(imageBuffer);

		// Apply crop
		pipeline = pipeline.extract({
			left: Math.round(crop.x),
			top: Math.round(crop.y),
			width: Math.round(crop.width),
			height: Math.round(crop.height)
		});

		// Apply resize if specified
		if (resize) {
			pipeline = pipeline.resize({
				width: resize.width,
				height: resize.height,
				fit: resize.fit || 'inside',
				withoutEnlargement: true
			});
		}

		// Apply format conversion
		const outputFormat = format || getFormatFromFilename(storedFilename);
		switch (outputFormat) {
			case 'jpeg':
				pipeline = pipeline.jpeg({ quality });
				break;
			case 'png':
				pipeline = pipeline.png({ quality });
				break;
			case 'webp':
				pipeline = pipeline.webp({ quality });
				break;
		}

		// Get processed buffer
		const outputBuffer = await pipeline.toBuffer();
		const metadata = await sharp(outputBuffer).metadata();

		// Generate output filename
		let outputFilename: string;
		let outputPath: string;
		let newMediaId = mediaId;

		if (replaceOriginal) {
			// Replace original file
			outputFilename = storedFilename;
			outputPath = inputPath;
		} else {
			// Create new file with cropped suffix
			const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
			const baseName = path.basename(storedFilename, path.extname(storedFilename));
			outputFilename = `${baseName}_cropped_${uuid().slice(0, 8)}.${ext}`;
			outputPath = path.join(UPLOADS_DIR, folder, outputFilename);

			// Ensure directory exists
			const outputDir = path.dirname(outputPath);
			if (!existsSync(outputDir)) {
				await mkdir(outputDir, { recursive: true });
			}
		}

		// Write output file
		await writeFile(outputPath, outputBuffer);

		// Update or create media record
		if (replaceOriginal) {
			// Update existing record
			await db
				.update(media)
				.set({
					width: metadata.width,
					height: metadata.height,
					size: outputBuffer.length
				})
				.where(eq(media.id, mediaId));
		} else {
			// Create new media record
			const originalFilename = mediaRecord.filename.replace(
				path.extname(mediaRecord.filename),
				`_cropped.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`
			);

			const result = await db
				.insert(media)
				.values({
					filename: originalFilename,
					stored_filename: outputFilename,
					mime_type: `image/${outputFormat}`,
					size: outputBuffer.length,
					width: metadata.width,
					height: metadata.height,
					folder,
					alt_en: mediaRecord.alt_en ? `${mediaRecord.alt_en} (cropped)` : null,
					alt_ru: mediaRecord.alt_ru,
					alt_es: mediaRecord.alt_es,
					alt_zh: mediaRecord.alt_zh
				})
				.returning({ id: media.id });

			newMediaId = result[0].id;
		}

		// Get updated media record
		const [updatedMedia] = await db.select().from(media).where(eq(media.id, newMediaId));

		return json({
			success: true,
			media: {
				...updatedMedia,
				url: `/uploads/${folder}/${updatedMedia.stored_filename}`
			},
			message: replaceOriginal ? 'Image cropped and replaced' : 'Cropped image saved'
		});
	} catch (err) {
		console.error('[Crop API] Error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to process image');
	}
};

function getFormatFromFilename(filename: string): 'jpeg' | 'png' | 'webp' {
	const ext = path.extname(filename).toLowerCase();
	switch (ext) {
		case '.png':
			return 'png';
		case '.webp':
			return 'webp';
		default:
			return 'jpeg';
	}
}
