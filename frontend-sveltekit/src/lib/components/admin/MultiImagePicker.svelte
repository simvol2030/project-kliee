<script lang="ts">
	import { page } from '$app/stores';

	interface MediaItem {
		id: number;
		filename?: string;
		stored_filename?: string;
		folder?: string;
		url: string;
		alt_en?: string | null;
		thumbnails?: Array<{ size: string; url: string }>;
	}

	interface ArtworkImage {
		id?: number;
		media_id: number;
		is_primary: boolean;
		order_index: number;
		media?: MediaItem;
	}

	interface Props {
		images?: ArtworkImage[];
		folder?: string;
		label?: string;
		onchange?: (images: ArtworkImage[]) => void;
	}

	let {
		images = [],
		folder = 'artworks',
		label = 'Images',
		onchange
	}: Props = $props();

	let localImages = $state<ArtworkImage[]>([...images]);
	let mediaItems = $state<MediaItem[]>([]);
	let isOpen = $state(false);
	let isLoading = $state(false);
	let isUploading = $state(false);
	let draggedIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

	// Sync with prop changes
	$effect(() => {
		localImages = [...images];
	});

	async function loadMedia() {
		isLoading = true;
		try {
			const res = await fetch(`/api/media?folder=${folder}&limit=100`);
			const data = await res.json();
			mediaItems = data.items || [];
		} catch (err) {
			console.error('Failed to load media:', err);
		}
		isLoading = false;
	}

	async function handleUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		isUploading = true;
		try {
			for (const file of files) {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('folder', folder);
				// Include CSRF token for production security
				if ($page.data.csrfToken) {
					formData.append('csrf_token', $page.data.csrfToken);
				}

				const res = await fetch('/api/media/upload', {
					method: 'POST',
					body: formData
				});

				const data = await res.json();
				if (data.success && data.media) {
					// Auto-add uploaded image
					addImage(data.media);
				}
			}
			await loadMedia();
		} catch (err) {
			console.error('Upload failed:', err);
		}
		isUploading = false;
		input.value = '';
	}

	function addImage(item: MediaItem) {
		const isPrimary = localImages.length === 0;
		const newImage: ArtworkImage = {
			media_id: item.id,
			is_primary: isPrimary,
			order_index: localImages.length,
			media: item
		};
		localImages = [...localImages, newImage];
		notifyChange();
	}

	function removeImage(index: number) {
		const wasPrimary = localImages[index].is_primary;
		localImages = localImages.filter((_, i) => i !== index);

		// Reassign primary if needed
		if (wasPrimary && localImages.length > 0) {
			localImages[0].is_primary = true;
		}

		// Reindex
		localImages = localImages.map((img, i) => ({ ...img, order_index: i }));
		notifyChange();
	}

	function setPrimary(index: number) {
		localImages = localImages.map((img, i) => ({
			...img,
			is_primary: i === index
		}));
		notifyChange();
	}

	function selectMedia(item: MediaItem) {
		// Check if already added
		if (localImages.some(img => img.media_id === item.id)) {
			return;
		}
		addImage(item);
	}

	function notifyChange() {
		if (onchange) {
			onchange(localImages);
		}
	}

	function openModal() {
		isOpen = true;
		loadMedia();
	}

	function getThumbnailUrl(item: MediaItem): string {
		// Use medium (600px) for better quality in admin UI
		const thumb = item.thumbnails?.find((t) => t.size === 'medium')
			|| item.thumbnails?.find((t) => t.size === 'small');
		return thumb?.url || item.url;
	}

	function getImageUrl(img: ArtworkImage): string {
		if (img.media) {
			return getThumbnailUrl(img.media);
		}
		return '/images/placeholder.jpg';
	}

	// Drag and drop handlers
	function handleDragStart(e: DragEvent, index: number) {
		draggedIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		if (draggedIndex !== null && draggedIndex !== index) {
			dragOverIndex = index;
		}
	}

	function handleDragLeave() {
		dragOverIndex = null;
	}

	function handleDrop(e: DragEvent, index: number) {
		e.preventDefault();
		if (draggedIndex !== null && draggedIndex !== index) {
			const items = [...localImages];
			const [removed] = items.splice(draggedIndex, 1);
			items.splice(index, 0, removed);

			// Reindex
			localImages = items.map((img, i) => ({ ...img, order_index: i }));
			notifyChange();
		}
		draggedIndex = null;
		dragOverIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
		dragOverIndex = null;
	}

	// Check if media is already selected
	function isSelected(mediaId: number): boolean {
		return localImages.some(img => img.media_id === mediaId);
	}
</script>

