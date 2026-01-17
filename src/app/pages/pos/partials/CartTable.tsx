import QuantityControl from './QuantityControl';
import PriceControl from './PriceControl';
import { formatCurrency } from '../../../utils';
import type { FunctionComponent } from 'react'
import { useInventory } from '../../../hooks/useInventory';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { useFocusManager } from '../../../hooks/useFocusManager';
import { Trash2, Package, Tag, Hash, Percent } from 'lucide-react';

interface CartTableProps {
    focusManager: ReturnType<typeof useFocusManager>;
    customPriceInputs: Record<string, string>;
    onPriceChange: (productId: string, value: string) => void;
    compact?: boolean;
}

const CartTable: FunctionComponent<CartTableProps> = ({
    focusManager,
    customPriceInputs,
    onPriceChange,
    compact = false,
}) => {
    const {
        cart,
        inventory,
        removeFromCart,
        updateQuantity,
    } = useInventory();

    const getMaxStock = (productId: string, currentCartQuantity: number): number => {
        const inventoryItem = inventory.find(p => p.productId === productId);
        const availableInInventory = parseInt((inventoryItem?.quantity || '0').toString());
        return availableInInventory + currentCartQuantity;
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-none border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className={`border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 ${compact ? 'px-3 py-2' : 'px-5 py-4'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`bg-blue-100 dark:bg-blue-500/20 rounded-xl ${compact ? 'p-1.5' : 'p-2.5'}`}>
                            <HiOutlineShoppingCart className={`text-blue-600 dark:text-blue-400 ${compact ? 'w-4 h-4' : 'w-6 h-6'}`} />
                        </div>
                        <div>
                            <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-lg'}`}>Shopping Cart</h3>
                            <p className={`text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                                {cart.length} {cart.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                    </div>
                    {cart.length > 0 && (
                        <span className={`font-semibold bg-blue-600 text-white rounded-full ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}>
                            {cart.reduce((sum, item) => sum + item.quantity, 0)} units
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-grow overflow-auto">
                <table className="w-full table-fixed border-collapse">
                    <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
                        <tr>
                            <th className="w-[28%] text-left px-3 py-2 lg:px-4 lg:py-4">
                                <div className={`flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${compact ? 'text-xs' : 'text-sm'}`}>
                                    <Package size={compact ? 14 : 18} />
                                    Product
                                </div>
                            </th>
                            <th className="w-[12%] text-left px-2 py-2 lg:px-3 lg:py-4">
                                <span className={`font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${compact ? 'text-xs' : 'text-sm'}`}>
                                    Qty
                                </span>
                            </th>
                            <th className="w-[14%] text-left px-2 py-2 lg:px-3 lg:py-4">
                                <div className={`flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${compact ? 'text-xs' : 'text-sm'}`}>
                                    <Tag size={compact ? 14 : 18} />
                                    Price
                                </div>
                            </th>
                            <th className="w-[14%] text-left px-2 py-2 lg:px-3 lg:py-4">
                                <span className={`font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${compact ? 'text-xs' : 'text-sm'}`}>
                                    Total
                                </span>
                            </th>
                            <th className="w-[14%] text-left px-2 py-2 lg:px-3 lg:py-4">
                                <div className={`flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${compact ? 'text-xs' : 'text-sm'}`}>
                                    <Hash size={compact ? 14 : 18} />
                                    Barcode
                                </div>
                            </th>
                            <th className="w-[10%] text-left px-2 py-2 lg:px-3 lg:py-4">
                                <div className={`flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${compact ? 'text-xs' : 'text-sm'}`}>
                                    <Percent size={compact ? 14 : 18} />
                                    Disc
                                </div>
                            </th>
                            <th className="w-[8%] text-center px-2 py-2 lg:px-3 lg:py-4">
                                <span className={`font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${compact ? 'text-xs' : 'text-sm'}`}>

                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {cart.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-0">
                                    <div className="flex flex-col items-center justify-center py-16 px-4">
                                        <div className="relative mb-6">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                                                <HiOutlineShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-bold">0</span>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Your cart is empty</h3>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-xs">
                                            Scan a barcode or search for products to add items to your cart
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            cart.map((item, index) => (
                                <tr
                                    key={item.productId}
                                    className="group hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-200"
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
                                                    {item.name}
                                                </p>
                                                {item.isDefault && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 mt-1">
                                                        Custom Item
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4">
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
                                    <td className="px-3 py-4">
                                        <PriceControl
                                            sellPrice={item.sellPrice}
                                            categoryId={item.categoryId}
                                            productId={item.productId}
                                            customPriceInput={customPriceInputs[item.productId] || ''}
                                            onPriceChange={onPriceChange}
                                            focusManager={focusManager}
                                        />
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white text-lg">
                                                {formatCurrency(item.sellPrice * item.quantity)}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {item.quantity} × {formatCurrency(item.sellPrice)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-md">
                                            {item.barcode}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4">
                                        {item.discount > 0 ? (
                                            <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-semibold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                                                -{formatCurrency(item.discount)}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-4 text-center">
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 
                                                     hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200
                                                     focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                            title="Remove item"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CartTable