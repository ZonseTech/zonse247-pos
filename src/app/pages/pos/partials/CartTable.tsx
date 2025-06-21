import QuantityControl from './QuantityControl';
import CartTableFooter from './CartTableFooter';
import { formatCurrency } from '../../../utils';
import { Fragment, useState } from 'react';
import type { FunctionComponent } from 'react'
import { useProducts } from '../../../context/ProductsProvider';
import { HiOutlineShoppingCart, HiOutlinePencil, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

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

    return (
        <Fragment>
            <div className="flex-grow overflow-auto h-[calc(100vh-494px)]">
                <table className="w-full border-collapse bg-white dark:bg-gray-800">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 uppercase text-xs font-semibold">
                            <th className="text-left p-3 text-gray-700 dark:text-gray-300">#</th>
                            <th className="text-left p-3 text-gray-700 dark:text-gray-300">Item</th>
                            <th className="text-left p-3 text-gray-700 dark:text-gray-300">Qty</th>
                            <th className="text-left p-3 text-gray-700 dark:text-gray-300">Price</th>
                            <th className="text-left p-3 text-gray-700 dark:text-gray-300"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                                        <HiOutlineShoppingCart className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" />
                                        <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">The cart is empty</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">Start adding products by clicking on them in the list.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            cart.map((item, index) => (
                                <tr key={item.productId} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">{index + 1}</td>
                                    <td className="p-3 text-gray-900 dark:text-gray-100 font-medium">{item.name}</td>
                                    <td className="p-3">
                                        <QuantityControl
                                            quantity={item.quantity}
                                            onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
                                            onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
                                            onInputChange={(value) => updateQuantity(item.productId, value)}
                                        />
                                    </td>
                                    <td className="p-3">
                                        {item.categoryId === "-1" ? (
                                            <div className="flex items-center">
                                                {editingItemId === item.productId ? (
                                                    <Fragment>
                                                        <input
                                                            type="number"
                                                            value={customPriceInput}
                                                            onChange={(e) => setCustomPriceInput(e.target.value)}
                                                            className="w-20 border border-gray-300 dark:border-gray-600 rounded-md p-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                        <button
                                                            onClick={() => handleSavePrice(item.productId)}
                                                            className="ml-2 p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                                                        >
                                                            <HiOutlineCheck className="h-5 w-5" />
                                                        </button>
                                                    </Fragment>
                                                ) : (
                                                    <Fragment>
                                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.sellPrice)}</span>
                                                        <button
                                                            onClick={() => handleEditPrice(item.productId, item.sellPrice)}
                                                            className="ml-2 p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                        >
                                                            <HiOutlinePencil className="h-4 w-4" />
                                                        </button>
                                                    </Fragment>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(item.sellPrice)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        >
                                            <HiOutlineX className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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