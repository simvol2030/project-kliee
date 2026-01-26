<script lang="ts">
	import { enhance } from '$app/forms';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	let { data, form } = $props();

	let saving = $state(false);
</script>

<svelte:head>
	<title>Chatbot Settings | Admin</title>
</svelte:head>

<div class="admin-page">
	<div class="page-header">
		<h1>Chatbot Settings</h1>
		<p class="subtitle">Configure AI consultant "Melena"</p>
	</div>

	{#if form?.error}
		<div class="alert error">{form.error}</div>
	{/if}

	{#if form?.success}
		<div class="alert success">Settings saved successfully!</div>
	{/if}

	<form
		method="POST"
		action="?/save"
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				await update();
				saving = false;
			};
		}}
	>
		<CsrfToken />
		<div class="form-section">
			<h2>General</h2>

			<div class="form-group">
				<label>
					<input
						type="checkbox"
						name="is_enabled"
						checked={data.settings.is_enabled}
					/>
					Enable Chatbot
				</label>
				<p class="help-text">When disabled, the chat widget will not appear on the site.</p>
			</div>

			<div class="form-group">
				<label for="api_key">OpenRouter API Key</label>
				<input
					type="password"
					name="api_key"
					id="api_key"
					value={data.settings.api_key || ''}
					placeholder="sk-or-v1-..."
					autocomplete="off"
				/>
				<p class="help-text">
					Get your API key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener">openrouter.ai/keys</a>.
					Leave empty to use .env file.
				</p>
			</div>

			<div class="form-group">
				<label for="model">AI Model</label>
				<select name="model" id="model" required>
					{#each data.availableModels as model}
						<option value={model.id} selected={data.settings.model === model.id}>
							{model.name}
						</option>
					{/each}
				</select>
				<p class="help-text">Select the AI model to use. Haiku is fast and affordable.</p>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="temperature">Temperature</label>
					<input
						type="number"
						name="temperature"
						id="temperature"
						min="0"
						max="2"
						step="0.1"
						value={data.settings.temperature}
					/>
					<p class="help-text">Higher = more creative (0-2)</p>
				</div>

				<div class="form-group">
					<label for="max_tokens">Max Tokens</label>
					<input
						type="number"
						name="max_tokens"
						id="max_tokens"
						min="100"
						max="4096"
						step="100"
						value={data.settings.max_tokens}
					/>
					<p class="help-text">Maximum response length</p>
				</div>
			</div>
		</div>

		<div class="form-section">
			<h2>System Prompt</h2>
			<p class="section-description">
				Define the personality and behavior of Melena. This prompt is sent with every message.
			</p>

			<div class="form-group">
				<textarea
					name="system_prompt"
					id="system_prompt"
					rows="12"
					required
				>{data.settings.system_prompt}</textarea>
			</div>
		</div>

		<div class="form-section">
			<h2>Greeting Messages</h2>
			<p class="section-description">
				The first message visitors see when opening the chat.
			</p>

			<div class="form-group">
				<label for="greeting_en">English</label>
				<input
					type="text"
					name="greeting_en"
					id="greeting_en"
					value={data.settings.greeting_en || ''}
				/>
			</div>

			<div class="form-group">
				<label for="greeting_ru">Russian</label>
				<input
					type="text"
					name="greeting_ru"
					id="greeting_ru"
					value={data.settings.greeting_ru || ''}
				/>
			</div>

			<div class="form-group">
				<label for="greeting_es">Spanish</label>
				<input
					type="text"
					name="greeting_es"
					id="greeting_es"
					value={data.settings.greeting_es || ''}
				/>
			</div>

			<div class="form-group">
				<label for="greeting_zh">Chinese</label>
				<input
					type="text"
					name="greeting_zh"
					id="greeting_zh"
					value={data.settings.greeting_zh || ''}
				/>
			</div>
		</div>

		<div class="form-actions">
			<button type="submit" class="btn primary" disabled={saving}>
				{saving ? 'Saving...' : 'Save Settings'}
			</button>
		</div>
	</form>
</div>

<style>
	.admin-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 32px;
	}

	.page-header {
		margin-bottom: 32px;
	}

	.page-header h1 {
		margin: 0 0 8px;
		font-size: 28px;
		font-weight: 600;
	}

	.subtitle {
		color: var(--text-secondary);
		margin: 0;
	}

	.alert {
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 24px;
	}

	.alert.error {
		background: #fee2e2;
		color: #dc2626;
	}

	.alert.success {
		background: #dcfce7;
		color: #16a34a;
	}

	:global(.dark) .alert.error {
		background: rgba(220, 38, 38, 0.2);
	}

	:global(.dark) .alert.success {
		background: rgba(22, 163, 74, 0.2);
	}

	.form-section {
		background: var(--bg-secondary);
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 24px;
	}

	:global(.dark) .form-section {
		background: var(--bg-tertiary);
	}

	.form-section h2 {
		margin: 0 0 8px;
		font-size: 18px;
		font-weight: 600;
	}

	.section-description {
		color: var(--text-secondary);
		margin: 0 0 16px;
		font-size: 14px;
	}

	.form-group {
		margin-bottom: 16px;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group label {
		display: block;
		font-weight: 500;
		margin-bottom: 6px;
		font-size: 14px;
	}

	.form-group input[type="checkbox"] {
		margin-right: 8px;
	}

	.form-group input[type="text"],
	.form-group input[type="number"],
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		font-size: 14px;
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	:global(.dark) .form-group input,
	:global(.dark) .form-group select,
	:global(.dark) .form-group textarea {
		background: var(--bg-secondary);
		border-color: var(--border-secondary);
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.form-group textarea {
		font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
		resize: vertical;
		min-height: 200px;
	}

	.help-text {
		font-size: 12px;
		color: var(--text-tertiary);
		margin: 4px 0 0;
	}

	.help-text a {
		color: var(--accent);
		text-decoration: none;
	}

	.help-text a:hover {
		text-decoration: underline;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
	}

	.btn {
		padding: 10px 20px;
		border-radius: 8px;
		font-weight: 500;
		font-size: 14px;
		cursor: pointer;
		border: none;
		transition: all 0.2s;
	}

	.btn.primary {
		background: var(--accent);
		color: white;
	}

	.btn.primary:hover:not(:disabled) {
		background: var(--accent-dark);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 600px) {
		.admin-page {
			padding: 16px;
		}

		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
