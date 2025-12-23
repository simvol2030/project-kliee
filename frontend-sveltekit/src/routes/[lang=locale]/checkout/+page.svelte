<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { formatPrice, type LanguageCode, type CurrencyRate } from '$lib/utils/currency';
	import { countries, getCountryName } from '$lib/utils/countries';

	let { data }: { data: PageData } = $props();

	const lang = data.lang as LanguageCode;
	const currencyRates: CurrencyRate[] = data.currencyRates || [];
	const cart = data.cart;

	// Form state
	let formData = $state({
		customer_name: '',
		customer_email: '',
		customer_phone: '',
		shipping_country: '',
		shipping_city: '',
		shipping_address: '',
		shipping_postal: '',
		note: ''
	});

	let errors = $state<Record<string, string>>({});
	let submitting = $state(false);
	let generalError = $state<string | null>(null);

	// Translations
	const t = {
		en: {
			title: 'Checkout',
			contactInfo: 'Contact Information',
			name: 'Full Name',
			email: 'Email',
			phone: 'Phone (optional)',
			shippingInfo: 'Shipping Address',
			country: 'Country',
			selectCountry: 'Select a country',
			city: 'City',
			address: 'Street Address',
			postal: 'Postal Code',
			orderNotes: 'Order Notes',
			notePlaceholder: 'Any special instructions...',
			orderSummary: 'Order Summary',
			subtotal: 'Subtotal',
			shipping: 'Shipping',
			shippingNote: 'To be calculated',
			total: 'Total',
			placeOrder: 'Place Order',
			processing: 'Processing...',
			backToCart: 'Back to Cart',
			required: 'This field is required',
			invalidEmail: 'Invalid email format',
			orderError: 'Failed to place order. Please try again.'
		},
		ru: {
			title: 'Оформление заказа',
			contactInfo: 'Контактная информация',
			name: 'Полное имя',
			email: 'Email',
			phone: 'Телефон (необязательно)',
			shippingInfo: 'Адрес доставки',
			country: 'Страна',
			selectCountry: 'Выберите страну',
			city: 'Город',
			address: 'Улица, дом, квартира',
			postal: 'Почтовый индекс',
			orderNotes: 'Примечания к заказу',
			notePlaceholder: 'Особые пожелания...',
			orderSummary: 'Ваш заказ',
			subtotal: 'Подытог',
			shipping: 'Доставка',
			shippingNote: 'Рассчитывается отдельно',
			total: 'Итого',
			placeOrder: 'Оформить заказ',
			processing: 'Обработка...',
			backToCart: 'Вернуться в корзину',
			required: 'Это поле обязательно',
			invalidEmail: 'Неверный формат email',
			orderError: 'Не удалось оформить заказ. Попробуйте ещё раз.'
		},
		es: {
			title: 'Finalizar Compra',
			contactInfo: 'Información de Contacto',
			name: 'Nombre Completo',
			email: 'Email',
			phone: 'Teléfono (opcional)',
			shippingInfo: 'Dirección de Envío',
			country: 'País',
			selectCountry: 'Selecciona un país',
			city: 'Ciudad',
			address: 'Dirección',
			postal: 'Código Postal',
			orderNotes: 'Notas del Pedido',
			notePlaceholder: 'Instrucciones especiales...',
			orderSummary: 'Resumen del Pedido',
			subtotal: 'Subtotal',
			shipping: 'Envío',
			shippingNote: 'Se calculará después',
			total: 'Total',
			placeOrder: 'Realizar Pedido',
			processing: 'Procesando...',
			backToCart: 'Volver al Carrito',
			required: 'Este campo es obligatorio',
			invalidEmail: 'Formato de email inválido',
			orderError: 'Error al realizar el pedido. Inténtalo de nuevo.'
		},
		zh: {
			title: '结账',
			contactInfo: '联系信息',
			name: '姓名',
			email: '电子邮件',
			phone: '电话（可选）',
			shippingInfo: '收货地址',
			country: '国家',
			selectCountry: '选择国家',
			city: '城市',
			address: '详细地址',
			postal: '邮政编码',
			orderNotes: '订单备注',
			notePlaceholder: '特殊说明...',
			orderSummary: '订单摘要',
			subtotal: '小计',
			shipping: '运费',
			shippingNote: '另行计算',
			total: '总计',
			placeOrder: '提交订单',
			processing: '处理中...',
			backToCart: '返回购物车',
			required: '此字段为必填项',
			invalidEmail: '无效的邮箱格式',
			orderError: '下单失败，请重试。'
		}
	}[lang];

	// Get title by language
	function getTitle(item: (typeof cart.items)[0]): string {
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

	// Validate form
	function validateForm(): boolean {
		const newErrors: Record<string, string> = {};

		if (!formData.customer_name.trim()) {
			newErrors.customer_name = t.required;
		}

		if (!formData.customer_email.trim()) {
			newErrors.customer_email = t.required;
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.customer_email)) {
				newErrors.customer_email = t.invalidEmail;
			}
		}

		if (!formData.shipping_country) {
			newErrors.shipping_country = t.required;
		}

		if (!formData.shipping_city.trim()) {
			newErrors.shipping_city = t.required;
		}

		if (!formData.shipping_address.trim()) {
			newErrors.shipping_address = t.required;
		}

		if (!formData.shipping_postal.trim()) {
			newErrors.shipping_postal = t.required;
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	// Handle form submission
	async function handleSubmit(e: Event) {
		e.preventDefault();
		generalError = null;

		if (!validateForm()) {
			return;
		}

		submitting = true;

		try {
			const response = await fetch('/api/shop/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...formData,
					lang
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || 'Order failed');
			}

			const result = await response.json();

			// Redirect to confirmation page
			goto(`/${lang}/order-confirmation?number=${result.order_number}`);
		} catch (err) {
			console.error('Order error:', err);
			generalError = t.orderError;
		} finally {
			submitting = false;
		}
	}

	// Format total
	const formattedTotal = $derived(formatPrice(cart.total_eur, lang, currencyRates));

	const cartUrl = `/${lang}/cart`;
