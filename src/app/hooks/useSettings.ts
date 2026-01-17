import DesktopStorageAdapter from '../adapter/desktop-storage-adapter';
import WebStorageAdapter from '../adapter/web-storage-adapter';
import { isElectron } from '../utils';
import { useState, useEffect, useCallback } from 'react';

function createStorageAdapter(): DataStoreAdapter {
    if (isElectron()) {
        return new DesktopStorageAdapter();
    }

    return new WebStorageAdapter();
}

interface UseSettingsReturn {
    setup: SetupData | null;
    loading: boolean;
    error: string | null;
    hasSetup: boolean;
    saveSetup: (data: SetupData) => Promise<{ error: string | null; success: boolean }>;
    clearSetup: () => Promise<boolean>;
    updateSetup: (updates: Partial<SetupData>) => Promise<boolean>;
    getSignature: () => Promise<string | null>;
    getActiveBranch: () => Promise<Branch | null>;
    refreshSetup: () => Promise<void>;
    isDesktop: boolean;
}

export function useSettings(): UseSettingsReturn {
    const [setup, setSetup] = useState<SetupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasSetup, setHasSetup] = useState(false);
    const [adapter] = useState(() => createStorageAdapter());
    const [isDesktop] = useState(() =>
        typeof window !== 'undefined' && !!window.electronAPI?.settings
    );

    const loadSetup = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const hasSetupResult = await adapter.hasSetup();
            setHasSetup(hasSetupResult.data || false);

            if (hasSetupResult.data) {
                const setupResult = await adapter.getSetup();
                if (setupResult.success && setupResult.data) {
                    setSetup(setupResult.data);
                } else {
                    setError(setupResult.error || 'Failed to load setup');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Unknown error occurred');
            console.error('Error loading setup:', err);
        } finally {
            setLoading(false);
        }
    }, [adapter]);

    useEffect(() => {
        loadSetup();
    }, [loadSetup]);

    const saveSetup = useCallback(async (data: SetupData): Promise<{ error: string | null; success: boolean }> => {
        try {
            setError(null);
            setLoading(true);

            const result = await adapter.saveSetup(data);

            if (result.success) {
                setSetup(data);
                setHasSetup(true);
                return { error: null, success: true };
            } else {
                setError(result.error || 'Failed to save setup');
                return { error: result.error || 'Failed to save setup', success: false };
            }
        } catch (err: any) {
            setError(err.message || 'Unknown error occurred');
            return { error: err.message || 'Unknown error occurred', success: false };
        } finally {
            setLoading(false);
        }
    }, [adapter]);

    const updateSetup = useCallback(async (updates: Partial<SetupData>): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const result = await adapter.updateSetup(updates);

            if (result.success) {
                await loadSetup();
                return true;
            } else {
                setError(result.error || 'Failed to update setup');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Unknown error occurred');
            console.error('Error updating setup:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [adapter, loadSetup]);

    const clearSetup = useCallback(async (): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const result = await adapter.clearSetup();

            if (result.success) {
                setSetup(null);
                setHasSetup(false);
                return true;
            } else {
                setError(result.error || 'Failed to clear setup');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Unknown error occurred');
            console.error('Error clearing setup:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [adapter]);

    const getSignature = useCallback(async (): Promise<string | null> => {
        try {
            const result = await adapter.getSignature();
            return result.success ? result.data || null : null;
        } catch (err: any) {
            console.error('Error getting signature:', err);
            return null;
        }
    }, [adapter]);

    const getActiveBranch = useCallback(async (): Promise<Branch | null> => {
        try {
            const result = await adapter.getActiveBranch();
            return result.success ? result.data || null : null;
        } catch (err: any) {
            console.error('Error getting active branch:', err);
            return null;
        }
    }, [adapter]);

    return {
        setup,
        loading,
        error,
        hasSetup,
        saveSetup,
        clearSetup,
        updateSetup,
        getSignature,
        getActiveBranch,
        refreshSetup: loadSetup,
        isDesktop,
    };
}