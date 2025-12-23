<script lang="ts">
	interface Props {
		visible: boolean;
		message: string;
		type?: 'success' | 'error' | 'info';
		onClose?: () => void;
	}

	let { visible = $bindable(false), message, type = 'info', onClose }: Props = $props();

	$effect(() => {
		if (visible && onClose) {
			const timer = setTimeout(onClose, 3000);
			return () => clearTimeout(timer);
		}
	});
</script>

{#if visible}
	<div class="toast toast-{type}" role="alert">
		<span>{message}</span>
		{#if onClose}
			<button class="close" onclick={onClose} aria-label="Close">&times;</button>
		{/if}
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		padding: 1rem 1.5rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 1rem;
		z-index: 1100;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
	}
	.toast-success {
		background: #28a745;
		color: white;
	}
	.toast-error {
		background: #dc3545;
		color: white;
	}
	.toast-info {
		background: #17a2b8;
		color: white;
	}
	.close {
		background: transparent;
		border: none;
		color: inherit;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}
</style>
