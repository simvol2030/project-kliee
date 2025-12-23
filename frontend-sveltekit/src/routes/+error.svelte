<script lang="ts">
	import { page } from '$app/stores';

	const statusCode = $derived($page.status);
	const errorMessage = $derived($page.error?.message || 'Page not found');

	const is404 = $derived(statusCode === 404);
	const is500 = $derived(statusCode >= 500);
</script>

<svelte:head>
	<title>{statusCode} - K-LIÉE</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="error-page">
	<div class="error-container">
		<div class="error-code">{statusCode}</div>

		{#if is404}
			<h1 class="error-title">Page Not Found</h1>
			<p class="error-description">
				The page you're looking for doesn't exist or has been moved.
			</p>
		{:else if is500}
			<h1 class="error-title">Server Error</h1>
			<p class="error-description">
				Something went wrong on our end. Please try again later.
			</p>
		{:else}
			<h1 class="error-title">Oops!</h1>
			<p class="error-description">{errorMessage}</p>
		{/if}

		<div class="error-actions">
			<a href="/" class="btn btn-primary">Go Home</a>
			<a href="/contact" class="btn btn-secondary">Contact Us</a>
		</div>

		{#if is404}
			<div class="error-suggestions">
				<p class="suggestions-title">You might be looking for:</p>
				<ul class="suggestions-list">
					<li><a href="/works">View Artworks</a></li>
					<li><a href="/about">About the Artist</a></li>
					<li><a href="/exhibitions">Exhibitions</a></li>
					<li><a href="/contact">Get in Touch</a></li>
				</ul>
			</div>
		{/if}
	</div>
</div>

<style>
	.error-page {
		min-height: calc(100vh - 160px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl, 3rem) var(--spacing-md, 1.5rem);
		background: var(--bg-primary, #ffffff);
	}

	.error-container {
		max-width: 600px;
		text-align: center;
	}

	.error-code {
		font-size: clamp(4rem, 15vw, 8rem);
		font-weight: 700;
		line-height: 1;
		color: var(--accent, #d4af37);
		margin-bottom: var(--spacing-md, 1.5rem);
		font-family: var(--font-heading, 'Playfair Display', serif);
	}

	.error-title {
		font-size: clamp(1.75rem, 5vw, 2.5rem);
		font-weight: 600;
		margin-bottom: var(--spacing-sm, 1rem);
		color: var(--text-primary, #1a1a1a);
		font-family: var(--font-heading, 'Playfair Display', serif);
	}

	.error-description {
		font-size: 1.125rem;
		color: var(--text-secondary, #666666);
		margin-bottom: var(--spacing-lg, 2rem);
		line-height: 1.6;
	}

	.error-actions {
		display: flex;
		gap: var(--spacing-sm, 1rem);
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: var(--spacing-xl, 3rem);
	}

	.btn {
		display: inline-block;
		padding: 0.875rem 2rem;
		border-radius: 4px;
		font-weight: 500;
		text-decoration: none;
		transition: all 0.3s ease;
		font-size: 1rem;
		border: 2px solid transparent;
	}

	.btn-primary {
		background: var(--accent, #d4af37);
		color: #ffffff;
	}

	.btn-primary:hover {
		background: var(--accent-dark, #b8941e);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
	}

	.btn-secondary {
		background: transparent;
		color: var(--text-primary, #1a1a1a);
		border-color: var(--border-primary, #e0e0e0);
	}

	.btn-secondary:hover {
		background: var(--bg-secondary, #f5f5f5);
		border-color: var(--accent, #d4af37);
		color: var(--accent, #d4af37);
	}

	.error-suggestions {
		margin-top: var(--spacing-xl, 3rem);
		padding-top: var(--spacing-lg, 2rem);
		border-top: 1px solid var(--border-primary, #e0e0e0);
	}

	.suggestions-title {
		font-weight: 500;
		margin-bottom: var(--spacing-sm, 1rem);
		color: var(--text-primary, #1a1a1a);
	}

	.suggestions-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.suggestions-list a {
		color: var(--accent, #d4af37);
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.suggestions-list a:hover {
		color: var(--accent-dark, #b8941e);
		text-decoration: underline;
	}

	/* Dark Theme */
	.dark .btn-secondary {
		color: var(--text-primary, #ffffff);
		border-color: var(--border-primary, #38383a);
	}

	.dark .btn-secondary:hover {
		background: var(--bg-secondary, #1c1c1e);
		border-color: var(--accent, #ffd700);
		color: var(--accent, #ffd700);
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.error-code {
			font-size: 5rem;
		}

		.error-title {
			font-size: 1.75rem;
		}

		.error-description {
			font-size: 1rem;
		}

		.btn {
			padding: 0.75rem 1.5rem;
			font-size: 0.9375rem;
		}

		.error-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.btn {
			width: 100%;
		}
	}
</style>
