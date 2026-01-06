import { useMemo } from 'react';
import { useApp } from '../context/AppProvider';

export interface KeyboardSettings {
    enabled: boolean;
    theme: 'default' | 'dark' | 'light';
    layout: 'qwerty' | 'numeric' | 'alphanumeric';
    enableSound: boolean;
    enableHaptic: boolean;
}

const defaultSettings: KeyboardSettings = {
    enabled: true,
    theme: 'default',
    layout: 'qwerty',
    enableSound: false,
    enableHaptic: false,
};

/**
 * Hook to access virtual keyboard settings from the app context
 * Returns keyboard settings with defaults applied if settings are not loaded
 */
export function useKeyboardSettings(): KeyboardSettings {
    let settings: AppSettings | null = null;

    try {
        const appContext = useApp();
        settings = appContext.settings;
    } catch {
        // Context not available (e.g., on login page before auth)
        // Return default settings
    }

    return useMemo(() => {
        if (!settings) {
            return defaultSettings;
        }

        return {
            enabled: settings.enableVirtualKeyboard ?? defaultSettings.enabled,
            theme: settings.virtualKeyboardTheme ?? defaultSettings.theme,
            layout: settings.virtualKeyboardLayout ?? defaultSettings.layout,
            enableSound: settings.virtualKeyboardSound ?? defaultSettings.enableSound,
            enableHaptic: settings.virtualKeyboardHaptic ?? defaultSettings.enableHaptic,
        };
    }, [settings]);
}

/**
 * Helper to get keyboard props that can be spread onto InputKeyboard component
 */
export function useKeyboardProps() {
    const keyboardSettings = useKeyboardSettings();

    return useMemo(() => ({
        settings: {
            theme: keyboardSettings.theme,
            enableSound: keyboardSettings.enableSound,
            enableHaptic: keyboardSettings.enableHaptic,
        },
    }), [keyboardSettings]);
}

export default useKeyboardSettings;
