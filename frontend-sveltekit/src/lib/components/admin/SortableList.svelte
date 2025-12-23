<script lang="ts">
	import type { Snippet } from 'svelte';

	interface SortableItem {
		id: string | number;
		order_index?: number | null;
		[key: string]: unknown;
	}

	interface Props {
		items: SortableItem[];
		onReorder?: (items: SortableItem[]) => void;
		itemKey?: string;
		class?: string;
		children?: Snippet<[{ item: SortableItem; index: number }]>;
	}

	let {
		items = $bindable([]),
		onReorder,
		itemKey = 'id',
		class: className = '',
		children
	}: Props = $props();

	let draggedIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

	function handleDragStart(e: DragEvent, index: number) {
		draggedIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', index.toString());
		}
	}

	function handleDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		dragOverIndex = index;
	}

	function handleDragLeave() {
		dragOverIndex = null;
	}

	function handleDrop(e: DragEvent, dropIndex: number) {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === dropIndex) {
			draggedIndex = null;
			dragOverIndex = null;
			return;
		}

		// Reorder items
		const newItems = [...items];
		const [draggedItem] = newItems.splice(draggedIndex, 1);
		newItems.splice(dropIndex, 0, draggedItem);

		// Update order_index for all items
		const updatedItems = newItems.map((item, i) => ({
			...item,
			order_index: i
		}));

		items = updatedItems;
		onReorder?.(updatedItems);

		draggedIndex = null;
		dragOverIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
		dragOverIndex = null;
	}

	function moveUp(index: number) {
		if (index === 0) return;
		const newItems = [...items];
		[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
		const updatedItems = newItems.map((item, i) => ({
			...item,
			order_index: i
		}));
		items = updatedItems;
		onReorder?.(updatedItems);
	}

	function moveDown(index: number) {
		if (index === items.length - 1) return;
		const newItems = [...items];
		[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
		const updatedItems = newItems.map((item, i) => ({
			...item,
			order_index: i
		}));
		items = updatedItems;
		onReorder?.(updatedItems);
	}
</script>

<div class="sortable-list {className}">
	{#each items as item, index (item[itemKey])}
		<div
			class="sortable-item"
			class:dragging={draggedIndex === index}
			class:drag-over={dragOverIndex === index}
			draggable="true"
			ondragstart={(e) => handleDragStart(e, index)}
			ondragover={(e) => handleDragOver(e, index)}
			ondragleave={handleDragLeave}
			ondrop={(e) => handleDrop(e, index)}
			ondragend={handleDragEnd}
			role="listitem"
		>
			<div class="drag-handle" title="Drag to reorder">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="9" cy="5" r="1"></circle>
					<circle cx="9" cy="12" r="1"></circle>
					<circle cx="9" cy="19" r="1"></circle>
					<circle cx="15" cy="5" r="1"></circle>
					<circle cx="15" cy="12" r="1"></circle>
					<circle cx="15" cy="19" r="1"></circle>
				</svg>
			</div>

			<div class="item-content">
				{#if children}
					{@render children({ item, index })}
				{/if}
			</div>

			<div class="order-controls">
				<button
					type="button"
					class="btn-order"
					onclick={() => moveUp(index)}
					disabled={index === 0}
					title="Move up"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="18 15 12 9 6 15"></polyline>
					</svg>
				</button>
				<span class="order-number">{index + 1}</span>
				<button
					type="button"
					class="btn-order"
					onclick={() => moveDown(index)}
					disabled={index === items.length - 1}
					title="Move down"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</button>
			</div>
		</div>
	{/each}
</div>

<style>
	.sortable-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.sortable-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		cursor: grab;
		transition: all 0.15s ease;
	}

	.sortable-item:hover {
		border-color: #d1d5db;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.sortable-item.dragging {
		opacity: 0.5;
		cursor: grabbing;
	}

	.sortable-item.drag-over {
		border-color: #6366f1;
		background: #f5f3ff;
	}

	.drag-handle {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
		cursor: grab;
		padding: 0.25rem;
	}

	.drag-handle:hover {
		color: #6b7280;
	}

	.item-content {
		flex: 1;
		min-width: 0;
	}

	.order-controls {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.btn-order {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		border: none;
		background: transparent;
		color: #6b7280;
		cursor: pointer;
		border-radius: 0.25rem;
		transition: all 0.15s;
	}

	.btn-order:hover:not(:disabled) {
		background: #f3f4f6;
		color: #374151;
	}

	.btn-order:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.order-number {
		min-width: 24px;
		text-align: center;
		font-size: 0.75rem;
		font-weight: 500;
		color: #9ca3af;
	}
</style>
