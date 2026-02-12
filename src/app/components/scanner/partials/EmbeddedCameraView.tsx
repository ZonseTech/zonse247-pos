import { FunctionComponent, useEffect, useRef, useState, useCallback } from 'react';
import { BsUpcScan } from 'react-icons/bs';
import { HiRefresh } from 'react-icons/hi';
import { Scan, Zap } from 'lucide-react';
import barcodeScannerService, { type ScannerResult } from '../../../services/barcode-scanner.service';

interface EmbeddedCameraViewProps {
    isScanning: boolean;
    onScanSuccess: (barcode: string) => void;
    onScanError?: (error: string) => void;
    onStartScanning: () => void;
    onStopScanning: () => void;
}

const EmbeddedCameraView: FunctionComponent<EmbeddedCameraViewProps> = ({
    isScanning,
    onScanSuccess,
    onScanError,
    onStartScanning,
    onStopScanning,
}) => {
    const scannerActiveRef = useRef(false);
    const mountedRef = useRef(true);
    const initializingRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState<boolean | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [isBoosterActive, setIsBoosterActive] = useState(false);

    const onScanSuccessRef = useRef(onScanSuccess);
    const onScanErrorRef = useRef(onScanError);
    const onStartScanningRef = useRef(onStartScanning);
    const onStopScanningRef = useRef(onStopScanning);

    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
        onScanErrorRef.current = onScanError;
        onStartScanningRef.current = onStartScanning;
        onStopScanningRef.current = onStopScanning;
    }, [onScanSuccess, onScanError, onStartScanning, onStopScanning]);

    useEffect(() => {
        const checkSupport = async () => {
            try {
                const status = await barcodeScannerService.getStatus();
                if (mountedRef.current) {
                    setIsSupported(status.isSupported);
                }
            } catch {
                if (mountedRef.current) {
                    setIsSupported(false);
                }
            }
        };
        checkSupport();
    }, []);

    const handleScanResult = useCallback((result: ScannerResult) => {
        onScanSuccessRef.current(result.barcode);
    }, []);

    const startScanner = useCallback(async () => {
        if (scannerActiveRef.current || initializingRef.current) return;

        initializingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            let hasPermission = await barcodeScannerService.checkPermissions();
            if (!hasPermission) {
                hasPermission = await barcodeScannerService.requestPermissions();
                if (!hasPermission) {
                    if (mountedRef.current) {
                        setError('Camera permission is required to scan barcodes');
                        setIsLoading(false);
                    }
                    initializingRef.current = false;
                    return;
                }
            }

            barcodeScannerService.addScanListener(handleScanResult);

            // Add scanner-active class for WebView transparency
            document.body.classList.add('scanner-active');

            // Use embedded camera behind WebView
            await barcodeScannerService.startScan();
            scannerActiveRef.current = true;

            if (mountedRef.current) {
                setCameraActive(true);
                onStartScanningRef.current();
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
            document.body.classList.remove('scanner-active');
            if (mountedRef.current) {
                setError(errorMessage);
                onScanErrorRef.current?.(errorMessage);
            }
            scannerActiveRef.current = false;
        } finally {
            initializingRef.current = false;
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [handleScanResult]);

    const stopScanner = useCallback(async () => {
        if (scannerActiveRef.current) {
            try {
                await barcodeScannerService.stopScan();
            } catch (err) {
                console.warn('Error stopping scanner:', err);
            }

            document.body.classList.remove('scanner-active');
            scannerActiveRef.current = false;

            if (mountedRef.current) {
                setCameraActive(false);
                onStopScanningRef.current();
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;

        if (isSupported === true && !scannerActiveRef.current && !initializingRef.current) {
            startScanner();
        }

        return () => {
            mountedRef.current = false;
            document.body.classList.remove('scanner-active');
            stopScanner();
        };
    }, [isSupported, startScanner, stopScanner]);

    const handleRetry = useCallback(() => {
        setError(null);
        startScanner();
    }, [startScanner]);

    // Booster: Open Google's native full-screen scanner for quick scan
    const openBoosterScanner = useCallback(async () => {
        if (isBoosterActive) return;

        setIsBoosterActive(true);

        try {
            // Temporarily stop embedded scanner
            if (scannerActiveRef.current) {
                await barcodeScannerService.stopScan();
                document.body.classList.remove('scanner-active');
            }

            // Open Google's native scanner
            const result = await barcodeScannerService.scanOnce();

            if (result && mountedRef.current) {
                onScanSuccessRef.current(result.barcode);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '';
            // Ignore cancel errors
            if (!errorMessage.toLowerCase().includes('cancel')) {
                console.error('Booster scan error:', err);
            }
        } finally {
            setIsBoosterActive(false);
            // Restart embedded scanner
            if (mountedRef.current && isSupported) {
                scannerActiveRef.current = false;
                initializingRef.current = false;
                startScanner();
            }
        }
    }, [isBoosterActive, isSupported, startScanner]);

    if (isSupported === false) {
        return (
            <div className="relative aspect-[4/3] bg-white dark:bg-gray-800 rounded-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="w-20 h-20 mb-4 rounded-sm bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 flex items-center justify-center">
                        <BsUpcScan className="w-10 h-10 text-sky-500" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">
                        Camera Scanner Not Available
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm max-w-xs">
                        Camera scanning is only available on mobile devices. Use a physical barcode scanner or manual item lookup.
                    </p>
                </div>
            </div>
        );
    }

    if (isSupported === null) {
        return (
            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-gray-200" style={{ background: 'transparent' }}>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 right-0 h-[20%] bg-black/50" />
                    <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-black/50" />
                    <div className="absolute top-[20%] bottom-[20%] left-0 w-[10%] bg-black/50" />
                    <div className="absolute top-[20%] bottom-[20%] right-0 w-[10%] bg-black/50" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-[80%] h-[60%] bg-transparent">
                        <div className="absolute inset-0 border-2 border-white/30 rounded-sm" />
                        <div className="absolute top-0 left-0 w-8 h-8">
                            <div className="absolute top-0 left-0 w-full h-1 bg-sky-500" />
                            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
                        </div>
                        <div className="absolute top-0 right-0 w-8 h-8">
                            <div className="absolute top-0 right-0 w-full h-1 bg-sky-500" />
                            <div className="absolute top-0 right-0 w-1 h-full bg-sky-500" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-8 h-8">
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500" />
                            <div className="absolute bottom-0 left-0 w-1 h-full bg-sky-500" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-8 h-8">
                            <div className="absolute bottom-0 right-0 w-full h-1 bg-sky-500" />
                            <div className="absolute bottom-0 right-0 w-1 h-full bg-sky-500" />
                        </div>

                        {isScanning && !isLoading && (
                            <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
                                <div className="scan-line w-full h-full bg-sky-500" />
                            </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center">
                            <Scan className="w-12 h-12 text-sky-500/30" />
                        </div>
                    </div>
                </div>

                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${cameraActive && !isLoading ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                    <span className="text-xs font-medium text-white">
                        {isLoading ? 'Starting...' : cameraActive ? 'Scanning' : 'Ready'}
                    </span>
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                    <p className="text-xs text-white/80 bg-black/50 px-3 py-1 rounded-full">
                        Position barcode in frame
                    </p>
                </div>

                {/* Booster Button */}
                <button
                    onClick={openBoosterScanner}
                    disabled={isBoosterActive || isLoading}
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white text-xs font-medium rounded-full transition-colors shadow-lg"
                >
                    <Zap className={`w-3.5 h-3.5 ${isBoosterActive ? 'animate-pulse' : ''}`} />
                    {isBoosterActive ? 'Scanning...' : 'Boost'}
                </button>
            </div>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-sm p-4 text-center max-w-xs">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <BsUpcScan className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-gray-800 dark:text-gray-100 text-sm mb-3">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 bg-sky-500 text-white rounded-sm text-sm font-medium flex items-center justify-center mx-auto gap-2 hover:bg-sky-600 transition-colors"
                        >
                            <HiRefresh className="w-4 h-4" />
                            Retry
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmbeddedCameraView;
