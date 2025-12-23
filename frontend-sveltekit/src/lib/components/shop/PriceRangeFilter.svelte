<script lang="ts">
	import type { LanguageCode } from '$lib/utils/currency';

	interface Props {
		minPrice: number | null;
		maxPrice: number | null;
		lang: LanguageCode;
		currencySymbol: string;
		onChange: (min: number | null, max: number | null) => void;
	}

	let {
		minPrice,
		maxPrice,
		lang,
		currencySymbol,
		onChange
	}: Props = $props();

	const effectiveMinPrice = minPrice ?? 0;
	const effectiveMaxPrice = maxPrice ?? 10000;

	let localMin = $state(effectiveMinPrice);
	let localMax = $state(effectiveMaxPrice);

	function handleApply() {
		const min = localMin === effectiveMinPrice ? null : localMin;
		const max = localMax === effectiveMaxPrice ? null : localMax;
		onChange(min, max);
	}

	function handleReset() {
		localMin = effectiveMinPrice;
		localMax = effectiveMaxPrice;
		onChange(null, null);
	}
</script>

<div class="price-filter">
	<div class="inputs">
		<label>
			<span>Min</span>
			<div class="input-wrap">
				<span class="symbol">{currencySymbol}</span>
				<input
					type="number"
					bind:value={localMin}
					min={effectiveMinPrice}
					max={effectiveMaxPrice}
				/>
			</div>
		</label>
		<span class="separator">—</span>
		<label>
			<span>Max</span>
			<div class="input-wrap">
				<span class="symbol">{currencySymbol}</span>
				<input
					type="number"
					bind:value={localMax}
					min={effectiveMinPrice}
					max={effectiveMaxPrice}
				/>
			</div>
		</label>
	</div>
	<div class="actions">
		<button class="btn-reset" onclick={handleReset}>Reset</button>
		<button class="btn-apply" onclick={handleApply}>Apply</button>
	</div>
</div>

<style>
	.price-filter {
		padding: 1rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 8px;
	}
	.inputs {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
	}
	label span {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-muted, #666);
		margin-bottom: 0.25rem;
	}
	.input-wrap {
		display: flex;
		align-items: center;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		overflow: hidden;
	}
	.symbol {
		padding: 0.5rem;
		background: var(--color-surface, #f5f5f5);
		border-right: 1px solid var(--color-border, #ddd);
	}
	input {
		border: none;
		padding: 0.5rem;
		width: 80px;
	}
	.separator {
		color: var(--color-text-muted, #666);
	}
	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}
	button {
		flex: 1;
		padding: 0.5rem;
		border-radius: 4px;
		cursor: pointer;
	}
	.btn-reset {
		background: transparent;
		border: 1px solid var(--color-border, #ddd);
	}
	.btn-apply {
		background: var(--color-primary, #333);
		color: white;
		border: none;
	}

	/* Dark theme - Using .dark class from mode-watcher */
	:global(.dark) .price-filter {
		background: var(--bg-secondary, #1c1c1e);
		border-color: var(--border-primary, #38383a);
	}

	:global(.dark) label span {
		color: var(--text-secondary, #8e8e93);
	}

	:global(.dark) .input-wrap {
		background: var(--bg-tertiary, #2c2c2e);
		border-color: var(--border-primary, #38383a);
	}

	:global(.dark) .symbol {
		background: var(--bg-primary, #000000);
		border-color: var(--border-primary, #38383a);
		color: var(--text-secondary, #8e8e93);
	}

	:global(.dark) input {
		background: var(--bg-tertiary, #2c2c2e);
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .separator {
		color: var(--text-secondary, #8e8e93);
	}

	:global(.dark) .btn-reset {
		background: var(--bg-secondary, #1c1c1e);
		border-color: var(--border-primary, #38383a);
		color: var(--text-primary, #ffffff);
	}

	:global(.dark) .btn-reset:hover {
		border-color: #667eea;
	}

	:global(.dark) .btn-apply {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
</style>
