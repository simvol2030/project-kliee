<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import MultilingualInput from '$lib/components/admin/MultilingualInput.svelte';
	import MultilingualTextarea from '$lib/components/admin/MultilingualTextarea.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let name = $state({
		en: data.item?.name_en || '',
		ru: data.item?.name_ru || '',
		es: data.item?.name_es || '',
		zh: data.item?.name_zh || ''
	});

	let description = $state({
		en: data.item?.description_en || '',
		ru: data.item?.description_ru || '',
		es: data.item?.description_es || '',
		zh: data.item?.description_zh || ''
	});

	let slug = $state(data.item?.slug || '');
	let coverImageId = $state<number | null>(data.item?.cover_image_id || null);
	let orderIndex = $state(data.item?.order_index?.toString() || '0');
	let isVisible = $state(data.item?.is_visible ?? true);
	let isFeatured = $state(data.item?.is_featured ?? false);
	let showInShop = $state(data.item?.show_in_shop ?? false);

	// Media picker state
	let showMediaPicker = $state(false);

	// Selected image from media
	let selectedImage = $derived(data.allMedia?.find((m) => m.id === coverImageId));

	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');
	let saving = $state(false);

	$effect(() => {
		if (form?.success) {
			toastMessage = form.message || 'Saved successfully';
			toastType = 'success';
			toastVisible = true;
		} else if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
			toastVisible = true;
		}
	});

	function generateSlug() {
		if (name.en && !slug) {
			slug = name.en
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');
		}
	}

	function selectImage(id: number) {
		coverImageId = id;
		showMediaPicker = false;
	}
</script>

<svelte:head>
	<title>{data.isNew ? 'New Series' : `Edit: ${name.en}`} | Admin</title>
</svelte:head>

<div class="page-header">
	<div class="breadcrumb">
		<a href="/series">Series</a>
		<span>/</span>
		<span>{data.isNew ? 'New' : name.en || 'Edit'}</span>
	</div>
	<h1>{data.isNew ? 'Create New Series' : 'Edit Series'}</h1>
</div>

<form
	method="POST"
	action="?/save"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			await update();
			saving = false;
		};
	}}
