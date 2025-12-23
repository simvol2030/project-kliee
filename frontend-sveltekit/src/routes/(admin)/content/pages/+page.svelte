<script lang="ts">
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import LanguageTabs from '$lib/components/admin/LanguageTabs.svelte';

	interface PageItem {
		id: number;
		slug: string;
		page_type: string;
		template: string;
		title_en: string;
		title_ru: string;
		title_es: string;
		title_zh: string;
		content_en?: string;
		content_ru?: string;
		content_es?: string;
		content_zh?: string;
		seo_title_en?: string;
		seo_title_ru?: string;
		seo_title_es?: string;
		seo_title_zh?: string;
		seo_description_en?: string;
		seo_description_ru?: string;
		seo_description_es?: string;
		seo_description_zh?: string;
		featured_image_id?: number;
		is_published: boolean;
		is_in_menu: boolean;
		created_at: string;
		featured_image?: { id: number; url: string; alt_en?: string } | null;
	}

	let pagesList = $state<PageItem[]>([]);
	let isLoading = $state(true);
	let showModal = $state(false);
	let showSeoModal = $state(false);
	let editItem = $state<PageItem | null>(null);
	let deleteId = $state<number | null>(null);
	let activeLang = $state('en');
	let activeTab = $state<'content' | 'seo'>('content');

	let form = $state<Record<string, any>>({
		slug: '',
		page_type: 'static',
		template: 'default',
		title_en: '',
		title_ru: '',
		title_es: '',
		title_zh: '',
		content_en: '',
		content_ru: '',
		content_es: '',
		content_zh: '',
		seo_title_en: '',
		seo_title_ru: '',
		seo_title_es: '',
		seo_title_zh: '',
		seo_description_en: '',
		seo_description_ru: '',
		seo_description_es: '',
		seo_description_zh: '',
		featured_image_id: null,
		is_published: true,
		is_in_menu: false
	});

	let featuredImage = $state<{ id: number; url: string } | null>(null);

	async function loadPages() {
		isLoading = true;
		try {
			const res = await fetch('/api/content/pages');
			pagesList = await res.json();
		} catch (err) {
			console.error('Failed to load pages:', err);
		}
		isLoading = false;
	}

	function openCreate() {
		editItem = null;
		activeTab = 'content';
		form = {
			slug: '',
			page_type: 'static',
			template: 'default',
			title_en: '',
			title_ru: '',
			title_es: '',
			title_zh: '',
			content_en: '',
			content_ru: '',
			content_es: '',
			content_zh: '',
			seo_title_en: '',
			seo_title_ru: '',
			seo_title_es: '',
			seo_title_zh: '',
			seo_description_en: '',
			seo_description_ru: '',
			seo_description_es: '',
			seo_description_zh: '',
			featured_image_id: null,
			is_published: true,
			is_in_menu: false
		};
		featuredImage = null;
		showModal = true;
	}

	function openEdit(item: PageItem) {
		editItem = item;
		activeTab = 'content';
		form = {
			slug: item.slug,
			page_type: item.page_type,
			template: item.template,
			title_en: item.title_en,
			title_ru: item.title_ru,
			title_es: item.title_es,
			title_zh: item.title_zh,
			content_en: item.content_en || '',
			content_ru: item.content_ru || '',
			content_es: item.content_es || '',
			content_zh: item.content_zh || '',
			seo_title_en: item.seo_title_en || '',
			seo_title_ru: item.seo_title_ru || '',
			seo_title_es: item.seo_title_es || '',
			seo_title_zh: item.seo_title_zh || '',
			seo_description_en: item.seo_description_en || '',
			seo_description_ru: item.seo_description_ru || '',
			seo_description_es: item.seo_description_es || '',
			seo_description_zh: item.seo_description_zh || '',
			featured_image_id: item.featured_image_id || null,
			is_published: item.is_published,
			is_in_menu: item.is_in_menu
		};
		featuredImage = item.featured_image || null;
		showModal = true;
	}

	async function handleSubmit() {
		const url = editItem ? `/api/content/pages/${editItem.id}` : '/api/content/pages';
		const method = editItem ? 'PATCH' : 'POST';

		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});

			if (res.ok) {
				showModal = false;
				await loadPages();
			} else {
				const data = await res.json();
				alert(data.message || 'Failed to save page');
			}
		} catch (err) {
			console.error('Failed to save page:', err);
		}
	}

	async function handleDelete() {
		if (!deleteId) return;

		try {
			const res = await fetch(`/api/content/pages/${deleteId}`, { method: 'DELETE' });
			if (res.ok) {
				deleteId = null;
				await loadPages();
			}
		} catch (err) {
			console.error('Failed to delete page:', err);
		}
	}

	function handleImageSelect(e: CustomEvent<{ id: number; url: string }>) {
		form.featured_image_id = e.detail.id;
		featuredImage = { id: e.detail.id, url: e.detail.url };
	}

	function handleImageClear() {
		form.featured_image_id = null;
		featuredImage = null;
	}

	function generateSlug() {
		const title = form.title_en;
		if (title) {
			form.slug = title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');
		}
	}

	$effect(() => {
		loadPages();
	});
</script>

