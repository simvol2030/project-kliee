/**
 * Image Utilities
 *
 * Helper functions for image handling, fallbacks, and optimization
 */

/**
 * Default placeholder image (base64 SVG)
 */
export const PLACEHOLDER_IMAGE =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmNWY1ZjUiLz48cGF0aCBkPSJNMTQwIDIxMCBMMjAwIDE1MCBMMjYwIDIxMCIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIxNDAiIGN5PSIxMTAiIHI9IjI1IiBmaWxsPSIjOTk5IiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=';

/**
 * Get image URL with fallback
 * @param imagePath - Original image path
 * @param fallback - Fallback image URL
 * @returns Image URL
 */
export function getImageUrl(imagePath: string | undefined, fallback: string = PLACEHOLDER_IMAGE): string {
	if (!imagePath) return fallback;

	// If already absolute URL, return as-is
	if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
		return imagePath;
	}

	// Ensure path starts with /
	const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

	return normalizedPath;
}

/**
 * Get srcset for responsive images
 * @param basePath - Base image path (without extension)
 * @param extension - Image extension (jpg, webp, etc.)
 * @param widths - Array of widths to include
 * @returns srcset string
 */
export function getSrcSet(
	basePath: string,
	extension: string = 'webp',
	widths: number[] = [320, 640, 960, 1280]
): string {
	return widths.map((w) => `${basePath}-${w}w.${extension} ${w}w`).join(', ');
}

/**
 * Generate sizes attribute for responsive images
 * @param breakpoints - Object with breakpoint widths and sizes
 * @returns sizes string
 */
export function getSizes(
	breakpoints: Record<number, string> = {
		640: '100vw',
		1024: '50vw',
		1280: '33vw'
	}
): string {
	const entries = Object.entries(breakpoints)
		.sort(([a], [b]) => parseInt(a) - parseInt(b))
		.map(([width, size]) => `(max-width: ${width}px) ${size}`);

	return [...entries, '25vw'].join(', ');
}

/**
 * Check if image exists (client-side)
 * @param src - Image source URL
 * @returns Promise resolving to boolean
 */
export function imageExists(src: string): Promise<boolean> {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(true);
		img.onerror = () => resolve(false);
		img.src = src;
	});
}

/**
 * Preload critical images
 * @param images - Array of image URLs to preload
 */
export function preloadImages(images: string[]): void {
	if (typeof document === 'undefined') return;

	images.forEach((src) => {
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'image';
		link.href = src;
		document.head.appendChild(link);
	});
}

/**
 * Get artwork image path
 * @param series - Series slug
 * @param filename - Image filename
 * @returns Full image path
 */
export function getArtworkImagePath(series: string, filename: string): string {
	return `/images/works/${series}/${filename}`;
}

/**
 * Get exhibition image path
 * @param exhibitionId - Exhibition ID
 * @param filename - Image filename
 * @returns Full image path
 */
export function getExhibitionImagePath(exhibitionId: string, filename: string): string {
	return `/images/exhibitions/${exhibitionId}/${filename}`;
}

/**
 * Get series cover image
 * @param series - Series slug
 * @returns Cover image path
 */
export function getSeriesCoverImage(series: string): string {
	return `/images/works/${series}/cover.jpg`;
}
