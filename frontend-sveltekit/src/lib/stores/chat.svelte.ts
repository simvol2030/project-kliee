/**
 * Chat Store using Svelte 5 runes
 *
 * Manages chat state and syncs with server + sessionStorage
 */

import type { ChatMessage, ChatApiResponse, ChatLanguage } from '$lib/types/chat.types';

const STORAGE_KEY = 'melena_chat_session';
const SESSION_ID_KEY = 'melena_session_id';

interface StoredSession {
	messages: ChatMessage[];
	sessionId: string;
	lastUpdated: string;
}

/**
 * Chat Store class using Svelte 5 runes
 */
class ChatStore {
	// State
	messages = $state<ChatMessage[]>([]);
	isOpen = $state(false);
	isTyping = $state(false);
	isEnabled = $state(true);
	error = $state<string | null>(null);
	sessionId = $state<string | null>(null);
	greeting = $state<string>('');
	avatarUrl = $state<string | null>(null);
	initialized = $state(false);

	/**
	 * Initialize chat store
	 * Loads from sessionStorage and fetches settings
	 */
	async init(lang: ChatLanguage = 'en'): Promise<void> {
		if (this.initialized) return;

		// Load from sessionStorage
		this.loadFromStorage();

		// Fetch settings and greeting from server
		try {
			const response = await fetch(`/api/chat?lang=${lang}`);
			if (response.ok) {
				const data = await response.json();
				this.isEnabled = data.enabled;
				this.greeting = data.greeting;
				this.avatarUrl = data.avatarUrl || null;

				// Add greeting as first message if no messages
				if (this.messages.length === 0 && this.greeting) {
					this.messages = [
						{
							id: 'greeting',
							role: 'assistant',
							content: this.greeting,
							timestamp: new Date()
						}
					];
				}
			}
		} catch (err) {
			console.error('Failed to fetch chat settings:', err);
		}

		this.initialized = true;
	}

	/**
	 * Load session from sessionStorage
	 */
	private loadFromStorage(): void {
		if (typeof window === 'undefined') return;

		try {
			const stored = sessionStorage.getItem(STORAGE_KEY);
			const storedSessionId = sessionStorage.getItem(SESSION_ID_KEY);

			if (stored) {
				const session: StoredSession = JSON.parse(stored);
				this.messages = session.messages.map((m) => ({
					...m,
					timestamp: new Date(m.timestamp)
				}));
			}

			if (storedSessionId) {
				this.sessionId = storedSessionId;
			}
		} catch (err) {
			console.error('Failed to load chat from storage:', err);
		}
	}

	/**
	 * Save session to sessionStorage
	 */
	private saveToStorage(): void {
		if (typeof window === 'undefined') return;

		try {
			const session: StoredSession = {
				messages: this.messages,
				sessionId: this.sessionId || '',
				lastUpdated: new Date().toISOString()
			};
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
			if (this.sessionId) {
				sessionStorage.setItem(SESSION_ID_KEY, this.sessionId);
			}
		} catch (err) {
			console.error('Failed to save chat to storage:', err);
		}
	}

	/**
	 * Send a message and get AI response
	 */
	async sendMessage(content: string, lang: ChatLanguage = 'en'): Promise<void> {
		if (!content.trim()) return;

		// Add user message immediately
		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: 'user',
			content: content.trim(),
			timestamp: new Date()
		};
		this.messages = [...this.messages, userMessage];
		this.saveToStorage();

		// Show typing indicator
		this.isTyping = true;
		this.error = null;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: content.trim(),
					lang,
					session_id: this.sessionId
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `Error: ${response.status}`);
			}

			const data: ChatApiResponse = await response.json();

			if (data.success && data.message) {
				// Add assistant message
				const assistantMessage: ChatMessage = {
					id: data.message.id,
					role: 'assistant',
					content: data.message.content,
					timestamp: new Date(data.message.timestamp)
				};
				this.messages = [...this.messages, assistantMessage];

				// Update session ID
				if (data.session_id) {
					this.sessionId = data.session_id;
				}

				this.saveToStorage();
			} else {
				throw new Error(data.error || 'Unknown error');
			}
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to send message';
			console.error('Send message error:', err);
		} finally {
			this.isTyping = false;
		}
	}

	/**
	 * Toggle chat window open/closed
	 */
	toggle(): void {
		this.isOpen = !this.isOpen;
	}

	/**
	 * Open chat window
	 */
	open(): void {
		this.isOpen = true;
	}

	/**
	 * Close chat window
	 */
	close(): void {
		this.isOpen = false;
	}

	/**
	 * Clear chat history
	 */
	clear(): void {
		this.messages = [];
		this.sessionId = null;
		this.error = null;

		if (typeof window !== 'undefined') {
			sessionStorage.removeItem(STORAGE_KEY);
			sessionStorage.removeItem(SESSION_ID_KEY);
		}

		// Re-add greeting
		if (this.greeting) {
			this.messages = [
				{
					id: 'greeting',
					role: 'assistant',
					content: this.greeting,
					timestamp: new Date()
				}
			];
		}
	}

	/**
	 * Check if there are any user messages
	 */
	get hasMessages(): boolean {
		return this.messages.some((m) => m.role === 'user');
	}
}

// Export singleton instance
export const chatStore = new ChatStore();
