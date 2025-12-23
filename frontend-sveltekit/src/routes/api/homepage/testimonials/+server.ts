import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { homepageTestimonials, media } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET all testimonials
export const GET: RequestHandler = async () => {
	try {
		const items = await db
			.select({
				testimonial: homepageTestimonials,
				avatar: media
			})
			.from(homepageTestimonials)
			.leftJoin(media, eq(homepageTestimonials.avatar_id, media.id))
			.orderBy(asc(homepageTestimonials.order_index));

		return json({
			items: items.map((row) => ({
				...row.testimonial,
				avatar: row.avatar
					? {
							id: row.avatar.id,
							url: `/uploads/${row.avatar.folder}/${row.avatar.stored_filename}`
						}
					: null
			}))
		});
	} catch (err) {
		console.error('Error fetching testimonials:', err);
		return json({ items: [], error: 'Failed to fetch testimonials' }, { status: 500 });
	}
};

// POST create testimonial
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const {
			quote_en,
			quote_ru,
			quote_es,
			quote_zh,
			author,
			role_en,
			role_ru,
			role_es,
			role_zh,
			avatar_id,
			order_index,
			is_visible
		} = body;

		const [created] = await db
			.insert(homepageTestimonials)
			.values({
				quote_en,
				quote_ru,
				quote_es,
				quote_zh,
				author,
				role_en,
				role_ru,
				role_es,
				role_zh,
				avatar_id,
				order_index: order_index || 0,
				is_visible: is_visible !== false
			})
			.returning();

		return json({ success: true, testimonial: created });
	} catch (err) {
		console.error('Error creating testimonial:', err);
		throw error(500, 'Failed to create testimonial');
	}
};
