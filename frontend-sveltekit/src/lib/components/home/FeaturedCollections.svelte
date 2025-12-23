<script lang="ts">
	import type { FeaturedCollectionsSection } from '$lib/types/homepage';
	import type { LanguageCode } from '$lib/types/layout.types';
	import CollectionCard from './CollectionCard.svelte';

	interface Props {
		data: FeaturedCollectionsSection;
		locale: LanguageCode;
	}

	let { data, locale }: Props = $props();
</script>

<section class="featured-collections" aria-labelledby="featured-collections-title">
	<div class="container">
		<div class="featured-collections__header">
			<h2 id="featured-collections-title" class="featured-collections__title">
				{data.title[locale]}
			</h2>
			<p class="featured-collections__subtitle">{data.subtitle[locale]}</p>
		</div>

		<div class="featured-collections__grid">
			{#each data.collections as collection (collection.id)}
				<CollectionCard {collection} {locale} />
			{/each}
		</div>
	</div>
</section>

<style>
	.featured-collections {
		padding: var(--spacing-3xl) 0;
		background: var(--bg-primary);
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--spacing-xl);
	}

	.featured-collections__header {
		text-align: center;
		margin-bottom: var(--spacing-3xl);
	}

	.featured-collections__title {
		font-size: var(--font-size-4xl);
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: var(--spacing-md);
		letter-spacing: -0.02em;
	}

	.featured-collections__subtitle {
		font-size: var(--font-size-xl);
		color: var(--text-secondary);
		max-width: 800px;
		margin: 0 auto;
		line-height: var(--line-height-relaxed);
	}

	.featured-collections__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: var(--spacing-xl);
	}

	@media (max-width: 1024px) {
		.featured-collections__grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-lg);
		}
	}

	@media (max-width: 768px) {
		.featured-collections {
			padding: var(--spacing-2xl) 0;
		}

		.featured-collections__header {
			margin-bottom: var(--spacing-2xl);
		}

		.featured-collections__title {
			font-size: var(--font-size-3xl);
		}

		.featured-collections__subtitle {
			font-size: var(--font-size-lg);
		}

		.featured-collections__grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}
	}
</style>
