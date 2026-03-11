import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Printer Store - Zustand store for caching printer-related data
 * 
 * Purpose:
 * - Cache receipt settings to skip DB lookup on every print (performance optimization)
 * - Cache default printer ID to avoid lookup per print
 * - Track print queue status
 * - Manage retry state for failed prints
 * 
 * Performance Tips:
 * - Always pass receiptSettings when printing - eliminates 1 DB query per print
 * - Cache printerId to avoid default printer lookup
 * - Fire-and-forget printing (don't await) unless confirmation is needed
 */

export interface PrinterStoreState {
    // Cached Settings (from terminal settings - eliminates DB lookup)
    receiptSettings: ReceiptDisplaySettings | null;
    terminalId: string | null;

    // Cached Printer IDs (avoids default printer lookup per print)
    defaultReceiptPrinterId: string | null;
    defaultLabelPrinterId: string | null;
    defaultKitchenPrinterId: string | null;

    // Print Queue Status
    pendingJobsCount: number;
    failedJobsCount: number;
    lastPrintTime: string | null;
    lastPrintError: string | null;

    // Printer Health
    printerOnline: boolean;
    lastHealthCheck: string | null;

    // Initialization state
    isInitialized: boolean;
    isLoading: boolean;
}

export interface PrinterStoreActions {
    // Settings Management
    setReceiptSettings: (settings: ReceiptDisplaySettings | null) => void;
    setTerminalId: (terminalId: string | null) => void;

    // Printer ID Caching
    setDefaultReceiptPrinterId: (printerId: string | null) => void;
    setDefaultLabelPrinterId: (printerId: string | null) => void;
    setDefaultKitchenPrinterId: (printerId: string | null) => void;

    // Queue Management
    updateQueueStatus: (pending: number, failed: number) => void;
    recordPrintSuccess: () => void;
    recordPrintError: (error: string) => void;

    // Health Management
    updatePrinterHealth: (online: boolean) => void;

    // Initialization
    initialize: (data: Partial<PrinterStoreState>) => void;
    setLoading: (loading: boolean) => void;

    // Reset
    reset: () => void;

    // Getters for convenience
    getReceiptSettings: () => ReceiptDisplaySettings | null;
    getDefaultPrinterId: (type?: 'receipt' | 'label' | 'kitchen') => string | null;
}

const initialState: PrinterStoreState = {
    receiptSettings: null,
    terminalId: null,
    defaultReceiptPrinterId: null,
    defaultLabelPrinterId: null,
    defaultKitchenPrinterId: null,
    pendingJobsCount: 0,
    failedJobsCount: 0,
    lastPrintTime: null,
    lastPrintError: null,
    printerOnline: false,
    lastHealthCheck: null,
    isInitialized: false,
    isLoading: false,
};

export const usePrinterStore = create<PrinterStoreState & PrinterStoreActions>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Settings Management
            setReceiptSettings: (settings) => set({ receiptSettings: settings }),
            setTerminalId: (terminalId) => set({ terminalId }),

            // Printer ID Caching
            setDefaultReceiptPrinterId: (printerId) => set({ defaultReceiptPrinterId: printerId }),
            setDefaultLabelPrinterId: (printerId) => set({ defaultLabelPrinterId: printerId }),
            setDefaultKitchenPrinterId: (printerId) => set({ defaultKitchenPrinterId: printerId }),

            // Queue Management
            updateQueueStatus: (pending, failed) => set({
                pendingJobsCount: pending,
                failedJobsCount: failed,
            }),

            recordPrintSuccess: () => set({
                lastPrintTime: new Date().toISOString(),
                lastPrintError: null,
            }),

            recordPrintError: (error) => set({
                lastPrintError: error,
            }),

            // Health Management
            updatePrinterHealth: (online) => set({
                printerOnline: online,
                lastHealthCheck: new Date().toISOString(),
            }),

            // Initialization - bulk update for app startup
            initialize: (data) => set({
                ...data,
                isInitialized: true,
                isLoading: false,
            }),

            setLoading: (loading) => set({ isLoading: loading }),

            // Reset to initial state
            reset: () => set(initialState),

            // Getters
            getReceiptSettings: () => get().receiptSettings,

            getDefaultPrinterId: (type = 'receipt') => {
                const state = get();
                switch (type) {
                    case 'label':
                        return state.defaultLabelPrinterId;
                    case 'kitchen':
                        return state.defaultKitchenPrinterId;
                    case 'receipt':
                    default:
                        return state.defaultReceiptPrinterId;
                }
            },
        }),
        {
            name: 'zonse247-printer-store',
            storage: createJSONStorage(() => localStorage),
            // Only persist essential cached data
            partialize: (state) => ({
                receiptSettings: state.receiptSettings,
                terminalId: state.terminalId,
                defaultReceiptPrinterId: state.defaultReceiptPrinterId,
                defaultLabelPrinterId: state.defaultLabelPrinterId,
                defaultKitchenPrinterId: state.defaultKitchenPrinterId,
            }),
        }
    )
);

// Selector hooks for optimized re-renders
export const useReceiptSettings = () => usePrinterStore((state) => state.receiptSettings);
export const useDefaultReceiptPrinterId = () => usePrinterStore((state) => state.defaultReceiptPrinterId);
export const usePrinterOnline = () => usePrinterStore((state) => state.printerOnline);
export const usePendingJobsCount = () => usePrinterStore((state) => state.pendingJobsCount);
export const useFailedJobsCount = () => usePrinterStore((state) => state.failedJobsCount);
export const usePrinterInitialized = () => usePrinterStore((state) => state.isInitialized);

export default usePrinterStore;
