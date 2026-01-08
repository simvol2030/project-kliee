<script lang="ts">
	import { page } from '$app/stores';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import LanguageTabs from '$lib/components/admin/LanguageTabs.svelte';

	interface ArtworkItem {
		id: number;
		series_id?: number;
		title_en: string;
		title_ru: string;
		title_es: string;
		title_zh: string;
		description_en?: string;
		description_ru?: string;
		description_es?: string;
		description_zh?: string;
		technique?: string;
		dimensions?: string;
		year?: number;
		price?: number;
		currency?: string;
		is_featured: boolean;
		is_for_sale: boolean;
		is_visible: boolean;
		order_index: number;
		images?: Array<{ id: number; url: string; media_id: number; is_primary: boolean }>;
		series?: { id: number; name_en: string } | null;
	}

	interface SeriesOption {
		id: number;
		name_en: string;
	}

	let artworksList = $state<ArtworkItem[]>([]);
	let seriesOptions = $state<SeriesOption[]>([]);
	let isLoading = $state(true);
	let showModal = $state(false);
	let editItem = $state<ArtworkItem | null>(null);
	let deleteId = $state<number | null>(null);
	let activeLang = $state('en');
	let filterSeries = $state<number | ''>('');

	let form = $state<Record<string, any>>({
		series_id: null,
		title_en: '',
		title_ru: '',
		title_es: '',
		title_zh: '',
		description_en: '',
		description_ru: '',
		description_es: '',
		description_zh: '',
		technique: '',
		dimensions: '',
		year: null,
		price: null,
		currency: 'EUR',
		is_featured: false,
		is_for_sale: true,
		is_visible: true,
		order_index: 0
	});

	let primaryImage = $state<{ id: number; url: string } | null>(null);

	async function loadData() {
		isLoading = true;
		try {
			const [artworksRes, seriesRes] = await Promise.all([
				fetch('/api/content/artworks'),
				fetch('/api/content/series')
			]);
			artworksList = await artworksRes.json();
			seriesOptions = await seriesRes.json();
		} catch (err) {
			console.error('Failed to load data:', err);
		}
		isLoading = false;
	}

	let filteredArtworks = $derived(
		filterSeries === ''
			? artworksList
			: artworksList.filter((a) => a.series_id === filterSeries)
	);

	function openCreate() {
		editItem = null;
		form = {
			series_id: filterSeries || null,
			title_en: '',
			title_ru: '',
			title_es: '',
			title_zh: '',
			description_en: '',
			description_ru: '',
			description_es: '',
			description_zh: '',
			technique: '',
			dimensions: '',
			year: new Date().getFullYear(),
			price: null,
			currency: 'EUR',
			is_featured: false,
			is_for_sale: true,
			is_visible: true,
			order_index: artworksList.length
		};
		primaryImage = null;
		showModal = true;
	}

	function openEdit(item: ArtworkItem) {
		editItem = item;
		form = {
			series_id: item.series_id || null,
			title_en: item.title_en,
			title_ru: item.title_ru,
			title_es: item.title_es,
			title_zh: item.title_zh,
			description_en: item.description_en || '',
			description_ru: item.description_ru || '',
			description_es: item.description_es || '',
			description_zh: item.description_zh || '',
			technique: item.technique || '',
			dimensions: item.dimensions || '',
			year: item.year,
			price: item.price,
			currency: item.currency || 'EUR',
			is_featured: item.is_featured,
			is_for_sale: item.is_for_sale,
			is_visible: item.is_visible,
			order_index: item.order_index
		};
		const primary = item.images?.find((i) => i.is_primary);
		primaryImage = primary ? { id: primary.media_id, url: primary.url } : null;
		showModal = true;
	}

	async function handleSubmit() {
		const payload = {
			...form,
			images: primaryImage ? [{ media_id: primaryImage.id }] : []
		};

		const url = editItem ? `/api/content/artworks/${editItem.id}` : '/api/content/artworks';
		const method = editItem ? 'PATCH' : 'POST';

		try {
			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'x-csrf-token': $page.data.csrfToken || ''
				},
				body: JSON.stringify(payload)
			});

			if (res.ok) {
				showModal = false;
				await loadData();
			}
		} catch (err) {
			console.error('Failed to save artwork:', err);
		}
	}

	async function handleDelete() {
		if (!deleteId) return;

		try {
			const res = await fetch(`/api/content/artworks/${deleteId}`, {
				method: 'DELETE',
				headers: {
					'x-csrf-token': $page.data.csrfToken || ''
				}
			});
			if (res.ok) {
				deleteId = null;
				await loadData();
			}
		} catch (err) {
			console.error('Failed to delete artwork:', err);
		}
	}

	function handleImageSelect(e: CustomEvent<{ id: number; url: string }>) {
		primaryImage = { id: e.detail.id, url: e.detail.url };
	}

	function handleImageClear() {
		primaryImage = null;
	}

	$effect(() => {
		loadData();
	});
</script>

