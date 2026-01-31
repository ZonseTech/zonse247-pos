import { useState, type FunctionComponent } from "react";
import { Confirm } from "notiflix";
import { formatCurrency } from "../../../utils";
import { useInventory } from "../../../hooks/useInventory";
import { BiSolidEditAlt } from "react-icons/bi";
import { BsUpcScan } from "react-icons/bs";
import Button from "../../../components/Button";
import ParkSaleModal from "./ParkSaleModal";
import TaxModal from "./TaxModal";
import MobileDiscountModal from "./MobileDiscountModal";
import OtherChargesModal from "./OtherChargesModal";

interface MobileCartItemCardProps {
    onEditItem?: (item: CartItem) => void;
    onAddNewItem?: () => void;
    onScanBarcode?: () => void;
    onParkSaleSuccess?: () => void;
}

const MobileCartItemCard: FunctionComponent<MobileCartItemCardProps> = ({ onEditItem, onAddNewItem, onScanBarcode, onParkSaleSuccess }) => {
    const { cart, clearCart, subtotal, discount, discountIsPercentage, tax, taxName, otherCharges, total } = useInventory();
    const [isParkSaleModalOpen, setIsParkSaleModalOpen] = useState(false);
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [isOtherChargesModalOpen, setIsOtherChargesModalOpen] = useState(false);

    // Calculate amounts for display
    const discountAmount = discountIsPercentage ? (subtotal * discount) / 100 : discount;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * tax) / 100;
    const otherChargesTotal = otherCharges.reduce((sum, charge) => {
        const chargeAmount = charge.isPercentage ? (subtotal * charge.value) / 100 : charge.value;
        return sum + chargeAmount;
    }, 0);

    const totalItems = cart.length;
    const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleClearCart = () => {
        Confirm.show(
            'Clear Cart',
            'Are you sure you want to clear all items from your cart? This action cannot be undone.',
            'Yes, Clear',
            'Cancel',
            () => {
                clearCart();
            },
            () => {
                // 
            },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const handleSaveForLater = () => {
        setIsParkSaleModalOpen(true);
    };

    const handleParkSaleSuccess = () => {
        setIsParkSaleModalOpen(false);
        onParkSaleSuccess?.();
    };

    return (
        <div className="w-full px-4 py-1.5">
            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cart.map((item) => {
                        const totalPrice = item.sellPrice * item.quantity;

                        return (
                            <div
                                key={item.productId}
                                className="py-1.5 px-2.5"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-gray-900 dark:text-gray-100 font-medium text-sm truncate flex-1 mx-0">
                                        {item.name}
                                    </h3>
                                    <button
                                        onClick={() => onEditItem?.(item)}
                                        className="text-sky-500 dark:text-sky-400 rounded-full transition-colors"
                                        aria-label="Edit item"
                                    >
                                        <BiSolidEditAlt className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm">
                                        <span className="text-green-600 dark:text-green-400 font-medium">{item.quantity} x</span>
                                        <span className="text-gray-500 dark:text-gray-400"> {formatCurrency(item.sellPrice)}</span>
                                    </span>
                                    <span className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
                                        {formatCurrency(totalPrice)}
                                    </span>
                                </div>

                                {item.discount > 0 && (
                                    <div className="flex justify-end mt-1">
                                        <span className="text-green-600 dark:text-green-400 text-xs">
                                            Discount: -{formatCurrency(item.discount)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-2 mt-3">
                <button
                    onClick={onAddNewItem}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sky-600 dark:text-sky-400 font-medium rounded-sm transition-colors active:bg-gray-100 dark:active:bg-gray-700"
                >
                    <span>ADD NEW ITEM</span>
                </button>
                <button
                    onClick={onScanBarcode}
                    className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm transition-colors active:bg-gray-100 dark:active:bg-gray-700"
                    aria-label="Scan barcode"
                >
                    <BsUpcScan className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 mt-3 p-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Subtotal</span>
                    <span className="text-gray-900 dark:text-gray-100 text-sm">{formatCurrency(subtotal)}</span>
                </div>

                {tax > 0 && (
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {taxName || 'Tax'} ({tax}%)
                        </span>
                        <span className="text-sky-600 dark:text-sky-400 text-sm">+{formatCurrency(taxAmount)}</span>
                    </div>
                )}

                {discount > 0 && (
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                            Discount {discountIsPercentage && `(${discount}%)`}
                        </span>
                        <span className="text-green-600 dark:text-green-400 text-sm">-{formatCurrency(discountAmount)}</span>
                    </div>
                )}

                {otherCharges.length > 0 && (
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                            Other Charges ({otherCharges.length})
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 text-sm">+{formatCurrency(otherChargesTotal)}</span>
                    </div>
                )}

                <hr className="my-2 border-gray-300 dark:border-gray-700" />

                <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Grand Total</span>
                    <span className="text-sky-500 dark:text-sky-400 font-bold text-lg">{formatCurrency(total)}</span>
                </div>

                <div className="flex justify-between items-center mt-0.5">
                    <Button
                        layout="link"
                        theme="primary"
                        size="small"
                        className="underline flex-shrink-0 text-xs text-sky-600 dark:text-sky-400 px-0 pl-0 pr-0"
                        onClick={() => setIsTaxModalOpen(true)}
                    >{tax > 0 ? 'EDIT TAX' : 'ADD TAX'}</Button>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{totalItems} ITEMS | {totalUnits} UNITS</span>
                </div>

                <div className="flex justify-between items-center mt-0.5">
                    <Button
                        layout="link"
                        theme="primary"
                        size="small"
                        className="underline flex-shrink-0 text-xs text-sky-600 dark:text-sky-400 px-0 pl-0 pr-0"
                        onClick={() => setIsDiscountModalOpen(true)}
                    >{discount > 0 ? 'EDIT DISCOUNT' : 'ADD DISCOUNT'}</Button>
                    <Button
                        layout="link"
                        theme="primary"
                        size="small"
                        className="underline flex-shrink-0 text-xs text-sky-600 dark:text-sky-400 px-0 pl-0 pr-0"
                        onClick={() => setIsOtherChargesModalOpen(true)}
                    >{otherCharges.length > 0 ? 'EDIT CHARGES' : 'ADD OTHER CHARGES'}</Button>
                </div>
            </div>

            <div className="flex gap-2 mt-3">
                <Button
                    theme="danger"
                    size="regular"
                    block
                    onClick={handleClearCart}
                >
                    CLEAR
                </Button>
                <Button
                    theme="warning"
                    size="regular"
                    block
                    onClick={handleSaveForLater}
                >
                    SAVE FOR LATER
                </Button>
            </div>

            <ParkSaleModal
                isOpen={isParkSaleModalOpen}
                onClose={() => setIsParkSaleModalOpen(false)}
                onSuccess={handleParkSaleSuccess}
            />

            <TaxModal
                isOpen={isTaxModalOpen}
                onClose={() => setIsTaxModalOpen(false)}
            />

            <MobileDiscountModal
                isOpen={isDiscountModalOpen}
                onClose={() => setIsDiscountModalOpen(false)}
            />

            <OtherChargesModal
                isOpen={isOtherChargesModalOpen}
                onClose={() => setIsOtherChargesModalOpen(false)}
            />
        </div>
    );
};

export default MobileCartItemCard;
