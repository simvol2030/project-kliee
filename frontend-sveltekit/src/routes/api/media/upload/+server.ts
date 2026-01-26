import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { v4 as uuid } from 'uuid';
import { db } from '$lib/server/db/client';
import { media, mediaThumbnails } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
	processImage,
	createThumbnails,
	getMediaSettings,
	getImageDimensions
} from '$lib/server/image-processor';

// Use environment variable for upload path, with fallback
const STATIC_IMAGES_PATH = process.env.STATIC_IMAGES_PATH || '/opt/websites/k-liee.com/static-images';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authorization (simplified - should check session)
	// if (!locals.admin) {
	// 	throw error(401, 'Unauthorized');
	// }

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const folder = (formData.get('folder') as string) || 'general';

		if (!file) {
			throw error(400, 'No file provided');
		}

		// Validate file type
		if (!ALLOWED_TYPES.includes(file.type)) {
			throw error(400, `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
		}

		// Determine if video or image
		const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
		const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

		// Validate file size
		if (file.size > maxSize) {
			throw error(400, `File too large. Max size: ${maxSize / 1024 / 1024}MB`);
		}

		// Get file buffer and calculate hash for duplicate detection
		const buffer = Buffer.from(await file.arrayBuffer());
		const fileHash = createHash('md5').update(buffer).digest('hex');

		// Check for duplicate by hash
		const existing = await db
			.select()
			.from(media)
			.where(eq(media.file_hash, fileHash))
			.limit(1);

		if (existing.length > 0) {
			const existingMedia = existing[0];
			// Get thumbnails for existing media
			const existingThumbnails = await db
				.select()
				.from(mediaThumbnails)
				.where(eq(mediaThumbnails.media_id, existingMedia.id));

			return json({
				success: true,
				is_duplicate: true,
				media: {
					id: existingMedia.id,
					filename: existingMedia.filename,
					url: `/uploads/${existingMedia.folder}/${existingMedia.stored_filename}`,
					width: existingMedia.width,
					height: existingMedia.height,
					mime_type: existingMedia.mime_type,
					thumbnails: existingThumbnails.map((t) => ({
						size: t.size_name,
						url: `/uploads/${existingMedia.folder}/${t.stored_filename}`
					}))
				}
			});
		}

		// Generate unique filename
		const baseName = uuid();
		const uploadDir = join(STATIC_IMAGES_PATH, 'uploads', folder);

		// Create directory if not exists
		try {
			await mkdir(uploadDir, { recursive: true });
		} catch (mkdirErr) {
			console.error('Failed to create upload directory:', uploadDir, mkdirErr);
			throw error(500, `Failed to create upload directory: ${uploadDir}`);
		}

		let storedFilename: string;
		let metadata: { width?: number; height?: number } = {};
		let thumbnails: Array<{ size_name: string; width: number; height: number; stored_filename: string }> = [];

		// Process images with Sharp (WebP + watermark)
		if (!isVideo) {
			try {
				// Get media settings from database
				const mediaSettings = await getMediaSettings();

				// Process original image (WebP + watermark) - watermark is mandatory!
				const processed = await processImage(buffer, mediaSettings);
				storedFilename = `${baseName}.webp`;
				const filePath = join(uploadDir, storedFilename);
				await writeFile(filePath, processed.buffer);

				metadata = {
					width: processed.width,
					height: processed.height
				};

				// Create thumbnails (also WebP + watermark)
				const thumbResults = await createThumbnails(buffer, baseName, mediaSettings);

				for (const thumb of thumbResults) {
					const thumbPath = join(uploadDir, thumb.stored_filename);
					await writeFile(thumbPath, thumb.buffer);

					thumbnails.push({
						size_name: thumb.size_name,
						width: thumb.width,
						height: thumb.height,
						stored_filename: thumb.stored_filename
					});
				}
			} catch (imgErr) {
				console.error('Image processing error:', imgErr);
				const errMessage = imgErr instanceof Error ? imgErr.message : 'Unknown error';
				throw error(500, `Failed to process image: ${errMessage}. Please ensure the image is valid and try again.`);
			}
		} else {
			// Video: save as-is
			const ext = file.name.split('.').pop() || 'mp4';
			storedFilename = `${baseName}.${ext}`;
			const filePath = join(uploadDir, storedFilename);
			await writeFile(filePath, buffer);
		}

		// Save to database
		const [mediaRecord] = await db
			.insert(media)
			.values({
				filename: file.name,
				stored_filename: storedFilename,
				mime_type: isVideo ? file.type : 'image/webp', // Updated mime type for processed images
				size: file.size,
				width: metadata.width || null,
				height: metadata.height || null,
				folder,
				file_hash: fileHash
				// uploaded_by: locals.admin?.id || null
			})
			.returning();

		// Save thumbnails to database (only for images)
		for (const thumb of thumbnails) {
			await db.insert(mediaThumbnails).values({
				media_id: mediaRecord.id,
				size_name: thumb.size_name,
				width: thumb.width,
				height: thumb.height,
				stored_filename: thumb.stored_filename
			});
		}

		return json({
			success: true,
			is_duplicate: false,
			media: {
				id: mediaRecord.id,
				filename: mediaRecord.filename,
				url: `/uploads/${folder}/${storedFilename}`,
				width: mediaRecord.width,
				height: mediaRecord.height,
				mime_type: mediaRecord.mime_type,
				thumbnails: thumbnails.map((t) => ({
					size: t.size_name,
					url: `/uploads/${folder}/${t.stored_filename}`
				}))
			}
		});
	} catch (err) {
		console.error('Upload error:', err);
		// Re-throw SvelteKit errors (they already have proper status/message)
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		// Wrap other errors with helpful message
		const errMessage = err instanceof Error ? err.message : 'Unknown error';
		throw error(500, `Upload failed: ${errMessage}`);
	}
};
