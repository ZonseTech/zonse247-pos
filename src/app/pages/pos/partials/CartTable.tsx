import QuantityControl from './QuantityControl';
import { formatCurrency } from '../../../utils';
import { Fragment, useState, useEffect } from 'react';
import type { FunctionComponent } from 'react'
import { useProducts } from '../../../context/ProductsProvider';
import { HiOutlineShoppingCart, HiOutlineTrash } from 'react-icons/hi';
import { useFocusManager } from '../../../hooks/useFocusManager';
import { DEFAULT_SEED_KEY } from '../../../constants';

interface CartTableProps {
    focusManager: ReturnType<typeof useFocusManager>;
}

const CartTable: FunctionComponent<CartTableProps> = ({ focusManager }) => {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        updateCustomPrice,
    } = useProducts();

    // Store individual input values for each custom item
    const [customPriceInputs, setCustomPriceInputs] = useState<Record<string, string>>({});

    // Initialize custom price inputs when cart changes
    useEffect(() => {
        const newInputs: Record<string, string> = {};
        cart.forEach(item => {
            if (item.categoryUuid === DEFAULT_SEED_KEY) {
                newInputs[item.productUuid] = item.sellPrice.toString();
            }
        });
        setCustomPriceInputs(newInputs);
    }, [cart]);

    const handlePriceInputChange = (itemId: string, value: string) => {
        // Update the input state immediately for responsive UI
        setCustomPriceInputs(prev => ({
            ...prev,
            [itemId]: value
        }));

        // Parse and validate the price
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0) {
            // Automatically update the price in the context
            updateCustomPrice(itemId, numericValue);
        }
    };

    return (
        <Fragment>
            <div className="flex-grow overflow-auto h-[calc(100vh-494px)] dark:bg-gray-900/50">
                <div className="bg-white dark:bg-gray-800">
                    <table className="w-full table-fixed border-collapse">
                        <thead>
                            <tr className="bg-blue-600 text-white">
                                <th className="w-1/3 text-left p-2 border-r border-blue-500 uppercase tracking-wider sticky top-0 bg-blue-600 z-20">DESCRIPTION</th>
                                <th className="w-1/8 text-left p-2 border-r border-blue-500 uppercase tracking-wider sticky top-0 bg-blue-600 z-10">QTY</th>
                                <th className="w-1/8 text-left p-2 border-r border-blue-500 uppercase tracking-wider sticky top-0 bg-blue-600 z-10">PRICE</th>
                                <th className="w-1/8 text-left p-2 border-r border-blue-500 uppercase tracking-wider sticky top-0 bg-blue-600 z-10">TOTAL PRICE</th>
                                <th className="w-1/8 text-left p-2 border-r border-blue-500 uppercase tracking-wider sticky top-0 bg-blue-600 z-10">BARCODE</th>
                                <th className="w-1/12 text-left p-2 border-r border-blue-500 uppercase tracking-wider sticky top-0 bg-blue-600 z-10">DISCOUNT</th>
                                <th className="w-1/12 text-center p-2 uppercase tracking-wider sticky top-0 bg-blue-600 z-10">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {cart.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-0">
                                        <div className="flex flex-col flex-1 items-center justify-center py-20 text-gray-500 dark:text-gray-400 dark:bg-gray-800/30">
                                            <div className="relative mb-6">
                                                <HiOutlineShoppingCart className="h-20 w-20 text-gray-300 dark:text-gray-600" />
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">0</span>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Your cart is empty</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                                                Start adding products by selecting them from the product list. Items will appear here once added.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                cart.map((item, index) => (
                                    <tr
                                        key={item.productUuid}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200 group border-b"
                                    >
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                {item.name}
                                            </div>
                                            {item.categoryUuid === DEFAULT_SEED_KEY && (
                                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                                                    Custom Item
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <QuantityControl
                                                quantity={item.quantity}
                                                onIncrease={() => updateQuantity(item.productUuid, item.quantity + 1)}
                                                onDecrease={() => updateQuantity(item.productUuid, item.quantity - 1)}
                                                onInputChange={(value) => updateQuantity(item.productUuid, value)}
                                                itemId={item.productUuid}
                                                focusManager={focusManager}
                                            />
                                        </td>
                                        <td className="p-4">
                                            {item.categoryUuid === DEFAULT_SEED_KEY ? (
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                                                        MK
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={customPriceInputs[item.productUuid] || ''}
                                                        onChange={(e) => handlePriceInputChange(item.productUuid, e.target.value)}
                                                        className="w-28 pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm text-sm text-center 
                                                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                                                 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                                                                 transition-all duration-200
                                                                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                                                 "
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                                                    {formatCurrency(item.sellPrice)}
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                                {formatCurrency(item.sellPrice * item.quantity)}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {item.barcode}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatCurrency(item.discount)}
                                            </span>
                                        </td>

                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => removeFromCart(item.productUuid)}
                                                className="px-3 py-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 
                                                         hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200
                                                         opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/20
                                                         text-xs font-medium border border-red-300 dark:border-red-600"
                                                title="Remove item"
                                            >
                                                VOID
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Fragment>
    )
}

export default CartTable