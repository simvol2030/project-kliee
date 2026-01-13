import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
	plugins: [
		sveltekit(),
		visualizer({
			filename: 'stats.html',
			open: false,
			gzipSize: true,
			brotliSize: true
		})
	],
	// SSR configuration - exclude native modules from bundling
	ssr: {
		// Sharp and its platform-specific binaries must be loaded from node_modules at runtime
		// They cannot be bundled by Rollup due to native .node binaries
		external: ['sharp', '@img/sharp-linux-x64', '@img/sharp-darwin-arm64', '@img/sharp-win32-x64']
	},
	build: {
		// Optimize chunk splitting
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Vendor chunks for large dependencies
					if (id.includes('node_modules')) {
						if (id.includes('svelte')) return 'vendor-svelte';
						if (id.includes('drizzle')) return 'vendor-drizzle';
						if (id.includes('better-sqlite3') || id.includes('pg')) return 'vendor-db';
						// Don't chunk sharp - it's externalized
						if (id.includes('sharp') || id.includes('@img/sharp')) return undefined;
						return 'vendor';
					}
					// Separate admin routes into their own chunk
					if (id.includes('/routes/(admin)/')) return 'admin';
				}
			}
		},
		// Generate source maps for debugging
		sourcemap: false,
		// Minification settings
		minify: 'esbuild',
		// Target modern browsers
		target: 'es2020'
	},
	// Optimize dependencies
	optimizeDeps: {
		// Exclude native modules from pre-bundling
		exclude: ['sharp', '@img/sharp-linux-x64', '@img/sharp-darwin-arm64', '@img/sharp-win32-x64']
	}
});
