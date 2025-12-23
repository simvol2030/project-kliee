<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createAutoSave, loadDraft, deleteDraft, getDraftAge, type Draft } from '$lib/stores/drafts';

	interface Props {
		entityType: string;
		entityId: string;
		getData: () => Record<string, unknown>;
		onRestore?: (data: Record<string, unknown>) => void;
		debounceMs?: number;
		enabled?: boolean;
	}

	let {
		entityType,
		entityId,
		getData,
		onRestore,
		debounceMs = 2000,
		enabled = true
	}: Props = $props();

	let status = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let draftAge = $state<string | null>(null);
	let showRestorePrompt = $state(false);
	let savedDraft = $state<Draft<Record<string, unknown>> | null>(null);

	let autoSave: ReturnType<typeof createAutoSave> | null = null;
	let checkInterval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		if (!enabled) return;

		// Check for existing draft
		const existingDraft = loadDraft<Record<string, unknown>>(entityType, entityId);
		if (existingDraft && onRestore) {
			savedDraft = existingDraft;
			showRestorePrompt = true;
		}

		// Create auto-save instance
		autoSave = createAutoSave(entityType, entityId, debounceMs);

		// Start periodic save check
		checkInterval = setInterval(() => {
			if (autoSave && enabled) {
				const data = getData();
				autoSave.save(data);
				status = 'saved';
				draftAge = getDraftAge(entityType, entityId);
			}
		}, debounceMs + 500);

		return () => {
			if (checkInterval) clearInterval(checkInterval);
			if (autoSave) autoSave.cancel();
		};
	});

	onDestroy(() => {
		if (checkInterval) clearInterval(checkInterval);
		if (autoSave) autoSave.cancel();
	});

	function restoreDraft() {
		if (savedDraft && onRestore) {
			onRestore(savedDraft.data);
			showRestorePrompt = false;
			status = 'saved';
		}
	}

	function discardDraft() {
		deleteDraft(entityType, entityId);
		showRestorePrompt = false;
		savedDraft = null;
	}

	function clearCurrentDraft() {
		if (autoSave) {
			autoSave.clear();
			status = 'idle';
			draftAge = null;
		}
	}

	// Expose methods for parent component
	export function saveNow() {
		if (autoSave) {
			autoSave.saveNow(getData());
			status = 'saved';
			draftAge = getDraftAge(entityType, entityId);
		}
	}

	export function clear() {
		clearCurrentDraft();
	}
</script>

{#if showRestorePrompt && savedDraft}
	<div class="restore-prompt">
		<div class="restore-content">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
				<path d="M21 3v5h-5" />
				<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
				<path d="M8 16H3v5" />
			</svg>
			<span>
				Unsaved draft found from <strong>{getDraftAge(entityType, entityId)}</strong>
			</span>
		</div>
		<div class="restore-actions">
			<button class="btn-restore" onclick={restoreDraft}>Restore</button>
			<button class="btn-discard" onclick={discardDraft}>Discard</button>
		</div>
	</div>
{/if}

{#if enabled && status !== 'idle'}
	<div class="autosave-indicator" class:saved={status === 'saved'}>
		{#if status === 'saving'}
			<svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 12a9 9 0 1 1-6.219-8.56" />
			</svg>
			<span>Saving...</span>
		{:else if status === 'saved'}
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M20 6 9 17l-5-5" />
			</svg>
			<span>Draft saved {draftAge}</span>
		{:else if status === 'error'}
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10" />
				<line x1="15" y1="9" x2="9" y2="15" />
				<line x1="9" y1="9" x2="15" y2="15" />
			</svg>
			<span>Failed to save</span>
		{/if}
	</div>
{/if}

<style>
	.restore-prompt {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.restore-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: #92400e;
	}

	.restore-content svg {
		flex-shrink: 0;
	}

	.restore-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-restore,
	.btn-discard {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-restore {
		background: #f59e0b;
		color: #fff;
		border: none;
	}

	.btn-restore:hover {
		background: #d97706;
	}

	.btn-discard {
		background: #fff;
		color: #92400e;
		border: 1px solid #fbbf24;
	}

	.btn-discard:hover {
		background: #fef3c7;
	}

	.autosave-indicator {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: #f3f4f6;
		border-radius: 1rem;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.autosave-indicator.saved {
		background: #dcfce7;
		color: #166534;
	}

	.spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
