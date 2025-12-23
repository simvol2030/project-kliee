<script lang="ts">
	import LanguageTabs from '$lib/components/admin/LanguageTabs.svelte';

	interface MenuItem {
		id: number;
		href: string;
		label_en: string;
		label_ru: string;
		label_es: string;
		label_zh: string;
		parent_id: number | null;
		has_dropdown: boolean | null;
		order_index: number;
		icon: string | null;
		is_visible: boolean | null;
		children?: MenuItem[];
	}

	let { data } = $props();

	let menuItems = $state<MenuItem[]>(data.items || []);
	let isModalOpen = $state(false);
	let editingItem = $state<MenuItem | null>(null);
	let isSaving = $state(false);

	// Form state
	let formData = $state({
		href: '',
		label_en: '',
		label_ru: '',
		label_es: '',
		label_zh: '',
		parent_id: null as number | null,
		has_dropdown: false,
		order_index: 0,
		icon: '',
		is_visible: true
	});

	function openCreateModal() {
		editingItem = null;
		formData = {
			href: '',
			label_en: '',
			label_ru: '',
			label_es: '',
			label_zh: '',
			parent_id: null,
			has_dropdown: false,
			order_index: menuItems.length,
			icon: '',
			is_visible: true
		};
		isModalOpen = true;
	}

	function openEditModal(item: MenuItem) {
		editingItem = item;
		formData = {
			href: item.href,
			label_en: item.label_en,
			label_ru: item.label_ru,
			label_es: item.label_es,
			label_zh: item.label_zh,
			parent_id: item.parent_id,
			has_dropdown: item.has_dropdown || false,
			order_index: item.order_index,
			icon: item.icon || '',
			is_visible: item.is_visible !== false
		};
		isModalOpen = true;
	}

	async function saveItem() {
		isSaving = true;
		try {
			const url = editingItem ? `/api/layout/menu/${editingItem.id}` : '/api/layout/menu';
			const method = editingItem ? 'PATCH' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (res.ok) {
				await loadMenu();
				isModalOpen = false;
			}
		} finally {
			isSaving = false;
		}
	}

	async function deleteItem(id: number) {
		if (!confirm('Delete this menu item and all its children?')) return;

		await fetch(`/api/layout/menu/${id}`, { method: 'DELETE' });
		await loadMenu();
	}

	async function loadMenu() {
		const res = await fetch('/api/layout/menu');
		const result = await res.json();
		menuItems = result.items || [];
	}

	async function toggleVisibility(item: MenuItem) {
		await fetch(`/api/layout/menu/${item.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ is_visible: !item.is_visible })
		});
		await loadMenu();
	}
</script>

<svelte:head>
	<title>Menu | Admin</title>
</svelte:head>

<div class="layout-page">
	<header class="page-header">
		<div>
			<h1>Navigation Menu</h1>
			<p class="subtitle">Manage navigation items (4 languages)</p>
		</div>
		<button type="button" class="btn-primary" onclick={openCreateModal}>+ Add Menu Item</button>
	</header>

	<div class="menu-list">
		{#each menuItems as item}
			<div class="menu-item" class:hidden={!item.is_visible}>
				<div class="item-content">
					<div class="item-info">
						<span class="item-label">{item.label_en}</span>
						<span class="item-href">{item.href}</span>
						{#if item.has_dropdown}
							<span class="badge">Dropdown</span>
						{/if}
					</div>
					<div class="item-actions">
						<button type="button" class="btn-icon" onclick={() => toggleVisibility(item)} title={item.is_visible ? 'Hide' : 'Show'}>
							{item.is_visible ? '👁️' : '👁️‍🗨️'}
						</button>
						<button type="button" class="btn-edit" onclick={() => openEditModal(item)}>Edit</button>
						<button type="button" class="btn-delete" onclick={() => deleteItem(item.id)}>Delete</button>
					</div>
				</div>

				{#if item.children && item.children.length > 0}
					<div class="children">
						{#each item.children as child}
							<div class="menu-item child" class:hidden={!child.is_visible}>
								<div class="item-content">
									<div class="item-info">
										<span class="item-label">{child.label_en}</span>
										<span class="item-href">{child.href}</span>
									</div>
									<div class="item-actions">
										<button type="button" class="btn-icon" onclick={() => toggleVisibility(child)}>
											{child.is_visible ? '👁️' : '👁️‍🗨️'}
										</button>
										<button type="button" class="btn-edit" onclick={() => openEditModal(child)}>Edit</button>
										<button type="button" class="btn-delete" onclick={() => deleteItem(child.id)}>Delete</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}

		{#if menuItems.length === 0}
			<div class="empty-state">
				<p>No menu items yet.</p>
				<button type="button" class="btn-primary" onclick={openCreateModal}>Create First Item</button>
			</div>
		{/if}
	</div>
</div>

{#if isModalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => (isModalOpen = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>{editingItem ? 'Edit Menu Item' : 'New Menu Item'}</h2>
				<button type="button" class="btn-close" onclick={() => (isModalOpen = false)}>×</button>
			</div>

			<form class="modal-body" onsubmit={(e) => { e.preventDefault(); saveItem(); }}>
				<div class="form-row">
					<div class="form-group">
						<label for="href">URL / Href *</label>
						<input type="text" id="href" bind:value={formData.href} required placeholder="/about" />
					</div>
					<div class="form-group">
						<label for="order">Order</label>
						<input type="number" id="order" bind:value={formData.order_index} min="0" />
					</div>
				</div>

				<div class="form-group">
					<label for="parent">Parent Item</label>
					<select id="parent" bind:value={formData.parent_id}>
						<option value={null}>None (Top Level)</option>
						{#each menuItems as item}
							<option value={item.id}>{item.label_en}</option>
						{/each}
					</select>
				</div>

				<LanguageTabs>
					{#snippet children(lang)}
						<div class="form-group">
							<label for="label_{lang}">Label ({lang.toUpperCase()}) {lang === 'en' ? '*' : ''}</label>
							<input
								type="text"
								id="label_{lang}"
								bind:value={formData[`label_${lang}` as keyof typeof formData]}
								required={lang === 'en'}
								placeholder="Menu label..."
							/>
						</div>
					{/snippet}
				</LanguageTabs>

				<div class="form-row">
					<div class="form-group">
						<label for="icon">Icon (optional)</label>
						<input type="text" id="icon" bind:value={formData.icon} placeholder="home, info, etc." />
					</div>
					<div class="form-group checkbox-group">
						<label>
							<input type="checkbox" bind:checked={formData.has_dropdown} />
							Has Dropdown
						</label>
						<label>
							<input type="checkbox" bind:checked={formData.is_visible} />
							Visible
						</label>
					</div>
				</div>

				<div class="modal-footer">
					<button type="submit" class="btn-save" disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Save'}
					</button>
					<button type="button" class="btn-cancel" onclick={() => (isModalOpen = false)}>Cancel</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.layout-page {
		padding: 2rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.75rem;
	}

	.subtitle {
		color: var(--color-text-secondary, #666);
		margin: 0.25rem 0 0;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary, #333);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.menu-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.menu-item {
		background: white;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 8px;
		overflow: hidden;
	}

	.menu-item.hidden {
		opacity: 0.5;
	}

	.menu-item.child {
		margin-left: 2rem;
		border-left: 3px solid var(--color-primary, #333);
	}

	.item-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
	}

	.item-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.item-label {
		font-weight: 600;
	}

	.item-href {
		color: var(--color-text-secondary, #666);
		font-size: 0.875rem;
	}

	.badge {
		background: var(--color-primary, #333);
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.item-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-icon {
		padding: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.25rem;
	}

	.btn-edit,
	.btn-delete {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.btn-edit:hover {
		background: var(--color-primary, #333);
		color: white;
		border-color: var(--color-primary, #333);
	}

	.btn-delete:hover {
		background: #fee;
		border-color: #f88;
		color: #c00;
	}

	.children {
		border-top: 1px solid var(--color-border, #ddd);
		padding: 0.5rem;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-text-secondary, #666);
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 8px;
		width: 90%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-border, #ddd);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		line-height: 1;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.25rem;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		font-size: 1rem;
	}

	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-group input[type='checkbox'] {
		width: auto;
	}

	.modal-footer {
		display: flex;
		gap: 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border, #ddd);
		justify-content: flex-end;
	}

	.btn-save,
	.btn-cancel {
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.btn-save {
		background: var(--color-primary, #333);
		color: white;
		border: none;
	}

	.btn-save:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.btn-cancel {
		background: white;
		border: 1px solid var(--color-border, #ddd);
	}
</style>
