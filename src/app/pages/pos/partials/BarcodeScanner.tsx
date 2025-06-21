import { HiOutlineQrcode } from 'react-icons/hi';
import { Button, Input } from '../../../components';
import { useProducts } from '../../../context/ProductsProvider';
import { FunctionComponent, useState, useEffect, Fragment, useRef } from 'react';
import { Confirm } from 'notiflix';

const BarcodeScanner: FunctionComponent = () => {
    const [barcode, setBarcode] = useState('');
    const { products, addToCart } = useProducts();
    const inputRef = useRef<HTMLInputElement>(null);
    const [filteredProduct, setFilteredProduct] = useState(products);

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
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleManualEntry = () => {
        const product = products.find(p => p.barcode.toString() === barcode.trim());
        if (product) {
            addToCart(product);
            setBarcode('');
        } else {
            Confirm.show('Product not found', 'Product not found. Please check the barcode.', 'Ok');
        }
    };

    return (
        <Fragment>
            <div className="flex px-2.5">
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Scan barcode or type the number then hit enter"
                    value={barcode}
                    onChange={(e) => {
                        const value = e.target.value;
                        const cleanedValue = value.endsWith('$') ? value.slice(0, -1) : value;
                        setBarcode(cleanedValue);
                    }}
                    className="flex-grow p-3 border rounded-l-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-colors"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleManualEntry();
                        }
                    }}
                />
                <Button
                    className='text-white dark:text-gray-100 p-3 border border-l-0 rounded-l-none rounded-r-md bg-current dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 border-emerald-600 dark:border-emerald-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium'
                    onClick={handleManualEntry}
                    disabled={barcode.trim() === ''}>
                    <HiOutlineQrcode className='w-5 h-5' />
                    <span>Scan</span>
                </Button>
            </div>

            {barcode.trim() !== '' && filteredProduct.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg mt-3 max-h-60 overflow-y-auto bg-white dark:bg-gray-900 shadow-sm dark:shadow-lg">
                    {filteredProduct.map(product => (
                        <div
                            key={product.uuid}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                            onClick={() => {
                                addToCart(product);
                                setBarcode('');
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
                </div>
            )}
        </Fragment>
    );
};

export default BarcodeScanner;