import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const LIVE_API_URL = import.meta.env.VITE_LIVE_API_URL;

interface ConnectivityStatus {
    isOnline: boolean;
    isServerConnected: boolean;
    serverChecking: boolean;
    lastChecked: Date | null;
}

export function useConnectivity(checkInterval: number = 30000): ConnectivityStatus {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [isServerConnected, setIsServerConnected] = useState<boolean>(false);
    const [serverChecking, setServerChecking] = useState<boolean>(true);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const checkServerConnection = useCallback(async () => {
        if (!isOnline || !LIVE_API_URL) {
            setIsServerConnected(false);
            setServerChecking(false);
            return;
        }

        try {
            setServerChecking(true);

            const response = await axios.get(`${LIVE_API_URL}/health`, { timeout: 5000 });
            setIsServerConnected(response.status >= 200 && response.status < 300);
        } catch {
            setIsServerConnected(false);
        } finally {
            setServerChecking(false);
            setLastChecked(new Date());
        }
    }, [isOnline]);

    useEffect(() => {
        checkServerConnection();

        const interval = setInterval(checkServerConnection, checkInterval);

        return () => clearInterval(interval);
    }, [checkServerConnection, checkInterval]);

    useEffect(() => {
        if (isOnline) {
            checkServerConnection();
        }
    }, [isOnline, checkServerConnection]);

    return {
        isOnline,
        isServerConnected,
        serverChecking,
        lastChecked,
    };
}

export default useConnectivity;
