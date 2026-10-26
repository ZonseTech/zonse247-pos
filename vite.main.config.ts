import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import { execSync } from 'node:child_process';

function gitCommit(): string {
	try {
		const sha = execSync('git rev-parse --short HEAD').toString().trim();
		const dirty = execSync('git status --porcelain --untracked-files=no').toString().trim() !== '';
		return dirty ? `${sha}-dirty` : sha;
	} catch {
		return 'unknown';
	}
}

// https://vitejs.dev/config
export default defineConfig({
	define: {
		__BUILD_COMMIT__: JSON.stringify(gitCommit()),
		__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
	},
	build: {
		rollupOptions: {
			external: [
				'better-sqlite3',
				'bindings',
				'file-uri-to-path',
				'node:sqlite',
				'bufferutil',
				'utf-8-validate',
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
