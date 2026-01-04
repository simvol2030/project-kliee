<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import MultilingualInput from '$lib/components/admin/MultilingualInput.svelte';
	import MultiImagePicker from '$lib/components/admin/MultiImagePicker.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import ValidationErrors from '$lib/components/admin/ValidationErrors.svelte';
	import SeoPanel from '$lib/components/admin/SeoPanel.svelte';
	import CsrfToken from '$lib/components/CsrfToken.svelte';
	import AutoSaveIndicator from '$lib/components/admin/AutoSaveIndicator.svelte';
	import { deleteDraft } from '$lib/stores/drafts';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Validation errors from server
	// Type assertion to handle errors field from Zod validation
	type FormWithErrors = ActionData & { errors?: Record<string, string> };
	let formData = $derived(form as FormWithErrors);
	let validationErrors = $derived(formData?.errors || {});

	// Form state - using snake_case to match DB schema
	let title = $state({
		en: data.artwork?.title_en || '',
		ru: data.artwork?.title_ru || '',
		es: data.artwork?.title_es || '',
		zh: data.artwork?.title_zh || ''
	});

	let technique = $state(data.artwork?.technique || '');
	let seriesId = $state(data.artwork?.series_id?.toString() || '');
	let year = $state(data.artwork?.year?.toString() || '');
	let dimensions = $state(data.artwork?.dimensions || '');
	let price = $state(data.artwork?.price?.toString() || '');
	let currency = $state(data.artwork?.currency || 'EUR');
	let isForSale = $state(data.artwork?.is_for_sale ?? true);

	// SEO state
	let seoTitle = $state({
		en: data.artwork?.seo_title_en || '',
		ru: data.artwork?.seo_title_ru || '',
		es: data.artwork?.seo_title_es || '',
		zh: data.artwork?.seo_title_zh || ''
	});
	let seoDescription = $state({
		en: data.artwork?.seo_description_en || '',
		ru: data.artwork?.seo_description_ru || '',
		es: data.artwork?.seo_description_es || '',
		zh: data.artwork?.seo_description_zh || ''
	});

	// Images state
	interface ArtworkImage {
		id?: number;
		media_id: number;
		is_primary: boolean;
		order_index: number;
		media?: {
			id: number;
			filename?: string;
			stored_filename?: string;
			folder?: string;
			url: string;
			alt_en?: string | null;
		};
	}

	let artworkImages = $state<ArtworkImage[]>(
		(data.images || []).map((img: any) => ({
			id: img.id,
			media_id: img.media_id,
			is_primary: img.is_primary,
			order_index: img.order_index,
			media: img.media
		}))
	);

	// Hidden input for images JSON
	let imagesJson = $derived(JSON.stringify(artworkImages.map(img => ({
		media_id: img.media_id,
		is_primary: img.is_primary,
		order_index: img.order_index
	}))));

	// Toast
	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');

	let saving = $state(false);

	// Auto-save configuration
	const entityId = data.artwork?.id || 'new';
	let autoSaveRef: AutoSaveIndicator;

	// Get current form data for auto-save
	function getFormData() {
		return {
			title,
			technique,
			seriesId,
			year,
			dimensions,
			price,
			currency,
			isForSale,
			seoTitle,
			seoDescription,
			artworkImages: artworkImages.map(img => ({
				media_id: img.media_id,
				is_primary: img.is_primary,
				order_index: img.order_index
			}))
		};
	}

	// Show toast notification
	function showToast(message: string, type: 'success' | 'error') {
		toastMessage = message;
		toastType = type;
		toastVisible = true;
	}

	// Restore draft data
	function restoreDraft(draftData: Record<string, unknown>) {
		const d = draftData as ReturnType<typeof getFormData>;
		if (d.title) title = d.title;
		if (d.technique !== undefined) technique = d.technique;
		if (d.seriesId !== undefined) seriesId = d.seriesId;
		if (d.year !== undefined) year = d.year;
		if (d.dimensions !== undefined) dimensions = d.dimensions;
		if (d.price !== undefined) price = d.price;
		if (d.currency) currency = d.currency;
		if (d.isForSale !== undefined) isForSale = d.isForSale;
		if (d.seoTitle) seoTitle = d.seoTitle;
		if (d.seoDescription) seoDescription = d.seoDescription;
		// Note: Images restoration requires more complex handling
		showToast('Draft restored', 'success');
	}

	$effect(() => {
		if (form?.success) {
			toastMessage = form.message || 'Saved successfully';
			toastType = 'success';
			toastVisible = true;
			// Clear draft on successful save
			deleteDraft('artworks', entityId);
		} else if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
			toastVisible = true;
		}
	});

	function handleImagesChange(images: ArtworkImage[]) {
		artworkImages = images;
	}
</script>

<svelte:head>
	<title>{data.isNew ? 'New Artwork' : `Edit: ${title.en}`} | Admin</title>
</svelte:head>

