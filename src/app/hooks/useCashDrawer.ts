import { useCallback, useState } from 'react';
import { Notify } from 'notiflix';
import printerService from '../services/printer.service';
import { usePrinterStore } from '../store/printerStore';

/**
 * useCashDrawer - Hook for cash drawer operations
 * 
 * Features:
 * - Open cash drawer manually (No Sale)
 * - Uses cached printer ID for fast operations
 * - Handles errors gracefully
 * 
 * Usage:
 * ```tsx
 * const { openCashDrawer, isOpening } = useCashDrawer();
 * 
 * // Open using default receipt printer
 * await openCashDrawer();
 * 
 * // Open using specific printer
 * await openCashDrawer('printer-id-123');
 * ```
 */
export const useCashDrawer = () => {
    const [isOpening, setIsOpening] = useState(false);
    const defaultReceiptPrinterId = usePrinterStore((state) => state.defaultReceiptPrinterId);

    /**
     * Open the cash drawer
     * @param printerId - Optional printer ID (uses default if not specified)
     */
    const openCashDrawer = useCallback(async (printerId?: string): Promise<boolean> => {
        const printerIdToUse = printerId || defaultReceiptPrinterId;

        if (!printerIdToUse) {
            Notify.failure('No printer configured. Please set up a default printer.');
            return false;
        }

        setIsOpening(true);

        try {
            // The printer service should have a cash drawer open endpoint
            // This assumes the API has: POST /printers/drawer/open/:id
            await printerService.openCashDrawer(printerIdToUse);
            return true;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to open cash drawer';
            console.error('Cash drawer error:', errorMessage);
            Notify.failure(`Failed to open cash drawer: ${errorMessage}`);
            return false;
        } finally {
            setIsOpening(false);
        }
    }, [defaultReceiptPrinterId]);

    /**
     * Open drawer without notification (silent)
     */
    const openCashDrawerSilent = useCallback(async (printerId?: string): Promise<boolean> => {
        const printerIdToUse = printerId || defaultReceiptPrinterId;

        if (!printerIdToUse) {
            console.warn('No printer configured for cash drawer');
            return false;
        }

        try {
            await printerService.openCashDrawer(printerIdToUse);
            return true;
        } catch (err: any) {
            console.error('Cash drawer error:', err?.message);
            return false;
        }
    }, [defaultReceiptPrinterId]);

    return {
        /** Open the cash drawer (with notification) */
        openCashDrawer,
        /** Open the cash drawer (silent - no notification) */
        openCashDrawerSilent,
        /** Whether drawer is currently being opened */
        isOpening,
        /** Whether a default printer is configured */
        hasDefaultPrinter: !!defaultReceiptPrinterId,
    };
};

export default useCashDrawer;
