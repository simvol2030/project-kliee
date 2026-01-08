<script lang="ts">
	import { page } from '$app/stores';
	import LanguageTabs from '$lib/components/admin/LanguageTabs.svelte';

	// CSRF helpers
	const csrfHeaders = () => ({
		'Content-Type': 'application/json',
		'x-csrf-token': $page.data.csrfToken || ''
	});
	const csrfDeleteHeaders = () => ({ 'x-csrf-token': $page.data.csrfToken || '' });

	interface Brand {
		id: number;
		title: string;
		subtitle_en: string | null;
		subtitle_ru: string | null;
		subtitle_es: string | null;
		subtitle_zh: string | null;
		quote_en: string | null;
		quote_ru: string | null;
		quote_es: string | null;
		quote_zh: string | null;
	}

	interface SocialLink {
		id: number;
		platform: string;
		label: string;
		badge: string | null;
		url: string;
		icon: string;
		order_index: number | null;
		is_visible: boolean | null;
	}

	interface Contact {
		id: number;
		title_en: string | null;
		title_ru: string | null;
		title_es: string | null;
		title_zh: string | null;
		email: string | null;
		phone: string | null;
	}

	let { data } = $props();

	let brand = $state<Brand | null>(data.brand);
	let socialLinks = $state<SocialLink[]>(data.socialLinks || []);
	let contact = $state<Contact | null>(data.contact);

	let activeTab = $state<'brand' | 'social' | 'contact'>('brand');
	let isSaving = $state(false);

	// Social modal
	let isSocialModalOpen = $state(false);
	let editingSocial = $state<SocialLink | null>(null);
	let socialForm = $state({
		platform: '',
		label: '',
		badge: '',
		url: '',
		icon: '',
		order_index: 0,
		is_visible: true
	});

	// Brand form
	let brandForm = $state({
		title: brand?.title || 'K-LIEE',
		subtitle_en: brand?.subtitle_en || '',
		subtitle_ru: brand?.subtitle_ru || '',
		subtitle_es: brand?.subtitle_es || '',
		subtitle_zh: brand?.subtitle_zh || '',
		quote_en: brand?.quote_en || '',
		quote_ru: brand?.quote_ru || '',
		quote_es: brand?.quote_es || '',
		quote_zh: brand?.quote_zh || ''
	});

	// Contact form
	let contactForm = $state({
		title_en: contact?.title_en || '',
		title_ru: contact?.title_ru || '',
		title_es: contact?.title_es || '',
		title_zh: contact?.title_zh || '',
		email: contact?.email || '',
		phone: contact?.phone || ''
	});

	async function saveBrand() {
		isSaving = true;
		try {
			const res = await fetch('/api/layout/footer', {
				method: 'POST',
				headers: csrfHeaders(),
				body: JSON.stringify({ section: 'brand', ...brandForm })
			});
			if (res.ok) {
				const result = await res.json();
				brand = result.brand;
			}
		} finally {
			isSaving = false;
		}
	}

	async function saveContact() {
		isSaving = true;
		try {
			const res = await fetch('/api/layout/footer', {
				method: 'POST',
				headers: csrfHeaders(),
				body: JSON.stringify({ section: 'contact', ...contactForm })
			});
			if (res.ok) {
				const result = await res.json();
				contact = result.contact;
			}
		} finally {
			isSaving = false;
		}
	}

	function openSocialModal(social?: SocialLink) {
		if (social) {
			editingSocial = social;
			socialForm = {
				platform: social.platform,
				label: social.label,
				badge: social.badge || '',
				url: social.url,
				icon: social.icon,
				order_index: social.order_index || 0,
				is_visible: social.is_visible !== false
			};
		} else {
			editingSocial = null;
			socialForm = {
				platform: '',
				label: '',
				badge: '',
				url: '',
				icon: '',
				order_index: socialLinks.length,
				is_visible: true
			};
		}
		isSocialModalOpen = true;
	}

	async function saveSocial() {
		isSaving = true;
		try {
			if (editingSocial) {
				await fetch(`/api/layout/footer/social/${editingSocial.id}`, {
					method: 'PATCH',
					headers: csrfHeaders(),
					body: JSON.stringify(socialForm)
				});
			} else {
				await fetch('/api/layout/footer', {
					method: 'POST',
					headers: csrfHeaders(),
					body: JSON.stringify({ section: 'social', ...socialForm })
				});
			}
			await loadFooter();
			isSocialModalOpen = false;
		} finally {
			isSaving = false;
		}
	}

	async function deleteSocial(id: number) {
		if (!confirm('Delete this social link?')) return;
		await fetch(`/api/layout/footer/social/${id}`, { method: 'DELETE', headers: csrfDeleteHeaders() });
		await loadFooter();
	}

	async function loadFooter() {
		const res = await fetch('/api/layout/footer');
		const result = await res.json();
		brand = result.brand;
		socialLinks = result.socialLinks || [];
		contact = result.contact;
	}
</script>

<svelte:head>
	<title>Footer | Admin</title>
</svelte:head>

