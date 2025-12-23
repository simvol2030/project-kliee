<script lang="ts">
	import type { ProcessStep } from '$lib/types/homepage';
	import type { LanguageCode } from '$lib/types/layout.types';

	interface Props {
		step: ProcessStep;
		index: number;
		locale: LanguageCode;
	}

	let { step, index, locale }: Props = $props();
</script>

<article class="process-card">
	<div class="process-card__image-wrapper">
		<img
			src={step.image}
			alt={step.title[locale]}
			loading="lazy"
			class="process-card__image"
		/>
		<div class="process-card__step-number" aria-label="Step {index + 1}">
			{index + 1}
		</div>
	</div>

	<div class="process-card__content">
		<h3 class="process-card__title">{step.title[locale]}</h3>
		<p class="process-card__description">{step.description[locale]}</p>
	</div>
</article>

<style>
	.process-card {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		transition: transform var(--transition-base);
	}

	.process-card:hover {
		transform: translateY(-4px);
	}

	.process-card__image-wrapper {
		position: relative;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-md);
	}

	.process-card__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transition: transform var(--transition-slow);
	}

	.process-card:hover .process-card__image {
		transform: scale(1.05);
	}

	.process-card__step-number {
		position: absolute;
		top: var(--spacing-lg);
		left: var(--spacing-lg);
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--accent);
		color: var(--white);
		border-radius: var(--radius-full);
		font-size: var(--font-size-2xl);
		font-family: var(--font-heading);
		font-weight: 700;
		box-shadow: var(--shadow-lg);
	}

	.process-card__content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.process-card__title {
		font-size: var(--font-size-2xl);
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.process-card__description {
		font-size: var(--font-size-base);
		color: var(--text-secondary);
		line-height: var(--line-height-relaxed);
		margin: 0;
	}

	@media (max-width: 768px) {
		.process-card__step-number {
			width: 50px;
			height: 50px;
			font-size: var(--font-size-xl);
			top: var(--spacing-md);
			left: var(--spacing-md);
		}

		.process-card__title {
			font-size: var(--font-size-xl);
		}

		.process-card__description {
			font-size: var(--font-size-sm);
		}
	}
</style>
