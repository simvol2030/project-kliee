<script lang="ts">
	import { page } from '$app/stores';
	import type { LanguageCode } from '$lib/types/layout.types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as LanguageCode) || 'en');
	const { pastExhibitions, artFairs, currentExhibitions, seo } = data;

	// Current URL for canonical
	const currentUrl = $derived($page.url.href);
	const baseUrl = $derived($page.url.origin);

	// Alternate language URLs
	const alternateUrls = $derived({
		en: `${baseUrl}/en/exhibitions`,
		ru: `${baseUrl}/ru/exhibitions`,
		es: `${baseUrl}/es/exhibitions`,
		zh: `${baseUrl}/zh/exhibitions`
	});

	// Page titles
	const titles = {
		en: 'Exhibitions',
		ru: 'Выставки',
		es: 'Exposiciones',
		zh: '展览'
	};

	const currentLabel = {
		en: 'Current',
		ru: 'Текущие',
		es: 'Actuales',
		zh: '当前'
	};

	const pastLabel = {
		en: 'Past Exhibitions',
		ru: 'Прошедшие выставки',
		es: 'Exposiciones pasadas',
		zh: '往期展览'
	};

	const artFairsLabel = {
		en: 'Art Fairs',
		ru: 'Арт-ярмарки',
		es: 'Ferias de arte',
		zh: '艺术博览会'
	};

	// Helper function to format location
	function formatLocation(city: string | null, country: string | null): string {
		if (city && country) return `${city}, ${country}`;
		return city || country || '';
	}
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={currentUrl} />
	<link rel="alternate" href={alternateUrls.en} hreflang="en" />
	<link rel="alternate" href={alternateUrls.ru} hreflang="ru" />
	<link rel="alternate" href={alternateUrls.es} hreflang="es" />
	<link rel="alternate" href={alternateUrls.zh} hreflang="zh" />
	<link rel="alternate" href={alternateUrls.en} hreflang="x-default" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
</svelte:head>

