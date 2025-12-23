<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import SortableList from '$lib/components/admin/SortableList.svelte';
	import BulkActionsBar from '$lib/components/admin/BulkActionsBar.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	let { data }: { data: PageData } = $props();

	// View mode
	let viewMode = $state<'table' | 'reorder'>('table');
	let sortableItems = $state([...data.artworks]);
	let isSaving = $state(false);

	// Selection
	let selectedIds = $state<Set<string>>(new Set());
	let selectedCount = $derived(selectedIds.size);

	// Delete confirmation
	let deleteDialogOpen = $state(false);
	let artworkToDelete = $state<string | null>(null);
	let artworkNameToDelete = $state('');
	let isBulkDelete = $state(false);

	// Toast
	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');

	// Handle reorder
	async function handleReorder(items: any[]) {
		sortableItems = items;
	}

	async function saveOrder() {
		isSaving = true;
		try {
			const response = await fetch('/api/admin/reorder', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					entity: 'artworks',
					items: sortableItems.map((item, index) => ({
						id: item.id,
						order_index: index
					}))
				})
			});

			if (response.ok) {
				showToast('Order saved successfully', 'success');
				await invalidateAll();
			} else {
				showToast('Failed to save order', 'error');
			}
		} catch {
			showToast('Failed to save order', 'error');
		} finally {
			isSaving = false;
		}
	}

	const columns = [
		{ key: 'title_en', label: 'Title', sortable: true },
		{ key: 'seriesName', label: 'Series', sortable: true },
		{ key: 'year', label: 'Year', sortable: true, width: '80px' },
		{ key: 'priceFormatted', label: 'Price', sortable: true, width: '100px' },
		{ key: 'forSale', label: 'Available', width: '80px' }
	];

	// Transform data for display
	const tableData = $derived(
		data.artworks.map((a) => ({
			...a,
			seriesName: data.series.find((s) => s.id === a.series_id)?.name_en || '—',
			priceFormatted: a.price ? `€${a.price}` : '—',
			forSale: a.is_for_sale ? 'Yes' : 'No'
		}))
	);

	function handleRowClick(row: any) {
		goto(`/artworks/${row.id}`);
	}

	function openDeleteDialog(artwork: any) {
		artworkToDelete = artwork.id;
		artworkNameToDelete = artwork.title_en;
		isBulkDelete = false;
		deleteDialogOpen = true;
	}

	function openBulkDeleteDialog() {
		isBulkDelete = true;
		deleteDialogOpen = true;
	}

	async function performBulkAction(action: string, value?: boolean) {
		try {
			const response = await fetch('/api/admin/bulk', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					entity: 'artworks',
					action,
					ids: Array.from(selectedIds),
					value
				})
			});

			if (response.ok) {
				const result = await response.json();
				showToast(`Updated ${result.affected} item(s)`, 'success');
				selectedIds = new Set();
				await invalidateAll();
			} else {
				showToast('Failed to perform action', 'error');
			}
		} catch {
			showToast('Failed to perform action', 'error');
		}
	}

	function showToast(message: string, type: 'success' | 'error') {
		toastMessage = message;
		toastType = type;
		toastVisible = true;
	}
</script>

<svelte:head>
	<title>Artworks | Admin</title>
</svelte:head>

<div class="page-header">
	<div>
		<h1>Artworks</h1>
		<p class="subtitle">{data.artworks.length} artworks in database</p>
	</div>
	<div class="header-actions">
		<div class="view-toggle">
			<button
				class="toggle-btn"
				class:active={viewMode === 'table'}
				onclick={() => (viewMode = 'table')}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
					<line x1="3" y1="9" x2="21" y2="9"></line>
					<line x1="3" y1="15" x2="21" y2="15"></line>
					<line x1="9" y1="3" x2="9" y2="21"></line>
				</svg>
				Table
			</button>
			<button
				class="toggle-btn"
				class:active={viewMode === 'reorder'}
				onclick={() => (viewMode = 'reorder')}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="4" y1="9" x2="20" y2="9"></line>
					<line x1="4" y1="15" x2="20" y2="15"></line>
					<line x1="10" y1="3" x2="8" y2="21"></line>
					<line x1="16" y1="3" x2="14" y2="21"></line>
				</svg>
				Reorder
			</button>
		</div>
		<a href="/artworks/new" class="btn-primary">+ Add Artwork</a>
	</div>
</div>

