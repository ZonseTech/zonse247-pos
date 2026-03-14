import { useCallback, useEffect, useRef } from 'react';
import terminalSettingsService from '../services/terminal-settings.service';
import printerService from '../services/printer.service';
import { usePrinterStore } from '../store/printerStore';

/**
 * usePrinterInit - Initialize and cache printer settings for fast printing
 * 
 * This hook should be called once at app initialization (e.g., in App.tsx or landing page)
 * after the user has selected/verified their terminal.
 * 
 * It caches:
 * - Receipt settings (eliminates DB lookup per print)
 * - Default printer IDs (avoids default printer lookup per print)
 * 
 * Usage:
 * ```tsx
 * // In your app initialization component
 * const { initializePrinterCache, isInitialized, isLoading } = usePrinterInit();
 * 
 * useEffect(() => {
 *   if (terminalId) {
 *     initializePrinterCache(terminalId);
 *   }
 * }, [terminalId]);
 * ```
 */
export const usePrinterInit = () => {
    const initRef = useRef(false);

    // Store actions
    const setReceiptSettings = usePrinterStore((state) => state.setReceiptSettings);
    const setTerminalId = usePrinterStore((state) => state.setTerminalId);
    const setDefaultReceiptPrinterId = usePrinterStore((state) => state.setDefaultReceiptPrinterId);
    const setDefaultLabelPrinterId = usePrinterStore((state) => state.setDefaultLabelPrinterId);
    const setDefaultKitchenPrinterId = usePrinterStore((state) => state.setDefaultKitchenPrinterId);
    const updatePrinterHealth = usePrinterStore((state) => state.updatePrinterHealth);
    const initialize = usePrinterStore((state) => state.initialize);
    const setLoading = usePrinterStore((state) => state.setLoading);

    // Store state
    const isInitialized = usePrinterStore((state) => state.isInitialized);
    const isLoading = usePrinterStore((state) => state.isLoading);
    const terminalId = usePrinterStore((state) => state.terminalId);

    /**
     * Load and cache terminal settings including receipt settings
     */
    const loadTerminalSettings = useCallback(async (terminalIdParam: string): Promise<ReceiptDisplaySettings | null> => {
        try {
            const settings = await terminalSettingsService.show(terminalIdParam);
            return settings?.receipt || null;
        } catch (err) {
            console.error('Failed to load terminal settings:', err);
            return null;
        }
    }, []);

    /**
     * Load and cache default printer IDs
     */
    const loadDefaultPrinters = useCallback(async (): Promise<{
        receipt: string | null;
        label: string | null;
        kitchen: string | null;
    }> => {
        try {
            const [receiptPrinter, labelPrinter, kitchenPrinter] = await Promise.all([
                printerService.getDefault('receipt').catch(() => null),
                printerService.getDefault('label').catch(() => null),
                printerService.getDefault('kitchen').catch(() => null),
            ]);

            return {
                receipt: receiptPrinter?.printerId || null,
                label: labelPrinter?.printerId || null,
                kitchen: kitchenPrinter?.printerId || null,
            };
        } catch (err) {
            console.error('Failed to load default printers:', err);
            return { receipt: null, label: null, kitchen: null };
        }
    }, []);

    /**
     * Initialize printer cache with settings and default printer IDs
     * Call this once at app startup after terminal selection
     */
    const initializePrinterCache = useCallback(async (terminalIdParam: string): Promise<boolean> => {
        if (initRef.current && terminalIdParam === terminalId) {
            // Already initialized for this terminal
            return true;
        }

        setLoading(true);

        try {
            // Load terminal settings and default printers in parallel
            const [receiptSettings, defaultPrinters] = await Promise.all([
                loadTerminalSettings(terminalIdParam),
                loadDefaultPrinters(),
            ]);

            // Initialize store with all cached data
            initialize({
                terminalId: terminalIdParam,
                receiptSettings,
                defaultReceiptPrinterId: defaultPrinters.receipt,
                defaultLabelPrinterId: defaultPrinters.label,
                defaultKitchenPrinterId: defaultPrinters.kitchen,
                printerOnline: !!defaultPrinters.receipt, // Assume online if we have a default
            });

            initRef.current = true;

            console.log('[PrinterInit] Printer cache initialized:', {
                terminalId: terminalIdParam,
                hasReceiptSettings: !!receiptSettings,
                defaultReceiptPrinter: defaultPrinters.receipt,
            });

            return true;
        } catch (err) {
            console.error('Failed to initialize printer cache:', err);
            setLoading(false);
            return false;
        }
    }, [terminalId, loadTerminalSettings, loadDefaultPrinters, initialize, setLoading]);

    /**
     * Refresh receipt settings (call when settings are updated)
     */
    const refreshReceiptSettings = useCallback(async (): Promise<boolean> => {
        if (!terminalId) {
            console.warn('Cannot refresh receipt settings: no terminal ID');
            return false;
        }

        try {
            const settings = await loadTerminalSettings(terminalId);
            setReceiptSettings(settings);
            return true;
        } catch (err) {
            console.error('Failed to refresh receipt settings:', err);
            return false;
        }
    }, [terminalId, loadTerminalSettings, setReceiptSettings]);

    /**
     * Refresh default printer IDs (call when printers are updated)
     */
    const refreshDefaultPrinters = useCallback(async (): Promise<boolean> => {
        try {
            const defaultPrinters = await loadDefaultPrinters();
            setDefaultReceiptPrinterId(defaultPrinters.receipt);
            setDefaultLabelPrinterId(defaultPrinters.label);
            setDefaultKitchenPrinterId(defaultPrinters.kitchen);
            return true;
        } catch (err) {
            console.error('Failed to refresh default printers:', err);
            return false;
        }
    }, [loadDefaultPrinters, setDefaultReceiptPrinterId, setDefaultLabelPrinterId, setDefaultKitchenPrinterId]);

    /**
     * Check printer health
     */
    const checkPrinterHealth = useCallback(async (): Promise<boolean> => {
        const defaultReceiptPrinterId = usePrinterStore.getState().defaultReceiptPrinterId;

        if (!defaultReceiptPrinterId) {
            updatePrinterHealth(false);
            return false;
        }

        try {
            const result = await printerService.testConnection(defaultReceiptPrinterId);
            updatePrinterHealth(result.success);
            return result.success;
        } catch (err) {
            updatePrinterHealth(false);
            return false;
        }
    }, [updatePrinterHealth]);

    /**
     * Update receipt settings in cache immediately after saving
     * Use this after user updates settings in the Settings screen
     */
    const updateCachedReceiptSettings = useCallback((settings: ReceiptDisplaySettings) => {
        setReceiptSettings(settings);
    }, [setReceiptSettings]);

    return {
        /** Initialize printer cache (call once at app startup) */
        initializePrinterCache,
        /** Refresh receipt settings from API */
        refreshReceiptSettings,
        /** Refresh default printer IDs from API */
        refreshDefaultPrinters,
        /** Check if default printer is online */
        checkPrinterHealth,
        /** Update cached receipt settings directly (after settings save) */
        updateCachedReceiptSettings,
        /** Whether printer cache is initialized */
        isInitialized,
        /** Whether initialization is in progress */
        isLoading,
        /** Current terminal ID */
        terminalId,
    };
};

export default usePrinterInit;
