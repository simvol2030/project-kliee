<script lang="ts">
	import { page } from '$app/stores';
	import type { LanguageCode } from '$lib/types/layout.types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as LanguageCode) || 'en');
	const { nft } = data;

	// Current URL for canonical
	const currentUrl = $derived($page.url.href);
	const baseUrl = $derived($page.url.origin);

	// Alternate language URLs
	const alternateUrls = $derived({
		en: `${baseUrl}/en/nft`,
		ru: `${baseUrl}/ru/nft`,
		es: `${baseUrl}/es/nft`,
		zh: `${baseUrl}/zh/nft`
	});
</script>

<svelte:head>
	<title>{nft.seo.title}</title>
	<meta name="description" content={nft.seo.description} />
	<link rel="canonical" href={currentUrl} />
	<link rel="alternate" href={alternateUrls.en} hreflang="en" />
	<link rel="alternate" href={alternateUrls.ru} hreflang="ru" />
	<link rel="alternate" href={alternateUrls.es} hreflang="es" />
	<link rel="alternate" href={alternateUrls.zh} hreflang="zh" />
	<link rel="alternate" href={alternateUrls.en} hreflang="x-default" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={nft.seo.title} />
	<meta property="og:description" content={nft.seo.description} />
</svelte:head>

<main class="nft-page">
	<!-- Hero Section -->
	<section class="nft-hero">
		<div class="container">
			<h1>{nft.page.hero.title}</h1>
			<p class="subtitle">{nft.page.hero.subtitle}</p>
		</div>
	</section>

	<!-- Description Section -->
	<section class="nft-description">
		<div class="container">
			<p>{nft.page.description}</p>
		</div>
	</section>

	<!-- Featured NFTs -->
	<section class="nft-gallery">
		<div class="container">
			<h2>
				{#if locale === 'ru'}Избранные NFT
				{:else if locale === 'es'}NFTs Destacados
				{:else if locale === 'zh'}精选NFT
				{:else}Featured NFTs{/if}
			</h2>
			<div class="nft-grid">
				{#each nft.featuredNfts as item}
					<article class="nft-card">
						<div class="nft-image">
							<img src={item.image} alt={item.title} loading="lazy" />
							{#if item.openSeaUrl}
								<a
									href={item.openSeaUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="view-link"
									aria-label="View on OpenSea"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
										<polyline points="15 3 21 3 21 9" />
										<line x1="10" y1="14" x2="21" y2="3" />
									</svg>
								</a>
							{/if}
						</div>
						<div class="nft-info">
							<h3>{item.title}</h3>
							<p class="technique">{item.technique}</p>
							<p class="year">{item.year}</p>
							{#if item.price && item.currency}
								<p class="price">
									{item.price} {item.currency}
								</p>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- OpenSea Collection CTA -->
	<section class="nft-cta">
		<div class="container">
			<div class="cta-content">
				<h2>
					{#if locale === 'ru'}Коллекция на OpenSea
					{:else if locale === 'es'}Colección en OpenSea
					{:else if locale === 'zh'}OpenSea收藏
					{:else}OpenSea Collection{/if}
				</h2>
				<p>
					{nft.openSeaCollection.collectionName} · {nft.openSeaCollection.blockchain}
				</p>
				<a
					href={nft.openSeaCollection.url}
					target="_blank"
					rel="noopener noreferrer"
					class="btn-primary"
				>
					{nft.cta.viewCollection}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
						<polyline points="15 3 21 3 21 9" />
						<line x1="10" y1="14" x2="21" y2="3" />
					</svg>
				</a>
			</div>
		</div>
	</section>
</main>

<style>
	.nft-page {
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg, 2rem);
	}

	/* Hero Section */
	.nft-hero {
		padding: var(--spacing-3xl, 6rem) 0;
		background: var(--bg-tertiary, #f5f5f5);
		text-align: center;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.nft-hero h1 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-4xl, 3rem);
		margin-bottom: var(--spacing-md, 1rem);
		color: var(--text-primary);
	}

	.subtitle {
		font-size: var(--text-lg, 1.125rem);
		color: var(--text-secondary);
		max-width: 600px;
		margin: 0 auto;
	}

	/* Description */
	.nft-description {
		padding: var(--spacing-2xl, 4rem) 0;
		text-align: center;
	}

	.nft-description p {
		font-size: var(--text-lg, 1.125rem);
		line-height: 1.8;
		max-width: 800px;
		margin: 0 auto;
		color: var(--text-secondary, #666);
	}

	/* Gallery */
	.nft-gallery {
		padding: var(--spacing-2xl, 4rem) 0;
		background: var(--bg-secondary, #f5f5f5);
	}

	.nft-gallery h2 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-2xl, 2rem);
		margin-bottom: var(--spacing-xl, 3rem);
		text-align: center;
		color: var(--text-primary, #1a1a1a);
	}

	.nft-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-lg, 2rem);
	}

	.nft-card {
		background: var(--bg-primary, #fff);
		border-radius: var(--radius-lg, 1rem);
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		transition: transform 0.3s, box-shadow 0.3s;
	}

	.nft-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
	}

	.nft-image {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
	}

	.nft-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.nft-card:hover .nft-image img {
		transform: scale(1.05);
	}

	.view-link {
		position: absolute;
		top: var(--spacing-md, 1rem);
		right: var(--spacing-md, 1rem);
		width: 40px;
		height: 40px;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-primary, #1a1a1a);
		opacity: 0;
		transition: opacity 0.3s;
	}

	.nft-card:hover .view-link {
		opacity: 1;
	}

	.view-link:hover {
		background: #fff;
	}

	.nft-info {
		padding: var(--spacing-lg, 2rem);
	}

	.nft-info h3 {
		font-size: var(--text-lg, 1.125rem);
		margin-bottom: var(--spacing-sm, 0.5rem);
		color: var(--text-primary, #1a1a1a);
	}

	.nft-info .technique {
		font-size: var(--text-sm, 0.875rem);
		color: var(--text-secondary, #666);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}

	.nft-info .year {
		font-size: var(--text-sm, 0.875rem);
		color: var(--text-secondary, #666);
		margin-bottom: var(--spacing-sm, 0.5rem);
	}

	.nft-info .price {
		font-weight: 600;
		color: var(--color-accent, #d4af37);
	}

	/* CTA */
	.nft-cta {
		padding: var(--spacing-3xl, 6rem) 0;
		background: var(--bg-secondary, #f5f5f5);
		border-top: 1px solid rgba(0, 0, 0, 0.1);
	}

	.cta-content {
		text-align: center;
	}

	.cta-content h2 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-2xl, 2rem);
		margin-bottom: var(--spacing-sm, 0.5rem);
		color: var(--text-primary);
	}

	.cta-content p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-lg, 2rem);
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm, 0.5rem);
		padding: var(--spacing-md, 1rem) var(--spacing-xl, 3rem);
		background: var(--color-accent, #d4af37);
		color: var(--black, #000);
		text-decoration: none;
		border-radius: var(--radius-md, 0.5rem);
		font-weight: 600;
		transition: all 0.2s;
	}

	.btn-primary:hover {
		background: var(--color-accent-dark, #b8962f);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.nft-hero h1 {
			font-size: var(--text-3xl, 2.25rem);
		}

		.nft-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Dark mode */
	:global([data-theme='dark']) .nft-hero {
		background: var(--bg-tertiary, #2c2c2e);
		border-bottom-color: rgba(255, 255, 255, 0.1);
	}

	:global([data-theme='dark']) .nft-gallery {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global([data-theme='dark']) .nft-card {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global([data-theme='dark']) .view-link {
		background: rgba(44, 44, 46, 0.9);
		color: #fff;
	}

	:global([data-theme='dark']) .view-link:hover {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global([data-theme='dark']) .nft-cta {
		background: var(--bg-secondary, #1c1c1e);
		border-top-color: rgba(255, 255, 255, 0.1);
	}

	:global([data-theme='dark']) .btn-primary {
		color: var(--black, #000);
	}
</style>
