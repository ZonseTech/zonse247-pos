import { createPortal } from 'react-dom';
import { createContext, useContext, useState, useCallback, useMemo, useRef, useLayoutEffect, type ReactNode, type FC, type PropsWithChildren } from 'react';

interface PageHeaderContextValue {
    containerRef: HTMLDivElement | null;
    setContainerRef: (node: HTMLDivElement | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue>({
    containerRef: null,
    setContainerRef: () => { },
});

export const PageHeaderProvider: FC<PropsWithChildren> = ({ children }) => {
    const [containerRef, setContainerRefState] = useState<HTMLDivElement | null>(null);

    const setContainerRef = useCallback((node: HTMLDivElement | null) => {
        setContainerRefState((prev) => (prev === node ? prev : node));
    }, []);

    const contextValue = useMemo(() => ({ containerRef, setContainerRef }), [containerRef, setContainerRef]);

    return (
        <PageHeaderContext.Provider value={contextValue}>
            {children}
        </PageHeaderContext.Provider>
    );
};

export const PageHeaderSlot: FC = () => {
    const { setContainerRef } = useContext(PageHeaderContext);
    const slotRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        if (slotRef.current) {
            setContainerRef(slotRef.current);
        }
    }, [setContainerRef]);

    return <div ref={slotRef} />;
};

export const PageHeaderPortal: FC<PropsWithChildren> = ({ children }) => {
    const { containerRef } = useContext(PageHeaderContext);

    if (!containerRef) return null;
    return createPortal(children, containerRef);
};
