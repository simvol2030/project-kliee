<script lang="ts">
	import { cartStore } from '$lib/stores/cart.svelte';
	import { formatPrice, type LanguageCode, type CurrencyRate } from '$lib/utils/currency';
	import { onMount } from 'svelte';

	interface Props {
		lang: LanguageCode;
		currencyRates?: CurrencyRate[];
	}

	let { lang, currencyRates = [] }: Props = $props();

	let isOpen = $state(false);

	// Translations
	const t = $derived(
		{
			en: {
				cart: 'Shopping Cart',
				empty: 'Your cart is empty',
				viewCart: 'View Cart',
				checkout: 'Checkout',
				subtotal: 'Subtotal',
				remove: 'Remove'
			},
			ru: {
				cart: 'Корзина',
				empty: 'Корзина пуста',
				viewCart: 'Просмотр корзины',
				checkout: 'Оформить заказ',
				subtotal: 'Итого',
				remove: 'Удалить'
			},
			es: {
				cart: 'Carrito',
				empty: 'Tu carrito está vacío',
				viewCart: 'Ver carrito',
				checkout: 'Finalizar compra',
				subtotal: 'Subtotal',
				remove: 'Eliminar'
			},
			zh: {
				cart: '购物车',
				empty: '购物车是空的',
				viewCart: '查看购物车',
				checkout: '结账',
				subtotal: '小计',
				remove: '移除'
			}
		}[lang] || {
			cart: 'Shopping Cart',
			empty: 'Your cart is empty',
			viewCart: 'View Cart',
			checkout: 'Checkout',
			subtotal: 'Subtotal',
			remove: 'Remove'
		}
	);

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
	async function handleRemove(artworkId: string) {
		await cartStore.removeItem(artworkId);
	}

	// Format subtotal
	const formattedSubtotal = $derived(formatPrice(cartStore.totalEur, lang, currencyRates));

	const cartUrl = $derived(`/${lang}/cart`);
	const checkoutUrl = $derived(`/${lang}/checkout`);
</script>

<div
	class="cart-dropdown-wrapper"
	onmouseenter={() => (isOpen = true)}
	onmouseleave={() => (isOpen = false)}
	role="presentation"
