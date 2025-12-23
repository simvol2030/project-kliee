<script lang="ts">
	import type { Testimonial } from '$lib/types/homepage';
	import type { LanguageCode } from '$lib/types/layout.types';

	interface Props {
		testimonial: Testimonial;
		locale: LanguageCode;
	}

	let { testimonial, locale }: Props = $props();
</script>

<article class="testimonial-card">
	<div class="testimonial-card__quote-icon" aria-hidden="true">"</div>

	<blockquote class="testimonial-card__quote">
		{testimonial.quote[locale]}
	</blockquote>

	<footer class="testimonial-card__author">
		<div class="testimonial-card__author-name">{testimonial.author.name}</div>
		<div class="testimonial-card__author-title">{testimonial.author.title[locale]}</div>
	</footer>
</article>

<style>
	.testimonial-card {
		position: relative;
		padding: var(--spacing-2xl);
		background: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		transition: all var(--transition-base);
	}

	.testimonial-card:hover {
		border-color: var(--accent);
		box-shadow: var(--shadow-md);
		transform: translateY(-4px);
	}

	.testimonial-card__quote-icon {
		position: absolute;
		top: var(--spacing-lg);
		left: var(--spacing-lg);
		font-size: 80px;
		font-family: var(--font-heading);
		color: var(--accent);
		opacity: 0.15;
		line-height: 1;
		pointer-events: none;
	}

	.testimonial-card__quote {
		position: relative;
		font-size: var(--font-size-lg);
		font-style: italic;
		color: var(--text-primary);
		line-height: var(--line-height-relaxed);
		margin: 0 0 var(--spacing-xl) 0;
		z-index: 1;
	}

	.testimonial-card__author {
		border-top: 2px solid var(--border-primary);
		padding-top: var(--spacing-md);
	}

	.testimonial-card__author-name {
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: 4px;
	}

	.testimonial-card__author-title {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.testimonial-card {
			padding: var(--spacing-xl);
		}

		.testimonial-card__quote-icon {
			font-size: 60px;
			top: var(--spacing-md);
			left: var(--spacing-md);
		}

		.testimonial-card__quote {
			font-size: var(--font-size-base);
			margin-bottom: var(--spacing-lg);
		}

		.testimonial-card__author-name {
			font-size: var(--font-size-base);
		}

		.testimonial-card__author-title {
			font-size: var(--font-size-xs);
		}
	}
</style>
