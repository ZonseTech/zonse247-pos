import { createContext, useContext, ReactNode } from 'react';

interface SettingsContextValue {
    settings: AppSettings;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps {
    children: ReactNode;
    settings: AppSettings;
}

export const SettingsProvider = ({ children, settings }: SettingsProviderProps) => {
    return (
        <SettingsContext.Provider value={{ settings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettingsContext = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettingsContext must be used within a SettingsProvider');
    }
    return context;
};

export default SettingsContext;
