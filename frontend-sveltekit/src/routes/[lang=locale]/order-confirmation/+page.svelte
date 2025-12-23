<script lang="ts">
	import type { PageData } from './$types';
	import { formatPrice, type LanguageCode, type CurrencyRate } from '$lib/utils/currency';
	import { getCountryByCode, getCountryName } from '$lib/utils/countries';

	let { data }: { data: PageData } = $props();

	const lang = data.lang as LanguageCode;
	const currencyRates: CurrencyRate[] = data.currencyRates || [];
	const order = data.order;
	const items = data.items;

	// Translations
	const t = {
		en: {
			title: 'Order Confirmed',
			thankYou: 'Thank you for your order!',
			description: 'We have received your order and will contact you shortly to confirm the details.',
			orderNumber: 'Order Number',
			orderDate: 'Order Date',
			email: 'Confirmation Email',
			emailNote: 'A confirmation email has been sent to',
			items: 'Order Items',
			shippingTo: 'Shipping To',
			total: 'Total',
			continueShopping: 'Continue Shopping',
			questions: 'Questions?',
			contactUs: 'Contact us at'
		},
		ru: {
			title: 'Заказ подтверждён',
			thankYou: 'Спасибо за ваш заказ!',
			description: 'Мы получили ваш заказ и свяжемся с вами в ближайшее время для подтверждения деталей.',
			orderNumber: 'Номер заказа',
			orderDate: 'Дата заказа',
			email: 'Подтверждение по email',
			emailNote: 'Письмо с подтверждением отправлено на',
			items: 'Товары в заказе',
			shippingTo: 'Адрес доставки',
			total: 'Итого',
			continueShopping: 'Продолжить покупки',
			questions: 'Вопросы?',
			contactUs: 'Свяжитесь с нами'
		},
		es: {
			title: 'Pedido Confirmado',
			thankYou: '¡Gracias por tu pedido!',
			description: 'Hemos recibido tu pedido y te contactaremos pronto para confirmar los detalles.',
			orderNumber: 'Número de Pedido',
			orderDate: 'Fecha del Pedido',
			email: 'Confirmación por Email',
			emailNote: 'Se ha enviado un email de confirmación a',
			items: 'Artículos del Pedido',
			shippingTo: 'Envío a',
			total: 'Total',
			continueShopping: 'Continuar Comprando',
			questions: '¿Preguntas?',
			contactUs: 'Contáctanos en'
		},
		zh: {
			title: '订单已确认',
			thankYou: '感谢您的订单！',
			description: '我们已收到您的订单，将尽快与您联系确认详情。',
			orderNumber: '订单号',
			orderDate: '订单日期',
			email: '确认邮件',
			emailNote: '确认邮件已发送至',
			items: '订单商品',
			shippingTo: '收货地址',
			total: '总计',
			continueShopping: '继续购物',
			questions: '有问题？',
			contactUs: '联系我们'
		}
	}[lang];

	// Format date
	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		const date = new Date(dateStr);
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		};
		const locale = lang === 'ru' ? 'ru-RU' : lang === 'es' ? 'es-ES' : lang === 'zh' ? 'zh-CN' : 'en-US';
		return date.toLocaleDateString(locale, options);
	}

	// Get country name
	const countryName = $derived(() => {
		const country = getCountryByCode(order.shipping_country);
		return country ? getCountryName(country, lang) : order.shipping_country;
	});

	// Format total
	const formattedTotal = $derived(formatPrice(order.subtotal_eur, lang, currencyRates));

	const shopUrl = `/${lang}/shop`;
</script>

