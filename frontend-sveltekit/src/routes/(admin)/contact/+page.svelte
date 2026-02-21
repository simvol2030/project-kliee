<script lang="ts">
	import { page } from '$app/stores';

	// CSRF helpers
	const csrfHeaders = () => ({
		'Content-Type': 'application/json',
		'x-csrf-token': $page.data.csrfToken || ''
	});
	const csrfDeleteHeaders = () => ({ 'x-csrf-token': $page.data.csrfToken || '' });

	interface SocialLink {
		id: number;
		platform: string;
		label: string;
		url: string;
		order_index: number | null;
		is_visible: boolean | null;
	}

	let { data } = $props();

	let socialLinks = $state<SocialLink[]>(data.socialLinks || []);
	let activeTab = $state<'settings' | 'social'>('settings');
	let isSaving = $state(false);
	let saveMessage = $state('');

	// Settings form
	let settingsForm = $state({
		contact_recipient_email: data.contactSettings?.contact_recipient_email || '',
		contact_form_enabled: data.contactSettings?.contact_form_enabled !== 'false',
		contact_auto_reply_enabled: data.contactSettings?.contact_auto_reply_enabled !== 'false',
		contact_telegram_enabled: data.contactSettings?.contact_telegram_enabled === 'true',
		contact_telegram_bot_token: data.contactSettings?.contact_telegram_bot_token || '',
		contact_telegram_chat_id: data.contactSettings?.contact_telegram_chat_id || ''
	});

	// Social modal
	let isSocialModalOpen = $state(false);
	let editingSocial = $state<SocialLink | null>(null);
	let socialForm = $state({
		platform: '',
		label: '',
		url: '',
		order_index: 0,
		is_visible: true
	});

	// Test email state
	let testEmailSending = $state(false);
	let testEmailMessage = $state('');

	// Test telegram state
	let testTelegramSending = $state(false);
	let testTelegramMessage = $state('');

	async function saveSettings() {
		isSaving = true;
		saveMessage = '';
		try {
			const res = await fetch('/api/contact/settings', {
				method: 'POST',
				headers: csrfHeaders(),
				body: JSON.stringify({
					contact_recipient_email: settingsForm.contact_recipient_email,
					contact_form_enabled: String(settingsForm.contact_form_enabled),
					contact_auto_reply_enabled: String(settingsForm.contact_auto_reply_enabled),
					contact_telegram_enabled: String(settingsForm.contact_telegram_enabled),
					contact_telegram_bot_token: settingsForm.contact_telegram_bot_token,
					contact_telegram_chat_id: settingsForm.contact_telegram_chat_id
				})
			});
			if (res.ok) {
				saveMessage = 'Settings saved successfully';
			} else {
				saveMessage = 'Failed to save settings';
			}
		} catch {
			saveMessage = 'Error saving settings';
		} finally {
			isSaving = false;
			setTimeout(() => { saveMessage = ''; }, 3000);
		}
	}

	async function sendTestEmail() {
		testEmailSending = true;
		testEmailMessage = '';
		try {
			const res = await fetch('/api/contact/test-email', {
				method: 'POST',
				headers: csrfHeaders(),
				body: JSON.stringify({ to: settingsForm.contact_recipient_email })
			});
			const result = await res.json();
			testEmailMessage = result.success
				? `Test email sent via ${result.transport}`
				: `Failed: ${result.error || result.message}`;
		} catch {
			testEmailMessage = 'Error sending test email';
		} finally {
			testEmailSending = false;
			setTimeout(() => { testEmailMessage = ''; }, 5000);
		}
	}

	async function sendTestTelegram() {
		testTelegramSending = true;
		testTelegramMessage = '';
		try {
			const res = await fetch('/api/contact/test-telegram', {
				method: 'POST',
				headers: csrfHeaders(),
				body: JSON.stringify({
					bot_token: settingsForm.contact_telegram_bot_token,
					chat_id: settingsForm.contact_telegram_chat_id
				})
			});
			const result = await res.json();
			testTelegramMessage = result.success
				? 'Test message sent to Telegram'
				: `Failed: ${result.error || result.message}`;
		} catch {
			testTelegramMessage = 'Error sending test message';
		} finally {
			testTelegramSending = false;
			setTimeout(() => { testTelegramMessage = ''; }, 5000);
		}
	}

	function openSocialModal(social?: SocialLink) {
		if (social) {
			editingSocial = social;
			socialForm = {
				platform: social.platform,
				label: social.label,
				url: social.url,
				order_index: social.order_index || 0,
				is_visible: social.is_visible !== false
			};
		} else {
			editingSocial = null;
			socialForm = {
				platform: '',
				label: '',
				url: '',
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
				await fetch(`/api/contact/social/${editingSocial.id}`, {
					method: 'PATCH',
					headers: csrfHeaders(),
					body: JSON.stringify(socialForm)
				});
			} else {
				await fetch('/api/contact/social', {
					method: 'POST',
					headers: csrfHeaders(),
					body: JSON.stringify(socialForm)
				});
			}
			await loadSocialLinks();
			isSocialModalOpen = false;
		} finally {
			isSaving = false;
		}
	}

	async function deleteSocial(id: number) {
		if (!confirm('Delete this social link?')) return;
		await fetch(`/api/contact/social/${id}`, { method: 'DELETE', headers: csrfDeleteHeaders() });
		await loadSocialLinks();
	}

	async function loadSocialLinks() {
		const res = await fetch('/api/contact/social');
		socialLinks = await res.json();
	}
