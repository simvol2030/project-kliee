<script lang="ts">
	import type { ProcessSection } from '$lib/types/homepage';
	import type { LanguageCode } from '$lib/types/layout.types';
	import ProcessCard from './ProcessCard.svelte';

	interface Props {
		data: ProcessSection;
		locale: LanguageCode;
	}

	let { data, locale }: Props = $props();
</script>

<section class="process-grid" aria-labelledby="process-title">
	<div class="container">
		<h2 id="process-title" class="process-grid__title">{data.title[locale]}</h2>

		<div class="process-grid__items">
			{#each data.steps as step, index (step.id)}
				<ProcessCard {step} {index} {locale} />
			{/each}
		</div>
	</div>
</section>

<style>
	.process-grid {
		padding: var(--spacing-3xl) 0;
		background: var(--bg-primary);
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--spacing-xl);
	}

	.process-grid__title {
		font-size: var(--font-size-4xl);
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text-primary);
		text-align: center;
		margin-bottom: var(--spacing-3xl);
		letter-spacing: -0.02em;
	}

	.process-grid__items {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-2xl);
	}

	@media (max-width: 1024px) {
		.process-grid__items {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-xl);
		}
	}

	@media (max-width: 768px) {
		.process-grid {
			padding: var(--spacing-2xl) 0;
		}

		.process-grid__title {
			font-size: var(--font-size-3xl);
			margin-bottom: var(--spacing-2xl);
		}

		.process-grid__items {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}
	}
</style>
