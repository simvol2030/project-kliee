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

	// Filter data based on search term
	let filteredData = $derived.by(() => {
		if (!searchTerm.trim()) return data;
		const term = searchTerm.toLowerCase();
		return data.filter((row) =>
			columns.some((col) => {
				const value = row[col.key];
				return value != null && String(value).toLowerCase().includes(term);
			})
		);
	});

	let allSelected = $derived(filteredData.length > 0 && filteredData.every((row) => selectedIds.has(String(row[idKey]))));
	let someSelected = $derived(filteredData.some((row) => selectedIds.has(String(row[idKey]))) && !allSelected);

	function toggleAll() {
		if (allSelected) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(filteredData.map((row) => String(row[idKey])));
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
	{#if searchPlaceholder}
		<div class="search-wrapper">
			<input
				type="text"
				bind:value={searchTerm}
				placeholder={searchPlaceholder}
				class="search-input"
			/>
			{#if searchTerm}
				<button class="clear-btn" onclick={() => (searchTerm = '')}>×</button>
			{/if}
		</div>
	{/if}
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
			{#each filteredData as row}
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
	.search-wrapper {
		position: relative;
		margin-bottom: 1rem;
		max-width: 300px;
	}
	.search-input {
		width: 100%;
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}
	.search-input:focus {
		outline: none;
		border-color: var(--color-primary, #3b82f6);
		box-shadow: 0 0 0 2px var(--color-primary-light, rgba(59, 130, 246, 0.2));
	}
	.clear-btn {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		font-size: 1.25rem;
		color: var(--color-muted, #6b7280);
		cursor: pointer;
		line-height: 1;
		padding: 0 0.25rem;
	}
	.clear-btn:hover {
		color: var(--color-text, #111);
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

	/* Dark theme support */
	:global(.dark) .search-input {
		background-color: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}

	:global(.dark) .search-input::placeholder {
		color: #9ca3af;
	}

	:global(.dark) .clear-btn {
		color: #9ca3af;
	}

	:global(.dark) .clear-btn:hover {
		color: #f9fafb;
	}

	:global(.dark) th {
		background: #374151;
		color: #e5e7eb;
		border-color: #4b5563;
	}

	:global(.dark) td {
		border-color: #374151;
		color: #e5e7eb;
	}

	:global(.dark) tr.clickable:hover {
		background: #1f2937;
	}

	:global(.dark) tr.selected {
		background: #312e81;
	}

	:global(.dark) tr.selected:hover {
		background: #3730a3;
	}
</style>