>
	<CsrfToken />

	<div class="form-grid">
		<div class="form-section">
			<h2>Basic Information</h2>

			<MultilingualInput label="Name" values={name} required placeholder="Series name" />
			<input type="hidden" name="name_en" value={name.en} />
			<input type="hidden" name="name_ru" value={name.ru} />
			<input type="hidden" name="name_es" value={name.es} />
			<input type="hidden" name="name_zh" value={name.zh} />

			<div class="form-row">
				<div class="form-field">
					<label for="slug">Slug</label>
					<input type="text" id="slug" name="slug" bind:value={slug} placeholder="series-slug" required />
					<button type="button" class="btn-generate" onclick={generateSlug}>Generate from name</button>
				</div>

				<div class="form-field">
					<label for="order_index">Display Order</label>
					<input type="number" id="order_index" name="order_index" bind:value={orderIndex} min="0" />
				</div>
			</div>

			<div class="form-field">
				<label>Cover Image</label>
				<input type="hidden" name="cover_image_id" value={coverImageId || ''} />
				{#if selectedImage}
					<div class="image-preview">
						<img src={selectedImage.url} alt="Cover" />
						<div class="image-actions">
							<button type="button" class="btn-secondary" onclick={() => (showMediaPicker = true)}>Change</button>
							<button type="button" class="btn-secondary" onclick={() => (coverImageId = null)}>Remove</button>
						</div>
					</div>
				{:else if data.item?.coverImageUrl}
					<div class="image-preview">
						<img src={data.item.coverImageUrl} alt="Cover" />
						<button type="button" class="btn-secondary" onclick={() => (showMediaPicker = true)}>Change</button>
					</div>
				{:else}
					<button type="button" class="btn-media-select" onclick={() => (showMediaPicker = true)}>
						Select Cover Image
					</button>
				{/if}
			</div>
		</div>

		<div class="form-section">
			<h2>Description</h2>
			<MultilingualTextarea label="Description" values={description} placeholder="Series description" rows={6} />
			<input type="hidden" name="description_en" value={description.en} />
			<input type="hidden" name="description_ru" value={description.ru} />
			<input type="hidden" name="description_es" value={description.es} />
			<input type="hidden" name="description_zh" value={description.zh} />

			<div class="visibility-section">
				<h3>Visibility & Shop</h3>
				<div class="checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" name="is_visible" bind:checked={isVisible} />
						<span>Visible on website</span>
					</label>
					<label class="checkbox-label">
						<input type="checkbox" name="is_featured" bind:checked={isFeatured} />
						<span>Featured series</span>
					</label>
					<label class="checkbox-label highlight">
						<input type="checkbox" name="show_in_shop" bind:checked={showInShop} />
						<span>Show as Shop Category</span>
						<small>Display in shop filter/navigation</small>
					</label>
				</div>
			</div>
		</div>
	</div>

	<div class="form-actions">
		<a href="/series" class="btn-cancel">Cancel</a>
		<button type="submit" class="btn-save" disabled={saving}>
			{saving ? 'Saving...' : data.isNew ? 'Create Series' : 'Save Changes'}
		</button>
	</div>
</form>

<Toast bind:visible={toastVisible} message={toastMessage} type={toastType} />

<!-- Media Picker Modal -->
{#if showMediaPicker}
	<div class="modal-overlay" onclick={() => (showMediaPicker = false)} role="button" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showMediaPicker = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h3>Select Cover Image</h3>
				<button type="button" class="btn-close" onclick={() => (showMediaPicker = false)}>&times;</button>
			</div>
			<div class="media-grid">
				{#each data.allMedia || [] as item}
					<button
						type="button"
						class="media-item"
						class:selected={coverImageId === item.id}
						onclick={() => selectImage(item.id)}
					>
						<img src={item.url} alt={item.filename || 'Media'} />
					</button>
				{/each}
				{#if !data.allMedia || data.allMedia.length === 0}
					<p class="no-media">No images available. Upload images in Media section first.</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.page-header {
		margin-bottom: 2rem;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 0.5rem;
	}

	.breadcrumb a {
		color: #6366f1;
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.form-section {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}

	.form-section h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-field {
		margin-bottom: 1rem;
	}

	.form-field label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.form-field input {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.form-field input:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.btn-generate {
		margin-top: 0.5rem;
		padding: 0.375rem 0.75rem;
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		color: #6b7280;
		cursor: pointer;
	}

	.btn-generate:hover {
		background: #e5e7eb;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.btn-cancel {
		padding: 0.625rem 1.25rem;
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		color: #374151;
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
	}

	.btn-cancel:hover {
		background: #f9fafb;
	}

	.btn-save {
		padding: 0.625rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 0.5rem;
		color: #fff;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
	}

	.btn-save:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-save:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.visibility-section {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.visibility-section h3 {
		margin: 0 0 1rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.checkbox-label {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.875rem;
		color: #374151;
	}

	.checkbox-label input[type='checkbox'] {
		width: auto;
		margin-top: 0.125rem;
	}

	.checkbox-label span {
		font-weight: 500;
	}

	.checkbox-label small {
		display: block;
		font-size: 0.75rem;
		color: #6b7280;
		font-weight: 400;
		margin-top: 0.125rem;
	}

	.checkbox-label.highlight {
		padding: 0.75rem;
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-radius: 0.375rem;
	}

	@media (max-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.form-row {
			grid-template-columns: 1fr;
		}
	}

	/* Dark theme support */
	:global(.dark) h1 { color: #f9fafb; }
	:global(.dark) .breadcrumb { color: #9ca3af; }
	:global(.dark) .breadcrumb a { color: #818cf8; }

	:global(.dark) .form-section {
		background: #1f2937;
		border-color: #374151;
	}
	:global(.dark) .form-section h2 {
		color: #e5e7eb;
		border-color: #374151;
	}
	:global(.dark) .form-field label { color: #e5e7eb; }
	:global(.dark) .form-field input {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}
	:global(.dark) .form-field input::placeholder { color: #9ca3af; }
	:global(.dark) .form-field input:focus {
		border-color: #818cf8;
		box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.1);
	}

	:global(.dark) .btn-generate {
		background: #374151;
		border-color: #4b5563;
		color: #9ca3af;
	}
	:global(.dark) .btn-generate:hover { background: #4b5563; }

	:global(.dark) .form-actions { border-color: #374151; }
	:global(.dark) .btn-cancel {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}
	:global(.dark) .btn-cancel:hover {
		background: #4b5563;
	}

	:global(.dark) .visibility-section { border-color: #374151; }
	:global(.dark) .visibility-section h3 { color: #e5e7eb; }
	:global(.dark) .checkbox-label { color: #e5e7eb; }
	:global(.dark) .checkbox-label small { color: #9ca3af; }
	:global(.dark) .checkbox-label.highlight {
		background: #064e3b;
		border-color: #059669;
	}

	/* Image preview styles */
	.image-preview {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 200px;
	}

	.image-preview img {
		width: 100%;
		border-radius: 0.375rem;
		border: 1px solid #e5e7eb;
	}

	.image-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-secondary {
		padding: 0.375rem 0.75rem;
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		color: #374151;
		cursor: pointer;
	}

	.btn-secondary:hover {
		background: #e5e7eb;
	}

	.btn-media-select {
		padding: 2rem;
		background: #f9fafb;
		border: 2px dashed #d1d5db;
		border-radius: 0.5rem;
		color: #6b7280;
		cursor: pointer;
		width: 100%;
		font-size: 0.875rem;
	}

	.btn-media-select:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	/* Modal styles */
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

	.modal-content {
		background: white;
		border-radius: 0.5rem;
		width: 100%;
		max-width: 700px;
		max-height: 80vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
	}

	.btn-close:hover {
		color: #374151;
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.75rem;
		padding: 1rem;
		overflow-y: auto;
		max-height: 60vh;
	}

	.media-item {
		aspect-ratio: 1;
		border: 2px solid #e5e7eb;
		border-radius: 0.375rem;
		overflow: hidden;
		cursor: pointer;
		padding: 0;
		background: #f9fafb;
	}

	.media-item:hover {
		border-color: #6366f1;
	}

	.media-item.selected {
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
	}

	.media-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.no-media {
		grid-column: 1 / -1;
		text-align: center;
		color: #6b7280;
		padding: 2rem;
	}

	/* Dark theme for new elements */
	:global(.dark) .image-preview img {
		border-color: #4b5563;
	}

	:global(.dark) .btn-secondary {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}

	:global(.dark) .btn-secondary:hover {
		background: #4b5563;
	}

	:global(.dark) .btn-media-select {
		background: #1f2937;
		border-color: #4b5563;
		color: #9ca3af;
	}

	:global(.dark) .btn-media-select:hover {
		background: #374151;
		border-color: #6b7280;
	}

	:global(.dark) .modal-content {
		background: #1f2937;
	}

	:global(.dark) .modal-header {
		border-color: #374151;
	}

	:global(.dark) .modal-header h3 {
		color: #f9fafb;
	}

	:global(.dark) .btn-close {
		color: #9ca3af;
	}

	:global(.dark) .btn-close:hover {
		color: #f9fafb;
	}

	:global(.dark) .media-item {
		border-color: #4b5563;
		background: #374151;
	}

	:global(.dark) .media-item:hover {
		border-color: #818cf8;
	}

	:global(.dark) .media-item.selected {
		border-color: #818cf8;
		box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.3);
	}
</style>
