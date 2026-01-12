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
	}
});
