import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagedDir = 'out/Zonse247 POS-win32-x64';
const builderArgs = process.argv.slice(2);
const env = {
	...process.env,
	NODE_OPTIONS: [process.env.NODE_OPTIONS, '--max-old-space-size=4096'].filter(Boolean).join(' '),
};

function writeAppUpdateConfig() {
	const builderConfig = fs.readFileSync(path.join(root, 'electron-builder.yml'), 'utf8');
	const publish = builderConfig.slice(builderConfig.indexOf('publish:'));
	const read = (key) => publish.match(new RegExp(`^\\s+${key}:\\s*(\\S+)`, 'm'))?.[1];
	const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
	const config = [
		`provider: ${read('provider')}`,
		`url: ${read('url')}`,
		`channel: ${read('channel') ?? 'latest'}`,
		`updaterCacheDirName: ${pkg.name.toLowerCase()}-updater`,
		'',
	].join('\n');
	const target = path.join(root, packagedDir, 'resources', 'app-update.yml');
	fs.writeFileSync(target, config);
	console.log(`Wrote ${path.relative(root, target)}:\n${config}`);
}

const steps = [
	['npx', ['electron-forge', 'package', '--platform', 'win32', '--arch', 'x64']],
	writeAppUpdateConfig,
	['npx', ['electron-builder', '--prepackaged', packagedDir, '--win', 'nsis', ...builderArgs]],
	['node', ['scripts/verify-win-build.mjs']],
];

for (const step of steps) {
	if (typeof step === 'function') {
		console.log(`\n> ${step.name}\n`);
		step();
		continue;
	}
	const [command, args] = step;
	console.log(`\n> ${command} ${args.join(' ')}\n`);
	const quoted = args.map((arg) => (arg.includes(' ') ? `"${arg}"` : arg));
	const result = spawnSync(command, quoted, { cwd: root, env, stdio: 'inherit', shell: true });
	if (result.status !== 0) {
		console.error(`\nRelease failed at: ${command} ${args.join(' ')} (exit ${result.status ?? result.signal})`);
		process.exit(result.status ?? 1);
	}
}
