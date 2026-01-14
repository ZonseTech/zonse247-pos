/**
 * useBarcodeScannerCamera Hook
 * Provides easy access to camera-based barcode scanning functionality
 * Handles permissions, scanning state, and provides callbacks for scan results
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import barcodeScannerService, {
    type ScannerResult,
    type ScannerStatus,
    type ScannerConfig,
} from '../services/barcode-scanner.service';
import { useScannerFeedback, useScannerSettings } from './useScannerSettings';

export interface UseBarcodeScannerCameraOptions {
    /** Called when a barcode is successfully scanned */
    onScan?: (result: ScannerResult) => void;
    /** Called when an error occurs */
    onError?: (error: Error) => void;
    /** Whether to keep scanning after a successful scan */
    continuous?: boolean;
    /** Scanner configuration options */
    config?: ScannerConfig;
}

export interface UseBarcodeScannerCameraReturn {
    /** Current scanner status */
    status: ScannerStatus;
    /** Whether the camera scanner is open */
    isCameraOpen: boolean;
    /** Whether the scanner is currently scanning */
    isScanning: boolean;
    /** Whether the scanner is loading */
    isLoading: boolean;
    /** Any error that occurred */
    error: string | null;
    /** Last scanned barcode result */
    lastResult: ScannerResult | null;
    /** Whether torch/flashlight is enabled */
    torchEnabled: boolean;
    /** Whether torch is available on this device */
    torchAvailable: boolean;
    /** Open the camera scanner */
    openCamera: () => Promise<void>;
    /** Close the camera scanner */
    closeCamera: () => Promise<void>;
    /** Scan a single barcode */
    scanOnce: () => Promise<ScannerResult | null>;
    /** Toggle the torch/flashlight */
    toggleTorch: () => Promise<void>;
    /** Clear any errors */
    clearError: () => void;
    /** Check if camera scanning is supported */
    isSupported: boolean;
    /** Check if we're on a native platform */
    isNative: boolean;
}

export function useBarcodeScannerCamera(
    options: UseBarcodeScannerCameraOptions = {}
): UseBarcodeScannerCameraReturn {
    const { onScan, onError, continuous = false, config } = options;

    const [status, setStatus] = useState<ScannerStatus>({
        isSupported: false,
        isAvailable: false,
        hasPermission: false,
        isScanning: false,
    });
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<ScannerResult | null>(null);
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [torchAvailable, setTorchAvailable] = useState(false);

    const isNative = Capacitor.isNativePlatform();
    const scannerActiveRef = useRef(false);
    const { triggerFeedback } = useScannerFeedback();
    const scannerSettings = useScannerSettings();

    // Check initial status (ML module preloading is handled by the service constructor)
    useEffect(() => {
        const checkStatus = async () => {
            const scannerStatus = await barcodeScannerService.getStatus();
            setStatus(scannerStatus);

            if (scannerStatus.isSupported) {
                const torchAvail = await barcodeScannerService.isTorchAvailable();
                setTorchAvailable(torchAvail);
            }
        };

        if (isNative) {
            checkStatus();
        }
    }, [isNative]);

    // Handle scan result
    const handleScanResult = useCallback(
        (result: ScannerResult) => {
            setLastResult(result);

            // Play feedback if enabled
            if (scannerSettings.enabled) {
                triggerFeedback();
            }

            onScan?.(result);

            // Close camera if not continuous
            if (!continuous && isCameraOpen) {
                closeCamera();
            }
        },
        [onScan, continuous, isCameraOpen, triggerFeedback, scannerSettings.enabled]
    );

    // Open camera and start scanning
    const openCamera = useCallback(async () => {
        if (!isNative || !status.isSupported) {
            setError('Camera scanning is not supported on this device');
            return;
        }

        if (scannerActiveRef.current) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Check permissions
            let hasPermission = await barcodeScannerService.checkPermissions();
            if (!hasPermission) {
                hasPermission = await barcodeScannerService.requestPermissions();
                if (!hasPermission) {
                    setError('Camera permission is required to scan barcodes');
                    onError?.(new Error('Camera permission denied'));
                    return;
                }
            }

            // Add scan listener
            barcodeScannerService.addScanListener(handleScanResult);

            // Start scanning
            await barcodeScannerService.startScan(config);
            scannerActiveRef.current = true;
            setIsCameraOpen(true);
            setStatus((prev) => ({ ...prev, isScanning: true, hasPermission: true }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start scanner';
            setError(errorMessage);
            onError?.(err instanceof Error ? err : new Error(errorMessage));
        } finally {
            setIsLoading(false);
        }
    }, [isNative, status.isSupported, config, handleScanResult, onError]);

    // Close camera and stop scanning
    const closeCamera = useCallback(async () => {
        if (!scannerActiveRef.current) {
            setIsCameraOpen(false);
            return;
        }

        try {
            await barcodeScannerService.stopScan();
            scannerActiveRef.current = false;
            setIsCameraOpen(false);
            setStatus((prev) => ({ ...prev, isScanning: false }));
        } catch (err) {
            console.error('Error closing camera:', err);
            scannerActiveRef.current = false;
            setIsCameraOpen(false);
        }
    }, []);

    // Scan a single barcode
    const scanOnce = useCallback(async (): Promise<ScannerResult | null> => {
        if (!isNative || !status.isSupported) {
            setError('Camera scanning is not supported on this device');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await barcodeScannerService.scanOnce(config);
            if (result) {
                handleScanResult(result);
            }
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Scan failed';
            setError(errorMessage);
            onError?.(err instanceof Error ? err : new Error(errorMessage));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [isNative, status.isSupported, config, handleScanResult, onError]);

    // Toggle torch
    const toggleTorch = useCallback(async () => {
        if (!torchAvailable || !status.isScanning) {
            return;
        }

        try {
            await barcodeScannerService.toggleTorch();
            const enabled = await barcodeScannerService.isTorchEnabled();
            setTorchEnabled(enabled);
        } catch (err) {
            console.error('Error toggling torch:', err);
        }
    }, [torchAvailable, status.isScanning]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerActiveRef.current) {
                barcodeScannerService.stopScan().catch(console.error);
            }
        };
    }, []);

    return {
        status,
        isCameraOpen,
        isScanning: status.isScanning,
        isLoading,
        error,
        lastResult,
        torchEnabled,
        torchAvailable,
        openCamera,
        closeCamera,
        scanOnce,
        toggleTorch,
        clearError,
        isSupported: status.isSupported,
        isNative,
    };
}

export default useBarcodeScannerCamera;