>
	<a href={cartUrl} class="cart-trigger" aria-label={t.cart}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
			<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
			<line x1="3" y1="6" x2="21" y2="6" />
			<path d="M16 10a4 4 0 0 1-8 0" />
		</svg>
		{#if cartStore.count > 0}
			<span class="cart-badge">{cartStore.count}</span>
		{/if}
	</a>

	{#if isOpen}
		<div class="cart-dropdown">
			<div class="dropdown-header">
				<h3>{t.cart}</h3>
				{#if cartStore.count > 0}
					<span class="item-count">({cartStore.count})</span>
				{/if}
			</div>

			{#if cartStore.items.length === 0}
				<div class="empty-cart">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
						<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
						<line x1="3" y1="6" x2="21" y2="6" />
						<path d="M16 10a4 4 0 0 1-8 0" />
					</svg>
					<p>{t.empty}</p>
				</div>
			{:else}
				<ul class="cart-items">
					{#each cartStore.items.slice(0, 3) as item (item.id)}
						<li class="cart-item">
							<a href={`/${lang}/shop/${item.slug || item.artwork_id}`} class="item-link">
								{#if item.image}
									<img
										src={`/uploads/${item.image.stored_filename}`}
										alt={getAlt(item)}
										class="item-image"
										loading="lazy"
									/>
								{:else}
									<div class="item-image placeholder"></div>
								{/if}
								<div class="item-details">
									<p class="item-title">{getTitle(item)}</p>
									<p class="item-price">{formatPrice(item.price || 0, lang, currencyRates)}</p>
								</div>
							</a>
							<button
								type="button"
								class="remove-btn"
								onclick={() => handleRemove(item.artwork_id)}
								aria-label={t.remove}
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</li>
					{/each}
					{#if cartStore.items.length > 3}
						<li class="more-items">
							+{cartStore.items.length - 3} more
						</li>
					{/if}
				</ul>

				<div class="dropdown-footer">
					<div class="subtotal">
						<span>{t.subtotal}:</span>
						<strong>{formattedSubtotal}</strong>
					</div>
					<div class="actions">
						<a href={cartUrl} class="btn-secondary">{t.viewCart}</a>
						<a href={checkoutUrl} class="btn-primary">{t.checkout}</a>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.cart-dropdown-wrapper {
		position: relative;
	}

	.cart-trigger {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		color: var(--color-text, #1a1a1a);
		text-decoration: none;
		transition: color 0.2s;
	}

	.cart-trigger:hover {
		color: var(--color-accent, #d4af37);
	}

	.cart-trigger svg {
		display: block;
	}

	.cart-badge {
		position: absolute;
		top: 0;
		right: 0;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 0.625rem;
		font-weight: 700;
		line-height: 18px;
		text-align: center;
		border-radius: 9px;
		transform: translate(25%, -25%);
	}

	.cart-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		width: 320px;
		background: var(--color-card-bg, #fff);
		border-radius: 0.5rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
		z-index: 1000;
		overflow: hidden;
		animation: dropdownFadeIn 0.2s ease;
	}

	@keyframes dropdownFadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dropdown-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.dropdown-header h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.item-count {
		color: var(--color-text-secondary, #6b7280);
		font-size: 0.875rem;
	}

	.empty-cart {
		padding: 2rem;
		text-align: center;
		color: var(--color-text-secondary, #6b7280);
	}

	.empty-cart svg {
		opacity: 0.5;
		margin-bottom: 0.5rem;
	}

	.empty-cart p {
		margin: 0;
		font-size: 0.875rem;
	}

	.cart-items {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 240px;
		overflow-y: auto;
	}

	.cart-item {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.cart-item:last-child {
		border-bottom: none;
	}

	.item-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		text-decoration: none;
		color: inherit;
	}

	.item-image {
		width: 48px;
		height: 48px;
		object-fit: cover;
		border-radius: 0.25rem;
		background: var(--color-bg-secondary, #f5f5f5);
	}

	.item-image.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.item-details {
		flex: 1;
		min-width: 0;
	}

	.item-title {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.item-price {
		margin: 0.25rem 0 0;
		font-size: 0.75rem;
		color: var(--color-text-secondary, #6b7280);
	}

	.remove-btn {
		padding: 0.25rem;
		background: none;
		border: none;
		color: var(--color-text-secondary, #6b7280);
		cursor: pointer;
		transition: color 0.2s;
	}

	.remove-btn:hover {
		color: #dc2626;
	}

	.more-items {
		padding: 0.75rem 1rem;
		text-align: center;
		color: var(--color-text-secondary, #6b7280);
		font-size: 0.875rem;
	}

	.dropdown-footer {
		padding: 1rem;
		background: var(--color-bg-secondary, #f9fafb);
		border-top: 1px solid var(--color-border, #e5e7eb);
	}

	.subtotal {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.subtotal strong {
		font-size: 1rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-secondary,
	.btn-primary {
		flex: 1;
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		text-align: center;
		text-decoration: none;
		border-radius: 0.375rem;
		transition: all 0.2s;
	}

	.btn-secondary {
		background: var(--color-card-bg, #fff);
		color: var(--color-text, #1a1a1a);
		border: 1px solid var(--color-border, #e5e7eb);
	}

	.btn-secondary:hover {
		background: var(--color-bg-secondary, #f5f5f5);
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	/* Dark theme */
	:global([data-theme='dark']) .cart-trigger {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .cart-dropdown {
		background: var(--color-card-bg, #1f2937);
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
	}

	:global([data-theme='dark']) .dropdown-footer {
		background: rgba(0, 0, 0, 0.2);
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
