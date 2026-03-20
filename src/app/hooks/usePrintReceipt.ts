import { useCallback, useRef } from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import printerService from '../services/printer.service';
import { usePrinterStore } from '../store/printerStore';

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Print Result for tracking print outcomes
 */
export interface PrintResult {
    success: boolean;
    jobId?: string;
    error?: string;
}

/**
 * Print Receipt Options
 */
export interface PrintReceiptOptions {
    /** Number of copies to print */
    copies?: number;
    /** Include header in receipt */
    includeHeader?: boolean;
    /** Include footer in receipt */
    includeFooter?: boolean;
    /** Include logo in receipt */
    includeLogo?: boolean;
    /** Custom message to add to receipt */
    customMessage?: string;
    /** Maximum retry attempts on failure */
    maxRetries?: number;
    /** Show error notifications */
    showErrorNotification?: boolean;
    /** Show success notification */
    showSuccessNotification?: boolean;
    /** Override receipt settings (uses cached by default) */
    receiptSettings?: ReceiptDisplaySettings;
    /** Override printer ID (uses cached default by default) */
    printerId?: string;
}

/**
 * Print Failed Dialog Data
 */
export interface PrintFailedDialogData {
    saleId: string;
    error: string;
    canRetry: boolean;
}

/**
 * usePrintReceipt - Optimized receipt printing hook
 * 
 * Features:
 * - Uses cached receipt settings to skip DB lookup (performance optimization)
 * - Fire-and-forget printing that doesn't block UI
 * - Automatic retry on failure with configurable attempts
 * - Toast notifications for success/failure
 * 
 * Usage:
 * ```tsx
 * const { printReceipt, printReceiptAsync, reprintReceipt, isPrinting } = usePrintReceipt();
 * 
 * // Fire-and-forget (recommended for sale completion)
 * printReceipt(saleId);
 * 
 * // Await result if needed
 * const result = await printReceiptAsync(saleId);
 * 
 * // Reprint with copy count prompt
 * reprintReceipt(saleId, 2);
 * ```
 */
export const usePrintReceipt = () => {
    const isPrintingRef = useRef(false);

    // Get cached settings from store
    const receiptSettings = usePrinterStore((state) => state.receiptSettings);
    const defaultReceiptPrinterId = usePrinterStore((state) => state.defaultReceiptPrinterId);
    const terminalId = usePrinterStore((state) => state.terminalId);
    const recordPrintSuccess = usePrinterStore((state) => state.recordPrintSuccess);
    const recordPrintError = usePrinterStore((state) => state.recordPrintError);

    /**
     * Internal print function with retry logic
     */
    const printWithRetry = useCallback(async (
        saleId: string,
        options: PrintReceiptOptions = {}
    ): Promise<PrintResult> => {
        const {
            copies = 1,
            includeHeader = true,
            includeFooter = true,
            includeLogo = true,
            customMessage,
            maxRetries = 2,
            showErrorNotification = true,
            showSuccessNotification = false,
            receiptSettings: overrideReceiptSettings,
            printerId: overridePrinterId,
        } = options;

        // Use cached settings unless overridden
        const settingsToUse = overrideReceiptSettings || receiptSettings;
        const printerIdToUse = overridePrinterId || defaultReceiptPrinterId;

        const printRequest: PrintReceiptRequest = {
            saleId,
            printerId: printerIdToUse || undefined,
            terminalId: terminalId || undefined,
            receiptSettings: settingsToUse || undefined,
            copies,
            includeHeader,
            includeFooter,
            includeLogo,
            customMessage,
        };

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const job = await printerService.printReceipt(printRequest);

                // Record success
                recordPrintSuccess();

                if (showSuccessNotification) {
                    Notify.success('Receipt sent to printer');
                }

                return {
                    success: true,
                    jobId: job.printJobId,
                };
            } catch (err: any) {
                const errorMessage = getErrorMessage(err, 'Print failed');

                // If not the last attempt, wait and retry
                if (attempt < maxRetries) {
                    await sleep(500);
                    continue;
                }

                // Last attempt failed
                recordPrintError(errorMessage);

                if (showErrorNotification) {
                    Notify.failure(`Print failed: ${errorMessage}`);
                }

                return {
                    success: false,
                    error: errorMessage,
                };
            }
        }

        // Should not reach here, but handle edge case
        return { success: false, error: 'Unknown error' };
    }, [receiptSettings, defaultReceiptPrinterId, terminalId, recordPrintSuccess, recordPrintError]);

    /**
     * Fire-and-forget print receipt
     * Use this for sale completion - doesn't block UI
     * Errors are handled via toast notifications
     */
    const printReceipt = useCallback((
        saleId: string,
        options: Omit<PrintReceiptOptions, 'showErrorNotification'> = {}
    ): void => {
        if (isPrintingRef.current) {
            console.warn('Print already in progress, queuing...');
        }

        isPrintingRef.current = true;

        printWithRetry(saleId, {
            ...options,
            showErrorNotification: true,
        }).finally(() => {
            isPrintingRef.current = false;
        });
    }, [printWithRetry]);

    /**
     * Async print receipt - returns promise with result
     * Use when you need to know if print succeeded
     */
    const printReceiptAsync = useCallback(async (
        saleId: string,
        options: PrintReceiptOptions = {}
    ): Promise<PrintResult> => {
        isPrintingRef.current = true;

        try {
            return await printWithRetry(saleId, options);
        } finally {
            isPrintingRef.current = false;
        }
    }, [printWithRetry]);

    /**
     * Reprint receipt - use for reprinting from sale history
     */
    const reprintReceipt = useCallback((
        saleId: string,
        copies: number = 1,
        options: Omit<PrintReceiptOptions, 'copies'> = {}
    ): void => {
        printReceipt(saleId, { ...options, copies });
    }, [printReceipt]);

    /**
     * Print multiple receipts in batch
     * Useful for kitchen orders going to same printer
     */
    const printReceiptBatch = useCallback(async (
        saleIds: string[],
        options: PrintReceiptOptions = {}
    ): Promise<PrintResult[]> => {
        const results: PrintResult[] = [];

        for (const saleId of saleIds) {
            const result = await printReceiptAsync(saleId, {
                ...options,
                showSuccessNotification: false,
            });
            results.push(result);
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        if (successCount > 0) {
            Notify.success(`Printed ${successCount} receipt(s)`);
        }
        if (failCount > 0) {
            Notify.warning(`${failCount} receipt(s) failed to print`);
        }

        return results;
    }, [printReceiptAsync]);

    return {
        /** Fire-and-forget print (recommended for sale completion) */
        printReceipt,
        /** Async print with result (when you need confirmation) */
        printReceiptAsync,
        /** Reprint receipt (for sale history) */
        reprintReceipt,
        /** Print multiple receipts */
        printReceiptBatch,
        /** Whether a print is currently in progress */
        isPrinting: isPrintingRef.current,
        /** Cached receipt settings being used */
        receiptSettings,
        /** Cached default printer ID */
        defaultPrinterId: defaultReceiptPrinterId,
    };
};

export default usePrintReceipt;
