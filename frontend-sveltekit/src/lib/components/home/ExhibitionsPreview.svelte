<script lang="ts">
	import type { ExhibitionsSection } from '$lib/types/homepage';
	import type { LanguageCode } from '$lib/types/layout.types';

	interface Props {
		data: ExhibitionsSection;
		locale: LanguageCode;
	}

	let { data, locale }: Props = $props();

	// Format date range display
	let dateDisplay = $derived(() => {
		if (!data.featured) return '';

		const start = new Date(data.featured.dateRange.start).toLocaleDateString(locale, {
			month: 'long',
			year: 'numeric'
		});

		if (!data.featured.dateRange.end) {
			return locale === 'en'
				? `${start} - Ongoing`
				: locale === 'ru'
					? `${start} - Продолжается`
					: locale === 'es'
						? `${start} - En curso`
						: `${start} - 进行中`;
		}

		const end = new Date(data.featured.dateRange.end).toLocaleDateString(locale, {
			month: 'long',
			year: 'numeric'
		});
		return `${start} - ${end}`;
	});

	// Status badge text
	let statusText = $derived(() => {
		if (!data.featured) return '';

		const status = data.featured.status;
		if (locale === 'en') {
			return status === 'current'
				? 'Current'
				: status === 'upcoming'
					? 'Upcoming'
					: 'Past';
		} else if (locale === 'ru') {
			return status === 'current'
				? 'Текущая'
				: status === 'upcoming'
					? 'Предстоящая'
					: 'Прошедшая';
		} else if (locale === 'es') {
			return status === 'current'
				? 'Actual'
				: status === 'upcoming'
					? 'Próxima'
					: 'Pasada';
		} else {
			return status === 'current' ? '当前' : status === 'upcoming' ? '即将' : '过去';
		}
	});
</script>

