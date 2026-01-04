<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	let { data }: { data: PageData } = $props();

	let deleteDialogOpen = $state(false);
	let itemToDelete = $state<string | null>(null);
	let itemNameToDelete = $state('');

	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');

	const columns = [
		{ key: 'name_en', label: 'Name', sortable: true },
		{ key: 'slug', label: 'Slug', sortable: true },
		{ key: 'artworkCount', label: 'Artworks', sortable: true, width: '100px' },
		{ key: 'order_index', label: 'Order', sortable: true, width: '80px' }
	];

	function handleRowClick(row: any) {
		goto(`/series/${row.id}`);
	}

	function openDeleteDialog(item: any) {
		itemToDelete = item.id;
		itemNameToDelete = item.name_en;
		deleteDialogOpen = true;
	}

	function showToast(message: string, type: 'success' | 'error') {
		toastMessage = message;
		toastType = type;
		toastVisible = true;
	}
</script>

<svelte:head>
	<title>Series | Admin</title>
</svelte:head>

<div class="page-header">
	<div>
		<h1>Series</h1>
		<p class="subtitle">{data.series.length} series in database</p>
	</div>
	<a href="/series/new" class="btn-primary">+ Add Series</a>
</div>

<DataTable {columns} data={data.series} searchPlaceholder="Search series..." onRowClick={handleRowClick}>
	{#snippet actions(row)}
		<div class="action-buttons">
			<a href="/series/{row.id}" class="btn-edit">Edit</a>
			<button class="btn-delete" onclick={() => openDeleteDialog(row)}>Delete</button>
		</div>
	{/snippet}
</DataTable>

<ConfirmDialog
	bind:open={deleteDialogOpen}
	title="Delete Series"
	message="Are you sure you want to delete '{itemNameToDelete}'? This will not delete associated artworks."
	confirmText="Delete"
	variant="danger"
	onConfirm={() => {
		if (itemToDelete) {
			const form = document.getElementById('delete-form') as HTMLFormElement;
			const input = form.querySelector('input[name="id"]') as HTMLInputElement;
			input.value = itemToDelete;
			form.requestSubmit();
		}
	}}
	onCancel={() => {
		itemToDelete = null;
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
				showToast('Series deleted successfully', 'success');
				await invalidateAll();
			} else {
				showToast('Failed to delete series', 'error');
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

	/* Dark theme support */
	:global(.dark) h1 { color: #f9fafb; }
	:global(.dark) .subtitle { color: #9ca3af; }

	:global(.dark) .btn-edit {
		background: #1e3a5f;
		color: #93c5fd;
	}
	:global(.dark) .btn-edit:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	:global(.dark) .btn-delete {
		background: #7f1d1d;
		color: #fecaca;
	}
	:global(.dark) .btn-delete:hover {
		background: #991b1b;
	}
</style>
