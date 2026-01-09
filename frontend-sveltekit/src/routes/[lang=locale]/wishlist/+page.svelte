<script lang="ts">
	import type { PageData } from './$types';
	import { wishlistStore } from '$lib/stores/wishlist.svelte';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { formatPrice, type LanguageCode, type CurrencyRate } from '$lib/utils/currency';
	import { onMount } from 'svelte';
	import type { PublicShopProduct } from '$lib/data/shop.provider';

	let { data }: { data: PageData } = $props();

	const lang = data.lang as LanguageCode;
	const currencyRates: CurrencyRate[] = data.currencyRates || [];

	let products = $state<PublicShopProduct[]>([]);
	let loading = $state(true);
	let addingToCart = $state<number | null>(null);

	// Translations
	const t = {
		en: {
			title: 'My Wishlist',
			empty: 'Your wishlist is empty',
			emptySubtitle: 'Save your favorite artworks to view them later.',
			browseShop: 'Browse Shop',
			addToCart: 'Add to Cart',
			remove: 'Remove',
			sold: 'SOLD',
			inCart: 'In Cart',
			addedToCart: 'Added to cart!',
			alreadyInCart: 'Already in cart',
			backToShop: 'Back to Shop'
		},
		ru: {
			title: 'Избранное',
			empty: 'Ваш список избранного пуст',
			emptySubtitle: 'Сохраняйте понравившиеся работы, чтобы вернуться к ним позже.',
			browseShop: 'В магазин',
			addToCart: 'В корзину',
			remove: 'Удалить',
			sold: 'ПРОДАНО',
			inCart: 'В корзине',
			addedToCart: 'Добавлено в корзину!',
			alreadyInCart: 'Уже в корзине',
			backToShop: 'Вернуться в магазин'
		},
		es: {
			title: 'Mi Lista de Deseos',
			empty: 'Tu lista de deseos está vacía',
			emptySubtitle: 'Guarda tus obras favoritas para verlas más tarde.',
			browseShop: 'Explorar Tienda',
			addToCart: 'Añadir al Carrito',
			remove: 'Eliminar',
			sold: 'VENDIDO',
			inCart: 'En el Carrito',
			addedToCart: '¡Añadido al carrito!',
			alreadyInCart: 'Ya está en el carrito',
			backToShop: 'Volver a la tienda'
		},
		zh: {
			title: '我的愿望清单',
			empty: '愿望清单是空的',
			emptySubtitle: '保存您喜欢的艺术品，以便稍后查看。',
			browseShop: '浏览商店',
			addToCart: '加入购物车',
			remove: '移除',
			sold: '已售出',
			inCart: '在购物车中',
			addedToCart: '已加入购物车！',
			alreadyInCart: '已在购物车中',
			backToShop: '返回商店'
		}
	}[lang];

	// Fetch product details for wishlist items
	async function fetchProducts() {
		if (wishlistStore.items.length === 0) {
			products = [];
			loading = false;
			return;
		}

		try {
			const productIds = wishlistStore.productIds;
			const response = await fetch(`/api/shop/products?ids=${productIds.join(',')}&locale=${lang}`);
			if (response.ok) {
				const data = await response.json();
				// Map products maintaining wishlist order
				products = productIds
					.map((id) => data.products.find((p: PublicShopProduct) => p.id === id))
					.filter((p): p is PublicShopProduct => p !== null && p !== undefined);
			}
		} catch (err) {
			console.error('Failed to fetch wishlist products:', err);
		} finally {
			loading = false;
		}
	}

	// Initialize on mount
	onMount(() => {
		wishlistStore.init();
		cartStore.init();
		fetchProducts();
	});

	// Watch for wishlist changes and refetch
	$effect(() => {
		if (wishlistStore.initialized) {
			fetchProducts();
		}
	});

	// Get image URL
	function getImageUrl(product: PublicShopProduct): string {
		return product.primary_image?.url || '/images/placeholder-artwork.svg';
	}

	// Get image alt
	function getAlt(product: PublicShopProduct): string {
		return product.primary_image?.alt || product.title;
	}

	// Handle remove from wishlist
	function handleRemove(productId: number) {
		wishlistStore.remove(productId);
	}

	// Handle add to cart
	async function handleAddToCart(productId: number) {
		if (cartStore.isInCart(productId)) {
			return;
		}

		addingToCart = productId;
		const result = await cartStore.addItem(productId);
		addingToCart = null;

		if (result.success) {
			// Optionally show a toast notification
		}
	}

	const shopUrl = `/${lang}/shop`;