<section class="exhibitions" aria-labelledby="exhibitions-title">
	<div class="container">
		<div class="exhibitions__header">
			<h2 id="exhibitions-title" class="exhibitions__title">{data.title[locale]}</h2>
			<p class="exhibitions__subtitle">{data.subtitle[locale]}</p>
		</div>

		{#if data.featured}
			<div class="exhibition-featured">
				<a href="/{locale}{data.featured.link}" class="exhibition-featured__link">
					<div class="exhibition-featured__image-wrapper">
						<img
							src={data.featured.coverImage}
							alt={data.featured.title[locale]}
							loading="lazy"
							class="exhibition-featured__image"
						/>
						<div class="exhibition-featured__overlay"></div>

						<span class="exhibition-featured__status exhibition-featured__status--{data.featured.status}">
							{statusText()}
						</span>
					</div>

					<div class="exhibition-featured__content">
						<h3 class="exhibition-featured__title">{data.featured.title[locale]}</h3>
						<p class="exhibition-featured__description">{data.featured.description[locale]}</p>

						<div class="exhibition-featured__meta">
							<div class="exhibition-featured__meta-item">
								<svg
									class="exhibition-featured__icon"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									aria-hidden="true"
								>
									<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
									<circle cx="12" cy="10" r="3"></circle>
								</svg>
								<span>{data.featured.location[locale]}</span>
							</div>

							<div class="exhibition-featured__meta-item">
								<svg
									class="exhibition-featured__icon"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									aria-hidden="true"
								>
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
									<line x1="16" y1="2" x2="16" y2="6"></line>
									<line x1="8" y1="2" x2="8" y2="6"></line>
									<line x1="3" y1="10" x2="21" y2="10"></line>
								</svg>
								<span>{dateDisplay()}</span>
							</div>

							<div class="exhibition-featured__meta-item">
								<svg
									class="exhibition-featured__icon"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									aria-hidden="true"
								>
									<rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
									<polyline points="17 2 12 7 7 2"></polyline>
								</svg>
								<span>{data.featured.workCount} {locale === 'en' ? 'works' : locale === 'ru' ? 'работ' : locale === 'es' ? 'obras' : '作品'}</span>
							</div>
						</div>
					</div>
				</a>

				<div class="exhibition-featured__footer">
					<a href="/{locale}{data.viewAllLink}" class="exhibition-featured__view-all">
						{locale === 'en'
							? 'View All Exhibitions'
							: locale === 'ru'
								? 'Все выставки'
								: locale === 'es'
									? 'Ver todas las exposiciones'
									: '查看所有展览'}
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
		{/if}
	</div>
</section>

<style>
	.exhibitions {
		padding: var(--spacing-3xl) 0;
		background: var(--bg-secondary);
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--spacing-xl);
	}

	.exhibitions__header {
		text-align: center;
		margin-bottom: var(--spacing-3xl);
	}

	.exhibitions__title {
		font-size: var(--font-size-4xl);
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: var(--spacing-md);
		letter-spacing: -0.02em;
	}

	.exhibitions__subtitle {
		font-size: var(--font-size-xl);
		color: var(--text-secondary);
		max-width: 800px;
		margin: 0 auto;
		line-height: var(--line-height-relaxed);
	}

	.exhibition-featured {
		background: var(--bg-primary);
		border-radius: var(--radius-xl);
		overflow: hidden;
		box-shadow: var(--shadow-lg);
		transition: all var(--transition-base);
	}

	.exhibition-featured:hover {
		box-shadow: var(--shadow-xl);
		transform: translateY(-4px);
	}

	.exhibition-featured__link {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-2xl);
		text-decoration: none;
		color: inherit;
	}

	.exhibition-featured__image-wrapper {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
	}

	.exhibition-featured__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transition: transform var(--transition-slow);
	}

	.exhibition-featured__link:hover .exhibition-featured__image {
		transform: scale(1.05);
	}

	.exhibition-featured__overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
		pointer-events: none;
	}

	.exhibition-featured__status {
		position: absolute;
		top: var(--spacing-lg);
		right: var(--spacing-lg);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-full);
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.exhibition-featured__status--current {
		background: rgba(34, 197, 94, 0.9);
		color: var(--white);
	}

	.exhibition-featured__status--upcoming {
		background: rgba(59, 130, 246, 0.9);
		color: var(--white);
	}

	.exhibition-featured__status--past {
		background: rgba(156, 163, 175, 0.9);
		color: var(--white);
	}

	.exhibition-featured__content {
		padding: var(--spacing-2xl);
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.exhibition-featured__title {
		font-size: var(--font-size-3xl);
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: var(--spacing-md);
		letter-spacing: -0.01em;
	}

	.exhibition-featured__description {
		font-size: var(--font-size-lg);
		color: var(--text-secondary);
		line-height: var(--line-height-relaxed);
		margin-bottom: var(--spacing-xl);
	}

	.exhibition-featured__meta {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.exhibition-featured__meta-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: var(--font-size-base);
		color: var(--text-secondary);
	}

	.exhibition-featured__icon {
		color: var(--accent);
		flex-shrink: 0;
	}

	.exhibition-featured__footer {
		padding: var(--spacing-xl) var(--spacing-2xl);
		border-top: 1px solid var(--border-primary);
		text-align: center;
	}

	.exhibition-featured__view-all {
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
		transition: all var(--transition-base);
	}

	.exhibition-featured__view-all:hover {
		background: var(--accent-dark);
		transform: translateX(4px);
	}

	.exhibition-featured__view-all svg {
		transition: transform var(--transition-base);
	}

	.exhibition-featured__view-all:hover svg {
		transform: translateX(4px);
	}

	@media (max-width: 1024px) {
		.exhibition-featured__link {
			grid-template-columns: 1fr;
			gap: 0;
		}

		.exhibition-featured__content {
			padding: var(--spacing-xl);
		}

		.exhibition-featured__title {
			font-size: var(--font-size-2xl);
		}
	}

	@media (max-width: 768px) {
		.exhibitions {
			padding: var(--spacing-2xl) 0;
		}

		.exhibitions__header {
			margin-bottom: var(--spacing-2xl);
		}

		.exhibitions__title {
			font-size: var(--font-size-3xl);
		}

		.exhibitions__subtitle {
			font-size: var(--font-size-lg);
		}

		.exhibition-featured__content {
			padding: var(--spacing-lg);
		}

		.exhibition-featured__title {
			font-size: var(--font-size-xl);
		}

		.exhibition-featured__description {
			font-size: var(--font-size-base);
		}

		.exhibition-featured__footer {
			padding: var(--spacing-lg);
		}
	}
</style>
