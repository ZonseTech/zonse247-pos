/**
 * Camera Barcode Scanner Component
 * Uses Google Code Scanner for fast, native barcode scanning on mobile devices
 * Falls back to WebView-based scanning if Google Scanner is unavailable
 */

import { FunctionComponent, useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HiX, HiLightningBolt, HiRefresh } from 'react-icons/hi';
import { BsUpcScan } from 'react-icons/bs';
import barcodeScannerService, {
    type ScannerResult,
    type ScannerStatus,
} from '../../services/barcode-scanner.service';
import { useScannerFeedback } from '../../hooks/useScannerSettings';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface CameraBarcodeScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (result: ScannerResult) => void;
    onError?: (error: Error) => void;
    continuous?: boolean;
    title?: string;
    subtitle?: string;
    /** Use native Google Scanner for faster scanning (default: true) */
    useNativeScanner?: boolean;
}

/**
 * Helper to make the webview transparent so native camera shows through
 */
const setWebviewTransparent = (transparent: boolean) => {
    if (transparent) {
        document.body.classList.add('scanner-active');
        document.documentElement.style.setProperty('--ion-background-color', 'transparent');
        document.body.style.backgroundColor = 'transparent';
        document.documentElement.style.backgroundColor = 'transparent';
    } else {
        document.body.classList.remove('scanner-active');
        document.documentElement.style.removeProperty('--ion-background-color');
        document.body.style.backgroundColor = '';
        document.documentElement.style.backgroundColor = '';
    }
};

