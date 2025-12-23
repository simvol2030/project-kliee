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
		selectable?: boolean;
		selectedIds?: Set<string>;
		onSelectionChange?: (selectedIds: Set<string>) => void;
		idKey?: string;
	}

	let {
		columns,
		data,
		searchPlaceholder,
		onRowClick,
		actions,
		selectable = false,
		selectedIds = $bindable(new Set()),
		onSelectionChange,
		idKey = 'id'
	}: Props = $props();

	let searchTerm = $state('');

	let allSelected = $derived(data.length > 0 && data.every((row) => selectedIds.has(String(row[idKey]))));
	let someSelected = $derived(data.some((row) => selectedIds.has(String(row[idKey]))) && !allSelected);

	function toggleAll() {
		if (allSelected) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(data.map((row) => String(row[idKey])));
		}
		onSelectionChange?.(selectedIds);
	}

	function toggleRow(id: string) {
		const newSet = new Set(selectedIds);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		selectedIds = newSet;
		onSelectionChange?.(newSet);
	}
</script>

<div class="data-table-wrapper">
	<table class="data-table">
		<thead>
			<tr>
				{#if selectable}
					<th class="checkbox-col">
						<input
							type="checkbox"
							checked={allSelected}
							indeterminate={someSelected}
							onchange={toggleAll}
						/>
					</th>
				{/if}
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
				<tr
					onclick={() => onRowClick?.(row)}
					class:clickable={!!onRowClick}
					class:selected={selectable && selectedIds.has(String(row[idKey]))}
				>
					{#if selectable}
						<td class="checkbox-col" onclick={(e) => e.stopPropagation()}>
							<input
								type="checkbox"
								checked={selectedIds.has(String(row[idKey]))}
								onchange={() => toggleRow(String(row[idKey]))}
							/>
						</td>
					{/if}
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
	tr.selected {
		background: #eef2ff;
	}
	tr.selected:hover {
		background: #e0e7ff;
	}
	.checkbox-col {
		width: 40px;
		text-align: center;
	}
	.checkbox-col input[type='checkbox'] {
		width: 16px;
		height: 16px;
		cursor: pointer;
	}
</style>
