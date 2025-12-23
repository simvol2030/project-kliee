import type { CartItemWithDetails, CartResponse } from '../../routes/api/shop/cart/+server';

/**
 * Cart Store using Svelte 5 runes
 * Manages cart state and syncs with server
 */
class CartStore {
	items = $state<CartItemWithDetails[]>([]);
	count = $state(0);
	totalEur = $state(0);
	loading = $state(false);
	error = $state<string | null>(null);
	initialized = $state(false);

	/**
	 * Initialize cart from server
	 */
	async init(): Promise<void> {
		if (this.initialized) return;

		try {
			this.loading = true;
			this.error = null;

			const response = await fetch('/api/shop/cart');
			if (!response.ok) {
				throw new Error('Failed to fetch cart');
			}

			const data: CartResponse = await response.json();
			this.items = data.items;
			this.count = data.count;
			this.totalEur = data.total_eur;
			this.initialized = true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unknown error';
			console.error('Cart init error:', err);
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Add artwork to cart
	 */
	async addItem(artworkId: string): Promise<{ success: boolean; message?: string }> {
		try {
			this.loading = true;
			this.error = null;

			const response = await fetch('/api/shop/cart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ artwork_id: artworkId })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				if (response.status === 409) {
					return { success: false, message: 'already_in_cart' };
				}
				throw new Error(errorData.message || 'Failed to add item');
			}

			// Refresh cart data
			await this.refresh();
			return { success: true };
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unknown error';
			console.error('Add to cart error:', err);
			return { success: false, message: this.error };
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Remove item from cart
	 */
	async removeItem(artworkId: string): Promise<boolean> {
		try {
			this.loading = true;
			this.error = null;

			const response = await fetch(`/api/shop/cart?artwork_id=${encodeURIComponent(artworkId)}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to remove item');
			}

			// Refresh cart data
			await this.refresh();
			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unknown error';
			console.error('Remove from cart error:', err);
			return false;
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Clear entire cart
	 */
	async clear(): Promise<boolean> {
		try {
			this.loading = true;
			this.error = null;

			const response = await fetch('/api/shop/cart?clear=true', {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to clear cart');
			}

			this.items = [];
			this.count = 0;
			this.totalEur = 0;
			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unknown error';
			console.error('Clear cart error:', err);
			return false;
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Refresh cart data from server
	 */
	async refresh(): Promise<void> {
		try {
			const response = await fetch('/api/shop/cart');
			if (!response.ok) {
				throw new Error('Failed to fetch cart');
			}

			const data: CartResponse = await response.json();
			this.items = data.items;
			this.count = data.count;
			this.totalEur = data.total_eur;
		} catch (err) {
			console.error('Cart refresh error:', err);
		}
	}

	/**
	 * Check if artwork is in cart
	 */
	isInCart(artworkId: string): boolean {
		return this.items.some((item) => item.artwork_id === artworkId);
	}
}

// Export singleton instance
export const cartStore = new CartStore();
