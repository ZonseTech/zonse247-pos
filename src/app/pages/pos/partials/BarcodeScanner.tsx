import { useInventory } from '../../../hooks/useInventory';
import { FunctionComponent, useState, useEffect, Fragment, useRef } from 'react';
import { Confirm } from 'notiflix';
import { createPortal } from 'react-dom';
import { useFocusManager } from '../../../hooks/useFocusManager';
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
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [filteredItems, setFilteredItems] = useState(inventory);
    const [isSearching, setIsSearching] = useState(false);

    const barcodeBuffer = useRef('');
    const barcodeTimeout = useRef<NodeJS.Timeout | null>(null);
    const BARCODE_TIMEOUT = 50;
    const MIN_BARCODE_LENGTH = 6;

    const isActive = focusManager.isActive('barcode');

    const cleanBarcode = (code: string): string => {
        return code.replace(/[$']$/, '').trim();
    };

    const showSuccessFeedback = (productName: string) => {
        const successElement = document.createElement('div');
        successElement.textContent = `✓ Added: ${productName}`;
        successElement.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-[10000] transition-all duration-300 transform';
        successElement.style.animation = 'slideInRight 0.3s ease-out';

        document.body.appendChild(successElement);

        setTimeout(() => {
            successElement.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(successElement)) {
                    document.body.removeChild(successElement);
                }
            }, 300);
        }, 2000);
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
        const cleanedCode = cleanBarcode(code);
        if (cleanedCode.length >= MIN_BARCODE_LENGTH) {
            const exactMatch = inventory.find(p => p.barcode.toString() === cleanedCode);
            if (exactMatch) {
                addToCart(exactMatch);
                showSuccessFeedback(exactMatch.name);
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

        // First check local inventory
        let item = inventory.find(p => p.barcode.toString() === cleanedBarcode);

        // If not found locally, try API lookup
        if (!item) {
            item = await searchByBarcodeAPI(cleanedBarcode);
        }

        if (item) {
            addToCart(item);
            setBarcode('');
            showSuccessFeedback(item.name);

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

    // Separate useEffect for filtering to avoid infinite loop
    useEffect(() => {
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
                                    addToCart(item);
                                    showSuccessFeedback(item.name);
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