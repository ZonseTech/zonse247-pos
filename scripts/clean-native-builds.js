#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

const nodeModulesPath = path.join(__dirname, "..", "node_modules");
const downloadPrebuilds = process.argv.includes("--download-win-prebuilds");

const modulesToClean = ["@serialport/bindings-cpp", "usb"];

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Cleaning Native Module Build Folders");
console.log("  (To ensure prebuilds are used for cross-platform packaging)");
console.log(
  "═══════════════════════════════════════════════════════════════\n",
);

let cleaned = 0;

for (const moduleName of modulesToClean) {
  const modulePath = path.join(nodeModulesPath, moduleName);

  if (!fs.existsSync(modulePath)) {
    console.log(`  ⚠ ${moduleName}: Module not found`);
    continue;
  }

  // Clean build/ folder (locally compiled binaries)
  const buildPath = path.join(modulePath, "build");
  if (fs.existsSync(buildPath)) {
    try {
      fs.rmSync(buildPath, { recursive: true, force: true });
      console.log(`  ✓ ${moduleName}: Removed build/ folder`);
      cleaned++;
    } catch (e) {
      console.log(`  ✗ ${moduleName}: Failed to remove build/ - ${e.message}`);
    }
  } else {
    console.log(`  - ${moduleName}: No build/ folder (already clean)`);
  }

  // Clean bin/ folder (electron-rebuild output)
  const binPath = path.join(modulePath, "bin");
  if (fs.existsSync(binPath)) {
    try {
      fs.rmSync(binPath, { recursive: true, force: true });
      console.log(`  ✓ ${moduleName}: Removed bin/ folder`);
      cleaned++;
    } catch (e) {
      console.log(`  ✗ ${moduleName}: Failed to remove bin/ - ${e.message}`);
    }
  }

  // Verify prebuilds exist
  const prebuildsPath = path.join(modulePath, "prebuilds");
  if (fs.existsSync(prebuildsPath)) {
    const platforms = fs.readdirSync(prebuildsPath);
    console.log(`    Prebuilds available: ${platforms.join(", ")}`);
  } else {
    console.log(`  ⚠ ${moduleName}: No prebuilds folder found!`);
  }
}

// Handle better-sqlite3 specially - it uses 'bindings' which looks in build/Release/
console.log("\n--- better-sqlite3 ---");
const betterSqlitePath = path.join(nodeModulesPath, "better-sqlite3");
const betterSqliteBuildPath = path.join(betterSqlitePath, "build", "Release");
const winPrebuildPath = path.join(
  betterSqlitePath,
  "prebuilds",
  "win32-x64",
  "build",
  "Release",
  "better_sqlite3.node",
);

if (downloadPrebuilds) {
  console.log("  Swapping better-sqlite3 binary for Windows...");

  // Check if Windows prebuild exists
  if (fs.existsSync(winPrebuildPath)) {
    // Backup Linux binary and copy Windows binary
    const linuxBinaryPath = path.join(
      betterSqliteBuildPath,
      "better_sqlite3.node",
    );
    const backupPath = path.join(
      betterSqliteBuildPath,
      "better_sqlite3.node.linux-bak",
    );

    try {
      if (fs.existsSync(linuxBinaryPath) && !fs.existsSync(backupPath)) {
        fs.renameSync(linuxBinaryPath, backupPath);
        console.log(
          `  ✓ Backed up Linux binary to better_sqlite3.node.linux-bak`,
        );
      }

      fs.copyFileSync(winPrebuildPath, linuxBinaryPath);
      console.log(`  ✓ Swapped in Windows binary for better-sqlite3`);
      cleaned++;
    } catch (e) {
      console.log(`  ✗ Failed to swap binary: ${e.message}`);
    }
  } else {
    // Try to download Windows prebuild
    console.log("  Windows prebuild not found locally, downloading...");

    try {
      const packageJson = require(path.join(betterSqlitePath, "package.json"));
      const electronVersion =
        require("../package.json").devDependencies.electron.replace("^", "");

      const abiVersion = 136; // Electron 37.x uses ABI 136

      const downloadUrl = `https://github.com/WiseLibs/better-sqlite3/releases/download/v${packageJson.version}/better-sqlite3-v${packageJson.version}-electron-v${abiVersion}-win32-x64.tar.gz`;

      console.log(`    Version: ${packageJson.version}`);
      console.log(`    Downloading from: ${downloadUrl}`);

      // Download using curl
      const tempFile = "/tmp/better-sqlite3-win.tar.gz";
      execSync(`curl -sL -o ${tempFile} "${downloadUrl}"`, { stdio: "pipe" });

      // Create prebuilds directory
      const prebuildDir = path.join(betterSqlitePath, "prebuilds", "win32-x64");
      fs.mkdirSync(prebuildDir, { recursive: true });

      // Extract
      execSync(`tar -xzf ${tempFile} -C ${prebuildDir}`, { stdio: "pipe" });

      // Now copy the Windows binary to build/Release/
      const extractedBinary = path.join(
        prebuildDir,
        "build",
        "Release",
        "better_sqlite3.node",
      );
      const linuxBinaryPath = path.join(
        betterSqliteBuildPath,
        "better_sqlite3.node",
      );
      const backupPath = path.join(
        betterSqliteBuildPath,
        "better_sqlite3.node.linux-bak",
      );

      if (fs.existsSync(extractedBinary)) {
        if (fs.existsSync(linuxBinaryPath) && !fs.existsSync(backupPath)) {
          fs.renameSync(linuxBinaryPath, backupPath);
          console.log(`  ✓ Backed up Linux binary`);
        }

        fs.copyFileSync(extractedBinary, linuxBinaryPath);
        console.log(`  ✓ Installed Windows binary for better-sqlite3`);
        cleaned++;
      }
    } catch (e) {
      console.log(`  ✗ Failed to download/install: ${e.message}`);
      console.log("    You may need to build on Windows");
    }
  }
} else {
  if (fs.existsSync(betterSqliteBuildPath)) {
    console.log("  ⚠ better-sqlite3: Has local build (Linux binary)");
    console.log("    Run with --download-win-prebuilds to swap for Windows");
  } else {
    console.log("  - better-sqlite3: No build/ folder");
  }
}

console.log(
  "\n═══════════════════════════════════════════════════════════════",
);
console.log(`  Cleaned/swapped ${cleaned} module(s)`);
if (!downloadPrebuilds) {
  console.log("\n  For Windows builds, run:");
  console.log("    npm run clean:native:win");
}
console.log(
  "═══════════════════════════════════════════════════════════════\n",
);

// Function to restore Linux binaries (for local development after Windows build)
if (process.argv.includes("--restore-linux")) {
  console.log("Restoring Linux binaries...");
  const backupPath = path.join(
    betterSqliteBuildPath,
    "better_sqlite3.node.linux-bak",
  );
  const targetPath = path.join(betterSqliteBuildPath, "better_sqlite3.node");

  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, targetPath);
    console.log("  ✓ Restored Linux binary for better-sqlite3");
  }
}
