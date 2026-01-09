<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import LanguageTabs from '$lib/components/admin/LanguageTabs.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Active tab
	let activeTab = $state<'artist' | 'education' | 'awards' | 'residencies' | 'seo'>('artist');

	// Language tabs state for biography
	let activeBioLang = $state('en');

	// Biography fields interface
	interface BioFields {
		biography_en: string;
		biography_ru: string;
		biography_es: string;
		biography_zh: string;
		[key: string]: string;
	}

	// Biography state for LanguageTabs binding
	let bioFields = $state<BioFields>({
		biography_en: data.artist?.biography_en || '',
		biography_ru: data.artist?.biography_ru || '',
		biography_es: data.artist?.biography_es || '',
		biography_zh: data.artist?.biography_zh || ''
	});

	// Education add form language tabs
	let activeEduLang = $state('en');

	// Education fields for adding new entry
	interface EduAddFields {
		degree_en: string;
		degree_ru: string;
		degree_es: string;
		degree_zh: string;
		institution_en: string;
		institution_ru: string;
		institution_es: string;
		institution_zh: string;
		[key: string]: string;
	}

	let eduAddFields = $state<EduAddFields>({
		degree_en: '',
		degree_ru: '',
		degree_es: '',
		degree_zh: '',
		institution_en: '',
		institution_ru: '',
		institution_es: '',
		institution_zh: ''
	});

	// Media picker
	let showMediaPicker = $state(false);
	let imageId = $state<number | null>(data.artist?.image_id || null);

	// Form states
	let saving = $state(false);
	let editingId = $state<number | null>(null);

	// Selected media
	let selectedImage = $derived(data.allMedia.find((m) => m.id === imageId));
	let imageMedia = $derived(data.allMedia.filter((m) => m.mime_type?.startsWith('image/')));

	function getMediaUrl(mediaItem: typeof data.allMedia[0]): string {
		return `/uploads/${mediaItem.folder || 'uploads'}/${mediaItem.stored_filename}`;
	}

	function selectImage(id: number) {
		imageId = id;
		showMediaPicker = false;
	}

	function startEdit(id: number) {
		editingId = id;
	}

	function cancelEdit() {
		editingId = null;
	}
</script>

<svelte:head>
	<title>About Management - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>About Page</h1>
</div>

