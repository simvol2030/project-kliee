<script lang="ts">
	import { enhance } from '$app/forms';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	let { data, form } = $props();

	let showForm = $state(false);
	let saving = $state(false);
</script>

<svelte:head>
	<title>FAQ Knowledge Base | Admin</title>
</svelte:head>

<div class="admin-page">
	<div class="page-header">
		<div>
			<h1>FAQ Knowledge Base</h1>
			<p class="subtitle">Questions and answers used for AI grounding</p>
		</div>
		<button class="btn primary" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Cancel' : 'Add FAQ'}
		</button>
	</div>

	{#if form?.error}
		<div class="alert error">{form.error}</div>
	{/if}

	{#if form?.success}
		<div class="alert success">FAQ saved successfully!</div>
	{/if}

	{#if showForm}
		<div class="form-section">
			<h2>New FAQ Entry</h2>

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					saving = true;
					return async ({ update }) => {
						await update();
						saving = false;
						showForm = false;
					};
				}}
			>
				<CsrfToken />
				<div class="form-group">
					<label for="question_en">Question (English) *</label>
					<input type="text" name="question_en" id="question_en" required />
				</div>

				<div class="form-group">
					<label for="answer_en">Answer (English) *</label>
					<textarea name="answer_en" id="answer_en" rows="3" required></textarea>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="question_ru">Question (Russian)</label>
						<input type="text" name="question_ru" id="question_ru" />
					</div>
					<div class="form-group">
						<label for="answer_ru">Answer (Russian)</label>
						<textarea name="answer_ru" id="answer_ru" rows="2"></textarea>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="question_es">Question (Spanish)</label>
						<input type="text" name="question_es" id="question_es" />
					</div>
					<div class="form-group">
						<label for="answer_es">Answer (Spanish)</label>
						<textarea name="answer_es" id="answer_es" rows="2"></textarea>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="question_zh">Question (Chinese)</label>
						<input type="text" name="question_zh" id="question_zh" />
					</div>
					<div class="form-group">
						<label for="answer_zh">Answer (Chinese)</label>
						<textarea name="answer_zh" id="answer_zh" rows="2"></textarea>
					</div>
				</div>

				<div class="form-group">
					<label for="keywords">Keywords (comma-separated)</label>
					<input
						type="text"
						name="keywords"
						id="keywords"
						placeholder="art, exhibition, price, contact"
					/>
					<p class="help-text">Keywords help match user questions to this FAQ</p>
				</div>

				<div class="form-actions">
					<button type="submit" class="btn primary" disabled={saving}>
						{saving ? 'Saving...' : 'Add FAQ'}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="faq-list">
		{#if data.faqs.length === 0}
			<div class="empty-state">
				<p>No FAQ entries yet. Add your first one to improve AI responses.</p>
			</div>
		{:else}
			{#each data.faqs as faq (faq.id)}
				<div class="faq-item" class:inactive={!faq.is_active}>
					<div class="faq-content">
						<div class="faq-question">{faq.question_en}</div>
						<div class="faq-answer">{faq.answer_en}</div>
						{#if faq.keywords}
							<div class="faq-keywords">
								{#each JSON.parse(faq.keywords) as keyword}
									<span class="keyword">{keyword}</span>
								{/each}
							</div>
						{/if}
					</div>
					<div class="faq-actions">
						<form method="POST" action="?/toggle" use:enhance>
							<CsrfToken />
							<input type="hidden" name="id" value={faq.id} />
							<input type="hidden" name="is_active" value={faq.is_active} />
							<button type="submit" class="btn-icon" title={faq.is_active ? 'Deactivate' : 'Activate'}>
								{faq.is_active ? '✓' : '○'}
							</button>
						</form>
						<a href="/chatbot/faq/{faq.id}" class="btn-icon" title="Edit">
							✎
						</a>
						<form method="POST" action="?/delete" use:enhance>
							<CsrfToken />
							<input type="hidden" name="id" value={faq.id} />
							<button type="submit" class="btn-icon danger" title="Delete" onclick="return confirm('Delete this FAQ?')">
								✕
							</button>
						</form>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.admin-page {
		max-width: 900px;
		margin: 0 auto;
		padding: 32px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
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
		margin: 0 0 16px;
		font-size: 18px;
		font-weight: 600;
	}

	.form-group {
		margin-bottom: 16px;
	}

	.form-group label {
		display: block;
		font-weight: 500;
		margin-bottom: 6px;
		font-size: 14px;
	}

	.form-group input,
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
	:global(.dark) .form-group textarea {
		background: var(--bg-secondary);
		border-color: var(--border-secondary);
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.help-text {
		font-size: 12px;
		color: var(--text-tertiary);
		margin: 4px 0 0;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 16px;
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

	/* FAQ List */
	.faq-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.faq-item {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 16px;
		background: var(--bg-secondary);
		border-radius: 12px;
		gap: 16px;
	}

	:global(.dark) .faq-item {
		background: var(--bg-tertiary);
	}

	.faq-item.inactive {
		opacity: 0.6;
	}

	.faq-content {
		flex: 1;
	}

	.faq-question {
		font-weight: 600;
		margin-bottom: 8px;
	}

	.faq-answer {
		color: var(--text-secondary);
		font-size: 14px;
		line-height: 1.5;
	}

	.faq-keywords {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 12px;
	}

	.keyword {
		background: var(--bg-tertiary);
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		color: var(--text-secondary);
	}

	:global(.dark) .keyword {
		background: var(--bg-secondary);
	}

	.faq-actions {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}

	.btn-icon {
		width: 32px;
		height: 32px;
		border: none;
		background: var(--bg-tertiary);
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		color: var(--text-primary);
		text-decoration: none;
	}

	:global(.dark) .btn-icon {
		background: var(--bg-secondary);
	}

	.btn-icon:hover {
		background: var(--border-primary);
	}

	.btn-icon.danger:hover {
		background: #fee2e2;
		color: #dc2626;
	}

	.empty-state {
		text-align: center;
		padding: 48px;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		border-radius: 12px;
	}

	@media (max-width: 600px) {
		.admin-page {
			padding: 16px;
		}

		.page-header {
			flex-direction: column;
			gap: 16px;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.faq-item {
			flex-direction: column;
		}

		.faq-actions {
			align-self: flex-end;
		}
	}
</style>
