<script lang="ts">
	import type { NewsSection } from '$lib/types/homepage';
	import type { LanguageCode } from '$lib/types/layout.types';
	import NewsCard from './NewsCard.svelte';

	interface Props {
		data: NewsSection;
		locale: LanguageCode;
	}

	let { data, locale }: Props = $props();
</script>

<section class="news-grid" aria-labelledby="news-title">
	<div class="container">
		<h2 id="news-title" class="news-grid__title">{data.title[locale]}</h2>

		<div class="news-grid__items">
			{#each data.items as item (item.id)}
				<NewsCard {item} {locale} />
			{/each}
		</div>
	</div>
</section>

<style>
	.news-grid {
		padding: var(--spacing-3xl) 0;
		background: var(--bg-secondary);
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--spacing-xl);
	}

	.news-grid__title {
		font-size: var(--font-size-4xl);
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text-primary);
		text-align: center;
		margin-bottom: var(--spacing-3xl);
		letter-spacing: -0.02em;
	}

	.news-grid__items {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-xl);
	}

	@media (max-width: 1024px) {
		.news-grid__items {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-lg);
		}
	}

	@media (max-width: 768px) {
		.news-grid {
			padding: var(--spacing-2xl) 0;
		}

		.news-grid__title {
			font-size: var(--font-size-3xl);
			margin-bottom: var(--spacing-2xl);
		}

		.news-grid__items {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}
	}
</style>