{#if form?.error}
	<div class="alert alert-error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert alert-success">{form.message || 'Changes saved successfully'}</div>
{/if}

<!-- Tabs -->
<div class="tabs">
	<button class:active={activeTab === 'artist'} onclick={() => (activeTab = 'artist')}>Artist</button>
	<button class:active={activeTab === 'education'} onclick={() => (activeTab = 'education')}>Education</button>
	<button class:active={activeTab === 'awards'} onclick={() => (activeTab = 'awards')}>Awards</button>
	<button class:active={activeTab === 'residencies'} onclick={() => (activeTab = 'residencies')}>Residencies</button>
	<button class:active={activeTab === 'seo'} onclick={() => (activeTab = 'seo')}>SEO</button>
</div>

<!-- Tab Content -->
<div class="tab-content">
	<!-- Artist Tab -->
	{#if activeTab === 'artist'}
		<form
			method="POST"
			action="?/saveArtist"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update();
					saving = false;
				};
			}}
		>
			<div class="form-section">
				<h2>Artist Information</h2>

				<div class="form-grid">
					<div class="form-group">
						<label for="name">Name *</label>
						<input type="text" id="name" name="name" value={data.artist?.name || ''} required />
					</div>

					<div class="form-group">
						<label for="nationality">Nationality</label>
						<input type="text" id="nationality" name="nationality" value={data.artist?.nationality || ''} />
					</div>

					<div class="form-group">
						<label for="basedIn">Based In</label>
						<input type="text" id="basedIn" name="basedIn" value={data.artist?.based_in || ''} />
					</div>
				</div>

				<!-- Image -->
				<div class="form-group">
					<label>Artist Image</label>
					<input type="hidden" name="imageId" value={imageId || ''} />
					{#if selectedImage}
						<div class="image-preview">
							<img src={getMediaUrl(selectedImage)} alt="Artist" />
							<div class="image-actions">
								<button type="button" class="btn-secondary" onclick={() => (showMediaPicker = true)}>Change</button>
								<button type="button" class="btn-secondary" onclick={() => (imageId = null)}>Remove</button>
							</div>
						</div>
					{:else if data.artist?.imageUrl}
						<div class="image-preview">
							<img src={data.artist.imageUrl} alt="Artist" />
							<button type="button" class="btn-secondary" onclick={() => (showMediaPicker = true)}>Change</button>
						</div>
					{:else}
						<button type="button" class="btn-media-select" onclick={() => (showMediaPicker = true)}>Select Image</button>
					{/if}
				</div>
			</div>

			<div class="form-section">
				<h2>Biography</h2>

				<LanguageTabs bind:active={activeBioLang}>
					{#snippet children(lang)}
						<div class="form-group">
							<label for="biography_{lang}">
								Biography ({lang === 'en' ? 'English' : lang === 'ru' ? 'Russian' : lang === 'es' ? 'Spanish' : 'Chinese'})
							</label>
							<textarea
								id="biography_{lang}"
								rows="6"
								bind:value={bioFields[`biography_${lang}`]}
								placeholder="Biography in {lang === 'en' ? 'English' : lang === 'ru' ? 'Russian' : lang === 'es' ? 'Spanish' : 'Chinese'}"
							></textarea>
						</div>
					{/snippet}
				</LanguageTabs>
				<!-- Hidden fields for form submission -->
				<input type="hidden" name="biographyEn" value={bioFields.biography_en} />
				<input type="hidden" name="biographyRu" value={bioFields.biography_ru} />
				<input type="hidden" name="biographyEs" value={bioFields.biography_es} />
				<input type="hidden" name="biographyZh" value={bioFields.biography_zh} />
			</div>

			<!-- Hidden SEO fields (managed in SEO tab but saved together) -->
			<input type="hidden" name="seoTitleEn" value={data.artist?.seo_title_en || ''} />
			<input type="hidden" name="seoTitleRu" value={data.artist?.seo_title_ru || ''} />
			<input type="hidden" name="seoTitleEs" value={data.artist?.seo_title_es || ''} />
			<input type="hidden" name="seoTitleZh" value={data.artist?.seo_title_zh || ''} />
			<input type="hidden" name="seoDescriptionEn" value={data.artist?.seo_description_en || ''} />
			<input type="hidden" name="seoDescriptionRu" value={data.artist?.seo_description_ru || ''} />
			<input type="hidden" name="seoDescriptionEs" value={data.artist?.seo_description_es || ''} />
			<input type="hidden" name="seoDescriptionZh" value={data.artist?.seo_description_zh || ''} />

			<div class="form-actions">
				<button type="submit" class="btn-primary" disabled={saving}>
					{saving ? 'Saving...' : 'Save Artist Info'}
				</button>
			</div>
		</form>
	{/if}

	<!-- Education Tab -->
	{#if activeTab === 'education'}
		<div class="list-section">
			<div class="list-header">
				<h2>Education ({data.education.length})</h2>
			</div>

			<!-- Add form with Language Tabs -->
			<form
				method="POST"
				action="?/addEducation"
				class="add-form"
				use:enhance={() => {
					saving = true;
					return async ({ update }) => {
						await update();
						// Reset fields after successful add
						eduAddFields = {
							degree_en: '', degree_ru: '', degree_es: '', degree_zh: '',
							institution_en: '', institution_ru: '', institution_es: '', institution_zh: ''
						};
						saving = false;
					};
				}}
			>
				<div class="form-grid-compact">
					<input type="text" name="year" placeholder="Year (e.g., 2015-2019)" />
					<input type="number" name="orderIndex" placeholder="Order" value="0" class="order-input" />
				</div>

				<LanguageTabs bind:active={activeEduLang}>
					{#snippet children(lang)}
						<div class="form-grid-compact">
							<input
								type="text"
								bind:value={eduAddFields[`degree_${lang}`]}
								placeholder="Degree ({lang.toUpperCase()})"
							/>
							<input
								type="text"
								bind:value={eduAddFields[`institution_${lang}`]}
								placeholder="Institution ({lang.toUpperCase()})"
							/>
						</div>
					{/snippet}
				</LanguageTabs>

				<!-- Hidden fields for form submission -->
				<input type="hidden" name="degreeEn" value={eduAddFields.degree_en} />
				<input type="hidden" name="degreeRu" value={eduAddFields.degree_ru} />
				<input type="hidden" name="degreeEs" value={eduAddFields.degree_es} />
				<input type="hidden" name="degreeZh" value={eduAddFields.degree_zh} />
				<input type="hidden" name="institutionEn" value={eduAddFields.institution_en} />
				<input type="hidden" name="institutionRu" value={eduAddFields.institution_ru} />
				<input type="hidden" name="institutionEs" value={eduAddFields.institution_es} />
				<input type="hidden" name="institutionZh" value={eduAddFields.institution_zh} />

				<div class="form-actions-inline">
					<button type="submit" class="btn-primary" disabled={saving}>Add Education</button>
				</div>
			</form>

			<!-- List -->
			<div class="items-list">
				{#each data.education as item}
					<div class="list-item">
						{#if editingId === item.id}
							<form
								method="POST"
								action="?/updateEducation"
								class="edit-form"
								use:enhance={() => {
									saving = true;
									return async ({ update }) => {
										await update();
										editingId = null;
										saving = false;
									};
								}}
							>
								<input type="hidden" name="id" value={item.id} />
								<div class="form-grid-compact">
									<input type="text" name="year" value={item.year || ''} placeholder="Year" />
									<input type="text" name="degreeEn" value={item.degree_en || ''} placeholder="Degree EN" />
									<input type="text" name="institutionEn" value={item.institution_en || ''} placeholder="Institution EN" />
								</div>
								<div class="form-grid-compact">
									<input type="text" name="degreeRu" value={item.degree_ru || ''} placeholder="Degree RU" />
									<input type="text" name="institutionRu" value={item.institution_ru || ''} placeholder="Institution RU" />
								</div>
								<div class="form-grid-compact">
									<input type="text" name="degreeEs" value={item.degree_es || ''} placeholder="Degree ES" />
									<input type="text" name="institutionEs" value={item.institution_es || ''} placeholder="Institution ES" />
								</div>
								<div class="form-grid-compact">
									<input type="text" name="degreeZh" value={item.degree_zh || ''} placeholder="Degree ZH" />
									<input type="text" name="institutionZh" value={item.institution_zh || ''} placeholder="Institution ZH" />
								</div>
								<div class="edit-actions">
									<input type="number" name="orderIndex" value={item.order_index} class="order-input" />
									<button type="submit" class="btn-primary" disabled={saving}>Save</button>
									<button type="button" class="btn-secondary" onclick={cancelEdit}>Cancel</button>
								</div>
							</form>
						{:else}
							<div class="item-content">
								<span class="item-year">{item.year || '-'}</span>
								<span class="item-main">{item.degree_en || '-'}</span>
								<span class="item-secondary">{item.institution_en || '-'}</span>
							</div>
							<div class="item-actions">
								<button type="button" class="btn-edit" onclick={() => startEdit(item.id)}>Edit</button>
								<form method="POST" action="?/deleteEducation" use:enhance onsubmit={(e) => !confirm('Delete?') && e.preventDefault()}>
									<input type="hidden" name="id" value={item.id} />
									<button type="submit" class="btn-delete">Delete</button>
								</form>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Awards Tab -->
	{#if activeTab === 'awards'}
		<div class="list-section">
			<div class="list-header">
				<h2>Awards ({data.awards.length})</h2>
			</div>

			<form method="POST" action="?/addAward" class="add-form" use:enhance>
				<div class="form-grid-compact">
					<input type="text" name="year" placeholder="Year" />
					<input type="text" name="titleEn" placeholder="Title (EN)" />
					<input type="text" name="organizationEn" placeholder="Organization (EN)" />
					<input type="number" name="orderIndex" placeholder="Order" value="0" class="order-input" />
					<button type="submit" class="btn-primary">Add</button>
				</div>
			</form>

			<div class="items-list">
				{#each data.awards as item}
					<div class="list-item">
						{#if editingId === item.id}
							<form method="POST" action="?/updateAward" class="edit-form" use:enhance={() => { return async ({ update }) => { await update(); editingId = null; }; }}>
								<input type="hidden" name="id" value={item.id} />
								<div class="form-grid-compact">
									<input type="text" name="year" value={item.year || ''} placeholder="Year" />
									<input type="text" name="titleEn" value={item.title_en || ''} placeholder="Title EN" />
									<input type="text" name="organizationEn" value={item.organization_en || ''} placeholder="Org EN" />
								</div>
								<div class="form-grid-compact">
									<input type="text" name="titleRu" value={item.title_ru || ''} placeholder="Title RU" />
									<input type="text" name="organizationRu" value={item.organization_ru || ''} placeholder="Org RU" />
								</div>
								<div class="form-grid-compact">
									<input type="text" name="titleEs" value={item.title_es || ''} placeholder="Title ES" />
									<input type="text" name="organizationEs" value={item.organization_es || ''} placeholder="Org ES" />
								</div>
								<div class="form-grid-compact">
									<input type="text" name="titleZh" value={item.title_zh || ''} placeholder="Title ZH" />
									<input type="text" name="organizationZh" value={item.organization_zh || ''} placeholder="Org ZH" />
								</div>
								<div class="edit-actions">
									<input type="number" name="orderIndex" value={item.order_index} class="order-input" />
									<button type="submit" class="btn-primary">Save</button>
									<button type="button" class="btn-secondary" onclick={cancelEdit}>Cancel</button>
								</div>
							</form>
						{:else}
							<div class="item-content">
								<span class="item-year">{item.year || '-'}</span>
								<span class="item-main">{item.title_en || '-'}</span>
								<span class="item-secondary">{item.organization_en || '-'}</span>
							</div>
							<div class="item-actions">
								<button type="button" class="btn-edit" onclick={() => startEdit(item.id)}>Edit</button>
								<form method="POST" action="?/deleteAward" use:enhance onsubmit={(e) => !confirm('Delete?') && e.preventDefault()}>
									<input type="hidden" name="id" value={item.id} />
									<button type="submit" class="btn-delete">Delete</button>
								</form>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Residencies Tab -->
	{#if activeTab === 'residencies'}
		<div class="list-section">
			<div class="list-header">
				<h2>Residencies ({data.residencies.length})</h2>
			</div>

			<form method="POST" action="?/addResidency" class="add-form" use:enhance>
				<div class="form-grid-compact">
					<input type="text" name="year" placeholder="Year" />
					<input type="text" name="locationEn" placeholder="Location (EN)" />
					<input type="number" name="orderIndex" placeholder="Order" value="0" class="order-input" />
					<button type="submit" class="btn-primary">Add</button>
				</div>
			</form>

			<div class="items-list">
				{#each data.residencies as item}
					<div class="list-item">
						{#if editingId === item.id}
							<form method="POST" action="?/updateResidency" class="edit-form" use:enhance={() => { return async ({ update }) => { await update(); editingId = null; }; }}>
								<input type="hidden" name="id" value={item.id} />
								<div class="form-grid-compact">
									<input type="text" name="year" value={item.year || ''} placeholder="Year" />
									<input type="text" name="locationEn" value={item.location_en || ''} placeholder="Location EN" />
								</div>
								<div class="form-grid-compact">
									<input type="text" name="locationRu" value={item.location_ru || ''} placeholder="Location RU" />
									<input type="text" name="locationEs" value={item.location_es || ''} placeholder="Location ES" />
									<input type="text" name="locationZh" value={item.location_zh || ''} placeholder="Location ZH" />
								</div>
								<div class="edit-actions">
									<input type="number" name="orderIndex" value={item.order_index} class="order-input" />
									<button type="submit" class="btn-primary">Save</button>
									<button type="button" class="btn-secondary" onclick={cancelEdit}>Cancel</button>
								</div>
							</form>
						{:else}
							<div class="item-content">
								<span class="item-year">{item.year || '-'}</span>
								<span class="item-main">{item.location_en || '-'}</span>
							</div>
							<div class="item-actions">
								<button type="button" class="btn-edit" onclick={() => startEdit(item.id)}>Edit</button>
								<form method="POST" action="?/deleteResidency" use:enhance onsubmit={(e) => !confirm('Delete?') && e.preventDefault()}>
									<input type="hidden" name="id" value={item.id} />
									<button type="submit" class="btn-delete">Delete</button>
								</form>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- SEO Tab -->
	{#if activeTab === 'seo'}
		<form method="POST" action="?/saveArtist" use:enhance>
			<!-- Hidden artist fields -->
			<input type="hidden" name="name" value={data.artist?.name || 'Artist'} />
			<input type="hidden" name="imageId" value={data.artist?.image_id || ''} />
			<input type="hidden" name="nationality" value={data.artist?.nationality || ''} />
			<input type="hidden" name="basedIn" value={data.artist?.based_in || ''} />
			<input type="hidden" name="biographyEn" value={data.artist?.biography_en || ''} />
			<input type="hidden" name="biographyRu" value={data.artist?.biography_ru || ''} />
			<input type="hidden" name="biographyEs" value={data.artist?.biography_es || ''} />
			<input type="hidden" name="biographyZh" value={data.artist?.biography_zh || ''} />

			<div class="form-section">
				<h2>SEO Settings</h2>

				<h3>Page Title</h3>
				<div class="form-grid">
					<div class="form-group">
						<label for="seoTitleEn">English</label>
						<input type="text" id="seoTitleEn" name="seoTitleEn" value={data.artist?.seo_title_en || ''} />
					</div>
					<div class="form-group">
						<label for="seoTitleRu">Russian</label>
						<input type="text" id="seoTitleRu" name="seoTitleRu" value={data.artist?.seo_title_ru || ''} />
					</div>
					<div class="form-group">
						<label for="seoTitleEs">Spanish</label>
						<input type="text" id="seoTitleEs" name="seoTitleEs" value={data.artist?.seo_title_es || ''} />
					</div>
					<div class="form-group">
						<label for="seoTitleZh">Chinese</label>
						<input type="text" id="seoTitleZh" name="seoTitleZh" value={data.artist?.seo_title_zh || ''} />
					</div>
				</div>

				<h3>Meta Description</h3>
				<div class="form-group">
					<label for="seoDescriptionEn">English</label>
					<textarea id="seoDescriptionEn" name="seoDescriptionEn" rows="2">{data.artist?.seo_description_en || ''}</textarea>
				</div>
				<div class="form-group">
					<label for="seoDescriptionRu">Russian</label>
					<textarea id="seoDescriptionRu" name="seoDescriptionRu" rows="2">{data.artist?.seo_description_ru || ''}</textarea>
				</div>
				<div class="form-group">
					<label for="seoDescriptionEs">Spanish</label>
					<textarea id="seoDescriptionEs" name="seoDescriptionEs" rows="2">{data.artist?.seo_description_es || ''}</textarea>
				</div>
				<div class="form-group">
					<label for="seoDescriptionZh">Chinese</label>
					<textarea id="seoDescriptionZh" name="seoDescriptionZh" rows="2">{data.artist?.seo_description_zh || ''}</textarea>
				</div>
			</div>

			<div class="form-actions">
				<button type="submit" class="btn-primary">Save SEO Settings</button>
			</div>
		</form>
	{/if}
</div>

<!-- Media Picker Modal -->
{#if showMediaPicker}
	<div class="modal-overlay" onclick={() => (showMediaPicker = false)} role="button" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showMediaPicker = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h3>Select Image</h3>
				<button type="button" class="btn-close" onclick={() => (showMediaPicker = false)}>&times;</button>
			</div>
			<div class="media-grid">
				{#each imageMedia as item}
					<button type="button" class="media-item" class:selected={imageId === item.id} onclick={() => selectImage(item.id)}>
						<img src={getMediaUrl(item)} alt={item.filename || 'Media'} />
					</button>
				{/each}
				{#if imageMedia.length === 0}
					<p class="no-media">No images available.</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.page-header {
		margin-bottom: 1.5rem;
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.75rem;
	}

	.alert {
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.alert-error {
		background: #fef2f2;
		color: #dc2626;
		border: 1px solid #fecaca;
	}

	.alert-success {
		background: #f0fdf4;
		color: #16a34a;
		border: 1px solid #bbf7d0;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.5rem;
	}

	.tabs button {
		padding: 0.5rem 1rem;
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.tabs button:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.tabs button.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.tab-content {
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
	}

	.form-section {
		margin-bottom: 2rem;
	}

	.form-section h2 {
		margin: 0 0 1rem 0;
		font-size: 1.125rem;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.5rem;
	}

	.form-section h3 {
		margin: 1.5rem 0 0.75rem 0;
		font-size: 1rem;
		color: #6b7280;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.375rem;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.image-preview {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 200px;
	}

	.image-preview img {
		width: 100%;
		border-radius: 0.375rem;
	}

	.image-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-media-select {
		padding: 2rem;
		background: #f9fafb;
		border: 2px dashed #d1d5db;
		border-radius: 0.5rem;
		color: #6b7280;
		cursor: pointer;
		width: 200px;
	}

	.form-actions {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.form-actions-inline {
		margin-top: 1rem;
	}

	.btn-primary {
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
	}

	.btn-secondary {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		cursor: pointer;
	}

	.btn-edit {
		padding: 0.25rem 0.5rem;
		background: #f3f4f6;
		color: #374151;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.75rem;
	}

	.btn-delete {
		padding: 0.25rem 0.5rem;
		background: #fef2f2;
		color: #dc2626;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.75rem;
	}

	/* List sections */
	.list-section h2 {
		margin: 0 0 1rem 0;
		font-size: 1.125rem;
	}

	.add-form {
		margin-bottom: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
	}

	.form-grid-compact {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.form-grid-compact input {
		flex: 1;
		min-width: 120px;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.order-input {
		width: 60px !important;
		min-width: 60px !important;
		flex: 0 !important;
	}

	.items-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: #f9fafb;
		border-radius: 0.375rem;
	}

	.item-content {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.item-year {
		font-weight: 600;
		color: #374151;
		min-width: 60px;
	}

	.item-main {
		color: #374151;
	}

	.item-secondary {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.item-actions {
		display: flex;
		gap: 0.5rem;
	}

	.edit-form {
		flex: 1;
	}

	.edit-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
		align-items: center;
	}

	/* Modal */
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
		max-width: 600px;
		max-height: 80vh;
		overflow: hidden;
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
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.5rem;
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
		border-color: #667eea;
	}

	.media-item.selected {
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
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
</style>
