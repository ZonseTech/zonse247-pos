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
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';

const version = process.env.npm_package_version;

const nativeModules = [
	'better-sqlite3',
	'bindings',
	'file-uri-to-path',
	'serialport',
	'@serialport/binding-mock',
	'@serialport/bindings-cpp',
	'@serialport/bindings-interface',
	'@serialport/parser-byte-length',
	'@serialport/parser-cctalk',
	'@serialport/parser-delimiter',
	'@serialport/parser-inter-byte-timeout',
	'@serialport/parser-packet-length',
	'@serialport/parser-readline',
	'@serialport/parser-ready',
	'@serialport/parser-regex',
	'@serialport/parser-slip-encoder',
	'@serialport/parser-spacepacket',
	'@serialport/stream',
	'usb',
	'node-addon-api',
	'node-gyp-build',
	'debug',
	'ms',
];

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
		name: 'Zonse247 POS',
		executableName: 'zonse247_pos',
		icon: path.join(__dirname, 'build', 'icon'),
		asar: {
			unpack: '**/{*.node,*.dll,**/prebuilds/**/*,better-sqlite3/**/*,serialport/**/*,@serialport/**/*,usb/**/*,node-gyp-build/**/*}',
		},
		extraResource: [
			path.join(
				__dirname,
				'node_modules',
				'zonse247-pos-api',
				'dist',
				'databases',
				'template.db',
			),
		],
	},
	rebuildConfig: {
		force: process.env.npm_config_platform === process.platform || !process.env.npm_config_platform,
		onlyModules: ['better-sqlite3', 'serialport', '@serialport/bindings-cpp', 'usb'],
	},
	hooks: {
		packageAfterPrune: async (_config, buildPath) => {
			copyNativeModules(buildPath);
		},
	},
	makers: [
		new MakerDeb({
			options: {
				name: 'zonse247-pos',
				productName: 'Zonse247 POS',
				genericName: 'Point of Sale',
				description: 'Zonse247 POS - Point of Sale System',
				icon: path.join(__dirname, 'build', 'icon.png'),
				categories: ['Office', 'Utility'],
				maintainer: 'Zonse247 Devs <zonse247@gmail.com>',
				homepage: 'https://www.zonse247.com',
			},
		}),
		new MakerRpm({
			options: {
				name: 'zonse247-pos',
				productName: 'Zonse247 POS',
				genericName: 'Point of Sale',
				description: 'Zonse247 POS - Point of Sale System',
				icon: path.join(__dirname, 'build', 'icon.png'),
				categories: ['Office', 'Utility'],
				license: 'MIT',
				homepage: 'https://www.zonse247.com',
			},
		}),
		new MakerSquirrel({
			name: 'zonse247_pos',
			authors: 'Zonse247 Devs',
			description: 'Zonse247 POS - Point of Sale System',
			exe: 'zonse247_pos.exe',
			setupExe: `Zonse247_POS_Setup_v${version}.exe`,
			setupIcon: path.join(__dirname, 'build', 'icon.ico'),
			title: `Zonse247 POS ${version}`,
			noMsi: true,
		}),
		new MakerZIP({}, ['darwin', 'linux']),
	],
	plugins: [
		new AutoUnpackNativesPlugin({}),
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
