import { browser } from '$app/environment';

const WISHLIST_KEY = 'kliee_wishlist';

/**
 * Wishlist item stored in localStorage
 * Uses product_id (integer from shop_products table)
 */
export interface WishlistItem {
	product_id: number;
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
					// Migrate old format (artwork_id: string) to new format (product_id: number)
					this.items = parsed
						.map((item: { product_id?: number; artwork_id?: string; added_at: string }) => {
							// If already has product_id (number), use it
							if (typeof item.product_id === 'number') {
								return { product_id: item.product_id, added_at: item.added_at };
							}
							// Skip old artwork_id format - those items will be lost during migration
							// This is acceptable since wishlist is non-critical data
							return null;
						})
						.filter((item): item is WishlistItem => item !== null);
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
	 * Get product IDs in wishlist
	 */
	get productIds(): number[] {
		return this.items.map((item) => item.product_id);
	}

	/**
	 * Get count of items in wishlist
	 */
	get count(): number {
		return this.items.length;
	}

	/**
	 * Check if product is in wishlist
	 */
	isInWishlist(productId: number): boolean {
		return this.items.some((item) => item.product_id === productId);
	}

	/**
	 * Add product to wishlist
	 */
	add(productId: number): boolean {
		if (this.isInWishlist(productId)) {
			return false; // Already in wishlist
		}

		this.items = [
			...this.items,
			{
				product_id: productId,
				added_at: new Date().toISOString()
			}
		];
		this.saveToStorage();
		return true;
	}

	/**
	 * Remove product from wishlist
	 */
	remove(productId: number): boolean {
		const initialLength = this.items.length;
		this.items = this.items.filter((item) => item.product_id !== productId);

		if (this.items.length !== initialLength) {
			this.saveToStorage();
			return true;
		}
		return false;
	}

	/**
	 * Toggle product in wishlist
	 */
	toggle(productId: number): boolean {
		if (this.isInWishlist(productId)) {
			this.remove(productId);
			return false; // Removed, not in wishlist
		} else {
			this.add(productId);
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
