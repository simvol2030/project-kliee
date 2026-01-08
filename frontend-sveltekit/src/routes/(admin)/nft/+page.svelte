<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let deletingId = $state<number | null>(null);
</script>

<svelte:head>
	<title>NFT Management - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>NFT Collection</h1>
	<a href="/nft/new" class="btn-primary">+ Add NFT</a>
</div>

{#if data.items.length === 0}
	<div class="empty-state">
		<p>No NFTs yet. Add your first NFT to get started.</p>
		<a href="/nft/new" class="btn-primary">+ Add NFT</a>
	</div>
{:else}
	<div class="table-container">
		<table class="data-table">
			<thead>
				<tr>
					<th>Image</th>
					<th>Title</th>
					<th>Technique</th>
					<th>Year</th>
					<th>Price</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.items as item}
					<tr>
						<td class="image-cell">
							{#if item.imageUrl}
								<img src={item.imageUrl} alt={item.title_en} class="thumbnail" />
							{:else}
								<div class="no-image">No image</div>
							{/if}
						</td>
						<td>
							<strong>{item.title_en}</strong>
							<div class="subtitle">{item.slug}</div>
						</td>
						<td>{item.technique || '-'}</td>
						<td>{item.year || '-'}</td>
						<td>
							{#if item.price}
								{item.price} {item.currency || 'ETH'}
							{:else}
								-
							{/if}
						</td>
						<td>
							<div class="status-badges">
								{#if item.is_visible}
									<span class="badge badge-success">Visible</span>
								{:else}
									<span class="badge badge-muted">Hidden</span>
								{/if}
								{#if item.is_featured}
									<span class="badge badge-featured">Featured</span>
								{/if}
							</div>
						</td>
						<td class="actions-cell">
							<a href="/nft/{item.id}" class="btn-edit">Edit</a>
							<form
								method="POST"
								action="?/delete"
								use:enhance={() => {
									deletingId = item.id;
									return async ({ update }) => {
										await update();
										deletingId = null;
									};
								}}
								onsubmit={(e) => {
									if (!confirm('Are you sure you want to delete this NFT?')) {
										e.preventDefault();
									}
								}}
							>
								<input type="hidden" name="id" value={item.id} />
								<button type="submit" class="btn-delete" disabled={deletingId === item.id}>
									{deletingId === item.id ? 'Deleting...' : 'Delete'}
								</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
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

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 0.5rem;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.empty-state p {
		color: #6b7280;
		margin-bottom: 1.5rem;
	}

	.table-container {
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
	}

	.data-table th {
		text-align: left;
		padding: 1rem;
		background: #f9fafb;
		font-weight: 600;
		color: #374151;
		border-bottom: 1px solid #e5e7eb;
	}

	.data-table td {
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		vertical-align: middle;
	}

	.data-table tr:hover {
		background: #f9fafb;
	}

	.image-cell {
		width: 80px;
	}

	.thumbnail {
		width: 60px;
		height: 60px;
		object-fit: cover;
		border-radius: 0.375rem;
	}

	.no-image {
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.625rem;
		color: #6b7280;
	}

	.subtitle {
		font-size: 0.75rem;
		color: #6b7280;
		margin-top: 0.25rem;
	}

	.status-badges {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 0.25rem;
	}

	.badge-success {
		background: #d1fae5;
		color: #047857;
	}

	.badge-muted {
		background: #e5e7eb;
		color: #6b7280;
	}

	.badge-featured {
		background: #fef3c7;
		color: #d97706;
	}

	.actions-cell {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.btn-edit {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #374151;
		text-decoration: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		transition: background 0.2s;
	}

	.btn-edit:hover {
		background: #e5e7eb;
	}

	.btn-delete {
		padding: 0.5rem 1rem;
		background: #fef2f2;
		color: #dc2626;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-delete:hover {
		background: #fee2e2;
	}

	.btn-delete:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
