/**
 * OpenRouter API Client
 *
 * Handles communication with OpenRouter API for AI chat functionality
 */

import { OPENROUTER_API_KEY } from '$env/static/private';

interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

interface OpenRouterSettings {
	model: string;
	temperature: number;
	maxTokens: number;
	apiKey?: string; // Optional: override env key
}

interface OpenRouterResponse {
	id: string;
	choices: Array<{
		message: {
			role: string;
			content: string;
		};
		finish_reason: string;
	}>;
	usage?: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

/**
 * Query OpenRouter API with messages and settings
 */
export async function queryOpenRouter(
	messages: ChatMessage[],
	settings: OpenRouterSettings
): Promise<{ content: string; tokensUsed: number }> {
	// Use API key from settings, fallback to env variable
	const apiKey = settings.apiKey || OPENROUTER_API_KEY;

	if (!apiKey) {
		throw new Error('OpenRouter API key is not configured. Set it in Admin → Chatbot Settings or in .env file.');
	}

	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': 'https://k-liee.com',
			'X-Title': 'K-LIEE Art Consultant Melena'
		},
		body: JSON.stringify({
			model: settings.model,
			messages,
			temperature: settings.temperature,
			max_tokens: settings.maxTokens,
			stream: false
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('OpenRouter API error:', response.status, errorText);
		throw new Error(`OpenRouter API error: ${response.status}`);
	}

	const data: OpenRouterResponse = await response.json();

	if (!data.choices?.[0]?.message?.content) {
		throw new Error('Invalid response from OpenRouter');
	}

	return {
		content: data.choices[0].message.content,
		tokensUsed: data.usage?.total_tokens || 0
	};
}

/**
 * Available models on OpenRouter (commonly used)
 */
export const AVAILABLE_MODELS = [
	{ id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (Fast)' },
	{ id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet (Balanced)' },
	{ id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus (Powerful)' },
	{ id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
	{ id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Budget)' },
	{ id: 'google/gemini-pro', name: 'Gemini Pro' },
	{ id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B' }
] as const;

/**
 * Default system prompt for Melena
 */
export const DEFAULT_SYSTEM_PROMPT = `You are Melena, a professional art consultant for K-LIEE, the portfolio website of artist Svetlana K-Liee.

Your role:
- Answer questions about the artist, her works, exhibitions, and artistic techniques
- Help visitors navigate the website and find specific artworks or collections
- Provide information about purchasing art and commissions
- Share insights about the creative process and artistic philosophy

Guidelines:
- Be warm, professional, and knowledgeable about art
- Stay focused on topics related to the artist and her work
- If asked about unrelated topics, politely redirect the conversation back to art
- Respond in the same language the user writes in
- Keep responses concise but informative

Important: You represent K-LIEE brand. Always maintain a sophisticated and artistic tone.`;
