<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let saving = $state(false);

	// Parse keywords for display
	const keywordsString = $derived(() => {
		if (data.faq.keywords) {
			try {
				return JSON.parse(data.faq.keywords).join(', ');
			} catch {
				return data.faq.keywords;
			}
		}
		return '';
	});
</script>

<svelte:head>
	<title>Edit FAQ | Admin</title>
</svelte:head>

<div class="admin-page">
	<div class="page-header">
		<div>
			<a href="/chatbot/faq" class="back-link">← Back to FAQ List</a>
			<h1>Edit FAQ</h1>
		</div>
	</div>

	{#if form?.error}
		<div class="alert error">{form.error}</div>
	{/if}

	<div class="form-section">
		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update();
					saving = false;
				};
			}}
		>
			<div class="form-group">
				<label for="question_en">Question (English) *</label>
				<input type="text" name="question_en" id="question_en" value={data.faq.question_en} required />
			</div>

			<div class="form-group">
				<label for="answer_en">Answer (English) *</label>
				<textarea name="answer_en" id="answer_en" rows="3" required>{data.faq.answer_en}</textarea>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="question_ru">Question (Russian)</label>
					<input type="text" name="question_ru" id="question_ru" value={data.faq.question_ru || ''} />
				</div>
				<div class="form-group">
					<label for="answer_ru">Answer (Russian)</label>
					<textarea name="answer_ru" id="answer_ru" rows="2">{data.faq.answer_ru || ''}</textarea>
				</div>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="question_es">Question (Spanish)</label>
					<input type="text" name="question_es" id="question_es" value={data.faq.question_es || ''} />
				</div>
				<div class="form-group">
					<label for="answer_es">Answer (Spanish)</label>
					<textarea name="answer_es" id="answer_es" rows="2">{data.faq.answer_es || ''}</textarea>
				</div>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="question_zh">Question (Chinese)</label>
					<input type="text" name="question_zh" id="question_zh" value={data.faq.question_zh || ''} />
				</div>
				<div class="form-group">
					<label for="answer_zh">Answer (Chinese)</label>
					<textarea name="answer_zh" id="answer_zh" rows="2">{data.faq.answer_zh || ''}</textarea>
				</div>
			</div>

			<div class="form-group">
				<label for="keywords">Keywords (comma-separated)</label>
				<input
					type="text"
					name="keywords"
					id="keywords"
					value={keywordsString()}
					placeholder="art, exhibition, price, contact"
				/>
				<p class="help-text">Keywords help match user questions to this FAQ</p>
			</div>

			<div class="form-actions">
				<a href="/chatbot/faq" class="btn secondary">Cancel</a>
				<button type="submit" class="btn primary" disabled={saving}>
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</form>
	</div>
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

	.back-link {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 14px;
		display: inline-block;
		margin-bottom: 8px;
	}

	.back-link:hover {
		color: var(--accent);
	}

	.page-header h1 {
		margin: 0;
		font-size: 28px;
		font-weight: 600;
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

	.form-section {
		background: var(--bg-secondary);
		border-radius: 12px;
		padding: 24px;
	}

	:global(.dark) .form-section {
		background: var(--bg-tertiary);
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
		gap: 12px;
		margin-top: 24px;
	}

	.btn {
		padding: 10px 20px;
		border-radius: 8px;
		font-weight: 500;
		font-size: 14px;
		cursor: pointer;
		border: none;
		transition: all 0.2s;
		text-decoration: none;
	}

	.btn.primary {
		background: var(--accent);
		color: white;
	}

	.btn.primary:hover:not(:disabled) {
		background: var(--accent-dark);
	}

	.btn.secondary {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.btn.secondary:hover {
		background: var(--border-primary);
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
