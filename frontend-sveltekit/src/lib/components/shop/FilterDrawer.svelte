<script lang="ts">
	import type { LanguageCode } from '$lib/utils/currency';
	import type { Snippet } from 'svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		lang: LanguageCode;
		children: Snippet;
	}

	let { isOpen, onClose, lang, children }: Props = $props();

	const translations = {
		en: { filters: 'Filters', close: 'Close', apply: 'Apply Filters' },
		ru: { filters: 'Фильтры', close: 'Закрыть', apply: 'Применить' },
		es: { filters: 'Filtros', close: 'Cerrar', apply: 'Aplicar filtros' },
		zh: { filters: '筛选', close: '关闭', apply: '应用筛选' }
	};

	const t = $derived(translations[lang] || translations.en);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="drawer-overlay" onclick={handleOverlayClick}>
		<aside class="drawer" role="dialog" aria-modal="true" aria-label={t.filters}>
			<header class="drawer-header">
				<h2>{t.filters}</h2>
				<button class="close-btn" onclick={onClose} aria-label={t.close}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</header>

			<div class="drawer-content">
				{@render children()}
			</div>

			<footer class="drawer-footer">
				<button class="apply-btn" onclick={onClose}>
					{t.apply}
				</button>
			</footer>
		</aside>
	</div>
{/if}

<style>
	.drawer-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		justify-content: flex-end;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.drawer {
		width: 100%;
		max-width: 320px;
		height: 100%;
		background: var(--color-bg, #fff);
		display: flex;
		flex-direction: column;
		animation: slideIn 0.3s ease;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.drawer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.drawer-header h2 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		color: var(--color-text-secondary, #6b7280);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: var(--color-text, #1a1a1a);
	}

	.drawer-content {
		flex: 1;
		padding: 1.25rem;
		overflow-y: auto;
	}

	.drawer-footer {
		padding: 1rem 1.25rem;
		border-top: 1px solid var(--color-border, #e5e7eb);
	}

	.apply-btn {
		width: 100%;
		padding: 0.75rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.apply-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	/* Dark theme - Using .dark class from mode-watcher */
	:global(.dark) .drawer {
		background: var(--bg-primary, #000000);
	}

	:global(.dark) .drawer-header {
		border-color: var(--border-primary, #38383a);
	}

	:global(.dark) .drawer-header h2 {
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .drawer-footer {
		border-color: var(--border-primary, #38383a);
	}

	:global(.dark) .close-btn {
		color: var(--text-secondary, #8e8e93);
	}

	:global(.dark) .close-btn:hover {
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .drawer-content {
		background: var(--bg-primary, #000000);
	}
</style>
