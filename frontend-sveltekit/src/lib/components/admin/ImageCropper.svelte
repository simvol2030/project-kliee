<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface CropArea {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	interface Props {
		imageUrl: string;
		mediaId: number;
		aspectRatio?: number | null;
		minWidth?: number;
		minHeight?: number;
		onCrop?: (result: { mediaId: number; url: string }) => void;
		onCancel?: () => void;
	}

	let {
		imageUrl,
		mediaId,
		aspectRatio = null,
		minWidth = 50,
		minHeight = 50,
		onCrop,
		onCancel
	}: Props = $props();

	let containerRef: HTMLDivElement;
	let imageRef: HTMLImageElement;
	let canvasRef: HTMLCanvasElement;

	let imageLoaded = $state(false);
	let processing = $state(false);
	let error = $state<string | null>(null);

	// Image dimensions
	let naturalWidth = $state(0);
	let naturalHeight = $state(0);
	let displayWidth = $state(0);
	let displayHeight = $state(0);
	let scale = $state(1);

	// Crop area in natural image coordinates
	let cropArea = $state<CropArea>({
		x: 0,
		y: 0,
		width: 0,
		height: 0
	});

	// Dragging state
	let isDragging = $state(false);
	let dragMode = $state<'move' | 'resize' | null>(null);
	let resizeHandle = $state<string | null>(null);
	let dragStart = $state({ x: 0, y: 0 });
	let cropStart = $state<CropArea>({ x: 0, y: 0, width: 0, height: 0 });

	// Resize options
	let resizeEnabled = $state(false);
	let resizeWidth = $state(800);
	let resizeHeight = $state(600);
	let replaceOriginal = $state(false);

	onMount(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('touchend', handleTouchEnd);
	});

	onDestroy(() => {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
		document.removeEventListener('touchmove', handleTouchMove);
		document.removeEventListener('touchend', handleTouchEnd);
	});

	function handleImageLoad() {
		if (!imageRef) return;

		naturalWidth = imageRef.naturalWidth;
		naturalHeight = imageRef.naturalHeight;

		// Calculate display size (max 600px)
		const maxSize = 600;
		if (naturalWidth > naturalHeight) {
			displayWidth = Math.min(naturalWidth, maxSize);
			scale = displayWidth / naturalWidth;
			displayHeight = naturalHeight * scale;
		} else {
			displayHeight = Math.min(naturalHeight, maxSize);
			scale = displayHeight / naturalHeight;
			displayWidth = naturalWidth * scale;
		}

		// Initialize crop area (centered, 80% of image)
		const initialWidth = naturalWidth * 0.8;
		const initialHeight = aspectRatio
			? initialWidth / aspectRatio
			: naturalHeight * 0.8;

		cropArea = {
			x: (naturalWidth - initialWidth) / 2,
			y: (naturalHeight - Math.min(initialHeight, naturalHeight * 0.8)) / 2,
			width: initialWidth,
			height: Math.min(initialHeight, naturalHeight * 0.8)
		};

		imageLoaded = true;
		drawOverlay();
	}

	function drawOverlay() {
		if (!canvasRef || !imageLoaded) return;

		const ctx = canvasRef.getContext('2d');
		if (!ctx) return;

		canvasRef.width = displayWidth;
		canvasRef.height = displayHeight;

		// Draw semi-transparent overlay
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, 0, displayWidth, displayHeight);

		// Clear crop area
		const displayCrop = {
			x: cropArea.x * scale,
			y: cropArea.y * scale,
			width: cropArea.width * scale,
			height: cropArea.height * scale
		};

		ctx.clearRect(displayCrop.x, displayCrop.y, displayCrop.width, displayCrop.height);

		// Draw crop border
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 2;
		ctx.strokeRect(displayCrop.x, displayCrop.y, displayCrop.width, displayCrop.height);

		// Draw grid (rule of thirds)
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.lineWidth = 1;

		const thirdW = displayCrop.width / 3;
		const thirdH = displayCrop.height / 3;

		for (let i = 1; i < 3; i++) {
			ctx.beginPath();
			ctx.moveTo(displayCrop.x + thirdW * i, displayCrop.y);
			ctx.lineTo(displayCrop.x + thirdW * i, displayCrop.y + displayCrop.height);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(displayCrop.x, displayCrop.y + thirdH * i);
			ctx.lineTo(displayCrop.x + displayCrop.width, displayCrop.y + thirdH * i);
			ctx.stroke();
		}

		// Draw resize handles
		ctx.fillStyle = '#fff';
		const handleSize = 10;
		const handles = [
			{ x: displayCrop.x - handleSize / 2, y: displayCrop.y - handleSize / 2 },
			{ x: displayCrop.x + displayCrop.width / 2 - handleSize / 2, y: displayCrop.y - handleSize / 2 },
			{ x: displayCrop.x + displayCrop.width - handleSize / 2, y: displayCrop.y - handleSize / 2 },
			{ x: displayCrop.x - handleSize / 2, y: displayCrop.y + displayCrop.height / 2 - handleSize / 2 },
			{ x: displayCrop.x + displayCrop.width - handleSize / 2, y: displayCrop.y + displayCrop.height / 2 - handleSize / 2 },
			{ x: displayCrop.x - handleSize / 2, y: displayCrop.y + displayCrop.height - handleSize / 2 },
			{ x: displayCrop.x + displayCrop.width / 2 - handleSize / 2, y: displayCrop.y + displayCrop.height - handleSize / 2 },
			{ x: displayCrop.x + displayCrop.width - handleSize / 2, y: displayCrop.y + displayCrop.height - handleSize / 2 }
		];

		handles.forEach((h) => {
			ctx.fillRect(h.x, h.y, handleSize, handleSize);
		});
	}

	$effect(() => {
		if (imageLoaded) {
			drawOverlay();
		}
	});

	function getEventPosition(e: { clientX: number; clientY: number }): { x: number; y: number } {
		if (!canvasRef) return { x: 0, y: 0 };
		const rect = canvasRef.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left) / scale,
			y: (e.clientY - rect.top) / scale
		};
	}

	function getHandle(x: number, y: number): string | null {
		const threshold = 15 / scale;
		const c = cropArea;

		if (Math.abs(x - c.x) < threshold && Math.abs(y - c.y) < threshold) return 'nw';
		if (Math.abs(x - (c.x + c.width / 2)) < threshold && Math.abs(y - c.y) < threshold) return 'n';
		if (Math.abs(x - (c.x + c.width)) < threshold && Math.abs(y - c.y) < threshold) return 'ne';
		if (Math.abs(x - c.x) < threshold && Math.abs(y - (c.y + c.height / 2)) < threshold) return 'w';
		if (Math.abs(x - (c.x + c.width)) < threshold && Math.abs(y - (c.y + c.height / 2)) < threshold) return 'e';
		if (Math.abs(x - c.x) < threshold && Math.abs(y - (c.y + c.height)) < threshold) return 'sw';
		if (Math.abs(x - (c.x + c.width / 2)) < threshold && Math.abs(y - (c.y + c.height)) < threshold) return 's';
		if (Math.abs(x - (c.x + c.width)) < threshold && Math.abs(y - (c.y + c.height)) < threshold) return 'se';

		return null;
	}

	function isInsideCrop(x: number, y: number): boolean {
		const c = cropArea;
		return x >= c.x && x <= c.x + c.width && y >= c.y && y <= c.y + c.height;
	}

	function handleMouseDown(e: MouseEvent) {
		const pos = getEventPosition(e);
		const handle = getHandle(pos.x, pos.y);

		if (handle) {
			isDragging = true;
			dragMode = 'resize';
			resizeHandle = handle;
		} else if (isInsideCrop(pos.x, pos.y)) {
			isDragging = true;
			dragMode = 'move';
		}

		if (isDragging) {
			dragStart = pos;
			cropStart = { ...cropArea };
			e.preventDefault();
		}
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			const pos = getEventPosition(e.touches[0]);
			const handle = getHandle(pos.x, pos.y);

			if (handle) {
				isDragging = true;
				dragMode = 'resize';
				resizeHandle = handle;
			} else if (isInsideCrop(pos.x, pos.y)) {
				isDragging = true;
				dragMode = 'move';
			}

			if (isDragging) {
				dragStart = pos;
				cropStart = { ...cropArea };
				e.preventDefault();
			}
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		const pos = getEventPosition(e);
		updateCrop(pos);
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging || e.touches.length !== 1) return;
		e.preventDefault();
		const pos = getEventPosition(e.touches[0]);
		updateCrop(pos);
	}

	function updateCrop(pos: { x: number; y: number }) {
		const dx = pos.x - dragStart.x;
		const dy = pos.y - dragStart.y;

		if (dragMode === 'move') {
			let newX = cropStart.x + dx;
			let newY = cropStart.y + dy;

			// Constrain to image bounds
			newX = Math.max(0, Math.min(newX, naturalWidth - cropArea.width));
			newY = Math.max(0, Math.min(newY, naturalHeight - cropArea.height));

			cropArea = { ...cropArea, x: newX, y: newY };
		} else if (dragMode === 'resize' && resizeHandle) {
			let newCrop = { ...cropStart };

			switch (resizeHandle) {
				case 'nw':
					newCrop.x = Math.min(cropStart.x + dx, cropStart.x + cropStart.width - minWidth);
					newCrop.y = Math.min(cropStart.y + dy, cropStart.y + cropStart.height - minHeight);
					newCrop.width = cropStart.width - (newCrop.x - cropStart.x);
					newCrop.height = cropStart.height - (newCrop.y - cropStart.y);
					break;
				case 'n':
					newCrop.y = Math.min(cropStart.y + dy, cropStart.y + cropStart.height - minHeight);
					newCrop.height = cropStart.height - (newCrop.y - cropStart.y);
					break;
				case 'ne':
					newCrop.y = Math.min(cropStart.y + dy, cropStart.y + cropStart.height - minHeight);
					newCrop.width = Math.max(minWidth, cropStart.width + dx);
					newCrop.height = cropStart.height - (newCrop.y - cropStart.y);
					break;
				case 'w':
					newCrop.x = Math.min(cropStart.x + dx, cropStart.x + cropStart.width - minWidth);
					newCrop.width = cropStart.width - (newCrop.x - cropStart.x);
					break;
				case 'e':
					newCrop.width = Math.max(minWidth, cropStart.width + dx);
					break;
				case 'sw':
					newCrop.x = Math.min(cropStart.x + dx, cropStart.x + cropStart.width - minWidth);
					newCrop.width = cropStart.width - (newCrop.x - cropStart.x);
					newCrop.height = Math.max(minHeight, cropStart.height + dy);
					break;
				case 's':
					newCrop.height = Math.max(minHeight, cropStart.height + dy);
					break;
				case 'se':
					newCrop.width = Math.max(minWidth, cropStart.width + dx);
					newCrop.height = Math.max(minHeight, cropStart.height + dy);
					break;
			}

			// Apply aspect ratio constraint
			if (aspectRatio) {
				if (['n', 's', 'nw', 'sw', 'ne', 'se'].includes(resizeHandle)) {
					newCrop.width = newCrop.height * aspectRatio;
				} else {
					newCrop.height = newCrop.width / aspectRatio;
				}
			}

			// Constrain to image bounds
			newCrop.x = Math.max(0, newCrop.x);
			newCrop.y = Math.max(0, newCrop.y);
			newCrop.width = Math.min(newCrop.width, naturalWidth - newCrop.x);
			newCrop.height = Math.min(newCrop.height, naturalHeight - newCrop.y);

			cropArea = newCrop;
		}

		drawOverlay();
	}

	function handleMouseUp() {
		isDragging = false;
		dragMode = null;
		resizeHandle = null;
	}

	function handleTouchEnd() {
		handleMouseUp();
	}

	async function applyCrop() {
		processing = true;
		error = null;

		try {
			const response = await fetch('/api/admin/crop', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mediaId,
					crop: {
						x: Math.round(cropArea.x),
						y: Math.round(cropArea.y),
						width: Math.round(cropArea.width),
						height: Math.round(cropArea.height)
					},
					resize: resizeEnabled ? { width: resizeWidth, height: resizeHeight } : undefined,
					replaceOriginal
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to crop image');
			}

			const result = await response.json();

			if (onCrop) {
				onCrop({ mediaId: result.media.id, url: result.media.url });
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to crop image';
		} finally {
			processing = false;
		}
	}

	// Aspect ratio presets
	const aspectPresets = [
		{ label: 'Free', value: null },
		{ label: '1:1', value: 1 },
		{ label: '4:3', value: 4 / 3 },
		{ label: '16:9', value: 16 / 9 },
		{ label: '3:2', value: 3 / 2 },
		{ label: '2:3', value: 2 / 3 }
	];

	function setAspectRatio(value: number | null) {
		aspectRatio = value;
		if (value && cropArea.width > 0) {
			cropArea = {
				...cropArea,
				height: cropArea.width / value
			};
			// Constrain to bounds
			if (cropArea.y + cropArea.height > naturalHeight) {
				cropArea.height = naturalHeight - cropArea.y;
				cropArea.width = cropArea.height * value;
			}
			drawOverlay();
		}
	}
</script>

<div class="cropper-modal">
	<div class="cropper-container">
		<div class="cropper-header">
			<h2>Crop Image</h2>
			<button class="close-btn" onclick={() => onCancel?.()} aria-label="Close">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<div class="cropper-body">
			<div class="image-container" bind:this={containerRef}>
				<img
					bind:this={imageRef}
					src={imageUrl}
					alt="Image to crop"
					onload={handleImageLoad}
					style="width: {displayWidth}px; height: {displayHeight}px;"
				/>
				{#if imageLoaded}
					<canvas
						bind:this={canvasRef}
						class="crop-overlay"
						style="width: {displayWidth}px; height: {displayHeight}px;"
						onmousedown={handleMouseDown}
						ontouchstart={handleTouchStart}
					></canvas>
				{/if}
			</div>

			<div class="cropper-sidebar">
				<div class="option-group">
					<label class="option-label">Aspect Ratio</label>
					<div class="aspect-presets">
						{#each aspectPresets as preset}
							<button
								class="aspect-btn"
								class:active={aspectRatio === preset.value}
								onclick={() => setAspectRatio(preset.value)}
							>
								{preset.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="option-group">
					<label class="option-label">
						<input type="checkbox" bind:checked={resizeEnabled} />
						Resize after crop
					</label>
					{#if resizeEnabled}
						<div class="resize-inputs">
							<div class="input-field">
								<label for="resize-width">Width</label>
								<input type="number" id="resize-width" bind:value={resizeWidth} min="50" max="4000" />
							</div>
							<div class="input-field">
								<label for="resize-height">Height</label>
								<input type="number" id="resize-height" bind:value={resizeHeight} min="50" max="4000" />
							</div>
						</div>
					{/if}
				</div>

				<div class="option-group">
					<label class="option-label checkbox">
						<input type="checkbox" bind:checked={replaceOriginal} />
						Replace original image
					</label>
					{#if replaceOriginal}
						<p class="warning-text">Original image will be overwritten!</p>
					{/if}
				</div>

				<div class="crop-info">
					<p><strong>Selection:</strong></p>
					<p>{Math.round(cropArea.width)} x {Math.round(cropArea.height)} px</p>
				</div>

				{#if error}
					<div class="error-message">{error}</div>
				{/if}
			</div>
		</div>

		<div class="cropper-footer">
			<button class="btn-cancel" onclick={() => onCancel?.()} disabled={processing}>
				Cancel
			</button>
			<button class="btn-apply" onclick={applyCrop} disabled={processing || !imageLoaded}>
				{processing ? 'Processing...' : 'Apply Crop'}
			</button>
		</div>
	</div>
</div>

<style>
	.cropper-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.cropper-container {
		background: #fff;
		border-radius: 0.75rem;
		max-width: 900px;
		width: 100%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.cropper-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.cropper-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: #6b7280;
		padding: 0.5rem;
		border-radius: 0.375rem;
	}

	.close-btn:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.cropper-body {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.image-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #1a1a1a;
		padding: 1rem;
		position: relative;
		overflow: auto;
	}

	.image-container img {
		display: block;
		max-width: 100%;
		height: auto;
	}

	.crop-overlay {
		position: absolute;
		cursor: crosshair;
	}

	.cropper-sidebar {
		width: 250px;
		padding: 1.5rem;
		border-left: 1px solid #e5e7eb;
		overflow-y: auto;
	}

	.option-group {
		margin-bottom: 1.5rem;
	}

	.option-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.option-label.checkbox {
		cursor: pointer;
	}

	.aspect-presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.aspect-btn {
		padding: 0.375rem 0.625rem;
		font-size: 0.75rem;
		border: 1px solid #e5e7eb;
		background: #fff;
		color: #374151;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.aspect-btn:hover {
		background: #f9fafb;
	}

	.aspect-btn.active {
		background: #6366f1;
		color: #fff;
		border-color: #6366f1;
	}

	.resize-inputs {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.75rem;
	}

	.input-field {
		flex: 1;
	}

	.input-field label {
		display: block;
		font-size: 0.75rem;
		color: #6b7280;
		margin-bottom: 0.25rem;
	}

	.input-field input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.warning-text {
		color: #dc2626;
		font-size: 0.75rem;
		margin: 0.5rem 0 0 0;
	}

	.crop-info {
		padding: 0.75rem;
		background: #f9fafb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.crop-info p {
		margin: 0;
	}

	.error-message {
		padding: 0.75rem;
		background: #fef2f2;
		color: #dc2626;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		margin-top: 1rem;
	}

	.cropper-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.btn-cancel,
	.btn-apply {
		padding: 0.625rem 1.25rem;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-cancel {
		background: #fff;
		color: #374151;
		border: 1px solid #e5e7eb;
	}

	.btn-cancel:hover:not(:disabled) {
		background: #f9fafb;
	}

	.btn-apply {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		border: none;
	}

	.btn-apply:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-cancel:disabled,
	.btn-apply:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.cropper-body {
			flex-direction: column;
		}

		.cropper-sidebar {
			width: 100%;
			border-left: none;
			border-top: 1px solid #e5e7eb;
		}
	}
</style>
