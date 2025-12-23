<script lang="ts">
	import type { PageData } from './$types';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';

	let { data }: { data: PageData } = $props();

	// State
	let products = $state(data.products);
	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'visible' | 'hidden' | 'featured'>('all');
	let deleteId = $state<number | null>(null);
	let showDeleteDialog = $state(false);
	let message = $state('');
	let messageType = $state<'success' | 'error'>('success');

	// Filtered products
	const filteredProducts = $derived(
		products.filter((product) => {
			// Status filter
			if (statusFilter === 'visible' && !product.is_visible) return false;
			if (statusFilter === 'hidden' && product.is_visible) return false;
			if (statusFilter === 'featured' && !product.is_featured) return false;

			// Search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				return (
					product.title_en.toLowerCase().includes(query) ||
					product.sku?.toLowerCase().includes(query) ||
					product.artworkTitle?.toLowerCase().includes(query)
				);
			}
			return true;
		})
	);

	// Statistics
	const stats = $derived({
		total: products.length,
		visible: products.filter((p) => p.is_visible).length,
		hidden: products.filter((p) => !p.is_visible).length,
		featured: products.filter((p) => p.is_featured).length,
		lowStock: products.filter((p) => !p.is_unlimited && (p.stock_quantity ?? 0) <= 2).length,
		totalValue: products.reduce((sum, p) => sum + p.price_eur, 0)
	});

	// Format price
	function formatPrice(amount: number): string {
		return `€${amount.toLocaleString()}`;
	}

	// Confirm delete
	function confirmDelete(id: number) {
		deleteId = id;
		showDeleteDialog = true;
	}

	// Handle delete
	async function handleDelete() {
		if (!deleteId) return;

		try {
			const formData = new FormData();
			formData.append('id', deleteId.toString());

			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				products = products.filter((p) => p.id !== deleteId);
				message = 'Product deleted successfully';
				messageType = 'success';
			} else {
				message = 'Failed to delete product';
				messageType = 'error';
			}
		} catch (err) {
			message = 'Error deleting product';
			messageType = 'error';
		} finally {
			showDeleteDialog = false;
			deleteId = null;

			// Clear message after 3 seconds
			setTimeout(() => {
				message = '';
			}, 3000);
		}
	}

	// Get stock status
	function getStockStatus(product: (typeof products)[0]): { text: string; class: string } {
		if (product.is_unlimited) {
			return { text: 'Unlimited', class: 'stock-unlimited' };
		}
		const qty = product.stock_quantity ?? 0;
		if (qty === 0) {
			return { text: 'Out of stock', class: 'stock-out' };
		}
		if (qty <= 2) {
			return { text: `Low (${qty})`, class: 'stock-low' };
		}
		return { text: `${qty} in stock`, class: 'stock-ok' };
	}
</script>

