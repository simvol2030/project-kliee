<script lang="ts">
	import type { HeroSection } from '$lib/types/homepage';
	import type { LanguageCode } from '$lib/types/layout.types';

	interface Props {
		data: HeroSection;
		locale: LanguageCode;
	}

	let { data, locale }: Props = $props();

	// State
	let currentSlide = $state(0);
	let isPaused = $state(false);

	// Derived
	let currentImage = $derived(data.slides[currentSlide]);

	// Constant to avoid circular dependency in $effect
	const slidesCount = data.slides.length;

	// Auto-advance effect
	$effect(() => {
		const interval = setInterval(() => {
			// Check if paused (reads reactive state safely on each tick)
			if (isPaused) return;

			// Update currentSlide directly (no local variable needed)
			currentSlide = (currentSlide + 1) % slidesCount;
		}, 4000);

		return () => clearInterval(interval);
	});

	function goToSlide(index: number) {
		currentSlide = index;
	}

	function handleMouseEnter() {
		isPaused = true;
	}

	function handleMouseLeave() {
		isPaused = false;
	}
</script>

<section
	class="hero"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	aria-label="Hero section"
>
	<!-- Background Image Slider -->
	<div class="hero__slider">
		{#each data.slides as slide, index}
			<div class="hero__slide" class:active={index === currentSlide}>
				<img src={slide.image} alt={slide.alt[locale]} loading={index === 0 ? 'eager' : 'lazy'} />
			</div>
		{/each}
	</div>

	<!-- Overlay Gradient -->
	<div class="hero__overlay"></div>

	<!-- Content -->
	<div class="hero__content">
		<h1 class="hero__title">{data.title[locale]}</h1>
		<p class="hero__subtitle">{data.subtitle[locale]}</p>
		<blockquote class="hero__quote">{data.quote[locale]}</blockquote>

		<!-- Announcement Banner -->
		{#if data.announcement}
			<a href={data.announcement.link || '#'} class="hero__announcement">
				<span class="hero__announcement-highlight">{data.announcement.highlight[locale]}</span>
				<span class="hero__announcement-text">{data.announcement.text[locale]}</span>
			</a>
		{/if}

		<!-- Slide Indicators -->
		<div class="hero__indicators" role="group" aria-label="Slide navigation">
			{#each data.slides as _, index}
				<button
					class="hero__indicator"
					class:active={index === currentSlide}
					onclick={() => goToSlide(index)}
					aria-label="Go to slide {index + 1}"
					aria-current={index === currentSlide ? 'true' : 'false'}
				></button>
			{/each}
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero__slider {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}

	.hero__slide {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 1000ms ease-in-out;
		pointer-events: none;
	}

	.hero__slide.active {
		opacity: 1;
		pointer-events: auto;
	}

	.hero__slide img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.hero__overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.6) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			rgba(0, 0, 0, 0.7) 100%
		);
		z-index: 2;
	}

	.dark .hero__overlay {
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.8) 0%,
			rgba(0, 0, 0, 0.5) 50%,
			rgba(0, 0, 0, 0.85) 100%
		);
	}

	.hero__content {
		position: relative;
		z-index: 3;
		text-align: center;
		color: var(--white);
		padding: var(--spacing-xl);
		max-width: 1200px;
	}

	.hero__title {
		font-size: clamp(32px, 8vw, 120px);
		font-family: var(--font-heading);
		font-weight: 700;
		letter-spacing: -0.03em;
		margin-bottom: var(--spacing-lg);
		text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
		color: var(--white);
	}

	/* Запрет переноса на средних и больших экранах */
	@media (min-width: 500px) {
		.hero__title {
			white-space: nowrap;
		}
	}

	.hero__subtitle {
		font-size: 28px;
		font-weight: 300;
		margin-bottom: var(--spacing-xl);
		text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
		color: var(--white);
	}

	.hero__quote {
		font-size: 22px;
		font-family: var(--font-heading);
		font-style: italic;
		margin-bottom: var(--spacing-2xl);
		color: var(--accent-light);
		text-shadow: 1px 1px 6px rgba(0, 0, 0, 0.9);
	}

	.hero__announcement {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-xl);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-radius: var(--radius-full);
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all var(--transition-base);
		text-decoration: none;
		margin-bottom: var(--spacing-2xl);
	}

	.hero__announcement:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
		transform: translateY(-2px);
	}

	.hero__announcement-highlight {
		display: inline-block;
		padding: 4px 12px;
		background: crimson;
		color: var(--white);
		border-radius: var(--radius-full);
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.dark .hero__announcement-highlight {
		background: #ff6b6b;
	}

	.hero__announcement-text {
		color: var(--white);
		font-size: 16px;
		font-weight: 500;
	}

	.hero__indicators {
		display: flex;
		gap: var(--spacing-sm);
		justify-content: center;
		margin-top: var(--spacing-xl);
	}

	.hero__indicator {
		width: 12px;
		height: 12px;
		border-radius: var(--radius-full);
		background: rgba(255, 255, 255, 0.3);
		border: none;
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.hero__indicator:hover {
		background: rgba(255, 255, 255, 0.5);
		transform: scale(1.2);
	}

	.hero__indicator.active {
		background: var(--accent-light);
		width: 32px;
	}

	.hero__indicator:focus-visible {
		outline: 2px solid var(--accent-light);
		outline-offset: 4px;
	}

	/* Tablet */
	@media (max-width: 1024px) {
		.hero__subtitle {
			font-size: 24px;
		}

		.hero__quote {
			font-size: 20px;
		}
	}

	/* Mobile */
	@media (max-width: 768px) {
		.hero {
			height: 60vh;
			min-height: 500px;
		}

		.hero__content {
			padding-top: calc(80px + var(--spacing-xl)); /* Add spacing below sticky header */
		}

		.hero__subtitle {
			font-size: 18px;
		}

		.hero__quote {
			font-size: 18px;
			margin-bottom: var(--spacing-lg);
		}

		.hero__announcement {
			flex-direction: column;
			gap: var(--spacing-xs);
			padding: var(--spacing-md);
		}

		.hero__announcement-text {
			font-size: 14px;
			text-align: center;
		}
	}
</style>
