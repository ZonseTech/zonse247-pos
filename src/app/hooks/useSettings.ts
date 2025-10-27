import { useState, useEffect, useCallback } from 'react';

declare global {
    interface Window {
        electronAPI: {
            settings: {
                saveSetup: (setupData: SetupData) => Promise<ApiResponse<void>>;
                getSetup: () => Promise<ApiResponse<SetupData>>;
                hasSetup: () => Promise<ApiResponse<boolean>>;
                getSignature: () => Promise<ApiResponse<string>>;
                updateSetup: (updates: Partial<SetupData>) => Promise<ApiResponse<void>>;
                clearSetup: () => Promise<ApiResponse<void>>;
            };
            onOnboardingStatus: (callback: (status: { skipOnboarding: boolean }) => void) => void;
        };
    }
}

interface UseSettingsReturn {
    setup: SetupData | null;
    loading: boolean;
    error: string | null;
    hasSetup: boolean;
    saveSetup: (data: SetupData) => Promise<{
        error: string; success: boolean
    }>;
    clearSetup: () => Promise<boolean>;
    updateSetup: (updates: Partial<SetupData>) => Promise<boolean>;
    getSignature: () => Promise<string | null>;
    refreshSetup: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
    const [setup, setSetup] = useState<SetupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasSetup, setHasSetup] = useState(false);

    const loadSetup = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const hasSetupResult = await window.electronAPI.settings.hasSetup();

            setHasSetup(hasSetupResult.data || false);

            if (hasSetupResult.data) {
                const setupResult = await window.electronAPI.settings.getSetup();
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
    }, []);

    useEffect(() => {
        loadSetup();
    }, [loadSetup]);

    const saveSetup = useCallback(async (data: SetupData): Promise<{ error: string; success: boolean; }> => {
        try {
            setError(null);
            setLoading(true);

            const result = await window.electronAPI.settings.saveSetup(data);

            if (result.success) {
                setSetup(data);
                setHasSetup(true);
                return {
                    error: null, success: true
                };
            } else {
                setError(result.error || 'Failed to save setup');
                return {
                    error: result.error || 'Failed to save setup',
                    success: false
                };
            }
        } catch (err: any) {
            setError(err.message || 'Unknown error occurred');
            return {
                error: err.message || 'Unknown error occurred', success: false
            };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSetup = useCallback(async (updates: Partial<SetupData>): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const result = await window.electronAPI.settings.updateSetup(updates);

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
    }, [loadSetup]);

    const clearSetup = useCallback(async (): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const result = await window.electronAPI.settings.clearSetup();

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
    }, []);

    const getSignature = useCallback(async (): Promise<string | null> => {
        try {
            const result = await window.electronAPI.settings.getSignature();
            return result.success ? result.data || null : null;
        } catch (err: any) {
            console.error('Error getting verificationToken:', err);
            return null;
        }
    }, []);

    return {
        setup,
        loading,
        error,
        hasSetup,
        saveSetup,
        clearSetup,
        updateSetup,
        getSignature,
        refreshSetup: loadSetup,
    };
}
