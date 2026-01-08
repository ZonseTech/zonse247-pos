import { defineConfig } from 'vite';
import { builtinModules } from 'module';

// https://vitejs.dev/config
export default defineConfig({
	build: {
		rollupOptions: {
			external: [
				'better-sqlite3',
				'bindings',
				'file-uri-to-path',
				'node:sqlite',
				...builtinModules,
				...builtinModules.map((m) => `node:${m}`),
			],
		},
	},
	optimizeDeps: {
		exclude: ['better-sqlite3'],
	},
});
