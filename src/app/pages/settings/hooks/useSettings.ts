import { useState, useEffect, useCallback } from 'react';
import { Notify, Report } from 'notiflix';
import settingsService from '../../../services/settings.service';
import { getDefaultSettings } from '../constants/defaultValues';
import type { SettingsTabId } from '../constants/config';

interface UseSettingsReturn {
    settings: AppSettings | null;
    loading: boolean;
    activeTab: SettingsTabId;
    showResetConfirm: boolean;
    terminalId: string | null;
    isConfigured: boolean;
    setActiveTab: (tab: SettingsTabId) => void;
    setShowResetConfirm: (show: boolean) => void;
    loadSettings: () => Promise<void>;
    handleSubmit: (values: AppSettings) => Promise<void>;
    handleResetSettings: () => Promise<void>;
    handleUpdateGroup: <K extends keyof TerminalSettingsApiResponse>(
        groupName: K,
        settings: TerminalSettingsApiResponse[K]
    ) => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [terminalId, setTerminalId] = useState<string | null>(null);
    const [isConfigured, setIsConfigured] = useState(false);

    /**
     * Load settings from API with error handling and defaults
     * The service now handles the mapping from hierarchical JSON + selective columns to flat AppSettings
     */
    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);

            const id = await settingsService.getTerminalId();
            setTerminalId(id);

            if (!id) {
                console.warn('Terminal not configured, using defaults');
                setSettings(getDefaultSettings());
                setIsConfigured(false);
                return;
            }

            const appSettings = await settingsService.load();
            setSettings(appSettings);
            setIsConfigured(true);
        } catch (error) {
            console.error('Error loading settings:', error);
            Notify.warning('Using default settings');
            setSettings(getDefaultSettings());
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Save settings to API
     * Uses PUT /:terminalId endpoint
     */
    const handleSubmit = useCallback(async (values: AppSettings) => {
        try {
            await settingsService.update(values);
            Report.success('Success!', 'Settings saved successfully', 'Ok');
            await loadSettings();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save settings';
            Notify.failure(errorMessage, { timeout: 5000 });
            throw error;
        }
    }, [loadSettings]);

    /**
     * Update a specific settings group
     * Uses PATCH /:terminalId/group/:groupName endpoint
     */
    const handleUpdateGroup = useCallback(async <K extends keyof TerminalSettingsApiResponse>(
        groupName: K,
        groupSettings: TerminalSettingsApiResponse[K]
    ) => {
        try {
            await settingsService.updateSettingsGroup(groupName, groupSettings);
            Report.success('Success!', `${String(groupName)} updated successfully`, 'Ok');
            await loadSettings();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update settings group';
            Notify.failure(errorMessage, { timeout: 5000 });
            throw error;
        }
    }, [loadSettings]);

    /**
     * Reset settings to defaults
     */
    const handleResetSettings = useCallback(async () => {
        try {
            await settingsService.resetSettings();
            Report.success('Success!', 'Settings reset to default', 'Ok');
            setShowResetConfirm(false);
            await loadSettings();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reset settings';
            Notify.failure(errorMessage, { timeout: 5000 });
        }
    }, [loadSettings]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    return {
        settings,
        loading,
        activeTab,
        showResetConfirm,
        terminalId,
        isConfigured,
        setActiveTab,
        setShowResetConfirm,
        loadSettings,
        handleSubmit,
        handleResetSettings,
        handleUpdateGroup,
    };
};