<main class="exhibitions-page">
	<!-- Hero Section -->
	<section class="exhibitions-hero">
		<div class="container">
			<h1>{titles[locale]}</h1>
		</div>
	</section>

	<!-- Current Exhibitions -->
	{#if currentExhibitions.length > 0}
		<section class="current-exhibitions">
			<div class="container">
				<h2>
					<span class="badge">{currentLabel[locale]}</span>
				</h2>
				<div class="exhibitions-grid featured">
					{#each currentExhibitions as exhibition}
						<a href="/{locale}/exhibitions/{exhibition.slug}" class="exhibition-link">
							<article class="exhibition-card featured">
								{#if exhibition.coverImage}
									<div class="exhibition-image">
										<img src={exhibition.coverImage} alt={exhibition.title} loading="eager" />
									</div>
								{/if}
								<div class="exhibition-info">
									<span class="year">{exhibition.year}</span>
									<h3>{exhibition.title}</h3>
									<p class="venue">{exhibition.venue}</p>
									<p class="location">{formatLocation(exhibition.city, exhibition.country)}</p>
									<span class="type-badge">{exhibition.type}</span>
								</div>
							</article>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Past Exhibitions -->
	<section class="past-exhibitions">
		<div class="container">
			<h2>{pastLabel[locale]}</h2>
			<div class="exhibitions-grid">
				{#each pastExhibitions as exhibition}
					<a href="/{locale}/exhibitions/{exhibition.slug}" class="exhibition-link">
						<article class="exhibition-card">
							{#if exhibition.coverImage}
								<div class="exhibition-image">
									<img src={exhibition.coverImage} alt={exhibition.title} loading="lazy" />
								</div>
							{:else}
								<div class="exhibition-image placeholder">
									<span class="placeholder-text">{exhibition.year}</span>
								</div>
							{/if}
							<div class="exhibition-info">
								<span class="year">{exhibition.year}</span>
								<h3>{exhibition.title}</h3>
								<p class="venue">{exhibition.venue}</p>
								<p class="location">{formatLocation(exhibition.city, exhibition.country)}</p>
								<span class="type-badge">{exhibition.type}</span>
							</div>
						</article>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- Art Fairs -->
	<section class="art-fairs">
		<div class="container">
			<h2>{artFairsLabel[locale]}</h2>
			<div class="fairs-grid">
				{#each artFairs as fair}
					<a href="/{locale}/exhibitions/{fair.slug}" class="exhibition-link">
						<article class="fair-card">
							{#if fair.coverImage}
								<div class="fair-image">
									<img src={fair.coverImage} alt={fair.title} loading="lazy" />
								</div>
							{/if}
							<div class="fair-info">
								<span class="year">{fair.year}</span>
								<h3>{fair.title}</h3>
								<p class="location">{formatLocation(fair.city, fair.country)}</p>
								{#if fair.venue}
									<p class="gallery">{fair.venue}</p>
								{/if}
							</div>
						</article>
					</a>
				{/each}
			</div>
		</div>
	</section>
</main>

<style>
	.exhibitions-page {
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg, 2rem);
	}

	/* Links */
	.exhibition-link {
		text-decoration: none;
		color: inherit;
		display: block;
	}

	.exhibition-link:hover .exhibition-card,
	.exhibition-link:hover .fair-card {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	}

	.exhibition-link:hover .exhibition-image img {
		transform: scale(1.05);
	}

	/* Hero */
	.exhibitions-hero {
		padding: var(--spacing-3xl, 6rem) 0;
		background: var(--bg-secondary, #f5f5f5);
		text-align: center;
	}

	.exhibitions-hero h1 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-4xl, 3rem);
		color: var(--text-primary, #1a1a1a);
	}

	/* Sections */
	section {
		padding: var(--spacing-3xl, 6rem) 0;
	}

	section h2 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-2xl, 2rem);
		margin-bottom: var(--spacing-xl, 3rem);
		color: var(--text-primary, #1a1a1a);
	}

	/* Current Exhibitions */
	.current-exhibitions {
		background: var(--bg-primary, #fff);
	}

	.badge {
		display: inline-block;
		padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
		background: var(--color-accent, #d4af37);
		color: #fff;
		font-size: var(--text-xs, 0.75rem);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		border-radius: var(--radius-sm, 0.25rem);
		margin-left: var(--spacing-sm, 0.5rem);
	}

	/* Exhibitions Grid */
	.exhibitions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-xl, 2rem);
	}

	.exhibitions-grid.featured {
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		gap: var(--spacing-xl, 3rem);
	}

	/* Exhibition Cards */
	.exhibition-card {
		background: var(--bg-secondary, #f5f5f5);
		border-radius: var(--radius-lg, 1rem);
		overflow: hidden;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.exhibition-card.featured {
		background: var(--bg-secondary, #f5f5f5);
	}

	.exhibition-image {
		aspect-ratio: 16/9;
		overflow: hidden;
		background: var(--bg-tertiary, #e5e5e5);
	}

	.exhibition-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.exhibition-image.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--bg-tertiary, #e5e5e5), var(--bg-secondary, #f5f5f5));
	}

	.placeholder-text {
		font-size: var(--text-3xl, 2rem);
		font-weight: 300;
		color: var(--text-secondary, #666);
		opacity: 0.5;
	}

	.exhibition-info {
		padding: var(--spacing-lg, 1.5rem);
	}

	.exhibition-info .year {
		display: block;
		font-weight: 600;
		color: var(--color-accent, #d4af37);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}

	.exhibition-info h3 {
		font-size: var(--text-lg, 1.25rem);
		margin-bottom: var(--spacing-sm, 0.5rem);
		color: var(--text-primary, #1a1a1a);
		line-height: 1.3;
	}

	.exhibition-card.featured .exhibition-info h3 {
		font-size: var(--text-xl, 1.5rem);
	}

	.venue {
		font-weight: 500;
		color: var(--text-secondary, #333);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}

	.location {
		color: var(--text-secondary, #666);
		font-size: var(--text-sm, 0.875rem);
		margin-bottom: var(--spacing-sm, 0.5rem);
	}

	.type-badge {
		display: inline-block;
		padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
		background: var(--bg-tertiary, #e5e5e5);
		color: var(--text-secondary, #666);
		font-size: var(--text-xs, 0.75rem);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: var(--radius-sm, 0.25rem);
	}

	/* Past Exhibitions */
	.past-exhibitions {
		background: var(--bg-secondary, #f5f5f5);
	}

	/* Art Fairs */
	.art-fairs {
		background: var(--bg-primary, #fff);
	}

	.fairs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-lg, 2rem);
	}

	.fair-card {
		background: var(--bg-secondary, #f5f5f5);
		border-radius: var(--radius-md, 0.5rem);
		overflow: hidden;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.fair-image {
		aspect-ratio: 16/9;
		overflow: hidden;
	}

	.fair-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.fair-info {
		padding: var(--spacing-lg, 1.5rem);
	}

	.fair-info .year,
	.fair-card .year {
		display: block;
		font-weight: 600;
		color: var(--color-accent, #d4af37);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}

	.fair-info h3,
	.fair-card h3 {
		font-size: var(--text-lg, 1.125rem);
		margin-bottom: var(--spacing-sm, 0.5rem);
		color: var(--text-primary, #1a1a1a);
	}

	.fair-info .location,
	.fair-card .location {
		color: var(--text-secondary, #666);
		font-size: var(--text-sm, 0.875rem);
	}

	.fair-info .gallery,
	.fair-card .gallery {
		font-size: var(--text-sm, 0.875rem);
		color: var(--text-secondary, #666);
		font-style: italic;
		margin-top: var(--spacing-xs, 0.25rem);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.exhibitions-hero h1 {
			font-size: var(--text-3xl, 2.25rem);
		}

		.exhibitions-grid,
		.exhibitions-grid.featured {
			grid-template-columns: 1fr;
		}

		.fairs-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Dark mode */
	:global(.dark) .exhibitions-hero,
	:global(.dark) .past-exhibitions {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global(.dark) .exhibition-card,
	:global(.dark) .fair-card {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global(.dark) .exhibition-image.placeholder {
		background: linear-gradient(135deg, var(--bg-tertiary, #2c2c2e), var(--bg-secondary, #1c1c1e));
	}

	:global(.dark) .type-badge {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global(.dark) .exhibition-link:hover .exhibition-card,
	:global(.dark) .exhibition-link:hover .fair-card {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}
</style>
