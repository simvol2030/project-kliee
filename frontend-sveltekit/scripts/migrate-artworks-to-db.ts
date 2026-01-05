/**
 * Migration Script: Artworks JSON to Database
 *
 * Migrates artwork data from JSON files to SQLite database.
 * Handles series, artworks, media, and artworkImages tables.
 *
 * Run with: npx tsx scripts/migrate-artworks-to-db.ts
 *
 * @version 1.0
 * @date 2026-01-05
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// Database path
const DB_PATH = path.join(__dirname, '../../data/db/sqlite/app.db');

// JSON data paths
const ARTWORKS_JSON = path.join(__dirname, '../../data/artworks.json');
const SERIES_JSON = path.join(__dirname, '../../data/series.json');

interface TranslatedString {
	en: string;
	ru: string;
	es: string;
	zh: string;
}

interface JsonArtwork {
	id: string;
	title: TranslatedString;
	series: string;
	technique: TranslatedString;
	year: number | null;
	dimensions: string | null;
	price: number | null;
	currency: string | null;
	images: string[];
	available: boolean;
	note: string | null;
}

interface JsonSeries {
	id: string;
	slug: string;
	title: TranslatedString;
	description: TranslatedString;
	coverImage: string;
	artworkCount: number;
	order: number;
}

interface ArtworksData {
	version: string;
	lastUpdated: string;
	artworks: JsonArtwork[];
}

interface SeriesData {
	version: string;
	lastUpdated: string;
	series: JsonSeries[];
}

// Statistics
let stats = {
	seriesInserted: 0,
	seriesSkipped: 0,
	artworksInserted: 0,
	artworksSkipped: 0,
	mediaCreated: 0,
	imagesLinked: 0,
	errors: [] as string[]
};

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.substring(0, 100);
}

function getMimeType(filename: string): string {
	const ext = path.extname(filename).toLowerCase();
	const mimeTypes: Record<string, string> = {
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.png': 'image/png',
		'.gif': 'image/gif',
		'.webp': 'image/webp'
	};
	return mimeTypes[ext] || 'image/jpeg';
}

function main() {
	console.log('='.repeat(60));
	console.log('Artworks JSON to DB Migration Script');
	console.log('='.repeat(60));

	// Check files exist
	if (!fs.existsSync(ARTWORKS_JSON)) {
		console.error(`ERROR: Artworks JSON not found at ${ARTWORKS_JSON}`);
		process.exit(1);
	}
	if (!fs.existsSync(SERIES_JSON)) {
		console.error(`ERROR: Series JSON not found at ${SERIES_JSON}`);
		process.exit(1);
	}

	// Load JSON data
	console.log('\n[1/5] Loading JSON data...');
	const artworksData: ArtworksData = JSON.parse(fs.readFileSync(ARTWORKS_JSON, 'utf-8'));
	const seriesData: SeriesData = JSON.parse(fs.readFileSync(SERIES_JSON, 'utf-8'));

	console.log(`   - ${seriesData.series.length} series found`);
	console.log(`   - ${artworksData.artworks.length} artworks found`);

	// Open database
	console.log('\n[2/5] Connecting to database...');
	if (!fs.existsSync(DB_PATH)) {
		console.error(`ERROR: Database not found at ${DB_PATH}`);
		process.exit(1);
	}
	const db = new Database(DB_PATH);

	// Prepare statements
	const stmts = {
		// Check if series exists
		checkSeries: db.prepare('SELECT id FROM series WHERE id = ?'),

		// Insert series
		insertSeries: db.prepare(`
			INSERT INTO series (id, slug, name_en, name_ru, name_es, name_zh,
				description_en, description_ru, description_es, description_zh,
				order_index, is_visible, is_featured, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, datetime('now'), datetime('now'))
		`),

		// Check if artwork exists
		checkArtwork: db.prepare('SELECT id FROM artworks WHERE id = ?'),

		// Insert artwork
		insertArtwork: db.prepare(`
			INSERT INTO artworks (id, slug, series_id, title_en, title_ru, title_es, title_zh,
				technique, year, dimensions, price, currency, is_for_sale, is_visible,
				order_index, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'), datetime('now'))
		`),

		// Check if media exists by stored_filename
		checkMedia: db.prepare('SELECT id FROM media WHERE stored_filename = ?'),

		// Insert media record (for static images)
		insertMedia: db.prepare(`
			INSERT INTO media (filename, stored_filename, mime_type, size, folder, uploaded_at)
			VALUES (?, ?, ?, 0, ?, datetime('now'))
		`),

		// Insert artwork image link
		insertArtworkImage: db.prepare(`
			INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
			VALUES (?, ?, ?, ?)
		`),

		// Check if artwork image link exists
		checkArtworkImage: db.prepare('SELECT id FROM artwork_images WHERE artwork_id = ? AND media_id = ?'),

		// Get max order_index for artworks in series
		getMaxOrder: db.prepare('SELECT COALESCE(MAX(order_index), -1) as max_order FROM artworks WHERE series_id = ?')
	};

	// Migrate series
	console.log('\n[3/5] Migrating series...');
	for (const s of seriesData.series) {
		const existing = stmts.checkSeries.get(s.id);
		if (existing) {
			console.log(`   SKIP: Series "${s.id}" already exists`);
			stats.seriesSkipped++;
		} else {
			try {
				stmts.insertSeries.run(
					s.id,
					s.slug,
					s.title.en,
					s.title.ru,
					s.title.es,
					s.title.zh,
					s.description.en,
					s.description.ru,
					s.description.es,
					s.description.zh,
					s.order
				);
				console.log(`   OK: Series "${s.id}" inserted`);
				stats.seriesInserted++;
			} catch (err) {
				const msg = `Failed to insert series ${s.id}: ${err}`;
				console.error(`   ERROR: ${msg}`);
				stats.errors.push(msg);
			}
		}
	}

	// Build series order counters
	const seriesOrderCounters: Record<string, number> = {};
	for (const s of seriesData.series) {
		const result = stmts.getMaxOrder.get(s.id) as { max_order: number };
		seriesOrderCounters[s.id] = (result?.max_order ?? -1) + 1;
	}

	// Migrate artworks
	console.log('\n[4/5] Migrating artworks...');
	for (const a of artworksData.artworks) {
		const existing = stmts.checkArtwork.get(a.id);
		if (existing) {
			console.log(`   SKIP: Artwork "${a.id}" already exists`);
			stats.artworksSkipped++;
			continue;
		}

		try {
			// Generate slug from English title
			const slug = generateSlug(a.title.en);

			// Get order index for this series
			const orderIndex = seriesOrderCounters[a.series] || 0;
			seriesOrderCounters[a.series] = orderIndex + 1;

			// Insert artwork
			stmts.insertArtwork.run(
				a.id,
				slug,
				a.series, // series_id matches series.id
				a.title.en,
				a.title.ru,
				a.title.es,
				a.title.zh,
				a.technique.en, // Use English technique only
				a.year,
				a.dimensions,
				a.price,
				a.currency || 'EUR',
				a.available ? 1 : 0, // is_for_sale
				orderIndex
			);
			console.log(`   OK: Artwork "${a.id}" (${a.title.en}) inserted`);
			stats.artworksInserted++;

			// Process images
			for (let i = 0; i < a.images.length; i++) {
				const imagePath = a.images[i];
				// Image path is like "/images/works/chebu-rasha/photo.jpg"
				// We store it as stored_filename with full path (for static images)

				// Check if media already exists
				let mediaRow = stmts.checkMedia.get(imagePath) as { id: number } | undefined;

				if (!mediaRow) {
					// Extract filename and folder from path
					const filename = path.basename(imagePath);
					const folder = path.dirname(imagePath).replace(/^\//, ''); // Remove leading slash

					// Insert media record
					const result = stmts.insertMedia.run(
						filename,
						imagePath, // Store FULL PATH as stored_filename
						getMimeType(filename),
						folder
					);
					mediaRow = { id: result.lastInsertRowid as number };
					console.log(`      + Media created: ${imagePath} (ID: ${mediaRow.id})`);
					stats.mediaCreated++;
				}

				// Link image to artwork (if not already linked)
				const existingLink = stmts.checkArtworkImage.get(a.id, mediaRow.id);
				if (!existingLink) {
					stmts.insertArtworkImage.run(
						a.id,
						mediaRow.id,
						i === 0 ? 1 : 0, // First image is primary
						i
					);
					stats.imagesLinked++;
				}
			}
		} catch (err) {
			const msg = `Failed to insert artwork ${a.id}: ${err}`;
			console.error(`   ERROR: ${msg}`);
			stats.errors.push(msg);
		}
	}

	// Close database
	db.close();

	// Print summary
	console.log('\n[5/5] Migration complete!');
	console.log('='.repeat(60));
	console.log('SUMMARY:');
	console.log(`   Series: ${stats.seriesInserted} inserted, ${stats.seriesSkipped} skipped`);
	console.log(`   Artworks: ${stats.artworksInserted} inserted, ${stats.artworksSkipped} skipped`);
	console.log(`   Media: ${stats.mediaCreated} created`);
	console.log(`   Image links: ${stats.imagesLinked} created`);
	if (stats.errors.length > 0) {
		console.log(`   Errors: ${stats.errors.length}`);
		for (const err of stats.errors) {
			console.log(`      - ${err}`);
		}
	}
	console.log('='.repeat(60));
}

main();
