<script lang="ts">
	import { wishlistStore } from '$lib/stores/wishlist.svelte';
	import { onMount } from 'svelte';

	interface Props {
		lang: string;
	}

	let { lang }: Props = $props();

	// Initialize wishlist on mount
	onMount(() => {
		wishlistStore.init();
	});

	const wishlistUrl = $derived(`/${lang}/wishlist`);
	const count = $derived(wishlistStore.count);
</script>

<a href={wishlistUrl} class="wishlist-icon" aria-label="Wishlist">
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
		<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
	</svg>
	{#if count > 0}
		<span class="wishlist-badge">{count}</span>
	{/if}
</a>

<style>
	.wishlist-icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		color: var(--color-text, #1a1a1a);
		text-decoration: none;
		transition: color 0.2s;
	}

	.wishlist-icon:hover {
		color: var(--color-accent, #d4af37);
	}

	.wishlist-icon svg {
		display: block;
	}

	.wishlist-badge {
		position: absolute;
		top: 0;
		right: 0;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		background: #dc2626;
		color: white;
		font-size: 0.625rem;
		font-weight: 700;
		line-height: 18px;
		text-align: center;
		border-radius: 9px;
		transform: translate(25%, -25%);
	}

	/* Dark theme */
	:global([data-theme='dark']) .wishlist-icon {
		color: var(--color-text, #f3f4f6);
	}
</style>
