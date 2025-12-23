<script lang="ts">
	import { page } from '$app/stores';
	import type { LanguageCode } from '$lib/types/layout.types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as LanguageCode) || 'en');
	const { series, artworks, prevSeries, nextSeries } = data;

	// Current URL for canonical
	const currentUrl = $derived($page.url.href);
	const baseUrl = $derived($page.url.origin);

	// Alternate language URLs
	const alternateUrls = $derived({
		en: `${baseUrl}/en/works/${series.slug}`,
		ru: `${baseUrl}/ru/works/${series.slug}`,
		es: `${baseUrl}/es/works/${series.slug}`,
		zh: `${baseUrl}/zh/works/${series.slug}`
	});

	// Labels
	const labels = {
		backToWorks: {
			en: 'Back to Works',
			ru: 'К работам',
			es: 'Volver a obras',
			zh: '返回作品'
		},
		artworks: {
			en: 'artworks',
			ru: 'работ',
			es: 'obras',
			zh: '件作品'
		},
		previous: {
			en: 'Previous Series',
			ru: 'Предыдущая серия',
			es: 'Serie anterior',
			zh: '上一系列'
		},
		next: {
			en: 'Next Series',
			ru: 'Следующая серия',
			es: 'Serie siguiente',
			zh: '下一系列'
		},
		available: {
			en: 'Available',
			ru: 'Доступно',
			es: 'Disponible',
			zh: '可购买'
		},
		sold: {
			en: 'Sold',
			ru: 'Продано',
			es: 'Vendido',
			zh: '已售'
		}
	};

	// Selected artwork for lightbox
	let selectedArtwork = $state<(typeof artworks)[0] | null>(null);
	let selectedImageIndex = $state(0);

	function openLightbox(artwork: (typeof artworks)[0], imageIndex: number = 0) {
		selectedArtwork = artwork;
		selectedImageIndex = imageIndex;
	}

	function closeLightbox() {
		selectedArtwork = null;
		selectedImageIndex = 0;
	}

	function nextImage() {
		if (selectedArtwork && selectedImageIndex < selectedArtwork.images.length - 1) {
			selectedImageIndex++;
		}
	}

	function prevImage() {
		if (selectedImageIndex > 0) {
			selectedImageIndex--;
		}
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (!selectedArtwork) return;

		if (event.key === 'Escape') {
			closeLightbox();
		} else if (event.key === 'ArrowRight') {
			nextImage();
		} else if (event.key === 'ArrowLeft') {
			prevImage();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<title>{series.title} | Svetlana K-LIEE</title>
	<meta name="description" content={series.description} />
	<link rel="canonical" href={currentUrl} />
	<link rel="alternate" href={alternateUrls.en} hreflang="en" />
	<link rel="alternate" href={alternateUrls.ru} hreflang="ru" />
	<link rel="alternate" href={alternateUrls.es} hreflang="es" />
	<link rel="alternate" href={alternateUrls.zh} hreflang="zh" />
	<link rel="alternate" href={alternateUrls.en} hreflang="x-default" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content="{series.title} | Svetlana K-LIEE" />
	<meta property="og:description" content={series.description} />
	{#if artworks.length > 0 && artworks[0].images.length > 0}
		<meta property="og:image" content={artworks[0].images[0]} />
	{/if}
</svelte:head>

<main class="series-page">
	<!-- Breadcrumb -->
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<div class="container">
			<a href="/{locale}/works">{labels.backToWorks[locale]}</a>
			<span aria-hidden="true">/</span>
			<span aria-current="page">{series.title}</span>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="series-hero">
		<div class="container">
			<h1>{series.title}</h1>
			<p class="description">{series.description}</p>
			<p class="count">
				{artworks.length}
				{labels.artworks[locale]}
			</p>
		</div>
	</section>

	<!-- Artworks Grid -->
	<section class="artworks-section">
		<div class="container">
			<div class="artworks-grid">
				{#each artworks as artwork}
					<article class="artwork-card">
						<button
							type="button"
							class="artwork-image-btn"
							onclick={() => openLightbox(artwork)}
							aria-label="View {artwork.title}"
						>
							{#if artwork.images.length > 0}
								<img src={artwork.images[0]} alt={artwork.title} loading="lazy" />
							{/if}
							{#if artwork.images.length > 1}
								<span class="image-count">{artwork.images.length}</span>
							{/if}
						</button>
						<div class="artwork-info">
							<h3>{artwork.title}</h3>
							<p class="technique">{artwork.technique}</p>
							<p class="year">{artwork.year}</p>
							{#if artwork.dimensions}
								<p class="dimensions">{artwork.dimensions}</p>
							{/if}
							<div class="artwork-meta">
								{#if artwork.available && artwork.price}
									<span class="price">
										{artwork.currency === 'EUR' ? '€' : artwork.currency}
										{artwork.price?.toLocaleString()}
									</span>
									<span class="status available">{labels.available[locale]}</span>
								{:else if !artwork.available}
									<span class="status sold">{labels.sold[locale]}</span>
								{/if}
							</div>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- Series Navigation -->
	<nav class="series-nav" aria-label="Series navigation">
		<div class="container">
			{#if prevSeries}
				<a href="/{locale}/works/{prevSeries.slug}" class="nav-link prev">
					<span class="label">{labels.previous[locale]}</span>
					<span class="title">{prevSeries.title}</span>
				</a>
			{:else}
				<div></div>
			{/if}

			{#if nextSeries}
				<a href="/{locale}/works/{nextSeries.slug}" class="nav-link next">
					<span class="label">{labels.next[locale]}</span>
					<span class="title">{nextSeries.title}</span>
				</a>
			{/if}
		</div>
	</nav>
</main>

<!-- Lightbox -->
{#if selectedArtwork}
	<div
		class="lightbox"
		role="dialog"
		aria-modal="true"
		aria-label="Artwork viewer"
		onclick={closeLightbox}
		onkeydown={(e) => e.key === 'Enter' && closeLightbox()}
	>
		<div class="lightbox-content" onclick={(e) => e.stopPropagation()} role="presentation">
			<button type="button" class="close-btn" onclick={closeLightbox} aria-label="Close">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>

			<div class="lightbox-image">
				<img
					src={selectedArtwork.images[selectedImageIndex]}
					alt="{selectedArtwork.title} - Image {selectedImageIndex + 1}"
				/>
			</div>

			{#if selectedArtwork.images.length > 1}
				<div class="lightbox-nav">
					<button
						type="button"
						class="nav-btn prev"
						onclick={prevImage}
						disabled={selectedImageIndex === 0}
						aria-label="Previous image"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M15 18l-6-6 6-6" />
						</svg>
					</button>

					<span class="image-counter">
						{selectedImageIndex + 1} / {selectedArtwork.images.length}
					</span>

					<button
						type="button"
						class="nav-btn next"
						onclick={nextImage}
						disabled={selectedImageIndex === selectedArtwork.images.length - 1}
						aria-label="Next image"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M9 18l6-6-6-6" />
						</svg>
					</button>
				</div>
			{/if}

			<div class="lightbox-info">
				<h2>{selectedArtwork.title}</h2>
				<p>{selectedArtwork.technique}, {selectedArtwork.year}</p>
				{#if selectedArtwork.dimensions}
					<p>{selectedArtwork.dimensions}</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.series-page {
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg, 2rem);
	}

	/* Breadcrumb */
	.breadcrumb {
		padding: var(--spacing-md, 1rem) 0;
		background: var(--bg-secondary, #f5f5f5);
	}

	.breadcrumb .container {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm, 0.5rem);
		font-size: var(--text-sm, 0.875rem);
	}

	.breadcrumb a {
		color: var(--color-accent, #d4af37);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	.breadcrumb span[aria-current] {
		color: var(--text-secondary, #666);
	}

	/* Hero */
	.series-hero {
		padding: var(--spacing-3xl, 6rem) 0;
		background: var(--bg-secondary, #f5f5f5);
		text-align: center;
	}

	.series-hero h1 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-4xl, 3rem);
		margin-bottom: var(--spacing-md, 1rem);
		color: var(--text-primary, #1a1a1a);
	}

	.description {
		font-size: var(--text-lg, 1.125rem);
		color: var(--text-secondary, #666);
		max-width: 700px;
		margin: 0 auto var(--spacing-md, 1rem);
		line-height: 1.7;
	}

	.count {
		color: var(--color-accent, #d4af37);
		font-weight: 500;
	}

	/* Artworks Grid */
	.artworks-section {
		padding: var(--spacing-3xl, 6rem) 0;
	}

	.artworks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-xl, 3rem);
	}

	.artwork-card {
		background: var(--bg-primary, #fff);
	}

	.artwork-image-btn {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		overflow: hidden;
		border: none;
		padding: 0;
		cursor: pointer;
		background: var(--bg-secondary, #f5f5f5);
		border-radius: var(--radius-md, 0.5rem);
	}

	.artwork-image-btn img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.artwork-image-btn:hover img {
		transform: scale(1.05);
	}

	.image-count {
		position: absolute;
		bottom: var(--spacing-sm, 0.5rem);
		right: var(--spacing-sm, 0.5rem);
		background: rgba(0, 0, 0, 0.7);
		color: #fff;
		padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
		border-radius: var(--radius-sm, 0.25rem);
		font-size: var(--text-xs, 0.75rem);
	}

	.artwork-info {
		padding: var(--spacing-md, 1rem) 0;
	}

	.artwork-info h3 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-lg, 1.125rem);
		margin-bottom: var(--spacing-xs, 0.25rem);
		color: var(--text-primary, #1a1a1a);
	}

	.technique {
		color: var(--text-secondary, #666);
		font-size: var(--text-sm, 0.875rem);
	}

	.year {
		color: var(--color-accent, #d4af37);
		font-weight: 500;
		font-size: var(--text-sm, 0.875rem);
	}

	.dimensions {
		color: var(--text-secondary, #666);
		font-size: var(--text-sm, 0.875rem);
	}

	.artwork-meta {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm, 0.5rem);
		margin-top: var(--spacing-sm, 0.5rem);
	}

	.price {
		font-weight: 600;
		color: var(--text-primary, #1a1a1a);
	}

	.status {
		font-size: var(--text-xs, 0.75rem);
		padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
		border-radius: var(--radius-sm, 0.25rem);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status.available {
		background: #d4edda;
		color: #155724;
	}

	.status.sold {
		background: var(--bg-tertiary, #e5e5e5);
		color: var(--text-secondary, #666);
	}

	/* Series Navigation */
	.series-nav {
		padding: var(--spacing-xl, 3rem) 0;
		background: var(--bg-secondary, #f5f5f5);
	}

	.series-nav .container {
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-lg, 2rem);
	}

	.nav-link {
		text-decoration: none;
		color: inherit;
		padding: var(--spacing-md, 1rem);
		background: var(--bg-primary, #fff);
		border-radius: var(--radius-md, 0.5rem);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		min-width: 200px;
	}

	.nav-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.nav-link .label {
		display: block;
		font-size: var(--text-sm, 0.875rem);
		color: var(--text-secondary, #666);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}

	.nav-link .title {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-lg, 1.125rem);
		color: var(--text-primary, #1a1a1a);
	}

	.nav-link.prev {
		text-align: left;
	}

	.nav-link.next {
		text-align: right;
		margin-left: auto;
	}

	/* Lightbox */
	.lightbox {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-lg, 2rem);
	}

	.lightbox-content {
		position: relative;
		max-width: 90vw;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.close-btn {
		position: absolute;
		top: -40px;
		right: 0;
		background: none;
		border: none;
		color: #fff;
		cursor: pointer;
		padding: var(--spacing-sm, 0.5rem);
	}

	.close-btn svg {
		width: 24px;
		height: 24px;
	}

	.lightbox-image {
		max-height: 70vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.lightbox-image img {
		max-width: 100%;
		max-height: 70vh;
		object-fit: contain;
	}

	.lightbox-nav {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg, 2rem);
		margin-top: var(--spacing-md, 1rem);
	}

	.nav-btn {
		background: rgba(255, 255, 255, 0.1);
		border: none;
		color: #fff;
		padding: var(--spacing-sm, 0.5rem);
		border-radius: 50%;
		cursor: pointer;
		transition: background 0.2s;
	}

	.nav-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.2);
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.nav-btn svg {
		width: 24px;
		height: 24px;
	}

	.image-counter {
		color: #fff;
		font-size: var(--text-sm, 0.875rem);
	}

	.lightbox-info {
		text-align: center;
		margin-top: var(--spacing-lg, 2rem);
		color: #fff;
	}

	.lightbox-info h2 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-xl, 1.5rem);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}

	.lightbox-info p {
		font-size: var(--text-sm, 0.875rem);
		opacity: 0.8;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.series-hero h1 {
			font-size: var(--text-3xl, 2.25rem);
		}

		.artworks-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-md, 1rem);
		}

		.series-nav .container {
			flex-direction: column;
		}

		.nav-link {
			min-width: auto;
		}

		.nav-link.next {
			margin-left: 0;
			text-align: left;
		}
	}

	@media (max-width: 480px) {
		.artworks-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Dark mode */
	:global([data-theme='dark']) .breadcrumb,
	:global([data-theme='dark']) .series-hero,
	:global([data-theme='dark']) .series-nav {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global([data-theme='dark']) .nav-link {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global([data-theme='dark']) .artwork-image-btn {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global([data-theme='dark']) .status.available {
		background: #1a4d2e;
		color: #90ee90;
	}
</style>
