import { Tooltip } from 'react-tooltip';
import { Link } from 'react-router-dom';
import ProductFilter from './ProductFilter';
import { formatCurrency } from '../../../utils';
import { ROUTES } from '../../../utils/constants';
import { HiOutlineArchiveBoxXMark } from 'react-icons/hi2'
import { useProducts } from '../../../context/ProductsProvider'
import { useEffect, useState } from 'react';
import type { FunctionComponent } from 'react'

const ProductsViewGrid: FunctionComponent = () => {
    const {
        addToCart,
        products,
        categories,
    } = useProducts();

    const [data, setData] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expiredProductsCount, setExpiredProductsCount] = useState(0);

    useEffect(() => {
        const expiredProducts = products.filter(product => {
            return product.expirationDate && new Date(product.expirationDate) < new Date();
        });

        setExpiredProductsCount(expiredProducts.length);

        const nonExpiredProducts = products.filter(product => {
            return !product.expirationDate || new Date(product.expirationDate) >= new Date();
        });

        setData(nonExpiredProducts);

        if (searchTerm) {
            const filteredProducts = nonExpiredProducts.filter(product => {
                const productName = product.name.toLowerCase();
                const searchValue = searchTerm.toLowerCase();

                return productName.includes(searchValue);
            });
            setData(filteredProducts);
        }
    }, [products, searchTerm]);

    const handleSearch = (searchTerm: string) => {
        setSearchTerm(searchTerm);

        const nonExpiredProducts = products.filter(product => {
            return !product.expirationDate || new Date(product.expirationDate) >= new Date();
        });

        const filteredProducts = nonExpiredProducts.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const barcodeMatch = product.barcode.toString().includes(searchTerm.toLowerCase());

            return nameMatch || barcodeMatch;
        });

        setData(filteredProducts);
    };

    const handleCategory = (cat: number) => {
        setSearchTerm('');

        const nonExpiredProducts = products.filter(product => {
            return !product.expirationDate || new Date(product.expirationDate) >= new Date();
        });

        if (isNaN(cat)) {
            setData(nonExpiredProducts);
            return;
        }

        const filteredProducts = nonExpiredProducts.filter(product => {
            const productCategory = product.categoryId.toString();
            const searchValue = cat.toString();

            return productCategory.includes(searchValue);
        });

        setData(filteredProducts);
    }

    return (
        <div className='flex-grow overflow-auto p-2.5'>
            {expiredProductsCount > 0 && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200/40 rounded-sm p-3">
                    <div className="flex items-center">
                        <div className="text-yellow-600 font-medium">
                            {expiredProductsCount} product(s) have expired.
                        </div>
                        <Link
                            to={ROUTES.PRODUCTS}
                            className="ml-4 text-sky-600 hover:text-sky-800 font-medium text-sm"
                        >
                            Go to Products Page →
                        </Link>
                    </div>
                </div>
            )}

            <ProductFilter
                categories={categories}
                searchValue={searchTerm}
                handleSearch={handleSearch}
                handleCategory={handleCategory}
            />

            <div className="h-[calc(100vh-255px)] flex flex-col mt-4">
                <div className="flex-grow overflow-auto">
                    {data.length > 0 ? (
                        <div className="w-full">
                            <div className="grid grid-cols-12 bg-white gap-2 px-4 py-2 sticky top-0 z-10 font-medium text-sm uppercase border-b">
                                <div className="col-span-4">Product Name</div>
                                <div className="col-span-3">Category</div>
                                <div className="col-span-2 text-center">Stock</div>
                                <div className="col-span-3 text-center">Price</div>
                            </div>

                            <div className="space-y-0 border-b">
                                {data.map(product => {
                                    const quantity = parseFloat((product.quantity || 0).toString());
                                    const isOutOfStock = quantity <= 0;
                                    return (
                                        <button
                                            key={product.uuid}
                                            onClick={() => {
                                                addToCart(product);
                                                setSearchTerm('');
                                            }}
                                            disabled={isOutOfStock}
                                            data-tooltip-id="product-tooltip"
                                            data-tooltip-content={isOutOfStock ? "Out of stock" : "Click to add to cart"}
                                            className={`w-full grid grid-cols-12 gap-2 px-4 py-3 border-t rounded-xs text-left ${isOutOfStock ? 'bg-gray-50/30 opacity-70 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
                                        >
                                            <div className="col-span-4 font-medium truncate" title={product.name}>
                                                {product.name}
                                            </div>
                                            <div className="col-span-3 truncate" title={product.categoryDetails?.name as string}>
                                                {product.categoryDetails?.name as string}
                                            </div>
                                            <div className={`col-span-2 text-center ${isOutOfStock ? "text-yellow-500" : "text-gray-500"}`}>
                                                {product.quantity}
                                            </div>
                                            <div className={`col-span-3 text-center font-medium ${isOutOfStock ? "text-yellow-500" : "text-green-600"}`}>
                                                {formatCurrency(parseFloat((product.sellPrice || 0).toString()))}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center text-gray-400 py-12">
                            <HiOutlineArchiveBoxXMark className="w-16 h-16 mb-4" />
                            <h3 className="text-lg font-medium mb-1">No products found</h3>
                            <p className="text-sm max-w-md text-center">
                                There are currently no products available. Try adjusting your filters or check back later.
                            </p>
                        </div>
                    )}
                </div>
                <Tooltip
                    id="product-tooltip"
                    place="top"
                    delayShow={300}
                    className="z-50 bg-gray-800 text-white px-3 py-1 rounded text-sm"
                />
            </div>
        </div>
    )
}

export default ProductsViewGrid