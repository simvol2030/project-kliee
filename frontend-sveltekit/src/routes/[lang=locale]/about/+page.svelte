<script lang="ts">
	import { page } from '$app/stores';
	import type { LanguageCode } from '$lib/types/layout.types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as LanguageCode) || 'en');
	const { about } = data;

	// Current URL for canonical
	const currentUrl = $derived($page.url.href);
	const baseUrl = $derived($page.url.origin);

	// Alternate language URLs
	const alternateUrls = $derived({
		en: `${baseUrl}/en/about`,
		ru: `${baseUrl}/ru/about`,
		es: `${baseUrl}/es/about`,
		zh: `${baseUrl}/zh/about`
	});
</script>

<svelte:head>
	<title>{about.seo.title}</title>
	<meta name="description" content={about.seo.description} />
	<link rel="canonical" href={currentUrl} />
	<link rel="alternate" href={alternateUrls.en} hreflang="en" />
	<link rel="alternate" href={alternateUrls.ru} hreflang="ru" />
	<link rel="alternate" href={alternateUrls.es} hreflang="es" />
	<link rel="alternate" href={alternateUrls.zh} hreflang="zh" />
	<link rel="alternate" href={alternateUrls.en} hreflang="x-default" />

	<meta property="og:type" content="profile" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={about.seo.title} />
	<meta property="og:description" content={about.seo.description} />
	<meta property="og:image" content={`${baseUrl}${about.artist.image}`} />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: about.artist.name,
		jobTitle: 'Contemporary Artist',
		description: about.biography,
		image: `${baseUrl}${about.artist.image}`,
		nationality: about.artist.nationality,
		workLocation: about.artist.basedIn
	})}<\/script>`}
</svelte:head>

<main class="about-page">
	<!-- Hero Section -->
	<section class="about-hero">
		<div class="container">
			<div class="hero-content">
				<div class="hero-image">
					<img src={about.artist.image} alt={about.artist.name} loading="eager" />
				</div>
				<div class="hero-text">
					<h1>{about.artist.name}</h1>
					<p class="artist-meta">
						{about.artist.nationality} · Based in {about.artist.basedIn}
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Biography Section -->
	<section class="biography">
		<div class="container">
			<h2>
				{#if locale === 'ru'}Биография
				{:else if locale === 'es'}Biografía
				{:else if locale === 'zh'}传记
				{:else}Biography{/if}
			</h2>
			<div class="biography-text">
				<p>{about.biography}</p>
			</div>
		</div>
	</section>

	<!-- Education Section -->
	<section class="education">
		<div class="container">
			<h2>
				{#if locale === 'ru'}Образование
				{:else if locale === 'es'}Educación
				{:else if locale === 'zh'}教育背景
				{:else}Education{/if}
			</h2>
			<div class="timeline">
				{#each about.education as edu}
					<div class="timeline-item">
						<span class="year">{edu.year}</span>
						<div class="content">
							<h3>{edu.degree}</h3>
							<p>{edu.institution}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Awards Section -->
	<section class="awards">
		<div class="container">
			<h2>
				{#if locale === 'ru'}Награды и признание
				{:else if locale === 'es'}Premios y reconocimientos
				{:else if locale === 'zh'}奖项与荣誉
				{:else}Awards & Recognition{/if}
			</h2>
			<div class="timeline">
				{#each about.awards as award}
					<div class="timeline-item">
						<span class="year">{award.year}</span>
						<div class="content">
							<h3>{award.title}</h3>
							<p>{award.organization}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Residencies Section -->
	<section class="residencies">
		<div class="container">
			<h2>
				{#if locale === 'ru'}Резиденции
				{:else if locale === 'es'}Residencias
				{:else if locale === 'zh'}驻留项目
				{:else}Residencies{/if}
			</h2>
			<div class="residencies-grid">
				{#each about.residencies as residency}
					<div class="residency-card">
						<span class="year">{residency.year}</span>
						<p>{residency.location}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>
</main>

<style>
	.about-page {
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg, 2rem);
	}

	/* Hero Section */
	.about-hero {
		padding: var(--spacing-3xl, 6rem) 0;
		background: var(--bg-secondary, #f5f5f5);
	}

	.hero-content {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: var(--spacing-2xl, 4rem);
		align-items: center;
	}

	.hero-image {
		aspect-ratio: 3/4;
		overflow: hidden;
		border-radius: var(--radius-lg, 1rem);
	}

	.hero-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.hero-text h1 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-4xl, 3rem);
		margin-bottom: var(--spacing-sm, 0.5rem);
		color: var(--text-primary, #1a1a1a);
	}

	.artist-meta {
		font-size: var(--text-lg, 1.125rem);
		color: var(--text-secondary, #666);
	}

	/* Sections */
	section {
		padding: var(--spacing-3xl, 6rem) 0;
	}

	section:nth-child(even) {
		background: var(--bg-secondary, #f5f5f5);
	}

	section h2 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-2xl, 2rem);
		margin-bottom: var(--spacing-xl, 3rem);
		color: var(--text-primary, #1a1a1a);
	}

	/* Biography */
	.biography-text {
		max-width: 800px;
	}

	.biography-text p {
		font-size: var(--text-lg, 1.125rem);
		line-height: 1.8;
		color: var(--text-secondary, #333);
	}

	/* Timeline */
	.timeline {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg, 2rem);
	}

	.timeline-item {
		display: grid;
		grid-template-columns: 100px 1fr;
		gap: var(--spacing-lg, 2rem);
		padding-left: var(--spacing-lg, 2rem);
		border-left: 2px solid var(--color-accent, #d4af37);
	}

	.timeline-item .year {
		font-weight: 600;
		color: var(--color-accent, #d4af37);
		font-size: var(--text-sm, 0.875rem);
	}

	.timeline-item h3 {
		font-size: var(--text-lg, 1.125rem);
		margin-bottom: var(--spacing-xs, 0.25rem);
		color: var(--text-primary, #1a1a1a);
	}

	.timeline-item p {
		color: var(--text-secondary, #666);
	}

	/* Residencies Grid */
	.residencies-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-lg, 2rem);
	}

	.residency-card {
		padding: var(--spacing-lg, 2rem);
		background: var(--bg-primary, #fff);
		border-radius: var(--radius-md, 0.5rem);
		border: 1px solid var(--border-color, #e5e5e5);
	}

	.residency-card .year {
		display: block;
		font-weight: 600;
		color: var(--color-accent, #d4af37);
		margin-bottom: var(--spacing-sm, 0.5rem);
	}

	.residency-card p {
		color: var(--text-secondary, #333);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero-content {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.hero-image {
			max-width: 300px;
			margin: 0 auto;
		}

		.hero-text h1 {
			font-size: var(--text-3xl, 2.25rem);
		}

		.timeline-item {
			grid-template-columns: 80px 1fr;
			gap: var(--spacing-md, 1rem);
		}

		section {
			padding: var(--spacing-2xl, 4rem) 0;
		}
	}

	/* Dark mode */
	:global(.dark) .about-hero,
	:global(.dark) section:nth-child(even) {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global(.dark) .residency-card {
		background: var(--bg-tertiary, #2c2c2e);
		border-color: var(--border-color, #3c3c3e);
	}
</style>
