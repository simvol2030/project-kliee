<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Currency rates state
	let rates = $state(
		data.rates.map((r) => ({
			...r,
			editRate: r.rate.toString()
		}))
	);
	let savingRates = $state(false);
	let ratesMessage = $state('');

	// Currency symbols for display
	const currencySymbols: Record<string, string> = {
		USD: '$',
		EUR: '€',
		RUB: '₽',
		CNY: '¥'
	};

	const currencyNames: Record<string, string> = {
		USD: 'US Dollar',
		EUR: 'Euro',
		RUB: 'Russian Ruble',
		CNY: 'Chinese Yuan'
	};

	async function saveCurrencyRates() {
		savingRates = true;
		ratesMessage = '';

		try {
			const response = await fetch('/api/shop/currencies', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					rates: rates.map((r) => ({
						currency: r.currency,
						rate: parseFloat(r.editRate)
					}))
				})
			});

			if (!response.ok) {
				throw new Error('Failed to save');
			}

			ratesMessage = 'Rates saved successfully!';

			// Update the displayed rates
			for (const r of rates) {
				r.rate = parseFloat(r.editRate);
				r.updated_at = new Date().toISOString();
			}
		} catch (err) {
			ratesMessage = 'Error saving rates';
			console.error(err);
		} finally {
			savingRates = false;
		}
	}

	function formatDate(dateStr: string | null) {
		if (!dateStr) return 'Never';
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="page">
	<div class="page-header">
		<h1>Shop Settings</h1>
		<p class="page-subtitle">Configure your shop currencies and notifications</p>
	</div>

	<!-- Currency Rates Section -->
	<section class="settings-section">
		<div class="section-header">
			<h2>Currency Rates</h2>
			<p class="section-description">
				Base currency: <strong>EUR (€)</strong>. Set exchange rates for other currencies.
			</p>
		</div>

		<div class="rates-table">
			<div class="rates-header">
				<span>Currency</span>
				<span>Rate (1 EUR =)</span>
				<span>Last Updated</span>
			</div>

			{#each rates as rate}
				<div class="rate-row">
					<div class="currency-info">
						<span class="currency-symbol">{currencySymbols[rate.currency] || rate.currency}</span>
						<span class="currency-name">{currencyNames[rate.currency] || rate.currency}</span>
						<span class="currency-code">({rate.currency})</span>
					</div>

					<div class="rate-input-wrapper">
						<input
							type="number"
							step="0.01"
							min="0"
							bind:value={rate.editRate}
							class="rate-input"
							disabled={rate.currency === 'EUR'}
						/>
					</div>

					<div class="rate-updated">
						{formatDate(rate.updated_at)}
					</div>
				</div>
			{/each}
		</div>

		{#if ratesMessage}
			<div class="message" class:success={ratesMessage.includes('success')}>
				{ratesMessage}
			</div>
		{/if}

		<div class="section-actions">
			<button class="btn btn-primary" onclick={saveCurrencyRates} disabled={savingRates}>
				{savingRates ? 'Saving...' : 'Save Currency Rates'}
			</button>
		</div>
	</section>

	<!-- Placeholder for Notifications Section (Phase 7) -->
	<section class="settings-section">
		<div class="section-header">
			<h2>Notifications</h2>
			<p class="section-description">Configure email and Telegram notifications for new orders.</p>
		</div>

		<div class="coming-soon">
			<p>Notification settings will be available after Phase 7 implementation.</p>
		</div>
	</section>
</div>

<style>
	.page {
		max-width: 800px;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 1.75rem;
		font-weight: 700;
		color: #1a1a1a;
	}

	.page-subtitle {
		margin: 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.settings-section {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.section-header {
		margin-bottom: 1.5rem;
	}

	.section-header h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.section-description {
		margin: 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.rates-table {
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.rates-header {
		display: grid;
		grid-template-columns: 1fr 150px 180px;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: #f9fafb;
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		border-bottom: 1px solid #e5e7eb;
	}

	.rate-row {
		display: grid;
		grid-template-columns: 1fr 150px 180px;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		align-items: center;
	}

	.rate-row:last-child {
		border-bottom: none;
	}

	.currency-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.currency-symbol {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1a1a1a;
		width: 1.5rem;
	}

	.currency-name {
		font-weight: 500;
	}

	.currency-code {
		color: #9ca3af;
		font-size: 0.875rem;
	}

	.rate-input-wrapper {
		display: flex;
		align-items: center;
	}

	.rate-input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		text-align: right;
	}

	.rate-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
	}

	.rate-input:disabled {
		background: #f3f4f6;
		cursor: not-allowed;
	}

	.rate-updated {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.section-actions {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.625rem 1.25rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.message {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		background: #fef2f2;
		color: #dc2626;
	}

	.message.success {
		background: #ecfdf5;
		color: #059669;
	}

	.coming-soon {
		padding: 2rem;
		background: #f9fafb;
		border-radius: 0.375rem;
		text-align: center;
		color: #6b7280;
	}

	@media (max-width: 640px) {
		.rates-header,
		.rate-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.rates-header span:not(:first-child) {
			display: none;
		}

		.rate-row {
			padding: 1rem;
		}

		.currency-info {
			margin-bottom: 0.5rem;
		}

		.rate-input-wrapper {
			margin-bottom: 0.5rem;
		}
	}

	/* Dark theme support */
	:global(.dark) .page-header h1 { color: #f9fafb; }
	:global(.dark) .page-subtitle { color: #9ca3af; }

	:global(.dark) .settings-section {
		background: #1f2937;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
	:global(.dark) .section-header h2 { color: #f9fafb; }
	:global(.dark) .section-description { color: #9ca3af; }
	:global(.dark) .section-description strong { color: #e5e7eb; }

	:global(.dark) .rates-table { border-color: #374151; }
	:global(.dark) .rates-header {
		background: #374151;
		color: #9ca3af;
		border-color: #4b5563;
	}

	:global(.dark) .rate-row { border-color: #374151; }
	:global(.dark) .currency-symbol { color: #f9fafb; }
	:global(.dark) .currency-name { color: #e5e7eb; }
	:global(.dark) .currency-code { color: #6b7280; }

	:global(.dark) .rate-input {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}
	:global(.dark) .rate-input:focus {
		border-color: #667eea;
		box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
	}
	:global(.dark) .rate-input:disabled {
		background: #1f2937;
	}

	:global(.dark) .rate-updated { color: #9ca3af; }

	:global(.dark) .message {
		background: #7f1d1d;
		color: #fecaca;
	}
	:global(.dark) .message.success {
		background: #064e3b;
		color: #d1fae5;
	}

	:global(.dark) .coming-soon {
		background: #374151;
		color: #9ca3af;
	}
</style>
