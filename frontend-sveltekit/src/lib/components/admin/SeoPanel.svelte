<script lang="ts">
	import MultilingualInput from './MultilingualInput.svelte';
	import MultilingualTextarea from './MultilingualTextarea.svelte';

	interface SeoData {
		seo_title: { en: string; ru: string; es: string; zh: string };
		seo_description: { en: string; ru: string; es: string; zh: string };
	}

	interface Props {
		title: { en: string; ru: string; es: string; zh: string };
		description: { en: string; ru: string; es: string; zh: string };
		previewUrl?: string;
		maxTitleLength?: number;
		maxDescriptionLength?: number;
	}

	let {
		title = $bindable({ en: '', ru: '', es: '', zh: '' }),
		description = $bindable({ en: '', ru: '', es: '', zh: '' }),
		previewUrl = 'https://k-liee.com/en/artworks/example',
		maxTitleLength = 60,
		maxDescriptionLength = 160
	}: Props = $props();

	// Character count helpers
	let titleLength = $derived(title.en.length);
	let descLength = $derived(description.en.length);
	let titleStatus = $derived(
		titleLength === 0 ? 'empty' : titleLength > maxTitleLength ? 'over' : 'ok'
	);
	let descStatus = $derived(
		descLength === 0 ? 'empty' : descLength > maxDescriptionLength ? 'over' : 'ok'
	);
</script>

<div class="seo-panel">
	<div class="seo-header">
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="11" cy="11" r="8"></circle>
			<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
		</svg>
		<span>SEO Settings</span>
	</div>

	<div class="seo-preview">
		<div class="preview-title">Google Search Preview</div>
		<div class="preview-box">
			<div class="preview-url">{previewUrl}</div>
			<div class="preview-headline">{title.en || 'Page Title'}</div>
			<div class="preview-description">
				{description.en || 'Add a meta description to improve your search engine visibility...'}
			</div>
		</div>
	</div>

	<div class="seo-fields">
		<div class="field-with-counter">
			<MultilingualInput
				label="SEO Title"
				values={title}
				placeholder="SEO optimized title"
			/>
			<div class="char-counter" class:over={titleStatus === 'over'}>
				{titleLength}/{maxTitleLength}
			</div>
			<input type="hidden" name="seo_title_en" value={title.en} />
			<input type="hidden" name="seo_title_ru" value={title.ru} />
			<input type="hidden" name="seo_title_es" value={title.es} />
			<input type="hidden" name="seo_title_zh" value={title.zh} />
		</div>

		<div class="field-with-counter">
			<MultilingualTextarea
				label="SEO Description"
				values={description}
				placeholder="Brief description for search results"
				rows={3}
			/>
			<div class="char-counter" class:over={descStatus === 'over'}>
				{descLength}/{maxDescriptionLength}
			</div>
			<input type="hidden" name="seo_description_en" value={description.en} />
			<input type="hidden" name="seo_description_ru" value={description.ru} />
			<input type="hidden" name="seo_description_es" value={description.es} />
			<input type="hidden" name="seo_description_zh" value={description.zh} />
		</div>
	</div>

	<div class="seo-tips">
		<strong>Tips:</strong>
		<ul>
			<li>Keep titles under {maxTitleLength} characters</li>
			<li>Descriptions should be {maxDescriptionLength} characters or less</li>
			<li>Include relevant keywords naturally</li>
			<li>Each page should have unique SEO content</li>
		</ul>
	</div>
</div>

<style>
	.seo-panel {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.seo-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: #334155;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.seo-header svg {
		color: #6366f1;
	}

	.seo-preview {
		margin-bottom: 1.5rem;
	}

	.preview-title {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #64748b;
		margin-bottom: 0.5rem;
	}

	.preview-box {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		padding: 1rem;
		font-family: Arial, sans-serif;
	}

	.preview-url {
		font-size: 0.75rem;
		color: #1a0dab;
		margin-bottom: 0.25rem;
	}

	.preview-headline {
		font-size: 1.125rem;
		color: #1a0dab;
		line-height: 1.3;
		margin-bottom: 0.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.preview-description {
		font-size: 0.875rem;
		color: #545454;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.seo-fields {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field-with-counter {
		position: relative;
	}

	.char-counter {
		position: absolute;
		right: 0;
		top: 0;
		font-size: 0.75rem;
		color: #64748b;
		padding: 0.25rem 0.5rem;
		background: #f1f5f9;
		border-radius: 0.25rem;
	}

	.char-counter.over {
		color: #ef4444;
		background: #fef2f2;
	}

	.seo-tips {
		margin-top: 1rem;
		padding: 0.75rem;
		background: #fff;
		border: 1px dashed #cbd5e1;
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		color: #64748b;
	}

	.seo-tips strong {
		display: block;
		margin-bottom: 0.375rem;
		color: #475569;
	}

	.seo-tips ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	.seo-tips li {
		margin-bottom: 0.25rem;
	}

	.seo-tips li:last-child {
		margin-bottom: 0;
	}
</style>