<div class="page">
	<div class="page-header">
		<div class="header-content">
			<h1>Shop Products</h1>
			<p class="page-subtitle">Manage products available in your shop</p>
		</div>
		<a href="/shop/products/new" class="btn-primary">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
				<line x1="12" y1="5" x2="12" y2="19" />
				<line x1="5" y1="12" x2="19" y2="12" />
			</svg>
			Add Product
		</a>
	</div>

	{#if message}
		<div class="message" class:success={messageType === 'success'} class:error={messageType === 'error'}>
			{message}
		</div>
	{/if}

	<!-- Statistics Cards -->
	<div class="stats-grid">
		<div class="stat-card">
			<span class="stat-label">Total Products</span>
			<span class="stat-value">{stats.total}</span>
		</div>
		<div class="stat-card visible">
			<span class="stat-label">Visible</span>
			<span class="stat-value">{stats.visible}</span>
		</div>
		<div class="stat-card hidden">
			<span class="stat-label">Hidden</span>
			<span class="stat-value">{stats.hidden}</span>
		</div>
		<div class="stat-card featured">
			<span class="stat-label">Featured</span>
			<span class="stat-value">{stats.featured}</span>
		</div>
		<div class="stat-card low-stock">
			<span class="stat-label">Low Stock</span>
			<span class="stat-value">{stats.lowStock}</span>
		</div>
		<div class="stat-card value">
			<span class="stat-label">Total Value</span>
			<span class="stat-value">{formatPrice(stats.totalValue)}</span>
		</div>
	</div>

	<!-- Filters -->
	<div class="filters">
		<div class="search-wrapper">
			<input
				type="text"
				placeholder="Search by title, SKU, or linked artwork..."
				bind:value={searchQuery}
				class="search-input"
			/>
		</div>

		<div class="status-filter">
			<select bind:value={statusFilter} class="filter-select">
				<option value="all">All Products</option>
				<option value="visible">Visible Only</option>
				<option value="hidden">Hidden Only</option>
				<option value="featured">Featured Only</option>
			</select>
		</div>
	</div>

	<!-- Products Table -->
	{#if filteredProducts.length === 0}
		<div class="empty-state">
			{#if products.length === 0}
				<div class="empty-icon">🛍️</div>
				<h3>No products yet</h3>
				<p>Create your first shop product to get started</p>
				<a href="/shop/products/new" class="btn-primary">Add Product</a>
			{:else}
				<p>No products match your search criteria</p>
			{/if}
		</div>
	{:else}
		<div class="products-table-wrapper">
			<table class="products-table">
				<thead>
					<tr>
						<th>Image</th>
						<th>Product</th>
						<th>SKU</th>
						<th>Price</th>
						<th>Stock</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredProducts as product}
						<tr>
							<td class="image-cell">
								{#if product.primaryImage}
									<img
										src={product.primaryImage.url}
										alt={product.title_en}
										class="product-thumb"
									/>
								{:else}
									<div class="no-image">No image</div>
								{/if}
							</td>
							<td>
								<div class="product-info">
									<span class="product-title">{product.title_en}</span>
									{#if product.artworkTitle}
										<span class="linked-artwork">
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
												<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
												<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
											</svg>
											{product.artworkTitle}
										</span>
									{/if}
								</div>
							</td>
							<td>
								<span class="product-sku">{product.sku || '—'}</span>
							</td>
							<td>
								<div class="price-info">
									<span class="price">{formatPrice(product.price_eur)}</span>
									{#if product.compare_price_eur}
										<span class="compare-price">{formatPrice(product.compare_price_eur)}</span>
									{/if}
								</div>
							</td>
							<td>
								<span class="stock-badge {getStockStatus(product).class}">{getStockStatus(product).text}</span>
							</td>
							<td>
								<div class="status-badges">
									{#if product.is_visible}
										<span class="badge visible">Visible</span>
									{:else}
										<span class="badge hidden">Hidden</span>
									{/if}
									{#if product.is_featured}
										<span class="badge featured">Featured</span>
									{/if}
								</div>
							</td>
							<td>
								<div class="actions">
									<a href="/shop/products/{product.id}" class="btn-edit" title="Edit">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
										</svg>
									</a>
									<button
										class="btn-delete"
										title="Delete"
										onclick={() => confirmDelete(product.id)}
									>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
										</svg>
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
	open={showDeleteDialog}
	title="Delete Product"
	message="Are you sure you want to delete this product? This action cannot be undone."
	confirmText="Delete"
	variant="danger"
	onConfirm={handleDelete}
	onCancel={() => (showDeleteDialog = false)}
/>

<style>
	.page {
		max-width: 1200px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
		gap: 1rem;
	}

	.header-content h1 {
		margin: 0 0 0.5rem 0;
		font-size: 1.75rem;
		font-weight: 700;
		color: #1a1a1a;
	}

	.page-subtitle {
		margin: 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.message {
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.message.success {
		background: #ecfdf5;
		color: #059669;
	}

	.message.error {
		background: #fef2f2;
		color: #dc2626;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat-card {
		background: white;
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
	}

	.stat-card.visible .stat-value {
		color: #10b981;
	}

	.stat-card.hidden .stat-value {
		color: #6b7280;
	}

	.stat-card.featured .stat-value {
		color: #f59e0b;
	}

	.stat-card.low-stock .stat-value {
		color: #ef4444;
	}

	.stat-card.value .stat-value {
		color: #d4af37;
	}

	/* Filters */
	.filters {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.search-wrapper {
		flex: 1;
	}

	.search-input {
		width: 100%;
		padding: 0.625rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.search-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
	}

	.filter-select {
		padding: 0.625rem 2rem 0.625rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		background: white;
		cursor: pointer;
	}

	/* Empty State */
	.empty-state {
		background: white;
		border-radius: 0.5rem;
		padding: 3rem;
		text-align: center;
		color: #6b7280;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
	}

	.empty-state p {
		margin: 0 0 1.5rem 0;
	}

	/* Table */
	.products-table-wrapper {
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow-x: auto;
	}

	.products-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.products-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		background: #f9fafb;
		color: #6b7280;
		font-weight: 600;
		text-transform: uppercase;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		border-bottom: 1px solid #e5e7eb;
	}

	.products-table td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e5e7eb;
		vertical-align: middle;
	}

	.products-table tr:last-child td {
		border-bottom: none;
	}

	.products-table tr:hover {
		background: #f9fafb;
	}

	.image-cell {
		width: 60px;
	}

	.product-thumb {
		width: 48px;
		height: 48px;
		object-fit: cover;
		border-radius: 0.25rem;
		background: #f3f4f6;
	}

	.no-image {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f3f4f6;
		border-radius: 0.25rem;
		font-size: 0.625rem;
		color: #9ca3af;
	}

	.product-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.product-title {
		font-weight: 500;
		color: #1a1a1a;
	}

	.linked-artwork {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.product-sku {
		font-family: 'SF Mono', 'Monaco', monospace;
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.price-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.price {
		font-weight: 600;
	}

	.compare-price {
		font-size: 0.75rem;
		color: #9ca3af;
		text-decoration: line-through;
	}

	.stock-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.stock-unlimited {
		background: #dbeafe;
		color: #1d4ed8;
	}

	.stock-ok {
		background: #dcfce7;
		color: #166534;
	}

	.stock-low {
		background: #fef3c7;
		color: #b45309;
	}

	.stock-out {
		background: #fee2e2;
		color: #dc2626;
	}

	.status-badges {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.badge {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.6875rem;
		font-weight: 500;
	}

	.badge.visible {
		background: #dcfce7;
		color: #166534;
	}

	.badge.hidden {
		background: #f3f4f6;
		color: #6b7280;
	}

	.badge.featured {
		background: #fef3c7;
		color: #b45309;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-edit,
	.btn-delete {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		color: #6b7280;
	}

	.btn-edit:hover {
		border-color: #667eea;
		color: #667eea;
	}

	.btn-delete:hover {
		border-color: #ef4444;
		color: #ef4444;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			align-items: stretch;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.filters {
			flex-direction: column;
		}

		.products-table th:nth-child(3),
		.products-table td:nth-child(3),
		.products-table th:nth-child(6),
		.products-table td:nth-child(6) {
			display: none;
		}
	}
</style>
