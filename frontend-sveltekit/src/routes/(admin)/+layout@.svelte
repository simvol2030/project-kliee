<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	let { data, children }: { data: LayoutData; children: any } = $props();

	// Не показываем layout на странице логина
	const isLoginPage = $derived($page.url.pathname === '/login');

	// Мобильное меню
	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="admin-layout">
		<!-- Mobile Header -->
		<header class="mobile-header">
			<button class="menu-button" onclick={toggleMobileMenu} aria-label="Toggle menu">
				{#if mobileMenuOpen}
					<span class="icon">✕</span>
				{:else}
					<span class="icon">☰</span>
				{/if}
			</button>
			<h1>Admin Panel</h1>
			<div class="user-badge">{data.user?.name?.charAt(0) || 'A'}</div>
		</header>

		<!-- Sidebar with mobile overlay -->
		{#if mobileMenuOpen}
			<div
				class="sidebar-overlay"
				onclick={closeMobileMenu}
				onkeydown={(e) => e.key === 'Escape' && closeMobileMenu()}
				role="button"
				tabindex="0"
				aria-label="Close sidebar"
			></div>
		{/if}

		<aside class="sidebar" class:mobile-open={mobileMenuOpen}>
			<div class="sidebar-header">
				<h2>Admin Panel</h2>
				<p class="user-role">{data.user?.role}</p>
			</div>

			<nav class="sidebar-nav">
				<a href="/dashboard" class:active={$page.url.pathname === '/dashboard'} onclick={closeMobileMenu}>
					<span class="icon">📊</span>
					<span>Dashboard</span>
				</a>

				<p class="nav-section">Content</p>
				<a href="/artworks" class:active={$page.url.pathname.startsWith('/artworks')} onclick={closeMobileMenu}>
					<span class="icon">🖼️</span>
					<span>Artworks</span>
				</a>
				<a href="/series" class:active={$page.url.pathname.startsWith('/series')} onclick={closeMobileMenu}>
					<span class="icon">📚</span>
					<span>Series</span>
				</a>
				<a href="/exhibitions" class:active={$page.url.pathname.startsWith('/exhibitions')} onclick={closeMobileMenu}>
					<span class="icon">🏛️</span>
					<span>Exhibitions</span>
				</a>
				<a href="/nft" class:active={$page.url.pathname.startsWith('/nft')} onclick={closeMobileMenu}>
					<span class="icon">💎</span>
					<span>NFT</span>
				</a>
				<a href="/blog" class:active={$page.url.pathname.startsWith('/blog')} onclick={closeMobileMenu}>
					<span class="icon">✍️</span>
					<span>Blog</span>
				</a>
				<a href="/about" class:active={$page.url.pathname.startsWith('/about')} onclick={closeMobileMenu}>
					<span class="icon">👤</span>
					<span>About</span>
				</a>
				<a href="/contact" class:active={$page.url.pathname.startsWith('/contact')} onclick={closeMobileMenu}>
					<span class="icon">📧</span>
					<span>Contact</span>
				</a>
				<a href="/blog" class:active={$page.url.pathname.startsWith('/blog')} onclick={closeMobileMenu}>
					<span class="icon">📝</span>
					<span>Blog</span>
				</a>

				<p class="nav-section">Media</p>
				<a href="/media" class:active={$page.url.pathname === '/media'} onclick={closeMobileMenu}>
					<span class="icon">📷</span>
					<span>Media Library</span>
				</a>
				<a href="/media/settings" class:active={$page.url.pathname === '/media/settings'} onclick={closeMobileMenu}>
					<span class="icon">🖼️</span>
					<span>Media Settings</span>
				</a>

				<p class="nav-section">Pages</p>
				<a href="/homepage" class:active={$page.url.pathname.startsWith('/homepage')} onclick={closeMobileMenu}>
					<span class="icon">🏠</span>
					<span>Homepage</span>
				</a>
				<a href="/layout/menu" class:active={$page.url.pathname.startsWith('/layout/menu')} onclick={closeMobileMenu}>
					<span class="icon">🔗</span>
					<span>Menu</span>
				</a>
				<a href="/layout/footer" class:active={$page.url.pathname.startsWith('/layout/footer')} onclick={closeMobileMenu}>
					<span class="icon">📑</span>
					<span>Footer</span>
				</a>

				<p class="nav-section">Shop</p>
				<a href="/shop/products" class:active={$page.url.pathname.startsWith('/shop/products')} onclick={closeMobileMenu}>
					<span class="icon">🛍️</span>
					<span>Products</span>
				</a>
				<a href="/shop/orders" class:active={$page.url.pathname.startsWith('/shop/orders')} onclick={closeMobileMenu}>
					<span class="icon">🛒</span>
					<span>Orders</span>
				</a>
				<a href="/shop/settings" class:active={$page.url.pathname.startsWith('/shop/settings')} onclick={closeMobileMenu}>
					<span class="icon">💰</span>
					<span>Shop Settings</span>
				</a>

				<p class="nav-section">Chatbot</p>
				<a href="/chatbot/settings" class:active={$page.url.pathname.startsWith('/chatbot/settings')} onclick={closeMobileMenu}>
					<span class="icon">🤖</span>
					<span>Settings</span>
				</a>
				<a href="/chatbot/faq" class:active={$page.url.pathname.startsWith('/chatbot/faq')} onclick={closeMobileMenu}>
					<span class="icon">📚</span>
					<span>FAQ</span>
				</a>
				<a href="/chatbot/history" class:active={$page.url.pathname.startsWith('/chatbot/history')} onclick={closeMobileMenu}>
					<span class="icon">💬</span>
					<span>History</span>
				</a>

				<p class="nav-section">System</p>
				<a href="/users" class:active={$page.url.pathname.startsWith('/users')} onclick={closeMobileMenu}>
					<span class="icon">👥</span>
					<span>Users</span>
				</a>
				{#if data.user?.role === 'super-admin'}
					<a href="/settings" class:active={$page.url.pathname === '/settings'} onclick={closeMobileMenu}>
						<span class="icon">⚙️</span>
						<span>Settings</span>
					</a>
				{/if}
			</nav>

			<div class="sidebar-footer">
				<div class="user-info">
					<p class="user-name">{data.user?.name}</p>
					<p class="user-email">{data.user?.email}</p>
				</div>
				<form method="POST" action="/logout" use:enhance={() => {
					return async ({ update }) => {
						// Не используем update(), просто перезагружаем страницу
						// Это позволит серверу обработать redirect
						window.location.href = '/login';
					};
				}}>
					<CsrfToken />
					<button type="submit" class="btn-logout">Logout</button>
				</form>
			</div>
		</aside>

		<main class="main-content">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
	}

	.admin-layout {
		display: flex;
		min-height: 100vh;
		background-color: #f9fafb;
	}

	/* Mobile Header */
	.mobile-header {
		display: none;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.mobile-header h1 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.menu-button {
		background: none;
		border: none;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.menu-button .icon {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-badge {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.875rem;
	}

	/* Sidebar Overlay for mobile */
	.sidebar-overlay {
		display: none;
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 998;
	}

	.sidebar {
		width: 260px;
		background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
		color: white;
		display: flex;
		flex-direction: column;
		box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
		z-index: 999;
	}

	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.sidebar-header h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.user-role {
		font-size: 0.75rem;
		color: #9ca3af;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	.sidebar-nav {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
	}

	.sidebar-nav a {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: #d1d5db;
		text-decoration: none;
		border-radius: 0.5rem;
		transition: all 0.2s;
		margin-bottom: 0.25rem;
	}

	.sidebar-nav a:hover {
		background-color: rgba(255, 255, 255, 0.1);
		color: white;
	}

	.sidebar-nav a.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.nav-section {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #6b7280;
		margin: 1rem 0 0.5rem 0.5rem;
		font-weight: 600;
	}

	.sidebar-nav .icon {
		font-size: 1.25rem;
	}

	.sidebar-footer {
		padding: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.user-info {
		margin-bottom: 1rem;
	}

	.user-name {
		margin: 0 0 0.25rem 0;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.user-email {
		margin: 0;
		font-size: 0.75rem;
		color: #9ca3af;
		word-break: break-all;
	}

	.btn-logout {
		width: 100%;
		padding: 0.625rem;
		background-color: rgba(239, 68, 68, 0.1);
		color: #fca5a5;
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-logout:hover {
		background-color: rgba(239, 68, 68, 0.2);
		color: #f87171;
	}

	.main-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}

	/* Mobile Styles */
	@media (max-width: 768px) {
		.mobile-header {
			display: flex;
		}

		.sidebar {
			position: fixed;
			left: 0;
			top: 0;
			bottom: 0;
			transform: translateX(-100%);
			transition: transform 0.3s ease;
		}

		.sidebar.mobile-open {
			transform: translateX(0);
		}

		.sidebar-overlay {
			display: block;
		}

		.main-content {
			padding: 1rem;
			width: 100%;
		}

		.admin-layout {
			flex-direction: column;
		}
	}

	/* Tablet Styles */
	@media (max-width: 1024px) and (min-width: 769px) {
		.sidebar {
			width: 220px;
		}

		.main-content {
			padding: 1.5rem;
		}
	}

	/* Small mobile */
	@media (max-width: 480px) {
		.main-content {
			padding: 0.75rem;
		}

		.sidebar {
			width: 280px;
			max-width: 85vw;
		}
	}

	/* Dark theme support */
	:global(.dark) .admin-layout {
		background-color: #111827;
	}

	:global(.dark) .main-content {
		background-color: #111827;
		color: #f9fafb;
	}

	:global(.dark) .mobile-header {
		background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
	}

	/* Global admin dark theme styles */
	:global(.dark) .main-content h1,
	:global(.dark) .main-content h2,
	:global(.dark) .main-content h3 {
		color: #f9fafb;
	}

	:global(.dark) .main-content p {
		color: #d1d5db;
	}

	:global(.dark) .main-content label {
		color: #e5e7eb;
	}

	:global(.dark) .main-content input,
	:global(.dark) .main-content textarea,
	:global(.dark) .main-content select {
		background-color: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}

	:global(.dark) .main-content input::placeholder,
	:global(.dark) .main-content textarea::placeholder {
		color: #9ca3af;
	}

	:global(.dark) .main-content table {
		color: #e5e7eb;
	}

	:global(.dark) .main-content th {
		background-color: #374151;
		color: #d1d5db;
	}

	:global(.dark) .main-content td {
		border-color: #374151;
	}

	:global(.dark) .main-content tr:hover {
		background-color: #1f2937;
	}

	/* Common card styles for dark theme */
	:global(.dark) .main-content .card,
	:global(.dark) .main-content .panel,
	:global(.dark) .main-content .box {
		background-color: #1f2937;
		border-color: #374151;
	}

	/* Modal overlay for dark theme */
	:global(.dark) .main-content .modal-content,
	:global(.dark) .main-content .dialog {
		background-color: #1f2937;
		border-color: #374151;
	}

	/* Extended global dark theme styles for all admin pages */

	/* All buttons with white background */
	:global(.dark) .main-content button {
		background-color: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}

	:global(.dark) .main-content button:hover {
		background-color: #4b5563;
	}

	/* Primary buttons keep gradient */
	:global(.dark) .main-content .btn-primary,
	:global(.dark) .main-content .btn-save,
	:global(.dark) .main-content button[type="submit"] {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: transparent;
		color: white;
	}

	/* Delete buttons */
	:global(.dark) .main-content .btn-delete:hover {
		background-color: #7f1d1d;
		border-color: #991b1b;
		color: #fecaca;
	}

	/* All divs that look like cards/items with white bg */
	:global(.dark) .main-content > div > div {
		color: #e5e7eb;
	}

	/* Menu items, list items, cards with borders */
	:global(.dark) .main-content [class*="item"],
	:global(.dark) .main-content [class*="card"],
	:global(.dark) .main-content [class*="menu-"] {
		background-color: #1f2937;
		border-color: #374151;
		color: #e5e7eb;
	}

	/* All span elements */
	:global(.dark) .main-content span {
		color: inherit;
	}

	/* Muted text */
	:global(.dark) .main-content .text-muted,
	:global(.dark) .main-content .subtitle,
	:global(.dark) .main-content [class*="-muted"],
	:global(.dark) .main-content [class*="-secondary"] {
		color: #9ca3af;
	}

	/* Close buttons */
	:global(.dark) .main-content .btn-close {
		background: transparent;
		color: #9ca3af;
	}

	:global(.dark) .main-content .btn-close:hover {
		color: #f9fafb;
	}

	/* Links */
	:global(.dark) .main-content a {
		color: #818cf8;
	}

	:global(.dark) .main-content a:hover {
		color: #a5b4fc;
	}

	/* Empty states */
	:global(.dark) .main-content .empty-state {
		color: #9ca3af;
	}

	/* Badges */
	:global(.dark) .main-content .badge {
		background-color: #4b5563;
		color: #e5e7eb;
	}

	/* HR and borders */
	:global(.dark) .main-content hr {
		border-color: #374151;
	}

	/* Children/nested containers */
	:global(.dark) .main-content .children {
		border-color: #374151;
	}
</style>
