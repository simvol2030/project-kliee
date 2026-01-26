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

	interface Props {
		selected?: number | null;
		value?: MediaItem | null;
		folder?: string;
		label?: string;
		onselect?: (e: CustomEvent<{ id: number; url: string }>) => void;
		onclear?: () => void;
	}

	let {
		selected = null,
		value = null,
		folder = 'uploads',
		label = 'Select Image',
		onselect,
		onclear
	}: Props = $props();

	let mediaItems = $state<MediaItem[]>([]);
	let isOpen = $state(false);
	let isLoading = $state(false);
	let isUploading = $state(false);

	// Use value prop if provided, otherwise find selected from id
	let selectedItem = $derived(value || null);

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
		const file = input.files?.[0];
		if (!file) return;

		isUploading = true;
		try {
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
			if (data.success) {
				await loadMedia();
				if (onselect) {
					onselect(new CustomEvent('select', { detail: { id: data.media.id, url: data.media.url } }));
				}
				isOpen = false;
			}
		} catch (err) {
			console.error('Upload failed:', err);
		}
		isUploading = false;
		input.value = '';
	}

	function selectMedia(item: MediaItem) {
		if (onselect) {
			onselect(new CustomEvent('select', { detail: { id: item.id, url: item.url } }));
		}
		isOpen = false;
	}

	function clearSelection() {
		if (onclear) {
			onclear();
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
</script>

<div class="media-picker">
	<label class="picker-label">{label}</label>

	<div class="picker-preview">
		{#if selectedItem}
			<div class="selected-preview">
				<img src={selectedItem.url} alt={selectedItem.alt_en || selectedItem.filename || ''} />
				<div class="preview-actions">
					<button type="button" class="btn-change" onclick={openModal}>Change</button>
					<button type="button" class="btn-clear" onclick={clearSelection}>Clear</button>
				</div>
			</div>
		{:else}
			<button type="button" class="btn-select" onclick={openModal}>
				<span class="icon">+</span>
				<span>Select Image</span>
			</button>
		{/if}
	</div>

	{#if isOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" onclick={() => (isOpen = false)}>
			<div class="modal-content" onclick={(e) => e.stopPropagation()}>
				<div class="modal-header">
					<h3>Media Library</h3>
					<div class="header-actions">
						<label class="upload-btn" class:uploading={isUploading}>
							{isUploading ? 'Uploading...' : 'Upload New'}
							<input type="file" accept="image/*" onchange={handleUpload} disabled={isUploading} hidden />
						</label>
						<button type="button" class="btn-close" onclick={() => (isOpen = false)}>×</button>
					</div>
				</div>

				<div class="modal-body">
					{#if isLoading}
						<div class="loading">Loading...</div>
					{:else if mediaItems.length === 0}
						<div class="empty">No images found. Upload one!</div>
					{:else}
						<div class="media-grid">
							{#each mediaItems as item}
								<button
									type="button"
									class="media-item"
									class:selected={value?.id === item.id}
									onclick={() => selectMedia(item)}
								>
									<img src={getThumbnailUrl(item)} alt={item.alt_en || item.filename || ''} loading="lazy" />
									<span class="filename">{item.filename || 'Image'}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.media-picker {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.picker-label {
		font-weight: 500;
		color: var(--color-text, #333);
	}

	.picker-preview {
		border: 2px dashed var(--color-border, #ddd);
		border-radius: 8px;
		padding: 1rem;
		text-align: center;
	}

	.selected-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.selected-preview img {
		max-width: 200px;
		max-height: 150px;
		object-fit: cover;
		border-radius: 4px;
	}

	.preview-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-select {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 2rem;
		background: none;
		border: none;
		color: var(--color-text-secondary, #666);
		cursor: pointer;
		width: 100%;
	}

	.btn-select:hover {
		color: var(--color-primary, #333);
	}

	.btn-select .icon {
		font-size: 2rem;
		line-height: 1;
	}

	.btn-change,
	.btn-clear {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.btn-change:hover {
		background: var(--color-primary, #333);
		color: white;
		border-color: var(--color-primary, #333);
	}

	.btn-clear:hover {
		background: #fee;
		border-color: #f88;
	}

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
		max-width: 800px;
		max-height: 80vh;
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

	.media-item:hover {
		border-color: var(--color-primary, #333);
	}

	.media-item.selected {
		border-color: var(--color-accent, #d4af37);
		box-shadow: 0 0 0 2px var(--color-accent, #d4af37);
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

	.picker-label:empty {
		display: none;
	}
</style>
