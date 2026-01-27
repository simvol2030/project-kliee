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

	// Check if current page is admin
	const isAdminPage = $derived(
		$page.url.pathname.startsWith('/dashboard') ||
		$page.url.pathname.startsWith('/artworks') ||
		$page.url.pathname.startsWith('/series') ||
		$page.url.pathname.startsWith('/exhibitions') ||
		$page.url.pathname.startsWith('/art-fairs') ||
		$page.url.pathname.startsWith('/education') ||
		$page.url.pathname.startsWith('/awards') ||
		$page.url.pathname.startsWith('/pages') ||
		$page.url.pathname.startsWith('/menu') ||
		$page.url.pathname.startsWith('/products') ||
		$page.url.pathname.startsWith('/orders') ||
		$page.url.pathname.startsWith('/users') ||
		$page.url.pathname.startsWith('/posts') ||
		$page.url.pathname.startsWith('/settings') ||
		$page.url.pathname.startsWith('/login') ||
		$page.url.pathname.startsWith('/logout') ||
		$page.url.pathname.startsWith('/media') ||
		$page.url.pathname.startsWith('/layout') ||
		$page.url.pathname.startsWith('/homepage') ||
		$page.url.pathname.startsWith('/shop') ||
		$page.url.pathname.startsWith('/chatbot') ||
		$page.url.pathname.startsWith('/about') ||
		$page.url.pathname.startsWith('/nft')
	);

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

		<Footer />
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
