<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import LanguageTabs from '$lib/components/admin/LanguageTabs.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Language tabs state
	let activeTitleLang = $state('en');
	let activeDescLang = $state('en');

	// Multilingual field interface
	interface MultiLangFields {
		title_en: string;
		title_ru: string;
		title_es: string;
		title_zh: string;
		description_en: string;
		description_ru: string;
		description_es: string;
		description_zh: string;
		[key: string]: string;
	}

	// Multilingual fields state object for dynamic binding
	let multiLang = $state<MultiLangFields>({
		title_en: data.item?.title_en || '',
		title_ru: data.item?.title_ru || '',
		title_es: data.item?.title_es || '',
		title_zh: data.item?.title_zh || '',
		description_en: data.item?.description_en || '',
		description_ru: data.item?.description_ru || '',
		description_es: data.item?.description_es || '',
		description_zh: data.item?.description_zh || ''
	});

	// Form state
	let slug = $state(data.item?.slug || '');
	let technique = $state(data.item?.technique || '');
	let year = $state(data.item?.year?.toString() || '');
	let price = $state(data.item?.price || '');
	let currency = $state(data.item?.currency || 'ETH');
	let openSeaUrl = $state(data.item?.opensea_url || '');
	let blockchain = $state(data.item?.blockchain || 'Ethereum');
	let imageId = $state<number | null>(data.item?.image_id || null);
	let videoId = $state<number | null>(data.item?.video_id || null);
	let isFeatured = $state(data.item?.is_featured || false);
	let isVisible = $state(data.item?.is_visible ?? true);
	let orderIndex = $state(data.item?.order_index?.toString() || '0');

	// Media picker state
	let showImagePicker = $state(false);
	let showVideoPicker = $state(false);

	// Derived values
	let selectedImage = $derived(data.allMedia.find((m) => m.id === imageId));
	let selectedVideo = $derived(data.allMedia.find((m) => m.id === videoId));
	let imageMedia = $derived(data.allMedia.filter((m) => m.mime_type?.startsWith('image/')));
	let videoMedia = $derived(data.allMedia.filter((m) => m.mime_type?.startsWith('video/')));

	let saving = $state(false);

	function generateSlug() {
		if (multiLang.title_en) {
			slug = multiLang.title_en
				.toLowerCase()
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim();
		}
	}

	function selectImage(id: number) {
		imageId = id;
		showImagePicker = false;
	}

	function selectVideo(id: number) {
		videoId = id;
		showVideoPicker = false;
	}

	function getMediaUrl(mediaItem: typeof data.allMedia[0]): string {
		return `/uploads/${mediaItem.folder || 'uploads'}/${mediaItem.stored_filename}`;
	}
</script>

<svelte:head>
	<title>{data.isNew ? 'Add NFT' : `Edit: ${data.item?.title_en}`} - Admin</title>
</svelte:head>

<div class="page-header">
	<div class="header-left">
		<a href="/nft" class="back-link">&larr; Back to NFT list</a>
		<h1>{data.isNew ? 'Add New NFT' : 'Edit NFT'}</h1>
	</div>
</div>