</script>

<svelte:head>
	<title>{t.title} | K-LIÉE</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="checkout-page">
	<div class="container">
		<h1>{t.title}</h1>

		{#if generalError}
			<div class="error-banner" role="alert">
				{generalError}
			</div>
		{/if}

		<form class="checkout-layout" onsubmit={handleSubmit}>
			<!-- Left Column: Form -->
			<div class="checkout-form">
				<!-- Contact Information -->
				<section class="form-section">
					<h2>{t.contactInfo}</h2>

					<div class="form-group">
						<label for="customer_name">{t.name} *</label>
						<input
							type="text"
							id="customer_name"
							bind:value={formData.customer_name}
							class:error={errors.customer_name}
							disabled={submitting}
						/>
						{#if errors.customer_name}
							<span class="error-text">{errors.customer_name}</span>
						{/if}
					</div>

					<div class="form-group">
						<label for="customer_email">{t.email} *</label>
						<input
							type="email"
							id="customer_email"
							bind:value={formData.customer_email}
							class:error={errors.customer_email}
							disabled={submitting}
						/>
						{#if errors.customer_email}
							<span class="error-text">{errors.customer_email}</span>
						{/if}
					</div>

					<div class="form-group">
						<label for="customer_phone">{t.phone}</label>
						<input
							type="tel"
							id="customer_phone"
							bind:value={formData.customer_phone}
							disabled={submitting}
						/>
					</div>
				</section>

				<!-- Shipping Information -->
				<section class="form-section">
					<h2>{t.shippingInfo}</h2>

					<div class="form-group">
						<label for="shipping_country">{t.country} *</label>
						<select
							id="shipping_country"
							bind:value={formData.shipping_country}
							class:error={errors.shipping_country}
							disabled={submitting}
						>
							<option value="">{t.selectCountry}</option>
							{#each countries as country}
								<option value={country.code}>{getCountryName(country, lang)}</option>
							{/each}
						</select>
						{#if errors.shipping_country}
							<span class="error-text">{errors.shipping_country}</span>
						{/if}
					</div>

					<div class="form-row">
						<div class="form-group">
							<label for="shipping_city">{t.city} *</label>
							<input
								type="text"
								id="shipping_city"
								bind:value={formData.shipping_city}
								class:error={errors.shipping_city}
								disabled={submitting}
							/>
							{#if errors.shipping_city}
								<span class="error-text">{errors.shipping_city}</span>
							{/if}
						</div>

						<div class="form-group">
							<label for="shipping_postal">{t.postal} *</label>
							<input
								type="text"
								id="shipping_postal"
								bind:value={formData.shipping_postal}
								class:error={errors.shipping_postal}
								disabled={submitting}
							/>
							{#if errors.shipping_postal}
								<span class="error-text">{errors.shipping_postal}</span>
							{/if}
						</div>
					</div>

					<div class="form-group">
						<label for="shipping_address">{t.address} *</label>
						<input
							type="text"
							id="shipping_address"
							bind:value={formData.shipping_address}
							class:error={errors.shipping_address}
							disabled={submitting}
						/>
						{#if errors.shipping_address}
							<span class="error-text">{errors.shipping_address}</span>
						{/if}
					</div>
				</section>

				<!-- Order Notes -->
				<section class="form-section">
					<h2>{t.orderNotes}</h2>

					<div class="form-group">
						<textarea
							id="note"
							bind:value={formData.note}
							placeholder={t.notePlaceholder}
							rows="3"
							disabled={submitting}
						></textarea>
					</div>
				</section>
			</div>

			<!-- Right Column: Order Summary -->
			<aside class="order-summary">
				<h2>{t.orderSummary}</h2>

				<ul class="order-items">
					{#each cart.items as item (item.id)}
						<li class="order-item">
							{#if item.image}
								<img
									src={`/uploads/${item.image.stored_filename}`}
									alt={getTitle(item)}
									class="item-image"
								/>
							{:else}
								<div class="item-image placeholder"></div>
							{/if}
							<div class="item-details">
								<p class="item-title">{getTitle(item)}</p>
								<p class="item-price">{formatPrice(item.price || 0, lang, currencyRates)}</p>
							</div>
						</li>
					{/each}
				</ul>

				<div class="summary-divider"></div>

				<div class="summary-row">
					<span>{t.subtotal}</span>
					<span>{formattedTotal}</span>
				</div>

				<div class="summary-row shipping">
					<span>{t.shipping}</span>
					<span class="note">{t.shippingNote}</span>
				</div>

				<div class="summary-total">
					<span>{t.total}</span>
					<span class="total-price">{formattedTotal}</span>
				</div>

				<button type="submit" class="btn-submit" disabled={submitting}>
					{#if submitting}
						<span class="spinner"></span>
						{t.processing}
					{:else}
						{t.placeOrder}
					{/if}
				</button>

				<a href={cartUrl} class="back-link">{t.backToCart}</a>
			</aside>
		</form>
	</div>
</div>

<style>
	.checkout-page {
		min-height: calc(100vh - 200px);
		padding: 2rem 0 4rem;
		background-color: var(--color-bg, #fff);
	}

	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	h1 {
		margin: 0 0 2rem;
		font-size: 2rem;
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
	}

	.error-banner {
		padding: 1rem;
		margin-bottom: 1.5rem;
		background: rgba(220, 38, 38, 0.1);
		border: 1px solid rgba(220, 38, 38, 0.3);
		border-radius: 0.5rem;
		color: #dc2626;
	}

	.checkout-layout {
		display: grid;
		grid-template-columns: 1fr 380px;
		gap: 2rem;
		align-items: start;
	}

	/* Form Sections */
	.checkout-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-section {
		background: var(--color-card-bg, #fff);
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.form-section h2 {
		margin: 0 0 1.25rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text, #1a1a1a);
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.375rem;
		background: var(--color-bg, #fff);
		color: var(--color-text, #1a1a1a);
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-accent, #d4af37);
		box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
	}

	.form-group input.error,
	.form-group select.error {
		border-color: #dc2626;
	}

	.form-group input:disabled,
	.form-group select:disabled,
	.form-group textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error-text {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: #dc2626;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	/* Order Summary */
	.order-summary {
		background: var(--color-card-bg, #fff);
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 2rem;
	}

	.order-summary h2 {
		margin: 0 0 1.25rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
	}

	.order-items {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 300px;
		overflow-y: auto;
	}

	.order-item {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.order-item:last-child {
		border-bottom: none;
	}

	.item-image {
		width: 60px;
		height: 60px;
		object-fit: cover;
		border-radius: 0.25rem;
		background: var(--color-bg-secondary, #f5f5f5);
	}

	.item-image.placeholder {
		display: block;
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
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.item-price {
		margin: 0.25rem 0 0;
		font-size: 0.8125rem;
		color: var(--color-text-secondary, #6b7280);
	}

	.summary-divider {
		height: 1px;
		background: var(--color-border, #e5e7eb);
		margin: 1rem 0;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.75rem;
		font-size: 0.9375rem;
	}

	.summary-row.shipping .note {
		color: var(--color-text-secondary, #6b7280);
		font-size: 0.8125rem;
	}

	.summary-total {
		display: flex;
		justify-content: space-between;
		padding-top: 1rem;
		margin-top: 0.25rem;
		border-top: 1px solid var(--color-border, #e5e7eb);
		font-weight: 600;
		font-size: 1.125rem;
	}

	.btn-submit {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 1rem;
		margin-top: 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 1rem;
		font-weight: 600;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-submit:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-submit:disabled {
		opacity: 0.7;
		cursor: not-allowed;
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
		to {
			transform: rotate(360deg);
		}
	}

	.back-link {
		display: block;
		margin-top: 1rem;
		text-align: center;
		color: var(--color-text-secondary, #6b7280);
		text-decoration: none;
		font-size: 0.875rem;
	}

	.back-link:hover {
		color: var(--color-accent, #d4af37);
	}

	/* Responsive */
	@media (max-width: 900px) {
		.checkout-layout {
			grid-template-columns: 1fr;
		}

		.order-summary {
			position: static;
			order: -1;
		}
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 1.5rem;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.form-section {
			padding: 1rem;
		}
	}

	/* Dark theme */
	:global([data-theme='dark']) .checkout-page {
		background-color: var(--color-bg, #111827);
	}

	:global([data-theme='dark']) h1 {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .form-section {
		background: var(--color-card-bg, #1f2937);
	}

	:global([data-theme='dark']) .form-section h2 {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .form-group label {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .form-group input,
	:global([data-theme='dark']) .form-group select,
	:global([data-theme='dark']) .form-group textarea {
		background: var(--color-bg, #111827);
		border-color: var(--color-border, #374151);
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .order-summary {
		background: var(--color-card-bg, #1f2937);
	}

	:global([data-theme='dark']) .order-summary h2 {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .item-title {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .summary-row {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .summary-total {
		color: var(--color-text, #f3f4f6);
	}
</style>
