<script lang="ts">
	import { page } from '$app/stores';
	import type { LanguageCode } from '$lib/types/layout.types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as LanguageCode) || 'en');
	const { exhibitions, artFairs, currentExhibitions, seo } = data;

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

	// Filter past exhibitions (not current)
	const pastExhibitions = $derived(exhibitions.filter((e) => !e.current));
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
						<article class="exhibition-card featured">
							{#if exhibition.image}
								<div class="exhibition-image">
									<img src={exhibition.image} alt={exhibition.title} loading="eager" />
								</div>
							{/if}
							<div class="exhibition-info">
								<span class="year">{exhibition.year}</span>
								<h3>{exhibition.title}</h3>
								<p class="venue">{exhibition.venue}</p>
								<p class="location">{exhibition.location}</p>
								<span class="type-badge">{exhibition.type}</span>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Past Exhibitions -->
	<section class="past-exhibitions">
		<div class="container">
			<h2>{pastLabel[locale]}</h2>
			<div class="exhibitions-timeline">
				{#each pastExhibitions as exhibition}
					<article class="exhibition-item">
						<span class="year">{exhibition.year}</span>
						<div class="content">
							<h3>{exhibition.title}</h3>
							<p class="venue">{exhibition.venue}</p>
							<p class="location">{exhibition.location}</p>
							<span class="type-badge">{exhibition.type}</span>
						</div>
					</article>
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
					<article class="fair-card">
						<span class="year">{fair.year}</span>
						<h3>{fair.title}</h3>
						<p class="location">{fair.location}</p>
						{#if fair.gallery}
							<p class="gallery">{fair.gallery}</p>
						{/if}
					</article>
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

	.exhibitions-grid.featured {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		gap: var(--spacing-xl, 3rem);
	}

	.exhibition-card.featured {
		background: var(--bg-secondary, #f5f5f5);
		border-radius: var(--radius-lg, 1rem);
		overflow: hidden;
	}

	.exhibition-image {
		aspect-ratio: 16/9;
		overflow: hidden;
	}

	.exhibition-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.exhibition-info {
		padding: var(--spacing-lg, 2rem);
	}

	.exhibition-info .year {
		display: block;
		font-weight: 600;
		color: var(--color-accent, #d4af37);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}

	.exhibition-info h3 {
		font-size: var(--text-xl, 1.5rem);
		margin-bottom: var(--spacing-sm, 0.5rem);
		color: var(--text-primary, #1a1a1a);
	}

	.venue {
		font-weight: 500;
		color: var(--text-secondary, #333);
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

	/* Past Exhibitions Timeline */
	.past-exhibitions {
		background: var(--bg-secondary, #f5f5f5);
	}

	.exhibitions-timeline {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg, 2rem);
	}

	.exhibition-item {
		display: grid;
		grid-template-columns: 80px 1fr;
		gap: var(--spacing-lg, 2rem);
		padding-left: var(--spacing-lg, 2rem);
		border-left: 2px solid var(--color-accent, #d4af37);
	}

	.exhibition-item .year {
		font-weight: 600;
		color: var(--color-accent, #d4af37);
	}

	.exhibition-item h3 {
		font-size: var(--text-lg, 1.125rem);
		margin-bottom: var(--spacing-xs, 0.25rem);
		color: var(--text-primary, #1a1a1a);
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
		padding: var(--spacing-lg, 2rem);
		background: var(--bg-secondary, #f5f5f5);
		border-radius: var(--radius-md, 0.5rem);
	}

	.fair-card .year {
		display: block;
		font-weight: 600;
		color: var(--color-accent, #d4af37);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}

	.fair-card h3 {
		font-size: var(--text-lg, 1.125rem);
		margin-bottom: var(--spacing-sm, 0.5rem);
		color: var(--text-primary, #1a1a1a);
	}

	.fair-card .gallery {
		font-size: var(--text-sm, 0.875rem);
		color: var(--text-secondary, #666);
		font-style: italic;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.exhibitions-hero h1 {
			font-size: var(--text-3xl, 2.25rem);
		}

		.exhibitions-grid.featured {
			grid-template-columns: 1fr;
		}

		.exhibition-item {
			grid-template-columns: 60px 1fr;
			gap: var(--spacing-md, 1rem);
		}
	}

	/* Dark mode */
	:global(.dark) .exhibitions-hero,
	:global(.dark) .past-exhibitions {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global(.dark) .exhibition-card.featured,
	:global(.dark) .fair-card {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global(.dark) .type-badge {
		background: var(--bg-secondary, #1c1c1e);
	}
</style>