{#if form?.error}
	<div class="alert alert-error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert alert-success">{form.message}</div>
{/if}

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
	<div class="form-grid">
		<!-- Left column -->
		<div class="form-column">
			<div class="form-section">
				<h2>Basic Info</h2>

				<!-- Slug -->
				<div class="form-group">
					<label for="slug">Slug</label>
					<div class="slug-input">
						<input type="text" id="slug" name="slug" bind:value={slug} placeholder="auto-generated" />
						<button type="button" class="btn-secondary" onclick={generateSlug}>Generate</button>
					</div>
				</div>

				<!-- Titles with Language Tabs -->
				<div class="form-group">
					<label>Title <span class="required">*</span></label>
					<LanguageTabs bind:active={activeTitleLang}>
						{#snippet children(lang)}
							<input
								type="text"
								id="title_{lang}"
								bind:value={multiLang[`title_${lang}`]}
								placeholder="Title in {lang === 'en' ? 'English' : lang === 'ru' ? 'Russian' : lang === 'es' ? 'Spanish' : 'Chinese'}"
								required={lang === 'en'}
							/>
						{/snippet}
					</LanguageTabs>
					<!-- Hidden fields for form submission -->
					<input type="hidden" name="titleEn" value={multiLang.title_en} />
					<input type="hidden" name="titleRu" value={multiLang.title_ru} />
					<input type="hidden" name="titleEs" value={multiLang.title_es} />
					<input type="hidden" name="titleZh" value={multiLang.title_zh} />
				</div>

				<!-- Details -->
				<div class="form-row">
					<div class="form-group">
						<label for="technique">Technique</label>
						<input type="text" id="technique" name="technique" bind:value={technique} placeholder="e.g., Bronze" />
					</div>
					<div class="form-group">
						<label for="year">Year</label>
						<input type="number" id="year" name="year" bind:value={year} min="1900" max="2099" />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="price">Price</label>
						<input type="text" id="price" name="price" bind:value={price} placeholder="e.g., 0.5" />
					</div>
					<div class="form-group">
						<label for="currency">Currency</label>
						<select id="currency" name="currency" bind:value={currency}>
							<option value="ETH">ETH</option>
							<option value="MATIC">MATIC</option>
							<option value="USD">USD</option>
							<option value="GBP">GBP</option>
							<option value="EUR">EUR</option>
						</select>
					</div>
				</div>

				<div class="form-group">
					<label for="blockchain">Blockchain</label>
					<select id="blockchain" name="blockchain" bind:value={blockchain}>
						<option value="Ethereum">Ethereum</option>
						<option value="Polygon">Polygon</option>
						<option value="Arbitrum">Arbitrum</option>
						<option value="Base">Base</option>
					</select>
				</div>

				<div class="form-group">
					<label for="openSeaUrl">OpenSea URL</label>
					<input type="url" id="openSeaUrl" name="openSeaUrl" bind:value={openSeaUrl} placeholder="https://opensea.io/..." />
				</div>
			</div>

			<!-- Descriptions with Language Tabs -->
			<div class="form-section">
				<h2>Descriptions <span class="required">*</span></h2>

				<LanguageTabs bind:active={activeDescLang}>
					{#snippet children(lang)}
						<div class="form-group">
							<label for="description_{lang}">
								Description ({lang === 'en' ? 'English' : lang === 'ru' ? 'Russian' : lang === 'es' ? 'Spanish' : 'Chinese'})
								{#if lang === 'en'}<span class="required">*</span>{/if}
							</label>
							<textarea
								id="description_{lang}"
								rows="6"
								bind:value={multiLang[`description_${lang}`]}
								placeholder="Description in {lang === 'en' ? 'English' : lang === 'ru' ? 'Russian' : lang === 'es' ? 'Spanish' : 'Chinese'}"
								required={lang === 'en'}
							></textarea>
						</div>
					{/snippet}
				</LanguageTabs>
				<!-- Hidden fields for form submission -->
				<input type="hidden" name="descriptionEn" value={multiLang.description_en} />
				<input type="hidden" name="descriptionRu" value={multiLang.description_ru} />
				<input type="hidden" name="descriptionEs" value={multiLang.description_es} />
				<input type="hidden" name="descriptionZh" value={multiLang.description_zh} />
			</div>
		</div>

		<!-- Right column -->
		<div class="form-column">
			<!-- Image Picker -->
			<div class="form-section">
				<h2>Image <span class="required">*</span></h2>
				<p class="field-hint">Select an image for the NFT poster/thumbnail</p>

				<input type="hidden" name="imageId" value={imageId || ''} />

				{#if selectedImage}
					<div class="media-preview">
						<img src={getMediaUrl(selectedImage)} alt="Selected" />
						<div class="media-actions">
							<button type="button" class="btn-secondary" onclick={() => (showImagePicker = true)}>Change</button>
							<button type="button" class="btn-secondary" onclick={() => (imageId = null)}>Remove</button>
						</div>
					</div>
				{:else}
					<button type="button" class="btn-media-select" onclick={() => (showImagePicker = true)}>
						Select Image
					</button>
					<p class="validation-hint">Image is required</p>
				{/if}
			</div>

			<!-- Video Picker -->
			<div class="form-section">
				<h2>Video <span class="required">*</span></h2>
				<p class="field-hint">Select the video file for this NFT</p>

				<input type="hidden" name="videoId" value={videoId || ''} />

				{#if selectedVideo}
					<div class="media-preview video-preview">
						<video src={getMediaUrl(selectedVideo)} controls></video>
						<div class="media-actions">
							<button type="button" class="btn-secondary" onclick={() => (showVideoPicker = true)}>Change</button>
							<button type="button" class="btn-secondary" onclick={() => (videoId = null)}>Remove</button>
						</div>
					</div>
				{:else}
					<button type="button" class="btn-media-select" onclick={() => (showVideoPicker = true)}>
						Select Video
					</button>
					<p class="validation-hint">Video is required</p>
				{/if}
			</div>

			<!-- Visibility Settings -->
			<div class="form-section">
				<h2>Settings</h2>

				<div class="checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" name="isFeatured" bind:checked={isFeatured} />
						<span>Featured on homepage</span>
					</label>
				</div>

				<div class="checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" name="isVisible" checked={isVisible} onchange={(e) => (isVisible = e.currentTarget.checked)} />
						<span>Visible on website</span>
					</label>
					<input type="hidden" name="isVisible" value={isVisible ? 'on' : 'off'} />
				</div>

				<div class="form-group">
					<label for="orderIndex">Order Index</label>
					<input type="number" id="orderIndex" name="orderIndex" bind:value={orderIndex} min="0" />
				</div>
			</div>
		</div>
	</div>

	<div class="form-actions">
		<a href="/nft" class="btn-secondary">Cancel</a>
		<button type="submit" class="btn-primary" disabled={saving}>
			{saving ? 'Saving...' : data.isNew ? 'Create NFT' : 'Save Changes'}
		</button>
	</div>
</form>

<!-- Image Picker Modal -->
{#if showImagePicker}
	<div class="modal-overlay" onclick={() => (showImagePicker = false)} role="button" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showImagePicker = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h3>Select Image</h3>
				<button type="button" class="btn-close" onclick={() => (showImagePicker = false)}>&times;</button>
			</div>
			<div class="media-grid">
				{#each imageMedia as item}
					<button
						type="button"
						class="media-item"
						class:selected={imageId === item.id}
						onclick={() => selectImage(item.id)}
					>
						<img src={getMediaUrl(item)} alt={item.filename || 'Media'} />
					</button>
				{/each}
				{#if imageMedia.length === 0}
					<p class="no-media">No images available. Upload images in Media section first.</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Video Picker Modal -->
{#if showVideoPicker}
	<div class="modal-overlay" onclick={() => (showVideoPicker = false)} role="button" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showVideoPicker = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h3>Select Video</h3>
				<button type="button" class="btn-close" onclick={() => (showVideoPicker = false)}>&times;</button>
			</div>
			<div class="media-grid video-grid">
				{#each videoMedia as item}
					<button
						type="button"
						class="media-item video-item"
						class:selected={videoId === item.id}
						onclick={() => selectVideo(item.id)}
					>
						<video src={getMediaUrl(item)}></video>
						<span class="video-filename">{item.filename}</span>
					</button>
				{/each}
				{#if videoMedia.length === 0}
					<p class="no-media">No videos available. Upload videos in Media section first.</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.page-header {
		margin-bottom: 2rem;
	}

	.back-link {
		font-size: 0.875rem;
		color: #6b7280;
		text-decoration: none;
		margin-bottom: 0.5rem;
		display: inline-block;
	}

	.back-link:hover {
		color: #374151;
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.75rem;
	}

	.alert {
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
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

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	@media (max-width: 1024px) {
		.form-grid {
			grid-template-columns: 1fr;
		}
	}

	.form-section {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.form-section h2 {
		margin: 0 0 1rem 0;
		font-size: 1.125rem;
		color: #374151;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.75rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.375rem;
	}

	.required {
		color: #dc2626;
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.625rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.slug-input {
		display: flex;
		gap: 0.5rem;
	}

	.slug-input input {
		flex: 1;
	}

	.field-hint {
		font-size: 0.75rem;
		color: #6b7280;
		margin-bottom: 1rem;
	}

	.validation-hint {
		font-size: 0.75rem;
		color: #dc2626;
		margin-top: 0.5rem;
	}

	.media-preview {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
		text-align: center;
	}

	.media-preview img {
		max-width: 100%;
		max-height: 200px;
		border-radius: 0.25rem;
	}

	.media-preview video {
		max-width: 100%;
		max-height: 200px;
		border-radius: 0.25rem;
	}

	.media-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		margin-top: 1rem;
	}

	.btn-media-select {
		width: 100%;
		padding: 2rem;
		background: #f9fafb;
		border: 2px dashed #d1d5db;
		border-radius: 0.5rem;
		color: #6b7280;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.btn-media-select:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.checkbox-group {
		margin-bottom: 1rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.checkbox-label input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		text-decoration: none;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
		text-decoration: none;
	}

	.btn-secondary:hover {
		background: #e5e7eb;
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
		max-width: 800px;
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
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 1rem;
		padding: 1rem;
		overflow-y: auto;
	}

	.video-grid {
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	}

	.media-item {
		aspect-ratio: 1;
		border: 2px solid #e5e7eb;
		border-radius: 0.5rem;
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

	.video-item {
		aspect-ratio: auto;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.video-item video {
		width: 100%;
		height: 80px;
		object-fit: cover;
		border-radius: 0.25rem;
	}

	.video-filename {
		font-size: 0.625rem;
		color: #6b7280;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.no-media {
		grid-column: 1 / -1;
		text-align: center;
		color: #6b7280;
		padding: 2rem;
	}
</style>
