import { useAuth } from './AuthProvider';
import settingsService from '../services/settings.service';
import { apiUtils } from '../services/http.service';
import { usePrinterStore } from '../store/printerStore';
import terminalSettingsService from '../services/terminal-settings.service';
import printerService from '../services/printer.service';
import type { ReactNode, FunctionComponent, } from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface AppContextType {
    settings: AppSettings | null;
    printerOptions: PrinterInfo | null;
    isLoading: boolean;
    error: Error | null;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    reloadSettings: () => Promise<void>;
}

interface AppProviderProps {
    children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: FunctionComponent<AppProviderProps> = ({ children }) => {
    const { auth } = useAuth()
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [printerOptions, setPrinterOptions] = useState<PrinterInfo | null>(null);
    const printerInitRef = useRef(false);

    // Printer store actions
    const initializePrinterStore = usePrinterStore((state) => state.initialize);
    const isPrinterInitialized = usePrinterStore((state) => state.isInitialized);

    /**
     * Initialize printer cache with receipt settings and default printer IDs
     * This improves print performance by eliminating DB lookups per print
     */
    const initializePrinterCache = useCallback(async (terminalId: string) => {
        if (printerInitRef.current || isPrinterInitialized) return;

        try {
            // Load terminal settings and default printers in parallel
            const [terminalSettings, defaultReceiptPrinter] = await Promise.all([
                terminalSettingsService.show(terminalId).catch(() => null),
                printerService.getDefault('receipt').catch(() => null),
            ]);

            initializePrinterStore({
                terminalId,
                receiptSettings: terminalSettings?.receipt || null,
                defaultReceiptPrinterId: defaultReceiptPrinter?.printerId || null,
                printerOnline: !!defaultReceiptPrinter,
            });

            printerInitRef.current = true;
            console.log('[AppProvider] Printer cache initialized');
        } catch (err) {
            console.error('[AppProvider] Failed to initialize printer cache:', err);
        }
    }, [initializePrinterStore, isPrinterInitialized]);

    const fetchSettings = useCallback(async () => {
        try {
            setIsLoading(true);

            const terminalId = await settingsService.getTerminalId();

            if (!terminalId) {
                console.warn('Terminal not configured, skipping settings load');
                setIsLoading(false);
                return;
            }

            const data = await settingsService.load();

            if (data) {
                setSettings(data as any);

                if (data.apiBaseUrl) {
                    apiUtils.updateBaseUrl(data.apiBaseUrl);
                }

                const savedPrinter = localStorage.getItem('printerOptions');
                if (savedPrinter) {
                    setPrinterOptions(JSON.parse(savedPrinter));
                }

                // Initialize printer cache for fast printing
                // This runs in background and doesn't block settings load
                initializePrinterCache(terminalId);
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            console.error('Error fetching app settings:', err);
        } finally {
            setIsLoading(false);
        }
    }, [initializePrinterCache]);

    const reloadSettings = useCallback(async () => {
        await fetchSettings();
    }, [fetchSettings]);

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => {
            const updated = prev ? { ...prev, ...newSettings } : null;

            if (newSettings.apiBaseUrl && newSettings.apiBaseUrl !== prev?.apiBaseUrl) {
                apiUtils.updateBaseUrl(newSettings.apiBaseUrl);
            }

            return updated;
        });
    };


    useEffect(() => {
        if (auth) fetchSettings();
    }, [auth, fetchSettings]);

    const value = {
        settings,
        isLoading,
        error,
        updateSettings,
        reloadSettings,
        printerOptions,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};