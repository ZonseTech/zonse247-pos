import { useAuth } from './AuthProvider';
import settingsService from '../services/settings.service';
import { apiUtils } from '../services/http.service';
import type { ReactNode, FunctionComponent, } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
    settings: AppSettings | null;
    printerOptions: PrinterInfo | null;
    isLoading: boolean;
    error: Error | null;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
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

    const fetchSettings = async () => {
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
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            console.error('Error fetching app settings:', err);
        } finally {
            setIsLoading(false);
        }
    };

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
    }, [auth]);

    const value = {
        settings,
        isLoading,
        error,
        updateSettings,
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