<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		active?: string;
		children?: Snippet<[string]>;
	}

	let { active = $bindable('en'), children }: Props = $props();

	const languages = [
		{ code: 'en', label: 'English', flag: '🇬🇧' },
		{ code: 'ru', label: 'Русский', flag: '🇷🇺' },
		{ code: 'es', label: 'Español', flag: '🇪🇸' },
		{ code: 'zh', label: '中文', flag: '🇨🇳' }
	];
</script>

<div class="language-tabs">
	<div class="tabs-header">
		{#each languages as lang}
			<button
				type="button"
				class="tab"
				class:active={active === lang.code}
				onclick={() => (active = lang.code)}
			>
				<span class="flag">{lang.flag}</span>
				<span class="label">{lang.label}</span>
			</button>
		{/each}
	</div>

	{#if children}
		<div class="tab-content">
			{@render children(active)}
		</div>
	{/if}
</div>

<style>
	.language-tabs {
		margin-bottom: 1.5rem;
	}

	.tabs-header {
		display: flex;
		gap: 0.25rem;
		border-bottom: 1px solid var(--color-border, #ddd);
		margin-bottom: 1rem;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		opacity: 0.6;
		transition:
			opacity 0.2s,
			border-color 0.2s;
		font-size: 0.875rem;
	}

	.tab:hover {
		opacity: 0.8;
	}

	.tab.active {
		opacity: 1;
		border-bottom-color: var(--color-primary, #333);
	}

	.flag {
		font-size: 1.25rem;
	}

	.label {
		color: var(--color-text, #333);
	}

	.tab-content {
		padding: 0.5rem 0;
	}

	@media (max-width: 640px) {
		.label {
			display: none;
		}

		.tab {
			padding: 0.75rem;
		}

		.flag {
			font-size: 1.5rem;
		}
	}
</style>
