import { createContext, useContext, useState, ReactNode, FunctionComponent } from 'react';

interface MobileNavContextType {
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    toggleDrawer: () => void;
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(undefined);

interface MobileNavProviderProps {
    children: ReactNode;
}

export const MobileNavProvider: FunctionComponent<MobileNavProviderProps> = ({ children }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);
    const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

    return (
        <MobileNavContext.Provider value={{ isDrawerOpen, openDrawer, closeDrawer, toggleDrawer }}>
            {children}
        </MobileNavContext.Provider>
    );
};

export const useMobileNav = (): MobileNavContextType => {
    const context = useContext(MobileNavContext);
    if (!context) {
        throw new Error('useMobileNav must be used within a MobileNavProvider');
    }
    return context;
};

export default MobileNavContext;
