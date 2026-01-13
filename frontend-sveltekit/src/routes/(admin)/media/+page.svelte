<script lang="ts">
	import { page } from '$app/stores';
	import LanguageTabs from '$lib/components/admin/LanguageTabs.svelte';

	interface MediaItem {
		id: number;
		filename: string;
		stored_filename: string;
		folder: string | null;
		url: string;
		width: number | null;
		height: number | null;
		size: number;
		mime_type: string;
		alt_en: string | null;
		alt_ru: string | null;
		alt_es: string | null;
		alt_zh: string | null;
		thumbnails?: Array<{ size: string; url: string }>;
	}

	let { data } = $props();

	let mediaItems = $state<MediaItem[]>(data.items || []);
	let isUploading = $state(false);
	let selectedItem = $state<MediaItem | null>(null);
	let isEditModalOpen = $state(false);
	let activeFolder = $state('all');

	const folders = ['all', 'uploads', 'artworks', 'series', 'exhibitions', 'pages'];

	async function loadMedia(folder?: string) {
		const url = folder && folder !== 'all' ? `/api/media?folder=${folder}` : '/api/media';
		const res = await fetch(url);
		const result = await res.json();
		mediaItems = result.items || [];
	}

	async function handleUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		isUploading = true;

		for (const file of files) {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('folder', activeFolder === 'all' ? 'general' : activeFolder);
			// Include CSRF token
			if ($page.data.csrfToken) {
				formData.append('csrf_token', $page.data.csrfToken);
			}

			try {
				await fetch('/api/media/upload', {
					method: 'POST',
					body: formData
				});
			} catch (err) {
				console.error('Upload failed:', err);
			}
		}

		await loadMedia(activeFolder);
		isUploading = false;
		input.value = '';
	}

	function openEditModal(item: MediaItem) {
		selectedItem = { ...item };
		isEditModalOpen = true;
	}

	async function saveAltTexts() {
		if (!selectedItem) return;

		try {
			await fetch(`/api/media/${selectedItem.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'x-csrf-token': $page.data.csrfToken || ''
				},
				body: JSON.stringify({
					alt_en: selectedItem.alt_en,
					alt_ru: selectedItem.alt_ru,
					alt_es: selectedItem.alt_es,
					alt_zh: selectedItem.alt_zh
				})
			});

			await loadMedia(activeFolder);
			isEditModalOpen = false;
		} catch (err) {
			console.error('Save failed:', err);
		}
	}

	async function deleteMedia(id: number) {
		if (!confirm('Are you sure you want to delete this image?')) return;

		try {
			await fetch(`/api/media/${id}`, {
				method: 'DELETE',
				headers: {
					'x-csrf-token': $page.data.csrfToken || ''
				}
			});
			await loadMedia(activeFolder);
			isEditModalOpen = false;
		} catch (err) {
			console.error('Delete failed:', err);
		}
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function getThumbnailUrl(item: MediaItem): string {
		const thumb = item.thumbnails?.find((t) => t.size === 'small');
		return thumb?.url || item.url;
	}

	function handleFolderChange(folder: string) {
		activeFolder = folder;
		loadMedia(folder);
	}

	// Load on mount
	$effect(() => {
		loadMedia();
	});
</script>

<svelte:head>
	<title>Media Library | Admin</title>
</svelte:head>

<div class="media-page">
	<header class="page-header">
		<h1>Media Library</h1>
		<label class="upload-btn" class:uploading={isUploading}>
			{isUploading ? 'Uploading...' : 'Upload Images'}
			<input type="file" accept="image/*" multiple onchange={handleUpload} disabled={isUploading} hidden />
		</label>
	</header>

	<nav class="folder-nav">
		{#each folders as folder}
			<button
				type="button"
				class="folder-btn"
				class:active={activeFolder === folder}
				onclick={() => handleFolderChange(folder)}
			>
				{folder === 'all' ? 'All' : folder.charAt(0).toUpperCase() + folder.slice(1)}
			</button>
		{/each}
	</nav>

	{#if mediaItems.length === 0}
		<div class="empty-state">
			<p>No images found in this folder.</p>
			<p>Upload some images to get started!</p>
		</div>
	{:else}
		<div class="media-grid">
			{#each mediaItems as item}
				<div class="media-card">
					<div class="media-preview">
						<img src={getThumbnailUrl(item)} alt={item.alt_en || item.filename} loading="lazy" />
					</div>
					<div class="media-info">
						<span class="filename" title={item.filename}>{item.filename}</span>
						<span class="meta">
							{item.width}×{item.height} • {formatSize(item.size)}
						</span>
					</div>
					<div class="media-actions">
						<button type="button" class="btn-edit" onclick={() => openEditModal(item)}>Edit</button>
						<button type="button" class="btn-delete" onclick={() => deleteMedia(item.id)}>Delete</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if isEditModalOpen && selectedItem}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => (isEditModalOpen = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Edit Media</h2>
				<button type="button" class="btn-close" onclick={() => (isEditModalOpen = false)}>×</button>
			</div>

			<div class="modal-body">
				<div class="preview-section">
					<img src={selectedItem.url} alt={selectedItem.filename} />
					<div class="preview-meta">
						<p><strong>Filename:</strong> {selectedItem.filename}</p>
						<p><strong>Size:</strong> {formatSize(selectedItem.size)}</p>
						<p><strong>Dimensions:</strong> {selectedItem.width}×{selectedItem.height}</p>
					</div>
				</div>

				<div class="alt-section">
					<h3>Alt Text (for accessibility)</h3>
					<LanguageTabs>
						{#snippet children(lang)}
							<div class="form-group">
								<label for="alt_{lang}">Alt Text ({lang.toUpperCase()})</label>
								<input
									type="text"
									id="alt_{lang}"
									bind:value={selectedItem![`alt_${lang}` as keyof MediaItem]}
									placeholder="Describe the image..."
								/>
							</div>
						{/snippet}
					</LanguageTabs>
				</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn-save" onclick={saveAltTexts}>Save Changes</button>
				<button type="button" class="btn-cancel" onclick={() => (isEditModalOpen = false)}>Cancel</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.media-page {
		padding: 2rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.75rem;
	}

	.upload-btn {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary, #333);
		color: white;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.upload-btn.uploading {
		opacity: 0.6;
		cursor: wait;
	}

	.folder-nav {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border, #ddd);
		flex-wrap: wrap;
	}

	.folder-btn {
		padding: 0.5rem 1rem;
		background: #f5f5f5;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.folder-btn:hover {
		background: #eee;
	}

	.folder-btn.active {
		background: var(--color-primary, #333);
		color: white;
		border-color: var(--color-primary, #333);
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-text-secondary, #666);
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.media-card {
		background: white;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 8px;
		overflow: hidden;
	}

	.media-preview {
		aspect-ratio: 1;
		overflow: hidden;
		background: #f5f5f5;
	}

	.media-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.media-info {
		padding: 0.75rem;
		border-bottom: 1px solid var(--color-border, #ddd);
	}

	.filename {
		display: block;
		font-weight: 500;
		font-size: 0.875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.meta {
		font-size: 0.75rem;
		color: var(--color-text-secondary, #666);
	}

	.media-actions {
		display: flex;
		padding: 0.5rem;
		gap: 0.5rem;
	}

	.btn-edit,
	.btn-delete {
		flex: 1;
		padding: 0.5rem;
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

	.preview-section {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.preview-section img {
		width: 150px;
		height: 150px;
		object-fit: cover;
		border-radius: 4px;
	}

	.preview-meta {
		font-size: 0.875rem;
	}

	.preview-meta p {
		margin: 0.25rem 0;
	}

	.alt-section h3 {
		margin: 0 0 1rem;
		font-size: 1rem;
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

	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		font-size: 1rem;
	}

	.modal-footer {
		display: flex;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
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

	.btn-cancel {
		background: white;
		border: 1px solid var(--color-border, #ddd);
	}

	/* Dark theme support */
	:global(.dark) .page-header h1 {
		color: #f9fafb;
	}

	:global(.dark) .folder-btn {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}

	:global(.dark) .folder-btn:hover {
		background: #4b5563;
	}

	:global(.dark) .folder-btn.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: transparent;
		color: white;
	}

	:global(.dark) .empty-state {
		color: #9ca3af;
	}

	:global(.dark) .media-card {
		background: #1f2937;
		border-color: #374151;
	}

	:global(.dark) .media-preview {
		background: #374151;
	}

	:global(.dark) .media-info {
		border-color: #374151;
	}

	:global(.dark) .filename {
		color: #f9fafb;
	}

	:global(.dark) .meta {
		color: #9ca3af;
	}

	:global(.dark) .btn-edit,
	:global(.dark) .btn-delete {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}

	:global(.dark) .btn-edit:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: transparent;
		color: white;
	}

	:global(.dark) .btn-delete:hover {
		background: #7f1d1d;
		border-color: #991b1b;
		color: #fecaca;
	}

	:global(.dark) .modal-content {
		background: #1f2937;
	}

	:global(.dark) .modal-header {
		border-color: #374151;
	}

	:global(.dark) .modal-header h2 {
		color: #f9fafb;
	}

	:global(.dark) .btn-close {
		color: #9ca3af;
	}

	:global(.dark) .btn-close:hover {
		color: #f9fafb;
	}

	:global(.dark) .preview-meta {
		color: #d1d5db;
	}

	:global(.dark) .alt-section h3 {
		color: #f9fafb;
	}

	:global(.dark) .form-group label {
		color: #e5e7eb;
	}

	:global(.dark) .form-group input {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}

	:global(.dark) .form-group input::placeholder {
		color: #9ca3af;
	}

	:global(.dark) .modal-footer {
		border-color: #374151;
	}

	:global(.dark) .btn-cancel {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}
</style>
