<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Column {
		key: string;
		label: string;
		sortable?: boolean;
		width?: string;
	}

	interface Props {
		columns: Column[];
		data: any[];
		searchPlaceholder?: string;
		onRowClick?: (row: any) => void;
		actions?: Snippet<[any]>;
	}

	let { columns, data, searchPlaceholder, onRowClick, actions }: Props = $props();

	let searchTerm = $state('');
</script>

<div class="data-table-wrapper">
	<table class="data-table">
		<thead>
			<tr>
				{#each columns as col}
					<th style:width={col.width}>{col.label}</th>
				{/each}
				{#if actions}
					<th>Actions</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each data as row}
				<tr onclick={() => onRowClick?.(row)} class:clickable={!!onRowClick}>
					{#each columns as col}
						<td>{row[col.key] ?? '—'}</td>
					{/each}
					{#if actions}
						<td>
							{@render actions(row)}
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.data-table-wrapper {
		overflow-x: auto;
	}
	.data-table {
		width: 100%;
		border-collapse: collapse;
	}
	th, td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--color-border, #eee);
	}
	th {
		background: var(--color-surface, #f5f5f5);
		font-weight: 600;
	}
	tr.clickable {
		cursor: pointer;
	}
	tr.clickable:hover {
		background: var(--color-hover, #f0f0f0);
	}
</style>
