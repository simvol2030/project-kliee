<script lang="ts">
	import { enhance } from '$app/forms';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	let { data, form } = $props();

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

	function formatLang(lang: string | null): string {
		const langs: Record<string, string> = {
			en: 'English',
			ru: 'Russian',
			es: 'Spanish',
			zh: 'Chinese'
		};
		return langs[lang || 'en'] || lang || 'Unknown';
	}
</script>

<svelte:head>
	<title>Chat History | Admin</title>
</svelte:head>

<div class="admin-page">
	<div class="page-header">
		<div>
			<h1>Chat History</h1>
			<p class="subtitle">View conversations with visitors</p>
		</div>
	</div>

	{#if form?.error}
		<div class="alert error">{form.error}</div>
	{/if}

	<div class="sessions-list">
		{#if data.sessions.length === 0}
			<div class="empty-state">
				<p>No chat sessions yet.</p>
			</div>
		{:else}
			<table class="sessions-table">
				<thead>
					<tr>
						<th>Started</th>
						<th>Language</th>
						<th>Messages</th>
						<th>Last Activity</th>
						<th>Saved</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.sessions as session (session.session_id)}
						<tr>
							<td>{formatDate(session.started_at)}</td>
							<td>{formatLang(session.lang)}</td>
							<td class="count">{session.message_count}</td>
							<td>{formatDate(session.last_message_at)}</td>
							<td>
								<form method="POST" action="?/toggleSaved" use:enhance>
									<CsrfToken />
									<input type="hidden" name="session_id" value={session.session_id} />
									<input type="hidden" name="is_saved" value={session.is_saved} />
									<button type="submit" class="btn-icon" title={session.is_saved ? 'Unsave' : 'Save'}>
										{session.is_saved ? '★' : '☆'}
									</button>
								</form>
							</td>
							<td class="actions">
								<a href="/chatbot/history/{session.session_id}" class="btn-icon" title="View">
									👁
								</a>
								<form method="POST" action="?/delete" use:enhance>
									<CsrfToken />
									<input type="hidden" name="session_id" value={session.session_id} />
									<button
										type="submit"
										class="btn-icon danger"
										title="Delete"
										onclick="return confirm('Delete this session?')"
									>
										✕
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.admin-page {
		max-width: 1000px;
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

	.sessions-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--bg-secondary);
		border-radius: 12px;
		overflow: hidden;
	}

	:global(.dark) .sessions-table {
		background: var(--bg-tertiary);
	}

	.sessions-table th,
	.sessions-table td {
		padding: 12px 16px;
		text-align: left;
		border-bottom: 1px solid var(--border-primary);
	}

	:global(.dark) .sessions-table th,
	:global(.dark) .sessions-table td {
		border-color: var(--border-secondary);
	}

	.sessions-table th {
		font-weight: 600;
		font-size: 13px;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sessions-table tbody tr:last-child td {
		border-bottom: none;
	}

	.sessions-table tbody tr:hover {
		background: var(--bg-tertiary);
	}

	:global(.dark) .sessions-table tbody tr:hover {
		background: var(--bg-secondary);
	}

	.count {
		font-weight: 600;
	}

	.actions {
		display: flex;
		gap: 8px;
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

	@media (max-width: 768px) {
		.admin-page {
			padding: 16px;
		}

		.sessions-table {
			display: block;
			overflow-x: auto;
		}
	}
</style>
