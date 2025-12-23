import { browser } from '$app/environment';

const WISHLIST_KEY = 'kliee_wishlist';

/**
 * Wishlist item stored in localStorage
 */
export interface WishlistItem {
	artwork_id: string;
	added_at: string;
}

/**
 * Wishlist Store using Svelte 5 runes
 * Persists to localStorage (client-side only)
 */
class WishlistStore {
	items = $state<WishlistItem[]>([]);
	initialized = $state(false);

	constructor() {
		// Initialize from localStorage if in browser
		if (browser) {
			this.loadFromStorage();
		}
	}

	/**
	 * Load wishlist from localStorage
	 */
	private loadFromStorage(): void {
		try {
			const stored = localStorage.getItem(WISHLIST_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) {
					this.items = parsed;
				}
			}
		} catch (err) {
			console.error('Failed to load wishlist from storage:', err);
			this.items = [];
		}
		this.initialized = true;
	}

	/**
	 * Save wishlist to localStorage
	 */
	private saveToStorage(): void {
		if (!browser) return;
		try {
			localStorage.setItem(WISHLIST_KEY, JSON.stringify(this.items));
		} catch (err) {
			console.error('Failed to save wishlist to storage:', err);
		}
	}

	/**
	 * Initialize store (for SSR hydration)
	 */
	init(): void {
		if (browser && !this.initialized) {
			this.loadFromStorage();
		}
	}

	/**
	 * Get artwork IDs in wishlist
	 */
	get artworkIds(): string[] {
		return this.items.map((item) => item.artwork_id);
	}

	/**
	 * Get count of items in wishlist
	 */
	get count(): number {
		return this.items.length;
	}

	/**
	 * Check if artwork is in wishlist
	 */
	isInWishlist(artworkId: string): boolean {
		return this.items.some((item) => item.artwork_id === artworkId);
	}

	/**
	 * Add artwork to wishlist
	 */
	add(artworkId: string): boolean {
		if (this.isInWishlist(artworkId)) {
			return false; // Already in wishlist
		}

		this.items = [
			...this.items,
			{
				artwork_id: artworkId,
				added_at: new Date().toISOString()
			}
		];
		this.saveToStorage();
		return true;
	}

	/**
	 * Remove artwork from wishlist
	 */
	remove(artworkId: string): boolean {
		const initialLength = this.items.length;
		this.items = this.items.filter((item) => item.artwork_id !== artworkId);

		if (this.items.length !== initialLength) {
			this.saveToStorage();
			return true;
		}
		return false;
	}

	/**
	 * Toggle artwork in wishlist
	 */
	toggle(artworkId: string): boolean {
		if (this.isInWishlist(artworkId)) {
			this.remove(artworkId);
			return false; // Removed, not in wishlist
		} else {
			this.add(artworkId);
			return true; // Added, now in wishlist
		}
	}

	/**
	 * Clear entire wishlist
	 */
	clear(): void {
		this.items = [];
		this.saveToStorage();
	}
}

// Export singleton instance
export const wishlistStore = new WishlistStore();
