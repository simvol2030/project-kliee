<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import MultilingualInput from '$lib/components/admin/MultilingualInput.svelte';
	import MultilingualTextarea from '$lib/components/admin/MultilingualTextarea.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const isNew = data.isNew;

	// Form state
	let sku = $state(data.product?.sku || '');
	let artworkId = $state(data.product?.artwork_id || '');
	let titleEn = $state(data.product?.title_en || '');
	let titleRu = $state(data.product?.title_ru || '');
	let titleEs = $state(data.product?.title_es || '');
	let titleZh = $state(data.product?.title_zh || '');
	let descriptionEn = $state(data.product?.description_en || '');
	let descriptionRu = $state(data.product?.description_ru || '');
	let descriptionEs = $state(data.product?.description_es || '');
	let descriptionZh = $state(data.product?.description_zh || '');
	let priceEur = $state(data.product?.price_eur?.toString() || '');
	let comparePriceEur = $state(data.product?.compare_price_eur?.toString() || '');
	let stockQuantity = $state(data.product?.stock_quantity?.toString() || '1');
	let isUnlimited = $state(data.product?.is_unlimited ?? false);
	let shippingClass = $state(data.product?.shipping_class || 'standard');
	let weightKg = $state(data.product?.weight_kg || '');
	let dimensionsCm = $state(data.product?.dimensions_cm || '');
	let isVisible = $state(data.product?.is_visible ?? true);
	let isFeatured = $state(data.product?.is_featured ?? false);
	let orderIndex = $state(data.product?.order_index?.toString() || '0');

	// Images state
	let images = $state(data.images || []);
	let showMediaPicker = $state(false);
	let selectedMediaId = $state<number | null>(null);

	// UI state
	let saving = $state(false);
	let activeTab = $state<'en' | 'ru' | 'es' | 'zh'>('en');
	let message = $state('');
	let messageType = $state<'success' | 'error'>('success');

	// Handle artwork selection - auto-fill data
	function handleArtworkSelect(e: Event) {
		const target = e.target as HTMLSelectElement;
		const selectedId = target.value;
		artworkId = selectedId;

		if (selectedId) {
			const artwork = data.availableArtworks.find((a) => a.id === selectedId);
			if (artwork) {
				// Auto-fill title if empty
				if (!titleEn) {
					titleEn = artwork.title_en;
					titleRu = artwork.title_ru;
				}
				// Auto-fill price if empty
				if (!priceEur && artwork.price) {
					priceEur = artwork.price.toString();
				}
			}
		}
	}

	// Handle form submit
	async function handleSubmit(e: Event) {
		e.preventDefault();
		saving = true;

		const formData = new FormData();
		formData.append('sku', sku);
		formData.append('artwork_id', artworkId);
		formData.append('title_en', titleEn);
		formData.append('title_ru', titleRu);
		formData.append('title_es', titleEs);
		formData.append('title_zh', titleZh);
		formData.append('description_en', descriptionEn);
		formData.append('description_ru', descriptionRu);
		formData.append('description_es', descriptionEs);
		formData.append('description_zh', descriptionZh);
		formData.append('price_eur', priceEur);
		formData.append('compare_price_eur', comparePriceEur);
		formData.append('stock_quantity', stockQuantity);
		formData.append('is_unlimited', isUnlimited.toString());
		formData.append('shipping_class', shippingClass);
		formData.append('weight_kg', weightKg);
		formData.append('dimensions_cm', dimensionsCm);
		formData.append('is_visible', isVisible.toString());
		formData.append('is_featured', isFeatured.toString());
		formData.append('order_index', orderIndex);

		try {
			const response = await fetch('?/save', {
				method: 'POST',
				body: formData
			});

			if (response.redirected) {
				window.location.href = response.url;
				return;
			}

			const result = await response.json();
			if (result.type === 'success') {
				message = 'Product saved successfully';
				messageType = 'success';
			} else {
				message = result.data?.error || 'Failed to save product';
				messageType = 'error';
			}
		} catch (err) {
			message = 'Error saving product';
			messageType = 'error';
		} finally {
			saving = false;
			setTimeout(() => (message = ''), 3000);
		}
	}

	// Add image
	async function addImage(mediaId: number, isPrimary: boolean = false) {
		const formData = new FormData();
		formData.append('media_id', mediaId.toString());
		formData.append('is_primary', isPrimary.toString());

		const response = await fetch('?/addImage', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			// Reload page to get updated images
			window.location.reload();
		}
	}

	// Remove image
	async function removeImage(imageId: number) {
		const formData = new FormData();
		formData.append('image_id', imageId.toString());

		const response = await fetch('?/removeImage', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			images = images.filter((img) => img.id !== imageId);
		}
	}

	// Set primary image
	async function setAsPrimary(imageId: number) {
		const formData = new FormData();
		formData.append('image_id', imageId.toString());

		const response = await fetch('?/setPrimary', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			images = images.map((img) => ({
				...img,
				is_primary: img.id === imageId
			}));
		}
	}

	// Get title by active tab
	const currentTitle = $derived(
		activeTab === 'ru' ? titleRu : activeTab === 'es' ? titleEs : activeTab === 'zh' ? titleZh : titleEn
	);

	// Get description by active tab
	const currentDescription = $derived(
		activeTab === 'ru'
			? descriptionRu
			: activeTab === 'es'
				? descriptionEs
				: activeTab === 'zh'
					? descriptionZh
					: descriptionEn
	);
