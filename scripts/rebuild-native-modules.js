#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const targetPlatform = getArg("platform") || process.platform;
const targetArch = getArg("arch") || process.arch;

const packageJson = require("../package.json");
const electronVersion = packageJson.devDependencies.electron
  .replace("^", "")
  .replace("~", "");

const nativeModules = ["better-sqlite3", "@serialport/bindings-cpp", "usb"];

process.env.npm_config_runtime = "electron";
process.env.npm_config_target = electronVersion;
process.env.npm_config_disturl = "https://electronjs.org/headers";
process.env.npm_config_platform = targetPlatform;
process.env.npm_config_arch = targetArch;

try {
  // First, try using @electron/rebuild
  console.log("Using @electron/rebuild to rebuild native modules...\n");

  const rebuildCommand = [
    "npx",
    "@electron/rebuild",
    `--version=${electronVersion}`,
    `--platform=${targetPlatform}`,
    `--arch=${targetArch}`,
    "--module-dir=.",
    "--only=" + nativeModules.join(","),
    "--force",
  ].join(" ");

  console.log(`Running: ${rebuildCommand}\n`);

  execSync(rebuildCommand, {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      // For prebuild-install compatibility
      npm_config_runtime: "electron",
      npm_config_target: electronVersion,
      npm_config_platform: targetPlatform,
      npm_config_arch: targetArch,
    },
  });

  console.log("\n✓ Native modules rebuilt successfully!\n");
} catch (error) {
  console.error("\n✗ Rebuild failed:", error.message);
  console.error("\nTroubleshooting tips:");
  console.error("  1. Make sure you have Python and C++ build tools installed");
  console.error("  2. On Windows: Install Visual Studio Build Tools");
  console.error("  3. On Linux: Install build-essential and python");
  console.error("  4. Try running: npm install --build-from-source");
  process.exit(1);
}

// Verify the native modules exist
console.log("Verifying rebuilt modules...\n");

const nodeModulesPath = path.join(__dirname, "..", "node_modules");

for (const moduleName of nativeModules) {
  const modulePath = path.join(nodeModulesPath, moduleName);

  if (fs.existsSync(modulePath)) {
    // Look for .node files
    const findNodeFiles = (dir, files = []) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && !entry.name.startsWith(".")) {
            findNodeFiles(fullPath, files);
          } else if (entry.name.endsWith(".node")) {
            files.push(fullPath.replace(nodeModulesPath + path.sep, ""));
          }
        }
      } catch (e) {
        // Ignore permission errors
      }
      return files;
    };

    const nodeFiles = findNodeFiles(modulePath);
    if (nodeFiles.length > 0) {
      console.log(`  ✓ ${moduleName}:`);
      nodeFiles.forEach((f) => console.log(`      ${f}`));
    } else {
      console.log(`  ⚠ ${moduleName}: No .node files found (may use prebuild)`);
    }
  } else {
    console.log(`  ✗ ${moduleName}: Module not found`);
  }
}

console.log(
  "\n═══════════════════════════════════════════════════════════════",
);
console.log("  Rebuild Complete!");
console.log(
  "═══════════════════════════════════════════════════════════════\n",
);
