import QuantityControl from './QuantityControl';
import PriceControl from './PriceControl';
import { formatCurrency } from '../../../utils';
import { Fragment } from 'react';
import type { FunctionComponent } from 'react'
import { useInventory } from '../../../hooks/useInventory';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { useFocusManager } from '../../../hooks/useFocusManager';

interface CartTableProps {
    focusManager: ReturnType<typeof useFocusManager>;
    customPriceInputs: Record<string, string>;
    onPriceChange: (productId: string, value: string) => void;
}

const CartTable: FunctionComponent<CartTableProps> = ({
    focusManager,
    customPriceInputs,
    onPriceChange
}) => {
    const {
        cart,
        inventory,
        removeFromCart,
        updateQuantity,
    } = useInventory();

    // Calculate max available stock for each cart item (current inventory + quantity in cart)
    const getMaxStock = (productId: string, currentCartQuantity: number): number => {
        const inventoryItem = inventory.find(p => p.productId === productId);
        const availableInInventory = parseInt((inventoryItem?.quantity || '0').toString());
        return availableInInventory + currentCartQuantity;
    };

    return (
        <Fragment>
            <div className="flex-grow overflow-auto max-h-[calc(60vh)]">
                <table className="w-full table-fixed border-collapse">
                    <thead className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                            <th className="w-1/3 text-left p-3 uppercase tracking-wider sticky top-0 z-20 
                                         font-semibold text-gray-700 dark:text-gray-200 
                                         border-r border-gray-300 dark:border-gray-600 
                                         bg-gray-50 dark:bg-gray-800">
                                DESCRIPTION
                            </th>
                            <th className="w-1/8 text-left p-3 uppercase tracking-wider sticky top-0 z-10 
                                         font-semibold text-gray-700 dark:text-gray-200 
                                         border-r border-gray-300 dark:border-gray-600 
                                         bg-gray-50 dark:bg-gray-800">
                                QTY
                            </th>
                            <th className="w-1/8 text-left p-3 uppercase tracking-wider sticky top-0 z-10 
                                         font-semibold text-gray-700 dark:text-gray-200 
                                         border-r border-gray-300 dark:border-gray-600 
                                         bg-gray-50 dark:bg-gray-800">
                                PRICE
                            </th>
                            <th className="w-1/8 text-left p-3 uppercase tracking-wider sticky top-0 z-10 
                                         font-semibold text-gray-700 dark:text-gray-200 
                                         border-r border-gray-300 dark:border-gray-600 
                                         bg-gray-50 dark:bg-gray-800">
                                TOTAL PRICE
                            </th>
                            <th className="w-1/8 text-left p-3 uppercase tracking-wider sticky top-0 z-10 
                                         font-semibold text-gray-700 dark:text-gray-200 
                                         border-r border-gray-300 dark:border-gray-600 
                                         bg-gray-50 dark:bg-gray-800">
                                BARCODE
                            </th>
                            <th className="w-1/12 text-left p-3 uppercase tracking-wider sticky top-0 z-10 
                                         font-semibold text-gray-700 dark:text-gray-200 
                                         border-r border-gray-300 dark:border-gray-600 
                                         bg-gray-50 dark:bg-gray-800">
                                DISCOUNT
                            </th>
                            <th className="w-1/12 text-center p-3 uppercase tracking-wider sticky top-0 z-10 
                                         font-semibold text-gray-700 dark:text-gray-200 
                                         bg-gray-50 dark:bg-gray-800">
                                ACTION
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900">
                        {cart.length === 0 ? (
                            <tr>
                                <td rowSpan={10} colSpan={7} className="p-0 border-none">
                                    <div className="flex flex-col flex-1 items-center justify-center py-24 text-gray-500 dark:text-gray-400">
                                        <div className="relative mb-6">
                                            <HiOutlineShoppingCart className="h-20 w-20 text-gray-300 dark:text-gray-600" />
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">0</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Your cart is empty</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                                            Items will appear here once added.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            cart.map((item, index) => (
                                <tr
                                    key={item.productId}
                                    className={`hover:bg-gray-50 text-xl dark:hover:bg-gray-700/30 transition-all duration-200 group
                                              border-b border-gray-200 dark:border-gray-700
                                              ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-25 dark:bg-gray-850'}`}
                                >
                                    <td className="p-2.5 border-r border-gray-200 dark:border-gray-700">
                                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                                            {item.name}
                                        </div>
                                        {item.isDefault && (
                                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                                                Custom Item
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-2.5 border-r border-gray-200 dark:border-gray-700">
                                        <QuantityControl
                                            quantity={item.quantity}
                                            onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
                                            onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
                                            onInputChange={(value) => updateQuantity(item.productId, value)}
                                            itemId={item.productId}
                                            focusManager={focusManager}
                                            maxStock={getMaxStock(item.productId, item.quantity)}
                                            isDefaultItem={item.isDefault}
                                        />
                                    </td>
                                    <td className="p-2.5 border-r border-gray-200 dark:border-gray-700">
                                        <PriceControl
                                            sellPrice={item.sellPrice}
                                            categoryId={item.categoryId}
                                            productId={item.productId}
                                            customPriceInput={customPriceInputs[item.productId] || ''}
                                            onPriceChange={onPriceChange}
                                            focusManager={focusManager}
                                        />
                                    </td>

                                    <td className="p-2.5 border-r border-gray-200 dark:border-gray-700">
                                        <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                            {formatCurrency(item.sellPrice * item.quantity)}
                                        </span>
                                    </td>

                                    <td className="p-2.5 border-r border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {item.barcode}
                                        </span>
                                    </td>

                                    <td className="p-2.5 border-r border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {formatCurrency(item.discount)}
                                        </span>
                                    </td>

                                    <td className="p-2.5 text-center">
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            className="px-3 py-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 
                                                         hover:bg-red-50 dark:hover:bg-red-900/20 rounded-none transition-all duration-200
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
        </Fragment>
    )
}

export default CartTable