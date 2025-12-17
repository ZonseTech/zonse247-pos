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
    setActiveTab: (tab: SettingsTabId) => void;
    setShowResetConfirm: (show: boolean) => void;
    loadSettings: () => Promise<void>;
    handleSubmit: (values: AppSettings) => Promise<void>;
    handleResetSettings: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    /**
     * Load settings from API with error handling and defaults
     * The service now handles the mapping from hierarchical JSON + selective columns to flat AppSettings
     */
    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            // settingsService.load() now returns AppSettings directly (already mapped and with defaults applied)
            const appSettings = await settingsService.load();
            setSettings(appSettings);
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
     */
    const handleSubmit = useCallback(async (values: AppSettings) => {
        try {
            await settingsService.update(values);
            Report.success('Success!', 'Settings saved successfully', 'Ok');
            await loadSettings();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to save settings';
            Notify.failure(errorMessage);
            throw error;
        }
    }, [loadSettings]);

    /**
     * Reset settings to defaults
     */
    const handleResetSettings = useCallback(async () => {
        try {
            await settingsService.reset();
            Report.success('Success!', 'Settings reset to default', 'Ok');
            setShowResetConfirm(false);
            await loadSettings();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to reset settings';
            Notify.failure(errorMessage);
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
        setActiveTab,
        setShowResetConfirm,
        loadSettings,
        handleSubmit,
        handleResetSettings,
    };
};
