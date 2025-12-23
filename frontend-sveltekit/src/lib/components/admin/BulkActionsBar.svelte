<script lang="ts">
	interface Props {
		selectedCount: number;
		onDelete?: () => void;
		onSetVisible?: (visible: boolean) => void;
		onSetForSale?: (forSale: boolean) => void;
		onClearSelection?: () => void;
		customActions?: Array<{
			label: string;
			icon?: string;
			variant?: 'default' | 'danger';
			onclick: () => void;
		}>;
	}

	let {
		selectedCount,
		onDelete,
		onSetVisible,
		onSetForSale,
		onClearSelection,
		customActions = []
	}: Props = $props();

	let isVisible = $derived(selectedCount > 0);
</script>

{#if isVisible}
	<div class="bulk-actions-bar">
		<div class="selection-info">
			<span class="count">{selectedCount}</span>
			<span class="label">item{selectedCount > 1 ? 's' : ''} selected</span>
			{#if onClearSelection}
				<button class="btn-clear" onclick={onClearSelection}>
					Clear selection
				</button>
			{/if}
		</div>

		<div class="actions">
			{#if onSetVisible}
				<button class="btn-action" onclick={() => onSetVisible(true)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
						<circle cx="12" cy="12" r="3"></circle>
					</svg>
					Show
				</button>
				<button class="btn-action" onclick={() => onSetVisible(false)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
						<line x1="1" y1="1" x2="23" y2="23"></line>
					</svg>
					Hide
				</button>
			{/if}

			{#if onSetForSale}
				<button class="btn-action" onclick={() => onSetForSale(true)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="9" cy="21" r="1"></circle>
						<circle cx="20" cy="21" r="1"></circle>
						<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
					</svg>
					For Sale
				</button>
				<button class="btn-action" onclick={() => onSetForSale(false)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
					</svg>
					Not For Sale
				</button>
			{/if}

			{#each customActions as action}
				<button
					class="btn-action"
					class:danger={action.variant === 'danger'}
					onclick={action.onclick}
				>
					{action.label}
				</button>
			{/each}

			{#if onDelete}
				<button class="btn-action danger" onclick={onDelete}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="3 6 5 6 21 6"></polyline>
						<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
						<line x1="10" y1="11" x2="10" y2="17"></line>
						<line x1="14" y1="11" x2="14" y2="17"></line>
					</svg>
					Delete
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.bulk-actions-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #1e293b;
		color: #fff;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		animation: slideIn 0.2s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.selection-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.count {
		background: #6366f1;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.label {
		font-size: 0.875rem;
		color: #cbd5e1;
	}

	.btn-clear {
		margin-left: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: transparent;
		border: 1px solid #475569;
		border-radius: 0.25rem;
		color: #94a3b8;
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-clear:hover {
		background: #334155;
		color: #fff;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-action {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		background: #334155;
		border: none;
		border-radius: 0.375rem;
		color: #fff;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-action:hover {
		background: #475569;
	}

	.btn-action.danger {
		background: #7f1d1d;
	}

	.btn-action.danger:hover {
		background: #991b1b;
	}
</style>
