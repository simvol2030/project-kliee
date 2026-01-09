<script lang="ts">
	import type { PublicShopProduct } from '$lib/data/shop.provider';
	import type { CurrencyRate, LanguageCode } from '$lib/utils/currency';
	import { formatPrice } from '$lib/utils/currency';

	// Technique translations
	const techniqueTranslations: Record<string, Record<LanguageCode, string>> = {
		'Acrylic on Canvas': {
			en: 'Acrylic on Canvas',
			ru: 'Акрил на холсте',
			es: 'Acrílico sobre lienzo',
			zh: '亚克力画布'
		},
		'Digital on Paper': {
			en: 'Digital on Paper',
			ru: 'Цифровая печать на бумаге',
			es: 'Digital sobre papel',
			zh: '数码纸上印刷'
		},
		'Oil on Canvas': {
			en: 'Oil on Canvas',
			ru: 'Масло на холсте',
			es: 'Óleo sobre lienzo',
			zh: '油画布'
		}
	};

	interface Props {
		product: PublicShopProduct;
		lang: LanguageCode;
		currencyRates?: CurrencyRate[];
		onAddToCart?: (productId: number) => void;
		onToggleWishlist?: (productId: number) => void;
		isInWishlist?: boolean;
		loading?: boolean;
	}

	let {
		product,
		lang,
		currencyRates = [],
		onAddToCart,
		onToggleWishlist,
		isInWishlist = false,
		loading = false
	}: Props = $props();

	// Title is already localized by the provider
	const title = $derived(product.title);

	// Description is already localized by the provider
	const description = $derived(product.description);

	// Translate technique
	const translatedTechnique = $derived(
		product.technique
			? techniqueTranslations[product.technique]?.[lang] || product.technique
			: null
	);

	// Get image alt
	const imageAlt = $derived(product.primary_image?.alt || title);

	// Format price (price_eur is in cents, formatPrice expects cents)
	const formattedPrice = $derived(formatPrice(product.price_eur, lang, currencyRates));

	// Is sold/unavailable
	const isSold = $derived(!product.is_available);

	// Product URL
	const productUrl = $derived(`/${lang}/shop/${product.slug}`);

	// Image URL
	const imageUrl = $derived(
		product.primary_image
			? product.primary_image.url
			: '/images/placeholder-artwork.svg'
	);

	function handleAddToCart(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (onAddToCart && !isSold) {
			onAddToCart(product.id);
		}
	}

	function handleToggleWishlist(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (onToggleWishlist) {
			onToggleWishlist(product.id);
		}
	}
</script>

{#if loading}
	<article class="product-card skeleton">
		<div class="image-wrapper skeleton-image"></div>
		<div class="product-info">
			<div class="skeleton-text title"></div>
			<div class="skeleton-text series"></div>
			<div class="skeleton-text price"></div>
		</div>
	</article>
{:else}
	<article class="product-card" class:sold={isSold}>
		<a href={productUrl} class="card-link">
			<div class="image-wrapper">
				<img src={imageUrl} alt={imageAlt} loading="lazy" />
				<div class="image-overlay">
					<span class="view-details">View Details</span>
				</div>

				{#if product.is_featured}
					<span class="badge featured">Featured</span>
				{/if}

				{#if isSold}
					<span class="badge sold">SOLD</span>
				{/if}

				<div class="quick-actions">
					<button
						type="button"
						class="action-btn wishlist"
						class:active={isInWishlist}
						onclick={handleToggleWishlist}
						aria-label={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
					>
						<svg viewBox="0 0 24 24" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
							<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
						</svg>
					</button>

					{#if !isSold}
						<button
							type="button"
							class="action-btn cart"
							onclick={handleAddToCart}
							aria-label="Add to Cart"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
								<line x1="3" y1="6" x2="21" y2="6" />
								<path d="M16 10a4 4 0 0 1-8 0" />
							</svg>
						</button>
					{/if}
				</div>
			</div>

			<div class="product-info">
				<h3 class="product-title">{title}</h3>

				{#if translatedTechnique}
					<p class="product-series">{translatedTechnique}</p>
				{/if}

				<p class="product-price" class:sold={isSold}>
					{#if isSold}
						<span class="sold-label">SOLD</span>
					{:else}
						{formattedPrice}
					{/if}
				</p>
			</div>
		</a>
	</article>
{/if}

<style>
	.product-card {
		background: var(--color-card-bg, #fff);
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.product-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	}

	.product-card.sold {
		opacity: 0.85;
	}

	.card-link {
		text-decoration: none;
		color: inherit;
		display: block;
	}

	.image-wrapper {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		background: var(--color-bg-secondary, #f5f5f5);
	}

	.image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.product-card:hover .image-wrapper img {
		transform: scale(1.05);
	}

	.image-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.product-card:hover .image-overlay {
		opacity: 1;
	}

	.view-details {
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.5rem 1rem;
		border: 1px solid white;
		border-radius: 0.25rem;
	}

	.badge {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: 0.25rem;
	}

	.badge.featured {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.badge.sold {
		background: #dc2626;
		color: white;
		top: 0.75rem;
		left: auto;
		right: 0.75rem;
	}

	.quick-actions {
		position: absolute;
		bottom: 0.75rem;
		right: 0.75rem;
		display: flex;
		gap: 0.5rem;
		opacity: 1;
		transform: translateY(0);
	}

	.action-btn {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: none;
		background: white;
		color: #333;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s, color 0.2s, transform 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.action-btn:hover {
		transform: scale(1.1);
	}

	.action-btn svg {
		width: 18px;
		height: 18px;
	}

	.action-btn.wishlist:hover,
	.action-btn.wishlist.active {
		color: #dc2626;
	}

	.action-btn.cart:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.product-info {
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

	.product-series {
		margin: 0.25rem 0 0;
		font-size: 0.75rem;
		color: var(--color-text-secondary, #6b7280);
	}

	.product-price {
		margin: 0.5rem 0 0;
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text, #1a1a1a);
	}

	.product-price.sold {
		color: #dc2626;
	}

	.sold-label {
		font-size: 0.875rem;
		font-weight: 600;
	}

	/* Skeleton loading state */
	.skeleton .image-wrapper {
		background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}

	.skeleton-text {
		background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 0.25rem;
	}

	.skeleton-text.title {
		height: 1rem;
		width: 80%;
		margin-bottom: 0.5rem;
	}

	.skeleton-text.series {
		height: 0.75rem;
		width: 50%;
		margin-bottom: 0.5rem;
	}

	.skeleton-text.price {
		height: 1rem;
		width: 30%;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	/* Dark theme - Using .dark class from mode-watcher */
	:global(.dark) .product-card {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global(.dark) .image-wrapper {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global(.dark) .product-title {
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .product-series {
		color: var(--text-secondary, #8e8e93);
	}

	:global(.dark) .product-price {
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .action-btn {
		background: var(--bg-tertiary, #2c2c2e);
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .action-btn.cart:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	:global(.dark) .skeleton .image-wrapper,
	:global(.dark) .skeleton-text {
		background: linear-gradient(90deg, #2c2c2e 0%, #38383a 50%, #2c2c2e 100%);
		background-size: 200% 100%;
	}

	/* Mobile adjustments */
	@media (max-width: 480px) {
		.action-btn {
			width: 32px;
			height: 32px;
		}

		.action-btn svg {
			width: 16px;
			height: 16px;
		}

		.product-info {
			padding: 0.75rem;
		}

		.product-title {
			font-size: 0.875rem;
		}

		.product-price {
			font-size: 0.9375rem;
		}
	}
</style>
