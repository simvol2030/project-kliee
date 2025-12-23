<script lang="ts">
	import type { WorkCollection } from '$lib/types/homepage';
	import type { LanguageCode } from '$lib/types/layout.types';

	interface Props {
		collection: WorkCollection;
		locale: LanguageCode;
	}

	let { collection, locale }: Props = $props();
</script>

<a href={collection.link} class="collection-card">
	<div class="collection-card__image-wrapper">
		<img
			src={collection.coverImage}
			alt={collection.title[locale]}
			loading="lazy"
			class="collection-card__image"
		/>
		<div class="collection-card__overlay"></div>
	</div>

	<div class="collection-card__content">
		<h3 class="collection-card__title">{collection.title[locale]}</h3>
		<p class="collection-card__description">{collection.description[locale]}</p>
	</div>
</a>

<style>
	.collection-card {
		position: relative;
		display: block;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--bg-secondary);
		transition: all var(--transition-base);
		text-decoration: none;
		aspect-ratio: 2 / 3;
	}

	.collection-card:hover {
		transform: translateY(-8px);
		box-shadow: var(--shadow-xl);
	}

	.collection-card:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: 4px;
	}

	.collection-card__image-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.collection-card__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transition: transform var(--transition-slow);
	}

	.collection-card:hover .collection-card__image {
		transform: scale(1.1);
	}

	.collection-card__overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 60%);
		opacity: 0.8;
		transition: opacity var(--transition-base);
	}

	.collection-card:hover .collection-card__overlay {
		opacity: 1;
	}

	.collection-card__content {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: var(--spacing-xl);
		color: var(--white);
		transform: translateY(0);
		transition: transform var(--transition-base);
	}

	.collection-card:hover .collection-card__content {
		transform: translateY(-8px);
	}

	.collection-card__title {
		font-family: var(--font-heading);
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--white);
		margin-bottom: var(--spacing-sm);
		letter-spacing: -0.01em;
	}

	.collection-card__description {
		font-size: var(--font-size-base);
		color: rgba(255, 255, 255, 0.9);
		line-height: var(--line-height-relaxed);
		margin: 0;
		opacity: 0;
		transform: translateY(10px);
		transition:
			opacity var(--transition-base),
			transform var(--transition-base);
	}

	.collection-card:hover .collection-card__description {
		opacity: 1;
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.collection-card__title {
			font-size: var(--font-size-xl);
		}

		.collection-card__description {
			font-size: var(--font-size-sm);
		}

		.collection-card__content {
			padding: var(--spacing-lg);
		}
	}
</style>
