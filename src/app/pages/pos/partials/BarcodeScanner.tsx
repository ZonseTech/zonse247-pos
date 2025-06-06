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
                    className="flex-grow p-2 border rounded-l-sm border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-400"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleManualEntry();
                        }
                    }}
                />
                <Button
                    className='text-white p-2 border rounded-l-none rounded-r-sm bg-green-500'
                    onClick={handleManualEntry}
                    disabled={barcode.trim() === ''}>
                    <HiOutlineQrcode className='w-5 h-5' /> Scan
                </Button>
            </div>

            {barcode.trim() !== '' && filteredProduct.length > 0 && (
                <div className="border rounded-md mt-2 max-h-60 overflow-y-auto">
                    {filteredProduct.map(product => (
                        <div
                            key={product.uuid}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                            onClick={() => {
                                addToCart(product);
                                setBarcode('');
                            }}
                        >
                            <span>{product.name}</span>
                            <span className="text-gray-500">{product.barcode}</span>
                        </div>
                    ))}
                </div>
            )}
        </Fragment>
    );
};

export default BarcodeScanner;