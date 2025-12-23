<script lang="ts">
	import type { NewsItem } from '$lib/types/homepage';
	import type { LanguageCode } from '$lib/types/layout.types';

	interface Props {
		item: NewsItem;
		locale: LanguageCode;
	}

	let { item, locale }: Props = $props();
</script>

{#if item.link}
	<a href={item.link} class="news-card">
		<div class="news-card__date-badge">{item.date}</div>
		<h3 class="news-card__title">{item.title[locale]}</h3>
		<p class="news-card__excerpt">{item.excerpt[locale]}</p>
		<span class="news-card__read-more">
			{locale === 'en'
				? 'Read more'
				: locale === 'ru'
					? 'Читать далее'
					: locale === 'es'
						? 'Leer más'
						: '阅读更多'}
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<line x1="5" y1="12" x2="19" y2="12"></line>
				<polyline points="12 5 19 12 12 19"></polyline>
			</svg>
		</span>
	</a>
{:else}
	<article class="news-card news-card--static">
		<div class="news-card__date-badge">{item.date}</div>
		<h3 class="news-card__title">{item.title[locale]}</h3>
		<p class="news-card__excerpt">{item.excerpt[locale]}</p>
	</article>
{/if}

<style>
	.news-card {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		padding: var(--spacing-xl);
		background: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: all var(--transition-base);
	}

	.news-card:hover {
		border-color: var(--accent);
		box-shadow: var(--shadow-md);
		transform: translateY(-4px);
	}

	.news-card:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: 4px;
	}

	.news-card--static {
		cursor: default;
	}

	.news-card--static:hover {
		border-color: var(--border-primary);
		transform: none;
	}

	.news-card__date-badge {
		display: inline-block;
		padding: 4px 12px;
		background: var(--accent);
		color: var(--white);
		border-radius: var(--radius-full);
		font-size: var(--font-size-sm);
		font-weight: 600;
		align-self: flex-start;
	}

	.news-card__title {
		font-size: var(--font-size-xl);
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		letter-spacing: -0.01em;
		line-height: var(--line-height-tight);
	}

	.news-card__excerpt {
		font-size: var(--font-size-base);
		color: var(--text-secondary);
		line-height: var(--line-height-relaxed);
		margin: 0;
		flex-grow: 1;
	}

	.news-card__read-more {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--accent);
		font-size: var(--font-size-sm);
		font-weight: 600;
		transition: all var(--transition-base);
	}

	.news-card:hover .news-card__read-more {
		color: var(--accent-dark);
		gap: var(--spacing-sm);
	}

	.news-card__read-more svg {
		transition: transform var(--transition-base);
	}

	.news-card:hover .news-card__read-more svg {
		transform: translateX(4px);
	}

	@media (max-width: 768px) {
		.news-card {
			padding: var(--spacing-lg);
		}

		.news-card__title {
			font-size: var(--font-size-lg);
		}

		.news-card__excerpt {
			font-size: var(--font-size-sm);
		}
	}
</style>
