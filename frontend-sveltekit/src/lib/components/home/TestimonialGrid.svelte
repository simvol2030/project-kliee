<script lang="ts">
	import type { TestimonialsSection } from '$lib/types/homepage';
	import type { LanguageCode } from '$lib/types/layout.types';
	import TestimonialCard from './TestimonialCard.svelte';

	interface Props {
		data: TestimonialsSection;
		locale: LanguageCode;
	}

	let { data, locale }: Props = $props();
</script>

<section class="testimonial-grid" aria-labelledby="testimonials-title">
	<div class="container">
		<h2 id="testimonials-title" class="testimonial-grid__title">{data.title[locale]}</h2>

		<div class="testimonial-grid__items">
			{#each data.testimonials as testimonial (testimonial.id)}
				<TestimonialCard {testimonial} {locale} />
			{/each}
		</div>
	</div>
</section>

<style>
	.testimonial-grid {
		padding: var(--spacing-3xl) 0;
		background: var(--bg-secondary);
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--spacing-xl);
	}

	.testimonial-grid__title {
		font-size: var(--font-size-4xl);
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text-primary);
		text-align: center;
		margin-bottom: var(--spacing-3xl);
		letter-spacing: -0.02em;
	}

	.testimonial-grid__items {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-xl);
	}

	@media (max-width: 1024px) {
		.testimonial-grid__items {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-lg);
		}
	}

	@media (max-width: 768px) {
		.testimonial-grid {
			padding: var(--spacing-2xl) 0;
		}

		.testimonial-grid__title {
			font-size: var(--font-size-3xl);
			margin-bottom: var(--spacing-2xl);
		}

		.testimonial-grid__items {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}
	}
</style>
