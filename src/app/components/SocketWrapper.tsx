import { type FunctionComponent, type PropsWithChildren, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { SocketProvider } from '../context/SocketContext';
import { SocketNotificationHandler } from '../components/SocketNotificationHandler';
import { useIdleDetection } from '../hooks/useIdleDetection';
import settingsService from '../services/settings.service';
import terminalService from '../services/terminal.service';
import { isElectron } from '../../helpers/index.helper';

/**
 * Inner component that uses hooks requiring SocketProvider.
 * Activates idle detection + notification toasts.
 */
const SocketConsumer: FunctionComponent<PropsWithChildren> = ({ children }) => {
    useIdleDetection();
    return (
        <>
            <SocketNotificationHandler />
            {children}
        </>
    );
};

/**
 * Resolves the required socket connection params (terminalId, label, etc.)
 * and wraps children in `<SocketProvider>` once everything is available.
 *
 * Falls back to rendering children without the socket layer when terminal
 * info cannot be resolved (e.g. terminal not yet configured).
 */
const SocketWrapper: FunctionComponent<PropsWithChildren> = ({ children }) => {
    const { user } = useAuth();

    const [socketParams, setSocketParams] = useState<{
        token: string;
        terminalId: string;
        terminalLabel: string;
        branchId: string;
        tenantId: string;
        serverUrl: string;
    } | null>(null);

    useEffect(() => {
        let cancelled = false;

        const resolve = async () => {
            if (!user?.userId) return;

            try {
                const token = sessionStorage.getItem('token');
                if (!token) return;

                const parsedToken = typeof token === 'string' ? JSON.parse(token) : token;
                const jwt = typeof parsedToken === 'string' ? parsedToken : (parsedToken as string);

                const terminalId = await settingsService.getTerminalId();
                if (!terminalId || cancelled) return;

                let terminalLabel = 'Terminal';

                try {
                    const terminal = await terminalService.show(terminalId);
                    terminalLabel = terminal.terminalLabel || terminalLabel;
                } catch {
                    // Ignore errors fetching terminal details, use default label
                }

                const branchId = user.currentBranchId || user.branchId || '';
                const tenantId = user.tenantId || '';

                const serverUrl = isElectron()
                    ? (import.meta.env.VITE_API_URL || 'http://localhost:3000')
                    : (import.meta.env.VITE_LIVE_API_URL || import.meta.env.VITE_API_URL || '');

                if (!cancelled) {
                    setSocketParams({
                        token: jwt,
                        terminalId,
                        terminalLabel,
                        branchId,
                        tenantId,
                        serverUrl,
                    });
                }
            } catch (err) {
                console.warn('[SocketWrapper] Failed to resolve socket params:', err);
            }
        };

        resolve();
        return () => { cancelled = true; };
    }, [user?.userId, user?.branchId, user?.currentBranchId, user?.tenantId]);

    if (!socketParams) {
        return <>{children}</>;
    }

    return (
        <SocketProvider
            token={socketParams.token}
            terminalId={socketParams.terminalId}
            branchId={socketParams.branchId}
            tenantId={socketParams.tenantId}
            terminalLabel={socketParams.terminalLabel}
            serverUrl={socketParams.serverUrl}
        >
            <SocketConsumer>
                {children}
            </SocketConsumer>
        </SocketProvider>
    );
};

export default SocketWrapper;
