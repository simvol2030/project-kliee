<script lang="ts">
	interface MultilingualValues {
		en: string;
		ru: string;
		es: string;
		zh: string;
	}

	interface Props {
		label: string;
		values: MultilingualValues;
		required?: boolean;
		placeholder?: string;
		rows?: number;
	}

	let { label, values = $bindable(), required = false, placeholder = '', rows = 4 }: Props = $props();

	let activeTab = $state<'en' | 'ru' | 'es' | 'zh'>('en');
</script>

<div class="multilingual-textarea">
	<label class="field-label">{label} {required ? '*' : ''}</label>

	<div class="tabs">
		<button type="button" class="tab" class:active={activeTab === 'en'} onclick={() => activeTab = 'en'}>EN</button>
		<button type="button" class="tab" class:active={activeTab === 'ru'} onclick={() => activeTab = 'ru'}>RU</button>
		<button type="button" class="tab" class:active={activeTab === 'es'} onclick={() => activeTab = 'es'}>ES</button>
		<button type="button" class="tab" class:active={activeTab === 'zh'} onclick={() => activeTab = 'zh'}>ZH</button>
	</div>

	<div class="textareas">
		{#if activeTab === 'en'}
			<textarea bind:value={values.en} {required} {placeholder} {rows}></textarea>
		{:else if activeTab === 'ru'}
			<textarea bind:value={values.ru} {placeholder} {rows}></textarea>
		{:else if activeTab === 'es'}
			<textarea bind:value={values.es} {placeholder} {rows}></textarea>
		{:else if activeTab === 'zh'}
			<textarea bind:value={values.zh} {placeholder} {rows}></textarea>
		{/if}
	</div>
</div>

<style>
	.multilingual-textarea {
		margin-bottom: 1rem;
	}

	.field-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.tabs {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.tab {
		padding: 0.375rem 0.75rem;
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s;
	}

	.tab:hover {
		background: #e5e7eb;
	}

	.tab.active {
		background: #6366f1;
		border-color: #6366f1;
		color: white;
	}

	.textareas textarea {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		resize: vertical;
		min-height: 100px;
	}

	.textareas textarea:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}
</style>
