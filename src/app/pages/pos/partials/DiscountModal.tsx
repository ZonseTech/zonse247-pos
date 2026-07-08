import { useState, useRef, type FunctionComponent, useEffect } from "react"
import * as Dialog from '@radix-ui/react-dialog'
import { Box, Flex, Text, Theme } from '@radix-ui/themes'
import { Percent, Tag, X } from "lucide-react"
import { useInventory } from '../../../hooks/useInventory'
import { formatCurrency } from "../../../utils"
import classNames from "classnames"

type DiscountType = 'percentage' | 'amount'

interface DiscountModalProps {
    isOpen: boolean
    onClose: () => void
}

const DiscountModal: FunctionComponent<DiscountModalProps> = ({ isOpen, onClose }) => {
    const [discountType, setDiscountType] = useState<DiscountType>('amount')
    const [discountValue, setDiscountValue] = useState<string>('')
    const [error, setError] = useState<string>('')

    const { subtotal, discount, discountIsPercentage, setDiscount, cart } = useInventory()

    useEffect(() => {
        if (isOpen) {
            if (discount > 0) {
                setDiscountType(discountIsPercentage ? 'percentage' : 'amount')
                setDiscountValue(discount.toString())
            } else {
                setDiscountType('amount')
                setDiscountValue('')
            }
            setError('')
        }
    }, [isOpen, discount, discountIsPercentage])

    const calculateDiscountAmount = (): number => {
        const value = parseFloat(discountValue) || 0
        return discountType === 'percentage' ? (subtotal * value) / 100 : value
    }

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setDiscountValue(value)
            setError('')
            const num = parseFloat(value) || 0
            if (discountType === 'percentage' && num > 100) {
                setError('Percentage cannot exceed 100%')
            } else if (discountType === 'amount' && num > subtotal) {
                setError('Discount cannot exceed subtotal')
            }
        }
    }

    const handleApplyDiscount = () => {
        const discountAmount = calculateDiscountAmount()
        if (discountAmount < 0) { setError('Discount cannot be negative'); return }
        if (discountAmount > subtotal) { setError('Discount cannot exceed subtotal'); return }
        setDiscount(parseFloat(discountValue) || 0, discountType === 'percentage')
        onClose()
    }

    const handleClearDiscount = () => {
        setDiscount(0, false)
        setDiscountValue('')
        setError('')
        onClose()
    }

    const handleTypeChange = (type: DiscountType) => {
        setDiscountType(type)
        setDiscountValue('')
        setError('')
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    const handleQuickPercent = (percent: number) => {
        setDiscountType('percentage')
        setDiscountValue(percent.toString())
        setError('')
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    const inputRef = useRef<HTMLInputElement>(null)

    const previewDiscount = calculateDiscountAmount()
    const newTotal = subtotal - previewDiscount
    const isValidDiscount =
        discountValue !== '' &&
        parseFloat(discountValue) >= 0 &&
        previewDiscount <= subtotal &&
        !error

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Theme appearance="inherit" accentColor="sky">
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                    <Dialog.Content
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl overflow-hidden outline-none"
                        onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus() }}
                    >

                        {/* Header */}
                        <Flex align="center" justify="between" px="4" py="3">
                            <Dialog.Title asChild>
                                <Text size="3" weight="bold" className="text-gray-900 dark:text-white">
                                    Apply Discount
                                </Text>
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <X size={16} />
                                </button>
                            </Dialog.Close>
                        </Flex>

                        <Box px="4" pb="4">
                            <Flex direction="column" gap="3">

                                {/* Subtotal row */}
                                <Flex justify="between" align="center">
                                    <Text size="2" color="gray">
                                        Subtotal · {cart.length} {cart.length === 1 ? 'item' : 'items'}
                                    </Text>
                                    <Text size="3" weight="bold" className="text-gray-900 dark:text-white">
                                        {formatCurrency(subtotal)}
                                    </Text>
                                </Flex>

                                {/* Type toggle — segmented control */}
                                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1">
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('amount')}
                                        className={classNames(
                                            "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium transition-colors",
                                            discountType === 'amount'
                                                ? "bg-sky-500 text-white shadow-sm"
                                                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        )}
                                    >
                                        <Tag size={13} />
                                        Fixed Amount
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('percentage')}
                                        className={classNames(
                                            "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium transition-colors",
                                            discountType === 'percentage'
                                                ? "bg-sky-500 text-white shadow-sm"
                                                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        )}
                                    >
                                        <Percent size={13} />
                                        Percentage
                                    </button>
                                </div>

                                {/* Quick percent chips */}
                                {discountType === 'percentage' && (
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {[5, 10, 15, 20, 25, 30, 40, 50].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => handleQuickPercent(p)}
                                                className={classNames(
                                                    "py-1.5 text-xs font-medium transition-colors",
                                                    discountValue === p.toString()
                                                        ? "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400"
                                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                )}
                                            >
                                                {p}%
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={discountValue}
                                        onChange={handleValueChange}
                                        ref={inputRef}
                                        placeholder={discountType === 'percentage' ? '0' : '0.00'}
                                        className={classNames(
                                            "w-full px-3 py-2.5 pr-12 text-lg font-semibold border-0 outline-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors",
                                            error
                                                ? "focus:bg-red-50 dark:focus:bg-red-900/20"
                                                : "focus:bg-gray-200 dark:focus:bg-gray-700"
                                        )}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 dark:text-gray-500 pointer-events-none">
                                        {discountType === 'percentage' ? '%' : 'MK'}
                                    </span>
                                </div>

                                {error && (
                                    <Text size="1" className="text-red-500 -mt-1">{error}</Text>
                                )}

                                {/* Preview */}
                                {discountValue && !error && (
                                    <Box className="bg-gray-50 dark:bg-gray-800" px="3" py="2">
                                        <Flex justify="between" align="center" mb="1">
                                            <Text size="1" color="gray">Discount</Text>
                                            <Text size="1" className="text-green-600 dark:text-green-400 font-medium">
                                                -{formatCurrency(previewDiscount)}
                                                {discountType === 'percentage' && ` (${discountValue}%)`}
                                            </Text>
                                        </Flex>
                                        <Flex justify="between" align="center">
                                            <Text size="2" weight="medium" className="text-gray-700 dark:text-gray-200">New Total</Text>
                                            <Text size="3" weight="bold" className="text-gray-900 dark:text-white">{formatCurrency(newTotal)}</Text>
                                        </Flex>
                                    </Box>
                                )}

                                {/* Active discount badge */}
                                {discount > 0 && (
                                    <Flex align="center" justify="between" className="bg-sky-50 dark:bg-sky-500/10 px-3 py-2">
                                        <Text size="1" className="text-sky-700 dark:text-sky-400">Active discount</Text>
                                        <Text size="1" weight="medium" className="text-sky-700 dark:text-sky-400">
                                            -{formatCurrency(discount)}
                                        </Text>
                                    </Flex>
                                )}

                            </Flex>
                        </Box>

                        {/* Footer actions */}
                        <div className="flex gap-2 px-4 pb-4">
                            {discount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearDiscount}
                                    className="flex-1 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors outline-none"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className={classNames(
                                    "py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors outline-none",
                                    discount > 0 ? "px-4" : "flex-1"
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyDiscount}
                                disabled={!isValidDiscount || cart.length === 0}
                                className="flex-[2] py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 dark:disabled:text-gray-500 transition-colors outline-none disabled:cursor-not-allowed"
                            >
                                Apply
                            </button>
                        </div>

                    </Dialog.Content>
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default DiscountModal
