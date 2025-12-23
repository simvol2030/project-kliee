<script lang="ts">
	interface Props {
		errors: Record<string, string>;
		title?: string;
	}

	let { errors, title = 'Please fix the following errors:' }: Props = $props();

	let errorList = $derived(Object.entries(errors).filter(([, msg]) => msg));
	let hasErrors = $derived(errorList.length > 0);
</script>

{#if hasErrors}
	<div class="validation-errors" role="alert">
		<div class="error-header">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			<span>{title}</span>
		</div>
		<ul class="error-list">
			{#each errorList as [field, message]}
				<li>
					<strong>{formatFieldName(field)}:</strong>
					{message}
				</li>
			{/each}
		</ul>
	</div>
{/if}

<script context="module" lang="ts">
	function formatFieldName(field: string): string {
		return field
			.replace(/_/g, ' ')
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}
</script>

<style>
	.validation-errors {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.error-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #b91c1c;
		font-weight: 600;
		font-size: 0.875rem;
		margin-bottom: 0.75rem;
	}

	.error-header svg {
		flex-shrink: 0;
	}

	.error-list {
		margin: 0;
		padding-left: 1.75rem;
		color: #991b1b;
		font-size: 0.875rem;
	}

	.error-list li {
		margin-bottom: 0.375rem;
	}

	.error-list li:last-child {
		margin-bottom: 0;
	}

	.error-list strong {
		font-weight: 500;
	}
</style>
