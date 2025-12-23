/**
 * Seed Admin User Script
 *
 * Creates a new admin user with custom credentials
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts                              # Interactive mode (uses defaults)
 *   npx tsx scripts/seed-admin.ts --email admin@kliee.com     # Custom email
 *   npx tsx scripts/seed-admin.ts --password MyP@ssword123    # Custom password
 *   npx tsx scripts/seed-admin.ts --name "Svetlana K-LIÉE"    # Custom name
 *   npx tsx scripts/seed-admin.ts --role super-admin          # Role (super-admin|editor|viewer)
 */

import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';
import { admins } from '../src/lib/server/db/schema';
import { eq, count } from 'drizzle-orm';

// Parse command line arguments
function parseArgs(): {
	email: string;
	password: string;
	name: string;
	role: 'super-admin' | 'editor' | 'viewer';
} {
	const args = process.argv.slice(2);
	const result = {
		email: 'admin@kliee.com',
		password: 'Admin123!@#$',
		name: 'Svetlana K-LIÉE',
		role: 'super-admin' as const
	};

	for (let i = 0; i < args.length; i += 2) {
		const key = args[i]?.replace('--', '');
		const value = args[i + 1];

		if (key === 'email' && value) result.email = value;
		if (key === 'password' && value) result.password = value;
		if (key === 'name' && value) result.name = value;
		if (key === 'role' && value) {
			if (['super-admin', 'editor', 'viewer'].includes(value)) {
				result.role = value as typeof result.role;
			}
		}
	}

	return result;
}

async function seedAdmin() {
	const config = parseArgs();

	console.log('\n🔧 Admin Seeding Script');
	console.log('━'.repeat(50));

	// Initialize database
	const SQLITE_PATH = join(process.cwd(), '..', 'data', 'db', 'sqlite', 'app.db');
	console.log(`📂 Database path: ${SQLITE_PATH}`);

	const sqlite = new Database(SQLITE_PATH);
	sqlite.pragma('journal_mode = WAL');
	const db = drizzle(sqlite);

	try {
		// Check if admin with this email already exists
		const existing = await db
			.select({ count: count() })
			.from(admins)
			.where(eq(admins.email, config.email));

		if (existing[0]?.count && existing[0].count > 0) {
			console.log(`\n⚠️  Admin with email "${config.email}" already exists!`);
			console.log('   Use a different email or delete the existing admin first.');
			process.exit(1);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(config.password, 10);

		// Insert admin
		await db.insert(admins).values({
			email: config.email,
			password: hashedPassword,
			role: config.role,
			name: config.name
		});

		console.log('\n✅ Admin user created successfully!');
		console.log('━'.repeat(50));
		console.log(`   Email:    ${config.email}`);
		console.log(`   Password: ${config.password}`);
		console.log(`   Name:     ${config.name}`);
		console.log(`   Role:     ${config.role}`);
		console.log('━'.repeat(50));
		console.log('\n🔐 You can now login at /login');
	} catch (error) {
		console.error('\n❌ Error creating admin:', error);
		process.exit(1);
	} finally {
		sqlite.close();
	}
}

seedAdmin();
