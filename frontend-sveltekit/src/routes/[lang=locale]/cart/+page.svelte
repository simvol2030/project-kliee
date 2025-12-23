<script lang="ts">
	import type { PageData } from './$types';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { formatPrice, type LanguageCode, type CurrencyRate } from '$lib/utils/currency';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	const lang = data.lang as LanguageCode;
	const currencyRates: CurrencyRate[] = data.currencyRates || [];

	// Translations
	const t = {
		en: {
			title: 'Shopping Cart',
			empty: 'Your cart is empty',
			emptySubtitle: 'Browse our collection to find the perfect artwork for you.',
			browseShop: 'Browse Shop',
			product: 'Product',
			price: 'Price',
			remove: 'Remove',
			subtotal: 'Subtotal',
			shipping: 'Shipping',
			shippingNote: 'Calculated at checkout',
			total: 'Total',
			continueShopping: 'Continue Shopping',
			checkout: 'Proceed to Checkout',
			clearCart: 'Clear Cart',
			confirmClear: 'Are you sure you want to clear your cart?',
			itemRemoved: 'Item removed from cart',
			backToShop: 'Back to Shop'
		},
		ru: {
			title: 'Корзина',
			empty: 'Ваша корзина пуста',
			emptySubtitle: 'Просмотрите нашу коллекцию, чтобы найти идеальную работу для вас.',
			browseShop: 'В магазин',
			product: 'Товар',
			price: 'Цена',
			remove: 'Удалить',
			subtotal: 'Подытог',
			shipping: 'Доставка',
			shippingNote: 'Рассчитывается при оформлении',
			total: 'Итого',
			continueShopping: 'Продолжить покупки',
			checkout: 'Оформить заказ',
			clearCart: 'Очистить корзину',
			confirmClear: 'Вы уверены, что хотите очистить корзину?',
			itemRemoved: 'Товар удалён из корзины',
			backToShop: 'Вернуться в магазин'
		},
		es: {
			title: 'Carrito de Compras',
			empty: 'Tu carrito está vacío',
			emptySubtitle: 'Explora nuestra colección para encontrar la obra perfecta para ti.',
			browseShop: 'Explorar Tienda',
			product: 'Producto',
			price: 'Precio',
			remove: 'Eliminar',
			subtotal: 'Subtotal',
			shipping: 'Envío',
			shippingNote: 'Calculado en el checkout',
			total: 'Total',
			continueShopping: 'Continuar Comprando',
			checkout: 'Finalizar Compra',
			clearCart: 'Vaciar Carrito',
			confirmClear: '¿Estás seguro de que quieres vaciar tu carrito?',
			itemRemoved: 'Artículo eliminado del carrito',
			backToShop: 'Volver a la tienda'
		},
		zh: {
			title: '购物车',
			empty: '购物车是空的',
			emptySubtitle: '浏览我们的收藏，找到适合您的完美艺术品。',
			browseShop: '浏览商店',
			product: '产品',
			price: '价格',
			remove: '移除',
			subtotal: '小计',
			shipping: '运费',
			shippingNote: '结账时计算',
			total: '总计',
			continueShopping: '继续购物',
			checkout: '去结账',
			clearCart: '清空购物车',
			confirmClear: '确定要清空购物车吗？',
			itemRemoved: '商品已从购物车移除',
			backToShop: '返回商店'
		}
	}[lang];

	// Get title by language
	function getTitle(item: (typeof cartStore.items)[0]): string {
		switch (lang) {
			case 'ru':
				return item.title_ru;
			case 'es':
				return item.title_es;
			case 'zh':
				return item.title_zh;
			default:
				return item.title_en;
		}
	}

	// Get image alt by language
	function getAlt(item: (typeof cartStore.items)[0]): string {
		if (!item.image) return getTitle(item);
		switch (lang) {
			case 'ru':
				return item.image.alt_ru || getTitle(item);
			case 'es':
				return item.image.alt_es || getTitle(item);
			case 'zh':
				return item.image.alt_zh || getTitle(item);
			default:
				return item.image.alt_en || getTitle(item);
		}
	}

	// Initialize cart on mount
	onMount(() => {
		cartStore.init();
	});

	// Handle remove item
	async function handleRemove(productId: number) {
		await cartStore.removeItem(productId);
	}

	// Handle clear cart
	async function handleClearCart() {
		if (confirm(t.confirmClear)) {
			await cartStore.clear();
		}
	}

	// Format subtotal
	const formattedSubtotal = $derived(formatPrice(cartStore.totalEur, lang, currencyRates));

	const shopUrl = `/${lang}/shop`;
	const checkoutUrl = `/${lang}/checkout`;
