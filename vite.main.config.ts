import { defineConfig } from 'vite';
import { builtinModules } from 'module';

// https://vitejs.dev/config
export default defineConfig({
	build: {
		rollupOptions: {
			external: [
				// Native modules
				'better-sqlite3',
				'bindings',
				'file-uri-to-path',
				// Node built-ins
				'node:sqlite',
				...builtinModules,
				...builtinModules.map((m) => `node:${m}`),
			],
		},
	},
	// Don't try to resolve native modules
	optimizeDeps: {
		exclude: ['better-sqlite3'],
	},
});
