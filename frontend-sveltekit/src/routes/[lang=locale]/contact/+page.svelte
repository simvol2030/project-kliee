<script lang="ts">
	import { page } from '$app/stores';
	import type { LanguageCode } from '$lib/types/layout.types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as LanguageCode) || 'en');
	const { contact } = data;

	// Form state
	let formData = $state({
		name: '',
		email: '',
		subject: '',
		message: ''
	});
	let isSubmitting = $state(false);
	let submitStatus = $state<'idle' | 'success' | 'error'>('idle');

	// Current URL for canonical
	const currentUrl = $derived($page.url.href);
	const baseUrl = $derived($page.url.origin);

	// Alternate language URLs
	const alternateUrls = $derived({
		en: `${baseUrl}/en/contact`,
		ru: `${baseUrl}/ru/contact`,
		es: `${baseUrl}/es/contact`,
		zh: `${baseUrl}/zh/contact`
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		isSubmitting = true;
		submitStatus = 'idle';

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				submitStatus = 'success';
				formData = { name: '', email: '', subject: '', message: '' };
			} else {
				submitStatus = 'error';
			}
		} catch {
			submitStatus = 'error';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>{contact.seo.title}</title>
	<meta name="description" content={contact.seo.description} />
	<link rel="canonical" href={currentUrl} />
	<link rel="alternate" href={alternateUrls.en} hreflang="en" />
	<link rel="alternate" href={alternateUrls.ru} hreflang="ru" />
	<link rel="alternate" href={alternateUrls.es} hreflang="es" />
	<link rel="alternate" href={alternateUrls.zh} hreflang="zh" />
	<link rel="alternate" href={alternateUrls.en} hreflang="x-default" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={contact.seo.title} />
	<meta property="og:description" content={contact.seo.description} />
</svelte:head>

<main class="contact-page">
	<!-- Hero Section -->
	<section class="contact-hero">
		<div class="container">
			<h1>{contact.page.hero.title}</h1>
			<p class="subtitle">{contact.page.hero.subtitle}</p>
		</div>
	</section>

	<section class="contact-content">
		<div class="container">
			<div class="contact-grid">
				<!-- Contact Form -->
				<div class="contact-form-wrapper">
					<h2>{contact.page.form.title}</h2>

					{#if submitStatus === 'success'}
						<div class="alert alert-success" role="alert">
							{contact.page.form.success}
						</div>
					{:else if submitStatus === 'error'}
						<div class="alert alert-error" role="alert">
							{contact.page.form.error}
						</div>
					{/if}

					<form class="contact-form" onsubmit={handleSubmit}>
						<div class="form-group">
							<label for="name">{contact.page.form.fields.name.label}</label>
							<input
								type="text"
								id="name"
								name="name"
								bind:value={formData.name}
								placeholder={contact.page.form.fields.name.placeholder}
								required
								disabled={isSubmitting}
							/>
						</div>

						<div class="form-group">
							<label for="email">{contact.page.form.fields.email.label}</label>
							<input
								type="email"
								id="email"
								name="email"
								bind:value={formData.email}
								placeholder={contact.page.form.fields.email.placeholder}
								required
								disabled={isSubmitting}
							/>
						</div>

						<div class="form-group">
							<label for="subject">{contact.page.form.fields.subject.label}</label>
							<select
								id="subject"
								name="subject"
								bind:value={formData.subject}
								required
								disabled={isSubmitting}
							>
								<option value="">--</option>
								{#each contact.page.form.fields.subject.options as option}
									<option value={option}>{option}</option>
								{/each}
							</select>
						</div>

						<div class="form-group">
							<label for="message">{contact.page.form.fields.message.label}</label>
							<textarea
								id="message"
								name="message"
								bind:value={formData.message}
								placeholder={contact.page.form.fields.message.placeholder}
								rows="5"
								required
								disabled={isSubmitting}
							></textarea>
						</div>

						<button type="submit" class="btn-primary" disabled={isSubmitting}>
							{#if isSubmitting}
								<span class="spinner"></span>
							{/if}
							{contact.page.form.submit}
						</button>
					</form>
				</div>

				<!-- Contact Info -->
				<aside class="contact-info">
					<div class="info-card">
						<h3>Email</h3>
						<a href="mailto:{contact.contact.email}" class="email-link">
							{contact.contact.email}
						</a>
					</div>

					<div class="info-card">
						<h3>
							{#if locale === 'ru'}Студия
							{:else if locale === 'es'}Estudio
							{:else if locale === 'zh'}工作室
							{:else}Studio{/if}
						</h3>
						<p>{contact.contact.studio.city}, {contact.contact.studio.country}</p>
					</div>

					<div class="info-card">
						<h3>
							{#if locale === 'ru'}Социальные сети
							{:else if locale === 'es'}Redes sociales
							{:else if locale === 'zh'}社交媒体
							{:else}Social Media{/if}
						</h3>
						<div class="social-links">
							{#each contact.contact.socialLinks as link}
								<a
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									class="social-link"
									aria-label={link.label}
								>
									{link.label}
								</a>
							{/each}
						</div>
					</div>
				</aside>
			</div>
		</div>
	</section>
</main>

<style>
	.contact-page {
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg, 2rem);
	}

	/* Hero Section */
	.contact-hero {
		padding: var(--spacing-3xl, 6rem) 0;
		background: var(--bg-secondary, #f5f5f5);
		text-align: center;
	}

	.contact-hero h1 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-4xl, 3rem);
		margin-bottom: var(--spacing-md, 1rem);
		color: var(--text-primary, #1a1a1a);
	}

	.subtitle {
		font-size: var(--text-lg, 1.125rem);
		color: var(--text-secondary, #666);
		max-width: 600px;
		margin: 0 auto;
	}

	/* Contact Content */
	.contact-content {
		padding: var(--spacing-3xl, 6rem) 0;
	}

	.contact-grid {
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: var(--spacing-3xl, 6rem);
	}

	/* Form */
	.contact-form-wrapper h2 {
		font-family: var(--font-heading, 'Playfair Display', serif);
		font-size: var(--text-2xl, 2rem);
		margin-bottom: var(--spacing-xl, 3rem);
		color: var(--text-primary, #1a1a1a);
	}

	.contact-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg, 2rem);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm, 0.5rem);
	}

	.form-group label {
		font-weight: 500;
		color: var(--text-primary, #1a1a1a);
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: var(--spacing-md, 1rem);
		border: 1px solid var(--border-color, #e5e5e5);
		border-radius: var(--radius-md, 0.5rem);
		font-size: var(--text-base, 1rem);
		background: var(--bg-primary, #fff);
		color: var(--text-primary, #1a1a1a);
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-accent, #d4af37);
	}

	.form-group input:disabled,
	.form-group select:disabled,
	.form-group textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm, 0.5rem);
		padding: var(--spacing-md, 1rem) var(--spacing-xl, 3rem);
		background: var(--color-accent, #d4af37);
		color: #fff;
		border: none;
		border-radius: var(--radius-md, 0.5rem);
		font-size: var(--text-base, 1rem);
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
		align-self: flex-start;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-accent-dark, #b8962f);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Alerts */
	.alert {
		padding: var(--spacing-md, 1rem);
		border-radius: var(--radius-md, 0.5rem);
		margin-bottom: var(--spacing-lg, 2rem);
	}

	.alert-success {
		background: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.alert-error {
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	/* Contact Info */
	.contact-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg, 2rem);
	}

	.info-card {
		padding: var(--spacing-lg, 2rem);
		background: var(--bg-secondary, #f5f5f5);
		border-radius: var(--radius-md, 0.5rem);
	}

	.info-card h3 {
		font-size: var(--text-sm, 0.875rem);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-secondary, #666);
		margin-bottom: var(--spacing-sm, 0.5rem);
	}

	.email-link {
		color: var(--color-accent, #d4af37);
		text-decoration: none;
		font-weight: 500;
	}

	.email-link:hover {
		text-decoration: underline;
	}

	.social-links {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm, 0.5rem);
	}

	.social-link {
		color: var(--text-primary, #1a1a1a);
		text-decoration: none;
		transition: color 0.2s;
	}

	.social-link:hover {
		color: var(--color-accent, #d4af37);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.contact-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-2xl, 4rem);
		}

		.contact-hero h1 {
			font-size: var(--text-3xl, 2.25rem);
		}

		.btn-primary {
			width: 100%;
			justify-content: center;
		}
	}

	/* Dark mode */
	:global([data-theme='dark']) .contact-hero {
		background: var(--bg-secondary, #1c1c1e);
	}

	:global([data-theme='dark']) .info-card {
		background: var(--bg-tertiary, #2c2c2e);
	}

	:global([data-theme='dark']) .form-group input,
	:global([data-theme='dark']) .form-group select,
	:global([data-theme='dark']) .form-group textarea {
		background: var(--bg-tertiary, #2c2c2e);
		border-color: var(--border-color, #3c3c3e);
	}

	:global([data-theme='dark']) .alert-success {
		background: #1c3d2e;
		color: #a3d9a5;
		border-color: #2a5d3e;
	}

	:global([data-theme='dark']) .alert-error {
		background: #3d1c1c;
		color: #d9a3a3;
		border-color: #5d2a2a;
	}
</style>
