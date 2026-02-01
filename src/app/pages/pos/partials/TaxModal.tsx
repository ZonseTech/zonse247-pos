import { useState, type FunctionComponent, useEffect } from "react"
import { Receipt } from "lucide-react"
import { useInventory } from '../../../hooks/useInventory'
import { Modal } from "../../../components"
import classNames from "classnames"

interface TaxPreset {
    id: string;
    name: string;
    value: number;
}

const PRESET_TAXES: TaxPreset[] = [
    { id: '1', name: 'VAT 16.5%', value: 16.5 },
    { id: '2', name: 'VAT 10%', value: 10 },
    { id: '3', name: 'Service Tax 5%', value: 5 },
];

interface TaxModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TaxModal: FunctionComponent<TaxModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [taxValue, setTaxValue] = useState<string>('')
    const [taxName, setTaxName] = useState<string>('')
    const [error, setError] = useState<string>('')

    const { tax, taxName: currentTaxName, setTax } = useInventory()

    useEffect(() => {
        if (isOpen) {
            if (tax > 0) {
                setTaxValue(tax.toString())
                setTaxName(currentTaxName || '')
            } else {
                setTaxValue('')
                setTaxName('')
            }
            setError('')
        }
    }, [isOpen, tax, currentTaxName])

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setTaxValue(value)
            setError('')

            const numValue = parseFloat(value) || 0
            if (numValue > 100) {
                setError('Percentage cannot exceed 100%')
            }
        }
    }

    const handleSelectPreset = (preset: TaxPreset) => {
        setTax(preset.value, preset.name)
        onClose()
    }

    const handleApplyTax = () => {
        const value = parseFloat(taxValue) || 0

        if (value < 0) {
            setError('Tax cannot be negative')
            return
        }

        if (value > 100) {
            setError('Percentage cannot exceed 100%')
            return
        }

        if (!taxName.trim()) {
            setError('Please enter a tax name')
            return
        }

        setTax(value, taxName.trim())
        onClose()
    }

    const handleCloseModal = () => {
        setError('')
        onClose()
    }

    const isValidTax = taxValue !== '' &&
        parseFloat(taxValue) >= 0 &&
        parseFloat(taxValue) <= 100 &&
        taxName.trim() !== '' &&
        !error

    const hasPresets = PRESET_TAXES.length > 0

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCloseModal}
            title="Add Tax"
            size="md"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tax Name
                    </label>
                    <input
                        type="text"
                        value={taxName}
                        onChange={(e) => { setTaxName(e.target.value); setError(''); }}
                        placeholder="e.g. VAT, Service Tax"
                        className="w-full p-3.5 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm transition-all duration-200 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tax Percentage
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="decimal"
                            value={taxValue}
                            onChange={handleValueChange}
                            placeholder="Enter percentage"
                            className={classNames(
                                "w-full p-3.5 text-sm font-semibold bg-white dark:bg-gray-700 border rounded-sm transition-all duration-200 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
                                error
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-sky-500"
                            )}
                            autoFocus
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                            %
                        </div>
                    </div>
                    {error && (
                        <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
                    )}
                </div>

                <div>
                    {hasPresets ? (
                        <>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Tax Rate
                            </label>
                            <div className="space-y-2">
                                {PRESET_TAXES.map((preset) => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handleSelectPreset(preset)}
                                        className="w-full flex items-center justify-between p-3 rounded-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <span className="font-medium text-gray-800 dark:text-gray-100">{preset.name}</span>
                                        <span className="text-sky-500 dark:text-sky-400 font-semibold">
                                            {preset.value}%
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No preset taxes available</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleApplyTax}
                        disabled={!isValidTax}
                        className={classNames(
                            "flex-1 py-3 px-4 rounded-sm font-medium transition-colors",
                            isValidTax
                                ? "bg-sky-500 text-white hover:bg-sky-500"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        )}
                    >
                        Apply Tax
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default TaxModal
