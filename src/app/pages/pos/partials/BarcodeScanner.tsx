import { Input } from '../../../components';
import { useProducts } from '../../../context/ProductsProvider';
import { FunctionComponent, useState, useEffect, Fragment, useRef } from 'react';
import { Confirm } from 'notiflix';
import { createPortal } from 'react-dom';
import { useFocusManager } from '../../../hooks/useFocusManager';

interface BarcodeScannerProps {
    externalInput?: string;
    onExternalInputProcessed?: () => void;
    focusManager: ReturnType<typeof useFocusManager>;
}

const BarcodeScanner: FunctionComponent<BarcodeScannerProps> = ({
    externalInput = '',
    onExternalInputProcessed,
    focusManager
}) => {
    const [barcode, setBarcode] = useState('');
    const { products, addToCart } = useProducts();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [filteredProduct, setFilteredProduct] = useState(products);

    const isActive = focusManager.isActive('barcode');

    useEffect(() => {
        if (externalInput !== '' && isActive) {
            if (externalInput === 'Del') {
                setBarcode(prev => prev.slice(0, -1));
            } else if (externalInput === 'OK') {
                handleManualEntry();
            } else if (externalInput === '•') {
                setBarcode(prev => prev + '.');
            } else {
                setBarcode(prev => prev + externalInput);
            }

            if (onExternalInputProcessed) {
                onExternalInputProcessed();
            }
        }
    }, [externalInput, isActive]);

    useEffect(() => {
        const handleBarcodeScanner = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && barcode.trim() !== '') {
                const product = products.find(p => p.barcode.toString() === barcode.trim());
                if (product) {
                    addToCart(product);
                    setBarcode('');
                }
            }
        };

        document.addEventListener('keydown', handleBarcodeScanner);

        if (barcode.trim() === '') {
            setFilteredProduct(products);
        } else {
            const filtered = products.filter(product =>
                product.barcode.toString().includes(barcode) ||
                product.name.toLowerCase().includes(barcode.toLowerCase())
            );
            setFilteredProduct(filtered);
        }

        return () => {
            document.removeEventListener('keydown', handleBarcodeScanner);
        };
    }, [barcode, products, addToCart]);

    useEffect(() => {
        // Auto-focus when scanner becomes active
        if (isActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isActive]);

    useEffect(() => {
        if (barcode.trim() !== '' && filteredProduct.length > 0 && inputRef.current && dropdownRef.current) {
            const inputRect = inputRef.current.getBoundingClientRect();
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
    }, [barcode, filteredProduct]);

    const handleManualEntry = () => {
        const product = products.find(p => p.barcode.toString() === barcode.trim());
        if (product) {
            addToCart(product);
            setBarcode('');
        } else {
            if (barcode.trim() !== '') {
                Confirm.show('Product not found', 'Product not found. Please check the barcode.', 'Ok');
            }
        }
    };

    const handleInputFocus = () => {
        // Set barcode scanner as active when focused
        focusManager.setActiveComponent('barcode');
    };

    const handleInputBlur = () => {
        // Clear focus when input loses focus (with a small delay to allow for dropdown interactions)
        setTimeout(() => {
            if (document.activeElement !== inputRef.current) {
                focusManager.clearFocus();
            }
        }, 100);
    };

    const handleInputClick = () => {
        // Also set active on click
        focusManager.setActiveComponent('barcode');
    };

    return (
        <Fragment>
            <div className="flex w-full">
                <Input
                    ref={inputRef}
                    type="text"
                    value={barcode}
                    onChange={(e) => {
                        const value = e.target.value;
                        const cleanedValue = value.endsWith("'") ? value.slice(0, -1) : value;
                        setBarcode(cleanedValue);
                    }}
                    className={`w-full p-2 border-2 border-gray-800 focus:outline-none text-lg text-center transition-all duration-200 ${isActive ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleManualEntry();
                        }
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onClick={handleInputClick}
                />
            </div>

            {barcode.trim() !== '' && filteredProduct.length > 0 &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className="border border-gray-200 dark:border-gray-700 rounded-none max-h-60 overflow-y-auto bg-white dark:bg-gray-900 shadow-sm dark:shadow-lg"
                        data-dropdown="true"
                    >
                        {filteredProduct.map(product => (
                            <div
                                key={product.uuid}
                                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                                onClick={() => {
                                    addToCart(product);
                                    setBarcode('');
                                    if (inputRef.current) {
                                        inputRef.current.focus();
                                    }
                                }}
                            >
                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate pr-4">
                                    {product.name}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 font-mono text-sm flex-shrink-0">
                                    {product.barcode}
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