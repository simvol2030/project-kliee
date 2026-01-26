/**
 * Chat API Endpoint
 *
 * Handles chat messages for AI consultant "Melena"
 *
 * POST /api/chat - Send message and get AI response
 * GET /api/chat - Get chat settings and greeting
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { chatbotSettings, chatbotSessions, chatbotMessages, chatFaq } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { queryOpenRouter, DEFAULT_SYSTEM_PROMPT } from '$lib/server/openrouter';
import { searchFaq, formatFaqContext } from '$lib/server/faq-search';
import type { ChatLanguage } from '$lib/types/chat.types';

// Rate limiting (simple in-memory)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // messages per window
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimitMap.get(ip);

	if (!entry || entry.resetAt < now) {
		rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
		return true;
	}

	if (entry.count >= RATE_LIMIT) {
		return false;
	}

	entry.count++;
	return true;
}

/**
 * Get or create chatbot settings
 */
async function getSettings() {
	const [settings] = await db.select().from(chatbotSettings).limit(1);

	if (!settings) {
		// Create default settings
		const [newSettings] = await db
			.insert(chatbotSettings)
			.values({
				system_prompt: DEFAULT_SYSTEM_PROMPT,
				model: 'anthropic/claude-3-haiku',
				temperature: '0.7',
				max_tokens: 1024,
				greeting_en: 'Hello! I\'m Melena, your art consultant. How can I help you today?',
				greeting_ru: 'Здравствуйте! Я Мелена, ваш консультант по искусству. Чем могу помочь?',
				greeting_es: 'Hola! Soy Melena, tu asesora de arte. Como puedo ayudarte hoy?',
				greeting_zh: '你好！我是Melena，您的艺术顾问。今天我能帮您什么？',
				is_enabled: true
			})
			.returning();
		return newSettings;
	}

	return settings;
}

/**
 * Ensure chat session exists
 */
async function ensureSession(sessionId: string, lang: string): Promise<void> {
	const [existing] = await db
		.select()
		.from(chatbotSessions)
		.where(eq(chatbotSessions.session_id, sessionId))
		.limit(1);

	if (!existing) {
		await db.insert(chatbotSessions).values({
			session_id: sessionId,
			lang,
			started_at: new Date().toISOString()
		});
	}
}

/**
 * Get conversation history for session
 */
async function getConversationHistory(
	sessionId: string,
	limit: number = 10
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
	const messages = await db
		.select()
		.from(chatbotMessages)
		.where(eq(chatbotMessages.session_id, sessionId))
		.orderBy(desc(chatbotMessages.created_at))
		.limit(limit);

	return messages
		.reverse()
		.filter((m) => m.role === 'user' || m.role === 'assistant')
		.map((m) => ({
			role: m.role as 'user' | 'assistant',
			content: m.content
		}));
}

/**
 * Save message to database
 */
async function saveMessage(
	sessionId: string,
	role: 'user' | 'assistant',
	content: string,
	tokensUsed?: number
): Promise<void> {
	await db.insert(chatbotMessages).values({
		session_id: sessionId,
		role,
		content,
		tokens_used: tokensUsed,
		created_at: new Date().toISOString()
	});

	// Update session last message timestamp
	await db
		.update(chatbotSessions)
		.set({ last_message_at: new Date().toISOString() })
		.where(eq(chatbotSessions.session_id, sessionId));
}

/**
 * GET /api/chat
 * Returns chat settings and greeting
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const lang = (url.searchParams.get('lang') as ChatLanguage) || 'en';
		const settings = await getSettings();

		// Get greeting in requested language
		const greetingKey = `greeting_${lang}` as keyof typeof settings;
		const greeting = (settings[greetingKey] as string) || settings.greeting_en;

		return json({
			enabled: settings.is_enabled,
			greeting,
			model: settings.model,
			avatarUrl: settings.avatar_url || null
		});
	} catch (err) {
		console.error('Error fetching chat settings:', err);
		throw error(500, 'Failed to fetch chat settings');
	}
};

/**
 * POST /api/chat
 * Send message and get AI response
 */
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	try {
		// Rate limiting
		const clientIp = getClientAddress();
		if (!checkRateLimit(clientIp)) {
			throw error(429, 'Too many requests. Please wait a moment.');
		}

		const body = await request.json();
		const { message, lang = 'en', session_id } = body;

		// Validate input
		if (!message || typeof message !== 'string') {
			throw error(400, 'Message is required');
		}

		if (message.length > 2000) {
			throw error(400, 'Message too long (max 2000 characters)');
		}

		// Sanitize message (basic XSS prevention)
		const sanitizedMessage = message
			.replace(/<[^>]*>/g, '')
			.trim();

		if (!sanitizedMessage) {
			throw error(400, 'Message is empty after sanitization');
		}

		// Get settings
		const settings = await getSettings();

		if (!settings.is_enabled) {
			throw error(503, 'Chat is currently disabled');
		}

		// Create or get session
		const chatSessionId = session_id || randomUUID();
		await ensureSession(chatSessionId, lang);

		// Save user message
		await saveMessage(chatSessionId, 'user', sanitizedMessage);

		// Get conversation history
		const history = await getConversationHistory(chatSessionId);

		// Search FAQ for grounding
		const faqMatches = await searchFaq(sanitizedMessage, lang as ChatLanguage);
		const faqContext = formatFaqContext(faqMatches);

		// Build messages for AI
		const aiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
			{
				role: 'system',
				content: settings.system_prompt + faqContext
			},
			...history,
			{
				role: 'user',
				content: sanitizedMessage
			}
		];

		// Query AI
		const { content: aiResponse, tokensUsed } = await queryOpenRouter(aiMessages, {
			model: settings.model,
			temperature: parseFloat(settings.temperature || '0.7'),
			maxTokens: settings.max_tokens || 1024,
			apiKey: settings.api_key || undefined
		});

		// Save AI response
		await saveMessage(chatSessionId, 'assistant', aiResponse, tokensUsed);

		// Return response
		return json({
			success: true,
			message: {
				id: randomUUID(),
				role: 'assistant',
				content: aiResponse,
				timestamp: new Date().toISOString()
			},
			session_id: chatSessionId
		});
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Chat API error:', err);
		throw error(500, 'Failed to process message');
	}
};
