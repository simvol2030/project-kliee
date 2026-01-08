<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	let currentImageIndex = $state(0);
	let lightboxOpen = $state(false);

	const hasImages = $derived(data.images.length > 0);
	const currentImage = $derived(data.images[currentImageIndex]);

	function openLightbox(index: number = 0) {
		currentImageIndex = index;
		lightboxOpen = true;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = 'hidden';
		}
	}

	function closeLightbox() {
		lightboxOpen = false;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	}

	function prevImage() {
		currentImageIndex = currentImageIndex === 0 ? data.images.length - 1 : currentImageIndex - 1;
	}

	function nextImage() {
		currentImageIndex = currentImageIndex === data.images.length - 1 ? 0 : currentImageIndex + 1;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!lightboxOpen) return;
		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowLeft') prevImage();
		if (e.key === 'ArrowRight') nextImage();
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleDateString($page.params.lang || 'en', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{data.exhibition.title} | K-LIÉE</title>
	<meta name="description" content={data.exhibition.description || data.exhibition.title} />
</svelte:head>

<div class="exhibition-detail">
	<!-- Breadcrumb -->
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href="/{$page.params.lang}/exhibitions">← Back to Exhibitions</a>
	</nav>

	<!-- Header -->
	<header class="exhibition-header">
		<div class="exhibition-meta">
			{#if data.exhibition.type}
				<span class="type-badge">{data.exhibition.type}</span>
			{/if}
			{#if data.exhibition.year}
				<span class="year">{data.exhibition.year}</span>
			{/if}
		</div>

		<h1 class="exhibition-title">{data.exhibition.title}</h1>

		{#if data.exhibition.venue}
			<p class="venue">{data.exhibition.venue}</p>
		{/if}

		{#if data.exhibition.city || data.exhibition.country}
			<p class="location">
				{[data.exhibition.city, data.exhibition.country].filter(Boolean).join(', ')}
			</p>
		{/if}

		{#if data.exhibition.startDate || data.exhibition.endDate}
			<p class="dates">
				{formatDate(data.exhibition.startDate)}
				{#if data.exhibition.endDate}
					— {formatDate(data.exhibition.endDate)}
				{/if}
			</p>
		{/if}

		{#if data.exhibition.isCurrent}
			<span class="current-badge">Currently Open</span>
		{/if}
	</header>

	<!-- Cover Image -->
	{#if data.exhibition.coverImage}
		<div class="cover-image">
			<img src={data.exhibition.coverImage} alt={data.exhibition.title} />
		</div>
	{/if}

	<!-- Description -->
	{#if data.exhibition.description}
		<div class="description">
			<p>{data.exhibition.description}</p>
		</div>
	{/if}

	<!-- Gallery Link -->
	{#if data.exhibition.galleryLink}
		<a href={data.exhibition.galleryLink} class="gallery-link" target="_blank" rel="noopener">
			Visit Gallery Website →
		</a>
	{/if}

	<!-- Image Gallery -->
	{#if hasImages}
		<section class="gallery">
			<h2>Gallery</h2>
			<div class="gallery-grid">
				{#each data.images as image, index}
					<button
						class="gallery-item"
						type="button"
						onclick={() => openLightbox(index)}
						aria-label="View image {index + 1}"
					>
						<img src={image.url} alt={image.caption || data.exhibition.title} />
					</button>
				{/each}
			</div>
		</section>
	{/if}
</div>

<!-- Lightbox -->
{#if lightboxOpen && currentImage}
	<div
		class="lightbox"
		role="dialog"
		aria-modal="true"
		aria-label="Image viewer"
		onclick={(e) => e.target === e.currentTarget && closeLightbox()}
		onkeydown={handleKeydown}
	>
		<button class="lightbox-close" onclick={closeLightbox} aria-label="Close">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>

		{#if data.images.length > 1}
			<button class="lightbox-nav prev" onclick={prevImage} aria-label="Previous image">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</button>
		{/if}

		<div class="lightbox-image">
			<img src={currentImage.url} alt={currentImage.caption || data.exhibition.title} />
			{#if currentImage.caption}
				<p class="lightbox-caption">{currentImage.caption}</p>
			{/if}
		</div>

		{#if data.images.length > 1}
			<button class="lightbox-nav next" onclick={nextImage} aria-label="Next image">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
		{/if}

		{#if data.images.length > 1}
			<div class="lightbox-counter">
				{currentImageIndex + 1} / {data.images.length}
			</div>
		{/if}
	</div>
{/if}

<style>
	.exhibition-detail {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.breadcrumb {
		margin-bottom: 2rem;
	}

	.breadcrumb a {
		color: var(--text-secondary, #666);
		text-decoration: none;
		font-size: 0.875rem;
	}

	.breadcrumb a:hover {
		color: var(--text-primary, #333);
	}

	.exhibition-header {
		margin-bottom: 2rem;
	}

	.exhibition-meta {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.type-badge {
		background: var(--bg-tertiary, #e5e7eb);
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		font-weight: 600;
	}

	.year {
		color: var(--text-secondary, #666);
		font-size: 0.875rem;
	}

	.exhibition-title {
		font-size: 2.5rem;
		font-weight: 300;
		margin: 0.5rem 0;
		line-height: 1.2;
	}

	.venue {
		font-size: 1.25rem;
		color: var(--text-primary, #333);
		margin: 0.5rem 0;
	}

	.location,
	.dates {
		color: var(--text-secondary, #666);
		margin: 0.25rem 0;
	}

	.current-badge {
		display: inline-block;
		background: #10b981;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		margin-top: 0.5rem;
	}

	.cover-image {
		border-radius: 0.5rem;
		overflow: hidden;
		margin-bottom: 2rem;
	}

	.cover-image img {
		width: 100%;
		height: auto;
		display: block;
	}

	.description {
		font-size: 1.125rem;
		line-height: 1.8;
		margin-bottom: 2rem;
		color: var(--text-primary, #333);
	}

	.gallery-link {
		display: inline-block;
		color: var(--accent-color, #667eea);
		text-decoration: none;
		font-weight: 500;
		margin-bottom: 3rem;
	}

	.gallery-link:hover {
		text-decoration: underline;
	}

	.gallery h2 {
		font-size: 1.5rem;
		font-weight: 300;
		margin-bottom: 1.5rem;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.gallery-item {
		aspect-ratio: 1;
		border: none;
		padding: 0;
		cursor: pointer;
		border-radius: 0.25rem;
		overflow: hidden;
		background: var(--bg-secondary, #f3f4f6);
	}

	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.2s;
	}

	.gallery-item:hover img {
		transform: scale(1.05);
	}

	/* Lightbox */
	.lightbox {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.lightbox-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		padding: 0.5rem;
		opacity: 0.8;
		z-index: 10;
	}

	.lightbox-close:hover {
		opacity: 1;
	}

	.lightbox-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		padding: 1rem;
		opacity: 0.8;
		z-index: 10;
	}

	.lightbox-nav.prev {
		left: 0.5rem;
	}

	.lightbox-nav.next {
		right: 0.5rem;
	}

	.lightbox-nav:hover {
		opacity: 1;
	}

	.lightbox-image {
		max-width: 90vw;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.lightbox-image img {
		max-width: 100%;
		max-height: 85vh;
		object-fit: contain;
	}

	.lightbox-caption {
		color: white;
		margin-top: 1rem;
		text-align: center;
		font-size: 0.875rem;
		opacity: 0.8;
	}

	.lightbox-counter {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		color: white;
		font-size: 0.875rem;
		opacity: 0.8;
	}

	/* Dark theme */
	:global(.dark) .breadcrumb a {
		color: var(--text-secondary);
	}

	:global(.dark) .breadcrumb a:hover {
		color: var(--text-primary);
	}

	:global(.dark) .type-badge {
		background: var(--bg-tertiary);
	}

	/* Mobile */
	@media (max-width: 640px) {
		.exhibition-title {
			font-size: 1.75rem;
		}

		.gallery-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.lightbox-nav {
			padding: 0.5rem;
		}

		.lightbox-nav svg {
			width: 24px;
			height: 24px;
		}
	}
</style>
