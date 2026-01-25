<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Redirect to settings page
	onMount(() => {
		goto('/chatbot/settings');
	});
</script>

<div class="loading">
	<p>Redirecting to Chatbot Settings...</p>
</div>

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
		color: var(--text-secondary);
	}
</style>
