import { FunctionComponent } from 'react';
import { FieldArray } from 'formik';
import { Plus, Trash2, Package } from 'lucide-react';
import { Button } from '../../../components';
import FormInput from '../../../components/FormInput';
import ProductSearchSelect from '../../../components/ProductSearchSelect';
import { formatCurrency, calculateTotal } from './helpers';
import type { POFormItem, FormMode } from './types';

interface POItemsFormProps {
    items: POFormItem[];
    formMode: FormMode;
    approvedQtyMap: Map<string, number>;
    requisitionOptionMap: Map<string, { label: string; value: string }>;
}

const emptyItem: POFormItem = { variantId: '', orderedQuantity: 1, unitPrice: 0, notes: '' };

const POItemsForm: FunctionComponent<POItemsFormProps> = ({
    items,
    formMode,
    approvedQtyMap,
    requisitionOptionMap,
}) => (
    <FieldArray name="items">
        {({ push, remove }) => (
            <div className="space-y-4">
                <Button
                    type="button"
                    onClick={() => push({ ...emptyItem })}
                    theme="primary"
                    layout="outline"
                    disabled={formMode === 'create-from-requisition'}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                </Button>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                        <Package className="w-12 h-12 mb-2 opacity-50" />
                        <p>No items added yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Item #{index + 1}
                                    </span>
                                    {formMode === 'create-manual' && items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div className="md:col-span-2">
                                        <ProductSearchSelect
                                            name={`items.${index}.variantId`}
                                            label="Product Variant"
                                            required
                                            disabled={formMode === 'create-from-requisition'}
                                            initialOption={requisitionOptionMap.get(item.variantId) ?? null}
                                        />
                                    </div>
                                    <div>
                                        <FormInput
                                            label="Quantity"
                                            name={`items.${index}.orderedQuantity`}
                                            type="number"
                                            min="1"
                                            max={formMode === 'create-from-requisition' ? approvedQtyMap.get(item.variantId) : undefined}
                                            required
                                            disabled={formMode === 'create-from-requisition'}
                                        />
                                        {formMode === 'create-from-requisition' && approvedQtyMap.has(item.variantId) && (
                                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                                                Approved qty: {approvedQtyMap.get(item.variantId)} (locked)
                                            </p>
                                        )}
                                    </div>
                                    <FormInput
                                        label="Unit Cost (MWK)"
                                        name={`items.${index}.unitPrice`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="mt-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    Subtotal:{' '}
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {formatCurrency((item.orderedQuantity || 0) * (item.unitPrice || 0))}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {items.length > 0 && (
                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="text-lg">
                            <span className="text-gray-600 dark:text-gray-400">Total: </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {formatCurrency(calculateTotal(items))}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        )}
    </FieldArray>
);

export default POItemsForm;
