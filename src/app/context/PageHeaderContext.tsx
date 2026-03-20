import { createContext, useContext, useState, useCallback, type ReactNode, type FC, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

// ─── Context ───────────────────────────────────────────────────────────────────

interface PageHeaderContextValue {
    /** The DOM node where PageHeader content gets portaled into */
    containerRef: HTMLDivElement | null;
    setContainerRef: (node: HTMLDivElement | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue>({
    containerRef: null,
    setContainerRef: () => { },
});

// ─── Provider (wraps ProtectedLayout) ──────────────────────────────────────────

export const PageHeaderProvider: FC<PropsWithChildren> = ({ children }) => {
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

    return (
        <PageHeaderContext.Provider value={{ containerRef, setContainerRef }}>
            {children}
        </PageHeaderContext.Provider>
    );
};

// ─── Slot (rendered in ProtectedLayout between topbar and main) ────────────────

export const PageHeaderSlot: FC = () => {
    const { setContainerRef } = useContext(PageHeaderContext);

    const refCallback = useCallback(
        (node: HTMLDivElement | null) => setContainerRef(node),
        [setContainerRef],
    );

    return <div ref={refCallback} />;
};

// ─── Portal (used by PageHeader to render into the slot) ───────────────────────

export const PageHeaderPortal: FC<PropsWithChildren> = ({ children }) => {
    const { containerRef } = useContext(PageHeaderContext);

    if (!containerRef) return null;
    return createPortal(children, containerRef);
};
