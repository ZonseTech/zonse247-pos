import path from 'node:path';
import fs from 'node:fs';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import type { ForgeConfig } from '@electron-forge/shared-types';

const version = process.env.npm_package_version;

const nativeModules = ['better-sqlite3', 'bindings', 'file-uri-to-path'];

const copyNativeModules = (buildPath: string) => {
	const nodeModulesPath = path.join(buildPath, 'node_modules');
	if (!fs.existsSync(nodeModulesPath)) {
		fs.mkdirSync(nodeModulesPath, { recursive: true });
	}

	for (const moduleName of nativeModules) {
		const srcPath = path.join(__dirname, 'node_modules', moduleName);
		const destPath = path.join(nodeModulesPath, moduleName);
		if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
			fs.cpSync(srcPath, destPath, { recursive: true });
		}
	}
};

const config: ForgeConfig = {
	packagerConfig: {
		asar: false,
	},
	rebuildConfig: {
		force: true,
	},
	hooks: {
		packageAfterPrune: async (_config, buildPath) => {
			copyNativeModules(buildPath);
			const { rebuild } = await import('@electron/rebuild');
			await rebuild({
				buildPath,
				electronVersion: process.env.npm_package_devDependencies_electron || '37.1.0',
				force: true,
			});
		},
	},
	makers: [
		new MakerDeb({}),
		new MakerRpm({}),
		new MakerSquirrel({
			name: 'zonse247_pos',
			authors: 'Zonse247 Devs',
			description: 'Zonse247 POS',
			exe: 'zonse247_pos.exe',
			setupExe: 'zonse247_pos_setup_v' + version + '.exe',
			title: `Zonse247 POS ${version}`,
		}),
		new MakerZIP({}, ['darwin', 'linux']),
	],
	plugins: [
		new VitePlugin({
			build: [
				{
					entry: 'src/main.ts',
					config: 'vite.main.config.ts',
					target: 'main',
				},
				{
					entry: 'src/preload.ts',
					config: 'vite.preload.config.ts',
					target: 'preload',
				},
			],
			renderer: [
				{
					name: 'main_window',
					config: 'vite.renderer.config.ts',
				},
			],
		}),
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
			[FuseV1Options.OnlyLoadAppFromAsar]: false,
		}),
	],
};

export default config;
