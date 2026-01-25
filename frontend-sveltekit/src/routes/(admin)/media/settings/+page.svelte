<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let saving = $state(false);

	// Preview text
	let previewText = $state(data.settings.watermark_text);
	let previewOpacity = $state(data.settings.watermark_opacity);
</script>

<svelte:head>
	<title>Media Settings | Admin</title>
</svelte:head>

<div class="admin-page">
	<div class="page-header">
		<h1>Media Settings</h1>
		<p class="subtitle">Configure watermark and image processing</p>
	</div>

	{#if form?.error}
		<div class="alert error">{form.error}</div>
	{/if}

	{#if form?.success}
		<div class="alert success">Settings saved successfully!</div>
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
		<input type="hidden" name="csrf_token" value={data.csrfToken} />
		<div class="form-section">
			<h2>Watermark</h2>
			<p class="section-description">
				Configure the watermark that will be added to all uploaded images.
			</p>

			<div class="form-group">
				<label>
					<input
						type="checkbox"
						name="watermark_enabled"
						checked={data.settings.watermark_enabled}
					/>
					Enable Watermark
				</label>
				<p class="help-text">When enabled, watermark will be added to all new uploaded images.</p>
			</div>

			<div class="form-group">
				<label for="watermark_text">Watermark Text</label>
				<input
					type="text"
					name="watermark_text"
					id="watermark_text"
					value={data.settings.watermark_text}
					oninput={(e) => previewText = (e.target as HTMLInputElement).value}
					placeholder="K-LIÉE"
					required
				/>
				<p class="help-text">Text to display as watermark (e.g., K-LIÉE)</p>
			</div>

			<div class="form-group">
				<label for="watermark_opacity">Opacity: {previewOpacity}</label>
				<input
					type="range"
					name="watermark_opacity"
					id="watermark_opacity"
					min="0.1"
					max="1"
					step="0.1"
					value={data.settings.watermark_opacity}
					oninput={(e) => previewOpacity = parseFloat((e.target as HTMLInputElement).value)}
				/>
				<p class="help-text">0.1 = almost invisible, 1.0 = fully visible</p>
			</div>

			<div class="preview-section">
				<h3>Preview</h3>
				<div class="watermark-preview">
					<div class="preview-image">
						<div
							class="preview-watermark"
							style="opacity: {previewOpacity}"
						>
							{previewText}
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="form-section">
			<h2>Image Quality</h2>
			<p class="section-description">
				Configure output quality for processed images. Higher quality = larger file size.
			</p>

			<div class="form-group">
				<label for="image_quality">Quality: {data.settings.image_quality}%</label>
				<input
					type="range"
					name="image_quality"
					id="image_quality"
					min="50"
					max="100"
					step="1"
					value={data.settings.image_quality}
				/>
				<p class="help-text">Recommended: 90-95% for high quality, 80-85% for web optimization</p>
			</div>

			<div class="info-box">
				<strong>Output Format:</strong> WebP<br>
				All images will be converted to WebP format for optimal quality and file size.
			</div>
		</div>

		<div class="form-section">
			<h2>Processing Info</h2>
			<ul class="info-list">
				<li>Images are automatically converted to WebP format</li>
				<li>Watermark is added to both original and all thumbnails</li>
				<li>Thumbnail sizes: 150px, 300px, 600px, 1200px</li>
				<li>Watermark position: bottom-right corner</li>
				<li>Font: Georgia (serif) with drop shadow</li>
			</ul>
		</div>

		<div class="form-actions">
			<button type="submit" class="btn primary" disabled={saving}>
				{saving ? 'Saving...' : 'Save Settings'}
			</button>
		</div>
	</form>
</div>

<style>
	.admin-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 32px;
	}

	.page-header {
		margin-bottom: 32px;
	}

	.page-header h1 {
		margin: 0 0 8px;
		font-size: 28px;
		font-weight: 600;
	}

	.subtitle {
		color: var(--text-secondary, #6b7280);
		margin: 0;
	}

	.alert {
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 24px;
	}

	.alert.error {
		background: #fee2e2;
		color: #dc2626;
	}

	.alert.success {
		background: #dcfce7;
		color: #16a34a;
	}

	:global(.dark) .alert.error {
		background: rgba(220, 38, 38, 0.2);
	}

	:global(.dark) .alert.success {
		background: rgba(22, 163, 74, 0.2);
	}

	.form-section {
		background: var(--bg-secondary, #f9fafb);
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 24px;
	}

	:global(.dark) .form-section {
		background: var(--bg-tertiary, #1f2937);
	}

	.form-section h2 {
		margin: 0 0 8px;
		font-size: 18px;
		font-weight: 600;
	}

	.form-section h3 {
		margin: 16px 0 8px;
		font-size: 14px;
		font-weight: 600;
		color: var(--text-secondary, #6b7280);
	}

	.section-description {
		color: var(--text-secondary, #6b7280);
		margin: 0 0 16px;
		font-size: 14px;
	}

	.form-group {
		margin-bottom: 16px;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group label {
		display: block;
		font-weight: 500;
		margin-bottom: 6px;
		font-size: 14px;
	}

	.form-group input[type="checkbox"] {
		margin-right: 8px;
	}

	.form-group input[type="text"],
	.form-group input[type="number"] {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid var(--border-primary, #e5e7eb);
		border-radius: 8px;
		font-size: 14px;
		background: var(--bg-primary, #ffffff);
		color: var(--text-primary, #111827);
	}

	.form-group input[type="range"] {
		width: 100%;
		height: 8px;
		-webkit-appearance: none;
		appearance: none;
		background: #e5e7eb;
		border-radius: 4px;
		outline: none;
	}

	.form-group input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 50%;
		cursor: pointer;
	}

	:global(.dark) .form-group input[type="text"],
	:global(.dark) .form-group input[type="number"] {
		background: var(--bg-secondary, #374151);
		border-color: var(--border-secondary, #4b5563);
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--accent, #667eea);
	}

	.help-text {
		font-size: 12px;
		color: var(--text-tertiary, #9ca3af);
		margin: 4px 0 0;
	}

	.preview-section {
		margin-top: 16px;
	}

	.watermark-preview {
		border: 1px solid var(--border-primary, #e5e7eb);
		border-radius: 8px;
		overflow: hidden;
	}

	.preview-image {
		position: relative;
		width: 100%;
		height: 200px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		padding: 20px;
	}

	.preview-watermark {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 24px;
		font-weight: 600;
		color: white;
		text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
	}

	.info-box {
		background: rgba(102, 126, 234, 0.1);
		border: 1px solid rgba(102, 126, 234, 0.3);
		border-radius: 8px;
		padding: 12px 16px;
		font-size: 14px;
		color: var(--text-primary, #111827);
	}

	:global(.dark) .info-box {
		background: rgba(102, 126, 234, 0.2);
	}

	.info-list {
		margin: 0;
		padding-left: 20px;
		font-size: 14px;
		color: var(--text-secondary, #6b7280);
	}

	.info-list li {
		margin-bottom: 8px;
	}

	.info-list li:last-child {
		margin-bottom: 0;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
	}

	.btn {
		padding: 10px 20px;
		border-radius: 8px;
		font-weight: 500;
		font-size: 14px;
		cursor: pointer;
		border: none;
		transition: all 0.2s;
	}

	.btn.primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn.primary:hover:not(:disabled) {
		filter: brightness(1.1);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 600px) {
		.admin-page {
			padding: 16px;
		}
	}
</style>
