<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { LanguageCode } from '$lib/types/layout.types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as LanguageCode) || 'en');

	// Use $derived for reactive data when URL params change
	const artworks = $derived(data.artworks);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);
	const options = $derived(data.options);

	// Current URL for canonical
	const currentUrl = $derived($page.url.href);
	const baseUrl = $derived($page.url.origin);

	// Alternate language URLs
	const alternateUrls = $derived({
		en: `${baseUrl}/en/catalog`,
		ru: `${baseUrl}/ru/catalog`,
		es: `${baseUrl}/es/catalog`,
		zh: `${baseUrl}/zh/catalog`
	});

	// Labels
	const labels = {
		title: {
			en: 'Catalog',
			ru: 'Каталог',
			es: 'Catálogo',
			zh: '目录'
		},
		subtitle: {
			en: 'Browse the complete collection of artworks',
			ru: 'Просмотрите полную коллекцию работ',
			es: 'Explore la colección completa de obras',
			zh: '浏览完整的艺术品收藏'
		},
		search: {
			en: 'Search artworks...',
			ru: 'Поиск работ...',
			es: 'Buscar obras...',
			zh: '搜索作品...'
		},
		allSeries: {
			en: 'All Series',
			ru: 'Все серии',
			es: 'Todas las series',
			zh: '所有系列'
		},
		allYears: {
			en: 'All Years',
			ru: 'Все годы',
			es: 'Todos los años',
			zh: '所有年份'
		},
		availableOnly: {
			en: 'Available only',
			ru: 'Только доступные',
			es: 'Solo disponibles',
			zh: '仅显示可购买'
		},
		clearFilters: {
			en: 'Clear filters',
			ru: 'Сбросить фильтры',
			es: 'Borrar filtros',
			zh: '清除筛选'
		},
		noResults: {
			en: 'No artworks found',
			ru: 'Работы не найдены',
			es: 'No se encontraron obras',
			zh: '未找到作品'
		},
		showing: {
			en: 'Showing',
			ru: 'Показано',
			es: 'Mostrando',
			zh: '显示'
		},
		of: {
			en: 'of',
			ru: 'из',
			es: 'de',
			zh: '共'
		},
		artworks: {
			en: 'artworks',
			ru: 'работ',
			es: 'obras',
			zh: '件作品'
		},
		previous: {
			en: 'Previous',
			ru: 'Назад',
			es: 'Anterior',
			zh: '上一页'
		},
		next: {
			en: 'Next',
			ru: 'Далее',
			es: 'Siguiente',
			zh: '下一页'
		},
		available: {
			en: 'Available',
			ru: 'Доступно',
			es: 'Disponible',
			zh: '可购买'
		},
		sold: {
			en: 'Sold',
			ru: 'Продано',
			es: 'Vendido',
			zh: '已售'
		}
	};

	// Local state for search input
	let searchInput = $state(filters.search);

	// Update URL with filters
	function updateFilters(newFilters: Record<string, string | boolean>) {
		const params = new URLSearchParams();

		const finalFilters = { ...filters, ...newFilters };

		if (finalFilters.search) params.set('q', finalFilters.search);
		if (finalFilters.series) params.set('series', finalFilters.series);
		if (finalFilters.year) params.set('year', finalFilters.year);
		if (finalFilters.available) params.set('available', 'true');
		// Reset to page 1 when filters change
		params.delete('page');

		const queryString = params.toString();
		goto(`/${locale}/catalog${queryString ? `?${queryString}` : ''}`, { replaceState: true });
	}

	function handleSearch(event: Event) {
		event.preventDefault();
		updateFilters({ search: searchInput });
	}

	function handleSeriesChange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		updateFilters({ series: value });
	}

	function handleYearChange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		updateFilters({ year: value });
	}

	function handleAvailableChange(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		updateFilters({ available: checked });
	}

	function clearFilters() {
		searchInput = '';
		goto(`/${locale}/catalog`, { replaceState: true });
	}

	function goToPage(pageNum: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', pageNum.toString());
		goto(`/${locale}/catalog?${params.toString()}`);
	}

	// Check if any filters are active
	const hasActiveFilters = $derived(
		filters.search || filters.series || filters.year || filters.available
	);

	// SEO
	const seoTitle = $derived(`${labels.title[locale]} | Svetlana K-LIEE`);
	const seoDescription = $derived(labels.subtitle[locale]);
