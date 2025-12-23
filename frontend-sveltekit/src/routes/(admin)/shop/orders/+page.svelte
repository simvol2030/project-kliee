<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// State
	let orders = $state(data.orders);
	let selectedOrder = $state<(typeof orders)[0] | null>(null);
	let isModalOpen = $state(false);
	let statusFilter = $state<string>('all');
	let searchQuery = $state('');
	let updatingStatus = $state(false);
	let message = $state('');

	// Status options
	const statusOptions = [
		{ value: 'pending', label: 'Pending', color: '#f59e0b' },
		{ value: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
		{ value: 'processing', label: 'Processing', color: '#8b5cf6' },
		{ value: 'shipped', label: 'Shipped', color: '#06b6d4' },
		{ value: 'completed', label: 'Completed', color: '#10b981' },
		{ value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
	];

	// Get status color
	function getStatusColor(status: string): string {
		return statusOptions.find((s) => s.value === status)?.color || '#6b7280';
	}

	// Get status label
	function getStatusLabel(status: string): string {
		return statusOptions.find((s) => s.value === status)?.label || status;
	}

	// Filter orders
	const filteredOrders = $derived(
		orders.filter((order) => {
			// Status filter
			if (statusFilter !== 'all' && order.status !== statusFilter) return false;

			// Search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				return (
					order.order_number.toLowerCase().includes(query) ||
					order.customer_name.toLowerCase().includes(query) ||
					order.customer_email.toLowerCase().includes(query)
				);
			}
			return true;
		})
	);

	// Statistics
	const stats = $derived({
		total: orders.length,
		pending: orders.filter((o) => o.status === 'pending').length,
		confirmed: orders.filter((o) => o.status === 'confirmed').length,
		processing: orders.filter((o) => o.status === 'processing').length,
		shipped: orders.filter((o) => o.status === 'shipped').length,
		completed: orders.filter((o) => o.status === 'completed').length,
		cancelled: orders.filter((o) => o.status === 'cancelled').length,
		totalRevenue: orders
			.filter((o) => o.status !== 'cancelled')
			.reduce((sum, o) => sum + o.subtotal_eur, 0)
	});

	// Format price
	function formatPrice(amount: number): string {
		return `€${amount.toLocaleString()}`;
	}

	// Format date
	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Open order details
	function openOrderDetails(order: (typeof orders)[0]) {
		selectedOrder = order;
		isModalOpen = true;
	}

	// Close modal
	function closeModal() {
		isModalOpen = false;
		selectedOrder = null;
	}

	// Order status type
	type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';

	// Update order status
	async function updateStatus(newStatus: OrderStatus) {
		if (!selectedOrder) return;

		updatingStatus = true;
		message = '';

		try {
			const response = await fetch('/api/admin/orders', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					order_id: selectedOrder.id,
					status: newStatus
				})
			});

			if (!response.ok) {
				throw new Error('Failed to update');
			}

			// Update local state
			const idx = orders.findIndex((o) => o.id === selectedOrder!.id);
			if (idx >= 0) {
				orders[idx].status = newStatus;
			}
			selectedOrder.status = newStatus;

			message = 'Status updated successfully!';
		} catch (err) {
			message = 'Error updating status';
			console.error(err);
		} finally {
			updatingStatus = false;
		}
	}
</script>

