import { useInventory } from '../../../hooks/useInventory';
import { FunctionComponent, useState, useEffect, Fragment, useRef } from 'react';
import { Confirm } from 'notiflix';
import { createPortal } from 'react-dom';
import { useFocusManager } from '../../../hooks/useFocusManager';
import { useScannerSettings, useScannerFeedback } from '../../../hooks/useScannerSettings';
import inventoryService from '../../../services/inventory.service';

interface BarcodeScannerProps {
    externalInput?: string;
    onExternalInputProcessed?: () => void;
    focusManager: ReturnType<typeof useFocusManager>;
    barcodeScannerInputRef: React.RefObject<HTMLInputElement | null>;
}

const BarcodeScanner: FunctionComponent<BarcodeScannerProps> = ({
    externalInput = '',
    onExternalInputProcessed,
    focusManager,
    barcodeScannerInputRef
}) => {
    const [barcode, setBarcode] = useState('');
    const { inventory, addToCart } = useInventory();
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
     * Search for item by barcode using API if not found locally
     */
    const searchByBarcodeAPI = async (barcodeValue: string): Promise<InventoryItem | null> => {
        try {
            setIsSearching(true);
            const item = await inventoryService.findByBarcode(barcodeValue);
            return item;
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
            const exactMatch = inventory.find(p => p.barcode.toString() === cleanedCode);
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

        let item = inventory.find(p => p.barcode.toString() === cleanedBarcode);

        if (!item) {
            item = await searchByBarcodeAPI(cleanedBarcode);
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
        if (barcode.trim() === '') {
            setFilteredItems(inventory);
        } else {
            const cleanedInput = cleanBarcode(barcode);
            const filtered = inventory.filter(item =>
                item.barcode.toString().includes(cleanedInput) ||
                item.name.toLowerCase().includes(cleanedInput.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    }, [barcode, inventory]);

    useEffect(() => {
        if (isActive && barcodeScannerInputRef.current) {
            barcodeScannerInputRef.current.focus();
        }
    }, [isActive]);

    useEffect(() => {
        if (barcodeScannerInputRef) barcodeScannerInputRef.current.focus()
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
            <div className="flex w-full">
                <input
                    ref={barcodeScannerInputRef}
                    type="text"
                    value={barcode}
                    onChange={handleInputChange}
                    className={`w-full p-2 border-2 border-gray-800 focus:outline-none text-lg text-center transition-all duration-200 ${isActive ? 'ring-2 ring-gray-500 dark:ring-gray-400 bg-gray-50 dark:bg-gray-900/20' : ''
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
                    placeholder="Scan or enter barcode..."
                />
            </div>

            {barcode.trim() !== '' && filteredItems.length > 0 &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className="border border-gray-200 dark:border-gray-700 rounded-none max-h-60 overflow-y-auto bg-white dark:bg-gray-900 shadow-sm dark:shadow-lg"
                        data-dropdown="true"
                    >
                        {filteredItems.map(item => (
                            <div
                                key={item.productId}
                                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                                onClick={() => {
                                    triggerFeedback();
                                    addToCart(item);
                                    setBarcode('');
                                    if (barcodeScannerInputRef.current) {
                                        barcodeScannerInputRef.current.focus();
                                    }
                                }}
                            >
                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate pr-4">
                                    {item.name}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 font-mono text-sm flex-shrink-0">
                                    {item.barcode}
                                </span>
                            </div>
                        ))}
                    </div>,
                    document.body
                )
            }
        </Fragment>
    );
};

export default BarcodeScanner;