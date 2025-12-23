import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { footerBrand, footerSocialLinks, footerContact } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

// GET all footer data
export const GET: RequestHandler = async () => {
	try {
		const [brand] = await db.select().from(footerBrand).limit(1);
		const socialLinks = await db.select().from(footerSocialLinks).orderBy(asc(footerSocialLinks.order_index));
		const [contact] = await db.select().from(footerContact).limit(1);

		return json({
			brand: brand || null,
			socialLinks,
			contact: contact || null
		});
	} catch (err) {
		console.error('Error fetching footer:', err);
		return json({ brand: null, socialLinks: [], contact: null, error: 'Failed to fetch footer' }, { status: 500 });
	}
};

// POST/PATCH - Update brand info
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { section } = body;

		if (section === 'brand') {
			const { title, subtitle_en, subtitle_ru, subtitle_es, subtitle_zh, quote_en, quote_ru, quote_es, quote_zh } = body;

			// Check if brand exists
			const [existing] = await db.select().from(footerBrand).limit(1);

			if (existing) {
				const [updated] = await db
					.update(footerBrand)
					.set({
						title: title ?? existing.title,
						subtitle_en: subtitle_en ?? existing.subtitle_en,
						subtitle_ru: subtitle_ru ?? existing.subtitle_ru,
						subtitle_es: subtitle_es ?? existing.subtitle_es,
						subtitle_zh: subtitle_zh ?? existing.subtitle_zh,
						quote_en: quote_en ?? existing.quote_en,
						quote_ru: quote_ru ?? existing.quote_ru,
						quote_es: quote_es ?? existing.quote_es,
						quote_zh: quote_zh ?? existing.quote_zh
					})
					.where(eq(footerBrand.id, existing.id))
					.returning();
				return json({ success: true, brand: updated });
			} else {
				const [newBrand] = await db
					.insert(footerBrand)
					.values({
						title: title || 'K-LIEE',
						subtitle_en,
						subtitle_ru,
						subtitle_es,
						subtitle_zh,
						quote_en,
						quote_ru,
						quote_es,
						quote_zh
					})
					.returning();
				return json({ success: true, brand: newBrand });
			}
		}

		if (section === 'contact') {
			const { title_en, title_ru, title_es, title_zh, email, phone } = body;

			const [existing] = await db.select().from(footerContact).limit(1);

			if (existing) {
				const [updated] = await db
					.update(footerContact)
					.set({
						title_en: title_en ?? existing.title_en,
						title_ru: title_ru ?? existing.title_ru,
						title_es: title_es ?? existing.title_es,
						title_zh: title_zh ?? existing.title_zh,
						email: email ?? existing.email,
						phone: phone ?? existing.phone
					})
					.where(eq(footerContact.id, existing.id))
					.returning();
				return json({ success: true, contact: updated });
			} else {
				const [newContact] = await db
					.insert(footerContact)
					.values({ title_en, title_ru, title_es, title_zh, email, phone })
					.returning();
				return json({ success: true, contact: newContact });
			}
		}

		if (section === 'social') {
			const { platform, label, badge, url, icon, order_index, is_visible } = body;

			if (!platform || !url || !icon) {
				throw error(400, 'platform, url, and icon are required');
			}

			const [newLink] = await db
				.insert(footerSocialLinks)
				.values({
					platform,
					label: label || platform,
					badge,
					url,
					icon,
					order_index: order_index || 0,
					is_visible: is_visible !== false
				})
				.returning();
			return json({ success: true, socialLink: newLink });
		}

		throw error(400, 'Invalid section');
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Error updating footer:', err);
		throw error(500, 'Failed to update footer');
	}
};
