import { createPortal } from 'react-dom';
import { createContext, useContext, useState, useCallback, type ReactNode, type FC, type PropsWithChildren } from 'react';

interface PageHeaderContextValue {
    containerRef: HTMLDivElement | null;
    setContainerRef: (node: HTMLDivElement | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue>({
    containerRef: null,
    setContainerRef: () => { },
});

export const PageHeaderProvider: FC<PropsWithChildren> = ({ children }) => {
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

    return (
        <PageHeaderContext.Provider value={{ containerRef, setContainerRef }}>
            {children}
        </PageHeaderContext.Provider>
    );
};

export const PageHeaderSlot: FC = () => {
    const { setContainerRef } = useContext(PageHeaderContext);

    const refCallback = useCallback(
        (node: HTMLDivElement | null) => setContainerRef(node),
        [setContainerRef],
    );

    return <div ref={refCallback} />;
};

export const PageHeaderPortal: FC<PropsWithChildren> = ({ children }) => {
    const { containerRef } = useContext(PageHeaderContext);

    if (!containerRef) return null;
    return createPortal(children, containerRef);
};
