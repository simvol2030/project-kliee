<script lang="ts">
	interface Props {
		label: string;
		name: string;
		error?: string;
		hint?: string;
		required?: boolean;
		class?: string;
	}

	let {
		label,
		name,
		error = '',
		hint = '',
		required = false,
		class: className = ''
	}: Props = $props();

	let hasError = $derived(!!error);
</script>

<div class="form-field {className}" class:has-error={hasError}>
	<label for={name}>
		{label}
		{#if required}
			<span class="required">*</span>
		{/if}
	</label>

	<slot />

	{#if error}
		<span class="error-message">{error}</span>
	{:else if hint}
		<span class="hint">{hint}</span>
	{/if}
</div>

<style>
	.form-field {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.required {
		color: #ef4444;
		margin-left: 2px;
	}

	.form-field :global(input),
	.form-field :global(select),
	.form-field :global(textarea) {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-family: inherit;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.form-field :global(input:focus),
	.form-field :global(select:focus),
	.form-field :global(textarea:focus) {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.form-field.has-error :global(input),
	.form-field.has-error :global(select),
	.form-field.has-error :global(textarea) {
		border-color: #ef4444;
	}

	.form-field.has-error :global(input:focus),
	.form-field.has-error :global(select:focus),
	.form-field.has-error :global(textarea:focus) {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.error-message {
		display: block;
		margin-top: 0.375rem;
		font-size: 0.75rem;
		color: #ef4444;
	}

	.hint {
		display: block;
		margin-top: 0.375rem;
		font-size: 0.75rem;
		color: #6b7280;
	}
</style>