<div class="page-header">
	<div class="breadcrumb">
		<a href="/artworks">Artworks</a>
		<span>/</span>
		<span>{data.isNew ? 'New' : title.en || 'Edit'}</span>
	</div>
	<div class="header-row">
		<h1>{data.isNew ? 'Create New Artwork' : 'Edit Artwork'}</h1>
		<AutoSaveIndicator
			bind:this={autoSaveRef}
			entityType="artworks"
			entityId={entityId}
			getData={getFormData}
			onRestore={restoreDraft}
		/>
	</div>
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
	<input type="hidden" name="images" value={imagesJson} />

	<ValidationErrors errors={validationErrors} />

	<div class="form-layout">
		<div class="main-column">
			<div class="form-section">
				<h2>Basic Information</h2>

				<MultilingualInput label="Title" values={title} required placeholder="Artwork title" />
				<input type="hidden" name="title_en" value={title.en} />
				<input type="hidden" name="title_ru" value={title.ru} />
				<input type="hidden" name="title_es" value={title.es} />
				<input type="hidden" name="title_zh" value={title.zh} />

				<div class="form-field">
					<label for="technique">Technique</label>
					<input type="text" id="technique" name="technique" bind:value={technique} placeholder="e.g. Oil on canvas" />
				</div>

				<div class="form-row">
					<div class="form-field">
						<label for="series_id">Series</label>
						<select id="series_id" name="series_id" bind:value={seriesId}>
							<option value="">— No series —</option>
							{#each data.series as s}
								<option value={s.id}>{s.name_en}</option>
							{/each}
						</select>
					</div>

					<div class="form-field">
						<label for="year">Year</label>
						<input type="number" id="year" name="year" bind:value={year} min="1900" max="2100" />
					</div>
				</div>

				<div class="form-field">
					<label for="dimensions">Dimensions</label>
					<input type="text" id="dimensions" name="dimensions" bind:value={dimensions} placeholder="e.g. 100 x 80 cm" />
				</div>
			</div>

			<div class="form-section">
				<h2>Images</h2>
				<p class="section-hint">Drag images to reorder. First image or starred image is the primary.</p>

				<MultiImagePicker
					images={artworkImages}
					folder="artworks"
					label=""
					onchange={handleImagesChange}
				/>
			</div>

			<div class="form-section">
				<h2>SEO</h2>
				<SeoPanel
					bind:title={seoTitle}
					bind:description={seoDescription}
					previewUrl={`https://k-liee.com/en/artworks/${data.artwork?.slug || 'new-artwork'}`}
				/>
			</div>
		</div>

		<div class="side-column">
			<div class="form-section">
				<h2>Pricing & Availability</h2>

				<div class="form-field">
					<label for="price">Price</label>
					<input type="number" id="price" name="price" bind:value={price} min="0" />
				</div>

				<div class="form-field">
					<label for="currency">Currency</label>
					<select id="currency" name="currency" bind:value={currency}>
						<option value="EUR">EUR (€)</option>
						<option value="GBP">GBP (£)</option>
						<option value="USD">USD ($)</option>
					</select>
				</div>

				<div class="form-field checkbox-field">
					<label>
						<input type="checkbox" name="is_for_sale" bind:checked={isForSale} />
						<span>Available for purchase</span>
					</label>
				</div>
			</div>

			<div class="form-section">
				<h2>Status</h2>
				{#if data.artwork}
					<div class="status-info">
						<p><strong>ID:</strong> {data.artwork.id}</p>
						{#if data.artwork.created_at}
							<p><strong>Created:</strong> {new Date(data.artwork.created_at).toLocaleDateString()}</p>
						{/if}
						{#if data.artwork.updated_at}
							<p><strong>Updated:</strong> {new Date(data.artwork.updated_at).toLocaleDateString()}</p>
						{/if}
					</div>
				{:else}
					<p class="status-hint">New artwork - save to generate ID</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="form-actions">
		<a href="/artworks" class="btn-cancel">Cancel</a>
		<button type="submit" class="btn-save" disabled={saving}>
			{saving ? 'Saving...' : data.isNew ? 'Create Artwork' : 'Save Changes'}
		</button>
	</div>
</form>

<Toast visible={toastVisible} message={toastMessage} type={toastType} onClose={() => toastVisible = false} />

<style>
	.page-header {
		margin-bottom: 2rem;
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
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

	.form-layout {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
	}

	.main-column {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.side-column {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-section {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}

	.form-section h2 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.section-hint {
		font-size: 0.875rem;
		color: #6b7280;
		margin: -0.5rem 0 1rem 0;
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

	.form-field input,
	.form-field select,
	.form-field textarea {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-family: inherit;
	}

	.form-field input:focus,
	.form-field select:focus,
	.form-field textarea:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.checkbox-field label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-field input[type='checkbox'] {
		width: auto;
	}

	.status-info {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.status-info p {
		margin: 0.5rem 0;
	}

	.status-hint {
		font-size: 0.875rem;
		color: #9ca3af;
		font-style: italic;
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
		cursor: pointer;
	}

	.btn-cancel:hover {
		background: #f9fafb;
		border-color: #d1d5db;
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

	@media (max-width: 900px) {
		.form-layout {
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
	:global(.dark) .section-hint { color: #9ca3af; }

	:global(.dark) .form-field label { color: #e5e7eb; }
	:global(.dark) .form-field input,
	:global(.dark) .form-field select,
	:global(.dark) .form-field textarea {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}
	:global(.dark) .form-field input::placeholder,
	:global(.dark) .form-field textarea::placeholder { color: #9ca3af; }
	:global(.dark) .form-field input:focus,
	:global(.dark) .form-field select:focus,
	:global(.dark) .form-field textarea:focus {
		border-color: #818cf8;
		box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.1);
	}

	:global(.dark) .checkbox-field label { color: #e5e7eb; }

	:global(.dark) .status-info { color: #9ca3af; }
	:global(.dark) .status-info strong { color: #e5e7eb; }
	:global(.dark) .status-hint { color: #6b7280; }

	:global(.dark) .form-actions { border-color: #374151; }
	:global(.dark) .btn-cancel {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}
	:global(.dark) .btn-cancel:hover {
		background: #4b5563;
		border-color: #6b7280;
	}
</style>
