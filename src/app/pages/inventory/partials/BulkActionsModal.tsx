import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Package, FolderInput, Edit3, Minus, Plus, ClipboardCheck, ArrowLeft, X } from 'lucide-react';
import { Notify } from 'notiflix';
import { Button, Select, Label, Input } from '../../../components';
import { useInventoryActions } from '../../../hooks/useInventoryActions';
import { useIsEBN } from '../../../hooks/useMediaQuery';
import stockMovementService from '../../../services/stock-movement.service';
import { getErrorMessage } from '../../../utils/api-error-handler';

interface BulkActionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: ApiProduct[];
    categories: Category[];
    onSuccess: () => void;
}

type ActionType = 'move-category' | 'bulk-update' | 'adjust-quantity';

interface ActionOption {
    type: ActionType;
    icon: React.ElementType;
    label: string;
    description: string;
    color: string;
    hoverBg: string;
    hoverBorder: string;
}

const ACTION_OPTIONS: ActionOption[] = [
    {
        type: 'move-category',
        icon: FolderInput,
        label: 'Move Category',
        description: 'Change category',
        color: 'text-sky-500 dark:text-sky-400',
        hoverBg: 'hover:bg-sky-50 dark:hover:bg-sky-900/20',
        hoverBorder: 'hover:border-sky-500'
    },
    {
        type: 'bulk-update',
        icon: Edit3,
        label: 'Update Status',
        description: 'Change status',
        color: 'text-purple-600 dark:text-purple-400',
        hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
        hoverBorder: 'hover:border-purple-500'
    },
    {
        type: 'adjust-quantity',
        icon: Package,
        label: 'Adjust Stock',
        description: 'Audited stock movement',
        color: 'text-green-500 dark:text-green-400',
        hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20',
        hoverBorder: 'hover:border-green-500'
    }
];

const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Discontinued', value: 'discontinued' },
    { label: 'Out of Stock', value: 'out_of_stock' }
];

