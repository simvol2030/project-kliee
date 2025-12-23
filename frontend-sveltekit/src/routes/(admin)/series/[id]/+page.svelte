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
	let coverImageId = $state(data.item?.cover_image_id?.toString() || '');
	let orderIndex = $state(data.item?.order_index?.toString() || '0');

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
				<label for="cover_image_id">Cover Image ID</label>
				<input type="number" id="cover_image_id" name="cover_image_id" bind:value={coverImageId} placeholder="Media ID" />
			</div>
		</div>

		<div class="form-section">
			<h2>Description</h2>
			<MultilingualTextarea label="Description" values={description} placeholder="Series description" rows={6} />
			<input type="hidden" name="description_en" value={description.en} />
			<input type="hidden" name="description_ru" value={description.ru} />
			<input type="hidden" name="description_es" value={description.es} />
			<input type="hidden" name="description_zh" value={description.zh} />
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

	@media (max-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
