import { createPortal } from 'react-dom';
import { useState, useCallback, FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useScannerFeedback } from '../../hooks/useScannerSettings';
import {
    ScannerHeader,
    ScannerControls,
    EmbeddedCameraView,
    ScannedItemsList,
    GoToCounterButton,
} from './partials';

type ScanMode = 'camera' | 'barcode';

interface MobileCameraScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: InventoryItem[];
    cart: CartItem[];
    onAddToCart: (item: InventoryItem) => void;
    onOpenItemLookup?: () => void;
}

const scannerStyles = `
    @keyframes scanline {
        0% { transform: translateY(0); }
        100% { transform: translateY(4000%); }
    }
    
    .scan-line { animation: scanline 2s linear infinite; }
    
    @keyframes slideInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .item-enter { animation: slideInUp 0.4s ease-out; }
`;

const MobileCameraScannerModal: FunctionComponent<MobileCameraScannerModalProps> = ({
    isOpen,
    onClose,
    inventory,
    cart,
    onAddToCart,
    onOpenItemLookup,
}) => {
    const navigate = useNavigate();
    const { triggerFeedback } = useScannerFeedback();
    const [isScanning, setIsScanning] = useState(false);
    const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
    const [activeMode, setActiveMode] = useState<ScanMode>('camera');

    const handleClose = useCallback(() => {
        setLastScannedCode(null);
        setIsScanning(false);
        onClose();
    }, [onClose]);

    const handleSearch = useCallback(() => {
        handleClose();
        onOpenItemLookup?.();
    }, [handleClose, onOpenItemLookup]);

    const findItemByBarcode = useCallback((barcode: string): InventoryItem | undefined => {
        return inventory.find(item => {
            // Check stock availability first - don't return out-of-stock items
            const quantity = parseFloat((item.quantity || item.availableQuantity || 0).toString());
            if (quantity <= 0) {
                return false;
            }
            const itemBarcode = item.barcode?.toString() || '';
            const primaryBarcode = item.primaryBarcode?.toString() || '';
            const sku = item.sku?.toString() || '';
            return itemBarcode === barcode ||
                primaryBarcode === barcode ||
                sku === barcode ||
                itemBarcode.includes(barcode) ||
                primaryBarcode.includes(barcode) ||
                barcode.includes(itemBarcode) ||
                barcode.includes(primaryBarcode);
        });
    }, [inventory]);

    const handleScanSuccess = useCallback(
        (barcode: string) => {
            if (barcode === lastScannedCode) {
                return;
            }

            setLastScannedCode(barcode);
            triggerFeedback();

            const item = findItemByBarcode(barcode);
            if (item) {
                onAddToCart(item);
            }

            setTimeout(() => {
                setLastScannedCode(null);
            }, 1500);
        },
        [lastScannedCode, triggerFeedback, findItemByBarcode, onAddToCart]
    );

    const handleScanError = useCallback((error: string) => {
        console.error('Scan error:', error);
    }, []);

    const handleToggleTorch = useCallback(() => {
        console.log('Torch toggle not supported with embedded camera');
    }, []);

    const handleRotateCamera = useCallback(() => {
        console.log('Camera rotation not yet implemented');
    }, []);

    const getCartQuantity = (variantId: string): number => {
        const cartItem = cart.find(item => item.variantId === variantId);
        return cartItem ? cartItem.quantity : 0;
    };

    const getTotalCartCount = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    const getCartInventoryItems = (): InventoryItem[] => {
        return cart
            .map(cartItem => inventory.find(inv => inv.id === cartItem.variantId))
            .filter((item): item is InventoryItem => item !== undefined)
            .reverse();
    };

    const handleGoToCounter = () => {
        handleClose();
        navigate(ROUTES.POS);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="scanner-modal-container fixed inset-0 z-[9999] min-h-screen text-gray-900 dark:text-gray-100 flex flex-col" style={{ background: 'transparent' }}>
            <style>{scannerStyles}</style>

            <ScannerHeader onClose={handleClose} onSearch={handleSearch} />

            <div className="relative z-10 flex-1 overflow-y-auto" style={{ background: 'transparent' }}>
                <div className="p-4 bg-white dark:bg-gray-900">
                    <ScannerControls
                        activeMode={activeMode}
                        onModeChange={setActiveMode}
                        torchAvailable={false}
                        torchEnabled={false}
                        onToggleTorch={handleToggleTorch}
                        onRotateCamera={handleRotateCamera}
                        isLoading={false}
                        isScanning={isScanning}
                    />
                </div>

                <div className="flex items-stretch">
                    <div className="w-4 bg-white dark:bg-gray-900" />
                    <div className="flex-1">
                        <EmbeddedCameraView
                            isScanning={isScanning}
                            onScanSuccess={handleScanSuccess}
                            onScanError={handleScanError}
                            onStartScanning={() => setIsScanning(true)}
                            onStopScanning={() => setIsScanning(false)}
                        />
                    </div>
                    <div className="w-4 bg-white dark:bg-gray-900" />
                </div>

                <div className="bg-white dark:bg-gray-900 flex-1">
                    <ScannedItemsList
                        items={getCartInventoryItems()}
                        getCartQuantity={getCartQuantity}
                    />
                </div>

                <div className="flex-1 min-h-max bg-white dark:bg-gray-900" />
            </div>

            {cart.length > 0 && <GoToCounterButton
                totalCount={getTotalCartCount()}
                onClick={handleGoToCounter}
            />}
        </div>,
        document.body
    );
};

export default MobileCameraScannerModal;
