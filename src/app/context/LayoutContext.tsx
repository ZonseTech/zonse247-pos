import { createContext, useContext, useState, type FunctionComponent, type ReactNode } from 'react';

interface LayoutContextType {
    isSidebarHidden: boolean;
    setIsSidebarHidden: (hidden: boolean) => void;
    toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
    children: ReactNode;
}

export const LayoutProvider: FunctionComponent<LayoutProviderProps> = ({ children }) => {
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarHidden(prev => !prev);
    };

    return (
        <LayoutContext.Provider value={{ isSidebarHidden, setIsSidebarHidden, toggleSidebar }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = (): LayoutContextType => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};

export default LayoutContext;
