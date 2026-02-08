import bcrypt from 'bcrypt';
import { db } from './client';
import { users, posts, admins, settings, contactSocialLinks } from './schema';
import { count, eq } from 'drizzle-orm';

/**
 * Инициализация базы данных
 * Создаёт таблицы если их нет (выполняется автоматически Drizzle)
 */
export async function initializeDatabase() {
	console.log('✅ Database tables initialized (managed by Drizzle ORM)');
}

/**
 * Seed данных - заполнение БД тестовыми данными
 */
export async function seedDatabase() {
	try {
		// Проверяем количество пользователей
		const [userCountResult] = await db.select({ count: count() }).from(users);
		const userCount = userCountResult?.count || 0;

		if (userCount === 0) {
			// Создаём пользователей
			await db.insert(users).values([
				{ name: 'Alice Johnson', email: 'alice@example.com' },
				{ name: 'Bob Smith', email: 'bob@example.com' },
				{ name: 'Charlie Brown', email: 'charlie@example.com' }
			]);

			// Создаём посты
			await db.insert(posts).values([
				{
					user_id: 1,
					title: 'Getting Started with SvelteKit',
					content: 'SvelteKit is an amazing framework for building web applications.',
					published: true
				},
				{
					user_id: 1,
					title: 'SQLite with WAL Mode',
					content: 'Write-Ahead Logging provides better concurrency and performance.',
					published: true
				},
				{
					user_id: 2,
					title: 'Building Modern Web Apps',
					content: 'Modern web development is exciting with tools like Svelte.',
					published: true
				},
				{
					user_id: 3,
					title: 'Draft Post',
					content: 'This is a draft post, not yet published.',
					published: false
				}
			]);

			console.log('✅ Database seeded with sample data');
		}

		// Проверяем количество админов
		const [adminCountResult] = await db.select({ count: count() }).from(admins);
		const adminCount = adminCountResult?.count || 0;

		if (adminCount === 0) {
			// Создаём дефолтного супер-админа с хешированным паролем
			const hashedPassword = await bcrypt.hash('Admin123!@#$', 10);

			await db.insert(admins).values({
				email: 'admin@example.com',
				password: hashedPassword,
				role: 'super-admin',
				name: 'Super Admin'
			});

			console.log('✅ Default super-admin created (email: admin@example.com, password: Admin123!@#$)');
		}
		// Seed contact settings
		const [contactSettingExists] = await db.select({ count: count() }).from(settings).where(eq(settings.group, 'contact'));
		if (!contactSettingExists?.count) {
			await db.insert(settings).values([
				{ key: 'contact_recipient_email', value: 'info@k-liee.com', type: 'string', group: 'contact' },
				{ key: 'contact_form_enabled', value: 'true', type: 'boolean', group: 'contact' },
				{ key: 'contact_auto_reply_enabled', value: 'true', type: 'boolean', group: 'contact' }
			]);
			console.log('✅ Contact settings seeded');
		}

		// Seed contact social links
		const [contactSocialCount] = await db.select({ count: count() }).from(contactSocialLinks);
		if (!contactSocialCount?.count) {
			await db.insert(contactSocialLinks).values([
				{ platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/Official.k.liee', order_index: 0, is_visible: true },
				{ platform: 'telegram', label: 'Telegram', url: 'https://t.me/SvetlanaKliee', order_index: 1, is_visible: true },
				{ platform: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@SvetlanaKLiee', order_index: 2, is_visible: true },
				{ platform: 'pinterest', label: 'Pinterest', url: 'https://uk.pinterest.com/svetaklie/_profile/', order_index: 3, is_visible: true },
				{ platform: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@svetlanakliee_art', order_index: 4, is_visible: true },
				{ platform: 'opensea', label: 'OpenSea', url: 'https://opensea.io/collection/k-lieesculptures', order_index: 5, is_visible: true }
			]);
			console.log('✅ Contact social links seeded');
		}
	} catch (error) {
		console.error('❌ Error seeding database:', error);
	}
}

// Инициализация при импорте модуля
initializeDatabase();
seedDatabase();
