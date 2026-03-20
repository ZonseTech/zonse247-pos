import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
    ConnectedTerminal,
    ServerStatus,
    BranchNotification,
    TerminalListResponse,
} from 'zonse247-pos-api';

// ─── Options ──────────────────────────────────────────
export interface UseSocketOptions {
    /** JWT auth token */
    token: string;
    terminalId: string;
    branchId: string;
    tenantId: string;
    terminalLabel: string;
    /** Base URL of the API server (defaults to VITE_API_URL) */
    serverUrl?: string;
    metadata?: {
        deviceId?: string;
        osName?: string;
        osVersion?: string;
        appVersion?: string;
    };
}

// ─── Return type ──────────────────────────────────────
export interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    onlineTerminals: ConnectedTerminal[];
    serverStatus: ServerStatus | null;
    notifications: BranchNotification[];
    connect: () => void;
    disconnect: () => void;
    refreshTerminalList: (sock?: Socket) => void;
    getServerStatus: () => Promise<ServerStatus>;
    sendBranchNotification: (notification: Omit<BranchNotification, 'timestamp'>) => void;
    setTerminalIdle: () => void;
    setTerminalActive: () => void;
    clearNotifications: () => void;
}

/**
 * Core WebSocket hook.
 *
 * Connects to the API's Socket.IO server, manages heartbeats, tracks
 * terminal presence, receives branch notifications and server status.
 *
 * @see WEBSOCKET_FRONTEND_GUIDE.md
 */
export function useSocket(options: UseSocketOptions): UseSocketReturn {
    const socketRef = useRef<Socket | null>(null);
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineTerminals, setOnlineTerminals] = useState<ConnectedTerminal[]>([]);
    const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
    const [notifications, setNotifications] = useState<BranchNotification[]>([]);

    // ─── Heartbeat ──────────────────────────────────────
    const startHeartbeat = useCallback((socket: Socket) => {
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);

        heartbeatRef.current = setInterval(() => {
            socket.emit(
                'terminal:heartbeat',
                {
                    terminalId: options.terminalId,
                    timestamp: new Date().toISOString(),
                },
                (_ack: unknown) => {
                    // Server acknowledged — _ack.serverTime available for clock sync
                },
            );
        }, 30_000);
    }, [options.terminalId]);

    const stopHeartbeat = useCallback(() => {
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
        }
    }, []);

    // ─── Refresh terminal list ──────────────────────────
    const refreshTerminalList = useCallback((sock?: Socket) => {
        const s = sock || socketRef.current;
        s?.emit(
            'terminal:list',
            {},
            (response: TerminalListResponse) => {
                setOnlineTerminals(response.terminals);
            },
        );
    }, []);

    // ─── Connect ────────────────────────────────────────
    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        const baseURL = options.serverUrl || import.meta.env.VITE_API_URL || 'http://localhost:3000';

        const socket = io(baseURL, {
            auth: {
                token: options.token,
                terminalId: options.terminalId,
                branchId: options.branchId,
                tenantId: options.tenantId,
                terminalLabel: options.terminalLabel,
                metadata: options.metadata,
            },
            transports: ['polling', 'websocket'],
            upgrade: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
        });

        // ── Connection lifecycle ──────────────────────────
        socket.on('connect', () => {
            setIsConnected(true);
            startHeartbeat(socket);
            refreshTerminalList(socket);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            stopHeartbeat();
        });

        socket.on('connect_error', (error) => {
            console.error('[useSocket] Connection error:', error.message);
        });

        // ── Terminal presence events ──────────────────────
        socket.on('terminal:online', () => refreshTerminalList(socket));
        socket.on('terminal:offline', () => refreshTerminalList(socket));
        socket.on('terminal:idle', () => refreshTerminalList(socket));

        socket.on('terminal:list_update', (payload: TerminalListResponse) => {
            setOnlineTerminals(payload.terminals);
        });

        // ── Server events ────────────────────────────────
        socket.on('server:status', (status: ServerStatus) => {
            setServerStatus(status);
        });

        socket.on('server:maintenance', (info: { message: string }) => {
            console.warn('[useSocket] Server maintenance:', info.message);
        });

        // ── Branch notifications ─────────────────────────
        socket.on('branch:notification', (notification: BranchNotification) => {
            setNotifications((prev) => [notification, ...prev].slice(0, 50));
        });

        // ── Force disconnect ─────────────────────────────
        socket.on(
            'terminal:force_disconnect',
            (payload: { reason: string; reconnectAllowed: boolean }) => {
                console.warn('[useSocket] Forced disconnect:', payload.reason);
                if (!payload.reconnectAllowed) {
                    socket.disconnect();
                }
            },
        );

        socketRef.current = socket;
    }, [options, startHeartbeat, stopHeartbeat, refreshTerminalList]);

    // ─── Disconnect ─────────────────────────────────────
    const disconnect = useCallback(() => {
        stopHeartbeat();
        socketRef.current?.disconnect();
        socketRef.current = null;
        setIsConnected(false);
    }, [stopHeartbeat]);

    // ─── Public action methods ──────────────────────────
    const getServerStatus = useCallback((): Promise<ServerStatus> => {
        return new Promise((resolve, reject) => {
            if (!socketRef.current) return reject(new Error('Socket not connected'));
            socketRef.current.emit('server:status', (status: ServerStatus) => {
                setServerStatus(status);
                resolve(status);
            });
        });
    }, []);

    const sendBranchNotification = useCallback(
        (notification: Omit<BranchNotification, 'timestamp'>) => {
            socketRef.current?.emit('branch:notification', {
                ...notification,
                timestamp: new Date().toISOString(),
            } as BranchNotification);
        },
        [],
    );

    const setTerminalIdle = useCallback(() => {
        socketRef.current?.emit('terminal:status_change', { status: 'idle' as const });
    }, []);

    const setTerminalActive = useCallback(() => {
        socketRef.current?.emit('terminal:status_change', { status: 'online' as const });
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // ─── Auto-connect / cleanup ─────────────────────────
    useEffect(() => {
        if (options.token && options.terminalId) {
            connect();
        }
        return () => disconnect();
    }, [connect, disconnect, options.token, options.terminalId]);

    return {
        socket: socketRef.current,
        isConnected,
        onlineTerminals,
        serverStatus,
        notifications,
        connect,
        disconnect,
        refreshTerminalList,
        getServerStatus,
        sendBranchNotification,
        setTerminalIdle,
        setTerminalActive,
        clearNotifications,
    };
}