<div class="page">
	<div class="page-header">
		<div class="header-content">
			<h1>Orders</h1>
			<p class="page-subtitle">Manage customer orders</p>
		</div>
	</div>

	<!-- Statistics Cards -->
	<div class="stats-grid">
		<div class="stat-card">
			<span class="stat-label">Total Orders</span>
			<span class="stat-value">{stats.total}</span>
		</div>
		<div class="stat-card pending">
			<span class="stat-label">Pending</span>
			<span class="stat-value">{stats.pending}</span>
		</div>
		<div class="stat-card confirmed">
			<span class="stat-label">Confirmed</span>
			<span class="stat-value">{stats.confirmed}</span>
		</div>
		<div class="stat-card processing">
			<span class="stat-label">Processing</span>
			<span class="stat-value">{stats.processing}</span>
		</div>
		<div class="stat-card shipped">
			<span class="stat-label">Shipped</span>
			<span class="stat-value">{stats.shipped}</span>
		</div>
		<div class="stat-card completed">
			<span class="stat-label">Completed</span>
			<span class="stat-value">{stats.completed}</span>
		</div>
		<div class="stat-card revenue">
			<span class="stat-label">Revenue</span>
			<span class="stat-value">{formatPrice(stats.totalRevenue)}</span>
		</div>
	</div>

	<!-- Filters -->
	<div class="filters">
		<div class="search-wrapper">
			<input
				type="text"
				placeholder="Search by order #, name, or email..."
				bind:value={searchQuery}
				class="search-input"
			/>
		</div>

		<div class="status-filter">
			<select bind:value={statusFilter} class="filter-select">
				<option value="all">All Status</option>
				{#each statusOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Orders Table -->
	{#if filteredOrders.length === 0}
		<div class="empty-state">
			<p>No orders found</p>
		</div>
	{:else}
		<div class="orders-table-wrapper">
			<table class="orders-table">
				<thead>
					<tr>
						<th>Order</th>
						<th>Customer</th>
						<th>Items</th>
						<th>Total</th>
						<th>Status</th>
						<th>Date</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredOrders as order}
						<tr>
							<td>
								<span class="order-number">{order.order_number}</span>
							</td>
							<td>
								<div class="customer-info">
									<span class="customer-name">{order.customer_name}</span>
									<span class="customer-email">{order.customer_email}</span>
								</div>
							</td>
							<td>
								<span class="item-count">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
							</td>
							<td>
								<span class="order-total">{formatPrice(order.subtotal_eur)}</span>
							</td>
							<td>
								<span class="status-badge" style="--status-color: {getStatusColor(order.status)}">
									{getStatusLabel(order.status)}
								</span>
							</td>
							<td>
								<span class="order-date">{formatDate(order.created_at)}</span>
							</td>
							<td>
								<button class="btn-view" onclick={() => openOrderDetails(order)}>View</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Order Details Modal -->
{#if isModalOpen && selectedOrder}
	<div class="modal-overlay" onclick={closeModal}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Order {selectedOrder.order_number}</h2>
				<button class="btn-close" onclick={closeModal}>×</button>
			</div>

			<div class="modal-body">
				<!-- Status Section -->
				<div class="section">
					<h3>Status</h3>
					<div class="status-controls">
						<span
							class="status-badge large"
							style="--status-color: {getStatusColor(selectedOrder.status)}"
						>
							{getStatusLabel(selectedOrder.status)}
						</span>

						<div class="status-buttons">
							{#each statusOptions as option}
								<button
									class="btn-status"
									class:active={selectedOrder.status === option.value}
									style="--status-color: {option.color}"
									onclick={() => updateStatus(option.value as OrderStatus)}
									disabled={updatingStatus || selectedOrder.status === option.value}
								>
									{option.label}
								</button>
							{/each}
						</div>
					</div>

					{#if message}
						<div class="message" class:success={message.includes('success')}>
							{message}
						</div>
					{/if}
				</div>

				<!-- Customer Section -->
				<div class="section">
					<h3>Customer</h3>
					<div class="detail-grid">
						<div class="detail-item">
							<span class="label">Name</span>
							<span class="value">{selectedOrder.customer_name}</span>
						</div>
						<div class="detail-item">
							<span class="label">Email</span>
							<span class="value">{selectedOrder.customer_email}</span>
						</div>
						{#if selectedOrder.customer_phone}
							<div class="detail-item">
								<span class="label">Phone</span>
								<span class="value">{selectedOrder.customer_phone}</span>
							</div>
						{/if}
					</div>
				</div>

				<!-- Shipping Section -->
				<div class="section">
					<h3>Shipping Address</h3>
					<address class="shipping-address">
						<p>{selectedOrder.shipping_address}</p>
						<p>{selectedOrder.shipping_city}, {selectedOrder.shipping_postal}</p>
						<p>{selectedOrder.shipping_country}</p>
					</address>
				</div>

				<!-- Items Section -->
				<div class="section">
					<h3>Items ({selectedOrder.items.length})</h3>
					<ul class="items-list">
						{#each selectedOrder.items as item}
							<li class="order-item">
								<span class="item-title">{item.title_snapshot}</span>
								<span class="item-price">{formatPrice(item.price_eur)}</span>
							</li>
						{/each}
					</ul>

					<div class="order-totals">
						<div class="total-row">
							<span>Subtotal (EUR)</span>
							<span>{formatPrice(selectedOrder.subtotal_eur)}</span>
						</div>
						<div class="total-row">
							<span>Customer Currency</span>
							<span
								>{selectedOrder.currency_code}
								{selectedOrder.total_local.toLocaleString()}</span
							>
						</div>
						<div class="total-row">
							<span>Exchange Rate</span>
							<span>1 EUR = {selectedOrder.currency_rate} {selectedOrder.currency_code}</span>
						</div>
					</div>
				</div>

				<!-- Notes Section -->
				{#if selectedOrder.note || selectedOrder.admin_note}
					<div class="section">
						<h3>Notes</h3>
						{#if selectedOrder.note}
							<div class="note">
								<span class="note-label">Customer Note:</span>
								<p>{selectedOrder.note}</p>
							</div>
						{/if}
						{#if selectedOrder.admin_note}
							<div class="note admin-note">
								<span class="note-label">Admin Note:</span>
								<p>{selectedOrder.admin_note}</p>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Timeline Section -->
				<div class="section">
					<h3>Order Created</h3>
					<p class="created-date">{formatDate(selectedOrder.created_at)}</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.page {
		max-width: 1200px;
	}

	.page-header {
		margin-bottom: 1.5rem;
	}

	.page-header h1 {
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

	.stat-card.pending .stat-value {
		color: #f59e0b;
	}

	.stat-card.confirmed .stat-value {
		color: #3b82f6;
	}

	.stat-card.processing .stat-value {
		color: #8b5cf6;
	}

	.stat-card.shipped .stat-value {
		color: #06b6d4;
	}

	.stat-card.completed .stat-value {
		color: #10b981;
	}

	.stat-card.revenue .stat-value {
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

	/* Table */
	.orders-table-wrapper {
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow-x: auto;
	}

	.orders-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.orders-table th {
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

	.orders-table td {
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		vertical-align: middle;
	}

	.orders-table tr:last-child td {
		border-bottom: none;
	}

	.orders-table tr:hover {
		background: #f9fafb;
	}

	.order-number {
		font-family: 'SF Mono', 'Monaco', monospace;
		font-weight: 600;
		color: #d4af37;
	}

	.customer-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.customer-name {
		font-weight: 500;
	}

	.customer-email {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.item-count {
		color: #6b7280;
	}

	.order-total {
		font-weight: 600;
	}

	.order-date {
		color: #6b7280;
		font-size: 0.8125rem;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background-color: color-mix(in srgb, var(--status-color) 15%, transparent);
		color: var(--status-color);
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 9999px;
		text-transform: capitalize;
	}

	.status-badge.large {
		font-size: 0.875rem;
		padding: 0.375rem 1rem;
	}

	.btn-view {
		padding: 0.375rem 0.75rem;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-view:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.empty-state {
		background: white;
		border-radius: 0.5rem;
		padding: 3rem;
		text-align: center;
		color: #6b7280;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: white;
		border-radius: 0.5rem;
		max-width: 640px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.btn-close {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
		border-radius: 0.25rem;
	}

	.btn-close:hover {
		background: #f3f4f6;
	}

	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
	}

	.section {
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.section:last-child {
		margin-bottom: 0;
		padding-bottom: 0;
		border-bottom: none;
	}

	.section h3 {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.status-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.btn-status {
		padding: 0.375rem 0.75rem;
		border: 1px solid var(--status-color);
		background: white;
		color: var(--status-color);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-status:hover:not(:disabled) {
		background: color-mix(in srgb, var(--status-color) 10%, transparent);
	}

	.btn-status.active {
		background: var(--status-color);
		color: white;
	}

	.btn-status:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.message {
		margin-top: 0.75rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
		background: #fef2f2;
		color: #dc2626;
	}

	.message.success {
		background: #ecfdf5;
		color: #059669;
	}

	.detail-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.detail-item .label {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.detail-item .value {
		font-weight: 500;
	}

	.shipping-address {
		font-style: normal;
		line-height: 1.6;
	}

	.shipping-address p {
		margin: 0;
	}

	.items-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.order-item {
		display: flex;
		justify-content: space-between;
		padding: 0.75rem 0;
		border-bottom: 1px solid #e5e7eb;
	}

	.order-item:last-child {
		border-bottom: none;
	}

	.item-title {
		color: #1a1a1a;
	}

	.item-price {
		font-weight: 500;
		color: #6b7280;
	}

	.order-totals {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 2px solid #e5e7eb;
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		padding: 0.375rem 0;
		font-size: 0.875rem;
	}

	.total-row:first-child {
		font-weight: 600;
		font-size: 1rem;
	}

	.note {
		background: #f9fafb;
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		margin-bottom: 0.75rem;
	}

	.note:last-child {
		margin-bottom: 0;
	}

	.note-label {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		margin-bottom: 0.25rem;
	}

	.note p {
		margin: 0;
		font-size: 0.875rem;
	}

	.admin-note {
		background: #fef3c7;
	}

	.created-date {
		margin: 0;
		font-size: 0.875rem;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.filters {
			flex-direction: column;
		}

		.orders-table th:nth-child(3),
		.orders-table td:nth-child(3),
		.orders-table th:nth-child(6),
		.orders-table td:nth-child(6) {
			display: none;
		}
	}
</style>
