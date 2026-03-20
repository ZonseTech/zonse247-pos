import React, { createContext, useContext, useMemo } from 'react';
import { useSocket, type UseSocketReturn } from '../hooks/useSocket';

type SocketContextType = UseSocketReturn;

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
    children: React.ReactNode;
    token: string;
    terminalId: string;
    branchId: string;
    tenantId: string;
    terminalLabel: string;
    serverUrl?: string;
}

/**
 * Wrap the authenticated app tree with this provider so any component
 * can access live socket state (terminal presence, server status,
 * branch notifications) via `useSocketContext()`.
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({
    children,
    token,
    terminalId,
    branchId,
    tenantId,
    terminalLabel,
    serverUrl,
}) => {
    const socketOptions = useMemo(
        () => ({ token, terminalId, branchId, tenantId, terminalLabel, serverUrl }),
        [token, terminalId, branchId, tenantId, terminalLabel, serverUrl],
    );

    const socket = useSocket(socketOptions);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

/**
 * Access the socket context from any component nested inside `<SocketProvider>`.
 *
 * @throws if used outside the provider tree.
 */
export function useSocketContext(): SocketContextType {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
}
