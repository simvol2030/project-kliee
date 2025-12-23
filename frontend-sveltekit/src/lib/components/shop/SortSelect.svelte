<script lang="ts">
	import type { LanguageCode } from '$lib/utils/currency';

	interface Props {
		value: string;
		lang: LanguageCode;
		onChange: (value: string) => void;
	}

	let { value, lang, onChange }: Props = $props();

	const translations = {
		en: {
			sortBy: 'Sort by',
			featured: 'Featured',
			newest: 'Newest',
			priceLowHigh: 'Price: Low to High',
			priceHighLow: 'Price: High to Low'
		},
		ru: {
			sortBy: 'Сортировка',
			featured: 'Рекомендуемые',
			newest: 'Новинки',
			priceLowHigh: 'Цена: по возрастанию',
			priceHighLow: 'Цена: по убыванию'
		},
		es: {
			sortBy: 'Ordenar por',
			featured: 'Destacados',
			newest: 'Más recientes',
			priceLowHigh: 'Precio: menor a mayor',
			priceHighLow: 'Precio: mayor a menor'
		},
		zh: {
			sortBy: '排序',
			featured: '推荐',
			newest: '最新',
			priceLowHigh: '价格：从低到高',
			priceHighLow: '价格：从高到低'
		}
	};

	const t = $derived(translations[lang] || translations.en);

	const sortOptions = $derived([
		{ value: 'featured', label: t.featured },
		{ value: 'newest', label: t.newest },
		{ value: 'price_asc', label: t.priceLowHigh },
		{ value: 'price_desc', label: t.priceHighLow }
	]);

	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		onChange(target.value);
	}
</script>

<div class="sort-wrapper">
	<label class="sort-label" for="sort-select">{t.sortBy}:</label>
	<select id="sort-select" class="sort-select" onchange={handleChange}>
		{#each sortOptions as option (option.value)}
			<option value={option.value} selected={value === option.value}>
				{option.label}
			</option>
		{/each}
	</select>
</div>

<style>
	.sort-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sort-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary, #6b7280);
		white-space: nowrap;
		display: none;
	}

	.sort-select {
		padding: 0.625rem 2rem 0.625rem 0.75rem;
		font-size: 0.875rem;
		background: var(--color-card-bg, #fff);
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		min-width: 180px;
	}

	.sort-select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
	}

	@media (min-width: 768px) {
		.sort-label {
			display: block;
		}
	}

	/* Dark theme - Using .dark class from mode-watcher */
	:global(.dark) .sort-label {
		color: var(--text-secondary, #8e8e93);
	}

	:global(.dark) .sort-select {
		background-color: var(--bg-secondary, #1c1c1e);
		border-color: var(--border-primary, #38383a);
		color: var(--text-primary, #ffffff);
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
	}

	:global(.dark) .sort-select:focus {
		border-color: #667eea;
	}

	:global(.dark) .sort-select option {
		background-color: var(--bg-secondary, #1c1c1e);
		color: var(--text-primary, #ffffff);
	}
</style>
