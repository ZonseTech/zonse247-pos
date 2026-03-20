import {
    createContext,
    useContext,
    useState,
    useCallback,
    type FunctionComponent,
    type ReactNode,
} from 'react';
import type { QuickActionType } from '../../types/navigation';

interface QuickActionContextValue {
    /** Currently open action type (null = modal closed) */
    activeAction: QuickActionType | null;
    /** Open the quick-action modal for a given type */
    openAction: (type: QuickActionType) => void;
    /** Close the modal */
    closeAction: () => void;
}

const QuickActionContext = createContext<QuickActionContextValue | null>(null);

export const QuickActionProvider: FunctionComponent<{ children: ReactNode }> = ({
    children,
}) => {
    const [activeAction, setActiveAction] = useState<QuickActionType | null>(null);

    const openAction = useCallback((type: QuickActionType) => {
        setActiveAction(type);
    }, []);

    const closeAction = useCallback(() => {
        setActiveAction(null);
    }, []);

    return (
        <QuickActionContext.Provider value={{ activeAction, openAction, closeAction }}>
            {children}
        </QuickActionContext.Provider>
    );
};

export function useQuickAction(): QuickActionContextValue {
    const ctx = useContext(QuickActionContext);
    if (!ctx) {
        throw new Error('useQuickAction must be used within a QuickActionProvider');
    }
    return ctx;
}

export default QuickActionContext;