</script>

<svelte:head>
	<title>{t.title} | K-LIÉE</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="cart-page">
	<div class="container">
		<!-- Breadcrumb -->
		<nav class="breadcrumb" aria-label="Breadcrumb">
			<a href={shopUrl}>{t.backToShop}</a>
			<span class="separator">/</span>
			<span class="current">{t.title}</span>
		</nav>

		<h1>{t.title}</h1>

		{#if cartStore.items.length === 0}
			<div class="empty-cart">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="80" height="80">
					<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
					<line x1="3" y1="6" x2="21" y2="6" />
					<path d="M16 10a4 4 0 0 1-8 0" />
				</svg>
				<h2>{t.empty}</h2>
				<p>{t.emptySubtitle}</p>
				<a href={shopUrl} class="btn-primary">{t.browseShop}</a>
			</div>
		{:else}
			<div class="cart-layout">
				<!-- Cart Items -->
				<div class="cart-items-section">
					<div class="cart-header">
						<span class="col-product">{t.product}</span>
						<span class="col-price">{t.price}</span>
						<span class="col-action"></span>
					</div>

					<ul class="cart-items">
						{#each cartStore.items as item (item.id)}
							<li class="cart-item">
								<div class="item-info">
									<a href={`/${lang}/shop/${item.slug}`} class="item-image-link">
										{#if item.image}
											<img
												src={item.image.url}
												alt={getAlt(item)}
												class="item-image"
												loading="lazy"
											/>
										{:else}
											<div class="item-image placeholder"></div>
										{/if}
									</a>
									<div class="item-details">
										<a href={`/${lang}/shop/${item.slug}`} class="item-title">
											{getTitle(item)}
										</a>
										{#if !item.is_available}
											<span class="sold-badge">SOLD</span>
										{/if}
									</div>
								</div>
								<div class="item-price">
									{formatPrice(item.price_eur, lang, currencyRates)}
								</div>
								<div class="item-action">
									<button
										type="button"
										class="remove-btn"
										onclick={() => handleRemove(item.product_id)}
										aria-label={t.remove}
									>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
											<polyline points="3,6 5,6 21,6" />
											<path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2" />
											<line x1="10" y1="11" x2="10" y2="17" />
											<line x1="14" y1="11" x2="14" y2="17" />
										</svg>
									</button>
								</div>
							</li>
						{/each}
					</ul>

					<div class="cart-actions">
						<a href={shopUrl} class="btn-secondary">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
								<line x1="19" y1="12" x2="5" y2="12" />
								<polyline points="12,19 5,12 12,5" />
							</svg>
							{t.continueShopping}
						</a>
						<button type="button" class="btn-danger" onclick={handleClearCart}>
							{t.clearCart}
						</button>
					</div>
				</div>

				<!-- Order Summary -->
				<aside class="order-summary">
					<h2>{t.total}</h2>

					<div class="summary-row">
						<span>{t.subtotal}</span>
						<span>{formattedSubtotal}</span>
					</div>

					<div class="summary-row shipping">
						<span>{t.shipping}</span>
						<span class="note">{t.shippingNote}</span>
					</div>

					<div class="summary-total">
						<span>{t.total}</span>
						<span class="total-price">{formattedSubtotal}</span>
					</div>

					<a href={checkoutUrl} class="btn-checkout">{t.checkout}</a>
				</aside>
			</div>
		{/if}
	</div>
</div>

<style>
	.cart-page {
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

	/* Empty Cart */
	.empty-cart {
		text-align: center;
		padding: 4rem 1rem;
	}

	.empty-cart svg {
		opacity: 0.3;
		margin-bottom: 1.5rem;
	}

	.empty-cart h2 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		color: var(--color-text, #1a1a1a);
	}

	.empty-cart p {
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

	/* Cart Layout */
	.cart-layout {
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: 2rem;
	}

	/* Cart Items Section */
	.cart-items-section {
		background: var(--color-card-bg, #fff);
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.cart-header {
		display: grid;
		grid-template-columns: 1fr 120px 60px;
		gap: 1rem;
		padding: 1rem 1.5rem;
		background: var(--color-bg-secondary, #f9fafb);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-secondary, #6b7280);
	}

	.cart-items {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.cart-item {
		display: grid;
		grid-template-columns: 1fr 120px 60px;
		gap: 1rem;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.cart-item:last-child {
		border-bottom: none;
	}

	.item-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.item-image-link {
		flex-shrink: 0;
	}

	.item-image {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border-radius: 0.375rem;
		background: var(--color-bg-secondary, #f5f5f5);
	}

	.item-image.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.item-details {
		min-width: 0;
	}

	.item-title {
		display: block;
		font-weight: 500;
		color: var(--color-text, #1a1a1a);
		text-decoration: none;
		line-height: 1.4;
	}

	.item-title:hover {
		color: var(--color-accent, #d4af37);
	}

	.sold-badge {
		display: inline-block;
		margin-top: 0.25rem;
		padding: 0.125rem 0.375rem;
		background: #dc2626;
		color: white;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		border-radius: 0.25rem;
	}

	.item-price {
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
	}

	.item-action {
		text-align: center;
	}

	.remove-btn {
		padding: 0.5rem;
		background: none;
		border: none;
		color: var(--color-text-secondary, #6b7280);
		cursor: pointer;
		border-radius: 0.375rem;
		transition: all 0.2s;
	}

	.remove-btn:hover {
		color: #dc2626;
		background: rgba(220, 38, 38, 0.1);
	}

	/* Cart Actions */
	.cart-actions {
		display: flex;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--color-border, #e5e7eb);
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: var(--color-card-bg, #fff);
		color: var(--color-text, #1a1a1a);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.375rem;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: var(--color-bg-secondary, #f5f5f5);
	}

	.btn-danger {
		padding: 0.625rem 1.25rem;
		background: rgba(220, 38, 38, 0.1);
		color: #dc2626;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-danger:hover {
		background: rgba(220, 38, 38, 0.2);
	}

	/* Order Summary */
	.order-summary {
		background: var(--color-card-bg, #fff);
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
		height: fit-content;
		position: sticky;
		top: 2rem;
	}

	.order-summary h2 {
		margin: 0 0 1.5rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
		font-size: 0.9375rem;
		color: var(--color-text, #1a1a1a);
	}

	.summary-row.shipping .note {
		color: var(--color-text-secondary, #6b7280);
		font-size: 0.8125rem;
	}

	.summary-total {
		display: flex;
		justify-content: space-between;
		padding-top: 1rem;
		margin-top: 1rem;
		border-top: 1px solid var(--color-border, #e5e7eb);
		font-weight: 600;
		font-size: 1.125rem;
	}

	.total-price {
		color: var(--color-text, #1a1a1a);
	}

	.btn-checkout {
		display: block;
		width: 100%;
		padding: 1rem;
		margin-top: 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 1rem;
		font-weight: 600;
		text-align: center;
		text-decoration: none;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-checkout:hover {
		opacity: 0.9;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.cart-layout {
			grid-template-columns: 1fr;
		}

		.order-summary {
			position: static;
		}
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 1.5rem;
		}

		.cart-header {
			display: none;
		}

		.cart-item {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.item-info {
			gap: 0.75rem;
		}

		.item-image {
			width: 64px;
			height: 64px;
		}

		.item-price {
			padding-left: calc(64px + 0.75rem);
		}

		.item-action {
			position: absolute;
			top: 1.25rem;
			right: 1.5rem;
		}

		.cart-item {
			position: relative;
		}

		.cart-actions {
			flex-direction: column;
			gap: 0.75rem;
		}

		.btn-secondary,
		.btn-danger {
			width: 100%;
			justify-content: center;
		}
	}

	/* Dark theme */
	:global([data-theme='dark']) .cart-page {
		background-color: var(--color-bg, #111827);
	}

	:global([data-theme='dark']) .breadcrumb .current {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) h1 {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .empty-cart h2 {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .cart-items-section {
		background: var(--color-card-bg, #1f2937);
	}

	:global([data-theme='dark']) .cart-header {
		background: rgba(0, 0, 0, 0.2);
	}

	:global([data-theme='dark']) .item-title {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .item-price {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .order-summary {
		background: var(--color-card-bg, #1f2937);
	}

	:global([data-theme='dark']) .order-summary h2 {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .summary-row {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .total-price {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .btn-secondary {
		background: var(--color-card-bg, #374151);
		color: var(--color-text, #f3f4f6);
		border-color: var(--color-border, #4b5563);
	}

	:global([data-theme='dark']) .btn-secondary:hover {
		background: rgba(255, 255, 255, 0.1);
	}
</style>
