import { useState, type FunctionComponent, useEffect } from "react"
import { HiOutlineCurrencyDollar, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi"
import { Percent, Truck, Package, Wrench, MoreHorizontal } from "lucide-react"
import { useInventory } from '../../../hooks/useInventory'
import { Modal } from "../../../components"
import { formatCurrency } from "../../../utils"
import classNames from "classnames"
import { OtherChargeType, OtherCharge } from "../../../store/slices/cartSlice"

type ChargeValueType = 'percentage' | 'amount';

interface ChargeTypeOption {
    type: OtherChargeType;
    label: string;
    icon: React.ReactNode;
    color: string;
}

const CHARGE_TYPES: ChargeTypeOption[] = [
    { type: 'delivery', label: 'Delivery Charge', icon: <Truck className="w-5 h-5" />, color: 'blue' },
    { type: 'packing', label: 'Packing Charge', icon: <Package className="w-5 h-5" />, color: 'purple' },
    { type: 'service', label: 'Service Charge', icon: <Wrench className="w-5 h-5" />, color: 'orange' },
    { type: 'other', label: 'Other Charge', icon: <MoreHorizontal className="w-5 h-5" />, color: 'gray' },
];

interface ChargePreset {
    id: string;
    name: string;
    type: OtherChargeType;
    value: number;
    isPercentage: boolean;
}

// Sample preset charges - in a real app, these would come from settings/database
const PRESET_CHARGES: ChargePreset[] = [
    { id: '1', name: 'Standard Delivery', type: 'delivery', value: 500, isPercentage: false },
    { id: '2', name: 'Express Delivery', type: 'delivery', value: 1000, isPercentage: false },
    { id: '3', name: 'Gift Wrapping', type: 'packing', value: 200, isPercentage: false },
    { id: '4', name: 'Service Fee 5%', type: 'service', value: 5, isPercentage: true },
];

interface OtherChargesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OtherChargesModal: FunctionComponent<OtherChargesModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [selectedChargeType, setSelectedChargeType] = useState<OtherChargeType | null>(null)
    const [chargeValueType, setChargeValueType] = useState<ChargeValueType>('amount')
    const [chargeValue, setChargeValue] = useState<string>('')
    const [customLabel, setCustomLabel] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [showCustomInput, setShowCustomInput] = useState(false)

    const { subtotal, otherCharges, addOtherCharge, removeOtherCharge, clearOtherCharges, cart } = useInventory()

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedChargeType(null)
            setChargeValue('')
            setCustomLabel('')
            setError('')
            setShowCustomInput(false)
        }
    }, [isOpen])

    const calculateChargeAmount = (): number => {
        const value = parseFloat(chargeValue) || 0
        if (chargeValueType === 'percentage') {
            return (subtotal * value) / 100
        }
        return value
    }

    // Calculate total other charges
    const totalOtherCharges = otherCharges.reduce((sum, charge) => {
        const chargeAmount = charge.isPercentage
            ? (subtotal * charge.value) / 100
            : charge.value
        return sum + chargeAmount
    }, 0)

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setChargeValue(value)
            setError('')

            const numValue = parseFloat(value) || 0
            if (chargeValueType === 'percentage' && numValue > 100) {
                setError('Percentage cannot exceed 100%')
            }
        }
    }

    const handleSelectPreset = (preset: ChargePreset) => {
        const newCharge: OtherCharge = {
            id: `${preset.type}-${Date.now()}`,
            type: preset.type,
            label: preset.name,
            value: preset.value,
            isPercentage: preset.isPercentage,
        }
        addOtherCharge(newCharge)
    }

    const handleSelectChargeType = (type: OtherChargeType) => {
        setSelectedChargeType(type)
        setShowCustomInput(true)
        const chargeOption = CHARGE_TYPES.find(c => c.type === type)
        setCustomLabel(chargeOption?.label || '')
    }

    const handleAddCharge = () => {
        if (!selectedChargeType) return

        const value = parseFloat(chargeValue)
        if (isNaN(value) || value <= 0) {
            setError('Please enter a valid amount')
            return
        }

        const newCharge: OtherCharge = {
            id: `${selectedChargeType}-${Date.now()}`,
            type: selectedChargeType,
            label: customLabel || CHARGE_TYPES.find(c => c.type === selectedChargeType)?.label || 'Charge',
            value: value,
            isPercentage: chargeValueType === 'percentage',
        }

        addOtherCharge(newCharge)
        setSelectedChargeType(null)
        setChargeValue('')
        setCustomLabel('')
        setShowCustomInput(false)
    }

    const handleRemoveCharge = (id: string) => {
        removeOtherCharge(id)
    }

    const handleClearAllCharges = () => {
        clearOtherCharges()
    }

    const handleCloseModal = () => {
        setError('')
        onClose()
    }

    const handleBack = () => {
        setSelectedChargeType(null)
        setChargeValue('')
        setCustomLabel('')
        setError('')
        setShowCustomInput(false)
    }

    const previewCharge = calculateChargeAmount()
    const isValidCharge = chargeValue !== '' &&
        parseFloat(chargeValue) > 0 &&
        !error

    const getChargeTypePresets = (type: OtherChargeType) => {
        return PRESET_CHARGES.filter(p => p.type === type)
    }

    const getChargeIcon = (type: OtherChargeType) => {
        return CHARGE_TYPES.find(c => c.type === type)?.icon || <MoreHorizontal className="w-4 h-4" />
    }

    const getChargeColor = (type: OtherChargeType) => {
        const colors: Record<OtherChargeType, string> = {
            delivery: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            packing: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
            service: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
            other: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        }
        return colors[type]
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCloseModal}
            title="Other Charges"
            size="md"
        >
            <div className="space-y-4">
                {otherCharges.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-amber-100 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Charges</span>
                            <button
                                onClick={handleClearAllCharges}
                                className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="space-y-2">
                            {otherCharges.map((charge) => {
                                const chargeAmount = charge.isPercentage
                                    ? (subtotal * charge.value) / 100
                                    : charge.value
                                return (
                                    <div key={charge.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className={classNames("p-1.5 rounded-lg", getChargeColor(charge.type))}>
                                                {getChargeIcon(charge.type)}
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{charge.label}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {charge.isPercentage ? `${charge.value}%` : formatCurrency(charge.value)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                +{formatCurrency(chargeAmount)}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveCharge(charge.id)}
                                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-3 pt-3 border-t border-amber-200 dark:border-gray-500 flex justify-between items-center">
                            <span className="font-medium text-gray-700 dark:text-gray-200">Total Charges</span>
                            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                +{formatCurrency(totalOtherCharges)}
                            </span>
                        </div>
                    </div>
                )}

                {!showCustomInput && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Charge Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {CHARGE_TYPES.map((chargeType) => {
                                const presets = getChargeTypePresets(chargeType.type)
                                return (
                                    <button
                                        key={chargeType.type}
                                        type="button"
                                        onClick={() => handleSelectChargeType(chargeType.type)}
                                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <span className={classNames("p-2 rounded-lg mb-2", getChargeColor(chargeType.type))}>
                                            {chargeType.icon}
                                        </span>
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{chargeType.label}</span>
                                        {presets.length > 0 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {presets.length} preset{presets.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {showCustomInput && selectedChargeType && (
                    <>
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                            <span className={classNames("p-2 rounded-lg", getChargeColor(selectedChargeType))}>
                                {getChargeIcon(selectedChargeType)}
                            </span>
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                    {CHARGE_TYPES.find(c => c.type === selectedChargeType)?.label}
                                </p>
                            </div>
                        </div>

                        {/* Preset Options for Selected Type */}
                        {getChargeTypePresets(selectedChargeType).length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Quick Select
                                </label>
                                <div className="space-y-2">
                                    {getChargeTypePresets(selectedChargeType).map((preset) => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => handleSelectPreset(preset)}
                                            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <span className="font-medium text-gray-800 dark:text-gray-100">{preset.name}</span>
                                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                                {preset.isPercentage ? `${preset.value}%` : formatCurrency(preset.value)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Custom Label */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Charge Label
                            </label>
                            <input
                                type="text"
                                value={customLabel}
                                onChange={(e) => setCustomLabel(e.target.value)}
                                placeholder="Enter charge name"
                                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>

                        {/* Charge Value Type Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Charge Type
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setChargeValueType('amount'); setChargeValue(''); setError(''); }}
                                    className={classNames(
                                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border",
                                        chargeValueType === 'amount'
                                            ? "bg-amber-500 text-white border-amber-500 shadow-md"
                                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    )}
                                >
                                    <HiOutlineCurrencyDollar size={18} />
                                    Fixed Amount
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setChargeValueType('percentage'); setChargeValue(''); setError(''); }}
                                    className={classNames(
                                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border",
                                        chargeValueType === 'percentage'
                                            ? "bg-amber-500 text-white border-amber-500 shadow-md"
                                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    )}
                                >
                                    <Percent size={18} />
                                    Percentage
                                </button>
                            </div>
                        </div>

                        {/* Charge Value Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {chargeValueType === 'percentage' ? 'Percentage' : 'Amount'}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={chargeValue}
                                    onChange={handleValueChange}
                                    placeholder={chargeValueType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                                    className={classNames(
                                        "w-full p-4 text-lg font-semibold bg-white dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
                                        error
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 dark:border-gray-600 focus:ring-amber-500"
                                    )}
                                    autoFocus
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                                    {chargeValueType === 'percentage' ? '%' : 'MK'}
                                </div>
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                            )}
                        </div>

                        {/* No Presets Message */}
                        {getChargeTypePresets(selectedChargeType).length === 0 && (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <HiOutlinePlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No preset charges for this type</p>
                                <p className="text-xs">Enter a custom amount above</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleAddCharge}
                                disabled={!isValidCharge}
                                className={classNames(
                                    "flex-1 py-3 px-4 rounded-lg font-medium transition-colors",
                                    isValidCharge
                                        ? "bg-amber-500 text-white hover:bg-amber-600"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                )}
                            >
                                Add Charge
                            </button>
                        </div>
                    </>
                )}

                {/* Done Button */}
                {!showCustomInput && otherCharges.length > 0 && (
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="w-full py-3 px-4 rounded-lg font-medium bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                    >
                        Done
                    </button>
                )}
            </div>
        </Modal>
    )
}

export default OtherChargesModal