</script>

<svelte:head>
	<title>Contact | Admin</title>
</svelte:head>

<div class="layout-page">
	<header class="page-header">
		<div>
			<h1>Contact Settings</h1>
			<p class="subtitle">Manage contact form settings and social links</p>
		</div>
	</header>

	<nav class="tabs">
		<button type="button" class:active={activeTab === 'settings'} onclick={() => (activeTab = 'settings')}>Settings</button>
		<button type="button" class:active={activeTab === 'social'} onclick={() => (activeTab = 'social')}>Social Links</button>
	</nav>

	{#if activeTab === 'settings'}
		<div class="card">
			<h2>Contact Form Settings</h2>
			<form onsubmit={(e) => { e.preventDefault(); saveSettings(); }}>
				<div class="form-group">
					<label for="recipient_email">Recipient Email</label>
					<input
						type="email"
						id="recipient_email"
						bind:value={settingsForm.contact_recipient_email}
						placeholder="info@k-liee.com"
					/>
					<p class="help-text">Contact form submissions will be sent to this email</p>
				</div>

				<div class="form-group checkbox-group">
					<label>
						<input type="checkbox" bind:checked={settingsForm.contact_form_enabled} />
						Contact form enabled
					</label>
					<p class="help-text">When disabled, the form returns a 503 error</p>
				</div>

				<div class="form-group checkbox-group">
					<label>
						<input type="checkbox" bind:checked={settingsForm.contact_auto_reply_enabled} />
						Auto-reply enabled
					</label>
					<p class="help-text">Send automatic confirmation email to the submitter</p>
				</div>

				<hr class="section-divider" />

				<h3>Telegram Notifications</h3>
				<p class="section-description">Receive contact form submissions in Telegram</p>

				<div class="form-group checkbox-group">
					<label>
						<input type="checkbox" bind:checked={settingsForm.contact_telegram_enabled} />
						Telegram notifications enabled
					</label>
					<p class="help-text">Send contact form submissions to Telegram</p>
				</div>

				<div class="form-group">
					<label for="telegram_bot_token">Bot Token</label>
					<input
						type="text"
						id="telegram_bot_token"
						bind:value={settingsForm.contact_telegram_bot_token}
						placeholder="123456789:ABCdefGHI..."
						autocomplete="off"
					/>
					<p class="help-text">Get from @BotFather in Telegram</p>
				</div>

				<div class="form-group">
					<label for="telegram_chat_id">Chat ID</label>
					<input
						type="text"
						id="telegram_chat_id"
						bind:value={settingsForm.contact_telegram_chat_id}
						placeholder="-1001234567890"
						autocomplete="off"
					/>
					<p class="help-text">Your chat, group, or channel ID</p>
				</div>

				<div class="form-actions">
					<button
						type="button"
						class="btn-secondary"
						disabled={testTelegramSending || !settingsForm.contact_telegram_bot_token || !settingsForm.contact_telegram_chat_id}
						onclick={sendTestTelegram}
					>
						{testTelegramSending ? 'Sending...' : 'Test Telegram'}
					</button>
				</div>

				{#if testTelegramMessage}
					<p class="status-message">{testTelegramMessage}</p>
				{/if}

				<hr class="section-divider" />

				<div class="form-actions">
					<button type="submit" class="btn-save" disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Save Settings'}
					</button>

					<button
						type="button"
						class="btn-secondary"
						disabled={testEmailSending || !settingsForm.contact_recipient_email}
						onclick={sendTestEmail}
					>
						{testEmailSending ? 'Sending...' : 'Send Test Email'}
					</button>
				</div>

				{#if saveMessage}
					<p class="status-message">{saveMessage}</p>
				{/if}

				{#if testEmailMessage}
					<p class="status-message">{testEmailMessage}</p>
				{/if}
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
							<span class="social-platform">{link.platform}</span>
							<span class="social-label">{link.label}</span>
							<span class="social-url">{link.url}</span>
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
						<input type="text" id="platform" bind:value={socialForm.platform} required placeholder="instagram" />
					</div>
					<div class="form-group">
						<label for="label">Label</label>
						<input type="text" id="label" bind:value={socialForm.label} placeholder="Instagram" />
					</div>
				</div>

				<div class="form-group">
					<label for="url">URL *</label>
					<input type="url" id="url" bind:value={socialForm.url} required placeholder="https://instagram.com/..." />
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

	.form-group input[type='text'],
	.form-group input[type='email'],
	.form-group input[type='url'],
	.form-group input[type='number'],
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		font-size: 1rem;
		font-family: inherit;
	}

	.section-divider {
		border: none;
		border-top: 1px solid var(--color-border, #ddd);
		margin: 1.5rem 0;
	}

	h3 {
		margin: 0 0 0.25rem;
		font-size: 1.1rem;
	}

	.section-description {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		color: var(--color-text-secondary, #666);
	}

	.help-text {
		margin: 0.25rem 0 0;
		font-size: 0.8rem;
		color: var(--color-text-secondary, #999);
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

	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;
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

	.btn-secondary {
		padding: 0.75rem 1.5rem;
		background: white;
		color: var(--color-primary, #333);
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.btn-secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.status-message {
		margin-top: 0.75rem;
		padding: 0.5rem 0.75rem;
		background: #f0fdf4;
		color: #166534;
		border-radius: 4px;
		font-size: 0.875rem;
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

	.social-platform {
		font-weight: 600;
		text-transform: capitalize;
	}

	.social-label {
		color: var(--color-text-secondary, #666);
	}

	.social-url {
		color: var(--color-text-secondary, #666);
		font-size: 0.875rem;
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

	:global(.dark) h3 {
		color: #f9fafb;
	}

	:global(.dark) .section-description {
		color: #9ca3af;
	}

	:global(.dark) .section-divider {
		border-color: #374151;
	}

	:global(.dark) .help-text {
		color: #6b7280;
	}

	:global(.dark) .status-message {
		background: #1c3d2e;
		color: #a3d9a5;
	}

	:global(.dark) .social-item {
		background: #374151;
	}

	:global(.dark) .social-platform {
		color: #f9fafb;
	}

	:global(.dark) .social-label,
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

	:global(.dark) .btn-secondary {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
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
