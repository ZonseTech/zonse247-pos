import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const builderArgs = process.argv.slice(2);
const env = {
	...process.env,
	NODE_OPTIONS: [process.env.NODE_OPTIONS, '--max-old-space-size=4096'].filter(Boolean).join(' '),
};

const steps = [
	['npx', ['electron-forge', 'package', '--platform', 'win32', '--arch', 'x64']],
	['npx', ['electron-builder', '--prepackaged', 'out/Zonse247 POS-win32-x64', '--win', 'nsis', ...builderArgs]],
	['node', ['scripts/verify-win-build.mjs']],
];

for (const [command, args] of steps) {
	console.log(`\n> ${command} ${args.join(' ')}\n`);
	const quoted = args.map((arg) => (arg.includes(' ') ? `"${arg}"` : arg));
	const result = spawnSync(command, quoted, { cwd: root, env, stdio: 'inherit', shell: true });
	if (result.status !== 0) {
		console.error(`\nRelease failed at: ${command} ${args.join(' ')} (exit ${result.status ?? result.signal})`);
		process.exit(result.status ?? 1);
	}
}
