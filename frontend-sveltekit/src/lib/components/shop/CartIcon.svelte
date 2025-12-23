<script lang="ts">
	import { cartStore } from '$lib/stores/cart.svelte';
	import { onMount } from 'svelte';

	interface Props {
		lang: string;
	}

	let { lang }: Props = $props();

	// Initialize cart on mount
	onMount(() => {
		cartStore.init();
	});

	const cartUrl = $derived(`/${lang}/cart`);
</script>

<a href={cartUrl} class="cart-icon" aria-label="Shopping Cart">
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
		<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
		<line x1="3" y1="6" x2="21" y2="6" />
		<path d="M16 10a4 4 0 0 1-8 0" />
	</svg>
	{#if cartStore.count > 0}
		<span class="cart-badge">{cartStore.count}</span>
	{/if}
</a>

<style>
	.cart-icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		color: var(--color-text, #1a1a1a);
		text-decoration: none;
		transition: color 0.2s;
	}

	.cart-icon:hover {
		color: var(--color-accent, #d4af37);
	}

	.cart-icon svg {
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

	/* Dark theme */
	:global([data-theme='dark']) .cart-icon {
		color: var(--color-text, #f3f4f6);
	}
</style>
