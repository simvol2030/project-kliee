/**
 * Chat Types for AI Consultant "Melena"
 *
 * Client-side types for chat widget and store
 */

/**
 * Single chat message
 */
export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
}

/**
 * Chat settings from admin panel
 */
export interface ChatSettings {
	systemPrompt: string;
	model: string;
	temperature: number;
	maxTokens: number;
	greeting: {
		en: string;
		ru: string;
		es: string;
		zh: string;
	};
	isEnabled: boolean;
}

/**
 * FAQ item for knowledge base
 */
export interface FaqItem {
	id: number;
	question: {
		en: string;
		ru?: string;
		es?: string;
		zh?: string;
	};
	answer: {
		en: string;
		ru?: string;
		es?: string;
		zh?: string;
	};
	keywords: string[];
	isActive: boolean;
	orderIndex: number;
}

/**
 * Chat session metadata
 */
export interface ChatSession {
	id: number;
	sessionId: string;
	visitorId?: string;
	lang: string;
	startedAt: Date;
	lastMessageAt?: Date;
	isSaved: boolean;
	adminNote?: string;
	messageCount?: number;
}

/**
 * API request for sending message
 */
export interface ChatApiRequest {
	message: string;
	lang: string;
	session_id?: string;
}

/**
 * API response from chat endpoint
 */
export interface ChatApiResponse {
	success: boolean;
	message?: ChatMessage;
	session_id?: string;
	error?: string;
}

/**
 * Chat widget state
 */
export interface ChatWidgetState {
	isOpen: boolean;
	isTyping: boolean;
	isConnected: boolean;
	error: string | null;
}

/**
 * Supported languages for chat
 */
export type ChatLanguage = 'en' | 'ru' | 'es' | 'zh';

/**
 * Greeting messages by language
 */
export const DEFAULT_GREETINGS: Record<ChatLanguage, string> = {
	en: 'Hello! I\'m Melena, your art consultant. How can I help you today?',
	ru: 'Здравствуйте! Я Мелена, ваш консультант по искусству. Чем могу помочь?',
	es: 'Hola! Soy Melena, tu asesora de arte. Como puedo ayudarte hoy?',
	zh: '你好！我是Melena，您的艺术顾问。今天我能帮您什么？'
};
