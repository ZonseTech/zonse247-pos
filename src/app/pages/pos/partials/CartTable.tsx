import QuantityControl from './QuantityControl';
import CartTableFooter from './CartTableFooter';
import { formatCurrency } from '../../../utils';
import { Fragment, useState } from 'react';
import type { FunctionComponent } from 'react'
import { useProducts } from '../../../context/ProductsProvider';
import { HiOutlineShoppingCart, HiOutlinePencil, HiOutlineCheck, HiOutlineX, HiOutlineTrash } from 'react-icons/hi';

const CartTable: FunctionComponent = () => {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        updateCustomPrice,
        subtotal,
        discount,
        setDiscount,
        tax,
        total,
        clearCart
    } = useProducts();

    const [customPriceInput, setCustomPriceInput] = useState<string>('');
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    const handleEditPrice = (itemId: string, currentPrice: number) => {
        setEditingItemId(itemId);
        setCustomPriceInput(currentPrice.toString());
    };

    const handleSavePrice = (itemId: string) => {
        const newPrice = parseFloat(customPriceInput);
        if (newPrice && newPrice >= 0) {
            updateCustomPrice(itemId, newPrice);
        }
        setEditingItemId(null);
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
        setCustomPriceInput('');
    };

    return (
        <Fragment>
            <div className="flex-grow overflow-auto h-[calc(100vh-494px)] bg-gray-50 dark:bg-gray-900/50">
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg mx-2 my-2 overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 w-16">#</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Item</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 w-32">Quantity</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 w-40">Price</th>
                                <th className="text-center p-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 w-20">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {cart.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-0">
                                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30">
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
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200 group"
                                    >
                                        <td className="p-4 text-gray-600 dark:text-gray-400 font-medium text-sm">
                                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-bold">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                                                {item.name}
                                            </div>
                                            {item.categoryUuid === "-1" && (
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
                                            />
                                        </td>
                                        <td className="p-4">
                                            {item.categoryUuid === "-1" ? (
                                                <div className="flex items-center gap-2">
                                                    {editingItemId === item.productUuid ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative">
                                                                <span className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                                                                    MK
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    value={customPriceInput}
                                                                    onChange={(e) => setCustomPriceInput(e.target.value)}
                                                                    className="w-24 pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                                                                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                                                             focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                                                                             transition-all duration-200"
                                                                    min="0"
                                                                    step="0.01"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => handleSavePrice(item.productUuid)}
                                                                className="p-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 
                                                                         hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200
                                                                         focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                                title="Save price"
                                                            >
                                                                <HiOutlineCheck className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 
                                                                         hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200
                                                                         focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                                                                title="Cancel edit"
                                                            >
                                                                <HiOutlineX className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                                                                {formatCurrency(item.sellPrice)}
                                                            </span>
                                                            <button
                                                                onClick={() => handleEditPrice(item.productUuid, item.sellPrice)}
                                                                className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 
                                                                         hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200
                                                                         opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                                title="Edit price"
                                                            >
                                                                <HiOutlinePencil className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                                                    {formatCurrency(item.sellPrice)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => removeFromCart(item.productUuid)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 
                                                         hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200
                                                         opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                                title="Remove item"
                                            >
                                                <HiOutlineTrash className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <CartTableFooter
                cart={cart}
                discount={discount}
                subtotal={subtotal}
                tax={tax}
                total={total}
                setDiscount={setDiscount}
                clearCart={clearCart}
            />
        </Fragment>
    )
}

export default CartTable