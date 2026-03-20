import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Layers, Loader2, Package, DollarSign, Check, ChevronDown } from 'lucide-react';
import { Button } from '../../../components';
import { formatCurrency } from '../../../utils';

interface ValuationDrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryValuationItem | null;
    valuation: ItemValuation | null;
    costLayers: InventoryCostLayer[];
    isLoading: boolean;
    onChangeCostingMethod?: (inventoryId: string, newMethod: CostingMethodType) => Promise<any>;
}

const METHOD_LABELS: Record<CostingMethodType, string> = {
    WEIGHTED_AVERAGE: 'Weighted Average',
    FIFO: 'First In, First Out',
    LIFO: 'Last In, First Out',
};

const METHOD_OPTIONS: { value: CostingMethodType; label: string; short: string }[] = [
    { value: 'WEIGHTED_AVERAGE', label: 'Weighted Average', short: 'WAC' },
    { value: 'FIFO', label: 'First In, First Out', short: 'FIFO' },
    { value: 'LIFO', label: 'Last In, First Out', short: 'LIFO' },
];

const ValuationDrillDownModal: FC<ValuationDrillDownModalProps> = ({
    isOpen, onClose, item, valuation, costLayers, isLoading, onChangeCostingMethod,
}) => {
    const [isChangingMethod, setIsChangingMethod] = useState(false);
    const [showMethodPicker, setShowMethodPicker] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        setShowMethodPicker(false);
    }, [isOpen, item?.inventoryId]);

    if (!isOpen || !item) return null;

    const layers = valuation?.costLayers ?? costLayers.map(l => ({
        id: l.id,
        remainingQuantity: l.remainingQuantity,
        unitCost: l.unitCost,
        layerDate: l.layerDate,
    }));

    const currentMethod = valuation?.costingMethod ?? item.costingMethod;

    const handleMethodChange = async (newMethod: CostingMethodType) => {
        if (!onChangeCostingMethod || newMethod === currentMethod) {
            setShowMethodPicker(false);
            return;
        }
        setIsChangingMethod(true);
        try {
            await onChangeCostingMethod(item.inventoryId, newMethod);
            setShowMethodPicker(false);
        } catch {
            // Error already shown by hook
        } finally {
            setIsChangingMethod(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                            <Layers className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {item.productName}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.sku ? `SKU: ${item.sku}` : 'Item Valuation Detail'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1 space-y-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loading valuation data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Package className="w-3.5 h-3.5 text-sky-500" />
                                        <span className="text-[10px] uppercase tracking-wider text-sky-500 dark:text-sky-400 font-medium">Quantity</span>
                                    </div>
                                    <p className="text-xl font-bold text-sky-700 dark:text-sky-300">
                                        {(valuation?.availableQuantity ?? item.availableQuantity).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-[10px] uppercase tracking-wider text-emerald-500 dark:text-emerald-400 font-medium">Avg Cost</span>
                                    </div>
                                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                                        {formatCurrency(item.averageCost, true)}
                                    </p>
                                </div>
                            </div>

                            {/* Costing Method Selector */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Costing Method
                                    </h3>
                                    {onChangeCostingMethod && (
                                        <button
                                            onClick={() => setShowMethodPicker(!showMethodPicker)}
                                            disabled={isChangingMethod}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                                        >
                                            {showMethodPicker ? 'Cancel' : 'Change'}
                                        </button>
                                    )}
                                </div>

                                {showMethodPicker ? (
                                    <div className="space-y-1.5">
                                        {METHOD_OPTIONS.map(({ value, label, short }) => {
                                            const isActive = value === currentMethod;
                                            return (
                                                <button
                                                    key={value}
                                                    onClick={() => handleMethodChange(value)}
                                                    disabled={isChangingMethod}
                                                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${isActive
                                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                                                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                                                        } ${isChangingMethod ? 'opacity-60 cursor-wait' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-medium ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {label}
                                                        </span>
                                                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded">
                                                            {short}
                                                        </span>
                                                    </div>
                                                    {isActive ? (
                                                        <Check className="w-4 h-4 text-indigo-500" />
                                                    ) : isChangingMethod ? (
                                                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-gray-300 dark:text-gray-600 -rotate-90" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                                            ⚠ Changing the method may trigger a cost-layer rebuild.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                            {METHOD_LABELS[currentMethod]}
                                        </span>
                                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded">
                                            Active
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Valuation by Method */}
                            {valuation && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Valuation Comparison
                                    </h3>
                                    <div className="space-y-2">
                                        {([
                                            { method: 'WEIGHTED_AVERAGE' as CostingMethodType, value: valuation.weightedAverageValue },
                                            { method: 'FIFO' as CostingMethodType, value: valuation.fifoValue },
                                            { method: 'LIFO' as CostingMethodType, value: valuation.lifoValue },
                                        ]).map(({ method, value }) => {
                                            const isActive = method === currentMethod;
                                            return (
                                                <div
                                                    key={method}
                                                    className={`flex items-center justify-between p-3 rounded-lg border ${isActive
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                                                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-medium ${isActive
                                                            ? 'text-indigo-700 dark:text-indigo-300'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {METHOD_LABELS[method]}
                                                        </span>
                                                        {isActive && (
                                                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm font-bold ${isActive
                                                        ? 'text-indigo-700 dark:text-indigo-300'
                                                        : 'text-gray-900 dark:text-white'
                                                        }`}>
                                                        {formatCurrency(value, true)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Cost Layers */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Cost Layers
                                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1.5">
                                        ({layers.length} active)
                                    </span>
                                </h3>

                                {layers.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                                        No active cost layers for this item.
                                    </p>
                                ) : (
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-4 gap-0 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Qty</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Unit Cost</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Date</span>
                                        </div>

                                        {/* Table Body */}
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-48 overflow-y-auto">
                                            {layers.map((layer, idx) => (
                                                <div key={layer.id} className="grid grid-cols-4 gap-0 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{idx + 1}</span>
                                                    <span className="text-xs font-medium text-gray-900 dark:text-white text-right">
                                                        {layer.remainingQuantity.toLocaleString()}
                                                    </span>
                                                    <span className="text-xs font-medium text-gray-900 dark:text-white text-right">
                                                        {formatCurrency(layer.unitCost, true)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                                        {new Date(layer.layerDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer Totals */}
                                        <div className="grid grid-cols-4 gap-0 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Total</span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white text-right">
                                                {layers.reduce((sum, l) => sum + l.remainingQuantity, 0).toLocaleString()}
                                            </span>
                                            <span className="text-xs text-gray-400 text-right">—</span>
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right">
                                                {formatCurrency(
                                                    layers.reduce((sum, l) => sum + l.remainingQuantity * l.unitCost, 0),
                                                    true
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-5 py-4 border-t border-gray-200 dark:border-gray-700">
                    <Button theme="neutral" layout="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ValuationDrillDownModal;
