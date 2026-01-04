<script lang="ts">
	interface Props {
		open: boolean;
		title?: string;
		message?: string;
		confirmText?: string;
		cancelLabel?: string;
		variant?: 'default' | 'danger';
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		open = $bindable(false),
		title = 'Confirm',
		message = 'Are you sure?',
		confirmText = 'Confirm',
		cancelLabel = 'Cancel',
		variant = 'default',
		onConfirm,
		onCancel
	}: Props = $props();
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="dialog-overlay" onclick={onCancel}>
		<div class="dialog" role="dialog" aria-modal="true" onclick={(e) => e.stopPropagation()}>
			<h3>{title}</h3>
			<p>{message}</p>
			<div class="dialog-actions">
				<button class="btn-cancel" onclick={onCancel}>{cancelLabel}</button>
				<button class="btn-confirm" class:danger={variant === 'danger'} onclick={onConfirm}>{confirmText}</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	.dialog {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		max-width: 400px;
		width: 90%;
	}
	h3 {
		margin: 0 0 1rem;
	}
	.dialog-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}
	button {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}
	.btn-cancel {
		background: #eee;
		border: none;
	}
	.btn-confirm {
		background: #dc3545;
		color: white;
		border: none;
	}

	/* Dark theme support */
	:global(.dark) .dialog {
		background: #1f2937;
		color: #f9fafb;
	}

	:global(.dark) h3 {
		color: #f9fafb;
	}

	:global(.dark) p {
		color: #d1d5db;
	}

	:global(.dark) .btn-cancel {
		background: #374151;
		color: #e5e7eb;
	}

	:global(.dark) .btn-cancel:hover {
		background: #4b5563;
	}
</style>
