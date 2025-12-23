/**
 * Script to apply shop module tables and seed initial currency rates
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', '..', 'data', 'db', 'sqlite', 'app.db');
const migrationPath = join(__dirname, '..', 'drizzle', 'migrations', '0002_sudden_ronan.sql');

console.log('Opening database:', dbPath);
const db = new Database(dbPath);

// Read migration file
const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

// Split by statement-breakpoint and execute each
const statements = migrationSql.split('--> statement-breakpoint');

for (const statement of statements) {
	const sql = statement.trim();
	if (!sql) continue;

	try {
		db.exec(sql);
		console.log('✓ Executed:', sql.substring(0, 50) + '...');
	} catch (err) {
		if (err.message.includes('already exists')) {
			console.log('⊘ Already exists:', sql.substring(0, 50) + '...');
		} else {
			console.error('✗ Error:', err.message);
		}
	}
}

// Seed initial currency rates (EUR base)
console.log('\nSeeding currency rates...');

const seedRates = [
	{ to: 'USD', rate: '1.08' },
	{ to: 'RUB', rate: '98.50' },
	{ to: 'CNY', rate: '7.85' },
	{ to: 'EUR', rate: '1.00' }
];

const insertRate = db.prepare(`
	INSERT OR REPLACE INTO currency_rates (from_currency, to_currency, rate, updated_at)
	VALUES ('EUR', ?, ?, CURRENT_TIMESTAMP)
`);

for (const { to, rate } of seedRates) {
	try {
		insertRate.run(to, rate);
		console.log(`  EUR → ${to}: ${rate}`);
	} catch (err) {
		console.error(`  Error seeding ${to}:`, err.message);
	}
}

db.close();
console.log('\nDone!');
