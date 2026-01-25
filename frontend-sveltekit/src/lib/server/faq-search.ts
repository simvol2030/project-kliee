/**
 * FAQ Search for Chatbot Grounding
 *
 * Searches the FAQ database for relevant answers to use as context
 */

import { db } from '$lib/server/db/client';
import { chatFaq } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { ChatLanguage } from '$lib/types/chat.types';

interface FaqMatch {
	question: string;
	answer: string;
	score: number;
}

/**
 * Simple text matching score
 * Returns a score from 0-1 based on keyword matches
 */
function calculateMatchScore(query: string, text: string, keywords: string[]): number {
	const queryLower = query.toLowerCase();
	const textLower = text.toLowerCase();
	const queryWords = queryLower.split(/\s+/);

	let score = 0;

	// Direct substring match in question/answer
	if (textLower.includes(queryLower)) {
		score += 0.5;
	}

	// Word matches
	for (const word of queryWords) {
		if (word.length > 2 && textLower.includes(word)) {
			score += 0.1;
		}
	}

	// Keyword matches
	for (const keyword of keywords) {
		if (queryLower.includes(keyword.toLowerCase())) {
			score += 0.2;
		}
	}

	return Math.min(score, 1);
}

/**
 * Search FAQ database for relevant entries
 * Returns top matches with score > threshold
 */
export async function searchFaq(
	query: string,
	lang: ChatLanguage,
	limit: number = 3,
	threshold: number = 0.2
): Promise<FaqMatch[]> {
	// Get all active FAQ entries
	const faqs = await db.select().from(chatFaq).where(eq(chatFaq.is_active, true));

	const matches: FaqMatch[] = [];

	for (const faq of faqs) {
		// Get question and answer in the requested language, fallback to English
		const questionKey = `question_${lang}` as keyof typeof faq;
		const answerKey = `answer_${lang}` as keyof typeof faq;

		const question = (faq[questionKey] as string) || faq.question_en;
		const answer = (faq[answerKey] as string) || faq.answer_en;

		// Parse keywords
		let keywords: string[] = [];
		if (faq.keywords) {
			try {
				keywords = JSON.parse(faq.keywords);
			} catch {
				keywords = faq.keywords.split(',').map((k) => k.trim());
			}
		}

		// Calculate score
		const score = calculateMatchScore(query, question + ' ' + answer, keywords);

		if (score >= threshold) {
			matches.push({ question, answer, score });
		}
	}

	// Sort by score and return top matches
	return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Format FAQ matches as context for the AI
 */
export function formatFaqContext(matches: FaqMatch[]): string {
	if (matches.length === 0) {
		return '';
	}

	const context = matches
		.map((m) => `Q: ${m.question}\nA: ${m.answer}`)
		.join('\n\n');

	return `\n\nRelevant information from our knowledge base:\n${context}\n\nUse this information to provide accurate answers when applicable.`;
}
