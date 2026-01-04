<script lang="ts">
	import type { AboutSection } from '$lib/types/homepage';
	import type { LanguageCode } from '$lib/types/layout.types';

	interface Props {
		data: AboutSection;
		locale: LanguageCode;
	}

	let { data, locale }: Props = $props();
</script>

<section class="about-preview" aria-labelledby="about-preview-title">
	<div class="container">
		<div class="about-preview__grid">
			<!-- Image Column -->
			<div class="about-preview__image-wrapper">
				<img
					src={data.image}
					alt={data.imageAlt[locale]}
					loading="lazy"
					class="about-preview__image"
				/>
			</div>

			<!-- Text Column -->
			<div class="about-preview__content">
				<h2 id="about-preview-title" class="about-preview__title">{data.title[locale]}</h2>

				<div class="about-preview__text">
					{#each data.paragraphs as paragraph}
						<p>{paragraph[locale]}</p>
					{/each}
				</div>

				<a href="/{locale}{data.ctaLink}" class="about-preview__cta">
					{data.ctaText[locale]}
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<line x1="5" y1="12" x2="19" y2="12"></line>
						<polyline points="12 5 19 12 12 19"></polyline>
					</svg>
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.about-preview {
		padding: var(--spacing-3xl) 0;
		background: var(--bg-primary);
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--spacing-xl);
	}

	.about-preview__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-3xl);
		align-items: center;
	}

	.about-preview__image-wrapper {
		position: relative;
		aspect-ratio: 3 / 4;
		overflow: hidden;
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
	}

	.about-preview__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transition: transform var(--transition-slow);
	}

	.about-preview__image-wrapper:hover .about-preview__image {
		transform: scale(1.05);
	}

	.about-preview__content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.about-preview__title {
		font-size: var(--font-size-4xl);
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.02em;
		margin: 0;
	}

	.about-preview__text {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.about-preview__text p {
		font-size: var(--font-size-lg);
		color: var(--text-secondary);
		line-height: var(--line-height-relaxed);
		margin: 0;
	}

	.about-preview__cta {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-xl);
		background: var(--accent);
		color: var(--white);
		border-radius: var(--radius-lg);
		font-size: var(--font-size-base);
		font-weight: 600;
		text-decoration: none;
		align-self: flex-start;
		transition: all var(--transition-base);
	}

	.about-preview__cta:hover {
		background: var(--accent-dark);
		transform: translateX(4px);
	}

	.about-preview__cta svg {
		transition: transform var(--transition-base);
	}

	.about-preview__cta:hover svg {
		transform: translateX(4px);
	}

	.about-preview__cta:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: 4px;
	}

	@media (max-width: 1024px) {
		.about-preview__grid {
			gap: var(--spacing-2xl);
		}

		.about-preview__title {
			font-size: var(--font-size-3xl);
		}

		.about-preview__text p {
			font-size: var(--font-size-base);
		}
	}

	@media (max-width: 768px) {
		.about-preview {
			padding: var(--spacing-2xl) 0;
		}

		.about-preview__grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}

		.about-preview__image-wrapper {
			aspect-ratio: 3 / 2;
		}

		.about-preview__title {
			font-size: var(--font-size-2xl);
		}

		.about-preview__text {
			gap: var(--spacing-md);
		}

		.about-preview__text p {
			font-size: var(--font-size-base);
		}

		.about-preview__cta {
			width: 100%;
			justify-content: center;
		}
	}
</style>
