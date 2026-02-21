<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import TipTapEditor from '$lib/components/admin/TipTapEditor.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';

	let { data }: { data: PageData } = $props();

	// Language state
	let activeLang = $state<'en' | 'ru' | 'es' | 'zh'>('en');

	// Multilingual content fields
	let title = $state({
		en: data.item?.title_en || '',
		ru: data.item?.title_ru || '',
		es: data.item?.title_es || '',
		zh: data.item?.title_zh || ''
	});

	let excerpt = $state({
		en: data.item?.excerpt_en || '',
		ru: data.item?.excerpt_ru || '',
		es: data.item?.excerpt_es || '',
		zh: data.item?.excerpt_zh || ''
	});

	let contentEn = $state(data.item?.content_en || '');
	let contentRu = $state(data.item?.content_ru || '');
	let contentEs = $state(data.item?.content_es || '');
	let contentZh = $state(data.item?.content_zh || '');

	// SEO fields
	let seoTitle = $state({
		en: data.item?.seo_title_en || '',
		ru: data.item?.seo_title_ru || '',
		es: data.item?.seo_title_es || '',
		zh: data.item?.seo_title_zh || ''
	});

	let seoDescription = $state({
		en: data.item?.seo_description_en || '',
		ru: data.item?.seo_description_ru || '',
		es: data.item?.seo_description_es || '',
		zh: data.item?.seo_description_zh || ''
	});

	// Meta fields
	let slug = $state(data.item?.slug || '');
	let isPublished = $state(data.item?.is_published === 1);
	let isFeatured = $state(data.item?.is_featured === 1);
	let publishedAt = $state(data.item?.published_at?.split('T')[0] || '');
	let authorId = $state<number | null>(data.item?.author_id || null);
	let tagsInput = $state((() => {
		try {
			const arr = JSON.parse(data.item?.tags || '[]');
			return Array.isArray(arr) ? arr.join(', ') : '';
		} catch {
			return '';
		}
	})());

	// Cover image
	let coverImageId = $state<number | null>(data.item?.cover_image_id || null);
	let coverImageUrl = $state<string | null>(data.coverImage?.url || null);

	// UI state
	let saving = $state(false);
	let seoOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');

	// Media picker
	let showCoverPicker = $state(false);
	const imageMedia = $derived(
		(data.allMedia as Array<{ id: number; mime_type?: string; url?: string | null; alt_en?: string | null }>)
			.filter((m) => m.mime_type?.startsWith('image/'))
	);

	function selectCoverImage(id: number, url: string | null) {
		coverImageId = id;
		coverImageUrl = url;
		showCoverPicker = false;
	}

	function removeCoverImage() {
		coverImageId = null;
		coverImageUrl = null;
	}

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

	function parseTags(input: string): string[] {
		return input
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
	}

	function showToast(message: string, type: 'success' | 'error') {
		toastMessage = message;
		toastType = type;
		toastVisible = true;
	}

	async function save() {
		if (!slug) {
			showToast('Slug is required', 'error');
			return;
		}

		saving = true;
		try {
			const payload = {
				slug,
				author_id: authorId,
				title_en: title.en,
				title_ru: title.ru,
				title_es: title.es,
				title_zh: title.zh,
				excerpt_en: excerpt.en,
				excerpt_ru: excerpt.ru,
				excerpt_es: excerpt.es,
				excerpt_zh: excerpt.zh,
				content_en: contentEn,
				content_ru: contentRu,
				content_es: contentEs,
				content_zh: contentZh,
				cover_image_id: coverImageId,
				tags: parseTags(tagsInput),
				is_published: isPublished,
				is_featured: isFeatured,
				published_at: publishedAt || null,
				seo_title_en: seoTitle.en,
				seo_title_ru: seoTitle.ru,
				seo_title_es: seoTitle.es,
				seo_title_zh: seoTitle.zh,
				seo_description_en: seoDescription.en,
				seo_description_ru: seoDescription.ru,
				seo_description_es: seoDescription.es,
				seo_description_zh: seoDescription.zh
			};

			if (data.isNew) {
				const res = await fetch('/api/blog', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				if (!res.ok) {
					const err = await res.json().catch(() => ({ message: 'Unknown error' }));
					throw new Error(err.message || 'Failed to create post');
				}
				const json = await res.json();
				showToast('Post created successfully', 'success');
				// Navigate to the edit page for the new post
				await goto(`/blog/${json.post.id}`, { replaceState: true });
			} else {
				const res = await fetch(`/api/blog/${data.item?.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				if (!res.ok) {
					const err = await res.json().catch(() => ({ message: 'Unknown error' }));
					throw new Error(err.message || 'Failed to update post');
				}
				showToast('Post saved successfully', 'success');
			}
		} catch (err: unknown) {
			showToast(err instanceof Error ? err.message : 'Failed to save post', 'error');
		} finally {
			saving = false;
		}
	}

	async function deletePost() {
		if (!data.item?.id) return;
		try {
			const res = await fetch(`/api/blog/${data.item.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to delete');
			await goto('/blog');
		} catch {
			showToast('Failed to delete post', 'error');
		}
	}
</script>

<svelte:head>
	<title>{data.isNew ? 'New Post' : `Edit: ${title.en || 'Post'}`} | Admin</title>
</svelte:head>

<div class="page-header">
	<div class="breadcrumb">
		<a href="/blog">Blog</a>
		<span>/</span>
		<span>{data.isNew ? 'New Post' : title.en || 'Edit Post'}</span>
	</div>
	<h1>{data.isNew ? 'Create New Post' : 'Edit Post'}</h1>
</div>

<div class="editor-layout">
	<!-- Main content area -->
	<div class="editor-main">
		<!-- Language Tabs -->
		<div class="lang-tabs">
			{#each [{ code: 'en', label: 'EN', flag: '🇬🇧' }, { code: 'ru', label: 'RU', flag: '🇷🇺' }, { code: 'es', label: 'ES', flag: '🇪🇸' }, { code: 'zh', label: 'ZH', flag: '🇨🇳' }] as lang}
				<button
					type="button"
					class="lang-tab"
					class:active={activeLang === lang.code}
					onclick={() => (activeLang = lang.code as 'en' | 'ru' | 'es' | 'zh')}
				>
					{lang.flag} {lang.label}
				</button>
			{/each}
		</div>

		<!-- Title -->
		<div class="field-group">
			<label class="field-label">Title *</label>
			{#if activeLang === 'en'}
				<input type="text" class="field-input" bind:value={title.en} placeholder="Post title in English" />
			{:else if activeLang === 'ru'}
				<input type="text" class="field-input" bind:value={title.ru} placeholder="Заголовок поста" />
			{:else if activeLang === 'es'}
				<input type="text" class="field-input" bind:value={title.es} placeholder="Título del artículo" />
			{:else}
				<input type="text" class="field-input" bind:value={title.zh} placeholder="文章标题" />
			{/if}
		</div>

		<!-- Excerpt -->
		<div class="field-group">
			<label class="field-label">Excerpt</label>
			{#if activeLang === 'en'}
				<textarea class="field-textarea" bind:value={excerpt.en} rows="3" placeholder="Brief description for cards and meta..."></textarea>
			{:else if activeLang === 'ru'}
				<textarea class="field-textarea" bind:value={excerpt.ru} rows="3" placeholder="Краткое описание..."></textarea>
			{:else if activeLang === 'es'}
				<textarea class="field-textarea" bind:value={excerpt.es} rows="3" placeholder="Breve descripción..."></textarea>
			{:else}
				<textarea class="field-textarea" bind:value={excerpt.zh} rows="3" placeholder="简短描述..."></textarea>
			{/if}
		</div>

		<!-- Content (TipTap) -->
		<div class="field-group">
			<label class="field-label">Content *</label>
			{#if activeLang === 'en'}
				<TipTapEditor bind:content={contentEn} placeholder="Write your post content in English..." />
			{:else if activeLang === 'ru'}
				<TipTapEditor bind:content={contentRu} placeholder="Напишите контент поста на русском..." />
			{:else if activeLang === 'es'}
				<TipTapEditor bind:content={contentEs} placeholder="Escriba el contenido en español..." />
			{:else}
				<TipTapEditor bind:content={contentZh} placeholder="用中文写文章内容..." />
			{/if}
		</div>

		<!-- SEO Panel (collapsible) -->
		<div class="seo-panel">
			<button type="button" class="seo-toggle" onclick={() => (seoOpen = !seoOpen)}>
				<span>SEO Settings</span>
				<span class="chevron">{seoOpen ? '▲' : '▼'}</span>
			</button>

			{#if seoOpen}
				<div class="seo-content">
					<div class="lang-tabs seo-tabs">
						{#each [{ code: 'en', label: 'EN' }, { code: 'ru', label: 'RU' }, { code: 'es', label: 'ES' }, { code: 'zh', label: 'ZH' }] as lang}
							<button
								type="button"
								class="lang-tab"
								class:active={activeLang === lang.code}
								onclick={() => (activeLang = lang.code as 'en' | 'ru' | 'es' | 'zh')}
							>
								{lang.label}
							</button>
						{/each}
					</div>

					<div class="field-group">
						<label class="field-label">SEO Title</label>
						{#if activeLang === 'en'}
							<input type="text" class="field-input" bind:value={seoTitle.en} placeholder="SEO title for EN" />
						{:else if activeLang === 'ru'}
							<input type="text" class="field-input" bind:value={seoTitle.ru} placeholder="SEO заголовок" />
						{:else if activeLang === 'es'}
							<input type="text" class="field-input" bind:value={seoTitle.es} placeholder="Título SEO" />
						{:else}
							<input type="text" class="field-input" bind:value={seoTitle.zh} placeholder="SEO 标题" />
						{/if}
					</div>

					<div class="field-group">
						<label class="field-label">SEO Description</label>
						{#if activeLang === 'en'}
							<textarea class="field-textarea" bind:value={seoDescription.en} rows="2" placeholder="SEO description for EN"></textarea>
						{:else if activeLang === 'ru'}
							<textarea class="field-textarea" bind:value={seoDescription.ru} rows="2" placeholder="SEO описание"></textarea>
						{:else if activeLang === 'es'}
							<textarea class="field-textarea" bind:value={seoDescription.es} rows="2" placeholder="Descripción SEO"></textarea>
						{:else}
							<textarea class="field-textarea" bind:value={seoDescription.zh} rows="2" placeholder="SEO 描述"></textarea>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Sidebar -->
	<div class="editor-sidebar">
		<!-- Actions -->
		<div class="sidebar-card">
			<div class="sidebar-actions">
				<button type="button" class="btn-save" onclick={save} disabled={saving}>
					{saving ? 'Saving...' : 'Save'}
				</button>
				{#if !data.isNew}
					<button type="button" class="btn-delete" onclick={() => (deleteDialogOpen = true)}>
						Delete
					</button>
				{/if}
			</div>
		</div>

		<!-- Slug -->
		<div class="sidebar-card">
			<h3 class="card-title">URL Slug</h3>
			<div class="slug-row">
				<input type="text" class="field-input" bind:value={slug} placeholder="post-url-slug" />
				<button type="button" class="btn-generate" onclick={generateSlug}>Auto</button>
			</div>
		</div>

		<!-- Cover Image -->
		<div class="sidebar-card">
			<h3 class="card-title">Cover Image</h3>
			{#if coverImageUrl}
				<div class="cover-preview">
					<img src={coverImageUrl} alt="Cover" />
					<div class="cover-actions">
						<button type="button" class="btn-sm" onclick={() => (showCoverPicker = true)}>Change</button>
						<button type="button" class="btn-sm btn-danger" onclick={removeCoverImage}>Remove</button>
					</div>
				</div>
			{:else}
				<button type="button" class="btn-select-media" onclick={() => (showCoverPicker = true)}>
					Select Image
				</button>
			{/if}
		</div>

		<!-- Publishing -->
		<div class="sidebar-card">
			<h3 class="card-title">Publishing</h3>
			<label class="checkbox-field">
				<input type="checkbox" bind:checked={isPublished} />
				<span>Published</span>
			</label>
			<label class="checkbox-field">
				<input type="checkbox" bind:checked={isFeatured} />
				<span>Featured (shown at top)</span>
			</label>
			<div class="field-group" style="margin-top: 0.75rem;">
				<label class="field-label">Published Date</label>
				<input type="date" class="field-input" bind:value={publishedAt} />
			</div>
		</div>

		<!-- Tags -->
		<div class="sidebar-card">
			<h3 class="card-title">Tags</h3>
			<input
				type="text"
				class="field-input"
				bind:value={tagsInput}
				placeholder="art, studio, process"
			/>
			<p class="hint">Comma-separated</p>
		</div>

		<!-- Author -->
		<div class="sidebar-card">
			<h3 class="card-title">Author</h3>
			<select class="field-input" bind:value={authorId}>
				<option value={null}>— No author —</option>
				{#each data.allAdmins as admin}
					<option value={admin.id}>{admin.name}</option>
				{/each}
			</select>
		</div>
	</div>
</div>

<!-- Media Picker Modal -->
{#if showCoverPicker}
	<div class="modal-overlay" onclick={() => (showCoverPicker = false)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && (showCoverPicker = false)}>
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Select Cover Image">
			<div class="modal-header">
				<h3>Select Cover Image</h3>
				<button type="button" class="btn-close" onclick={() => (showCoverPicker = false)}>✕</button>
			</div>
			<div class="media-grid">
				{#each imageMedia as item}
					<button
						type="button"
						class="media-item"
						class:selected={coverImageId === item.id}
						onclick={() => selectCoverImage(item.id, item.url ?? null)}
					>
						<img src={item.url ?? ''} alt={item.alt_en ?? ''} loading="lazy" />
					</button>
				{/each}
				{#if imageMedia.length === 0}
					<p class="empty-state">No images in media library</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<ConfirmDialog
	bind:open={deleteDialogOpen}
	title="Delete Post"
	message="Are you sure you want to delete '{title.en || 'this post'}'? This cannot be undone."
	confirmText="Delete"
	variant="danger"
	onConfirm={deletePost}
	onCancel={() => (deleteDialogOpen = false)}
/>

<Toast bind:visible={toastVisible} message={toastMessage} type={toastType} />

<style>
	.page-header {
		margin-bottom: 1.5rem;
	}

	.breadcrumb {
		display: flex;
		gap: 0.5rem;
		align-items: center;
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
		font-size: 1.75rem;
		font-weight: 600;
		color: #111827;
	}

	.editor-layout {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 1.5rem;
		align-items: start;
	}

	.editor-main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Language Tabs */
	.lang-tabs {
		display: flex;
		gap: 0.25rem;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0;
		margin-bottom: 0.5rem;
	}

	.lang-tab {
		padding: 0.5rem 0.875rem;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		font-size: 0.875rem;
		color: #6b7280;
		transition: all 0.15s;
		margin-bottom: -1px;
	}

	.lang-tab:hover {
		color: #374151;
	}

	.lang-tab.active {
		color: #6366f1;
		border-bottom-color: #6366f1;
		font-weight: 500;
	}

	/* Fields */
	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.field-input,
	.field-textarea {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-family: inherit;
		box-sizing: border-box;
		background: #fff;
		color: #111827;
		transition: border-color 0.15s;
	}

	.field-input:focus,
	.field-textarea:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.field-textarea {
		resize: vertical;
		min-height: 80px;
	}

	/* SEO Panel */
	.seo-panel {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.seo-toggle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0.875rem 1rem;
		background: #f9fafb;
		border: none;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		text-align: left;
	}

	.seo-toggle:hover {
		background: #f3f4f6;
	}

	.chevron {
		font-size: 0.7rem;
		color: #9ca3af;
	}

	.seo-content {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.seo-tabs {
		margin-bottom: 0;
	}

	/* Sidebar */
	.editor-sidebar {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: sticky;
		top: 1rem;
	}

	.sidebar-card {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.card-title {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sidebar-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.btn-save {
		width: 100%;
		padding: 0.75rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-save:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-save:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.btn-delete {
		width: 100%;
		padding: 0.625rem;
		background: #fef2f2;
		color: #dc2626;
		border: 1px solid #fecaca;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.btn-delete:hover {
		background: #fee2e2;
	}

	.slug-row {
		display: flex;
		gap: 0.5rem;
	}

	.slug-row .field-input {
		flex: 1;
	}

	.btn-generate {
		padding: 0.625rem 0.75rem;
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		cursor: pointer;
		white-space: nowrap;
		color: #374151;
	}

	.btn-generate:hover {
		background: #e5e7eb;
	}

	/* Cover Image */
	.cover-preview {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.cover-preview img {
		width: 100%;
		height: 150px;
		object-fit: cover;
		border-radius: 0.375rem;
		border: 1px solid #e5e7eb;
	}

	.cover-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-sm {
		flex: 1;
		padding: 0.375rem;
		font-size: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		background: #f9fafb;
		cursor: pointer;
		color: #374151;
	}

	.btn-sm:hover {
		background: #f3f4f6;
	}

	.btn-sm.btn-danger {
		color: #dc2626;
		border-color: #fecaca;
		background: #fef2f2;
	}

	.btn-sm.btn-danger:hover {
		background: #fee2e2;
	}

	.btn-select-media {
		width: 100%;
		padding: 0.75rem;
		border: 2px dashed #d1d5db;
		border-radius: 0.375rem;
		background: #f9fafb;
		cursor: pointer;
		font-size: 0.875rem;
		color: #6b7280;
		transition: all 0.15s;
	}

	.btn-select-media:hover {
		border-color: #6366f1;
		color: #6366f1;
		background: #f5f3ff;
	}

	/* Checkboxes */
	.checkbox-field {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
		margin-bottom: 0.5rem;
		color: #374151;
	}

	.checkbox-field input[type="checkbox"] {
		width: 1rem;
		height: 1rem;
		accent-color: #6366f1;
	}

	.hint {
		margin: 0.25rem 0 0;
		font-size: 0.75rem;
		color: #9ca3af;
	}

	/* Media Picker Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal {
		background: white;
		border-radius: 0.75rem;
		width: 100%;
		max-width: 800px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
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
		font-size: 1.25rem;
		cursor: pointer;
		color: #6b7280;
		padding: 0.25rem;
	}

	.btn-close:hover {
		color: #111827;
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.5rem;
		padding: 1rem;
		overflow-y: auto;
	}

	.media-item {
		border: 2px solid transparent;
		border-radius: 0.375rem;
		overflow: hidden;
		cursor: pointer;
		padding: 0;
		background: #f9fafb;
		transition: border-color 0.15s;
		aspect-ratio: 1;
	}

	.media-item:hover {
		border-color: #6366f1;
	}

	.media-item.selected {
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
	}

	.media-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.empty-state {
		color: #9ca3af;
		font-size: 0.875rem;
		grid-column: 1 / -1;
		text-align: center;
		padding: 2rem;
	}

	/* Mobile responsive */
	@media (max-width: 900px) {
		.editor-layout {
			grid-template-columns: 1fr;
		}

		.editor-sidebar {
			position: static;
		}
	}

	/* Dark theme */
	:global(.dark) h1 { color: #f9fafb; }
	:global(.dark) .breadcrumb { color: #9ca3af; }
	:global(.dark) .field-label { color: #d1d5db; }
	:global(.dark) .card-title { color: #9ca3af; }
	:global(.dark) .checkbox-field { color: #d1d5db; }

	:global(.dark) .field-input,
	:global(.dark) .field-textarea {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}

	:global(.dark) .field-input:focus,
	:global(.dark) .field-textarea:focus {
		border-color: #818cf8;
	}

	:global(.dark) .sidebar-card {
		background: #1f2937;
		border-color: #374151;
	}

	:global(.dark) .seo-panel {
		border-color: #374151;
	}

	:global(.dark) .seo-toggle {
		background: #111827;
		color: #d1d5db;
	}

	:global(.dark) .seo-toggle:hover {
		background: #1f2937;
	}

	:global(.dark) .btn-generate {
		background: #374151;
		border-color: #4b5563;
		color: #d1d5db;
	}

	:global(.dark) .btn-generate:hover {
		background: #4b5563;
	}

	:global(.dark) .btn-select-media {
		background: #1f2937;
		border-color: #4b5563;
		color: #9ca3af;
	}

	:global(.dark) .btn-select-media:hover {
		border-color: #818cf8;
		color: #818cf8;
		background: #1e1b4b;
	}

	:global(.dark) .cover-preview img {
		border-color: #374151;
	}

	:global(.dark) .btn-sm {
		background: #374151;
		border-color: #4b5563;
		color: #d1d5db;
	}

	:global(.dark) .btn-sm:hover {
		background: #4b5563;
	}

	:global(.dark) .btn-delete {
		background: #7f1d1d;
		color: #fca5a5;
		border-color: #991b1b;
	}

	:global(.dark) .btn-delete:hover {
		background: #991b1b;
	}

	:global(.dark) .modal {
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
		background: #374151;
	}

	:global(.dark) .lang-tab {
		color: #9ca3af;
	}

	:global(.dark) .lang-tab:hover {
		color: #d1d5db;
	}

	:global(.dark) .lang-tab.active {
		color: #818cf8;
		border-bottom-color: #818cf8;
	}

	:global(.dark) .lang-tabs {
		border-color: #374151;
	}

	:global(.dark) .hint {
		color: #6b7280;
	}
</style>
