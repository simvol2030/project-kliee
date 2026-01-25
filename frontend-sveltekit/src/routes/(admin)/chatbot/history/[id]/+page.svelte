<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let saving = $state(false);

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatTime(dateStr: string | null): string {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Chat Session | Admin</title>
</svelte:head>

<div class="admin-page">
	<div class="page-header">
		<div>
			<a href="/chatbot/history" class="back-link">← Back to History</a>
			<h1>Chat Session</h1>
			<p class="subtitle">Started {formatDate(data.session.started_at)}</p>
		</div>
	</div>

	{#if form?.success}
		<div class="alert success">Note saved!</div>
	{/if}

	<div class="session-info">
		<div class="info-item">
			<span class="label">Language:</span>
			<span class="value">{data.session.lang || 'en'}</span>
		</div>
		<div class="info-item">
			<span class="label">Messages:</span>
			<span class="value">{data.messages.length}</span>
		</div>
		<div class="info-item">
			<span class="label">Last Activity:</span>
			<span class="value">{formatDate(data.session.last_message_at)}</span>
		</div>
		<div class="info-item">
			<span class="label">Saved:</span>
			<span class="value">{data.session.is_saved ? 'Yes' : 'No'}</span>
		</div>
	</div>

	<div class="chat-container">
		<h2>Conversation</h2>
		<div class="messages">
			{#each data.messages as message (message.id)}
				<div class="message" class:user={message.role === 'user'} class:assistant={message.role === 'assistant'}>
					<div class="message-header">
						<span class="role">{message.role === 'user' ? 'Visitor' : 'Melena'}</span>
						<span class="time">{formatTime(message.created_at)}</span>
					</div>
					<div class="message-content">
						{message.content}
					</div>
					{#if message.tokens_used}
						<div class="tokens">Tokens: {message.tokens_used}</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="note-section">
		<h2>Admin Note</h2>
		<form
			method="POST"
			action="?/updateNote"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update();
					saving = false;
				};
			}}
		>
			<textarea
				name="admin_note"
				placeholder="Add a note about this conversation..."
				rows="3"
			>{data.session.admin_note || ''}</textarea>
			<button type="submit" class="btn primary" disabled={saving}>
				{saving ? 'Saving...' : 'Save Note'}
			</button>
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

	.alert.success {
		background: #dcfce7;
		color: #16a34a;
	}

	.session-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 16px;
		background: var(--bg-secondary);
		padding: 20px;
		border-radius: 12px;
		margin-bottom: 24px;
	}

	:global(.dark) .session-info {
		background: var(--bg-tertiary);
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.info-item .label {
		font-size: 12px;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.info-item .value {
		font-weight: 600;
	}

	.chat-container {
		margin-bottom: 24px;
	}

	.chat-container h2 {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 16px;
	}

	.messages {
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: var(--bg-secondary);
		padding: 20px;
		border-radius: 12px;
		max-height: 500px;
		overflow-y: auto;
	}

	:global(.dark) .messages {
		background: var(--bg-tertiary);
	}

	.message {
		max-width: 80%;
	}

	.message.user {
		align-self: flex-end;
	}

	.message.assistant {
		align-self: flex-start;
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
		font-size: 12px;
	}

	.role {
		font-weight: 600;
		color: var(--text-secondary);
	}

	.time {
		color: var(--text-tertiary);
	}

	.message-content {
		padding: 10px 14px;
		border-radius: 12px;
		font-size: 14px;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.message.user .message-content {
		background: var(--accent);
		color: white;
	}

	.message.assistant .message-content {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	:global(.dark) .message.assistant .message-content {
		background: var(--bg-secondary);
	}

	.tokens {
		font-size: 11px;
		color: var(--text-tertiary);
		margin-top: 4px;
		text-align: right;
	}

	.note-section {
		background: var(--bg-secondary);
		padding: 20px;
		border-radius: 12px;
	}

	:global(.dark) .note-section {
		background: var(--bg-tertiary);
	}

	.note-section h2 {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 16px;
	}

	.note-section textarea {
		width: 100%;
		padding: 12px;
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		font-size: 14px;
		resize: vertical;
		background: var(--bg-primary);
		color: var(--text-primary);
		margin-bottom: 12px;
	}

	:global(.dark) .note-section textarea {
		background: var(--bg-secondary);
		border-color: var(--border-secondary);
	}

	.note-section textarea:focus {
		outline: none;
		border-color: var(--accent);
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

		.message {
			max-width: 90%;
		}
	}
</style>
