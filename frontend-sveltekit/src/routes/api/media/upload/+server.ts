import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { db } from '$lib/server/db/client';
import { media, mediaThumbnails } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos

const THUMBNAIL_SIZES = [
	{ name: 'thumb', width: 150, height: 150 },
	{ name: 'small', width: 300, height: 300 },
	{ name: 'medium', width: 600, height: 600 },
	{ name: 'large', width: 1200, height: 1200 }
];

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authorization (simplified - should check session)
	// if (!locals.admin) {
	// 	throw error(401, 'Unauthorized');
	// }

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const folder = (formData.get('folder') as string) || 'uploads';

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
		const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
		const storedFilename = `${uuid()}.${ext}`;
		const uploadDir = join(process.cwd(), 'static', 'uploads', folder);
		const filePath = join(uploadDir, storedFilename);

		// Create directory if not exists
		await mkdir(uploadDir, { recursive: true });

		// Save original file
		await writeFile(filePath, buffer);

		let metadata: { width?: number; height?: number } = {};
		let thumbnails: Array<{ size_name: string; width: number; height: number; stored_filename: string }> = [];

		// Only process images with sharp (not videos)
		if (!isVideo) {
			// Get image metadata
			metadata = await sharp(buffer).metadata();

			// Create thumbnails
			thumbnails = await createThumbnails(buffer, uploadDir, storedFilename);
		}

		// Save to database
		const [mediaRecord] = await db
			.insert(media)
			.values({
				filename: file.name,
				stored_filename: storedFilename,
				mime_type: file.type,
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
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to upload file');
	}
};

async function createThumbnails(
	buffer: Buffer,
	dir: string,
	filename: string
): Promise<Array<{ size_name: string; width: number; height: number; stored_filename: string }>> {
	const thumbnails = [];
	const baseName = filename.replace(/\.[^.]+$/, '');

	for (const size of THUMBNAIL_SIZES) {
		const thumbFilename = `${baseName}_${size.name}.webp`;
		const thumbPath = join(dir, thumbFilename);

		try {
			await sharp(buffer)
				.resize(size.width, size.height, {
					fit: 'inside',
					withoutEnlargement: true
				})
				.webp({ quality: 80 })
				.toFile(thumbPath);

			const meta = await sharp(thumbPath).metadata();

			thumbnails.push({
				size_name: size.name,
				width: meta.width || size.width,
				height: meta.height || size.height,
				stored_filename: thumbFilename
			});
		} catch (err) {
			console.error(`Failed to create ${size.name} thumbnail:`, err);
		}
	}

	return thumbnails;
}
