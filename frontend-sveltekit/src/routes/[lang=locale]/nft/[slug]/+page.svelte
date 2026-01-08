<script lang="ts">
	import { page } from '$app/stores';
	import type { LanguageCode } from '$lib/types/layout.types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as LanguageCode) || 'en');
	const { nft, openSeaCollection } = data;

	// Current URL for canonical
	const currentUrl = $derived($page.url.href);
	const baseUrl = $derived($page.url.origin);

	// Alternate language URLs
	const alternateUrls = $derived({
		en: `${baseUrl}/en/nft/${nft.slug}`,
		ru: `${baseUrl}/ru/nft/${nft.slug}`,
		es: `${baseUrl}/es/nft/${nft.slug}`,
		zh: `${baseUrl}/zh/nft/${nft.slug}`
	});

	// Labels
	const labels = $derived({
		back: locale === 'ru' ? 'Назад к коллекции' : locale === 'es' ? 'Volver a la colección' : locale === 'zh' ? '返回收藏' : 'Back to Collection',
		technique: locale === 'ru' ? 'Техника' : locale === 'es' ? 'Técnica' : locale === 'zh' ? '技法' : 'Technique',
		year: locale === 'ru' ? 'Год' : locale === 'es' ? 'Año' : locale === 'zh' ? '年份' : 'Year',
		price: locale === 'ru' ? 'Цена' : locale === 'es' ? 'Precio' : locale === 'zh' ? '价格' : 'Price',
		blockchain: locale === 'ru' ? 'Блокчейн' : locale === 'es' ? 'Blockchain' : locale === 'zh' ? '区块链' : 'Blockchain',
		viewOnOpenSea: locale === 'ru' ? 'Посмотреть на OpenSea' : locale === 'es' ? 'Ver en OpenSea' : locale === 'zh' ? '在OpenSea查看' : 'View on OpenSea',
		description: locale === 'ru' ? 'Описание' : locale === 'es' ? 'Descripción' : locale === 'zh' ? '描述' : 'Description'
	});
</script>

