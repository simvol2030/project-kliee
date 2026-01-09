<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import MultilingualInput from '$lib/components/admin/MultilingualInput.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Multilingual fields
	let title = $state({
		en: data.item?.title_en || '',
		ru: data.item?.title_ru || '',
		es: data.item?.title_es || '',
		zh: data.item?.title_zh || ''
	});

	let description = $state({
		en: data.item?.description_en || '',
		ru: data.item?.description_ru || '',
		es: data.item?.description_es || '',
		zh: data.item?.description_zh || ''
	});

	let venue = $state({
		en: data.item?.venue_en || '',
		ru: data.item?.venue_ru || '',
		es: data.item?.venue_es || '',
		zh: data.item?.venue_zh || ''
	});

	// Single-language fields
	let city = $state(data.item?.city || '');
	let country = $state(data.item?.country || '');
	let address = $state(data.item?.address || '');
	let startDate = $state(data.item?.start_date?.split('T')[0] || '');
	let endDate = $state(data.item?.end_date?.split('T')[0] || '');
	let openingHours = $state(data.item?.opening_hours || '');
	let galleryLink = $state(data.item?.gallery_link || '');
	let coverImageId = $state<number | null>(data.item?.cover_image_id || null);

	// New fields
	let type = $state(data.item?.type || 'solo');
	let year = $state(data.item?.year?.toString() || new Date().getFullYear().toString());
	let slug = $state(data.item?.slug || '');
	let isCurrent = $state(data.item?.is_current || false);
	let isFeatured = $state(data.item?.is_featured || false);
	let isVisible = $state(data.item?.is_visible !== false);
	let orderIndex = $state(data.item?.order_index?.toString() || '0');

	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');
	let saving = $state(false);

	// Gallery images management
	let galleryImages = $state(data.galleryImages || []);
	let showMediaPicker = $state(false);

	// Cover image picker
	let showCoverPicker = $state(false);
	let coverImageRemoved = $state(false);
	let imageMedia = $derived(data.allMedia.filter((m: { mime_type?: string }) => m.mime_type?.startsWith('image/')));
	let selectedCoverImage = $derived(imageMedia.find((m: { id: number }) => m.id === coverImageId));

	function selectCoverImage(id: number) {
		coverImageId = id;
		coverImageRemoved = false;
		showCoverPicker = false;
	}

	function removeCoverImage() {
		coverImageId = null;
		coverImageRemoved = true;
	}

	function getMediaUrl(item: { folder?: string | null; stored_filename?: string; url?: string | null }): string {
		// Use pre-computed URL if available
		if (item.url) return item.url;
		// Fallback: compute URL (handles /images/ paths)
		const filename = item.stored_filename || '';
		if (filename.startsWith('/images/')) return filename;
		if (filename.startsWith('/')) return `/uploads${filename}`;
		if (filename.includes('/')) return `/uploads/${filename}`;
		return `/uploads/${item.folder || 'uploads'}/${filename}`;
	}

	const exhibitionTypes = [
		{ value: 'solo', label: 'Solo Exhibition' },
		{ value: 'group', label: 'Group Exhibition' },
		{ value: 'fair', label: 'Art Fair' },
		{ value: 'biennale', label: 'Biennale' },
		{ value: 'other', label: 'Other' }
	];

	function generateSlug() {
		if (title.en) {
			slug = title.en
				.toLowerCase()
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim();
		}
	}

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
</script>

<svelte:head>
	<title>{data.isNew ? 'New Exhibition' : `Edit: ${title.en}`} | Admin</title>
</svelte:head>

