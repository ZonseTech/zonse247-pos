import { useMemo, useCallback } from 'react';
import { useApp } from '../context/AppProvider';

export interface ScannerSettings {
    enabled: boolean;
    prefix: string;
    beepEnabled: boolean;
    vibrationEnabled: boolean;
    scanMode: 'AUTO' | 'MANUAL' | 'BOTH';
}

const defaultSettings: ScannerSettings = {
    enabled: true,
    prefix: '',
    beepEnabled: true,
    vibrationEnabled: false,
    scanMode: 'AUTO',
};

/**
 * Hook to access barcode scanner settings from the app context
 * Returns scanner settings with defaults applied if settings are not loaded
 */
export function useScannerSettings(): ScannerSettings {
    let settings: AppSettings | null = null;

    try {
        const appContext = useApp();
        settings = appContext.settings;
    } catch {
        // Context not available
        // Return default settings
    }

    return useMemo(() => {
        if (!settings) {
            return defaultSettings;
        }

        return {
            enabled: settings.enableBarcodeScanner ?? defaultSettings.enabled,
            prefix: settings.barcodeScannerPrefix ?? defaultSettings.prefix,
            beepEnabled: settings.scannerBeepEnabled ?? defaultSettings.beepEnabled,
            vibrationEnabled: settings.scannerVibrationEnabled ?? defaultSettings.vibrationEnabled,
            scanMode: settings.barcodeScanMode ?? defaultSettings.scanMode,
        };
    }, [settings]);
}

/**
 * Hook providing scanner feedback functions (beep and vibration)
 */
export function useScannerFeedback() {
    const scannerSettings = useScannerSettings();

    const playBeep = useCallback(() => {
        if (!scannerSettings.beepEnabled) return;
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Scanner beep - higher frequency, slightly longer duration
            oscillator.frequency.value = 1200;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Silently fail if audio context is not supported
        }
    }, [scannerSettings.beepEnabled]);

    const triggerVibration = useCallback(() => {
        if (!scannerSettings.vibrationEnabled) return;
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }, [scannerSettings.vibrationEnabled]);

    const triggerFeedback = useCallback(() => {
        playBeep();
        triggerVibration();
    }, [playBeep, triggerVibration]);

    return {
        playBeep,
        triggerVibration,
        triggerFeedback,
    };
}

export default useScannerSettings;