const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
    isOpen,
    onClose,
    selectedItems,
    categories,
    onSuccess
}) => {
    const isEBN = useIsEBN();
    const [actionType, setActionType] = useState<ActionType | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
    const [adjustmentValue, setAdjustmentValue] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [bulkStatus, setBulkStatus] = useState('');

    const { moveToCategory, bulkUpdate, isLoading } = useInventoryActions();

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const resetForm = () => {
        setActionType(null);
        setSelectedCategoryId('');
        setAdjustmentType('add');
        setAdjustmentValue('');
        setAdjustmentReason('');
        setBulkStatus('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleMoveToCategory = async () => {
        if (!selectedCategoryId) return;
        try {
            await moveToCategory({
                itemIds: selectedItems.map(item => item.id),
                categoryId: selectedCategoryId
            });
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Failed to move items:', error);
        }
    };

    const handleBulkUpdate = async () => {
        if (!bulkStatus) return;
        try {
            await bulkUpdate({
                itemIds: selectedItems.map(item => item.id),
                updates: { status: bulkStatus }
            });
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Failed to bulk update:', error);
        }
    };

    const handleAdjustQuantity = async () => {
        const value = parseInt(adjustmentValue);
        if (isNaN(value) || value < 0) return;
        // Reason is required for add/subtract
        if (adjustmentType !== 'set' && !adjustmentReason.trim()) return;
        try {
            for (const item of selectedItems) {
                // Use the default variant ID for quantity adjustments
                const defaultVariant = item.variants?.find(v => v.isDefault) || item.variants?.[0];
                const invId = defaultVariant?.inventory?.inventoryId;
                if (defaultVariant && invId) {
                    if (adjustmentType === 'set') {
                        await stockMovementService.performStockCount({
                            inventoryId: invId,
                            actualQuantity: value,
                            notes: adjustmentReason || undefined,
                        });
                    } else {
                        const signedQty = adjustmentType === 'add' ? value : -value;
                        await stockMovementService.adjustStock({
                            inventoryId: invId,
                            quantity: signedQty,
                            notes: adjustmentReason || 'Bulk adjustment from inventory page',
                        });
                    }
                }
            }
            const actionText = adjustmentType === 'add' ? 'added' : adjustmentType === 'subtract' ? 'subtracted' : 'set';
            Notify.success(`Quantity ${actionText} for ${selectedItems.length} item(s)`);
            onSuccess();
            handleClose();
        } catch (error: any) {
            const msg = getErrorMessage(error, 'Failed to adjust quantities');
            Notify.failure(msg);
        }
    };

    const itemCount = selectedItems.length;
    const itemLabel = itemCount === 1 ? 'item' : 'items';

    const adjustmentButtons = [
        { type: 'add' as const, icon: Plus, label: 'Add Stock', activeClass: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
        { type: 'subtract' as const, icon: Minus, label: 'Remove', activeClass: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
        { type: 'set' as const, icon: ClipboardCheck, label: 'Count', activeClass: 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400' }
    ];

    const renderActionContent = () => {
        const baseSpacing = isEBN ? 'space-y-3' : 'space-y-4';
        const descriptionClass = isEBN
            ? 'text-xs text-gray-600 dark:text-gray-400'
            : 'text-sm text-gray-600 dark:text-gray-400';

        switch (actionType) {
            case 'move-category':
                return (
                    <div className={baseSpacing}>
                        <p className={descriptionClass}>
                            Move {itemCount} {itemLabel} to a different category.
                        </p>
                        <div>
                            <Label className={isEBN ? 'text-xs' : ''}>Select Category</Label>
                            <Select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                className={`mt-1.5 w-full ${isEBN ? 'text-xs' : ''}`}
                            >
                                <option value="">Select category...</option>
                                {categories.map(cat => (
                                    <option key={cat.categoryId} value={cat.categoryId?.toString()}>
                                        {cat.name as string}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
                );

            case 'bulk-update':
                return (
                    <div className={baseSpacing}>
                        <p className={descriptionClass}>
                            Update status for {itemCount} {itemLabel}.
                        </p>
                        <div>
                            <Label className={isEBN ? 'text-xs' : ''}>Select Status</Label>
                            <Select
                                value={bulkStatus}
                                onChange={(e) => setBulkStatus(e.target.value)}
                                className={`mt-1.5 w-full ${isEBN ? 'text-xs' : ''}`}
                            >
                                <option value="">Select status...</option>
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
                );

            case 'adjust-quantity':
                const multiVariantCount = selectedItems.filter(item => (item.variantCount ?? 1) > 1).length;
                const isReasonRequired = adjustmentType !== 'set';

                return (
                    <div className={baseSpacing}>
                        <p className={descriptionClass}>
                            Record a stock movement for {itemCount} {itemLabel} (default variant).
                            This creates an audit trail.
                        </p>

                        {multiVariantCount > 0 && (
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    {multiVariantCount} product{multiVariantCount > 1 ? 's have' : ' has'} multiple variants.
                                    Only the default variant will be adjusted.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-2">
                            {adjustmentButtons.map(({ type, icon: Icon, label, activeClass }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setAdjustmentType(type)}
                                    className={`
                                        flex items-center justify-center gap-1.5 rounded-lg border-2 transition-colors
                                        ${isEBN ? 'py-2 text-xs' : 'py-2.5 text-sm'}
                                        ${adjustmentType === type
                                            ? activeClass
                                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                        }
                                    `}
                                >
                                    <Icon className={isEBN ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div>
                            <Label className={isEBN ? 'text-xs' : ''}>{adjustmentType === 'set' ? 'Actual Quantity on Hand' : 'Quantity'}</Label>
                            <Input
                                type="number"
                                min="0"
                                value={adjustmentValue}
                                onChange={(e) => setAdjustmentValue(e.target.value)}
                                placeholder={adjustmentType === 'set' ? 'Enter counted quantity' : 'Enter quantity'}
                                className={`mt-1.5 w-full ${isEBN ? 'text-xs' : ''}`}
                            />
                        </div>

                        <div>
                            <Label className={isEBN ? 'text-xs' : ''}>
                                Reason {isReasonRequired ? <span className="text-red-500">*</span> : '(optional)'}
                            </Label>
                            <Input
                                type="text"
                                value={adjustmentReason}
                                onChange={(e) => setAdjustmentReason(e.target.value)}
                                placeholder={adjustmentType === 'add' ? 'e.g., Found stock, received donation'
                                    : adjustmentType === 'subtract' ? 'e.g., Theft, breakage, expired'
                                        : 'e.g., Physical stock count'}
                                className={`mt-1.5 w-full ${isEBN ? 'text-xs' : ''}`}
                            />
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="grid grid-cols-3 gap-2">
                        {ACTION_OPTIONS.map(({ type, icon: Icon, label, description, color, hoverBg, hoverBorder }) => (
                            <button
                                key={type}
                                onClick={() => setActionType(type)}
                                className={`
                                    flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 
                                    border-gray-200 dark:border-gray-700 transition-all
                                    ${hoverBorder} ${hoverBg}
                                    ${isEBN ? 'p-3' : 'p-4'}
                                `}
                            >
                                <Icon className={`${color} ${isEBN ? 'w-6 h-6' : 'w-7 h-7'}`} />
                                <span className={`font-medium text-gray-900 dark:text-gray-100 ${isEBN ? 'text-xs' : 'text-sm'}`}>
                                    {label}
                                </span>
                                {!isEBN && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                        {description}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                );
        }
    };

    const getActionButton = () => {
        const buttonConfig = {
            'move-category': { handler: handleMoveToCategory, disabled: !selectedCategoryId, label: 'Move' },
            'bulk-update': { handler: handleBulkUpdate, disabled: !bulkStatus, label: 'Update' },
            'adjust-quantity': {
                handler: handleAdjustQuantity,
                disabled: !adjustmentValue || (adjustmentType !== 'set' && !adjustmentReason.trim()),
                label: adjustmentType === 'set' ? 'Record Count' : 'Apply Adjustment'
            }
        };

        if (!actionType) return null;

        const config = buttonConfig[actionType];
        return (
            <Button
                theme="primary"
                onClick={config.handler}
                disabled={config.disabled || isLoading}
                loading={isLoading}
                size={isEBN ? 'small' : 'regular'}
            >
                {config.label}
            </Button>
        );
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h2 className={`font-semibold text-gray-900 dark:text-white ${isEBN ? 'text-base' : 'text-lg'}`}>
                        Bulk Actions ({itemCount} {itemLabel})
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={isEBN ? 'p-3' : 'p-4'}>
                    {renderActionContent()}
                </div>

                <div className={`flex items-center justify-between border-t border-gray-200 dark:border-gray-700 ${isEBN ? 'px-3 py-2' : 'px-4 py-3'}`}>
                    <div className="flex-shrink-0">
                        {actionType && (
                            <Button
                                theme="neutral"
                                layout="outline"
                                onClick={() => setActionType(null)}
                                size={isEBN ? 'small' : 'regular'}
                            >
                                <ArrowLeft className={isEBN ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5'} />
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            theme="neutral"
                            layout="outline"
                            onClick={handleClose}
                            size={isEBN ? 'small' : 'regular'}
                        >
                            Cancel
                        </Button>
                        {getActionButton()}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default BulkActionsModal;