<div class="page-header">
	<div class="breadcrumb">
		<a href="/exhibitions">Exhibitions</a>
		<span>/</span>
		<span>{data.isNew ? 'New' : title.en || 'Edit'}</span>
	</div>
	<h1>{data.isNew ? 'Create New Exhibition' : 'Edit Exhibition'}</h1>
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

			<MultilingualInput label="Title" values={title} required placeholder="Exhibition title" />
			<input type="hidden" name="titleEn" value={title.en} />
			<input type="hidden" name="titleRu" value={title.ru} />
			<input type="hidden" name="titleEs" value={title.es} />
			<input type="hidden" name="titleZh" value={title.zh} />

			<div class="form-row">
				<div class="form-field">
					<label for="type">Type</label>
					<select id="type" name="type" bind:value={type}>
						{#each exhibitionTypes as t}
							<option value={t.value}>{t.label}</option>
						{/each}
					</select>
				</div>

				<div class="form-field">
					<label for="year">Year</label>
					<input type="number" id="year" name="year" bind:value={year} min="1900" max="2100" />
				</div>
			</div>

			<div class="form-field">
				<label for="slug">Slug</label>
				<div class="slug-input">
					<input type="text" id="slug" name="slug" bind:value={slug} placeholder="exhibition-slug" />
					<button type="button" class="btn-generate" onclick={generateSlug}>Generate</button>
				</div>
			</div>

			<div class="form-row">
				<div class="form-field">
					<label for="startDate">Start Date</label>
					<input type="date" id="startDate" name="startDate" bind:value={startDate} />
				</div>

				<div class="form-field">
					<label for="endDate">End Date</label>
					<input type="date" id="endDate" name="endDate" bind:value={endDate} />
				</div>
			</div>

			<div class="checkbox-group">
				<label class="checkbox-field">
					<input type="checkbox" name="isCurrent" bind:checked={isCurrent} />
					<span>Current / Upcoming</span>
				</label>

				<label class="checkbox-field">
					<input type="checkbox" name="isFeatured" bind:checked={isFeatured} />
					<span>Featured</span>
				</label>

				<label class="checkbox-field">
					<input type="checkbox" name="isVisible" bind:checked={isVisible} />
					<span>Visible</span>
				</label>
			</div>
		</div>

		<div class="form-section">
			<h2>Venue & Location</h2>

			<MultilingualInput label="Venue" values={venue} placeholder="Gallery or museum name" />
			<input type="hidden" name="venueEn" value={venue.en} />
			<input type="hidden" name="venueRu" value={venue.ru} />
			<input type="hidden" name="venueEs" value={venue.es} />
			<input type="hidden" name="venueZh" value={venue.zh} />

			<div class="form-row">
				<div class="form-field">
					<label for="city">City</label>
					<input type="text" id="city" name="city" bind:value={city} placeholder="City" />
				</div>

				<div class="form-field">
					<label for="country">Country</label>
					<input type="text" id="country" name="country" bind:value={country} placeholder="Country" />
				</div>
			</div>

			<div class="form-field">
				<label for="address">Address</label>
				<input type="text" id="address" name="address" bind:value={address} placeholder="Full address" />
			</div>

			<div class="form-field">
				<label for="openingHours">Opening Hours</label>
				<input type="text" id="openingHours" name="openingHours" bind:value={openingHours} placeholder="e.g., Tue-Sun 10:00-18:00" />
			</div>
		</div>

		<div class="form-section full-width">
			<h2>Description</h2>

			<MultilingualInput label="Description" values={description} placeholder="Exhibition description" multiline />
			<input type="hidden" name="descriptionEn" value={description.en} />
			<input type="hidden" name="descriptionRu" value={description.ru} />
			<input type="hidden" name="descriptionEs" value={description.es} />
			<input type="hidden" name="descriptionZh" value={description.zh} />
		</div>

		<div class="form-section full-width">
			<h2>Media & Links</h2>

			<div class="form-row">
				<div class="form-field cover-image-field">
					<label>Cover Image</label>
					<input type="hidden" name="coverImageId" value={coverImageId || ''} />
					{#if selectedCoverImage}
						<div class="cover-preview">
							<img src={getMediaUrl(selectedCoverImage)} alt="Cover" />
							<div class="cover-actions">
								<button type="button" class="btn-change" onclick={() => (showCoverPicker = true)}>Change</button>
								<button type="button" class="btn-remove" onclick={removeCoverImage}>Remove</button>
							</div>
						</div>
					{:else if !coverImageRemoved && data.item?.cover_image_id}
						<div class="cover-preview">
							<img src="/uploads/exhibitions/{data.item.cover_image_id}" alt="Cover" />
							<div class="cover-actions">
								<button type="button" class="btn-change" onclick={() => (showCoverPicker = true)}>Change</button>
								<button type="button" class="btn-remove" onclick={removeCoverImage}>Remove</button>
							</div>
						</div>
					{:else}
						<button type="button" class="btn-select-cover" onclick={() => (showCoverPicker = true)}>
							Select Cover Image
						</button>
					{/if}
				</div>

				<div class="form-field">
					<label for="galleryLink">Gallery Link</label>
					<input type="url" id="galleryLink" name="galleryLink" bind:value={galleryLink} placeholder="https://..." />
				</div>

				<div class="form-field">
					<label for="orderIndex">Order Index</label>
					<input type="number" id="orderIndex" name="orderIndex" bind:value={orderIndex} min="0" />
				</div>
			</div>
		</div>

		<!-- Gallery Images Section -->
		{#if !data.isNew}
			<div class="form-section full-width">
				<h2>Gallery Images ({galleryImages.length})</h2>

				{#if galleryImages.length > 0}
					<div class="gallery-grid">
						{#each galleryImages as image, index (image.id)}
							<div class="gallery-item">
								{#if image.url}
									<img src={image.url} alt="Gallery image {index + 1}" />
								{:else}
									<div class="placeholder">No image</div>
								{/if}
								<form method="POST" action="?/removeImage" use:enhance>
									<input type="hidden" name="image_id" value={image.id} />
									<button type="submit" class="btn-remove" aria-label="Remove image">×</button>
								</form>
							</div>
						{/each}
					</div>
				{:else}
					<p class="no-images">No gallery images yet</p>
				{/if}

				<div class="add-image-section">
					<button type="button" class="btn-add" onclick={() => (showMediaPicker = !showMediaPicker)}>
						{showMediaPicker ? 'Hide Media' : '+ Add Image'}
					</button>

					{#if showMediaPicker}
						<div class="media-picker">
							{#each data.allMedia as mediaItem}
								<form method="POST" action="?/addImage" use:enhance>
									<input type="hidden" name="media_id" value={mediaItem.id} />
									<button type="submit" class="media-item">
										<img
											src="/uploads/{mediaItem.folder || 'uploads'}/{mediaItem.stored_filename}"
											alt={mediaItem.filename}
										/>
									</button>
								</form>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<div class="form-actions">
		<a href="/exhibitions" class="btn-cancel">Cancel</a>
		<button type="submit" class="btn-save" disabled={saving}>
			{saving ? 'Saving...' : data.isNew ? 'Create Exhibition' : 'Save Changes'}
		</button>
	</div>
</form>

<Toast bind:visible={toastVisible} message={toastMessage} type={toastType} />

<!-- Cover Image Picker Modal -->
{#if showCoverPicker}
	<div class="modal-overlay" onclick={() => (showCoverPicker = false)} role="button" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showCoverPicker = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h3>Select Cover Image</h3>
				<button type="button" class="btn-modal-close" onclick={() => (showCoverPicker = false)}>&times;</button>
			</div>
			<div class="cover-picker-grid">
				{#each imageMedia as item}
					<button
						type="button"
						class="cover-picker-item"
						class:selected={coverImageId === item.id}
						onclick={() => selectCoverImage(item.id)}
					>
						<img src={getMediaUrl(item)} alt={item.filename || 'Media'} />
					</button>
				{/each}
				{#if imageMedia.length === 0}
					<p class="no-media-msg">No images available. Upload images in Media section first.</p>
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

	.form-section.full-width {
		grid-column: 1 / -1;
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

	.form-field input[type='text'],
	.form-field input[type='url'],
	.form-field input[type='date'],
	.form-field input[type='number'],
	.form-field select {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.form-field input:focus,
	.form-field select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.slug-input {
		display: flex;
		gap: 0.5rem;
	}

	.slug-input input {
		flex: 1;
	}

	.btn-generate {
		padding: 0.625rem 1rem;
		background: #e5e7eb;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		cursor: pointer;
	}

	.btn-generate:hover {
		background: #d1d5db;
	}

	.checkbox-group {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.checkbox-field {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-field input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		accent-color: #6366f1;
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

	/* Gallery images */
	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.gallery-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 0.375rem;
		overflow: hidden;
		background: #f3f4f6;
	}

	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.gallery-item .btn-remove {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: rgba(220, 38, 38, 0.9);
		color: white;
		border: none;
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.no-images {
		color: #9ca3af;
		font-size: 0.875rem;
	}

	.btn-add {
		padding: 0.5rem 1rem;
		background: #e5e7eb;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.btn-add:hover {
		background: #d1d5db;
	}

	.media-picker {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: 0.5rem;
		margin-top: 1rem;
		max-height: 300px;
		overflow-y: auto;
		padding: 0.5rem;
		background: #f9fafb;
		border-radius: 0.375rem;
	}

	.media-item {
		aspect-ratio: 1;
		border: none;
		padding: 0;
		cursor: pointer;
		border-radius: 0.25rem;
		overflow: hidden;
	}

	.media-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.media-item:hover {
		opacity: 0.8;
	}

	@media (max-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.checkbox-group {
			flex-direction: column;
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
	:global(.dark) .form-field input,
	:global(.dark) .form-field select {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}
	:global(.dark) .form-field input::placeholder { color: #9ca3af; }
	:global(.dark) .form-field input:focus,
	:global(.dark) .form-field select:focus {
		border-color: #818cf8;
		box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.1);
	}

	:global(.dark) .btn-generate,
	:global(.dark) .btn-add {
		background: #374151;
		color: #e5e7eb;
	}
	:global(.dark) .btn-generate:hover,
	:global(.dark) .btn-add:hover {
		background: #4b5563;
	}

	:global(.dark) .checkbox-field { color: #e5e7eb; }

	:global(.dark) .form-actions { border-color: #374151; }
	:global(.dark) .btn-cancel {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}
	:global(.dark) .btn-cancel:hover { background: #4b5563; }

	:global(.dark) .gallery-item { background: #374151; }
	:global(.dark) .no-images { color: #6b7280; }
	:global(.dark) .media-picker { background: #374151; }

	/* Cover Image Picker Styles */
	.cover-image-field {
		flex: 2;
	}

	.cover-preview {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 200px;
	}

	.cover-preview img {
		width: 100%;
		height: auto;
		border-radius: 0.375rem;
		border: 1px solid #e5e7eb;
	}

	.cover-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-change,
	.btn-remove {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.btn-change {
		background: #f3f4f6;
		color: #374151;
	}

	.btn-change:hover {
		background: #e5e7eb;
	}

	.btn-remove {
		background: #fef2f2;
		color: #dc2626;
		border-color: #fecaca;
	}

	.btn-remove:hover {
		background: #fee2e2;
	}

	.btn-select-cover {
		padding: 1.5rem 2rem;
		background: #f9fafb;
		border: 2px dashed #d1d5db;
		border-radius: 0.5rem;
		color: #6b7280;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.btn-select-cover:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	/* Cover Picker Modal */
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

	.btn-modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
	}

	.btn-modal-close:hover {
		color: #374151;
	}

	.cover-picker-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.75rem;
		padding: 1rem;
		overflow-y: auto;
		max-height: 60vh;
	}

	.cover-picker-item {
		aspect-ratio: 1;
		border: 2px solid #e5e7eb;
		border-radius: 0.375rem;
		overflow: hidden;
		cursor: pointer;
		padding: 0;
		background: #f9fafb;
	}

	.cover-picker-item:hover {
		border-color: #6366f1;
	}

	.cover-picker-item.selected {
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
	}

	.cover-picker-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.no-media-msg {
		grid-column: 1 / -1;
		text-align: center;
		color: #6b7280;
		padding: 2rem;
	}

	/* Dark theme for cover picker */
	:global(.dark) .cover-preview img {
		border-color: #4b5563;
	}

	:global(.dark) .btn-change {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}

	:global(.dark) .btn-change:hover {
		background: #4b5563;
	}

	:global(.dark) .btn-remove {
		background: #7f1d1d;
		border-color: #991b1b;
		color: #fecaca;
	}

	:global(.dark) .btn-select-cover {
		background: #1f2937;
		border-color: #4b5563;
		color: #9ca3af;
	}

	:global(.dark) .btn-select-cover:hover {
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

	:global(.dark) .btn-modal-close {
		color: #9ca3af;
	}

	:global(.dark) .btn-modal-close:hover {
		color: #f9fafb;
	}

	:global(.dark) .cover-picker-item {
		border-color: #4b5563;
		background: #374151;
	}

	:global(.dark) .cover-picker-item:hover {
		border-color: #818cf8;
	}

	:global(.dark) .cover-picker-item.selected {
		border-color: #818cf8;
		box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.3);
	}
</style>
