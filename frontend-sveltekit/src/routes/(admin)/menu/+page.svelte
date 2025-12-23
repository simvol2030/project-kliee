<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Toast from '$lib/components/admin/Toast.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingItem = $state<number | null>(null);
	let showCreateForm = $state(false);

	// Delete confirmation
	let deleteDialogOpen = $state(false);
	let itemToDelete = $state<number | null>(null);

	// Toast
	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');

	function showToast(message: string, type: 'success' | 'error') {
		toastMessage = message;
		toastType = type;
		toastVisible = true;
	}

	$effect(() => {
		if (form?.success) {
			showToast(form.message || 'Saved', 'success');
			showCreateForm = false;
			editingItem = null;
		} else if (form?.error) {
			showToast(form.error, 'error');
		}
	});
</script>

<svelte:head>
	<title>Menu | Admin</title>
</svelte:head>

<div class="page-header">
	<div>
		<h1>Menu Editor</h1>
		<p class="subtitle">{data.menuItems.length} menu items</p>
	</div>
	<button class="btn-primary" onclick={() => (showCreateForm = !showCreateForm)}>
		{showCreateForm ? 'Cancel' : '+ Add Item'}
	</button>
</div>

{#if showCreateForm}
	<form method="POST" action="?/create" class="item-form" use:enhance>
		<CsrfToken />
		<h3>New Menu Item</h3>
		<div class="form-grid">
			<div class="field">
				<label for="new-label_en">Label (EN) *</label>
				<input type="text" id="new-label_en" name="label_en" required />
			</div>
			<div class="field">
				<label for="new-href">URL *</label>
				<input type="text" id="new-href" name="href" placeholder="/about" required />
			</div>
			<div class="field">
				<label for="new-label_ru">Label (RU)</label>
				<input type="text" id="new-label_ru" name="label_ru" />
			</div>
			<div class="field">
				<label for="new-order_index">Order</label>
				<input type="number" id="new-order_index" name="order_index" value="0" />
			</div>
			<div class="field">
				<label for="new-label_es">Label (ES)</label>
				<input type="text" id="new-label_es" name="label_es" />
			</div>
			<div class="field checkbox">
				<label>
					<input type="checkbox" name="is_visible" checked />
					Visible
				</label>
			</div>
			<div class="field">
				<label for="new-label_zh">Label (ZH)</label>
				<input type="text" id="new-label_zh" name="label_zh" />
			</div>
		</div>
		<div class="form-actions">
			<button type="submit" class="btn-save">Create</button>
		</div>
	</form>
{/if}

<div class="menu-list">
	{#each data.menuItems as item}
		<div class="menu-item" class:editing={editingItem === item.id}>
			{#if editingItem === item.id}
				<form method="POST" action="?/update" class="edit-form" use:enhance>
					<CsrfToken />
					<input type="hidden" name="id" value={item.id} />
					<div class="form-grid">
						<div class="field">
							<label>Label (EN)</label>
							<input type="text" name="label_en" value={item.label_en} required />
						</div>
						<div class="field">
							<label>URL</label>
							<input type="text" name="href" value={item.href} required />
						</div>
						<div class="field">
							<label>Label (RU)</label>
							<input type="text" name="label_ru" value={item.label_ru || ''} />
						</div>
						<div class="field">
							<label>Order</label>
							<input type="number" name="order_index" value={item.order_index} />
						</div>
						<div class="field">
							<label>Label (ES)</label>
							<input type="text" name="label_es" value={item.label_es || ''} />
						</div>
						<div class="field checkbox">
							<label>
								<input type="checkbox" name="is_visible" checked={item.is_visible ?? true} />
								Visible
							</label>
						</div>
						<div class="field">
							<label>Label (ZH)</label>
							<input type="text" name="label_zh" value={item.label_zh || ''} />
						</div>
					</div>
					<div class="form-actions">
						<button type="button" class="btn-cancel" onclick={() => (editingItem = null)}>Cancel</button>
						<button type="submit" class="btn-save">Save</button>
					</div>
				</form>
			{:else}
				<div class="item-info">
					<span class="order-badge">{item.order_index}</span>
					<div class="item-details">
						<strong>{item.label_en}</strong>
						<span class="href">{item.href}</span>
						{#if !item.is_visible}
							<span class="hidden-badge">Hidden</span>
						{/if}
					</div>
				</div>
				<div class="item-actions">
					<button class="btn-edit" onclick={() => (editingItem = item.id)}>Edit</button>
					<button
						class="btn-delete"
						onclick={() => {
							itemToDelete = item.id;
							deleteDialogOpen = true;
						}}>Delete</button
					>
				</div>
			{/if}
		</div>
	{/each}
</div>

<ConfirmDialog
	bind:open={deleteDialogOpen}
	title="Delete Menu Item"
	message="Are you sure you want to delete this menu item?"
	confirmText="Delete"
	variant="danger"
	onConfirm={() => {
		if (itemToDelete) {
			const form = document.getElementById('delete-form') as HTMLFormElement;
			const input = form.querySelector('input[name="id"]') as HTMLInputElement;
			input.value = String(itemToDelete);
			form.requestSubmit();
		}
	}}
	onCancel={() => (itemToDelete = null)}
/>

<form id="delete-form" method="POST" action="?/delete" class="hidden" use:enhance>
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
		padding: 0.625rem 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
	}

	.item-form,
	.edit-form {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.item-form h3 {
		margin: 0 0 1rem 0;
		font-size: 1.125rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.field label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.375rem;
	}

	.field input[type='text'],
	.field input[type='number'] {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.field.checkbox label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.btn-save {
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.btn-cancel {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #374151;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.menu-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.menu-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
	}

	.menu-item.editing {
		display: block;
	}

	.item-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.order-badge {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f3f4f6;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
	}

	.item-details {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.item-details strong {
		color: #111827;
	}

	.href {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.hidden-badge {
		padding: 0.125rem 0.5rem;
		background: #fef3c7;
		color: #92400e;
		border-radius: 9999px;
		font-size: 0.625rem;
		font-weight: 500;
		text-transform: uppercase;
	}

	.item-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-edit,
	.btn-delete {
		padding: 0.375rem 0.75rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
	}

	.btn-edit {
		background: #eef2ff;
		color: #4338ca;
	}

	.btn-delete {
		background: #fef2f2;
		color: #dc2626;
	}

	.hidden {
		display: none;
	}
</style>
