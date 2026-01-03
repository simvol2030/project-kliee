<script lang="ts">
	import type { PageData } from './$types';
	import ProductCard from '$lib/components/shop/ProductCard.svelte';
	import SeriesFilter from '$lib/components/shop/SeriesFilter.svelte';
	import PriceRangeFilter from '$lib/components/shop/PriceRangeFilter.svelte';
	import SortSelect from '$lib/components/shop/SortSelect.svelte';
	import FilterDrawer from '$lib/components/shop/FilterDrawer.svelte';
	import { goto, beforeNavigate, afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { LanguageCode, CurrencyRate } from '$lib/utils/currency';
	import { getCurrencyByLang } from '$lib/utils/currency';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { wishlistStore } from '$lib/stores/wishlist.svelte';

	let { data }: { data: PageData } = $props();

	// Cast currency rates to correct type
	const currencyRates = $derived(
		data.currencyRates.map((r: { currency: string; rate: number; updated_at: string | null }) => ({
			to_currency: r.currency,
			rate: r.rate.toString()
		})) as CurrencyRate[]
	);

	// i18n translations
	const translations = {
		en: {
			title: 'Art Shop',
			subtitle: 'Discover unique artworks by Svetlana K-LIÉE',
			filters: 'Filters',
			sortBy: 'Sort by',
			noProducts: 'No artworks found',
			noProductsDesc: 'Try adjusting your filters or browse our full collection.',
			clearFilters: 'Clear Filters',
			loadMore: 'Load More',
			showLess: 'Previous',
			showing: 'Showing',
			of: 'of',
			artworks: 'artworks',
			allSeries: 'All Series',
			priceRange: 'Price Range',
			featured: 'Featured',
			newest: 'Newest',
			priceLowHigh: 'Price: Low to High',
			priceHighLow: 'Price: High to Low',
			addedToCart: 'Added to cart!',
			alreadyInCart: 'Already in cart'
		},
		ru: {
			title: 'Магазин',
			subtitle: 'Откройте уникальные работы Светланы К-ЛИЕЕ',
			filters: 'Фильтры',
			sortBy: 'Сортировка',
			noProducts: 'Работы не найдены',
			noProductsDesc: 'Попробуйте изменить фильтры или просмотрите всю коллекцию.',
			clearFilters: 'Сбросить фильтры',
			loadMore: 'Загрузить ещё',
			showLess: 'Предыдущие',
			showing: 'Показано',
			of: 'из',
			artworks: 'работ',
			allSeries: 'Все серии',
			priceRange: 'Диапазон цен',
			featured: 'Рекомендуемые',
			newest: 'Новинки',
			priceLowHigh: 'Цена: по возрастанию',
			priceHighLow: 'Цена: по убыванию',
			addedToCart: 'Добавлено в корзину!',
			alreadyInCart: 'Уже в корзине'
		},
		es: {
			title: 'Tienda',
			subtitle: 'Descubre obras únicas de Svetlana K-LIÉE',
			filters: 'Filtros',
			sortBy: 'Ordenar por',
			noProducts: 'No se encontraron obras',
			noProductsDesc: 'Intenta ajustar los filtros o explora toda la colección.',
			clearFilters: 'Limpiar filtros',
			loadMore: 'Cargar más',
			showLess: 'Anteriores',
			showing: 'Mostrando',
			of: 'de',
			artworks: 'obras',
			allSeries: 'Todas las series',
			priceRange: 'Rango de precios',
			featured: 'Destacados',
			newest: 'Más recientes',
			priceLowHigh: 'Precio: menor a mayor',
			priceHighLow: 'Precio: mayor a menor',
			addedToCart: '¡Añadido al carrito!',
			alreadyInCart: 'Ya está en el carrito'
		},
		zh: {
			title: '艺术商店',
			subtitle: '发现Svetlana K-LIÉE的独特艺术品',
			filters: '筛选',
			sortBy: '排序',
			noProducts: '未找到作品',
			noProductsDesc: '请尝试调整筛选条件或浏览全部收藏。',
			clearFilters: '清除筛选',
			loadMore: '加载更多',
			showLess: '上一页',
			showing: '显示',
			of: '共',
			artworks: '件作品',
			allSeries: '全部系列',
			priceRange: '价格范围',
			featured: '推荐',
			newest: '最新',
			priceLowHigh: '价格：从低到高',
			priceHighLow: '价格：从高到低',
			addedToCart: '已加入购物车！',
			alreadyInCart: '已在购物车中'
		}
	};

	const t = $derived(translations[data.lang as LanguageCode] || translations.en);

	// Filter state
	let mobileFiltersOpen = $state(false);

	// Infinite scroll state
	let allProducts = $state([...data.products.products]);
	let currentPage = $state(data.filters.page);
	let hasMoreProducts = $state(data.products.pagination.hasMore);
	let totalProducts = $state(data.products.pagination.total);
	let isLoadingMore = $state(false);

	// Reset products when filters change (but not page)
	$effect(() => {
		// Track filter changes (series, min_price, max_price, sort)
		const filterKey = `${data.filters.series_id}-${data.filters.min_price}-${data.filters.max_price}-${data.filters.sort}`;
		// When filters change, reset to initial data
		allProducts = [...data.products.products];
		currentPage = data.filters.page;
		hasMoreProducts = data.products.pagination.hasMore;
		totalProducts = data.products.pagination.total;
	});

	// Current currency info
	const currencyInfo = $derived(getCurrencyByLang(data.lang, currencyRates));

	// Check if any filters are active
	const hasActiveFilters = $derived(
		data.filters.series_id !== null ||
		data.filters.min_price !== null ||
		data.filters.max_price !== null
	);

	// Active filters count
	const activeFiltersCount = $derived(
		(data.filters.series_id ? 1 : 0) +
		(data.filters.min_price ? 1 : 0) +
		(data.filters.max_price ? 1 : 0)
	);

	// Update URL with new filters
	function updateFilters(updates: Record<string, string | null>) {
		const url = new URL($page.url);

		for (const [key, value] of Object.entries(updates)) {
			if (value === null || value === '') {
				url.searchParams.delete(key);
			} else {
				url.searchParams.set(key, value);
			}
		}

		// Reset to page 1 when filters change
		if (!('page' in updates)) {
			url.searchParams.delete('page');
		}

		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	function handleSeriesChange(seriesId: number | null) {
		updateFilters({ series: seriesId?.toString() || null });
	}

	function handlePriceChange(min: number | null, max: number | null) {
		updateFilters({
			min_price: min?.toString() || null,
			max_price: max?.toString() || null
		});
	}

	function handleSortChange(sort: string) {
		updateFilters({ sort });
	}

	function clearAllFilters() {
		const url = new URL($page.url);
		url.searchParams.delete('series');
		url.searchParams.delete('min_price');
		url.searchParams.delete('max_price');
		url.searchParams.delete('page');
		goto(url.toString(), { replaceState: true });
	}

	async function loadMore() {
		if (isLoadingMore || !hasMoreProducts) return;

		isLoadingMore = true;
		const nextPage = currentPage + 1;

		try {
			// Build URL with current filters
			const params = new URLSearchParams();
			params.set('locale', data.lang); // Add locale for translations
			if (data.filters.series_id) params.set('series_id', data.filters.series_id.toString());
			if (data.filters.min_price) params.set('min_price', data.filters.min_price.toString());
			if (data.filters.max_price) params.set('max_price', data.filters.max_price.toString());
			params.set('sort', data.filters.sort);
			params.set('page', nextPage.toString());
			params.set('limit', '12');

			const response = await fetch(`/api/shop/products?${params}`);
			if (response.ok) {
				const result = await response.json();
				// Append new products to existing ones
				allProducts = [...allProducts, ...result.products];
				currentPage = nextPage;
				hasMoreProducts = result.pagination.hasMore;

				// Update URL without navigation (for bookmarking)
				const url = new URL($page.url);
				url.searchParams.set('page', nextPage.toString());
				history.replaceState({}, '', url.toString());
			}
		} catch (err) {
			console.error('Failed to load more products:', err);
		} finally {
			isLoadingMore = false;
		}
	}


	// Storage key for pagination state
	const SHOP_STATE_KEY = 'shop_pagination_state';

	// Save state before navigating away (to product page)
	beforeNavigate(({ to }) => {
		if (browser && to?.url.pathname.includes('/shop/')) {
			// Save current state to sessionStorage
			const state = {
				products: allProducts,
				page: currentPage,
				hasMore: hasMoreProducts,
				total: totalProducts,
				scrollY: window.scrollY,
				filters: data.filters
			};
			sessionStorage.setItem(SHOP_STATE_KEY, JSON.stringify(state));
		}
	});

	// Initialize stores on mount
	onMount(() => {
		cartStore.init();
		wishlistStore.init();
	});

	// Restore state after navigation (including browser back)
	afterNavigate(({ type }) => {
		if (!browser) return;

		// Only restore state on popstate (browser back/forward)
		if (type === 'popstate') {
			const savedState = sessionStorage.getItem(SHOP_STATE_KEY);
			if (savedState) {
				try {
					const state = JSON.parse(savedState);
					// Only restore if filters match
					const filtersMatch =
						state.filters.series_id === data.filters.series_id &&
						state.filters.min_price === data.filters.min_price &&
						state.filters.max_price === data.filters.max_price &&
						state.filters.sort === data.filters.sort;

					if (filtersMatch && state.products.length > data.products.products.length) {
						allProducts = state.products;
						currentPage = state.page;
						hasMoreProducts = state.hasMore;
						totalProducts = state.total;

						// Restore scroll position after a tick
						setTimeout(() => {
							window.scrollTo(0, state.scrollY);
						}, 100);
					}
				} catch (e) {
					console.error('Failed to restore shop state:', e);
				}
				// Clear saved state after restoring
				sessionStorage.removeItem(SHOP_STATE_KEY);
			}
		}
	});

	// Loading and feedback state
	let addingToCart = $state<number | null>(null);
	let cartMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	// Cart handler
	async function handleAddToCart(productId: number) {
		if (addingToCart) return; // Prevent double-click

		addingToCart = productId;
		cartMessage = null;

		try {
			const result = await cartStore.addItem(productId);

			if (result.success) {
				cartMessage = { type: 'success', text: t.addedToCart || 'Added to cart!' };
			} else if (result.message === 'already_in_cart') {
				cartMessage = { type: 'error', text: t.alreadyInCart || 'Already in cart' };
			} else {
				cartMessage = { type: 'error', text: result.message || 'Error adding to cart' };
			}

			// Clear message after 3 seconds
			setTimeout(() => {
				cartMessage = null;
			}, 3000);
		} catch (err) {
			cartMessage = { type: 'error', text: 'Error adding to cart' };
		} finally {
			addingToCart = null;
		}
	}

	// Wishlist handler
	function handleToggleWishlist(productId: number) {
		wishlistStore.toggle(productId);
		// UI updates automatically via isInWishlist check
	}

	// Check if product is in wishlist
	function isProductInWishlist(productId: number): boolean {
		return wishlistStore.isInWishlist(productId);
	}
</script>

<svelte:head>
	<title>{t.title} | K-LIÉE</title>
	<meta name="description" content={t.subtitle} />
	<meta property="og:title" content="{t.title} | K-LIÉE" />
	<meta property="og:description" content={t.subtitle} />
	<link rel="canonical" href="{$page.url.origin}/{data.lang}/shop" />
	{#each ['en', 'ru', 'es', 'zh'] as lang}
		<link rel="alternate" hreflang={lang} href="{$page.url.origin}/{lang}/shop" />
	{/each}
</svelte:head>

<main class="shop-page">
	<!-- Toast Notification -->
	{#if cartMessage}
		<div class="toast" class:success={cartMessage.type === 'success'} class:error={cartMessage.type === 'error'}>
			{cartMessage.text}
		</div>
	{/if}

	<!-- Hero Section -->
	<section class="shop-hero">
		<div class="container">
			<h1>{t.title}</h1>
			<p>{t.subtitle}</p>
		</div>
	</section>

	<div class="container shop-content">
		<!-- Mobile Filter Button -->
		<div class="mobile-filter-bar">
			<button class="filter-toggle" onclick={() => mobileFiltersOpen = true}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
					<line x1="4" y1="21" x2="4" y2="14" />
					<line x1="4" y1="10" x2="4" y2="3" />
					<line x1="12" y1="21" x2="12" y2="12" />
					<line x1="12" y1="8" x2="12" y2="3" />
					<line x1="20" y1="21" x2="20" y2="16" />
					<line x1="20" y1="12" x2="20" y2="3" />
					<line x1="1" y1="14" x2="7" y2="14" />
					<line x1="9" y1="8" x2="15" y2="8" />
					<line x1="17" y1="16" x2="23" y2="16" />
				</svg>
				{t.filters}
				{#if activeFiltersCount > 0}
					<span class="filter-badge">{activeFiltersCount}</span>
				{/if}
			</button>

			<SortSelect
				value={data.filters.sort}
				lang={data.lang}
				onChange={handleSortChange}
			/>
		</div>

		<div class="shop-layout">
			<!-- Desktop Sidebar -->
			<aside class="filters-sidebar">
				<div class="filters-header">
					<h2>{t.filters}</h2>
					{#if hasActiveFilters}
						<button class="clear-btn" onclick={clearAllFilters}>
							{t.clearFilters}
						</button>
					{/if}
				</div>

				<SeriesFilter
					series={data.series}
					selectedId={data.filters.series_id}
					lang={data.lang}
					onChange={handleSeriesChange}
				/>

				<PriceRangeFilter
					minPrice={data.filters.min_price}
					maxPrice={data.filters.max_price}
					currencySymbol={currencyInfo.symbol}
					lang={data.lang}
					onChange={handlePriceChange}
				/>
			</aside>

			<!-- Products Grid -->
			<section class="products-section">
				<!-- Results info -->
				<div class="results-info">
					<p>
						{t.showing} {allProducts.length} {t.of} {totalProducts} {t.artworks}
					</p>

					<div class="desktop-sort">
						<SortSelect
							value={data.filters.sort}
							lang={data.lang}
							onChange={handleSortChange}
						/>
					</div>
				</div>

				{#if allProducts.length === 0}
					<!-- Empty state -->
					<div class="empty-state">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
							<circle cx="8.5" cy="8.5" r="1.5" />
							<polyline points="21 15 16 10 5 21" />
						</svg>
						<h3>{t.noProducts}</h3>
						<p>{t.noProductsDesc}</p>
						{#if hasActiveFilters}
							<button class="btn btn-primary" onclick={clearAllFilters}>
								{t.clearFilters}
							</button>
						{/if}
					</div>
				{:else}
					<!-- Products grid -->
					<div class="products-grid">
						{#each allProducts as product (product.id)}
							<ProductCard
								{product}
								lang={data.lang}
								{currencyRates}
								onAddToCart={handleAddToCart}
								onToggleWishlist={handleToggleWishlist}
								isInWishlist={isProductInWishlist(product.id)}
								loading={addingToCart === product.id}
							/>
						{/each}
					</div>

					<!-- Load More button -->
					{#if hasMoreProducts}
						<div class="pagination-buttons">
							<button
								class="btn btn-secondary"
								onclick={loadMore}
								disabled={isLoadingMore}
							>
								{#if isLoadingMore}
									<span class="spinner-small"></span>
									Loading...
								{:else}
									{t.loadMore}
								{/if}
							</button>
						</div>
					{/if}
				{/if}
			</section>
		</div>
	</div>

	<!-- Mobile Filter Drawer -->
	<FilterDrawer
		isOpen={mobileFiltersOpen}
		onClose={() => mobileFiltersOpen = false}
		lang={data.lang}
	>
		<SeriesFilter
			series={data.series}
			selectedId={data.filters.series_id}
			lang={data.lang}
			onChange={handleSeriesChange}
		/>

		<PriceRangeFilter
			minPrice={data.filters.min_price}
			maxPrice={data.filters.max_price}
			currencySymbol={currencyInfo.symbol}
			lang={data.lang}
			onChange={handlePriceChange}
		/>

		{#if hasActiveFilters}
			<button class="btn btn-outline full-width" onclick={clearAllFilters}>
				{t.clearFilters}
			</button>
		{/if}
	</FilterDrawer>
</main>

<style>
	.shop-page {
		min-height: 100vh;
	}

	/* Toast Notification */
	.toast {
		position: fixed;
		top: 1rem;
		right: 1rem;
		padding: 0.75rem 1.25rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		z-index: 1000;
		animation: slideIn 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.toast.success {
		background: #10b981;
		color: white;
	}

	.toast.error {
		background: #ef4444;
		color: white;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	/* Loading spinner */
	.spinner-small {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Hero Section */
	.shop-hero {
		padding: var(--spacing-3xl, 6rem) 0;
		background: var(--bg-secondary, #f5f5f5);
		text-align: center;
	}

	.shop-hero h1 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-4xl, 3rem);
		margin-bottom: var(--spacing-md, 1rem);
		color: var(--text-primary, #1a1a1a);
		font-weight: 400;
	}

	.shop-hero p {
		margin: 0;
		font-size: var(--text-lg, 1.125rem);
		color: var(--text-secondary, #666);
	}

	/* Shop Content Layout */
	.shop-content {
		padding: 2rem 1rem;
	}

	.shop-layout {
		display: grid;
		grid-template-columns: 260px 1fr;
		gap: 2rem;
	}

	/* Filters Sidebar */
	.filters-sidebar {
		display: none;
	}

	.filters-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.filters-header h2 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.clear-btn {
		background: none;
		border: none;
		color: var(--text-secondary, #666);
		font-size: 0.875rem;
		cursor: pointer;
		padding: 0;
	}

	.clear-btn:hover {
		text-decoration: underline;
		color: var(--text-primary, #1a1a1a);
	}

	/* Mobile Filter Bar */
	.mobile-filter-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		gap: 1rem;
	}

	.filter-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: var(--color-card-bg, #fff);
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.filter-toggle:hover {
		border-color: var(--text-secondary, #666);
	}

	.filter-badge {
		background: var(--text-primary, #1a1a1a);
		color: var(--bg-primary, #fff);
		font-size: 0.75rem;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		min-width: 1.25rem;
		text-align: center;
	}

	/* Results Info */
	.results-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.results-info p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-text-secondary, #6b7280);
	}

	.desktop-sort {
		display: none;
	}

	/* Products Grid */
	.products-section {
		flex: 1;
		min-width: 0;
	}

	.products-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--color-card-bg, #fff);
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	.empty-state svg {
		color: #9ca3af;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
		color: var(--color-text, #1a1a1a);
	}

	.empty-state p {
		margin: 0 0 1.5rem;
		color: var(--color-text-secondary, #6b7280);
	}

	/* Pagination Buttons */
	.pagination-buttons {
		margin-top: 2rem;
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.625rem 1.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: var(--text-primary, #1a1a1a);
		color: var(--bg-primary, #ffffff);
		border: none;
	}

	.btn-primary:hover {
		opacity: 0.85;
	}

	.btn-secondary {
		background: var(--color-card-bg, #fff);
		color: var(--color-text, #1a1a1a);
		border: 1px solid #e5e7eb;
	}

	.btn-secondary:hover {
		border-color: var(--text-primary, #1a1a1a);
	}

	.btn-outline {
		background: transparent;
		color: var(--text-primary, #1a1a1a);
		border: 1px solid var(--text-primary, #1a1a1a);
	}

	.btn-outline:hover {
		background: var(--text-primary, #1a1a1a);
		color: var(--bg-primary, #fff);
	}

	.full-width {
		width: 100%;
	}

	/* Desktop Styles */
	@media (min-width: 768px) {
		.shop-hero h1 {
			font-size: 3rem;
		}

		.products-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 1.5rem;
		}
	}

	@media (min-width: 1024px) {
		.mobile-filter-bar {
			display: none;
		}

		.filters-sidebar {
			display: block;
		}

		.desktop-sort {
			display: block;
		}

		.products-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 1280px) {
		.products-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	/* Dark Theme */
	:global(.dark) .shop-hero {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global(.dark) .shop-hero h1 {
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .shop-hero p {
		color: var(--text-secondary, #8e8e93);
	}

	:global(.dark) .filter-toggle {
		background: var(--bg-secondary, #1c1c1e);
		border-color: var(--border-color, #333);
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .filter-toggle:hover {
		border-color: var(--text-secondary, #8e8e93);
	}

	:global(.dark) .empty-state {
		background: var(--bg-secondary, #1c1c1e);
		border-color: var(--border-color, #333);
	}

	:global(.dark) .empty-state h3,
	:global(.dark) .empty-state p {
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .btn-secondary {
		background: var(--bg-secondary, #1c1c1e);
		border-color: var(--border-color, #333);
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .results-info p {
		color: var(--text-secondary, #8e8e93);
	}

	:global(.dark) .filters-header h2 {
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .clear-btn {
		color: var(--text-secondary, #8e8e93);
	}

	:global(.dark) .clear-btn:hover {
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .filter-badge {
		background: var(--text-primary, #ffffff);
		color: var(--bg-primary, #000);
	}

	:global(.dark) .btn-primary {
		background: var(--text-primary, #ffffff);
		color: var(--bg-primary, #000);
	}

	:global(.dark) .btn-outline {
		color: var(--text-primary, #ffffff);
		border-color: var(--text-primary, #ffffff);
	}

	:global(.dark) .btn-outline:hover {
		background: var(--text-primary, #ffffff);
		color: var(--bg-primary, #000);
	}
</style>