</script>

<div class="page">
	<div class="page-header">
		<div class="header-content">
			<a href="/shop/products" class="back-link">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
					<polyline points="15 18 9 12 15 6" />
				</svg>
				Back to Products
			</a>
			<h1>{isNew ? 'New Product' : 'Edit Product'}</h1>
		</div>
	</div>

	{#if message}
		<div class="message" class:success={messageType === 'success'} class:error={messageType === 'error'}>
			{message}
		</div>
	{/if}

	{#if form?.error}
		<div class="message error">{form.error}</div>
	{/if}

	<form onsubmit={handleSubmit}>
		<div class="form-layout">
			<!-- Main Content -->
			<div class="main-content">
				<!-- Language Tabs -->
				<div class="card">
					<div class="language-tabs">
						<button type="button" class:active={activeTab === 'en'} onclick={() => (activeTab = 'en')}>
							EN
						</button>
						<button type="button" class:active={activeTab === 'ru'} onclick={() => (activeTab = 'ru')}>
							RU
						</button>
						<button type="button" class:active={activeTab === 'es'} onclick={() => (activeTab = 'es')}>
							ES
						</button>
						<button type="button" class:active={activeTab === 'zh'} onclick={() => (activeTab = 'zh')}>
							ZH
						</button>
					</div>

					<div class="form-group">
						<label for="title">Title ({activeTab.toUpperCase()}) *</label>
						{#if activeTab === 'en'}
							<input type="text" id="title" bind:value={titleEn} required />
						{:else if activeTab === 'ru'}
							<input type="text" id="title" bind:value={titleRu} required />
						{:else if activeTab === 'es'}
							<input type="text" id="title" bind:value={titleEs} required />
						{:else}
							<input type="text" id="title" bind:value={titleZh} required />
						{/if}
					</div>

					<div class="form-group">
						<label for="description">Description ({activeTab.toUpperCase()})</label>
						{#if activeTab === 'en'}
							<textarea id="description" bind:value={descriptionEn} rows="4"></textarea>
						{:else if activeTab === 'ru'}
							<textarea id="description" bind:value={descriptionRu} rows="4"></textarea>
						{:else if activeTab === 'es'}
							<textarea id="description" bind:value={descriptionEs} rows="4"></textarea>
						{:else}
							<textarea id="description" bind:value={descriptionZh} rows="4"></textarea>
						{/if}
					</div>
				</div>

				<!-- Pricing -->
				<div class="card">
					<h3>Pricing</h3>
					<div class="form-row">
						<div class="form-group">
							<label for="price_eur">Price (EUR) *</label>
							<input type="number" id="price_eur" bind:value={priceEur} min="0" required />
						</div>
						<div class="form-group">
							<label for="compare_price">Compare Price (EUR)</label>
							<input type="number" id="compare_price" bind:value={comparePriceEur} min="0" />
							<span class="help-text">Original price for sale display</span>
						</div>
					</div>
				</div>

				<!-- Inventory -->
				<div class="card">
					<h3>Inventory</h3>
					<div class="form-row">
						<div class="form-group">
							<label for="sku">SKU</label>
							<input type="text" id="sku" bind:value={sku} placeholder="e.g., ART-001" />
						</div>
						<div class="form-group">
							<label for="stock">Stock Quantity</label>
							<input
								type="number"
								id="stock"
								bind:value={stockQuantity}
								min="0"
								disabled={isUnlimited}
							/>
						</div>
					</div>
					<div class="checkbox-group">
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={isUnlimited} />
							<span>Unlimited stock (for originals/digital)</span>
						</label>
					</div>
				</div>

				<!-- Shipping -->
				<div class="card">
					<h3>Shipping</h3>
					<div class="form-row">
						<div class="form-group">
							<label for="shipping_class">Shipping Class</label>
							<select id="shipping_class" bind:value={shippingClass}>
								<option value="standard">Standard</option>
								<option value="fragile">Fragile (artwork)</option>
								<option value="oversized">Oversized</option>
							</select>
						</div>
						<div class="form-group">
							<label for="weight">Weight (kg)</label>
							<input type="text" id="weight" bind:value={weightKg} placeholder="e.g., 2.5" />
						</div>
					</div>
					<div class="form-group">
						<label for="dimensions">Dimensions (cm)</label>
						<input
							type="text"
							id="dimensions"
							bind:value={dimensionsCm}
							placeholder="e.g., 60x40x5"
						/>
					</div>
				</div>

				<!-- Images (only for existing products) -->
				{#if !isNew}
					<div class="card">
						<h3>Images</h3>
						{#if images.length > 0}
							<div class="images-grid">
								{#each images as image}
									<div class="image-item" class:primary={image.is_primary}>
										{#if image.url}
											<img src={image.url} alt="Product" />
										{:else}
											<div class="no-image">No image</div>
										{/if}
										<div class="image-actions">
											{#if !image.is_primary}
												<button type="button" class="btn-small" onclick={() => setAsPrimary(image.id)}>
													Set Primary
												</button>
											{:else}
												<span class="primary-badge">Primary</span>
											{/if}
											<button
												type="button"
												class="btn-small danger"
												onclick={() => removeImage(image.id)}
											>
												Remove
											</button>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="empty-text">No images added yet</p>
						{/if}

						<button type="button" class="btn-secondary" onclick={() => (showMediaPicker = true)}>
							+ Add Image
						</button>
					</div>
				{/if}
			</div>

			<!-- Sidebar -->
			<div class="sidebar">
				<!-- Status Card -->
				<div class="card">
					<h3>Status</h3>
					<div class="checkbox-group">
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={isVisible} />
							<span>Visible in shop</span>
						</label>
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={isFeatured} />
							<span>Featured product</span>
						</label>
					</div>
					<div class="form-group">
						<label for="order">Display Order</label>
						<input type="number" id="order" bind:value={orderIndex} min="0" />
					</div>
				</div>

				<!-- Link to Artwork -->
				<div class="card">
					<h3>Link to Artwork</h3>
					<div class="form-group">
						<label for="artwork">Select Artwork (optional)</label>
						<select id="artwork" value={artworkId} onchange={handleArtworkSelect}>
							<option value="">— No linked artwork —</option>
							{#each data.availableArtworks as artwork}
								<option value={artwork.id}>
									{artwork.title_en}
									{#if artwork.price}(€{artwork.price}){/if}
								</option>
							{/each}
						</select>
						<span class="help-text">Link to artwork for images and details</span>
					</div>
				</div>

				<!-- Save Button -->
				<div class="card">
					<button type="submit" class="btn-primary full-width" disabled={saving}>
						{#if saving}
							Saving...
						{:else}
							{isNew ? 'Create Product' : 'Save Changes'}
						{/if}
					</button>
				</div>
			</div>
		</div>
	</form>
</div>

<!-- Media Picker Modal -->
{#if showMediaPicker}
	<div class="modal-overlay" onclick={() => (showMediaPicker = false)}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Select Image</h2>
				<button type="button" class="btn-close" onclick={() => (showMediaPicker = false)}>×</button>
			</div>
			<div class="modal-body">
				<div class="media-grid">
					{#each data.allMedia as item}
						<button
							type="button"
							class="media-item"
							class:selected={selectedMediaId === item.id}
							onclick={() => (selectedMediaId = item.id)}
						>
							<img src={`/uploads/${item.folder || 'uploads'}/${item.stored_filename}`} alt={item.filename} />
						</button>
					{/each}
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn-secondary" onclick={() => (showMediaPicker = false)}>
					Cancel
				</button>
				<button
					type="button"
					class="btn-primary"
					disabled={!selectedMediaId}
					onclick={() => {
						if (selectedMediaId) {
							addImage(selectedMediaId, images.length === 0);
							showMediaPicker = false;
							selectedMediaId = null;
						}
					}}
				>
					Add Image
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page {
		max-width: 1200px;
	}

	.page-header {
		margin-bottom: 1.5rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: #6b7280;
		text-decoration: none;
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
	}

	.back-link:hover {
		color: #1a1a1a;
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		color: #1a1a1a;
	}

	.message {
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.message.success {
		background: #ecfdf5;
		color: #059669;
	}

	.message.error {
		background: #fef2f2;
		color: #dc2626;
	}

	.form-layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 1.5rem;
	}

	.card {
		background: white;
		border-radius: 0.5rem;
		padding: 1.25rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1rem;
	}

	.card h3 {
		margin: 0 0 1rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.language-tabs {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.5rem;
	}

	.language-tabs button {
		padding: 0.375rem 0.75rem;
		background: none;
		border: none;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: #6b7280;
		cursor: pointer;
	}

	.language-tabs button:hover {
		background: #f3f4f6;
	}

	.language-tabs button.active {
		background: #667eea;
		color: white;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
	}

	.form-group input:disabled {
		background: #f3f4f6;
		cursor: not-allowed;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.help-text {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.checkbox-label input {
		width: auto;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary.full-width {
		width: 100%;
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		cursor: pointer;
	}

	.btn-secondary:hover {
		background: #f9fafb;
	}

	/* Images Grid */
	.images-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.image-item {
		position: relative;
		border: 2px solid #e5e7eb;
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.image-item.primary {
		border-color: #667eea;
	}

	.image-item img {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
	}

	.image-actions {
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.btn-small {
		padding: 0.25rem 0.5rem;
		font-size: 0.6875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		background: white;
		cursor: pointer;
	}

	.btn-small:hover {
		background: #f3f4f6;
	}

	.btn-small.danger {
		color: #dc2626;
		border-color: #fecaca;
	}

	.btn-small.danger:hover {
		background: #fef2f2;
	}

	.primary-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background: #667eea;
		color: white;
		font-size: 0.6875rem;
		border-radius: 0.25rem;
		text-align: center;
	}

	.empty-text {
		color: #6b7280;
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem;
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

	.modal {
		background: white;
		border-radius: 0.5rem;
		max-width: 800px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
	}

	.btn-close {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
	}

	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
		flex: 1;
	}

	.modal-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.75rem;
	}

	.media-item {
		padding: 0;
		border: 2px solid #e5e7eb;
		border-radius: 0.375rem;
		overflow: hidden;
		cursor: pointer;
		background: none;
	}

	.media-item:hover {
		border-color: #9ca3af;
	}

	.media-item.selected {
		border-color: #667eea;
	}

	.media-item img {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.form-layout {
			grid-template-columns: 1fr;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.sidebar {
			order: -1;
		}
	}
</style>
