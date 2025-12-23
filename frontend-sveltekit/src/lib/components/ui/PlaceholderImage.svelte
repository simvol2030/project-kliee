<!--
  PlaceholderImage.svelte

  Displays a placeholder when image is not available.
  Falls back to a styled div with artwork dimensions.
-->
<script lang="ts">
	interface Props {
		src?: string;
		alt: string;
		width?: number;
		height?: number;
		aspectRatio?: string;
		class?: string;
	}

	let {
		src = '',
		alt,
		width = 400,
		height = 300,
		aspectRatio = '4/3',
		class: className = ''
	}: Props = $props();

	let imageError = $state(false);
	let imageLoaded = $state(false);

	function handleError() {
		imageError = true;
	}

	function handleLoad() {
		imageLoaded = true;
	}

	const showPlaceholder = $derived(!src || imageError);
</script>

{#if showPlaceholder}
	<div
		class="placeholder-image {className}"
		style="aspect-ratio: {aspectRatio};"
		role="img"
		aria-label={alt}
	>
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect width="100" height="100" fill="var(--color-surface-alt, #f5f5f5)" />
			<path
				d="M35 65 L50 45 L65 65 M42 58 L50 48 L58 58"
				stroke="var(--color-text-muted, #999)"
				stroke-width="2"
				fill="none"
			/>
			<circle cx="35" cy="35" r="8" fill="var(--color-text-muted, #999)" opacity="0.5" />
		</svg>
		<span class="placeholder-text">{alt}</span>
	</div>
{:else}
	<img
		{src}
		{alt}
		{width}
		{height}
		loading="lazy"
		class="{className} {imageLoaded ? 'loaded' : 'loading'}"
		onerror={handleError}
		onload={handleLoad}
	/>
{/if}

<style>
	.placeholder-image {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--color-surface-alt, #f5f5f5);
		border-radius: var(--radius-md, 8px);
		overflow: hidden;
		position: relative;
	}

	.placeholder-image svg {
		width: 50%;
		max-width: 120px;
		height: auto;
		opacity: 0.6;
	}

	.placeholder-text {
		position: absolute;
		bottom: 1rem;
		left: 1rem;
		right: 1rem;
		text-align: center;
		font-size: 0.875rem;
		color: var(--color-text-muted, #666);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	img {
		display: block;
		max-width: 100%;
		height: auto;
		transition: opacity 0.3s ease;
	}

	img.loading {
		opacity: 0;
	}

	img.loaded {
		opacity: 1;
	}
</style>
