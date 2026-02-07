import { Package, ArrowLeft, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../../utils';
import { useState, useEffect, useCallback, FunctionComponent, useRef } from 'react';
import { HiLightningBolt, HiRefresh } from 'react-icons/hi';
import { BsUpcScan } from 'react-icons/bs';
import { Capacitor } from '@capacitor/core';
import { useAppSelector } from '../../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import barcodeScannerService, {
    type ScannerResult,
    type ScannerStatus,
} from '../../services/barcode-scanner.service';
import { useScannerFeedback } from '../../hooks/useScannerSettings';

interface MobileCameraScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: InventoryItem[];
    onAddToCart: (item: InventoryItem) => void;
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

const MobileCameraScannerModal: FunctionComponent<MobileCameraScannerModalProps> = ({
    isOpen,
    onClose,
    inventory,
    onAddToCart,
}) => {
    const navigate = useNavigate();
    const cartItems = useAppSelector((state) => state.cart.items);
    const { triggerFeedback } = useScannerFeedback();

    // Scanner state
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
    const scannerActiveRef = useRef(false);

    // Scanned items state
    const [scannedItems, setScannedItems] = useState<InventoryItem[]>([]);

    // Check scanner status on mount
    useEffect(() => {
        const checkStatus = async () => {
            const scannerStatus = await barcodeScannerService.getStatus();
            setStatus(scannerStatus);

            if (scannerStatus.isSupported) {
                const torchAvail = await barcodeScannerService.isTorchAvailable();
                setTorchAvailable(torchAvail);
            }
        };

        if (isOpen) {
            checkStatus();
            setScannedItems([]); // Reset scanned items when modal opens
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
            setWebviewTransparent(false);
        }
    }, []);

    // Handle close
    const handleClose = useCallback(async () => {
        await stopScanning();
        setWebviewTransparent(false);
        setLastScannedCode(null);
        setError(null);
        setScannedItems([]);
        onClose();
    }, [stopScanning, onClose]);

    // Find item by barcode
    const findItemByBarcode = useCallback((barcode: string): InventoryItem | undefined => {
        return inventory.find(item => {
            const itemBarcode = item.barcode?.toString() || '';
            return itemBarcode === barcode || itemBarcode.includes(barcode) || barcode.includes(itemBarcode);
        });
    }, [inventory]);

    // Handle scan result - continuous scanning
    const handleScanResult = useCallback(
        (result: ScannerResult) => {
            // Prevent duplicate scans of the same barcode in quick succession
            if (result.barcode === lastScannedCode) {
                return;
            }

            setLastScannedCode(result.barcode);
            triggerFeedback();

            // Find item in inventory
            const item = findItemByBarcode(result.barcode);
            if (item) {
                // Add to cart
                onAddToCart(item);
                // Add to scanned items list for display
                setScannedItems(prev => {
                    // Check if already in scanned items to avoid duplicates in display
                    const exists = prev.some(i => i.productId === item.productId);
                    if (!exists) {
                        return [item, ...prev]; // Add to beginning
                    }
                    return prev;
                });
            }

            // Clear the last scanned code after a short delay to allow re-scanning same item
            setTimeout(() => {
                setLastScannedCode(null);
            }, 1500);
        },
        [lastScannedCode, triggerFeedback, findItemByBarcode, onAddToCart]
    );

    // Start WebView-based scanning (continuous)
    const startWebViewScanning = useCallback(async () => {
        if (scannerActiveRef.current) return;

        setIsLoading(true);
        setError(null);
        setLastScannedCode(null);

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
            setWebviewTransparent(false);
            const errorMessage = err instanceof Error ? err.message : 'Failed to start scanner';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [handleScanResult]);

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

    // Start scanning when opened
    useEffect(() => {
        if (!isOpen) return;

        if (status.isSupported && !scannerActiveRef.current) {
            startWebViewScanning();
        }

        return () => {
            if (scannerActiveRef.current) {
                stopScanning();
            }
        };
    }, [isOpen, status.isSupported, startWebViewScanning, stopScanning]);

    const getCartQuantity = (productId: string): number => {
        const cartItem = cartItems.find(item => item.productId === productId);
        return cartItem ? cartItem.quantity : 0;
    };

    const getTotalCartCount = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    const handleGoToCounter = () => {
        handleClose();
        navigate(ROUTES.POS);
    };

    if (!isOpen) return null;

    const isNative = Capacitor.isNativePlatform();

    // Render unsupported message for web/desktop
    if (!isNative || !status.isSupported) {
        return createPortal(
            <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[60] flex flex-col">
                <div className="bg-white dark:bg-gray-900 px-2 py-3 border-b border-gray-200 dark:border-gray-700 safe-area-top-android">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleClose}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 active:scale-95 transition-all rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                            aria-label="Close"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <span className="font-medium text-gray-700 dark:text-gray-200">Scan Products</span>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <BsUpcScan className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        Camera Scanner Not Available
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                        {isNative
                            ? 'Camera barcode scanning is not supported on this device.'
                            : 'Camera scanning is only available on mobile devices. Use a physical barcode scanner or manual item lookup.'}
                    </p>
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] scanner-container flex flex-col">
            {/* Scanner viewfinder background - transparent so camera shows through */}
            <div className="absolute inset-0 barcode-scanner-viewfinder" />

            {/* Header */}
            <div className="relative z-10 flex items-center gap-2 px-2 py-3 bg-gradient-to-b from-black/80 to-black/50">
                <button
                    onClick={handleClose}
                    className="p-1.5 text-white hover:bg-white/20 active:scale-95 transition-all rounded-full focus:outline-none"
                    aria-label="Close"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-medium text-white">Scan Products</span>
            </div>

            {/* Scanner Frame Area */}
            <div className="relative z-10 flex items-center justify-center py-6">
                <div className="relative w-52 h-52 max-w-[65vw] max-h-[65vw]">
                    {/* Corner indicators */}
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-sky-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-sky-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-sky-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-sky-500 rounded-br-lg" />

                    {/* Scanning line animation */}
                    {status.isScanning && !isLoading && (
                        <div className="absolute inset-x-2 top-1/2 h-0.5 bg-sky-500 animate-scan-line" />
                    )}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                            <div className="bg-red-500/90 backdrop-blur-sm rounded-lg p-3 text-center">
                                <p className="text-white text-xs">{error}</p>
                                <button
                                    onClick={startWebViewScanning}
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

            {/* Scanner Controls */}
            <div className="relative z-10 flex items-center justify-center gap-6 py-3 bg-gradient-to-b from-black/50 to-black/30">
                {/* Scan status indicator */}
                <div className="flex items-center gap-2">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${status.isScanning && !isLoading
                            ? 'bg-sky-500'
                            : 'bg-white/20'
                            }`}
                    >
                        <BsUpcScan className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/80 text-sm">
                        {isLoading
                            ? 'Starting...'
                            : status.isScanning
                                ? 'Scanning'
                                : 'Inactive'}
                    </span>
                </div>

                {/* Torch button */}
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
            </div>

            {/* Scanned Items List */}
            <div className="relative z-10 flex-1 bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                        Scanned Items {scannedItems.length > 0 && `(${scannedItems.length})`}
                    </h3>
                </div>

                <div className={`flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800 ${getTotalCartCount() > 0 ? 'pb-20' : ''}`}>
                    {scannedItems.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {scannedItems.map((item) => {
                                const quantity = parseFloat((item.quantity || 0).toString());
                                const itemCartQuantity = getCartQuantity(item.productId);
                                const isSelected = itemCartQuantity > 0;

                                return (
                                    <div
                                        key={item.productId}
                                        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${isSelected
                                            ? 'bg-sky-50 dark:bg-sky-900/30'
                                            : 'bg-white dark:bg-gray-900'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected
                                            ? 'bg-sky-500 text-white'
                                            : 'border-2 border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {isSelected && (
                                                itemCartQuantity > 1
                                                    ? <span className="text-xs font-bold">{itemCartQuantity}</span>
                                                    : <Check className="w-4 h-4" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {item.name}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                    {item.barcode}
                                                </span>
                                                {item.categoryDetails?.name && (
                                                    <>
                                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {item.categoryDetails.name}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <div className="font-bold text-sky-500 dark:text-sky-400">
                                                {formatCurrency(parseFloat((item.sellPrice || 0).toString()))}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {quantity} in stock
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 px-4">
                            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                            <h3 className="text-base font-medium text-gray-600 dark:text-gray-300 mb-1">
                                No items scanned yet
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                                Point your camera at a product barcode to scan it
                            </p>
                        </div>
                    )}
                </div>

                {/* Go to Counter Button */}
                {getTotalCartCount() > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleGoToCounter}
                            className="w-full py-3 uppercase bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>Go To Counter ({getTotalCartCount()} Items)</span>
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default MobileCameraScannerModal;
