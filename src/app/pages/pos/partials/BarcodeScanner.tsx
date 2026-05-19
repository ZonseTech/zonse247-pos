import { useInventory } from '../../../hooks/useInventory';
import { FunctionComponent, useState, useEffect, Fragment, useRef } from 'react';
import { Notify, Confirm } from 'notiflix';
import { createPortal } from 'react-dom';
import { useFocusManager } from '../../../hooks/useFocusManager';
import { useScannerSettings, useScannerFeedback } from '../../../hooks/useScannerSettings';
import productService from '../../../services/product.service';
import { mapProductToInventoryItem } from '../../../utils/product-mapper';
import { useAuth } from '../../../context/AuthProvider';

interface BarcodeScannerProps {
    externalInput?: string;
    onExternalInputProcessed?: () => void;
    focusManager: ReturnType<typeof useFocusManager>;
    barcodeScannerInputRef: React.RefObject<HTMLInputElement | null>;
    compact?: boolean;
}

const BarcodeScanner: FunctionComponent<BarcodeScannerProps> = ({
    externalInput = '',
    onExternalInputProcessed,
    focusManager,
    barcodeScannerInputRef,
    compact = false,
}) => {
    const [barcode, setBarcode] = useState('');
    const { inventory, addToCart } = useInventory();
    const { user } = useAuth();
    const scannerSettings = useScannerSettings();
    const { triggerFeedback } = useScannerFeedback();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [filteredItems, setFilteredItems] = useState(inventory);
    const [isSearching, setIsSearching] = useState(false);

    const barcodeBuffer = useRef('');
    const barcodeTimeout = useRef<NodeJS.Timeout | null>(null);
    const BARCODE_TIMEOUT = 50;
    const MIN_BARCODE_LENGTH = 6;

    const isActive = focusManager.isActive('barcode');

    const cleanBarcode = (code: string): string => {
        let cleaned = code.replace(/[$']$/, '').trim();
        if (scannerSettings.prefix && cleaned.startsWith(scannerSettings.prefix)) {
            cleaned = cleaned.substring(scannerSettings.prefix.length);
        }
        return cleaned;
    };


    /**
     * Search for item by barcode/SKU/name using Products API
     * GET /products/search/:term
     */
    const searchByBarcodeAPI = async (barcodeValue: string): Promise<InventoryItem | null> => {
        try {
            setIsSearching(true);
            const tenantId = user?.tenantId || '-1';
            const branchId = user?.branchId || '';

            const result = await productService.searchProduct(barcodeValue, tenantId, branchId);

            if (result?.product) {
                // Map ProductWithInventory to InventoryItem for cart compatibility
                return mapProductToInventoryItem(result.product);
            }
            return null;
        } catch (error) {
            console.error('Error searching by barcode:', error);
            return null;
        } finally {
            setIsSearching(false);
        }
    };

    const checkImmediateMatch = (code: string): boolean => {
        if (!scannerSettings.enabled && scannerSettings.scanMode === 'AUTO') {
            return false;
        }

        const cleanedCode = cleanBarcode(code);
        if (cleanedCode.length >= MIN_BARCODE_LENGTH) {
            // Search by barcode, primaryBarcode, or sku
            const exactMatch = inventory.find(p => {
                const barcodeMatch = (p.barcode?.toString() === cleanedCode) ||
                    (p.primaryBarcode?.toString() === cleanedCode) ||
                    (p.sku?.toString() === cleanedCode);
                const quantityOk = parseFloat((p.quantity || p.availableQuantity || 0).toString()) > 0;
                const statusOk = !p.status || p.status.toLowerCase() === 'active';
                return barcodeMatch && quantityOk && statusOk;
            });
            if (exactMatch) {
                triggerFeedback();
                addToCart(exactMatch);
                setBarcode('');
                barcodeBuffer.current = '';

                if (barcodeScannerInputRef.current) {
                    barcodeScannerInputRef.current.focus();
                }
                return true;
            }
        }
        return false;
    };

    useEffect(() => {
        if (externalInput !== '' && isActive) {
            if (externalInput === 'Del') {
                setBarcode(prev => prev.slice(0, -1));
            } else if (externalInput === 'OK') {
                handleBarcodeEntry(cleanBarcode(barcode));
            } else if (externalInput === '•') {
                setBarcode(prev => prev + '.');
            } else {
                setBarcode(prev => {
                    const newBarcode = prev + externalInput;
                    setTimeout(() => checkImmediateMatch(newBarcode), 0);
                    return newBarcode;
                });
            }

            if (onExternalInputProcessed) {
                onExternalInputProcessed();
            }
        }
    }, [externalInput, isActive]);

    const handleBarcodeEntry = async (scannedBarcode: string) => {
        const cleanedBarcode = cleanBarcode(scannedBarcode);
        if (cleanedBarcode === '') return;

        // Search locally first - check barcode, primaryBarcode, and sku
        let item = inventory.find(p => {
            const barcodeMatch = (p.barcode?.toString() === cleanedBarcode) ||
                (p.primaryBarcode?.toString() === cleanedBarcode) ||
                (p.sku?.toString() === cleanedBarcode);
            const quantityOk = parseFloat((p.quantity || p.availableQuantity || 0).toString()) > 0;
            const statusOk = !p.status || p.status.toLowerCase() === 'active';
            return barcodeMatch && quantityOk && statusOk;
        });

        if (!item) {
            item = await searchByBarcodeAPI(cleanedBarcode) ?? undefined;
            // Block items with zero/negative stock or marked as out of stock
            if (item) {
                const quantity = parseFloat((item.quantity || item.availableQuantity || 0).toString());
                const isOutOfStock = item.status && item.status.toUpperCase() === 'OUT_OF_STOCK';
                const isInactive = item.status && item.status.toLowerCase() !== 'active';
                if (quantity <= 0 || isOutOfStock || isInactive) {
                    Notify.failure(`${item.name || item.displayName} is out of stock or inactive.`);
                    return;
                }
            }
        }

        if (item) {
            triggerFeedback();
            addToCart(item);
            setBarcode('');

            if (barcodeScannerInputRef.current) {
                barcodeScannerInputRef.current.focus();
            }
        } else {
            Confirm.show(
                'Product not found',
                `No product found with barcode: ${cleanedBarcode}`,
                'OK'
            );
        }
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isActive) return;
            if (!scannerSettings.enabled || scannerSettings.scanMode === 'MANUAL') {
                return;
            }

            if (e.key === 'Enter') {
                if (barcodeTimeout.current) {
                    clearTimeout(barcodeTimeout.current);
                }

                const finalBarcode = barcodeBuffer.current || barcode;
                if (finalBarcode) {
                    handleBarcodeEntry(finalBarcode);
                }

                barcodeBuffer.current = '';
                setBarcode('');
                return;
            }

            if (e.key.length === 1) {
                if (barcodeTimeout.current) {
                    clearTimeout(barcodeTimeout.current);
                }

                barcodeBuffer.current += e.key;

                const currentBuffer = barcodeBuffer.current;
                if (checkImmediateMatch(currentBuffer)) {
                    return;
                }

                barcodeTimeout.current = setTimeout(() => {
                    if (barcodeBuffer.current.length > 0) {
                        setBarcode(barcodeBuffer.current);

                        if (barcodeBuffer.current.length >= MIN_BARCODE_LENGTH) {
                            handleBarcodeEntry(barcodeBuffer.current);
                            barcodeBuffer.current = '';
                        }
                    }
                }, BARCODE_TIMEOUT);
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            if (barcodeTimeout.current) {
                clearTimeout(barcodeTimeout.current);
            }
        };
    }, [barcode, isActive]);

    useEffect(() => {
        // Frontend filtering is intentional for POS performance
        // Real-time barcode scanning requires instant filtering without API delays
        // Only show available products (quantity > 0 and active status)
        const availableInventory = inventory.filter(item => {
            const quantity = parseFloat((item.quantity || item.availableQuantity || 0).toString());
            const statusOk = !item.status || item.status.toLowerCase() === 'active';
            return quantity > 0 && statusOk;
        });

        if (barcode.trim() === '') {
            setFilteredItems(availableInventory);
        } else {
            const cleanedInput = cleanBarcode(barcode);
            const filtered = availableInventory.filter(item => {
                const barcodeMatch = (item.barcode?.toString() || '').includes(cleanedInput) ||
                    (item.primaryBarcode?.toString() || '').includes(cleanedInput) ||
                    (item.sku?.toString() || '').includes(cleanedInput);
                const nameMatch = (item.name || item.displayName || '').toLowerCase().includes(cleanedInput.toLowerCase());
                return barcodeMatch || nameMatch;
            });
            setFilteredItems(filtered);
        }
    }, [barcode, inventory]);

    useEffect(() => {
        if (isActive && barcodeScannerInputRef.current) {
            barcodeScannerInputRef.current.focus();
        }
    }, [isActive]);

    useEffect(() => {
        if (barcodeScannerInputRef?.current) barcodeScannerInputRef.current.focus()
    }, [])

    useEffect(() => {
        if (barcode.trim() !== '' && filteredItems.length > 0 && barcodeScannerInputRef.current && dropdownRef.current) {
            const inputRect = barcodeScannerInputRef.current.getBoundingClientRect();
            const dropdown = dropdownRef.current;

            const top = inputRect.bottom + window.scrollY;
            const left = inputRect.left + window.scrollX;

            Object.assign(dropdown.style, {
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                width: `${inputRect.width}px`,
                zIndex: '9999',
            });
        }
    }, [barcode, filteredItems]);

    const handleManualEntry = () => {
        handleBarcodeEntry(barcode);
    };

    const handleInputFocus = () => {
        focusManager.setActiveComponent('barcode');
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            if (document.activeElement !== barcodeScannerInputRef.current) {
                focusManager.clearFocus();
            }
        }, 100);
    };

    const handleInputClick = () => {
        focusManager.setActiveComponent('barcode');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const cleanedValue = cleanBarcode(value);
        setBarcode(cleanedValue);

        barcodeBuffer.current = '';
        if (barcodeTimeout.current) {
            clearTimeout(barcodeTimeout.current);
        }

        checkImmediateMatch(cleanedValue);
    };

    return (
        <Fragment>
            <div className="flex w-full gap-2">
                <input
                    ref={barcodeScannerInputRef}
                    type="text"
                    value={barcode}
                    onChange={handleInputChange}
                    autoFocus
                    className={`flex-1 border-2 border-gray-800 dark:border-gray-600 focus:outline-none text-center text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 transition-all duration-200 ${compact ? 'p-1 text-xs' : 'p-2 text-lg'} ${isActive ? 'ring-2 ring-gray-500 dark:ring-gray-400 bg-gray-50 dark:bg-gray-700' : ''
                        }`}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleManualEntry();
                        }
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onClick={handleInputClick}
                    placeholder={compact ? "Scan barcode..." : "Scan or enter barcode..."}
                />
            </div>

            {barcode.trim() !== '' && filteredItems.length > 0 &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className={`border border-gray-200 dark:border-gray-700 rounded-none overflow-y-auto bg-white dark:bg-gray-900 shadow-sm dark:shadow-lg ${compact ? 'max-h-40' : 'max-h-60'}`}
                        data-dropdown="true"
                    >
                        {filteredItems.map(item => {
                            const displayItemName = item.displayName || item.name;
                            const displayBarcode = item.barcode || item.primaryBarcode || item.sku || '-';
                            return (
                                <div
                                    key={item.id}
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${compact ? 'p-2' : 'p-3'}`}
                                    onClick={() => {
                                        triggerFeedback();
                                        addToCart(item);
                                        setBarcode('');
                                        if (barcodeScannerInputRef.current) {
                                            barcodeScannerInputRef.current.focus();
                                        }
                                    }}
                                >
                                    <span className={`font-medium text-gray-900 dark:text-gray-100 truncate pr-4 ${compact ? 'text-xs' : ''}`}>
                                        {displayItemName}
                                    </span>
                                    <span className={`text-gray-500 dark:text-gray-400 font-mono flex-shrink-0 ${compact ? 'text-[10px]' : 'text-sm'}`}>
                                        {displayBarcode}
                                    </span>
                                </div>
                            );
                        })}
                    </div>,
                    document.body
                )
            }
        </Fragment>
    );
};

export default BarcodeScanner;