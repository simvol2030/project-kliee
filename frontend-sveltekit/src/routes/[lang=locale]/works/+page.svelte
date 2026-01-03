<script lang="ts">
	import { page } from '$app/stores';
	import type { LanguageCode } from '$lib/types/layout.types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as LanguageCode) || 'en');
	const { series } = data;

	// Current URL for canonical
	const currentUrl = $derived($page.url.href);
	const baseUrl = $derived($page.url.origin);

	// Alternate language URLs
	const alternateUrls = $derived({
		en: `${baseUrl}/en/works`,
		ru: `${baseUrl}/ru/works`,
		es: `${baseUrl}/es/works`,
		zh: `${baseUrl}/zh/works`
	});

	// Page titles
	const titles = {
		en: 'Works',
		ru: 'Работы',
		es: 'Obras',
		zh: '作品'
	};

	const subtitles = {
		en: 'Explore the complete collection of artwork series',
		ru: 'Исследуйте полную коллекцию серий работ',
		es: 'Explora la colección completa de series de obras',
		zh: '探索完整的作品系列集合'
	};

	const seoTitle = $derived(`${titles[locale]} | Svetlana K-LIÉE`);
	const seoDescription = $derived(subtitles[locale]);
</script>

<svelte:head>
	<title>{seoTitle}</title>
	<meta name="description" content={seoDescription} />
	<link rel="canonical" href={currentUrl} />
	<link rel="alternate" href={alternateUrls.en} hreflang="en" />
	<link rel="alternate" href={alternateUrls.ru} hreflang="ru" />
	<link rel="alternate" href={alternateUrls.es} hreflang="es" />
	<link rel="alternate" href={alternateUrls.zh} hreflang="zh" />
	<link rel="alternate" href={alternateUrls.en} hreflang="x-default" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={seoTitle} />
	<meta property="og:description" content={seoDescription} />
</svelte:head>

<main class="works-page">
	<!-- Hero Section -->
	<section class="works-hero">
		<div class="container">
			<h1>{titles[locale]}</h1>
			<p class="subtitle">{subtitles[locale]}</p>
		</div>
	</section>

	<!-- Series Grid -->
	<section class="series-section">
		<div class="container">
			<div class="series-grid">
				{#each series as item}
					<a href="/{locale}/works/{item.slug}" class="series-card">
						<div class="series-image">
							<img src={item.coverImage} alt={item.title} loading="lazy" />
							<div class="overlay">
								<span class="artwork-count">
									{item.artworkCount}
									{#if locale === 'ru'}работ
									{:else if locale === 'es'}obras
									{:else if locale === 'zh'}件作品
									{:else}artworks{/if}
								</span>
							</div>
						</div>
						<div class="series-info">
							<h2>{item.title}</h2>
							<p>{item.description}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
</main>

<style>
	.works-page {
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg, 2rem);
	}

	/* Hero Section */
	.works-hero {
		padding: var(--spacing-3xl, 6rem) 0;
		background: var(--bg-secondary, #f5f5f5);
		text-align: center;
	}

	.works-hero h1 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-4xl, 3rem);
		margin-bottom: var(--spacing-md, 1rem);
		color: var(--text-primary, #1a1a1a);
	}

	.subtitle {
		font-size: var(--text-lg, 1.125rem);
		color: var(--text-secondary, #666);
		max-width: 600px;
		margin: 0 auto;
	}

	/* Series Grid */
	.series-section {
		padding: var(--spacing-3xl, 6rem) 0;
	}

	.series-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: var(--spacing-xl, 3rem);
	}

	.series-card {
		text-decoration: none;
		color: inherit;
		display: block;
		transition: transform 0.3s;
	}

	.series-card:hover {
		transform: translateY(-5px);
	}

	.series-image {
		position: relative;
		aspect-ratio: 4/3;
		overflow: hidden;
		border-radius: var(--radius-lg, 1rem);
	}

	.series-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s;
	}

	.series-card:hover .series-image img {
		transform: scale(1.05);
	}

	.overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
		display: flex;
		align-items: flex-end;
		padding: var(--spacing-lg, 2rem);
		opacity: 0;
		transition: opacity 0.3s;
	}

	.series-card:hover .overlay {
		opacity: 1;
	}

	.artwork-count {
		color: #fff;
		font-size: var(--text-sm, 0.875rem);
		font-weight: 500;
	}

	.series-info {
		padding: var(--spacing-lg, 2rem) 0;
	}

	.series-info h2 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-xl, 1.5rem);
		margin-bottom: var(--spacing-sm, 0.5rem);
		color: var(--text-primary, #1a1a1a);
	}

	.series-info p {
		color: var(--text-secondary, #666);
		line-height: 1.6;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.works-hero h1 {
			font-size: var(--text-3xl, 2.25rem);
		}

		.series-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Dark mode */
	:global(.dark) .works-hero {
		background: var(--bg-secondary, #1c1c1e);
	}
</style>