<svelte:head>
	<title>Artworks - Admin Panel</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>Artworks</h1>
			<p class="text-muted">Manage artwork catalog</p>
		</div>
		<div class="header-actions">
			<select bind:value={filterSeries} class="filter-select">
				<option value="">All Series</option>
				{#each seriesOptions as s}
					<option value={s.id}>{s.name_en}</option>
				{/each}
			</select>
			<button class="btn-primary" onclick={openCreate}>+ Add Artwork</button>
		</div>
	</div>

	{#if isLoading}
		<div class="loading">Loading...</div>
	{:else}
		<div class="artworks-grid">
			{#each filteredArtworks as item}
				<div class="artwork-card">
					<div class="artwork-image">
						{#if item.images && item.images[0]}
							<img src={item.images[0].url} alt={item.title_en} />
						{:else}
							<div class="no-image">No image</div>
						{/if}
						<div class="artwork-badges">
							{#if item.is_featured}
								<span class="badge featured">Featured</span>
							{/if}
							{#if !item.is_visible}
								<span class="badge hidden">Hidden</span>
							{/if}
						</div>
					</div>
					<div class="artwork-info">
						<h3>{item.title_en}</h3>
						{#if item.series}
							<p class="series-name">{item.series.name_en}</p>
						{/if}
						<div class="artwork-meta">
							{#if item.year}<span>{item.year}</span>{/if}
							{#if item.dimensions}<span>{item.dimensions}</span>{/if}
						</div>
						{#if item.is_for_sale && item.price}
							<div class="price">{item.price} {item.currency}</div>
						{/if}
					</div>
					<div class="artwork-actions">
						<button class="btn-edit" onclick={() => openEdit(item)}>Edit</button>
						<button class="btn-delete" onclick={() => (deleteId = item.id)}>Delete</button>
					</div>
				</div>
			{/each}
		</div>

		{#if filteredArtworks.length === 0}
			<div class="empty-state">
				<p>No artworks found</p>
				<button class="btn-primary" onclick={openCreate}>Add First Artwork</button>
			</div>
		{/if}
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
	<div class="modal-overlay" onclick={() => (showModal = false)}>
		<div class="modal modal-lg" onclick={(e) => e.stopPropagation()}>
			<h2>{editItem ? 'Edit Artwork' : 'Add New Artwork'}</h2>

			<LanguageTabs bind:active={activeLang} />

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<div class="form-row">
					<div class="form-group">
						<label for="series">Series</label>
						<select id="series" bind:value={form.series_id}>
							<option value={null}>No Series</option>
							{#each seriesOptions as s}
								<option value={s.id}>{s.name_en}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label for="year">Year</label>
						<input type="number" id="year" bind:value={form.year} min="1900" max="2100" />
					</div>
				</div>

				<div class="form-group">
					<label for="title">Title ({activeLang.toUpperCase()})</label>
					<input type="text" id="title" bind:value={form[`title_${activeLang}`]} required />
				</div>

				<div class="form-group">
					<label for="description">Description ({activeLang.toUpperCase()})</label>
					<textarea id="description" bind:value={form[`description_${activeLang}`]} rows="3"></textarea>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="technique">Technique</label>
						<input type="text" id="technique" bind:value={form.technique} placeholder="Oil on canvas" />
					</div>
					<div class="form-group">
						<label for="dimensions">Dimensions</label>
						<input type="text" id="dimensions" bind:value={form.dimensions} placeholder="100x80 cm" />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="price">Price</label>
						<input type="number" id="price" bind:value={form.price} min="0" />
					</div>
					<div class="form-group">
						<label for="currency">Currency</label>
						<select id="currency" bind:value={form.currency}>
							<option value="EUR">EUR</option>
							<option value="USD">USD</option>
							<option value="GBP">GBP</option>
						</select>
					</div>
				</div>

				<MediaPicker
					label="Primary Image"
					folder="artworks"
					value={primaryImage}
					onselect={handleImageSelect}
					onclear={handleImageClear}
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
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={form.is_for_sale} />
						<span>For Sale</span>
					</label>
				</div>

				<div class="modal-actions">
					<button type="button" class="btn-secondary" onclick={() => (showModal = false)}>Cancel</button>
					<button type="submit" class="btn-primary">{editItem ? 'Update' : 'Create'}</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirm -->
{#if deleteId !== null}
	<div class="modal-overlay" onclick={() => (deleteId = null)}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<h2>Delete Artwork</h2>
			<p>Are you sure you want to delete this artwork?</p>
			<div class="modal-actions">
				<button type="button" class="btn-secondary" onclick={() => (deleteId = null)}>Cancel</button>
				<button type="button" class="btn-danger" onclick={handleDelete}>Delete</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page {
		max-width: 1400px;
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

	.header-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.filter-select {
		padding: 0.625rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		background: white;
	}

	.loading,
	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
	}

	.empty-state button {
		margin-top: 1rem;
	}

	.artworks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.artwork-card {
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
		overflow: hidden;
	}

	.artwork-image {
		position: relative;
		aspect-ratio: 4/3;
		background: #f3f4f6;
	}

	.artwork-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.no-image {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
	}

	.artwork-badges {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		display: flex;
		gap: 0.25rem;
	}

	.badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.badge.featured {
		background: #fef3c7;
		color: #92400e;
	}

	.badge.hidden {
		background: #fee2e2;
		color: #991b1b;
	}

	.artwork-info {
		padding: 1rem;
	}

	.artwork-info h3 {
		margin: 0 0 0.25rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
	}

	.series-name {
		margin: 0 0 0.5rem 0;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.artwork-meta {
		display: flex;
		gap: 0.75rem;
		font-size: 0.75rem;
		color: #6b7280;
		margin-bottom: 0.5rem;
	}

	.price {
		font-weight: 600;
		color: #059669;
	}

	.artwork-actions {
		display: flex;
		gap: 0.5rem;
		padding: 0 1rem 1rem;
	}

	.btn-primary,
	.btn-secondary,
	.btn-danger,
	.btn-edit,
	.btn-delete {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.625rem 1.25rem;
		font-size: 0.875rem;
	}

	.btn-secondary {
		background-color: #e5e7eb;
		color: #374151;
	}

	.btn-danger {
		background-color: #ef4444;
		color: white;
	}

	.btn-edit {
		background-color: #dbeafe;
		color: #1e40af;
		flex: 1;
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
	.form-group select,
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
		font-size: 0.875rem;
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}
</style>
