<script lang="ts">
	import { page } from '$app/stores';
	import type { LanguageCode } from '$lib/types/layout.types';
	import {
		Hero,
		FeaturedCollections,
		ExhibitionsPreview,
		AboutPreview,
		NewsGrid,
		TestimonialGrid,
		ProcessGrid
	} from '$lib/components/home';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Get current locale from page data
	const locale = $derived(($page.data.locale as LanguageCode) || 'en');

	// Homepage data from +page.ts
	const { homepage } = data;
	const { meta, sections } = homepage;

	// SEO meta tags (translated)
	const title = $derived(meta.title[locale]);
	const description = $derived(meta.description[locale]);
	const keywords = $derived(meta.keywords[locale]);

	// Current URL for canonical and og:url
	const currentUrl = $derived($page.url.href);
	const baseUrl = $derived($page.url.origin);

	// Alternate language URLs (hreflang)
	const alternateUrls = $derived({
		en: `${baseUrl}/en`,
		ru: `${baseUrl}/ru`,
		es: `${baseUrl}/es`,
		zh: `${baseUrl}/zh`
	});

	// OG Image (first hero slide, with fallback)
	const ogImage = $derived(
		sections.hero.slides.length > 0
			? `${baseUrl}${sections.hero.slides[0].image}`
			: `${baseUrl}/images/og-default.jpg`
	);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{title}</title>
	<meta name="title" content={title} />
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	<meta name="author" content="Svetlana K-LIÉE" />

	<!-- Canonical URL -->
	<link rel="canonical" href={currentUrl} />

	<!-- Alternate Language URLs (hreflang) -->
	<link rel="alternate" href={alternateUrls.en} hreflang="en" />
	<link rel="alternate" href={alternateUrls.ru} hreflang="ru" />
	<link rel="alternate" href={alternateUrls.es} hreflang="es" />
	<link rel="alternate" href={alternateUrls.zh} hreflang="zh" />
	<link rel="alternate" href={alternateUrls.en} hreflang="x-default" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:locale" content={locale === 'en' ? 'en_US' : locale === 'ru' ? 'ru_RU' : locale === 'es' ? 'es_ES' : 'zh_CN'} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={currentUrl} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={ogImage} />

	<!-- Schema.org JSON-LD for Person/Artist -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Svetlana K-LIÉE',
		jobTitle: 'Contemporary Artist',
		description: description,
		url: currentUrl,
		image: ogImage,
		sameAs: [
			'https://www.instagram.com/k_liee_art/',
			'https://www.facebook.com/kliee.art'
		],
		knowsAbout: ['Contemporary Art', 'Sculpture', 'Bronze', 'Ceramics', 'Porcelain'],
		alumniOf: {
			'@type': 'CollegeOrUniversity',
			name: 'Russian Academy of Arts'
		},
		nationality: {
			'@type': 'Country',
			name: 'Russia'
		},
		workLocation: {
			'@type': 'Place',
			name: 'England'
		}
	})}<\/script>`}
</svelte:head>

<!-- Homepage Sections -->
<Hero data={sections.hero} {locale} />
<FeaturedCollections data={sections.featuredCollections} {locale} />
<ExhibitionsPreview data={sections.exhibitions} {locale} />
<AboutPreview data={sections.about} {locale} />
<NewsGrid data={sections.news} {locale} />
<TestimonialGrid data={sections.testimonials} {locale} />
<ProcessGrid data={sections.process} {locale} />

<style>
	/* No page-level styles needed - components are self-contained */
	:global(body) {
		overflow-x: hidden; /* Prevent horizontal scroll */
	}
</style>