<div class="layout-page">
	<header class="page-header">
		<div>
			<h1>Footer Settings</h1>
			<p class="subtitle">Configure footer content (4 languages)</p>
		</div>
	</header>

	<nav class="tabs">
		<button type="button" class:active={activeTab === 'brand'} onclick={() => (activeTab = 'brand')}>Brand</button>
		<button type="button" class:active={activeTab === 'social'} onclick={() => (activeTab = 'social')}>Social Links</button>
		<button type="button" class:active={activeTab === 'contact'} onclick={() => (activeTab = 'contact')}>Contact</button>
	</nav>

	{#if activeTab === 'brand'}
		<div class="card">
			<h2>Brand Information</h2>
			<form onsubmit={(e) => { e.preventDefault(); saveBrand(); }}>
				<div class="form-group">
					<label for="title">Brand Title</label>
					<input type="text" id="title" bind:value={brandForm.title} placeholder="K-LIEE" />
				</div>

				<h3>Subtitle</h3>
				<LanguageTabs>
					{#snippet children(lang)}
						<div class="form-group">
							<label for="subtitle_{lang}">Subtitle ({lang.toUpperCase()})</label>
							<input
								type="text"
								id="subtitle_{lang}"
								bind:value={brandForm[`subtitle_${lang}` as keyof typeof brandForm]}
								placeholder="Artist subtitle..."
							/>
						</div>
					{/snippet}
				</LanguageTabs>

				<h3>Quote</h3>
				<LanguageTabs>
					{#snippet children(lang)}
						<div class="form-group">
							<label for="quote_{lang}">Quote ({lang.toUpperCase()})</label>
							<textarea
								id="quote_{lang}"
								bind:value={brandForm[`quote_${lang}` as keyof typeof brandForm]}
								rows="2"
								placeholder="Inspirational quote..."
							></textarea>
						</div>
					{/snippet}
				</LanguageTabs>

				<button type="submit" class="btn-save" disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Brand'}
				</button>
			</form>
		</div>
	{/if}

	{#if activeTab === 'social'}
		<div class="card">
			<div class="card-header">
				<h2>Social Links</h2>
				<button type="button" class="btn-primary" onclick={() => openSocialModal()}>+ Add Link</button>
			</div>

			<div class="social-list">
				{#each socialLinks as link}
					<div class="social-item" class:hidden={!link.is_visible}>
						<div class="social-info">
							<span class="social-icon">{link.icon}</span>
							<span class="social-platform">{link.platform}</span>
							<span class="social-url">{link.url}</span>
							{#if link.badge}
								<span class="badge">{link.badge}</span>
							{/if}
						</div>
						<div class="social-actions">
							<button type="button" class="btn-edit" onclick={() => openSocialModal(link)}>Edit</button>
							<button type="button" class="btn-delete" onclick={() => deleteSocial(link.id)}>Delete</button>
						</div>
					</div>
				{:else}
					<p class="empty">No social links yet.</p>
				{/each}
			</div>
		</div>
	{/if}

	{#if activeTab === 'contact'}
		<div class="card">
			<h2>Contact Information</h2>
			<form onsubmit={(e) => { e.preventDefault(); saveContact(); }}>
				<h3>Section Title</h3>
				<LanguageTabs>
					{#snippet children(lang)}
						<div class="form-group">
							<label for="contact_title_{lang}">Title ({lang.toUpperCase()})</label>
							<input
								type="text"
								id="contact_title_{lang}"
								bind:value={contactForm[`title_${lang}` as keyof typeof contactForm]}
								placeholder="Contact us..."
							/>
						</div>
					{/snippet}
				</LanguageTabs>

				<div class="form-row">
					<div class="form-group">
						<label for="email">Email</label>
						<input type="email" id="email" bind:value={contactForm.email} placeholder="hello@example.com" />
					</div>
					<div class="form-group">
						<label for="phone">Phone</label>
						<input type="tel" id="phone" bind:value={contactForm.phone} placeholder="+1 234 567 890" />
					</div>
				</div>

				<button type="submit" class="btn-save" disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Contact'}
				</button>
			</form>
		</div>
	{/if}
</div>

{#if isSocialModalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => (isSocialModalOpen = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>{editingSocial ? 'Edit Social Link' : 'New Social Link'}</h2>
				<button type="button" class="btn-close" onclick={() => (isSocialModalOpen = false)}>×</button>
			</div>

			<form class="modal-body" onsubmit={(e) => { e.preventDefault(); saveSocial(); }}>
				<div class="form-row">
					<div class="form-group">
						<label for="platform">Platform *</label>
						<input type="text" id="platform" bind:value={socialForm.platform} required placeholder="Instagram" />
					</div>
					<div class="form-group">
						<label for="label">Label</label>
						<input type="text" id="label" bind:value={socialForm.label} placeholder="@username" />
					</div>
				</div>

				<div class="form-group">
					<label for="url">URL *</label>
					<input type="url" id="url" bind:value={socialForm.url} required placeholder="https://instagram.com/..." />
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="icon">Icon *</label>
						<input type="text" id="icon" bind:value={socialForm.icon} required placeholder="instagram" />
					</div>
					<div class="form-group">
						<label for="badge">Badge (optional)</label>
						<input type="text" id="badge" bind:value={socialForm.badge} placeholder="NEW" />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="order">Order</label>
						<input type="number" id="order" bind:value={socialForm.order_index} min="0" />
					</div>
					<div class="form-group checkbox-group">
						<label>
							<input type="checkbox" bind:checked={socialForm.is_visible} />
							Visible
						</label>
					</div>
				</div>

				<div class="modal-footer">
					<button type="submit" class="btn-save" disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Save'}
					</button>
					<button type="button" class="btn-cancel" onclick={() => (isSocialModalOpen = false)}>Cancel</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.layout-page {
		padding: 2rem;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.75rem;
	}

	.subtitle {
		color: var(--color-text-secondary, #666);
		margin: 0.25rem 0 0;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-border, #ddd);
		padding-bottom: 0.5rem;
	}

	.tabs button {
		padding: 0.75rem 1.5rem;
		background: none;
		border: none;
		cursor: pointer;
		font-weight: 500;
		color: var(--color-text-secondary, #666);
		border-radius: 4px 4px 0 0;
	}

	.tabs button.active {
		background: var(--color-primary, #333);
		color: white;
	}

	.card {
		background: white;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 8px;
		padding: 1.5rem;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.card h2 {
		margin: 0 0 1rem;
		font-size: 1.25rem;
	}

	.card h3 {
		margin: 1.5rem 0 0.75rem;
		font-size: 1rem;
		color: var(--color-text-secondary, #666);
	}

	.btn-primary {
		padding: 0.5rem 1rem;
		background: var(--color-primary, #333);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.25rem;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		font-size: 1rem;
		font-family: inherit;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-group input[type='checkbox'] {
		width: auto;
	}

	.btn-save {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary, #333);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.btn-save:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.social-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.social-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #f9f9f9;
		border-radius: 4px;
	}

	.social-item.hidden {
		opacity: 0.5;
	}

	.social-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.social-icon {
		font-size: 1.5rem;
	}

	.social-platform {
		font-weight: 600;
	}

	.social-url {
		color: var(--color-text-secondary, #666);
		font-size: 0.875rem;
	}

	.badge {
		background: var(--color-primary, #333);
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.social-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-edit,
	.btn-delete {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.btn-edit:hover {
		background: var(--color-primary, #333);
		color: white;
		border-color: var(--color-primary, #333);
	}

	.btn-delete:hover {
		background: #fee;
		border-color: #f88;
		color: #c00;
	}

	.empty {
		text-align: center;
		padding: 2rem;
		color: var(--color-text-secondary, #666);
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 8px;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-border, #ddd);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		line-height: 1;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.modal-footer {
		display: flex;
		gap: 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border, #ddd);
		justify-content: flex-end;
	}

	.btn-cancel {
		padding: 0.75rem 1.5rem;
		background: white;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	/* Dark theme support */
	:global(.dark) .page-header h1 {
		color: #f9fafb;
	}

	:global(.dark) .subtitle {
		color: #9ca3af;
	}

	:global(.dark) .tabs {
		border-color: #374151;
	}

	:global(.dark) .tabs button {
		color: #9ca3af;
	}

	:global(.dark) .tabs button:hover {
		color: #e5e7eb;
	}

	:global(.dark) .tabs button.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	:global(.dark) .card {
		background: #1f2937;
		border-color: #374151;
	}

	:global(.dark) .card h2 {
		color: #f9fafb;
	}

	:global(.dark) .card h3 {
		color: #9ca3af;
	}

	:global(.dark) .form-group label {
		color: #e5e7eb;
	}

	:global(.dark) .form-group input,
	:global(.dark) .form-group textarea {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}

	:global(.dark) .form-group input::placeholder,
	:global(.dark) .form-group textarea::placeholder {
		color: #9ca3af;
	}

	:global(.dark) .social-item {
		background: #374151;
	}

	:global(.dark) .social-platform {
		color: #f9fafb;
	}

	:global(.dark) .social-url {
		color: #9ca3af;
	}

	:global(.dark) .btn-edit,
	:global(.dark) .btn-delete {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}

	:global(.dark) .btn-edit:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: transparent;
		color: white;
	}

	:global(.dark) .btn-delete:hover {
		background: #7f1d1d;
		border-color: #991b1b;
		color: #fecaca;
	}

	:global(.dark) .empty {
		color: #9ca3af;
	}

	:global(.dark) .modal-content {
		background: #1f2937;
	}

	:global(.dark) .modal-header {
		border-color: #374151;
	}

	:global(.dark) .modal-header h2 {
		color: #f9fafb;
	}

	:global(.dark) .btn-close {
		color: #9ca3af;
	}

	:global(.dark) .btn-close:hover {
		color: #f9fafb;
	}

	:global(.dark) .modal-footer {
		border-color: #374151;
	}

	:global(.dark) .btn-cancel {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}
</style>
