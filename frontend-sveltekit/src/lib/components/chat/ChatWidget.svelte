<script lang="ts">
	import { chatStore } from '$lib/stores/chat.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { ChatLanguage } from '$lib/types/chat.types';

	// Get current language from page
	const lang = $derived(($page.data.locale as ChatLanguage) || 'en');

	// Local state
	let inputValue = $state('');
	let messagesContainer: HTMLDivElement | null = $state(null);

	// Initialize on mount
	onMount(() => {
		chatStore.init(lang);
	});

	// Auto-scroll to bottom when messages change
	$effect(() => {
		if (messagesContainer && chatStore.messages.length) {
			// Small delay to ensure DOM is updated
			setTimeout(() => {
				if (messagesContainer) {
					messagesContainer.scrollTop = messagesContainer.scrollHeight;
				}
			}, 50);
		}
	});

	/**
	 * Handle message send
	 */
	async function handleSend() {
		if (!inputValue.trim() || chatStore.isTyping) return;

		const message = inputValue;
		inputValue = '';
		await chatStore.sendMessage(message, lang);
	}

	/**
	 * Handle keypress (Enter to send)
	 */
	function handleKeypress(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	/**
	 * Format timestamp
	 */
	function formatTime(date: Date): string {
		return date.toLocaleTimeString(lang, {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	/**
	 * Get placeholder text by language
	 */
	const placeholders: Record<ChatLanguage, string> = {
		en: 'Type your message...',
		ru: 'Введите сообщение...',
		es: 'Escribe tu mensaje...',
		zh: '输入消息...'
	};
</script>

{#if chatStore.isEnabled}
	<!-- Chat Button (FAB) -->
	<button
		class="chat-fab"
		class:open={chatStore.isOpen}
		onclick={() => chatStore.toggle()}
		aria-label="Chat with Melena"
		aria-expanded={chatStore.isOpen}
	>
		{#if chatStore.isOpen}
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
				<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
			</svg>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
				<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
			</svg>
		{/if}
	</button>

	<!-- Chat Window -->
	{#if chatStore.isOpen}
		<div class="chat-window" role="dialog" aria-label="Chat with Melena">
			<!-- Header -->
			<div class="chat-header">
				<div class="chat-header-info">
					<div class="chat-avatar">M</div>
					<div class="chat-header-text">
						<h3 class="chat-title">Melena</h3>
						<span class="chat-status">
							{#if chatStore.isTyping}
								<span class="typing-indicator">
									<span class="dot"></span>
									<span class="dot"></span>
									<span class="dot"></span>
								</span>
							{:else}
								<span class="status-dot"></span>
								Online
							{/if}
						</span>
					</div>
				</div>
				<div class="chat-header-actions">
					{#if chatStore.hasMessages}
						<button
							class="header-btn"
							onclick={() => chatStore.clear()}
							aria-label="Clear chat"
							title="Clear chat"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
								<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
							</svg>
						</button>
					{/if}
					<button
						class="header-btn close-btn"
						onclick={() => chatStore.close()}
						aria-label="Close chat"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
						</svg>
					</button>
				</div>
			</div>

			<!-- Messages -->
			<div class="chat-messages" bind:this={messagesContainer}>
				{#each chatStore.messages as message (message.id)}
					<div class="message" class:user={message.role === 'user'} class:assistant={message.role === 'assistant'}>
						<div class="message-content">
							{message.content}
						</div>
						<div class="message-time">
							{formatTime(message.timestamp)}
						</div>
					</div>
				{/each}

				{#if chatStore.isTyping}
					<div class="message assistant">
						<div class="message-content typing">
							<span class="dot"></span>
							<span class="dot"></span>
							<span class="dot"></span>
						</div>
					</div>
				{/if}

				{#if chatStore.error}
					<div class="error-message">
						{chatStore.error}
					</div>
				{/if}
			</div>

			<!-- Input -->
			<div class="chat-input-container">
				<textarea
					class="chat-input"
					placeholder={placeholders[lang]}
					bind:value={inputValue}
					onkeypress={handleKeypress}
					disabled={chatStore.isTyping}
					rows="1"
				></textarea>
				<button
					class="send-btn"
					onclick={handleSend}
					disabled={!inputValue.trim() || chatStore.isTyping}
					aria-label="Send message"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
						<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
					</svg>
				</button>
			</div>
		</div>
	{/if}
{/if}

<style>
	/* Chat FAB (Floating Action Button) */
	.chat-fab {
		position: fixed;
		bottom: 24px;
		right: 24px;
		width: 56px;
		height: 56px;
		border-radius: 28px;
		background: var(--accent, #d4af37);
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.3s ease;
		z-index: var(--z-fixed, 1030);
	}

	.chat-fab:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}

	.chat-fab.open {
		background: var(--gray-600, #525252);
	}

	:global(.dark) .chat-fab {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}

	/* Chat Window */
	.chat-window {
		position: fixed;
		bottom: 96px;
		right: 24px;
		width: 380px;
		height: 520px;
		background: var(--bg-primary, #fff);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		z-index: var(--z-modal, 1040);
		animation: slideUp 0.3s ease;
	}

	:global(.dark) .chat-window {
		background: var(--bg-secondary, #1c1c1e);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Chat Header */
	.chat-header {
		padding: 16px;
		background: var(--accent, #d4af37);
		color: white;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.chat-header-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.chat-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 18px;
	}

	.chat-header-text {
		display: flex;
		flex-direction: column;
	}

	.chat-title {
		font-size: 16px;
		font-weight: 600;
		margin: 0;
	}

	.chat-status {
		font-size: 12px;
		opacity: 0.9;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #4ade80;
	}

	.chat-header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.header-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 8px;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: white;
		transition: background 0.2s;
	}

	.header-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	/* Chat Messages */
	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.message {
		max-width: 85%;
		display: flex;
		flex-direction: column;
	}

	.message.user {
		align-self: flex-end;
	}

	.message.assistant {
		align-self: flex-start;
	}

	.message-content {
		padding: 10px 14px;
		border-radius: 16px;
		font-size: 14px;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.message.user .message-content {
		background: var(--accent, #d4af37);
		color: white;
		border-bottom-right-radius: 4px;
	}

	.message.assistant .message-content {
		background: var(--bg-tertiary, #f5f5f5);
		color: var(--text-primary, #1a1a1a);
		border-bottom-left-radius: 4px;
	}

	:global(.dark) .message.assistant .message-content {
		background: var(--bg-tertiary, #2c2c2e);
		color: var(--text-primary, #fff);
	}

	.message-time {
		font-size: 11px;
		color: var(--text-tertiary, #737373);
		margin-top: 4px;
		padding: 0 4px;
	}

	.message.user .message-time {
		text-align: right;
	}

	/* Typing Indicator */
	.typing-indicator,
	.message-content.typing {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
		animation: bounce 1.4s ease-in-out infinite;
	}

	.dot:nth-child(1) {
		animation-delay: 0s;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes bounce {
		0%, 60%, 100% {
			transform: translateY(0);
		}
		30% {
			transform: translateY(-4px);
		}
	}

	.message-content.typing .dot {
		background: var(--text-secondary, #525252);
	}

	/* Error Message */
	.error-message {
		background: #fee2e2;
		color: #dc2626;
		padding: 10px 14px;
		border-radius: 8px;
		font-size: 13px;
		text-align: center;
	}

	:global(.dark) .error-message {
		background: rgba(220, 38, 38, 0.2);
	}

	/* Chat Input */
	.chat-input-container {
		padding: 12px 16px;
		border-top: 1px solid var(--border-primary, #e5e5e5);
		display: flex;
		align-items: center;
		gap: 12px;
		background: var(--bg-primary, #fff);
	}

	:global(.dark) .chat-input-container {
		border-top-color: var(--border-primary, #38383a);
		background: var(--bg-secondary, #1c1c1e);
	}

	.chat-input {
		flex: 1;
		border: 1px solid var(--border-primary, #e5e5e5);
		border-radius: 20px;
		padding: 10px 16px;
		font-size: 14px;
		resize: none;
		outline: none;
		font-family: inherit;
		background: var(--bg-secondary, #f5f5f5);
		color: var(--text-primary, #1a1a1a);
		transition: border-color 0.2s;
	}

	:global(.dark) .chat-input {
		background: var(--bg-tertiary, #2c2c2e);
		border-color: var(--border-primary, #38383a);
		color: var(--text-primary, #fff);
	}

	.chat-input:focus {
		border-color: var(--accent, #d4af37);
	}

	.chat-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.send-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--accent, #d4af37);
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.send-btn:hover:not(:disabled) {
		background: var(--accent-dark, #b8941f);
		transform: scale(1.05);
	}

	.send-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Mobile Fullscreen */
	@media (max-width: 480px) {
		.chat-fab {
			bottom: 16px;
			right: 16px;
		}

		.chat-window {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			width: 100%;
			height: 100%;
			border-radius: 0;
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
	}

	/* Scrollbar */
	.chat-messages::-webkit-scrollbar {
		width: 6px;
	}

	.chat-messages::-webkit-scrollbar-track {
		background: transparent;
	}

	.chat-messages::-webkit-scrollbar-thumb {
		background: var(--border-secondary, #d4d4d4);
		border-radius: 3px;
	}

	:global(.dark) .chat-messages::-webkit-scrollbar-thumb {
		background: var(--border-secondary, #48484a);
	}

	/* Accessibility */
	.chat-fab:focus-visible,
	.header-btn:focus-visible,
	.send-btn:focus-visible,
	.chat-input:focus-visible {
		outline: 2px solid var(--accent, #d4af37);
		outline-offset: 2px;
	}
</style>
