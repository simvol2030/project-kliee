/**
 * Seed Database Script
 *
 * Seeds all content tables from JSON data files
 *
 * Usage:
 *   npx tsx scripts/seed-database.ts
 *   npx tsx scripts/seed-database.ts --force   # Clear existing data first
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';
import { readFileSync } from 'fs';
import {
	biography,
	education,
	awards,
	series,
	artworks,
	exhibitions,
	menuItems,
	pageContent
} from '../src/lib/server/db/schema';
import { count, sql } from 'drizzle-orm';

// Parse args
const forceMode = process.argv.includes('--force');

// Paths
const DATA_DIR = join(process.cwd(), '..', 'data');
const SQLITE_PATH = join(process.cwd(), '..', 'data', 'db', 'sqlite', 'app.db');

// Read JSON file
function readJson<T>(filename: string): T {
	const path = join(DATA_DIR, filename);
	const content = readFileSync(path, 'utf-8');
	return JSON.parse(content);
}

// Initialize DB
const sqlite = new Database(SQLITE_PATH);
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite);

async function seedDatabase() {
	console.log('\n🌱 Database Seeding Script');
	console.log('━'.repeat(50));
	console.log(`📂 Data directory: ${DATA_DIR}`);
	console.log(`📂 Database path: ${SQLITE_PATH}`);
	console.log(`🔧 Force mode: ${forceMode ? 'YES (clearing existing data)' : 'NO'}`);
	console.log('━'.repeat(50));

	try {
		// Clear existing data if force mode
		if (forceMode) {
			console.log('\n🗑️  Clearing existing data...');
			await db.delete(artworks);
			await db.delete(series);
			await db.delete(exhibitions);
			await db.delete(biography);
			await db.delete(education);
			await db.delete(awards);
			await db.delete(menuItems);
			await db.delete(pageContent);
			console.log('   ✓ All content tables cleared');
		}

		// 1. Seed Series
		console.log('\n📦 Seeding series...');
		const seriesData = readJson<{ series: any[] }>('series.json');
		const [existingSeries] = await db.select({ count: count() }).from(series);

		if (existingSeries?.count === 0 || forceMode) {
			for (const s of seriesData.series) {
				await db.insert(series).values({
					id: s.id,
					slug: s.slug,
					titleEn: s.title.en,
					titleRu: s.title.ru || s.title.en,
					titleEs: s.title.es || s.title.en,
					titleZh: s.title.zh || s.title.en,
					descriptionEn: s.description?.en,
					descriptionRu: s.description?.ru,
					descriptionEs: s.description?.es,
					descriptionZh: s.description?.zh,
					coverImage: s.coverImage,
					artworkCount: s.artworkCount || 0,
					order: s.order || 0
				});
			}
			console.log(`   ✓ Inserted ${seriesData.series.length} series`);
		} else {
			console.log(`   ⏭️  Skipped (${existingSeries?.count} records exist)`);
		}

		// 2. Seed Artworks
		console.log('\n🖼️  Seeding artworks...');
		const artworksData = readJson<{ artworks: any[] }>('artworks.json');
		const [existingArtworks] = await db.select({ count: count() }).from(artworks);

		if (existingArtworks?.count === 0 || forceMode) {
			for (const a of artworksData.artworks) {
				await db.insert(artworks).values({
					id: a.id,
					titleEn: a.title.en,
					titleRu: a.title.ru || a.title.en,
					titleEs: a.title.es || a.title.en,
					titleZh: a.title.zh || a.title.en,
					seriesId: a.series || null,
					techniqueEn: a.technique?.en,
					techniqueRu: a.technique?.ru,
					techniqueEs: a.technique?.es,
					techniqueZh: a.technique?.zh,
					year: a.year,
					dimensions: a.dimensions,
					price: a.price ? parseInt(String(a.price).replace(/[£$€,]/g, '')) : null,
					currency: a.currency || (a.price ? 'GBP' : null),
					images: JSON.stringify(a.images || []),
					available: a.available !== false
				});
			}
			console.log(`   ✓ Inserted ${artworksData.artworks.length} artworks`);
		} else {
			console.log(`   ⏭️  Skipped (${existingArtworks?.count} records exist)`);
		}

		// 3. Seed Exhibitions
		console.log('\n🏛️  Seeding exhibitions...');
		const exhibitionsData = readJson<{ exhibitions: any[] }>('exhibitions.json');
		const [existingExhibitions] = await db.select({ count: count() }).from(exhibitions);

		if (existingExhibitions?.count === 0 || forceMode) {
			for (const e of exhibitionsData.exhibitions) {
				await db.insert(exhibitions).values({
					id: e.id,
					year: e.year,
					titleEn: e.title.en,
					titleRu: e.title.ru || e.title.en,
					titleEs: e.title.es || e.title.en,
					titleZh: e.title.zh || e.title.en,
					venueEn: e.venue.en,
					venueRu: e.venue.ru || e.venue.en,
					venueEs: e.venue.es || e.venue.en,
					venueZh: e.venue.zh || e.venue.en,
					locationEn: e.location.en,
					locationRu: e.location.ru || e.location.en,
					locationEs: e.location.es || e.location.en,
					locationZh: e.location.zh || e.location.en,
					type: e.type || 'solo',
					current: e.current || false,
					image: e.image,
					url: e.url
				});
			}
			console.log(`   ✓ Inserted ${exhibitionsData.exhibitions.length} exhibitions`);
		} else {
			console.log(`   ⏭️  Skipped (${existingExhibitions?.count} records exist)`);
		}

		// 4. Seed Biography
		console.log('\n📝 Seeding biography...');
		const aboutData = readJson<{ biography: any }>('about.json');
		const [existingBio] = await db.select({ count: count() }).from(biography);

		if (existingBio?.count === 0 || forceMode) {
			await db.insert(biography).values({
				contentEn: aboutData.biography.en,
				contentRu: aboutData.biography.ru,
				contentEs: aboutData.biography.es,
				contentZh: aboutData.biography.zh
			});
			console.log(`   ✓ Inserted biography`);
		} else {
			console.log(`   ⏭️  Skipped (biography exists)`);
		}

		// 5. Seed Education
		console.log('\n🎓 Seeding education...');
		const [existingEdu] = await db.select({ count: count() }).from(education);

		if (existingEdu?.count === 0 || forceMode) {
			let order = 0;
			for (const e of aboutData.education || []) {
				await db.insert(education).values({
					year: e.year,
					institutionEn: e.institution.en,
					institutionRu: e.institution.ru,
					institutionEs: e.institution.es,
					institutionZh: e.institution.zh,
					descriptionEn: e.degree?.en,
					descriptionRu: e.degree?.ru,
					descriptionEs: e.degree?.es,
					descriptionZh: e.degree?.zh,
					order: order++
				});
			}
			console.log(`   ✓ Inserted ${aboutData.education?.length || 0} education records`);
		} else {
			console.log(`   ⏭️  Skipped (${existingEdu?.count} records exist)`);
		}

		// 6. Seed Awards
		console.log('\n🏆 Seeding awards...');
		const [existingAwards] = await db.select({ count: count() }).from(awards);

		if (existingAwards?.count === 0 || forceMode) {
			let order = 0;

			// Insert awards
			for (const a of aboutData.awards || []) {
				await db.insert(awards).values({
					year: parseInt(a.year),
					titleEn: a.title.en,
					titleRu: a.title.ru,
					titleEs: a.title.es,
					titleZh: a.title.zh,
					locationEn: a.organization?.en,
					locationRu: a.organization?.ru,
					locationEs: a.organization?.es,
					locationZh: a.organization?.zh,
					type: 'award',
					order: order++
				});
			}

			// Insert residencies as type 'residency'
			for (const r of aboutData.residencies || []) {
				await db.insert(awards).values({
					year: parseInt(r.year),
					titleEn: `Residency at ${r.location.en}`,
					titleRu: `Резиденция в ${r.location.ru}`,
					titleEs: `Residencia en ${r.location.es}`,
					titleZh: `驻留于${r.location.zh}`,
					locationEn: r.location.en,
					locationRu: r.location.ru,
					locationEs: r.location.es,
					locationZh: r.location.zh,
					type: 'residency',
					order: order++
				});
			}

			const totalAwards = (aboutData.awards?.length || 0) + (aboutData.residencies?.length || 0);
			console.log(`   ✓ Inserted ${totalAwards} awards/residencies`);
		} else {
			console.log(`   ⏭️  Skipped (${existingAwards?.count} records exist)`);
		}

		// 7. Seed Menu Items
		console.log('\n📋 Seeding menu items...');
		const menuData = readJson<{ items: any[] }>('menu.json');
		const [existingMenu] = await db.select({ count: count() }).from(menuItems);

		if (existingMenu?.count === 0 || forceMode) {
			for (const m of menuData.items || []) {
				await db.insert(menuItems).values({
					labelEn: m.label.en,
					labelRu: m.label.ru,
					labelEs: m.label.es,
					labelZh: m.label.zh,
					href: m.href,
					order: m.order || 0,
					isExternal: m.external || false
				});
			}
			console.log(`   ✓ Inserted ${menuData.items?.length || 0} menu items`);
		} else {
			console.log(`   ⏭️  Skipped (${existingMenu?.count} records exist)`);
		}

		// Summary
		console.log('\n━'.repeat(50));
		console.log('✅ Database seeding complete!');

		// Show counts
		const counts = {
			series: (await db.select({ count: count() }).from(series))[0]?.count || 0,
			artworks: (await db.select({ count: count() }).from(artworks))[0]?.count || 0,
			exhibitions: (await db.select({ count: count() }).from(exhibitions))[0]?.count || 0,
			biography: (await db.select({ count: count() }).from(biography))[0]?.count || 0,
			education: (await db.select({ count: count() }).from(education))[0]?.count || 0,
			awards: (await db.select({ count: count() }).from(awards))[0]?.count || 0,
			menuItems: (await db.select({ count: count() }).from(menuItems))[0]?.count || 0
		};

		console.log('\n📊 Database Summary:');
		console.log(`   Series:      ${counts.series}`);
		console.log(`   Artworks:    ${counts.artworks}`);
		console.log(`   Exhibitions: ${counts.exhibitions}`);
		console.log(`   Biography:   ${counts.biography}`);
		console.log(`   Education:   ${counts.education}`);
		console.log(`   Awards:      ${counts.awards}`);
		console.log(`   Menu Items:  ${counts.menuItems}`);
		console.log('━'.repeat(50));
	} catch (error) {
		console.error('\n❌ Error seeding database:', error);
		process.exit(1);
	} finally {
		sqlite.close();
	}
}

seedDatabase();
