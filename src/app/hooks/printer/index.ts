/**
 * Printer Hooks - Optimized printing module for Zonse247 POS
 * 
 * This module provides a complete solution for receipt printing with:
 * - Cached receipt settings (eliminates DB lookup per print)
 * - Fire-and-forget printing (doesn't block UI)
 * - Automatic retry on failure
 * - Cash drawer operations
 * - Printer discovery and setup
 * 
 * Usage:
 * 
 * 1. Initialize on app startup (after terminal selection):
 *    ```tsx
 *    const { initializePrinterCache } = usePrinterInit();
 *    await initializePrinterCache(terminalId);
 *    ```
 * 
 * 2. Print receipts (fire-and-forget):
 *    ```tsx
 *    const { printReceipt } = usePrintReceipt();
 *    printReceipt(saleId); // Non-blocking
 *    ```
 * 
 * 3. Open cash drawer:
 *    ```tsx
 *    const { openCashDrawer } = useCashDrawer();
 *    await openCashDrawer();
 *    ```
 * 
 * 4. Setup new printers:
 *    ```tsx
 *    const { discoverPrinters, registerPrinter } = usePrinterSetup();
 *    const printers = await discoverPrinters();
 *    await registerPrinter({ ...printerData, isDefault: true });
 *    ```
 */

// Main printing hook - fire-and-forget receipt printing
export { usePrintReceipt, type PrintResult, type PrintReceiptOptions } from '../usePrintReceipt';

// Cash drawer operations
export { useCashDrawer } from '../useCashDrawer';

// Printer setup and discovery
export { usePrinterSetup, type PrinterSetupResult, type PrinterRegistrationData } from '../usePrinterSetup';

// Initialization hook - call once at app startup
export { usePrinterInit } from '../usePrinterInit';

// Printer store - for direct state access
export {
    usePrinterStore,
    useReceiptSettings,
    useDefaultReceiptPrinterId,
    usePrinterOnline,
    usePendingJobsCount,
    useFailedJobsCount,
    usePrinterInitialized,
} from '../../store/printerStore';

// Legacy printer hooks (for backward compatibility)
export { usePrinters } from '../usePrinters';
export { usePrintAgent } from '../usePrintAgent';
