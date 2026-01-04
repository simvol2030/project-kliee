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

	// Single-language fields (from schema)
	let venue = $state(data.item?.venue || '');
	let city = $state(data.item?.city || '');
	let country = $state(data.item?.country || '');
	let startDate = $state(data.item?.start_date?.split('T')[0] || '');
	let endDate = $state(data.item?.end_date?.split('T')[0] || '');
	let isCurrent = $state(data.item?.is_current || false);
	let galleryLink = $state(data.item?.gallery_link || '');
	let coverImageId = $state(data.item?.cover_image_id?.toString() || '');

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
			<input type="hidden" name="title_en" value={title.en} />
			<input type="hidden" name="title_ru" value={title.ru} />
			<input type="hidden" name="title_es" value={title.es} />
			<input type="hidden" name="title_zh" value={title.zh} />

			<div class="form-row">
				<div class="form-field">
					<label for="start_date">Start Date</label>
					<input type="date" id="start_date" name="start_date" bind:value={startDate} required />
				</div>

				<div class="form-field">
					<label for="end_date">End Date</label>
					<input type="date" id="end_date" name="end_date" bind:value={endDate} />
				</div>
			</div>

			<div class="form-field checkbox-field">
				<label>
					<input type="checkbox" name="is_current" bind:checked={isCurrent} />
					<span>Current / Upcoming</span>
				</label>
			</div>
		</div>

		<div class="form-section">
			<h2>Venue & Location</h2>

			<div class="form-field">
				<label for="venue">Venue</label>
				<input type="text" id="venue" name="venue" bind:value={venue} placeholder="Gallery or museum name" required />
			</div>

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
		</div>

		<div class="form-section full-width">
			<h2>Description</h2>

			<MultilingualInput label="Description" values={description} placeholder="Exhibition description" />
			<input type="hidden" name="description_en" value={description.en} />
			<input type="hidden" name="description_ru" value={description.ru} />
			<input type="hidden" name="description_es" value={description.es} />
			<input type="hidden" name="description_zh" value={description.zh} />
		</div>

		<div class="form-section full-width">
			<h2>Media & Links</h2>

			<div class="form-row">
				<div class="form-field">
					<label for="cover_image_id">Cover Image ID</label>
					<input type="number" id="cover_image_id" name="cover_image_id" bind:value={coverImageId} placeholder="Media ID" />
				</div>

				<div class="form-field">
					<label for="gallery_link">Gallery Link</label>
					<input type="url" id="gallery_link" name="gallery_link" bind:value={galleryLink} placeholder="https://..." />
				</div>
			</div>
		</div>
	</div>

	<div class="form-actions">
		<a href="/exhibitions" class="btn-cancel">Cancel</a>
		<button type="submit" class="btn-save" disabled={saving}>
			{saving ? 'Saving...' : data.isNew ? 'Create Exhibition' : 'Save Changes'}
		</button>
	</div>
</form>

<Toast bind:visible={toastVisible} message={toastMessage} type={toastType} />

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

	.checkbox-field {
		display: flex;
		align-items: center;
	}

	.checkbox-field label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		margin-bottom: 0;
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
	:global(.dark) .form-field input[type='text'],
	:global(.dark) .form-field input[type='url'],
	:global(.dark) .form-field input[type='date'],
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

	:global(.dark) .checkbox-field label { color: #e5e7eb; }

	:global(.dark) .form-actions { border-color: #374151; }
	:global(.dark) .btn-cancel {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}
	:global(.dark) .btn-cancel:hover { background: #4b5563; }
</style>