</script>

<svelte:head>
	<title>{t.title} | K-LIÉE</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="wishlist-page">
	<div class="container">
		<!-- Breadcrumb -->
		<nav class="breadcrumb" aria-label="Breadcrumb">
			<a href={shopUrl}>{t.backToShop}</a>
			<span class="separator">/</span>
			<span class="current">{t.title}</span>
		</nav>

		<h1>{t.title}</h1>

		{#if loading}
			<div class="loading">
				<div class="spinner"></div>
			</div>
		{:else if products.length === 0}
			<div class="empty-wishlist">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="80" height="80">
					<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
				</svg>
				<h2>{t.empty}</h2>
				<p>{t.emptySubtitle}</p>
				<a href={shopUrl} class="btn-primary">{t.browseShop}</a>
			</div>
		{:else}
			<div class="wishlist-grid">
				{#each products as product (product.id)}
					<article class="wishlist-card" class:sold={!product.is_available}>
						<a href={`/${lang}/shop/${product.slug}`} class="card-link">
							<div class="image-wrapper">
								<img
									src={getImageUrl(product)}
									alt={getAlt(product)}
									loading="lazy"
								/>
								{#if !product.is_available}
									<span class="sold-badge">{t.sold}</span>
								{/if}
							</div>
							<div class="card-info">
								<h3 class="product-title">{product.title}</h3>
								<p class="product-price">
									{#if product.is_available}
										{formatPrice(product.price_eur, lang, currencyRates)}
									{:else}
										<span class="sold-price">{t.sold}</span>
									{/if}
								</p>
							</div>
						</a>

						<div class="card-actions">
							{#if product.is_available}
								{#if cartStore.isInCart(product.id)}
									<span class="in-cart-badge">{t.inCart}</span>
								{:else}
									<button
										type="button"
										class="btn-add-cart"
										onclick={() => handleAddToCart(product.id)}
										disabled={addingToCart === product.id}
									>
										{#if addingToCart === product.id}
											<span class="spinner-small"></span>
										{:else}
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
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
								type="button"
								class="btn-remove"
								onclick={() => handleRemove(product.id)}
								aria-label={t.remove}
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.wishlist-page {
		min-height: calc(100vh - 200px);
		padding: 2rem 0 4rem;
		background-color: var(--color-bg, #fff);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
	}

	.breadcrumb a {
		color: var(--color-text-secondary, #6b7280);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: var(--color-accent, #d4af37);
	}

	.breadcrumb .separator {
		color: var(--color-text-secondary, #6b7280);
	}

	.breadcrumb .current {
		color: var(--color-text, #1a1a1a);
	}

	h1 {
		margin: 0 0 2rem;
		font-size: 2rem;
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
	}

	/* Loading */
	.loading {
		display: flex;
		justify-content: center;
		padding: 4rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-border, #e5e7eb);
		border-top-color: var(--color-accent, #d4af37);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.spinner-small {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Empty State */
	.empty-wishlist {
		text-align: center;
		padding: 4rem 1rem;
	}

	.empty-wishlist svg {
		opacity: 0.3;
		margin-bottom: 1.5rem;
	}

	.empty-wishlist h2 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		color: var(--color-text, #1a1a1a);
	}

	.empty-wishlist p {
		margin: 0 0 2rem;
		color: var(--color-text-secondary, #6b7280);
	}

	.btn-primary {
		display: inline-block;
		padding: 0.875rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-weight: 500;
		text-decoration: none;
		border-radius: 0.5rem;
		transition: opacity 0.2s;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	/* Wishlist Grid */
	.wishlist-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	/* Wishlist Card */
	.wishlist-card {
		background: var(--color-card-bg, #fff);
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: box-shadow 0.2s;
	}

	.wishlist-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.wishlist-card.sold {
		opacity: 0.7;
	}

	.card-link {
		display: block;
		text-decoration: none;
		color: inherit;
	}

	.image-wrapper {
		position: relative;
		aspect-ratio: 1;
		background: var(--color-bg-secondary, #f5f5f5);
		overflow: hidden;
	}

	.image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.wishlist-card:hover .image-wrapper img {
		transform: scale(1.05);
	}

	.sold-badge {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: #dc2626;
		color: white;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: 0.25rem;
	}

	.card-info {
		padding: 1rem;
	}

	.product-title {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.product-price {
		margin: 0.5rem 0 0;
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text, #1a1a1a);
	}

	.sold-price {
		color: #dc2626;
		font-weight: 600;
	}

	/* Card Actions */
	.card-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 1rem 1rem;
	}

	.btn-add-cart {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-add-cart:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-add-cart:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.in-cart-badge {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.625rem 1rem;
		background: var(--color-bg-secondary, #f0f0f0);
		color: var(--color-text-secondary, #6b7280);
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.375rem;
	}

	.btn-remove {
		padding: 0.625rem;
		background: rgba(220, 38, 38, 0.1);
		color: #dc2626;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-remove:hover {
		background: rgba(220, 38, 38, 0.2);
	}

	/* Responsive */
	@media (max-width: 640px) {
		h1 {
			font-size: 1.5rem;
		}

		.wishlist-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
		}

		.card-info {
			padding: 0.75rem;
		}

		.product-title {
			font-size: 0.875rem;
		}

		.product-price {
			font-size: 0.9375rem;
		}

		.card-actions {
			padding: 0 0.75rem 0.75rem;
			flex-direction: column;
		}

		.btn-add-cart,
		.in-cart-badge {
			width: 100%;
		}

		.btn-remove {
			position: absolute;
			top: 0.5rem;
			right: 0.5rem;
			background: rgba(255, 255, 255, 0.9);
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}

		.wishlist-card {
			position: relative;
		}
	}

	/* Dark theme - Apple Style */
	:global(.dark) .wishlist-page {
		background-color: var(--bg-primary);
	}

	:global(.dark) .breadcrumb a {
		color: var(--text-secondary);
	}

	:global(.dark) .breadcrumb .separator {
		color: var(--text-tertiary);
	}

	:global(.dark) .breadcrumb .current {
		color: var(--text-primary);
	}

	:global(.dark) h1 {
		color: var(--text-primary);
	}

	:global(.dark) .spinner {
		border-color: var(--border-primary);
		border-top-color: var(--accent);
	}

	:global(.dark) .empty-wishlist h2 {
		color: var(--text-primary);
	}

	:global(.dark) .empty-wishlist p {
		color: var(--text-secondary);
	}

	:global(.dark) .empty-wishlist svg {
		color: var(--text-tertiary);
	}

	:global(.dark) .btn-primary {
		background: var(--accent);
		color: var(--bg-primary);
	}

	:global(.dark) .btn-primary:hover {
		background: var(--accent-dark);
	}

	:global(.dark) .wishlist-card {
		background: var(--bg-secondary);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	:global(.dark) .wishlist-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}

	:global(.dark) .image-wrapper {
		background: var(--bg-tertiary);
	}

	:global(.dark) .product-title {
		color: var(--text-primary);
	}

	:global(.dark) .product-price {
		color: var(--text-primary);
	}

	:global(.dark) .btn-add-cart {
		background: var(--accent);
		color: var(--bg-primary);
	}

	:global(.dark) .btn-add-cart:hover:not(:disabled) {
		background: var(--accent-dark);
	}

	:global(.dark) .in-cart-badge {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
	}

	:global(.dark) .btn-remove {
		background: rgba(220, 38, 38, 0.15);
	}

	:global(.dark) .btn-remove:hover {
		background: rgba(220, 38, 38, 0.25);
	}

	@media (max-width: 640px) {
		:global(.dark) .btn-remove {
			background: var(--bg-secondary);
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		}
	}
</style>
