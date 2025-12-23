/**
 * Dynamic Sitemap Generator
 *
 * Generates XML sitemap with all pages in all languages
 */

import type { RequestHandler } from './$types';
import { getAllSeries } from '$lib/data/series.provider';

const SITE_URL = 'https://k-lie.com';
const LANGUAGES = ['en', 'ru', 'es', 'zh'];

interface SitemapUrl {
	loc: string;
	lastmod?: string;
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: number;
	alternates?: { lang: string; href: string }[];
}

function generateAlternates(path: string): { lang: string; href: string }[] {
	return LANGUAGES.map((lang) => ({
		lang,
		href: `${SITE_URL}/${lang}${path}`
	}));
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: RequestHandler = async () => {
	const today = new Date().toISOString().split('T')[0];

	// Static pages
	const staticPages: SitemapUrl[] = [
		{ loc: '', priority: 1.0, changefreq: 'weekly' },
		{ loc: '/about', priority: 0.8, changefreq: 'monthly' },
		{ loc: '/works', priority: 0.9, changefreq: 'weekly' },
		{ loc: '/exhibitions', priority: 0.7, changefreq: 'monthly' },
		{ loc: '/catalog', priority: 0.8, changefreq: 'weekly' },
		{ loc: '/contact', priority: 0.6, changefreq: 'yearly' },
		{ loc: '/nft', priority: 0.7, changefreq: 'monthly' }
	];

	// Dynamic series pages
	const series = getAllSeries('en');
	const seriesPages: SitemapUrl[] = series.map((s) => ({
		loc: `/works/${s.slug}`,
		priority: 0.8,
		changefreq: 'weekly' as const
	}));

	// Combine all pages
	const allPages = [...staticPages, ...seriesPages];

	// Generate URLs for all languages
	const urls: SitemapUrl[] = [];
	for (const page of allPages) {
		for (const lang of LANGUAGES) {
			urls.push({
				loc: `${SITE_URL}/${lang}${page.loc}`,
				lastmod: today,
				changefreq: page.changefreq,
				priority: page.priority,
				alternates: generateAlternates(page.loc)
			});
		}
	}

	// Generate XML
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
	.map(
		(url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
    ${
			url.alternates
				? url.alternates
						.map(
							(alt) =>
								`<xhtml:link rel="alternate" hreflang="${alt.lang}" href="${escapeXml(alt.href)}"/>`
						)
						.join('\n    ')
				: ''
		}
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600' // Cache for 1 hour
		}
	});
};