const CameraBarcodeScanner: FunctionComponent<CameraBarcodeScannerProps> = ({
    isOpen,
    onClose,
    onScan,
    onError,
    continuous = false,
    title = 'Scan Barcode',
    subtitle = 'Point camera at barcode',
    useNativeScanner = true,
}) => {
    const [status, setStatus] = useState<ScannerStatus>({
        isSupported: false,
        isAvailable: false,
        hasPermission: false,
        isScanning: false,
    });
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [torchAvailable, setTorchAvailable] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
    const [usingNativeScanner, setUsingNativeScanner] = useState(false);
    const scannerActiveRef = useRef(false);
    const shouldCloseRef = useRef(false);
    const hasProcessedScanRef = useRef(false);
    const nativeScanInProgressRef = useRef(false);
    const { triggerFeedback } = useScannerFeedback();
    const isMobile = useIsMobile();

    // Check scanner status on mount
    useEffect(() => {
        const checkStatus = async () => {
            // Skip scanner initialization on non-native platforms
            if (!isMobile) {
                setStatus({
                    isSupported: false,
                    isAvailable: false,
                    hasPermission: false,
                    isScanning: false,
                });
                return;
            }

            try {
                const scannerStatus = await barcodeScannerService.getStatus();
                setStatus(scannerStatus);

                if (scannerStatus.isSupported) {
                    const torchAvail = await barcodeScannerService.isTorchAvailable();
                    setTorchAvailable(torchAvail);
                }
            } catch (err) {
                console.warn('Scanner status check failed:', err);
                setStatus({
                    isSupported: false,
                    isAvailable: false,
                    hasPermission: false,
                    isScanning: false,
                });
            }
        };

        if (isOpen) {
            checkStatus();
        }
    }, [isOpen]);

    // Stop scanning
    const stopScanning = useCallback(async () => {
        if (!scannerActiveRef.current) return;

        try {
            await barcodeScannerService.stopScan();
            scannerActiveRef.current = false;
            setStatus((prev) => ({ ...prev, isScanning: false }));
        } catch (err) {
            console.error('Error stopping scanner:', err);
        } finally {
            // Always restore webview when stopping
            setWebviewTransparent(false);
        }
    }, []);

    // Handle close
    const handleClose = useCallback(async () => {
        nativeScanInProgressRef.current = false;
        await stopScanning();
        // Ensure webview is restored
        setWebviewTransparent(false);
        setLastScannedCode(null);
        setError(null);
        onClose();
    }, [stopScanning, onClose]);

    // Handle scan result
    const handleScanResult = useCallback(
        (result: ScannerResult) => {
            // Use ref for immediate synchronous check to prevent rapid-fire duplicates
            if (!continuous && hasProcessedScanRef.current) {
                return;
            }

            // Prevent duplicate scans of the same barcode in quick succession
            if (result.barcode === lastScannedCode) {
                return;
            }

            // Mark as processed immediately (synchronous)
            if (!continuous) {
                hasProcessedScanRef.current = true;
            }

            setLastScannedCode(result.barcode);
            triggerFeedback();
            onScan(result);

            // If not continuous, mark for close and stop scanning
            if (!continuous) {
                shouldCloseRef.current = true;
                nativeScanInProgressRef.current = false;
                // Stop scanning first, then close
                barcodeScannerService.stopScan().then(() => {
                    scannerActiveRef.current = false;
                    setWebviewTransparent(false);
                    setStatus((prev) => ({ ...prev, isScanning: false }));
                    onClose();
                }).catch((err) => {
                    console.error('Error stopping scanner after scan:', err);
                    onClose();
                });
            } else {
                // Clear the last scanned code after a short delay to allow re-scanning
                setTimeout(() => {
                    setLastScannedCode(null);
                }, 1500);
            }
        },
        [onScan, continuous, triggerFeedback, lastScannedCode, onClose]
    );

    /**
     * Use native Google Code Scanner for fastest scanning experience
     * This opens Google's optimized native scanner UI
     */
    const startNativeScanning = useCallback(async () => {
        // Don't attempt to scan on non-native platforms
        if (!isMobile) {
            setError('Camera scanning is only available on mobile devices');
            setIsLoading(false);
            return;
        }

        if (nativeScanInProgressRef.current) return;
        nativeScanInProgressRef.current = true;
        hasProcessedScanRef.current = false;

        setIsLoading(true);
        setError(null);
        setUsingNativeScanner(true);

        try {
            // Use scanOnce which internally uses Google Code Scanner
            const result = await barcodeScannerService.scanOnce();

            if (result && nativeScanInProgressRef.current) {
                triggerFeedback();
                onScan(result);

                if (continuous && nativeScanInProgressRef.current) {
                    // Small delay before next scan in continuous mode
                    setTimeout(() => {
                        if (nativeScanInProgressRef.current) {
                            startNativeScanning();
                        }
                    }, 300);
                } else {
                    nativeScanInProgressRef.current = false;
                    onClose();
                }
            } else if (nativeScanInProgressRef.current) {
                // User cancelled or no barcode found
                nativeScanInProgressRef.current = false;
                onClose();
            }
        } catch (err) {
            nativeScanInProgressRef.current = false;
            const errorMessage = err instanceof Error ? err.message : 'Failed to scan';

            // If native scanner fails, fall back to WebView scanner
            if (errorMessage.includes('canceled') || errorMessage.includes('cancelled')) {
                onClose();
            } else {
                console.warn('Native scanner failed, falling back to WebView scanner:', err);
                setUsingNativeScanner(false);
                await startWebViewScanning();
            }
        } finally {
            setIsLoading(false);
        }
    }, [onScan, onClose, continuous, triggerFeedback]);

    /**
     * Fallback WebView-based scanning (slower but more compatible)
     */
    const startWebViewScanning = useCallback(async () => {
        // Don't attempt to scan on non-native platforms
        if (!isMobile) {
            setError('Camera scanning is only available on mobile devices');
            setIsLoading(false);
            return;
        }

        if (scannerActiveRef.current) return;
        shouldCloseRef.current = false;
        hasProcessedScanRef.current = false;

        setIsLoading(true);
        setError(null);
        setLastScannedCode(null);
        setUsingNativeScanner(false);

        try {
            // Check and request permissions
            let hasPermission = await barcodeScannerService.checkPermissions();
            if (!hasPermission) {
                hasPermission = await barcodeScannerService.requestPermissions();
                if (!hasPermission) {
                    setError('Camera permission is required to scan barcodes');
                    return;
                }
            }

            // Make webview transparent BEFORE starting scan
            setWebviewTransparent(true);

            // Add scan listener
            barcodeScannerService.addScanListener(handleScanResult);

            // Start the scanner
            await barcodeScannerService.startScan();
            scannerActiveRef.current = true;

            setStatus((prev) => ({ ...prev, isScanning: true, hasPermission: true }));
        } catch (err) {
            // Restore webview on error
            setWebviewTransparent(false);
            const errorMessage = err instanceof Error ? err.message : 'Failed to start scanner';
            setError(errorMessage);
            onError?.(err instanceof Error ? err : new Error(errorMessage));
        } finally {
            setIsLoading(false);
        }
    }, [handleScanResult, onError]);

    // Start scanning - prefer native scanner for speed
    const startScanning = useCallback(async () => {
        if (useNativeScanner && !continuous) {
            // Use native Google Code Scanner for single scans (much faster)
            await startNativeScanning();
        } else {
            // Use WebView scanner for continuous scanning or when native is disabled
            await startWebViewScanning();
        }
    }, [useNativeScanner, continuous, startNativeScanning, startWebViewScanning]);

    // Toggle torch
    const handleToggleTorch = useCallback(async () => {
        try {
            await barcodeScannerService.toggleTorch();
            const enabled = await barcodeScannerService.isTorchEnabled();
            setTorchEnabled(enabled);
        } catch (err) {
            console.error('Error toggling torch:', err);
        }
    }, []);

    // Start scanning when opened - use native scanner immediately if enabled
    useEffect(() => {
        if (!isOpen) return;

        // For native scanner, start immediately without waiting for status check
        if (useNativeScanner && !continuous) {
            startNativeScanning();
            return;
        }

        // For WebView scanner, wait for status check
        if (status.isSupported && !scannerActiveRef.current && !nativeScanInProgressRef.current) {
            startWebViewScanning();
        }

        return () => {
            nativeScanInProgressRef.current = false;
            if (scannerActiveRef.current) {
                stopScanning();
            }
        };
    }, [isOpen, status.isSupported, useNativeScanner, continuous]);

    // Don't render anything for native scanner (it has its own UI)
    // For native scanner mode when not open, return null
    if (!isOpen) return null;

    // For native scanner, show minimal loading UI or nothing
    if (useNativeScanner && !continuous && !usingNativeScanner) {
        // Native scanner has its own UI, just show loading briefly
        if (isLoading) {
            return createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-gray-700 dark:text-gray-300">Opening scanner...</p>
                    </div>
                </div>,
                document.body
            );
        }
        return null;
    }

    // Render unsupported message for web/desktop
    if (!isMobile || !status.isSupported) {
        return createPortal(
            <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
                <div className="text-center px-6">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                        <BsUpcScan className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Camera Scanner Not Available
                    </h2>
                    <p className="text-gray-400 mb-6">
                        {isMobile
                            ? 'Camera barcode scanning is not supported on this device.'
                            : 'Camera scanning is only available on mobile devices. Use a physical barcode scanner or enter the barcode manually.'}
                    </p>
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] scanner-container">
            {/* Scanner viewfinder background - transparent so camera shows through */}
            <div className="absolute inset-0 barcode-scanner-viewfinder" />

            {/* Overlay UI - only borders and controls, center is transparent */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
                {/* Header - more compact */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-auto">
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                    >
                        <HiX className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                        <h2 className="text-white font-semibold text-sm">{title}</h2>
                        <p className="text-white/70 text-xs">{subtitle}</p>
                    </div>

                    <div className="w-8" /> {/* Spacer for alignment */}
                </div>

                {/* Scanning frame overlay - smaller and more compact */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="relative w-48 h-48 max-w-[60vw] max-h-[60vw]">
                        {/* Corner indicators - smaller */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-sky-500 rounded-tl-md" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-sky-500 rounded-tr-md" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-sky-500 rounded-bl-md" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-sky-500 rounded-br-md" />

                        {/* Scanning line animation */}
                        {status.isScanning && !isLoading && (
                            <div className="absolute inset-x-2 top-1/2 h-0.5 bg-sky-500 animate-scan-line" />
                        )}

                        {/* Loading indicator - smaller */}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {/* Error message - more compact */}
                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center p-2">
                                <div className="bg-red-500/90 backdrop-blur-sm rounded-lg p-3 text-center">
                                    <p className="text-white text-xs">{error}</p>
                                    <button
                                        onClick={startScanning}
                                        className="mt-2 px-3 py-1.5 bg-white text-red-500 rounded-md text-xs font-medium flex items-center justify-center mx-auto gap-1"
                                    >
                                        <HiRefresh className="w-3 h-3" />
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom controls - more compact */}
                <div className="p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto">
                    <div className="flex items-center justify-center gap-6">
                        {/* Spacer for layout balance */}
                        <div className="w-10" />

                        {/* Scan indicator - smaller */}
                        <div className="w-14 h-14 rounded-full border-3 border-white/30 flex items-center justify-center">
                            <div
                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${status.isScanning && !isLoading
                                    ? 'bg-sky-500'
                                    : 'bg-white/20'
                                    }`}
                            >
                                <BsUpcScan className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        {/* Torch button - smaller */}
                        {torchAvailable && (
                            <button
                                onClick={handleToggleTorch}
                                disabled={isLoading || !status.isScanning}
                                className={`p-2.5 rounded-full backdrop-blur-sm transition-colors disabled:opacity-50 ${torchEnabled
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <HiLightningBolt className="w-5 h-5" />
                            </button>
                        )}

                        {/* Placeholder if torch not available */}
                        {!torchAvailable && <div className="w-10" />}
                    </div>

                    {/* Status text - smaller */}
                    <p className="text-center text-white/60 text-xs mt-3">
                        {isLoading
                            ? 'Starting camera...'
                            : status.isScanning
                                ? continuous
                                    ? 'Scanning continuously...'
                                    : 'Ready to scan'
                                : 'Camera inactive'}
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CameraBarcodeScanner;
