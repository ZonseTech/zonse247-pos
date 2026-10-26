import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import asar from '@electron/asar';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagedDir = path.join(root, 'out', 'Zonse247 POS-win32-x64');
const installerDir = path.join(root, 'dist-installer');
const feedUrl = 'https://pos.zonse247.com/updates/';
const exeName = 'zonse247_pos.exe';

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const sha = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim();
const changedFiles = execSync('git status --porcelain --untracked-files=no', { cwd: root }).toString().trim();
const dirty = changedFiles !== '';
const expectedCommit = dirty ? `${sha}-dirty` : sha;

const results = [];
const check = (label, ok, info = '') => results.push({ label, ok, info });

const asarPath = path.join(packagedDir, 'resources', 'app.asar');
check('Packaged exe is ' + exeName, fs.existsSync(path.join(packagedDir, exeName)));
check('app.asar exists', fs.existsSync(asarPath));

if (fs.existsSync(asarPath)) {
	const asarPkg = JSON.parse(asar.extractFile(asarPath, 'package.json').toString());
	check('app.asar version', asarPkg.version === version, asarPkg.version);

	const mainJs = asar.extractFile(asarPath, path.join('.vite', 'build', 'main.js')).toString();
	const stamp = mainJs.match(/([0-9a-f]{7,40}(?:-dirty)?|unknown)\W{0,6}, built/)?.[1] ?? 'not found';
	check('app.asar built from this commit', stamp === expectedCommit, stamp);
	check('Update feed is ' + feedUrl, mainJs.includes(feedUrl));
	check('Updater log file present', mainJs.includes('updater.log'));
}

const installerName = `Zonse247_POS_Setup_${version}.exe`;
const installerPath = path.join(installerDir, installerName);
const latestPath = path.join(installerDir, 'latest.yml');
check('Installer ' + installerName, fs.existsSync(installerPath));

if (fs.existsSync(installerPath) && fs.existsSync(asarPath)) {
	check('Installer newer than app.asar', fs.statSync(installerPath).mtimeMs >= fs.statSync(asarPath).mtimeMs);
}

if (fs.existsSync(latestPath)) {
	const latest = fs.readFileSync(latestPath, 'utf8');
	const latestVersion = latest.match(/^version:\s*(.+)$/m)?.[1].trim();
	check('latest.yml version', latestVersion === version, latestVersion);
	if (fs.existsSync(installerPath)) {
		const hash = crypto.createHash('sha512').update(fs.readFileSync(installerPath)).digest('base64');
		check('latest.yml sha512 matches installer', latest.includes(`sha512: ${hash}`));
	}
} else {
	check('latest.yml exists', false);
}

const effectiveConfig = path.join(installerDir, 'builder-effective-config.yaml');
if (fs.existsSync(effectiveConfig)) {
	check('Shortcuts target ' + exeName, fs.readFileSync(effectiveConfig, 'utf8').includes('executableName: zonse247_pos'));
}

console.log(`\nZonse247 POS ${version} @ ${expectedCommit}\n`);
for (const { label, ok, info } of results) {
	console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${info ? ` (${info})` : ''}`);
}

if (dirty) {
	console.log('\n  WARN  Working tree has uncommitted changes; this build is stamped -dirty');
	console.log(changedFiles.split('\n').map((line) => `        ${line}`).join('\n'));
}

const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n${failed} check(s) failed - do not upload this build.\n` : `\nAll checks passed. Upload:\n  ${installerName}\n  ${installerName}.blockmap\n  latest.yml (last)\n`);
process.exit(failed ? 1 : 0);
