<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { ModeWatcher } from 'mode-watcher';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import MobileMenu from '$lib/components/layout/MobileMenu.svelte';
	import ChatWidget from '$lib/components/chat/ChatWidget.svelte';
	import { initI18n, currentLanguage } from '$lib/i18n';
	import '../app.css';

	let { children, data } = $props();

	// Check if current page is admin — uses flag set by (admin)/+layout.server.ts
	// This is more robust than matching URL patterns which would break with new admin routes
	const isAdminPage = $derived(!!data.isAdmin);

	// Mobile menu state
	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	// Initialize i18n with locale from server (only for public pages)
	onMount(() => {
		if (!isAdminPage && data.locale) {
			initI18n(data.locale);
		}
	});

	// Update language when locale changes (only for public pages)
	$effect(() => {
		if (!isAdminPage && data.locale) {
			currentLanguage.set(data.locale);
		}
	});
</script>

<svelte:head>
	<title>K-LIÉE | Contemporary Artist</title>
	<meta name="description" content="Svetlana K-LIÉE - Contemporary Artist Portfolio" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<ModeWatcher />

{#if isAdminPage}
	<!-- Admin pages: No Header/Footer -->
	{@render children?.()}
{:else}
	<!-- Public pages: With Header/Footer -->
	<div class="app">
		<Header {mobileMenuOpen} {toggleMobileMenu} />

		<main class="main-content">
			{@render children?.()}
		</main>

		<Footer footerData={data.footerData} />
	</div>

	<!-- Mobile Menu (outside Header for full-screen) -->
	{#if mobileMenuOpen}
		<MobileMenu {closeMobileMenu} />
	{/if}

	<!-- AI Chat Widget (Melena) -->
	<ChatWidget />
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.main-content {
		flex: 1;
		padding-top: 80px; /* Offset for fixed header */
	}

	@media (max-width: 768px) {
		.main-content {
			padding-top: 70px;
		}
	}
</style>