</script>

<svelte:head>
	<title>{seoTitle}</title>
	<meta name="description" content={seoDescription} />
	<link rel="canonical" href={currentUrl} />
	<link rel="alternate" href={alternateUrls.en} hreflang="en" />
	<link rel="alternate" href={alternateUrls.ru} hreflang="ru" />
	<link rel="alternate" href={alternateUrls.es} hreflang="es" />
	<link rel="alternate" href={alternateUrls.zh} hreflang="zh" />
	<link rel="alternate" href={alternateUrls.en} hreflang="x-default" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={seoTitle} />
	<meta property="og:description" content={seoDescription} />
</svelte:head>

<main class="catalog-page">
	<!-- Hero Section -->
	<section class="catalog-hero">
		<div class="container">
			<h1>{labels.title[locale]}</h1>
			<p class="subtitle">{labels.subtitle[locale]}</p>
		</div>
	</section>

	<!-- Filters Section -->
	<section class="filters-section">
		<div class="container">
			<form class="filters-form" onsubmit={handleSearch}>
				<!-- Search -->
				<div class="search-field">
					<input
						type="search"
						bind:value={searchInput}
						placeholder={labels.search[locale]}
						aria-label={labels.search[locale]}
					/>
					<button type="submit" aria-label="Search">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="11" cy="11" r="8" />
							<path d="M21 21l-4.35-4.35" />
						</svg>
					</button>
				</div>

				<!-- Series Filter -->
				<div class="filter-field">
					<select
						value={filters.series}
						onchange={handleSeriesChange}
						aria-label="Filter by series"
					>
						<option value="">{labels.allSeries[locale]}</option>
						{#each options.series as series}
							<option value={series.slug}>{series.title}</option>
						{/each}
					</select>
				</div>

				<!-- Year Filter -->
				<div class="filter-field">
					<select value={filters.year} onchange={handleYearChange} aria-label="Filter by year">
						<option value="">{labels.allYears[locale]}</option>
						{#each options.years as year}
							<option value={year.toString()}>{year}</option>
						{/each}
					</select>
				</div>

				<!-- Available Only -->
				<div class="filter-field checkbox">
					<label>
						<input
							type="checkbox"
							checked={filters.available}
							onchange={handleAvailableChange}
						/>
						{labels.availableOnly[locale]}
					</label>
				</div>

				<!-- Clear Filters -->
				{#if hasActiveFilters}
					<button type="button" class="clear-btn" onclick={clearFilters}>
						{labels.clearFilters[locale]}
					</button>
				{/if}
			</form>
		</div>
	</section>

	<!-- Results Section -->
	<section class="results-section">
		<div class="container">
			<!-- Results Count -->
			<p class="results-count">
				{labels.showing[locale]}
				{artworks.length}
				{labels.of[locale]}
				{pagination.total}
				{labels.artworks[locale]}
			</p>

			{#if artworks.length === 0}
				<div class="no-results">
					<p>{labels.noResults[locale]}</p>
					{#if hasActiveFilters}
						<button type="button" class="clear-btn" onclick={clearFilters}>
							{labels.clearFilters[locale]}
						</button>
					{/if}
				</div>
			{:else}
				<div class="artworks-grid">
					{#each artworks as artwork}
						<article class="artwork-card">
							<div class="artwork-image">
								{#if artwork.images.length > 0}
									<img src={artwork.images[0]} alt={artwork.title} loading="lazy" />
								{/if}
							</div>
							<div class="artwork-info">
								<h2>{artwork.title}</h2>
								<p class="technique">{artwork.technique}</p>
								<p class="year">{artwork.year}</p>
								{#if artwork.dimensions}
									<p class="dimensions">{artwork.dimensions}</p>
								{/if}
								<div class="artwork-meta">
									{#if artwork.available && artwork.price}
										<span class="price">
											{artwork.currency === 'EUR' ? '€' : artwork.currency}
											{artwork.price?.toLocaleString()}
										</span>
										<span class="status available">{labels.available[locale]}</span>
									{:else if !artwork.available}
										<span class="status sold">{labels.sold[locale]}</span>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				</div>

				<!-- Pagination -->
				{#if pagination.totalPages > 1}
					<nav class="pagination" aria-label="Pagination">
						<button
							type="button"
							class="page-btn"
							disabled={!pagination.hasPrev}
							onclick={() => goToPage(pagination.currentPage - 1)}
						>
							{labels.previous[locale]}
						</button>

						<div class="page-numbers">
							{#each Array.from({ length: pagination.totalPages }, (_, i) => i + 1) as pageNum}
								{#if pageNum === 1 || pageNum === pagination.totalPages || (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)}
									<button
										type="button"
										class="page-num"
										class:active={pageNum === pagination.currentPage}
										onclick={() => goToPage(pageNum)}
									>
										{pageNum}
									</button>
								{:else if pageNum === pagination.currentPage - 2 || pageNum === pagination.currentPage + 2}
									<span class="ellipsis">...</span>
								{/if}
							{/each}
						</div>

						<button
							type="button"
							class="page-btn"
							disabled={!pagination.hasNext}
							onclick={() => goToPage(pagination.currentPage + 1)}
						>
							{labels.next[locale]}
						</button>
					</nav>
				{/if}
			{/if}
		</div>
	</section>
</main>

<style>
	.catalog-page {
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg, 2rem);
	}

	/* Hero */
	.catalog-hero {
		padding: var(--spacing-3xl, 6rem) 0;
		background: var(--bg-secondary, #f5f5f5);
		text-align: center;
	}

	.catalog-hero h1 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-4xl, 3rem);
		margin-bottom: var(--spacing-md, 1rem);
		color: var(--text-primary, #1a1a1a);
	}

	.subtitle {
		font-size: var(--text-lg, 1.125rem);
		color: var(--text-secondary, #666);
	}

	/* Filters */
	.filters-section {
		padding: var(--spacing-xl, 3rem) 0;
		background: var(--bg-primary, #fff);
		border-bottom: 1px solid var(--border-color, #e5e5e5);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.filters-form {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md, 1rem);
		align-items: center;
	}

	.search-field {
		flex: 1;
		min-width: 250px;
		position: relative;
	}

	.search-field input {
		width: 100%;
		padding: var(--spacing-sm, 0.5rem) var(--spacing-lg, 2rem) var(--spacing-sm, 0.5rem)
			var(--spacing-md, 1rem);
		border: 1px solid var(--border-color, #e5e5e5);
		border-radius: var(--radius-md, 0.5rem);
		font-size: var(--text-base, 1rem);
		background: var(--bg-secondary, #f5f5f5);
	}

	.search-field input:focus {
		outline: none;
		border-color: var(--color-accent, #d4af37);
	}

	.search-field button {
		position: absolute;
		right: var(--spacing-sm, 0.5rem);
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: var(--text-secondary, #666);
		cursor: pointer;
		padding: var(--spacing-xs, 0.25rem);
	}

	.search-field button svg {
		width: 20px;
		height: 20px;
	}

	.filter-field select {
		padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
		border: 1px solid var(--border-color, #e5e5e5);
		border-radius: var(--radius-md, 0.5rem);
		font-size: var(--text-base, 1rem);
		background: var(--bg-secondary, #f5f5f5);
		cursor: pointer;
		min-width: 150px;
	}

	.filter-field select:focus {
		outline: none;
		border-color: var(--color-accent, #d4af37);
	}

	.filter-field.checkbox label {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs, 0.25rem);
		cursor: pointer;
		font-size: var(--text-sm, 0.875rem);
	}

	.filter-field.checkbox input {
		accent-color: var(--color-accent, #d4af37);
	}

	.clear-btn {
		padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
		background: transparent;
		border: 1px solid var(--color-accent, #d4af37);
		color: var(--color-accent, #d4af37);
		border-radius: var(--radius-md, 0.5rem);
		cursor: pointer;
		font-size: var(--text-sm, 0.875rem);
		transition: all 0.2s;
	}

	.clear-btn:hover {
		background: var(--color-accent, #d4af37);
		color: #fff;
	}

	/* Results */
	.results-section {
		padding: var(--spacing-xl, 3rem) 0;
	}

	.results-count {
		color: var(--text-secondary, #666);
		font-size: var(--text-sm, 0.875rem);
		margin-bottom: var(--spacing-lg, 2rem);
	}

	.no-results {
		text-align: center;
		padding: var(--spacing-3xl, 6rem) 0;
	}

	.no-results p {
		font-size: var(--text-lg, 1.125rem);
		color: var(--text-secondary, #666);
		margin-bottom: var(--spacing-md, 1rem);
	}

	.artworks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-xl, 3rem);
	}

	.artwork-card {
		background: var(--bg-primary, #fff);
	}

	.artwork-image {
		aspect-ratio: 1;
		overflow: hidden;
		background: var(--bg-secondary, #f5f5f5);
		border-radius: var(--radius-md, 0.5rem);
	}

	.artwork-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.artwork-card:hover .artwork-image img {
		transform: scale(1.05);
	}

	.artwork-info {
		padding: var(--spacing-md, 1rem) 0;
	}

	.artwork-info h2 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-lg, 1.125rem);
		margin-bottom: var(--spacing-xs, 0.25rem);
		color: var(--text-primary, #1a1a1a);
	}

	.technique {
		color: var(--text-secondary, #666);
		font-size: var(--text-sm, 0.875rem);
	}

	.year {
		color: var(--color-accent, #d4af37);
		font-weight: 500;
		font-size: var(--text-sm, 0.875rem);
	}

	.dimensions {
		color: var(--text-secondary, #666);
		font-size: var(--text-sm, 0.875rem);
	}

	.artwork-meta {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm, 0.5rem);
		margin-top: var(--spacing-sm, 0.5rem);
	}

	.price {
		font-weight: 600;
		color: var(--text-primary, #1a1a1a);
	}

	.status {
		font-size: var(--text-xs, 0.75rem);
		padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
		border-radius: var(--radius-sm, 0.25rem);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status.available {
		background: #d4edda;
		color: #155724;
	}

	.status.sold {
		background: var(--bg-tertiary, #e5e5e5);
		color: var(--text-secondary, #666);
	}

	/* Pagination */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-md, 1rem);
		margin-top: var(--spacing-3xl, 6rem);
		padding-top: var(--spacing-xl, 3rem);
		border-top: 1px solid var(--border-color, #e5e5e5);
	}

	.page-btn {
		padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
		background: var(--bg-secondary, #f5f5f5);
		border: none;
		border-radius: var(--radius-md, 0.5rem);
		cursor: pointer;
		font-size: var(--text-sm, 0.875rem);
		color: var(--text-primary, #1a1a1a);
		transition: all 0.2s;
	}

	.page-btn:hover:not(:disabled) {
		background: var(--color-accent, #d4af37);
		color: #fff;
	}

	.page-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-numbers {
		display: flex;
		gap: var(--spacing-xs, 0.25rem);
	}

	.page-num {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: 1px solid var(--border-color, #e5e5e5);
		border-radius: var(--radius-sm, 0.25rem);
		cursor: pointer;
		font-size: var(--text-sm, 0.875rem);
		transition: all 0.2s;
	}

	.page-num:hover {
		border-color: var(--color-accent, #d4af37);
		color: var(--color-accent, #d4af37);
	}

	.page-num.active {
		background: var(--color-accent, #d4af37);
		border-color: var(--color-accent, #d4af37);
		color: #fff;
	}

	.ellipsis {
		display: flex;
		align-items: center;
		padding: 0 var(--spacing-xs, 0.25rem);
		color: var(--text-secondary, #666);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.catalog-hero h1 {
			font-size: var(--text-3xl, 2.25rem);
		}

		.filters-form {
			flex-direction: column;
		}

		.search-field {
			width: 100%;
		}

		.filter-field select {
			width: 100%;
		}

		.artworks-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-md, 1rem);
		}

		.pagination {
			flex-wrap: wrap;
		}

		.page-numbers {
			order: 3;
			width: 100%;
			justify-content: center;
			margin-top: var(--spacing-sm, 0.5rem);
		}
	}

	@media (max-width: 480px) {
		.artworks-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Dark mode */
	:global([data-theme='dark']) .catalog-hero {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global([data-theme='dark']) .filters-section {
		background: var(--bg-primary, #000);
		border-color: var(--border-color, #333);
	}

	:global([data-theme='dark']) .search-field input,
	:global([data-theme='dark']) .filter-field select {
		background: var(--bg-secondary, #1c1c1e);
		border-color: var(--border-color, #333);
		color: var(--text-primary, #fff);
	}

	:global([data-theme='dark']) .artwork-image {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global([data-theme='dark']) .page-btn {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global([data-theme='dark']) .page-num {
		border-color: var(--border-color, #333);
	}

	:global([data-theme='dark']) .status.available {
		background: #1a4d2e;
		color: #90ee90;
	}
</style>
