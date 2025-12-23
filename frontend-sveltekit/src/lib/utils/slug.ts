/**
 * Utility functions for generating URL-friendly slugs
 */

/**
 * Generates a URL-friendly slug from a string
 * @param text - Input text (typically title_en)
 * @returns Lowercase slug with hyphens
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		// Replace accented characters with ASCII equivalents
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		// Replace spaces and underscores with hyphens
		.replace(/[\s_]+/g, '-')
		// Remove all non-alphanumeric characters except hyphens
		.replace(/[^a-z0-9-]/g, '')
		// Remove multiple consecutive hyphens
		.replace(/-+/g, '-')
		// Remove leading/trailing hyphens
		.replace(/^-+|-+$/g, '');
}

/**
 * Generates a unique slug by appending a number suffix if needed
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
	if (!existingSlugs.includes(baseSlug)) {
		return baseSlug;
	}

	let counter = 2;
	let newSlug = `${baseSlug}-${counter}`;

	while (existingSlugs.includes(newSlug)) {
		counter++;
		newSlug = `${baseSlug}-${counter}`;
	}

	return newSlug;
}
