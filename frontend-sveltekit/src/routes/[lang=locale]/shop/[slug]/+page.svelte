<script lang="ts">
	import type { PageData } from './$types';
	import ProductGallery from '$lib/components/shop/ProductGallery.svelte';
	import { formatPrice, type CurrencyRate, type LanguageCode } from '$lib/utils/currency';
	import { page } from '$app/stores';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { wishlistStore } from '$lib/stores/wishlist.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { data }: { data: PageData } = $props();

	// Handle browser back/forward - force navigation when URL doesn't match product
	afterNavigate(({ type }) => {
		if (browser && type === 'popstate') {
			// Check if URL no longer matches this product page
			const currentPath = window.location.pathname;
			const expectedPath = `/${data.lang}/shop/${data.product.slug}`;
			if (currentPath !== expectedPath) {
				// Force navigation to the new URL
				goto(window.location.href, { replaceState: true, invalidateAll: true });
			}
		}
	});

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
			addToCart: 'Add to Cart',
			addToWishlist: 'Add to Wishlist',
			removeFromWishlist: 'Remove from Wishlist',
			soldOut: 'Sold Out',
			soldMessage: 'This artwork is no longer available',
			technique: 'Technique',
			dimensions: 'Dimensions',
			year: 'Year',
			description: 'Description',
			backToShop: 'Back to Shop',
			home: 'Home',
			shop: 'Shop',
			priceOnRequest: 'Price on request',
			inCart: 'In Cart',
			addedToCart: 'Added to cart!'
		},
		ru: {
			addToCart: 'В корзину',
			addToWishlist: 'В избранное',
			removeFromWishlist: 'Удалить из избранного',
			soldOut: 'Продано',
			soldMessage: 'Эта работа больше не доступна',
			technique: 'Техника',
			dimensions: 'Размеры',
			year: 'Год',
			description: 'Описание',
			backToShop: 'Назад в магазин',
			home: 'Главная',
			shop: 'Магазин',
			priceOnRequest: 'Цена по запросу',
			inCart: 'В корзине',
			addedToCart: 'Добавлено в корзину!'
		},
		es: {
			addToCart: 'Añadir al carrito',
			addToWishlist: 'Añadir a favoritos',
			removeFromWishlist: 'Quitar de favoritos',
			soldOut: 'Agotado',
			soldMessage: 'Esta obra ya no está disponible',
			technique: 'Técnica',
			dimensions: 'Dimensiones',
			year: 'Año',
			description: 'Descripción',
			backToShop: 'Volver a la tienda',
			home: 'Inicio',
			shop: 'Tienda',
			priceOnRequest: 'Precio a consultar',
			inCart: 'En el carrito',
			addedToCart: '¡Añadido al carrito!'
		},
		zh: {
			addToCart: '加入购物车',
			addToWishlist: '加入收藏',
			removeFromWishlist: '取消收藏',
			soldOut: '已售罄',
			soldMessage: '此作品已不再可用',
			technique: '技法',
			dimensions: '尺寸',
			year: '年份',
			description: '描述',
			backToShop: '返回商店',
			home: '首页',
			shop: '商店',
			priceOnRequest: '价格面议',
			inCart: '在购物车中',
			addedToCart: '已加入购物车！'
		}
	};

	const t = $derived(translations[data.lang] || translations.en);
	const product = data.product;

	// Product is already localized from the API
	const title = $derived(product.title);
	const description = $derived(product.description);
	const isSold = $derived(!product.is_available);
	const formattedPrice = $derived(formatPrice(product.price_eur, data.lang, currencyRates));

	// Map images for ProductGallery (expects { url, alt })
	const galleryImages = $derived(
		product.images.map((img) => ({
			stored_filename: img.url, // ProductGallery uses this
			url: img.url,
			alt: img.alt || title
		}))
	);

	// Initialize stores
	onMount(() => {
		cartStore.init();
		wishlistStore.init();
	});

	// Cart and wishlist state
	let addingToCart = $state(false);
	const isInCart = $derived(cartStore.isInCart(product.id));
	const isInWishlist = $derived(wishlistStore.isInWishlist(product.id));

	async function handleAddToCart() {
		if (addingToCart || isInCart) return;

		addingToCart = true;
		await cartStore.addItem(product.id);
		addingToCart = false;
	}

	function handleToggleWishlist() {
		wishlistStore.toggle(product.id);
	}

	// Schema.org Product markup
	const schemaOrg = $derived({
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: title,
		description: description || undefined,
		image: product.images[0]?.url
			? `${$page.url.origin}${product.images[0].url}`
			: undefined,
		offers: {
			'@type': 'Offer',
			price: product.price_eur ? (product.price_eur / 100).toFixed(2) : undefined,
			priceCurrency: 'EUR',
			availability: isSold
				? 'https://schema.org/SoldOut'
				: 'https://schema.org/InStock'
		}
	});