<svelte:head>
	<title>{t.title} | K-LIÉE</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="confirmation-page">
	<div class="container">
		<div class="success-icon">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
				<polyline points="22 4 12 14.01 9 11.01" />
			</svg>
		</div>

		<h1>{t.thankYou}</h1>
		<p class="description">{t.description}</p>

		<div class="order-details">
			<div class="detail-card order-info">
				<div class="detail-row">
					<span class="label">{t.orderNumber}</span>
					<span class="value order-number">{order.order_number}</span>
				</div>

				<div class="detail-row">
					<span class="label">{t.orderDate}</span>
					<span class="value">{formatDate(order.created_at)}</span>
				</div>

				<div class="detail-row">
					<span class="label">{t.email}</span>
					<span class="value">{order.customer_email}</span>
				</div>
			</div>

			<div class="detail-card items-card">
				<h3>{t.items}</h3>
				<ul class="order-items">
					{#each items as item}
						<li class="order-item">
							<span class="item-title">{item.title}</span>
							<span class="item-price">{formatPrice(item.price_eur, lang, currencyRates)}</span>
						</li>
					{/each}
				</ul>

				<div class="total-row">
					<span>{t.total}</span>
					<span class="total-price">{formattedTotal}</span>
				</div>
			</div>

			<div class="detail-card shipping-card">
				<h3>{t.shippingTo}</h3>
				<address>
					<p>{order.customer_name}</p>
					<p>{order.shipping_city}, {countryName()}</p>
				</address>
			</div>
		</div>

		<div class="actions">
			<a href={shopUrl} class="btn-primary">{t.continueShopping}</a>
		</div>

		<div class="contact-info">
			<p>{t.questions} {t.contactUs} <a href="mailto:info@k-liee.com">info@k-liee.com</a></p>
		</div>
	</div>
</div>

<style>
	.confirmation-page {
		min-height: calc(100vh - 200px);
		padding: 3rem 0 4rem;
		background-color: var(--color-bg, #fff);
	}

	.container {
		max-width: 700px;
		margin: 0 auto;
		padding: 0 1rem;
		text-align: center;
	}

	.success-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		margin-bottom: 1.5rem;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		border-radius: 50%;
		color: white;
	}

	h1 {
		margin: 0 0 0.75rem;
		font-size: 2rem;
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
	}

	.description {
		margin: 0 0 2.5rem;
		font-size: 1.0625rem;
		color: var(--color-text-secondary, #6b7280);
		max-width: 500px;
		margin-left: auto;
		margin-right: auto;
	}

	.order-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
		text-align: left;
	}

	.detail-card {
		background: var(--color-card-bg, #fff);
		border-radius: 0.5rem;
		padding: 1.25rem 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.detail-card h3 {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-secondary, #6b7280);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.detail-row:last-child {
		border-bottom: none;
	}

	.label {
		color: var(--color-text-secondary, #6b7280);
		font-size: 0.9375rem;
	}

	.value {
		font-weight: 500;
		color: var(--color-text, #1a1a1a);
	}

	.order-number {
		font-family: 'SF Mono', 'Monaco', monospace;
		font-weight: 600;
		color: var(--color-accent, #d4af37);
	}

	.order-items {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.order-item {
		display: flex;
		justify-content: space-between;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.order-item:last-child {
		border-bottom: none;
	}

	.item-title {
		color: var(--color-text, #1a1a1a);
	}

	.item-price {
		color: var(--color-text-secondary, #6b7280);
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		padding-top: 1rem;
		margin-top: 0.5rem;
		border-top: 2px solid var(--color-border, #e5e7eb);
		font-weight: 600;
		font-size: 1.0625rem;
	}

	.total-price {
		color: var(--color-text, #1a1a1a);
	}

	.shipping-card address {
		font-style: normal;
	}

	.shipping-card p {
		margin: 0.25rem 0;
		color: var(--color-text, #1a1a1a);
	}

	.actions {
		margin-bottom: 2rem;
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

	.contact-info {
		color: var(--color-text-secondary, #6b7280);
		font-size: 0.875rem;
	}

	.contact-info a {
		color: var(--color-accent, #d4af37);
		text-decoration: none;
	}

	.contact-info a:hover {
		text-decoration: underline;
	}

	/* Responsive */
	@media (max-width: 640px) {
		h1 {
			font-size: 1.5rem;
		}

		.description {
			font-size: 1rem;
		}

		.detail-card {
			padding: 1rem;
		}
	}

	/* Dark theme */
	:global([data-theme='dark']) .confirmation-page {
		background-color: var(--color-bg, #111827);
	}

	:global([data-theme='dark']) h1 {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .detail-card {
		background: var(--color-card-bg, #1f2937);
	}

	:global([data-theme='dark']) .value {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .item-title {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .total-price {
		color: var(--color-text, #f3f4f6);
	}

	:global([data-theme='dark']) .shipping-card p {
		color: var(--color-text, #f3f4f6);
	}
</style>
