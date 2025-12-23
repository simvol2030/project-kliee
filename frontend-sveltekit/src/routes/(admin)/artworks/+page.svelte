<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	let { data }: { data: PageData } = $props();

	// Delete confirmation
	let deleteDialogOpen = $state(false);
	let artworkToDelete = $state<string | null>(null);
	let artworkNameToDelete = $state('');

	// Toast
	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');

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
		deleteDialogOpen = true;
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
	<a href="/artworks/new" class="btn-primary">+ Add Artwork</a>
</div>

<DataTable
	{columns}
	data={tableData}
	searchPlaceholder="Search artworks..."
	onRowClick={handleRowClick}
>
	{#snippet actions(row)}
		<div class="action-buttons">
			<a href="/artworks/{row.id}" class="btn-edit">Edit</a>
			<button class="btn-delete" onclick={() => openDeleteDialog(row)}>Delete</button>
		</div>
	{/snippet}
</DataTable>

<ConfirmDialog
	bind:open={deleteDialogOpen}
	title="Delete Artwork"
	message="Are you sure you want to delete '{artworkNameToDelete}'? This action cannot be undone."
	confirmText="Delete"
	variant="danger"
	onConfirm={() => {
		if (artworkToDelete) {
			const form = document.getElementById('delete-form') as HTMLFormElement;
			const input = form.querySelector('input[name="id"]') as HTMLInputElement;
			input.value = artworkToDelete;
			form.requestSubmit();
		}
	}}
	onCancel={() => {
		artworkToDelete = null;
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
</style>
