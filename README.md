# zonse247-pharmacy

- https://www.whitecapseo.com
- https://www.trifecta.xyz
- https://bncpackaging.com/

## Fresh Install Requirements

### Prerequisites

- Node.js and npm
- **Visual Studio Build Tools 2022**, with the "Desktop development with C++" workload — required by `node-gyp`/`electron-rebuild` to compile this app's native modules (`@serialport/bindings-cpp`, `better-sqlite3`, `lzma-native`, `usb`) against Electron's ABI.
  - Install via the Visual Studio Installer GUI, or unattended:
    ```
    winget install --id Microsoft.VisualStudio.2022.BuildTools --silent --accept-package-agreements --accept-source-agreements --override "--wait --quiet --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
    ```
  - If the machine has a newer/pre-release Visual Studio (e.g. VS 18 / "2026"), install VS 2022 Build Tools alongside it — the `node-gyp` fork bundled with `@electron/rebuild` does not yet recognize newer major versions and will fail with `Could not find any Visual Studio installation to use` otherwise.

### Install

```
npm install
```

This runs `postinstall` → `electron-rebuild --force --only @serialport/bindings-cpp,better-sqlite3,lzma-native,usb`, rebuilding only the native modules this app ships, against Electron's ABI.

### Known limitation

`bluetooth-serial-port` (an optional dependency pulled in by `zonse247-pos-api`) is intentionally excluded from the rebuild — it's unmaintained and fails to compile against modern V8/Electron. Bluetooth serial support is unavailable until it's replaced.

### Troubleshooting

- **`Could not find any Visual Studio installation to use`** — install VS 2022 Build Tools (see Prerequisites above).
- **`Electron failed to install correctly, please delete node_modules/electron and try installing again`** — on some machines, antivirus/EDR real-time protection silently kills Node's zip-extraction process mid-write during `electron`'s own install step. Workaround:
  1. `rm -rf node_modules/electron`
  2. Manually extract the cached zip (`%LOCALAPPDATA%\electron\Cache\<hash>\electron-v<version>-win32-x64.zip`) with a non-Node tool, e.g. PowerShell's `Expand-Archive`, into `node_modules/electron/dist`
  3. Write the binary name (e.g. `electron.exe`) into `node_modules/electron/path.txt`
  4. Re-run `npm install`

# Settings Key Features:

- 200+ Configurable Settings organized into 7 logical tabs
- MRA Compliance Settings - Z-Report auto-generation, VAT display, API timeouts
- Offline Mode Control - Data retention, sync settings, WiFi-only sync
- Hardware Management - Complete printer, scanner, cash drawer, card reader configuration
- Security Controls - PIN requirements, session timeouts, audit logging, API access
- Payment Processing - Split payments, change calculation, multiple payment methods
- Receipt Customization - QR codes, logos, formatting, kitchen/bar printing
- Customer Management - Loyalty programs, data collection preferences
- Performance Tuning - Cache settings, image compression, data cleanup

[TODO] develop drugs - pills counting device

- add barcode scanner support when add/creating product/inventory for mobile devices
- check duplicate barcodes when adding new products
- add split payment support for single sale
- implement subscription-based pricing models for different user tiers
- add support for multiple payment methods in a single sale transaction
- support assigning of multiple branchs to a single user

- improve offline mode performance and reliability
- enhance security features with 2FA and biometric options- Point of Sale System

- implement advanced reporting and analytics features
- integrate with popular accounting software for seamless financial management
- expand hardware compatibility for a wider range of devices
- optimize receipt customization options with more templates and designs
- develop customer management features with advanced loyalty programs and segmentation

[ADS]

- Product & Inventory Management
- Customer Management
- Point of Sale & Receipts
- Expense Tracking
- HR & Employee Management
- Staff advances & Loans
- Multi-Branch Support
- Inventory Batching & Expiry Tracking
- Inter-Branch Stock Transfers