<div class="multi-image-picker">
	<label class="picker-label">{label}</label>

	<div class="images-container">
		{#if localImages.length === 0}
			<div class="empty-state">
				<p>No images added</p>
				<button type="button" class="btn-add" onclick={openModal}>
					+ Add Images
				</button>
			</div>
		{:else}
			<div class="images-grid">
				{#each localImages as img, index}
					<div
						class="image-item"
						class:is-primary={img.is_primary}
						class:dragging={draggedIndex === index}
						class:drag-over={dragOverIndex === index}
						draggable="true"
						ondragstart={(e) => handleDragStart(e, index)}
						ondragover={(e) => handleDragOver(e, index)}
						ondragleave={handleDragLeave}
						ondrop={(e) => handleDrop(e, index)}
						ondragend={handleDragEnd}
						role="listitem"
					>
						<img src={getImageUrl(img)} alt="" />

						{#if img.is_primary}
							<span class="primary-badge">Primary</span>
						{/if}

						<div class="image-actions">
							{#if !img.is_primary}
								<button
									type="button"
									class="btn-set-primary"
									onclick={() => setPrimary(index)}
									title="Set as primary"
								>
									★
								</button>
							{/if}
							<button
								type="button"
								class="btn-remove"
								onclick={() => removeImage(index)}
								title="Remove"
							>
								×
							</button>
						</div>

						<span class="drag-handle" title="Drag to reorder">⋮⋮</span>
					</div>
				{/each}
			</div>

			<button type="button" class="btn-add-more" onclick={openModal}>
				+ Add More
			</button>
		{/if}
	</div>

	{#if isOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" onclick={() => (isOpen = false)}>
			<div class="modal-content" onclick={(e) => e.stopPropagation()}>
				<div class="modal-header">
					<h3>Select Images</h3>
					<div class="header-actions">
						<label class="upload-btn" class:uploading={isUploading}>
							{isUploading ? 'Uploading...' : 'Upload New'}
							<input
								type="file"
								accept="image/*"
								multiple
								onchange={handleUpload}
								disabled={isUploading}
								hidden
							/>
						</label>
						<button type="button" class="btn-close" onclick={() => (isOpen = false)}>×</button>
					</div>
				</div>

				<div class="modal-body">
					{#if isLoading}
						<div class="loading">Loading...</div>
					{:else if mediaItems.length === 0}
						<div class="empty">No images found. Upload some!</div>
					{:else}
						<div class="media-grid">
							{#each mediaItems as item}
								<button
									type="button"
									class="media-item"
									class:selected={isSelected(item.id)}
									onclick={() => selectMedia(item)}
									disabled={isSelected(item.id)}
								>
									<img src={getThumbnailUrl(item)} alt={item.alt_en || item.filename || ''} loading="lazy" />
									<span class="filename">{item.filename || 'Image'}</span>
									{#if isSelected(item.id)}
										<span class="selected-badge">✓</span>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<div class="modal-footer">
					<button type="button" class="btn-done" onclick={() => (isOpen = false)}>
						Done ({localImages.length} selected)
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.multi-image-picker {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.picker-label {
		font-weight: 500;
		color: var(--color-text, #333);
	}

	.images-container {
		border: 2px dashed var(--color-border, #ddd);
		border-radius: 8px;
		padding: 1rem;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: var(--color-text-secondary, #666);
	}

	.empty-state p {
		margin-bottom: 1rem;
	}

	.images-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.image-item {
		position: relative;
		aspect-ratio: 1;
		border: 2px solid var(--color-border, #ddd);
		border-radius: 8px;
		overflow: hidden;
		cursor: grab;
		transition: all 0.2s;
	}

	.image-item:active {
		cursor: grabbing;
	}

	.image-item.dragging {
		opacity: 0.5;
		transform: scale(0.95);
	}

	.image-item.drag-over {
		border-color: var(--color-primary, #333);
		border-style: dashed;
	}

	.image-item.is-primary {
		border-color: var(--color-accent, #d4af37);
		box-shadow: 0 0 0 2px var(--color-accent, #d4af37);
	}

	.image-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.primary-badge {
		position: absolute;
		top: 4px;
		left: 4px;
		background: var(--color-accent, #d4af37);
		color: white;
		font-size: 0.7rem;
		padding: 2px 6px;
		border-radius: 4px;
		font-weight: 600;
	}

	.image-actions {
		position: absolute;
		top: 4px;
		right: 4px;
		display: flex;
		gap: 4px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.image-item:hover .image-actions {
		opacity: 1;
	}

	.btn-set-primary,
	.btn-remove {
		width: 24px;
		height: 24px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-set-primary {
		background: var(--color-accent, #d4af37);
		color: white;
	}

	.btn-remove {
		background: #ef4444;
		color: white;
	}

	.drag-handle {
		position: absolute;
		bottom: 4px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.5);
		color: white;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 12px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.image-item:hover .drag-handle {
		opacity: 1;
	}

	.btn-add,
	.btn-add-more {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary, #333);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.btn-add:hover,
	.btn-add-more:hover {
		opacity: 0.9;
	}

	/* Modal styles */
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
		max-width: 900px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-border, #ddd);
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1.25rem;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.upload-btn {
		padding: 0.5rem 1rem;
		background: var(--color-primary, #333);
		color: white;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.upload-btn.uploading {
		opacity: 0.6;
		cursor: wait;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		line-height: 1;
	}

	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 1.5rem;
	}

	.modal-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--color-border, #ddd);
		display: flex;
		justify-content: flex-end;
	}

	.btn-done {
		padding: 0.75rem 1.5rem;
		background: var(--color-accent, #d4af37);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
	}

	.loading,
	.empty {
		text-align: center;
		padding: 3rem;
		color: var(--color-text-secondary, #666);
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 1rem;
	}

	.media-item {
		position: relative;
		aspect-ratio: 1;
		padding: 0;
		background: #f5f5f5;
		border: 2px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.media-item:hover:not(:disabled) {
		border-color: var(--color-primary, #333);
	}

	.media-item.selected {
		border-color: var(--color-accent, #d4af37);
		opacity: 0.7;
	}

	.media-item:disabled {
		cursor: not-allowed;
	}

	.media-item img {
		flex: 1;
		width: 100%;
		object-fit: cover;
	}

	.media-item .filename {
		font-size: 0.75rem;
		padding: 0.25rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		background: white;
	}

	.selected-badge {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--color-accent, #d4af37);
		color: white;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		font-weight: bold;
	}
</style>