<svelte:head>
	<title>Pages - Admin Panel</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>Pages</h1>
			<p class="text-muted">Manage static pages and content</p>
		</div>
		<button class="btn-primary" onclick={openCreate}>+ Create Page</button>
	</div>

	{#if isLoading}
		<div class="loading">Loading...</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Title</th>
							<th>Slug</th>
							<th>Type</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each pagesList as item}
							<tr>
								<td>
									<div class="page-title">{item.title_en}</div>
									{#if item.is_in_menu}
										<span class="badge menu">In Menu</span>
									{/if}
								</td>
								<td class="slug">/{item.slug}</td>
								<td>
									<span class="badge type">{item.page_type}</span>
								</td>
								<td>
									<span class="badge" class:published={item.is_published}>
										{item.is_published ? 'Published' : 'Draft'}
									</span>
								</td>
								<td>
									<div class="actions">
										<a href="/{item.slug}" target="_blank" class="btn-view">View</a>
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

		{#if pagesList.length === 0}
			<div class="empty-state">
				<p>No pages found</p>
				<button class="btn-primary" onclick={openCreate}>Create First Page</button>
			</div>
		{/if}
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
	<div class="modal-overlay" onclick={() => (showModal = false)}>
		<div class="modal modal-xl" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>{editItem ? 'Edit Page' : 'Create New Page'}</h2>
				<div class="modal-tabs">
					<button class="tab" class:active={activeTab === 'content'} onclick={() => (activeTab = 'content')}>
						Content
					</button>
					<button class="tab" class:active={activeTab === 'seo'} onclick={() => (activeTab = 'seo')}>
						SEO
					</button>
				</div>
			</div>

			<LanguageTabs bind:active={activeLang} />

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				{#if activeTab === 'content'}
					<div class="form-row">
						<div class="form-group">
							<label for="title">Title ({activeLang.toUpperCase()})</label>
							<input
								type="text"
								id="title"
								bind:value={form[`title_${activeLang}`]}
								required
								onblur={() => { if (!editItem && activeLang === 'en') generateSlug(); }}
							/>
						</div>
						<div class="form-group">
							<label for="slug">
								Slug (URL)
								{#if !editItem}
									<button type="button" class="btn-link" onclick={generateSlug}>Generate</button>
								{/if}
							</label>
							<input type="text" id="slug" bind:value={form.slug} required pattern="[a-z0-9-]+" />
						</div>
					</div>

					<div class="form-row">
						<div class="form-group">
							<label for="page_type">Page Type</label>
							<select id="page_type" bind:value={form.page_type}>
								<option value="static">Static Page</option>
								<option value="dynamic">Dynamic (Page Builder)</option>
							</select>
						</div>
						<div class="form-group">
							<label for="template">Template</label>
							<select id="template" bind:value={form.template}>
								<option value="default">Default</option>
								<option value="full-width">Full Width</option>
								<option value="sidebar">With Sidebar</option>
							</select>
						</div>
					</div>

					<div class="form-group">
						<label for="content">Content ({activeLang.toUpperCase()})</label>
						<textarea id="content" bind:value={form[`content_${activeLang}`]} rows="12" class="code-editor"></textarea>
						<p class="help-text">Supports HTML markup</p>
					</div>

					<MediaPicker
						label="Featured Image"
						folder="pages"
						value={featuredImage}
						onselect={handleImageSelect}
						onclear={handleImageClear}
					/>

					<div class="form-row checkboxes">
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={form.is_published} />
							<span>Published</span>
						</label>
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={form.is_in_menu} />
							<span>Show in Menu</span>
						</label>
					</div>
				{:else}
					<div class="form-group">
						<label for="seo_title">SEO Title ({activeLang.toUpperCase()})</label>
						<input type="text" id="seo_title" bind:value={form[`seo_title_${activeLang}`]} maxlength="60" />
						<p class="help-text">Recommended: 50-60 characters</p>
					</div>

					<div class="form-group">
						<label for="seo_description">Meta Description ({activeLang.toUpperCase()})</label>
						<textarea id="seo_description" bind:value={form[`seo_description_${activeLang}`]} rows="3" maxlength="160"></textarea>
						<p class="help-text">Recommended: 150-160 characters</p>
					</div>
				{/if}

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
			<h2>Delete Page</h2>
			<p>Are you sure you want to delete this page? This action cannot be undone.</p>
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

	.page-title {
		font-weight: 600;
		color: #111827;
	}

	.slug {
		font-family: monospace;
		color: #6b7280;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		background-color: #fef3c7;
		color: #92400e;
	}

	.badge.published {
		background-color: #d1fae5;
		color: #065f46;
	}

	.badge.menu {
		background-color: #dbeafe;
		color: #1e40af;
		margin-left: 0.5rem;
	}

	.badge.type {
		background-color: #f3f4f6;
		color: #374151;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-primary,
	.btn-secondary,
	.btn-danger,
	.btn-edit,
	.btn-delete,
	.btn-view {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		display: inline-block;
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

	.btn-view {
		background-color: #f3f4f6;
		color: #374151;
	}

	.btn-link {
		background: none;
		border: none;
		color: #667eea;
		font-size: 0.75rem;
		cursor: pointer;
		padding: 0;
		margin-left: 0.5rem;
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

	.modal-xl {
		max-width: 900px;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.modal h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.modal-tabs {
		display: flex;
		gap: 0.5rem;
	}

	.tab {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.tab.active {
		background: #667eea;
		color: white;
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

	.code-editor {
		font-family: 'Fira Code', 'Consolas', monospace;
		font-size: 0.8125rem;
		line-height: 1.5;
	}

	.help-text {
		margin: 0.25rem 0 0;
		font-size: 0.75rem;
		color: #6b7280;
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
