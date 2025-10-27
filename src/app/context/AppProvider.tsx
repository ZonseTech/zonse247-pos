import { useAuth } from './AuthProvider';
import printerService from '../services/printer.service';
import settingsService from '../services/settings.service';
import type { ReactNode, FunctionComponent, } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
    settings: TerminalSettings | null;
    printerOptions: PrinterInfo | null;
    isLoading: boolean;
    error: Error | null;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    updatePrinterOptions: (options: PrinterInfo) => void;
}

interface AppProviderProps {
    children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: FunctionComponent<AppProviderProps> = ({ children }) => {
    const { auth } = useAuth()
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [settings, setSettings] = useState<TerminalSettings | null>(null);
    const [printerOptions, setPrinterOptions] = useState<PrinterInfo | null>(null);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const data = await settingsService.list();

            if (data) {
                setSettings(data);

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
        setSettings(prev => prev ? { ...prev, ...newSettings } as any : null);
    };

    const updatePrinterOptions = (options: PrinterInfo) => {
        setPrinterOptions(options);
        localStorage.setItem('printerOptions', JSON.stringify(options));
        printerService.setDefault(options);
    }

    useEffect(() => {
        if (auth) fetchSettings();
    }, [auth]);

    const value = {
        settings,
        isLoading,
        error,
        updateSettings,
        printerOptions,
        updatePrinterOptions
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