/**
 * OpenRouter API Client
 *
 * Handles communication with OpenRouter API for AI chat functionality
 * Features: Retry with exponential backoff, fallback models
 */

import { env } from '$env/dynamic/private';

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

// Fallback models in order of preference (fast and reliable)
const FALLBACK_MODELS = [
	'openai/gpt-4o-mini',
	'openai/gpt-3.5-turbo',
	'google/gemini-flash-1.5',
	'anthropic/claude-3-haiku',
	'meta-llama/llama-3.1-8b-instruct'
];

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make a single API request to OpenRouter
 */
async function makeRequest(
	apiKey: string,
	model: string,
	messages: ChatMessage[],
	settings: OpenRouterSettings
): Promise<OpenRouterResponse> {
	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': 'https://k-liee.com',
			'X-Title': 'K-LIEE Art Consultant Melena'
		},
		body: JSON.stringify({
			model,
			messages,
			temperature: settings.temperature,
			max_tokens: settings.maxTokens,
			stream: false
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		const error = new Error(`OpenRouter API error: ${response.status}`) as Error & {
			status: number;
			details: string;
		};
		error.status = response.status;
		error.details = errorText;
		throw error;
	}

	return response.json();
}

/**
 * Query OpenRouter API with retry logic and fallback models
 */
export async function queryOpenRouter(
	messages: ChatMessage[],
	settings: OpenRouterSettings
): Promise<{ content: string; tokensUsed: number }> {
	const apiKey = settings.apiKey || env.OPENROUTER_API_KEY;

	if (!apiKey) {
		throw new Error('OpenRouter API key is not configured. Set it in Admin → Chatbot Settings or in .env file.');
	}

	// Build list of models to try: primary + fallbacks
	const modelsToTry = [settings.model, ...FALLBACK_MODELS.filter((m) => m !== settings.model)];
	let lastError: Error | null = null;

	for (const model of modelsToTry) {
		// Try each model with retries
		for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
			try {
				const data = await makeRequest(apiKey, model, messages, settings);

				if (!data.choices?.[0]?.message?.content) {
					throw new Error('Invalid response from OpenRouter');
				}

				// Log if we used a fallback model
				if (model !== settings.model) {
					console.log(`OpenRouter: Used fallback model ${model} (primary: ${settings.model})`);
				}

				return {
					content: data.choices[0].message.content,
					tokensUsed: data.usage?.total_tokens || 0
				};
			} catch (err) {
				lastError = err as Error;
				const status = (err as { status?: number }).status;
				const details = (err as { details?: string }).details;

				// Log the error
				console.error(
					`OpenRouter error (model: ${model}, attempt: ${attempt + 1}/${MAX_RETRIES}):`,
					status,
					details?.substring(0, 200)
				);

				// Don't retry on client errors (except 429 rate limit)
				if (status && status >= 400 && status < 500 && status !== 429) {
					break; // Try next model
				}

				// Wait before retry with exponential backoff
				if (attempt < MAX_RETRIES - 1) {
					const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
					console.log(`OpenRouter: Retrying in ${delay}ms...`);
					await sleep(delay);
				}
			}
		}
	}

	// All models and retries exhausted
	console.error('OpenRouter: All models and retries exhausted');
	throw lastError || new Error('Failed to get response from AI');
}

/**
 * Available models on OpenRouter (commonly used)
 * Sorted by reliability and cost-effectiveness for chatbot use
 */
export const AVAILABLE_MODELS = [
	// Recommended for chatbots (fast, reliable, affordable)
	{ id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Recommended)' },
	{ id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (Fast)' },
	{ id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5 (Fast)' },
	{ id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Budget)' },

	// More powerful options
	{ id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Powerful)' },
	{ id: 'openai/gpt-4o', name: 'GPT-4o (Powerful)' },
	{ id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet' },
	{ id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },

	// Open source options
	{ id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
	{ id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B (Free tier)' }
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
