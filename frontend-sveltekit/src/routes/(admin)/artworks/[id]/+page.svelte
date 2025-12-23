<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import MultilingualInput from '$lib/components/admin/MultilingualInput.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import CsrfToken from '$lib/components/CsrfToken.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

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

	// Toast
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
	<title>{data.isNew ? 'New Artwork' : `Edit: ${title.en}`} | Admin</title>
</svelte:head>

<div class="page-header">
	<div class="breadcrumb">
		<a href="/artworks">Artworks</a>
		<span>/</span>
		<span>{data.isNew ? 'New' : title.en || 'Edit'}</span>
	</div>
	<h1>{data.isNew ? 'Create New Artwork' : 'Edit Artwork'}</h1>
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
					<label for="seriesId">Series</label>
					<select id="seriesId" name="seriesId" bind:value={seriesId}>
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
			<h2>Pricing & Availability</h2>

			<div class="form-row">
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
			</div>

			<div class="form-field checkbox-field">
				<label>
					<input type="checkbox" name="isForSale" bind:checked={isForSale} />
					<span>Available for purchase</span>
				</label>
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

	@media (max-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr;
		}
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