{#if viewMode === 'table'}
	<BulkActionsBar
		selectedCount={selectedCount}
		onDelete={openBulkDeleteDialog}
		onSetVisible={(visible) => performBulkAction('set_visible', visible)}
		onSetForSale={(forSale) => performBulkAction('set_for_sale', forSale)}
		onClearSelection={() => (selectedIds = new Set())}
	/>

	<DataTable
		{columns}
		data={tableData}
		searchPlaceholder="Search artworks..."
		onRowClick={handleRowClick}
		selectable={true}
		bind:selectedIds
	>
		{#snippet actions(row)}
			<div class="action-buttons">
				<a href="/artworks/{row.id}" class="btn-edit">Edit</a>
				<button class="btn-delete" onclick={() => openDeleteDialog(row)}>Delete</button>
			</div>
		{/snippet}
	</DataTable>
{:else}
	<div class="reorder-container">
		<div class="reorder-header">
			<p class="reorder-hint">Drag items to reorder, then click "Save Order" to apply changes.</p>
			<button class="btn-save-order" onclick={saveOrder} disabled={isSaving}>
				{isSaving ? 'Saving...' : 'Save Order'}
			</button>
		</div>
		<SortableList items={sortableItems} onReorder={handleReorder}>
			{#snippet children({ item })}
				<div class="sortable-artwork">
					<span class="artwork-title">{item.title_en}</span>
					<span class="artwork-year">{item.year || '—'}</span>
					<span class="artwork-price">{item.price ? `€${item.price}` : '—'}</span>
				</div>
			{/snippet}
		</SortableList>
	</div>
{/if}

<ConfirmDialog
	bind:open={deleteDialogOpen}
	title={isBulkDelete ? 'Delete Selected Artworks' : 'Delete Artwork'}
	message={isBulkDelete
		? `Are you sure you want to delete ${selectedCount} selected artwork(s)? This action cannot be undone.`
		: `Are you sure you want to delete '${artworkNameToDelete}'? This action cannot be undone.`}
	confirmText="Delete"
	variant="danger"
	onConfirm={() => {
		if (isBulkDelete) {
			performBulkAction('delete');
		} else if (artworkToDelete) {
			const form = document.getElementById('delete-form') as HTMLFormElement;
			const input = form.querySelector('input[name="id"]') as HTMLInputElement;
			input.value = artworkToDelete;
			form.requestSubmit();
		}
	}}
	onCancel={() => {
		artworkToDelete = null;
		isBulkDelete = false;
	}}
/>

<form
	id="delete-form"
	method="POST"
	action="?/delete"
	class="hidden"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				showToast('Artwork deleted successfully', 'success');
				await invalidateAll();
			} else {
				showToast('Failed to delete artwork', 'error');
			}
		};
	}}
>
	<CsrfToken />
	<input type="hidden" name="id" value="" />
</form>

<Toast bind:visible={toastVisible} message={toastMessage} type={toastType} />

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
	}

	h1 {
		margin: 0;
		font-size: 1.875rem;
		font-weight: 600;
		color: #111827;
	}

	.subtitle {
		margin: 0.25rem 0 0 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.15s;
	}

	.btn-primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.btn-edit,
	.btn-delete {
		padding: 0.375rem 0.75rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-edit {
		background: #eef2ff;
		color: #4338ca;
		border: none;
		text-decoration: none;
	}

	.btn-edit:hover {
		background: #e0e7ff;
	}

	.btn-delete {
		background: #fef2f2;
		color: #dc2626;
		border: none;
	}

	.btn-delete:hover {
		background: #fee2e2;
	}

	.hidden {
		display: none;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.view-toggle {
		display: flex;
		background: #f3f4f6;
		border-radius: 0.5rem;
		padding: 0.25rem;
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		border: none;
		background: transparent;
		color: #6b7280;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		border-radius: 0.375rem;
		transition: all 0.15s;
	}

	.toggle-btn:hover {
		color: #374151;
	}

	.toggle-btn.active {
		background: #fff;
		color: #111827;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.reorder-container {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}

	.reorder-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.reorder-hint {
		margin: 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.btn-save-order {
		padding: 0.5rem 1rem;
		background: #10b981;
		color: #fff;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-save-order:hover:not(:disabled) {
		background: #059669;
	}

	.btn-save-order:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.sortable-artwork {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.artwork-title {
		flex: 1;
		font-weight: 500;
		color: #111827;
	}

	.artwork-year,
	.artwork-price {
		color: #6b7280;
		font-size: 0.875rem;
		min-width: 60px;
	}
</style>
