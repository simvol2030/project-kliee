<script lang="ts">
	import type { LanguageCode } from '$lib/utils/currency';

	// Flexible image interface that works with both old and new formats
	interface ProductImage {
		url: string;
		alt?: string | null;
		stored_filename?: string;
		mime_type?: string | null;
	}

	interface Props {
		images: ProductImage[];
		productTitle: string;
		lang: LanguageCode;
	}

	let { images, productTitle, lang }: Props = $props();

	let currentIndex = $state(0);
	let lightboxOpen = $state(false);
	let touchStartX = $state(0);
	let touchEndX = $state(0);

	const currentImage = $derived(images[currentIndex] || null);

	function getImageAlt(img: ProductImage): string {
		return img.alt || productTitle;
	}

	function getImageUrl(img: ProductImage): string {
		// If url is provided, use it directly
		if (img.url) {
			return img.url;
		}
		// Fallback to old format with stored_filename
		if (img.stored_filename) {
			return `/uploads/products/${img.stored_filename}`;
		}
		return '/images/placeholder-artwork.svg';
	}

	function isVideo(img: ProductImage): boolean {
		return img.mime_type?.startsWith('video/') ?? false;
	}

	function selectImage(index: number) {
		currentIndex = index;
	}

	function openLightbox() {
		lightboxOpen = true;
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		lightboxOpen = false;
		document.body.style.overflow = '';
	}

	function prevImage() {
		currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
	}

	function nextImage() {
		currentIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!lightboxOpen) return;

		switch (e.key) {
			case 'Escape':
				closeLightbox();
				break;
			case 'ArrowLeft':
				prevImage();
				break;
			case 'ArrowRight':
				nextImage();
				break;
		}
	}

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function handleTouchMove(e: TouchEvent) {
		touchEndX = e.touches[0].clientX;
	}

	function handleTouchEnd() {
		const diff = touchStartX - touchEndX;
		const threshold = 50;

		if (Math.abs(diff) > threshold) {
			if (diff > 0) {
				nextImage();
			} else {
				prevImage();
			}
		}

		touchStartX = 0;
		touchEndX = 0;
	}

	function handleLightboxClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeLightbox();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="product-gallery">
	<!-- Main Image/Video -->
	{#if currentImage}
		{#if isVideo(currentImage)}
			<div class="main-image video-container">
				<video
					src={getImageUrl(currentImage)}
					controls
					autoplay
					muted
					loop
					playsinline
				>
					<track kind="captions" />
					Your browser does not support video playback.
				</video>
				<span class="video-badge">Video</span>
			</div>
		{:else}
			<button type="button" class="main-image" onclick={openLightbox} aria-label="Open fullscreen view">
				<img src={getImageUrl(currentImage)} alt={getImageAlt(currentImage)} />
				<div class="zoom-hint">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
						<line x1="11" y1="8" x2="11" y2="14" />
						<line x1="8" y1="11" x2="14" y2="11" />
					</svg>
				</div>
			</button>
		{/if}
	{:else}
		<div class="main-image placeholder">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
				<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
				<circle cx="8.5" cy="8.5" r="1.5" />
				<polyline points="21 15 16 10 5 21" />
			</svg>
		</div>
	{/if}

	<!-- Thumbnails -->
	{#if images.length > 1}
		<div class="thumbnails">
			{#each images as image, index (index)}
				<button
					type="button"
					class="thumbnail"
					class:active={index === currentIndex}
					class:video={isVideo(image)}
					onclick={() => selectImage(index)}
					aria-label="View {isVideo(image) ? 'video' : 'image'} {index + 1}"
				>
					{#if isVideo(image)}
						<video src={getImageUrl(image)} muted>
							<track kind="captions" />
						</video>
						<span class="thumb-video-badge">▶</span>
					{:else}
						<img src={getImageUrl(image)} alt={getImageAlt(image)} />
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Lightbox -->
{#if lightboxOpen && currentImage}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="lightbox"
		onclick={handleLightboxClick}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		role="dialog"
		aria-modal="true"
		aria-label="Image viewer"
	>
		<button class="lightbox-close" onclick={closeLightbox} aria-label="Close">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>

		{#if images.length > 1}
			<button class="lightbox-nav prev" onclick={prevImage} aria-label="Previous image">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</button>
		{/if}

		<div class="lightbox-image">
			<img src={getImageUrl(currentImage)} alt={getImageAlt(currentImage)} />
		</div>

		{#if images.length > 1}
			<button class="lightbox-nav next" onclick={nextImage} aria-label="Next image">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
		{/if}

		{#if images.length > 1}
			<div class="lightbox-counter">
				{currentIndex + 1} / {images.length}
			</div>
		{/if}
	</div>
{/if}

<style>
	.product-gallery {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.main-image {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 0.5rem;
		background: var(--color-bg-secondary, #f5f5f5);
		cursor: zoom-in;
		border: none;
		padding: 0;
	}

	.main-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.main-image:hover img {
		transform: scale(1.02);
	}

	.main-image.video-container {
		cursor: default;
	}

	.main-image video {
		width: 100%;
		height: 100%;
		object-fit: contain;
		background: #000;
	}

	.video-badge {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		background: #dc2626;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.zoom-hint {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.main-image:hover .zoom-hint {
		opacity: 1;
	}

	.main-image.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
		cursor: default;
	}

	.thumbnails {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		padding-bottom: 0.25rem;
	}

	.thumbnail {
		flex-shrink: 0;
		width: 80px;
		height: 80px;
		border-radius: 0.375rem;
		overflow: hidden;
		border: 2px solid transparent;
		padding: 0;
		cursor: pointer;
		transition: border-color 0.2s;
		background: var(--color-bg-secondary, #f5f5f5);
	}

	.thumbnail.active {
		border-color: #667eea;
	}

	.thumbnail:hover {
		border-color: #a5b4fc;
	}

	.thumbnail img,
	.thumbnail video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumbnail.video {
		position: relative;
	}

	.thumb-video-badge {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.7);
		color: white;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.625rem;
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
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
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
		transition: opacity 0.2s;
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
		transition: opacity 0.2s;
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
		align-items: center;
		justify-content: center;
	}

	.lightbox-image img {
		max-width: 100%;
		max-height: 90vh;
		object-fit: contain;
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

	/* Dark theme - Using .dark class from mode-watcher */
	:global(.dark) .main-image {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global(.dark) .main-image.placeholder {
		color: var(--text-secondary, #8e8e93);
	}

	:global(.dark) .thumbnail {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global(.dark) .lightbox {
		background: rgba(0, 0, 0, 0.98);
	}

	/* Mobile */
	@media (max-width: 640px) {
		.thumbnail {
			width: 60px;
			height: 60px;
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
