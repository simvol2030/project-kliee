<script lang="ts">
	import { enhance } from '$app/forms';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import LanguageTabs from '$lib/components/admin/LanguageTabs.svelte';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	interface SeriesItem {
		id: number;
		slug: string;
		name_en: string;
		name_ru: string;
		name_es: string;
		name_zh: string;
		description_en?: string;
		description_ru?: string;
		description_es?: string;
		description_zh?: string;
		cover_image_id?: number;
		order_index: number;
		is_visible: boolean;
		is_featured: boolean;
		cover?: { id: number; url: string; alt_en?: string } | null;
	}

	let seriesList = $state<SeriesItem[]>([]);
	let isLoading = $state(true);
	let showModal = $state(false);
	let editItem = $state<SeriesItem | null>(null);
	let deleteId = $state<number | null>(null);
	let activeLang = $state('en');

	let form = $state<Record<string, any>>({
		slug: '',
		name_en: '',
		name_ru: '',
		name_es: '',
		name_zh: '',
		description_en: '',
		description_ru: '',
		description_es: '',
		description_zh: '',
		cover_image_id: null,
		order_index: 0,
		is_visible: true,
		is_featured: false
	});

	let coverImage = $state<{ id: number; url: string } | null>(null);

	async function loadSeries() {
		isLoading = true;
		try {
			const res = await fetch('/api/content/series');
			const data = await res.json();
			seriesList = data;
		} catch (err) {
			console.error('Failed to load series:', err);
		}
		isLoading = false;
	}

	function openCreate() {
		editItem = null;
		form = {
			slug: '',
			name_en: '',
			name_ru: '',
			name_es: '',
			name_zh: '',
			description_en: '',
			description_ru: '',
			description_es: '',
			description_zh: '',
			cover_image_id: null,
			order_index: seriesList.length,
			is_visible: true,
			is_featured: false
		};
		coverImage = null;
		showModal = true;
	}

	function openEdit(item: SeriesItem) {
		editItem = item;
		form = {
			slug: item.slug,
			name_en: item.name_en,
			name_ru: item.name_ru,
			name_es: item.name_es,
			name_zh: item.name_zh,
			description_en: item.description_en || '',
			description_ru: item.description_ru || '',
			description_es: item.description_es || '',
			description_zh: item.description_zh || '',
			cover_image_id: item.cover_image_id || null,
			order_index: item.order_index,
			is_visible: item.is_visible,
			is_featured: item.is_featured
		};
		coverImage = item.cover || null;
		showModal = true;
	}

	async function handleSubmit() {
		const url = editItem ? `/api/content/series/${editItem.id}` : '/api/content/series';
		const method = editItem ? 'PATCH' : 'POST';

		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});

			if (res.ok) {
				showModal = false;
				await loadSeries();
			}
		} catch (err) {
			console.error('Failed to save series:', err);
		}
	}

	async function handleDelete() {
		if (!deleteId) return;

		try {
			const res = await fetch(`/api/content/series/${deleteId}`, { method: 'DELETE' });
			if (res.ok) {
				deleteId = null;
				await loadSeries();
			}
		} catch (err) {
			console.error('Failed to delete series:', err);
		}
	}

	function handleCoverSelect(e: CustomEvent<{ id: number; url: string }>) {
		form.cover_image_id = e.detail.id;
		coverImage = { id: e.detail.id, url: e.detail.url };
	}

	function handleCoverClear() {
		form.cover_image_id = null;
		coverImage = null;
	}

	$effect(() => {
		loadSeries();
	});
</script>