</script>

<svelte:head>
	<title>{title} | K-LIÉE Shop</title>
	<meta name="description" content={description || `${title} by Svetlana K-LIÉE`} />
	<meta property="og:title" content="{title} | K-LIÉE Shop" />
	<meta property="og:description" content={description || `${title} by Svetlana K-LIÉE`} />
	{#if product.images[0]}
		<meta property="og:image" content="{$page.url.origin}{product.images[0].url}" />
	{/if}
	<link rel="canonical" href="{$page.url.origin}/{data.lang}/shop/{product.slug}" />
	{#each ['en', 'ru', 'es', 'zh'] as lang}
		<link rel="alternate" hreflang={lang} href="{$page.url.origin}/{lang}/shop/{product.slug}" />
	{/each}
	{@html `<script type="application/ld+json">${JSON.stringify(schemaOrg)}</script>`}
</svelte:head>

<main class="product-page">
	<div class="container">
		<!-- Breadcrumbs -->
		<nav class="breadcrumbs" aria-label="Breadcrumb">
			<a href="/{data.lang}">{t.home}</a>
			<span class="separator">/</span>
			<a href="/{data.lang}/shop">{t.shop}</a>
			<span class="separator">/</span>
			<span class="current">{title}</span>
		</nav>

		<div class="product-layout">
			<!-- Gallery -->
			<div class="product-gallery-wrapper">
				<ProductGallery images={galleryImages} productTitle={title} lang={data.lang} />
			</div>

			<!-- Product Info -->
			<div class="product-info">
				<h1 class="product-title">{title}</h1>

				<div class="product-price" class:sold={isSold}>
					{#if isSold}
						<span class="sold-badge">{t.soldOut}</span>
					{:else}
						<span class="price">{formattedPrice}</span>
					{/if}
				</div>

				{#if isSold}
					<p class="sold-message">{t.soldMessage}</p>
				{/if}

				<!-- Action Buttons -->
				<div class="product-actions">
					{#if !isSold}
						{#if isInCart}
							<span class="btn btn-secondary btn-large in-cart">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
									<polyline points="20 6 9 17 4 12" />
								</svg>
								{t.inCart}
							</span>
						{:else}
							<button
								class="btn btn-primary btn-large"
								onclick={handleAddToCart}
								disabled={addingToCart}
							>
								{#if addingToCart}
									<span class="spinner"></span>
								{:else}
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
										<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
										<line x1="3" y1="6" x2="21" y2="6" />
										<path d="M16 10a4 4 0 0 1-8 0" />
									</svg>
									{t.addToCart}
								{/if}
							</button>
						{/if}
					{/if}

					<button
						class="btn btn-secondary"
						class:active={isInWishlist}
						onclick={handleToggleWishlist}
					>
						<svg viewBox="0 0 24 24" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" width="20" height="20">
							<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
						</svg>
						{isInWishlist ? t.removeFromWishlist : t.addToWishlist}
					</button>
				</div>

				<!-- Details -->
				<div class="product-details">
					{#if product.technique}
						<div class="detail-row">
							<span class="detail-label">{t.technique}</span>
							<span class="detail-value">{product.technique}</span>
						</div>
					{/if}

					{#if product.dimensions}
						<div class="detail-row">
							<span class="detail-label">{t.dimensions}</span>
							<span class="detail-value">{product.dimensions}</span>
						</div>
					{/if}

					{#if product.year}
						<div class="detail-row">
							<span class="detail-label">{t.year}</span>
							<span class="detail-value">{product.year}</span>
						</div>
					{/if}
				</div>

				<!-- Description -->
				{#if description}
					<div class="product-description">
						<h2>{t.description}</h2>
						<p>{description}</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Back to shop link -->
		<div class="back-link">
			<a href="/{data.lang}/shop">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
					<line x1="19" y1="12" x2="5" y2="12" />
					<polyline points="12 19 5 12 12 5" />
				</svg>
				{t.backToShop}
			</a>
		</div>
	</div>
</main>

<style>
	.product-page {
		padding: 2rem 0;
		min-height: 100vh;
	}

	.container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Breadcrumbs */
	.breadcrumbs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 2rem;
		font-size: 0.875rem;
	}

	.breadcrumbs a {
		color: var(--color-text-secondary, #6b7280);
		text-decoration: none;
	}

	.breadcrumbs a:hover {
		color: #667eea;
	}

	.breadcrumbs .separator {
		color: var(--color-text-secondary, #9ca3af);
	}

	.breadcrumbs .current {
		color: var(--color-text, #1a1a1a);
		font-weight: 500;
	}

	/* Layout */
	.product-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		margin-bottom: 4rem;
	}

	.product-gallery-wrapper {
		width: 100%;
	}

	/* Product Info */
	.product-info {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.product-title {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text, #1a1a1a);
		line-height: 1.2;
	}

	.product-price {
		margin: 0.5rem 0;
	}

	.product-price .price {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text, #1a1a1a);
	}

	.product-price.sold .sold-badge {
		display: inline-block;
		background: #dc2626;
		color: white;
		padding: 0.375rem 0.75rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.sold-message {
		color: #dc2626;
		font-size: 0.9375rem;
		margin: 0;
	}

	/* Actions */
	.product-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		border: none;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--color-card-bg, #fff);
		color: var(--color-text, #1a1a1a);
		border: 1px solid #e5e7eb;
	}

	.btn-secondary:hover {
		border-color: #667eea;
		color: #667eea;
	}

	.btn-secondary.active {
		color: #dc2626;
		border-color: #dc2626;
	}

	.btn-secondary.in-cart {
		background: #10b981;
		color: white;
		border-color: #10b981;
		cursor: default;
	}

	.btn-large {
		padding: 1rem 2rem;
		font-size: 1rem;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Details */
	.product-details {
		padding: 1.5rem 0;
		border-top: 1px solid var(--color-border, #e5e7eb);
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
	}

	.detail-label {
		color: var(--color-text-secondary, #6b7280);
		font-size: 0.9375rem;
	}

	.detail-value {
		font-weight: 500;
		color: var(--color-text, #1a1a1a);
	}

	/* Description */
	.product-description {
		margin-top: 1rem;
	}

	.product-description h2 {
		margin: 0 0 0.75rem;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.product-description p {
		margin: 0;
		color: var(--color-text-secondary, #4b5563);
		line-height: 1.6;
	}

	/* Back link */
	.back-link {
		text-align: center;
		padding: 2rem 0;
	}

	.back-link a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
	}

	.back-link a:hover {
		text-decoration: underline;
	}

	/* Desktop */
	@media (min-width: 768px) {
		.product-layout {
			grid-template-columns: 1fr 1fr;
			gap: 3rem;
		}

		.product-title {
			font-size: 2rem;
		}

		.product-actions {
			flex-direction: row;
		}
	}

	@media (min-width: 1024px) {
		.product-layout {
			grid-template-columns: 1.2fr 1fr;
		}
	}

	/* Dark theme */
	:global(.dark) .breadcrumbs .current {
		color: var(--color-text, #f3f4f6);
	}

	:global(.dark) .product-title {
		color: var(--color-text, #f3f4f6);
	}

	:global(.dark) .product-price .price {
		color: var(--color-text, #f3f4f6);
	}

	:global(.dark) .detail-value {
		color: var(--color-text, #e5e7eb);
	}

	:global(.dark) .product-details {
		border-color: #374151;
	}

	:global(.dark) .btn-secondary {
		background: #1f2937;
		border-color: #374151;
		color: #e5e7eb;
	}
</style>
