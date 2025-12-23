/**
 * Draft Auto-save Store
 *
 * Persists form data to localStorage with debounce.
 * Supports multiple entity types (artworks, series, pages, exhibitions).
 */

import { browser } from '$app/environment';

const STORAGE_PREFIX = 'kliee_draft_';
const DRAFT_EXPIRY_DAYS = 7;

export interface Draft<T = Record<string, unknown>> {
	id: string;
	entityType: string;
	data: T;
	savedAt: number;
	expiresAt: number;
}

/**
 * Get draft key for localStorage
 */
function getDraftKey(entityType: string, id: string): string {
	return `${STORAGE_PREFIX}${entityType}_${id}`;
}

/**
 * Save draft to localStorage
 */
export function saveDraft<T>(entityType: string, id: string, data: T): void {
	if (!browser) return;

	const now = Date.now();
	const draft: Draft<T> = {
		id,
		entityType,
		data,
		savedAt: now,
		expiresAt: now + DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000
	};

	try {
		localStorage.setItem(getDraftKey(entityType, id), JSON.stringify(draft));
		console.log(`[Drafts] Saved ${entityType} draft for ${id}`);
	} catch (err) {
		console.error('[Drafts] Failed to save draft:', err);
	}
}

/**
 * Load draft from localStorage
 */
export function loadDraft<T>(entityType: string, id: string): Draft<T> | null {
	if (!browser) return null;

	try {
		const key = getDraftKey(entityType, id);
		const stored = localStorage.getItem(key);

		if (!stored) return null;

		const draft: Draft<T> = JSON.parse(stored);

		// Check if expired
		if (Date.now() > draft.expiresAt) {
			localStorage.removeItem(key);
			return null;
		}

		return draft;
	} catch (err) {
		console.error('[Drafts] Failed to load draft:', err);
		return null;
	}
}

/**
 * Delete draft from localStorage
 */
export function deleteDraft(entityType: string, id: string): void {
	if (!browser) return;

	try {
		localStorage.removeItem(getDraftKey(entityType, id));
		console.log(`[Drafts] Deleted ${entityType} draft for ${id}`);
	} catch (err) {
		console.error('[Drafts] Failed to delete draft:', err);
	}
}

/**
 * Check if draft exists
 */
export function hasDraft(entityType: string, id: string): boolean {
	if (!browser) return false;

	try {
		const stored = localStorage.getItem(getDraftKey(entityType, id));
		if (!stored) return false;

		const draft: Draft = JSON.parse(stored);
		return Date.now() < draft.expiresAt;
	} catch {
		return false;
	}
}

/**
 * Get draft age in human-readable format
 */
export function getDraftAge(entityType: string, id: string): string | null {
	const draft = loadDraft(entityType, id);
	if (!draft) return null;

	const ageMs = Date.now() - draft.savedAt;
	const minutes = Math.floor(ageMs / 60000);

	if (minutes < 1) return 'just now';
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

	const days = Math.floor(hours / 24);
	return `${days} day${days === 1 ? '' : 's'} ago`;
}

/**
 * List all drafts for an entity type
 */
export function listDrafts(entityType: string): Draft[] {
	if (!browser) return [];

	const drafts: Draft[] = [];
	const prefix = `${STORAGE_PREFIX}${entityType}_`;

	try {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(prefix)) {
				const stored = localStorage.getItem(key);
				if (stored) {
					const draft: Draft = JSON.parse(stored);
					if (Date.now() < draft.expiresAt) {
						drafts.push(draft);
					} else {
						localStorage.removeItem(key);
					}
				}
			}
		}
	} catch (err) {
		console.error('[Drafts] Failed to list drafts:', err);
	}

	return drafts.sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Clear all expired drafts
 */
export function clearExpiredDrafts(): number {
	if (!browser) return 0;

	let cleared = 0;
	const now = Date.now();

	try {
		const keysToRemove: string[] = [];

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(STORAGE_PREFIX)) {
				const stored = localStorage.getItem(key);
				if (stored) {
					const draft: Draft = JSON.parse(stored);
					if (now > draft.expiresAt) {
						keysToRemove.push(key);
					}
				}
			}
		}

		keysToRemove.forEach((key) => {
			localStorage.removeItem(key);
			cleared++;
		});

		if (cleared > 0) {
			console.log(`[Drafts] Cleared ${cleared} expired draft(s)`);
		}
	} catch (err) {
		console.error('[Drafts] Failed to clear expired drafts:', err);
	}

	return cleared;
}

/**
 * Clear all drafts
 */
export function clearAllDrafts(): number {
	if (!browser) return 0;

	let cleared = 0;

	try {
		const keysToRemove: string[] = [];

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(STORAGE_PREFIX)) {
				keysToRemove.push(key);
			}
		}

		keysToRemove.forEach((key) => {
			localStorage.removeItem(key);
			cleared++;
		});

		console.log(`[Drafts] Cleared all ${cleared} draft(s)`);
	} catch (err) {
		console.error('[Drafts] Failed to clear all drafts:', err);
	}

	return cleared;
}

/**
 * Debounced auto-save function
 */
export function createAutoSave<T>(entityType: string, id: string, debounceMs = 2000) {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let lastData: string | null = null;

	return {
		save: (data: T) => {
			const dataStr = JSON.stringify(data);

			// Skip if data hasn't changed
			if (dataStr === lastData) return;
			lastData = dataStr;

			// Clear previous timeout
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			// Set new timeout
			timeoutId = setTimeout(() => {
				saveDraft(entityType, id, data);
				timeoutId = null;
			}, debounceMs);
		},

		saveNow: (data: T) => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			saveDraft(entityType, id, data);
		},

		cancel: () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		},

		clear: () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			deleteDraft(entityType, id);
		}
	};
}
