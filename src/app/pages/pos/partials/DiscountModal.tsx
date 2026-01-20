import { useState, type FunctionComponent, useEffect } from "react"
import { HiOutlineTag, HiOutlineCurrencyDollar } from "react-icons/hi"
import { Percent } from "lucide-react"
import { useInventory } from '../../../hooks/useInventory'
import { Modal, Input } from "../../../components"
import { formatCurrency } from "../../../utils"
import classNames from "classnames"

type DiscountType = 'percentage' | 'amount';

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DiscountModal: FunctionComponent<DiscountModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [discountType, setDiscountType] = useState<DiscountType>('percentage')
    const [discountValue, setDiscountValue] = useState<string>('')
    const [error, setError] = useState<string>('')

    const { subtotal, discount, setDiscount, cart } = useInventory()

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            // Calculate current discount percentage or amount based on existing discount
            if (discount > 0) {
                const percentage = (discount / subtotal) * 100
                // If it's a clean percentage, show as percentage, otherwise show as amount
                if (Number.isInteger(percentage) || percentage.toFixed(2) === percentage.toString()) {
                    setDiscountType('percentage')
                    setDiscountValue(percentage.toFixed(2).replace(/\.?0+$/, ''))
                } else {
                    setDiscountType('amount')
                    setDiscountValue(discount.toString())
                }
            } else {
                setDiscountValue('')
            }
            setError('')
        }
    }, [isOpen, discount, subtotal])

    const calculateDiscountAmount = (): number => {
        const value = parseFloat(discountValue) || 0
        if (discountType === 'percentage') {
            return (subtotal * value) / 100
        }
        return value
    }

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        // Allow only numbers and decimal point
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setDiscountValue(value)
            setError('')

            const numValue = parseFloat(value) || 0
            if (discountType === 'percentage' && numValue > 100) {
                setError('Percentage cannot exceed 100%')
            } else if (discountType === 'amount' && numValue > subtotal) {
                setError('Discount cannot exceed subtotal')
            }
        }
    }

    const handleApplyDiscount = () => {
        const discountAmount = calculateDiscountAmount()

        if (discountAmount < 0) {
            setError('Discount cannot be negative')
            return
        }

        if (discountAmount > subtotal) {
            setError('Discount cannot exceed subtotal')
            return
        }

        setDiscount(discountAmount)
        onClose()
    }

    const handleClearDiscount = () => {
        setDiscount(0)
        setDiscountValue('')
        setError('')
        onClose()
    }

    const handleCloseModal = () => {
        setError('')
        onClose()
    }

    const handleQuickPercent = (percent: number) => {
        setDiscountType('percentage')
        setDiscountValue(percent.toString())
        setError('')
    }

    const previewDiscount = calculateDiscountAmount()
    const newTotal = subtotal - previewDiscount

    const isValidDiscount = discountValue !== '' &&
        parseFloat(discountValue) >= 0 &&
        previewDiscount <= subtotal &&
        !error

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCloseModal}
            title="Apply Discount"
            size="md"
        >
            <div className="p-6 space-y-6">
                {/* Cart Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-blue-100 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                                <HiOutlineCurrencyDollar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Subtotal</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{cart.length} items</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(subtotal)}</p>
                        </div>
                    </div>
                </div>

                {/* Discount Type Toggle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Discount Type
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => { setDiscountType('percentage'); setDiscountValue(''); setError(''); }}
                            className={classNames(
                                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border",
                                discountType === 'percentage'
                                    ? "bg-orange-500 text-white border-orange-500 shadow-md"
                                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                            )}
                        >
                            <Percent size={18} />
                            Percentage
                        </button>
                        <button
                            type="button"
                            onClick={() => { setDiscountType('amount'); setDiscountValue(''); setError(''); }}
                            className={classNames(
                                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border",
                                discountType === 'amount'
                                    ? "bg-orange-500 text-white border-orange-500 shadow-md"
                                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                            )}
                        >
                            <HiOutlineTag size={18} />
                            Fixed Amount
                        </button>
                    </div>
                </div>

                {/* Quick Percentage Buttons */}
                {discountType === 'percentage' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quick Select
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[5, 10, 15, 20, 25, 30, 40, 50].map((percent) => (
                                <button
                                    key={percent}
                                    type="button"
                                    onClick={() => handleQuickPercent(percent)}
                                    className={classNames(
                                        "py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 border",
                                        discountValue === percent.toString()
                                            ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-500"
                                            : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    )}
                                >
                                    {percent}%
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Discount Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="decimal"
                            value={discountValue}
                            onChange={handleValueChange}
                            placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                            className={classNames(
                                "w-full p-4 text-lg font-semibold bg-white dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
                                error
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-orange-500"
                            )}
                            autoFocus
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                            {discountType === 'percentage' ? '%' : 'MK'}
                        </div>
                    </div>
                    {error && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                </div>

                {/* Preview */}
                {discountValue && !error && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-green-100 dark:border-gray-600 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                            <span className="font-medium text-gray-800 dark:text-gray-100">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600 dark:text-green-400">Discount</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                                -{formatCurrency(previewDiscount)}
                                {discountType === 'percentage' && ` (${discountValue}%)`}
                            </span>
                        </div>
                        <div className="border-t border-green-200 dark:border-gray-500 pt-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-800 dark:text-gray-100">New Total</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(newTotal)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Current Discount Info */}
                {discount > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-3 border border-orange-200 dark:border-orange-500/30">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-orange-700 dark:text-orange-400">
                                Current discount applied
                            </span>
                            <span className="font-semibold text-orange-700 dark:text-orange-400">
                                -{formatCurrency(discount)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    {discount > 0 && (
                        <button
                            onClick={handleClearDiscount}
                            type="button"
                            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-3 px-6 rounded-lg font-medium transition-all duration-200 border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                            Clear Discount
                        </button>
                    )}
                    <button
                        onClick={handleCloseModal}
                        type="button"
                        className={classNames(
                            "bg-red-100 hover:bg-red-200 dark:bg-red-600 dark:hover:bg-red-500 text-red-700 dark:text-red-200 py-3 px-6 rounded-lg font-medium transition-all duration-200 border border-red-300 dark:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                            discount > 0 ? "" : "flex-1"
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApplyDiscount}
                        type="button"
                        disabled={!isValidDiscount || cart.length === 0}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                        Apply Discount
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default DiscountModal
