import { FC, useMemo, useState } from 'react';
import { Button, Badge, Flex, Spinner, Dialog, ScrollArea } from '@radix-ui/themes';
import { Layers, Package, DollarSign, Check, ChevronRight } from 'lucide-react';
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

const METHOD_OPTIONS: { value: CostingMethodType; label: string; short: string }[] = [
    { value: 'WEIGHTED_AVERAGE', label: 'Weighted Average', short: 'WAC' },
    { value: 'FIFO', label: 'First In, First Out', short: 'FIFO' },
    { value: 'LIFO', label: 'Last In, First Out', short: 'LIFO' },
];

const getMethodLabel = (method: CostingMethodType) =>
    METHOD_OPTIONS.find(m => m.value === method)?.label ?? method;

const ValuationDrillDownModal: FC<ValuationDrillDownModalProps> = ({
    isOpen, onClose, item, valuation, costLayers, isLoading, onChangeCostingMethod,
}) => {
    const [isChangingMethod, setIsChangingMethod] = useState(false);
    const [showMethodPicker, setShowMethodPicker] = useState(false);

    const layers = valuation?.costLayers ?? costLayers;

    const currentMethod = valuation?.costingMethod ?? item?.costingMethod ?? 'WEIGHTED_AVERAGE';

    const layerTotals = useMemo(() => ({
        quantity: layers.reduce((sum, l) => sum + l.remainingQuantity, 0),
        value: layers.reduce((sum, l) => sum + l.remainingQuantity * l.unitCost, 0),
    }), [layers]);

    const handleMethodChange = async (newMethod: CostingMethodType) => {
        if (!onChangeCostingMethod || !item || newMethod === currentMethod) {
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

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setShowMethodPicker(false);
            onClose();
        }
    };

    return (
        <Dialog.Root open={isOpen && !!item} onOpenChange={handleOpenChange}>
            <Dialog.Content maxWidth="480px">
                <Dialog.Title>
                    <Flex align="center" gap="3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                            <Layers className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        {item?.productName}
                    </Flex>
                </Dialog.Title>
                <Dialog.Description size="1" color="gray">
                    {item?.sku ? `SKU: ${item.sku}` : 'Item Valuation Detail'}
                </Dialog.Description>

                <ScrollArea scrollbars="vertical" style={{ maxHeight: '60vh' }}>
                    <div className="space-y-5 py-4 pr-3">
                        {isLoading ? (
                            <Flex align="center" justify="center" direction="column" py="9" gap="3">
                                <Spinner size="3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Loading valuation data...</p>
                            </Flex>
                        ) : item && (
                            <>
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

                                {/* Costing Method */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Costing Method
                                        </h3>
                                        {onChangeCostingMethod && (
                                            <Button
                                                variant="ghost"
                                                size="1"
                                                onClick={() => setShowMethodPicker(!showMethodPicker)}
                                                disabled={isChangingMethod}
                                            >
                                                {showMethodPicker ? 'Cancel' : 'Change'}
                                            </Button>
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
                                                            ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700'
                                                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-800'
                                                            } ${isChangingMethod ? 'opacity-60 cursor-wait' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-medium ${isActive ? 'text-cyan-700 dark:text-cyan-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                {label}
                                                            </span>
                                                            <Badge size="1" color="gray" variant="surface">
                                                                {short}
                                                            </Badge>
                                                        </div>
                                                        {isActive ? (
                                                            <Check className="w-4 h-4 text-cyan-500" />
                                                        ) : isChangingMethod ? (
                                                            <Spinner size="1" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                                                ⚠ Changing the method may trigger a cost-layer rebuild.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                                            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                                                {getMethodLabel(currentMethod)}
                                            </span>
                                            <Badge size="1" variant="soft">Active</Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Valuation Comparison */}
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
                                                            ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700'
                                                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-medium ${isActive
                                                                ? 'text-cyan-700 dark:text-cyan-300'
                                                                : 'text-gray-700 dark:text-gray-300'
                                                                }`}>
                                                                {getMethodLabel(method)}
                                                            </span>
                                                            {isActive && (
                                                                <Badge size="1" variant="soft">Active</Badge>
                                                            )}
                                                        </div>
                                                        <span className={`text-sm font-bold ${isActive
                                                            ? 'text-cyan-700 dark:text-cyan-300'
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
                                            <div className="grid grid-cols-4 gap-0 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</span>
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Qty</span>
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Unit Cost</span>
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Date</span>
                                            </div>

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

                                            <div className="grid grid-cols-4 gap-0 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Total</span>
                                                <span className="text-xs font-bold text-gray-900 dark:text-white text-right">
                                                    {layerTotals.quantity.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-gray-400 text-right">—</span>
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right">
                                                    {formatCurrency(layerTotals.value, true)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </ScrollArea>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray" size="2">
                            Close
                        </Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default ValuationDrillDownModal;
