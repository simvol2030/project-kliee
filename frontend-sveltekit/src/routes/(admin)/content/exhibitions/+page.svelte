<script lang="ts">
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import LanguageTabs from '$lib/components/admin/LanguageTabs.svelte';

	interface ExhibitionItem {
		id: number;
		title_en: string;
		title_ru: string;
		title_es: string;
		title_zh: string;
		description_en?: string;
		description_ru?: string;
		description_es?: string;
		description_zh?: string;
		venue?: string;
		city?: string;
		country?: string;
		address?: string;
		start_date?: string;
		end_date?: string;
		opening_hours?: string;
		cover_image_id?: number;
		gallery_link?: string;
		is_current: boolean;
		is_visible: boolean;
		order_index: number;
		cover?: { id: number; url: string; alt_en?: string } | null;
	}

	let exhibitionsList = $state<ExhibitionItem[]>([]);
	let isLoading = $state(true);
	let showModal = $state(false);
	let editItem = $state<ExhibitionItem | null>(null);
	let deleteId = $state<number | null>(null);
	let activeLang = $state('en');

	let form = $state<Record<string, any>>({
		title_en: '',
		title_ru: '',
		title_es: '',
		title_zh: '',
		description_en: '',
		description_ru: '',
		description_es: '',
		description_zh: '',
		venue: '',
		city: '',
		country: '',
		address: '',
		start_date: '',
		end_date: '',
		opening_hours: '',
		cover_image_id: null,
		gallery_link: '',
		is_current: false,
		is_visible: true,
		order_index: 0
	});

	let coverImage = $state<{ id: number; url: string } | null>(null);

	async function loadExhibitions() {
		isLoading = true;
		try {
			const res = await fetch('/api/content/exhibitions');
			exhibitionsList = await res.json();
		} catch (err) {
			console.error('Failed to load exhibitions:', err);
		}
		isLoading = false;
	}

	function openCreate() {
		editItem = null;
		form = {
			title_en: '',
			title_ru: '',
			title_es: '',
			title_zh: '',
			description_en: '',
			description_ru: '',
			description_es: '',
			description_zh: '',
			venue: '',
			city: '',
			country: '',
			address: '',
			start_date: '',
			end_date: '',
			opening_hours: '',
			cover_image_id: null,
			gallery_link: '',
			is_current: false,
			is_visible: true,
			order_index: exhibitionsList.length
		};
		coverImage = null;
		showModal = true;
	}

	function openEdit(item: ExhibitionItem) {
		editItem = item;
		form = {
			title_en: item.title_en,
			title_ru: item.title_ru,
			title_es: item.title_es,
			title_zh: item.title_zh,
			description_en: item.description_en || '',
			description_ru: item.description_ru || '',
			description_es: item.description_es || '',
			description_zh: item.description_zh || '',
			venue: item.venue || '',
			city: item.city || '',
			country: item.country || '',
			address: item.address || '',
			start_date: item.start_date || '',
			end_date: item.end_date || '',
			opening_hours: item.opening_hours || '',
			cover_image_id: item.cover_image_id || null,
			gallery_link: item.gallery_link || '',
			is_current: item.is_current,
			is_visible: item.is_visible,
			order_index: item.order_index
		};
		coverImage = item.cover || null;
		showModal = true;
	}

	async function handleSubmit() {
		const url = editItem ? `/api/content/exhibitions/${editItem.id}` : '/api/content/exhibitions';
		const method = editItem ? 'PATCH' : 'POST';

		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});

			if (res.ok) {
				showModal = false;
				await loadExhibitions();
			}
		} catch (err) {
			console.error('Failed to save exhibition:', err);
		}
	}

	async function handleDelete() {
		if (!deleteId) return;

		try {
			const res = await fetch(`/api/content/exhibitions/${deleteId}`, { method: 'DELETE' });
			if (res.ok) {
				deleteId = null;
				await loadExhibitions();
			}
		} catch (err) {
			console.error('Failed to delete exhibition:', err);
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

	function formatDate(dateStr?: string): string {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	$effect(() => {
		loadExhibitions();
	});
</script>

<svelte:head>
	<title>Exhibitions - Admin Panel</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>Exhibitions</h1>
			<p class="text-muted">Manage exhibitions and shows</p>
		</div>
		<button class="btn-primary" onclick={openCreate}>+ Add Exhibition</button>
	</div>

	{#if isLoading}
		<div class="loading">Loading...</div>
	{:else}
		<div class="exhibitions-list">
			{#each exhibitionsList as item}
				<div class="exhibition-card" class:current={item.is_current}>
					<div class="exhibition-image">
						{#if item.cover}
							<img src={item.cover.url} alt={item.title_en} />
						{:else}
							<div class="no-image">No image</div>
						{/if}
						{#if item.is_current}
							<span class="badge current">Current</span>
						{/if}
					</div>
					<div class="exhibition-info">
						<h3>{item.title_en}</h3>
						{#if item.venue}
							<p class="venue">{item.venue}</p>
						{/if}
						<p class="location">
							{#if item.city}{item.city}{/if}
							{#if item.city && item.country}, {/if}
							{#if item.country}{item.country}{/if}
						</p>
						<p class="dates">
							{formatDate(item.start_date)}
							{#if item.end_date} - {formatDate(item.end_date)}{/if}
						</p>
						{#if !item.is_visible}
							<span class="badge hidden">Hidden</span>
						{/if}
					</div>
					<div class="exhibition-actions">
						<button class="btn-edit" onclick={() => openEdit(item)}>Edit</button>
						<button class="btn-delete" onclick={() => (deleteId = item.id)}>Delete</button>
					</div>
				</div>
			{/each}
		</div>

		{#if exhibitionsList.length === 0}
			<div class="empty-state">
				<p>No exhibitions found</p>
				<button class="btn-primary" onclick={openCreate}>Add First Exhibition</button>
			</div>
		{/if}
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
	<div class="modal-overlay" onclick={() => (showModal = false)}>
		<div class="modal modal-lg" onclick={(e) => e.stopPropagation()}>
			<h2>{editItem ? 'Edit Exhibition' : 'Add New Exhibition'}</h2>

			<LanguageTabs bind:active={activeLang} />

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
						<label for="venue">Venue</label>
						<input type="text" id="venue" bind:value={form.venue} placeholder="Gallery name" />
					</div>
					<div class="form-group">
						<label for="city">City</label>
						<input type="text" id="city" bind:value={form.city} />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="country">Country</label>
						<input type="text" id="country" bind:value={form.country} />
					</div>
					<div class="form-group">
						<label for="address">Address</label>
						<input type="text" id="address" bind:value={form.address} />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="start_date">Start Date</label>
						<input type="date" id="start_date" bind:value={form.start_date} />
					</div>
					<div class="form-group">
						<label for="end_date">End Date</label>
						<input type="date" id="end_date" bind:value={form.end_date} />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="opening_hours">Opening Hours</label>
						<input type="text" id="opening_hours" bind:value={form.opening_hours} placeholder="Mon-Fri 10:00-18:00" />
					</div>
					<div class="form-group">
						<label for="gallery_link">Gallery Website</label>
						<input type="url" id="gallery_link" bind:value={form.gallery_link} placeholder="https://..." />
					</div>
				</div>

				<MediaPicker
					label="Cover Image"
					folder="exhibitions"
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
						<input type="checkbox" bind:checked={form.is_current} />
						<span>Current Exhibition</span>
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
			<h2>Delete Exhibition</h2>
			<p>Are you sure you want to delete this exhibition?</p>
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

	.loading,
	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
	}

	.empty-state button {
		margin-top: 1rem;
	}

	.exhibitions-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.exhibition-card {
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
		display: grid;
		grid-template-columns: 200px 1fr auto;
		gap: 1.5rem;
		overflow: hidden;
	}

	.exhibition-card.current {
		border: 2px solid #10b981;
	}

	.exhibition-image {
		position: relative;
		height: 150px;
		background: #f3f4f6;
	}

	.exhibition-image img {
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

	.badge {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.badge.current {
		background: #d1fae5;
		color: #065f46;
	}

	.badge.hidden {
		background: #fee2e2;
		color: #991b1b;
		position: static;
		margin-top: 0.5rem;
	}

	.exhibition-info {
		padding: 1rem 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.exhibition-info h3 {
		margin: 0 0 0.25rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
	}

	.venue {
		margin: 0 0 0.25rem 0;
		font-weight: 500;
		color: #374151;
	}

	.location {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.dates {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.exhibition-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		padding-right: 1rem;
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
		font-size: 0.875rem;
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}

	@media (max-width: 768px) {
		.exhibition-card {
			grid-template-columns: 1fr;
		}

		.exhibition-image {
			height: 200px;
		}

		.exhibition-info {
			padding: 0 1rem;
		}

		.exhibition-actions {
			padding: 0 1rem 1rem;
		}
	}
</style>