<svelte:head>
	<title>Series - Admin Panel</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>Series</h1>
			<p class="text-muted">Manage artwork series/collections</p>
		</div>
		<button class="btn-primary" onclick={openCreate}>+ Create Series</button>
	</div>

	{#if isLoading}
		<div class="loading">Loading...</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Cover</th>
							<th>Name</th>
							<th>Slug</th>
							<th>Order</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each seriesList as item}
							<tr>
								<td>
									{#if item.cover}
										<img src={item.cover.url} alt="" class="thumb" />
									{:else}
										<div class="thumb-placeholder">No image</div>
									{/if}
								</td>
								<td>
									<div class="item-name">{item.name_en}</div>
									{#if item.is_featured}
										<span class="badge featured">Featured</span>
									{/if}
								</td>
								<td class="text-muted">{item.slug}</td>
								<td>{item.order_index}</td>
								<td>
									<span class="badge" class:visible={item.is_visible}>
										{item.is_visible ? 'Visible' : 'Hidden'}
									</span>
								</td>
								<td>
									<div class="actions">
										<button class="btn-edit" onclick={() => openEdit(item)}>Edit</button>
										<button class="btn-delete" onclick={() => (deleteId = item.id)}>Delete</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
	<div class="modal-overlay" onclick={() => (showModal = false)}>
		<div class="modal modal-lg" onclick={(e) => e.stopPropagation()}>
			<h2>{editItem ? 'Edit Series' : 'Create New Series'}</h2>

			<LanguageTabs bind:active={activeLang} />

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<div class="form-row">
					<div class="form-group">
						<label for="slug">Slug (URL)</label>
						<input type="text" id="slug" bind:value={form.slug} required pattern="[a-z0-9-]+" />
					</div>
					<div class="form-group">
						<label for="order">Order</label>
						<input type="number" id="order" bind:value={form.order_index} />
					</div>
				</div>

				<div class="form-group">
					<label for="name">Name ({activeLang.toUpperCase()})</label>
					<input type="text" id="name" bind:value={form[`name_${activeLang}`]} required />
				</div>

				<div class="form-group">
					<label for="description">Description ({activeLang.toUpperCase()})</label>
					<textarea id="description" bind:value={form[`description_${activeLang}`]} rows="4"></textarea>
				</div>

				<MediaPicker
					label="Cover Image"
					folder="series"
					value={coverImage}
					onselect={handleCoverSelect}
					onclear={handleCoverClear}
				/>

				<div class="form-row checkboxes">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={form.is_visible} />
						<span>Visible</span>
					</label>
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={form.is_featured} />
						<span>Featured</span>
					</label>
				</div>

				<div class="modal-actions">
					<button type="button" class="btn-secondary" onclick={() => (showModal = false)}>
						Cancel
					</button>
					<button type="submit" class="btn-primary">
						{editItem ? 'Update' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirm -->
{#if deleteId !== null}
	<div class="modal-overlay" onclick={() => (deleteId = null)}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<h2>Delete Series</h2>
			<p>Are you sure you want to delete this series? This will also remove all artworks in this series.</p>
			<div class="modal-actions">
				<button type="button" class="btn-secondary" onclick={() => (deleteId = null)}>Cancel</button>
				<button type="button" class="btn-danger" onclick={handleDelete}>Delete</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page {
		max-width: 1200px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
		font-weight: 700;
		color: #111827;
	}

	.text-muted {
		color: #6b7280;
		margin: 0;
		font-size: 0.875rem;
	}

	.loading {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
	}

	.card {
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
		overflow: hidden;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background-color: #f9fafb;
	}

	th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
	}

	td {
		padding: 1rem;
		border-top: 1px solid #e5e7eb;
		font-size: 0.875rem;
	}

	.thumb {
		width: 60px;
		height: 60px;
		object-fit: cover;
		border-radius: 4px;
	}

	.thumb-placeholder {
		width: 60px;
		height: 60px;
		background: #f3f4f6;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.625rem;
		color: #9ca3af;
	}

	.item-name {
		font-weight: 600;
		color: #111827;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		background-color: #fef3c7;
		color: #92400e;
	}

	.badge.visible {
		background-color: #d1fae5;
		color: #065f46;
	}

	.badge.featured {
		background-color: #dbeafe;
		color: #1e40af;
		margin-left: 0.5rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-primary,
	.btn-secondary,
	.btn-danger,
	.btn-edit,
	.btn-delete {
		padding: 0.625rem 1.25rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-secondary {
		background-color: #e5e7eb;
		color: #374151;
	}

	.btn-danger {
		background-color: #ef4444;
		color: white;
	}

	.btn-edit,
	.btn-delete {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
	}

	.btn-edit {
		background-color: #dbeafe;
		color: #1e40af;
	}

	.btn-delete {
		background-color: #fee2e2;
		color: #991b1b;
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: white;
		border-radius: 0.75rem;
		padding: 2rem;
		width: 90%;
		max-width: 500px;
		box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-lg {
		max-width: 700px;
	}

	.modal h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.form-group label {
		display: block;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}

	.form-group textarea {
		resize: vertical;
		font-family: inherit;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-row.checkboxes {
		display: flex;
		gap: 2rem;
		margin-top: 1rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}
</style>
