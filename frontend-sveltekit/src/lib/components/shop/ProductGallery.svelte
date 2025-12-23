<script lang="ts">
	import type { LanguageCode } from '$lib/utils/currency';

	interface ProductImage {
		id: number;
		stored_filename: string;
		folder: string | null;
		alt_en: string | null;
		alt_ru: string | null;
		alt_es: string | null;
		alt_zh: string | null;
		width: number | null;
		height: number | null;
		is_primary: boolean | null;
		order_index: number | null;
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
		switch (lang) {
			case 'ru':
				return img.alt_ru || productTitle;
			case 'es':
				return img.alt_es || productTitle;
			case 'zh':
				return img.alt_zh || productTitle;
			default:
				return img.alt_en || productTitle;
		}
	}

	function getImageUrl(img: ProductImage): string {
		return `/uploads/${img.folder || 'products'}/${img.stored_filename}`;
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
	<!-- Main Image -->
	{#if currentImage}
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
			{#each images as image, index (image.id)}
				<button
					type="button"
					class="thumbnail"
					class:active={index === currentIndex}
					onclick={() => selectImage(index)}
					aria-label="View image {index + 1}"
				>
					<img src={getImageUrl(image)} alt={getImageAlt(image)} />
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

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
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
