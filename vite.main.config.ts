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
				// Native modules for serial/USB communication
				'serialport',
				'@serialport/bindings-cpp',
				'@serialport/bindings-interface',
				'@serialport/parser-readline',
				'@serialport/parser-delimiter',
				'usb',
				...builtinModules,
				...builtinModules.map((m) => `node:${m}`),
			],
		},
	},
	optimizeDeps: {
		exclude: ['better-sqlite3', 'serialport', '@serialport/bindings-cpp', 'usb'],
	},
});
