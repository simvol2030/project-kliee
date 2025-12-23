import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { db } from '$lib/server/db/client';
import { media, mediaThumbnails } from '$lib/server/db/schema';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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

		// Validate file size
		if (file.size > MAX_SIZE) {
			throw error(400, `File too large. Max size: ${MAX_SIZE / 1024 / 1024}MB`);
		}

		// Generate unique filename
		const ext = file.name.split('.').pop() || 'jpg';
		const storedFilename = `${uuid()}.${ext}`;
		const uploadDir = join(process.cwd(), 'static', 'uploads', folder);
		const filePath = join(uploadDir, storedFilename);

		// Create directory if not exists
		await mkdir(uploadDir, { recursive: true });

		// Save original file
		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(filePath, buffer);

		// Get image metadata
		const metadata = await sharp(buffer).metadata();

		// Create thumbnails
		const thumbnails = await createThumbnails(buffer, uploadDir, storedFilename);

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
				folder
				// uploaded_by: locals.admin?.id || null
			})
			.returning();

		// Save thumbnails to database
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
			media: {
				id: mediaRecord.id,
				filename: mediaRecord.filename,
				url: `/uploads/${folder}/${storedFilename}`,
				width: mediaRecord.width,
				height: mediaRecord.height,
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