<svelte:head>
	<title>{nft.title} | NFT - K-Liée</title>
	<meta name="description" content={nft.description} />
	<link rel="canonical" href={currentUrl} />
	<link rel="alternate" href={alternateUrls.en} hreflang="en" />
	<link rel="alternate" href={alternateUrls.ru} hreflang="ru" />
	<link rel="alternate" href={alternateUrls.es} hreflang="es" />
	<link rel="alternate" href={alternateUrls.zh} hreflang="zh" />
	<link rel="alternate" href={alternateUrls.en} hreflang="x-default" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content="{nft.title} | NFT - K-Liée" />
	<meta property="og:description" content={nft.description} />
	{#if nft.imageUrl}
		<meta property="og:image" content="{baseUrl}{nft.imageUrl}" />
	{/if}
</svelte:head>

<main class="nft-detail-page">
	<!-- Breadcrumb -->
	<nav class="breadcrumb">
		<div class="container">
			<a href="/{locale}/nft">&larr; {labels.back}</a>
		</div>
	</nav>

	<article class="nft-detail">
		<div class="container">
			<div class="nft-content">
				<!-- Media Section -->
				<div class="nft-media">
					{#if nft.videoUrl}
						<div class="video-wrapper">
							<video
								src={nft.videoUrl}
								poster={nft.imageUrl || undefined}
								controls
								playsinline
								preload="metadata"
							>
								<track kind="captions" />
								Your browser does not support the video tag.
							</video>
						</div>
					{:else if nft.imageUrl}
						<div class="image-wrapper">
							<img src={nft.imageUrl} alt={nft.title} />
						</div>
					{:else}
						<div class="no-media">
							<span>NFT</span>
						</div>
					{/if}
				</div>

				<!-- Info Section -->
				<div class="nft-info">
					<header>
						<h1>{nft.title}</h1>
						{#if nft.isFeatured}
							<span class="featured-badge">
								{locale === 'ru' ? 'Избранное' : locale === 'es' ? 'Destacado' : locale === 'zh' ? '精选' : 'Featured'}
							</span>
						{/if}
					</header>

					<!-- Details -->
					<div class="details-grid">
						{#if nft.technique}
							<div class="detail-item">
								<span class="detail-label">{labels.technique}</span>
								<span class="detail-value">{nft.technique}</span>
							</div>
						{/if}
						{#if nft.year}
							<div class="detail-item">
								<span class="detail-label">{labels.year}</span>
								<span class="detail-value">{nft.year}</span>
							</div>
						{/if}
						{#if nft.blockchain}
							<div class="detail-item">
								<span class="detail-label">{labels.blockchain}</span>
								<span class="detail-value">{nft.blockchain}</span>
							</div>
						{/if}
						{#if nft.price}
							<div class="detail-item price">
								<span class="detail-label">{labels.price}</span>
								<span class="detail-value">{nft.price} {nft.currency || 'ETH'}</span>
							</div>
						{/if}
					</div>

					<!-- Description -->
					<section class="description">
						<h2>{labels.description}</h2>
						<p>{nft.description}</p>
					</section>

					<!-- Actions -->
					<div class="actions">
						{#if nft.openSeaUrl}
							<a
								href={nft.openSeaUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="btn-primary"
							>
								{labels.viewOnOpenSea}
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
						{:else}
							<a
								href={openSeaCollection.url}
								target="_blank"
								rel="noopener noreferrer"
								class="btn-secondary"
							>
								{labels.viewOnOpenSea}
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
						{/if}
					</div>
				</div>
			</div>
		</div>
	</article>
</main>

<style>
	.nft-detail-page {
		min-height: 100vh;
		background: var(--bg-secondary, #f5f5f5);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg, 2rem);
	}

	/* Breadcrumb */
	.breadcrumb {
		padding: var(--spacing-md, 1rem) 0;
		background: var(--bg-primary, #fff);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.breadcrumb a {
		color: var(--text-secondary, #666);
		text-decoration: none;
		font-size: var(--text-sm, 0.875rem);
		transition: color 0.2s;
	}

	.breadcrumb a:hover {
		color: var(--text-primary, #1a1a1a);
	}

	/* NFT Detail */
	.nft-detail {
		padding: var(--spacing-2xl, 4rem) 0;
	}

	.nft-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-2xl, 4rem);
		align-items: start;
	}

	@media (max-width: 900px) {
		.nft-content {
			grid-template-columns: 1fr;
		}
	}

	/* Media Section */
	.nft-media {
		position: sticky;
		top: var(--spacing-lg, 2rem);
	}

	.video-wrapper,
	.image-wrapper {
		background: var(--bg-primary, #fff);
		border-radius: var(--radius-lg, 1rem);
		overflow: hidden;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
	}

	.video-wrapper video {
		width: 100%;
		display: block;
	}

	.image-wrapper img {
		width: 100%;
		display: block;
	}

	.no-media {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-tertiary, #e5e7eb);
		color: var(--text-secondary, #666);
		font-size: var(--text-3xl, 2.5rem);
		border-radius: var(--radius-lg, 1rem);
	}

	/* Info Section */
	.nft-info {
		background: var(--bg-primary, #fff);
		border-radius: var(--radius-lg, 1rem);
		padding: var(--spacing-xl, 3rem);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.nft-info header {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-md, 1rem);
		margin-bottom: var(--spacing-lg, 2rem);
	}

	.nft-info h1 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-3xl, 2.5rem);
		color: var(--text-primary, #1a1a1a);
		margin: 0;
		flex: 1;
	}

	.featured-badge {
		padding: 0.25rem 0.75rem;
		background: var(--color-accent, #d4af37);
		color: var(--black, #000);
		font-size: var(--text-xs, 0.75rem);
		font-weight: 600;
		border-radius: var(--radius-sm, 0.25rem);
		white-space: nowrap;
	}

	/* Details Grid */
	.details-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-md, 1rem);
		padding: var(--spacing-lg, 2rem) 0;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		margin-bottom: var(--spacing-lg, 2rem);
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.detail-label {
		font-size: var(--text-xs, 0.75rem);
		color: var(--text-secondary, #666);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.detail-value {
		font-size: var(--text-md, 1rem);
		color: var(--text-primary, #1a1a1a);
		font-weight: 500;
	}

	.detail-item.price .detail-value {
		font-size: var(--text-lg, 1.25rem);
		color: var(--color-accent, #d4af37);
		font-weight: 700;
	}

	/* Description */
	.description {
		margin-bottom: var(--spacing-xl, 3rem);
	}

	.description h2 {
		font-size: var(--text-lg, 1.125rem);
		color: var(--text-primary, #1a1a1a);
		margin-bottom: var(--spacing-sm, 0.5rem);
	}

	.description p {
		font-size: var(--text-md, 1rem);
		line-height: 1.8;
		color: var(--text-secondary, #666);
	}

	/* Actions */
	.actions {
		display: flex;
		gap: var(--spacing-md, 1rem);
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm, 0.5rem);
		padding: var(--spacing-md, 1rem) var(--spacing-xl, 2rem);
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

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm, 0.5rem);
		padding: var(--spacing-md, 1rem) var(--spacing-xl, 2rem);
		background: transparent;
		border: 2px solid var(--text-secondary, #666);
		color: var(--text-primary, #1a1a1a);
		text-decoration: none;
		border-radius: var(--radius-md, 0.5rem);
		font-weight: 600;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: var(--bg-tertiary, #f5f5f5);
		border-color: var(--text-primary, #1a1a1a);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.nft-info h1 {
			font-size: var(--text-2xl, 2rem);
		}

		.nft-info {
			padding: var(--spacing-lg, 2rem);
		}

		.details-grid {
			grid-template-columns: 1fr;
		}

		.nft-media {
			position: static;
		}
	}

	/* Dark mode */
	:global(.dark) .nft-detail-page {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global(.dark) .breadcrumb {
		background: var(--bg-tertiary, #2c2c2e);
		border-bottom-color: rgba(255, 255, 255, 0.1);
	}

	:global(.dark) .breadcrumb a {
		color: #9ca3af;
	}

	:global(.dark) .breadcrumb a:hover {
		color: #f9fafb;
	}

	:global(.dark) .nft-info {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global(.dark) .nft-info h1,
	:global(.dark) .detail-value,
	:global(.dark) .description h2 {
		color: #f9fafb;
	}

	:global(.dark) .detail-label,
	:global(.dark) .description p {
		color: #9ca3af;
	}

	:global(.dark) .details-grid {
		border-color: rgba(255, 255, 255, 0.1);
	}

	:global(.dark) .video-wrapper,
	:global(.dark) .image-wrapper {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global(.dark) .btn-secondary {
		border-color: #9ca3af;
		color: #f9fafb;
	}

	:global(.dark) .btn-secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: #f9fafb;
	}
</style>
