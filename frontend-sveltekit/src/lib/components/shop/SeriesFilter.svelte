<script lang="ts">
	import type { LanguageCode } from '$lib/utils/currency';

	interface Series {
		id: number;
		slug: string;
		name_en: string;
		name_ru: string;
		name_es: string;
		name_zh: string;
	}

	interface Props {
		series: Series[];
		selectedId: number | null;
		lang: LanguageCode;
		onChange: (seriesId: number | null) => void;
	}

	let { series, selectedId, lang, onChange }: Props = $props();

	function getName(s: Series): string {
		const key = `name_${lang}` as keyof Series;
		return (s[key] as string) || s.name_en;
	}
</script>

<div class="series-filter">
	<button
		class="filter-btn"
		class:active={selectedId === null}
		onclick={() => onChange(null)}
	>
		All Series
	</button>
	{#each series as s}
		<button
			class="filter-btn"
			class:active={selectedId === s.id}
			onclick={() => onChange(s.id)}
		>
			{getName(s)}
		</button>
	{/each}
</div>

<style>
	.series-filter {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.filter-btn {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 20px;
		background: transparent;
		cursor: pointer;
		transition: all 0.2s;
	}
	.filter-btn:hover {
		border-color: var(--color-primary, #333);
	}
	.filter-btn.active {
		background: var(--color-primary, #333);
		color: white;
		border-color: var(--color-primary, #333);
	}

	/* Dark theme - Using .dark class from mode-watcher */
	:global(.dark) .filter-btn {
		background: var(--bg-secondary, #1c1c1e);
		border-color: var(--border-primary, #38383a);
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .filter-btn:hover {
		border-color: #667eea;
	}

	:global(.dark) .filter-btn.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: #667eea;
		color: white;
	}
</style>
