/**
 * Script to add slug column to artworks and populate existing rows
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', '..', 'data', 'db', 'sqlite', 'app.db');

function generateSlug(text) {
	return text
		.toLowerCase()
		.trim()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function makeSlugUnique(baseSlug, existingSlugs) {
	if (!existingSlugs.has(baseSlug)) {
		return baseSlug;
	}

	let counter = 2;
	let newSlug = `${baseSlug}-${counter}`;

	while (existingSlugs.has(newSlug)) {
		counter++;
		newSlug = `${baseSlug}-${counter}`;
	}

	return newSlug;
}

console.log('Opening database:', dbPath);
const db = new Database(dbPath);

// Check if slug column exists
const tableInfo = db.prepare("PRAGMA table_info(artworks)").all();
const hasSlug = tableInfo.some(col => col.name === 'slug');

if (!hasSlug) {
	console.log('Adding slug column to artworks table...');
	db.exec('ALTER TABLE artworks ADD COLUMN slug TEXT');
	db.exec('CREATE UNIQUE INDEX IF NOT EXISTS artworks_slug_unique ON artworks (slug)');
	console.log('Column added successfully');
} else {
	console.log('Slug column already exists');
}

// Get all artworks without slugs
const artworksWithoutSlug = db.prepare(`
	SELECT id, title_en FROM artworks WHERE slug IS NULL OR slug = ''
`).all();

console.log(`Found ${artworksWithoutSlug.length} artworks without slug`);

if (artworksWithoutSlug.length > 0) {
	// Get existing slugs
	const existingSlugsRows = db.prepare(`SELECT slug FROM artworks WHERE slug IS NOT NULL AND slug != ''`).all();
	const existingSlugs = new Set(existingSlugsRows.map(r => r.slug));

	const updateStmt = db.prepare('UPDATE artworks SET slug = ? WHERE id = ?');

	for (const artwork of artworksWithoutSlug) {
		const baseSlug = generateSlug(artwork.title_en || `artwork-${artwork.id}`);
		const uniqueSlug = makeSlugUnique(baseSlug, existingSlugs);

		updateStmt.run(uniqueSlug, artwork.id);
		existingSlugs.add(uniqueSlug);

		console.log(`  ${artwork.id}: ${artwork.title_en} -> ${uniqueSlug}`);
	}

	console.log('All slugs populated');
}

db.close();
console.log('Done!');
