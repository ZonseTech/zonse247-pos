import { useState, type FunctionComponent, useEffect } from "react"
import { HiOutlineTag, HiOutlineCurrencyDollar, HiOutlinePlus } from "react-icons/hi"
import { Percent, Tag } from "lucide-react"
import { useInventory } from '../../../hooks/useInventory'
import { Modal } from "../../../components"
import { formatCurrency } from "../../../utils"
import classNames from "classnames"

type DiscountType = 'percentage' | 'amount';

interface DiscountPreset {
    id: string;
    name: string;
    value: number;
    isPercentage: boolean;
}

const PRESET_DISCOUNTS: DiscountPreset[] = [
    { id: '1', name: 'Student Discount', value: 10, isPercentage: true },
    { id: '2', name: 'Senior Citizen', value: 15, isPercentage: true },
    { id: '3', name: 'Staff Discount', value: 20, isPercentage: true },
    { id: '4', name: 'Loyalty Discount', value: 5, isPercentage: true },
];

interface MobileDiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileDiscountModal: FunctionComponent<MobileDiscountModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [discountType, setDiscountType] = useState<DiscountType>('percentage')
    const [discountValue, setDiscountValue] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [showCustomInput, setShowCustomInput] = useState(false)

    const { subtotal, discount, discountIsPercentage, setDiscount, cart } = useInventory()

    useEffect(() => {
        if (isOpen) {
            if (discount > 0) {
                setDiscountType(discountIsPercentage ? 'percentage' : 'amount')
                setDiscountValue(discount.toString())
                setShowCustomInput(true)
            } else {
                setDiscountValue('')
                setShowCustomInput(false)
            }
            setError('')
        }
    }, [isOpen, discount, discountIsPercentage])

    const calculateDiscountAmount = (): number => {
        const value = parseFloat(discountValue) || 0
        if (discountType === 'percentage') {
            return (subtotal * value) / 100
        }
        return value
    }

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
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

    const handleSelectPreset = (preset: DiscountPreset) => {
        setDiscount(preset.value, preset.isPercentage)
        onClose()
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

        setDiscount(parseFloat(discountValue) || 0, discountType === 'percentage')
        onClose()
    }

    const handleClearDiscount = () => {
        setDiscount(0, false)
        setDiscountValue('')
        setError('')
        onClose()
    }

    const handleCloseModal = () => {
        setError('')
        onClose()
    }

    const previewDiscount = calculateDiscountAmount()
    const newTotal = subtotal - previewDiscount

    const isValidDiscount = discountValue !== '' &&
        parseFloat(discountValue) >= 0 &&
        previewDiscount <= subtotal &&
        !error

    const hasPresets = PRESET_DISCOUNTS.length > 0

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCloseModal}
            title="Add Discount"
            size="md"
        >
            <div className="p-4 space-y-4">
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Discount Type
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => { setDiscountType('percentage'); setDiscountValue(''); setError(''); }}
                                className={classNames(
                                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm font-medium transition-all duration-200 border",
                                    discountType === 'percentage'
                                        ? "bg-sky-500 text-white border-sky-500 shadow-none"
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
                                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm font-medium transition-all duration-200 border",
                                    discountType === 'amount'
                                        ? "bg-sky-500 text-white border-sky-500 shadow-none"
                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                                )}
                            >
                                <HiOutlineTag size={18} />
                                Fixed Amount
                            </button>
                        </div>
                    </div>

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
                                    "w-full p-4 text-lg font-semibold bg-white dark:bg-gray-700 border rounded-sm transition-all duration-200 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
                                    error
                                        ? "border-red-500"
                                        : "border-gray-300 dark:border-gray-600"
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

                    <div>
                        {hasPresets ? (
                            <>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Discount
                                </label>
                                <div className="space-y-2">
                                    {PRESET_DISCOUNTS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => handleSelectPreset(preset)}
                                            className="w-full flex items-center justify-between p-3 rounded-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors"
                                        >
                                            <span className="font-medium text-gray-800 dark:text-gray-100">{preset.name}</span>
                                            <span className="text-green-600 dark:text-green-400 font-semibold">
                                                {preset.isPercentage ? `${preset.value}%` : formatCurrency(preset.value)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No preset discounts available</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleApplyDiscount}
                            disabled={!isValidDiscount}
                            className={classNames(
                                "flex-1 py-3 px-4 rounded-sm font-medium transition-colors",
                                isValidDiscount
                                    ? "bg-sky-500 text-white hover:bg-sky-600"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                            )}
                        >
                            Apply
                        </button>
                    </div>
                </>
            </div>
        </Modal>
    )
}

export default MobileDiscountModal
