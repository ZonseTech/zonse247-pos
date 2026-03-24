import { FunctionComponent } from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { Plus, Trash2, Package } from 'lucide-react';
import { Flex, Text } from '@radix-ui/themes';
import { Button } from '../../../components';
import FormInput from '../../../components/FormInput';
import ProductSearchSelect from '../../../components/ProductSearchSelect';
import { formatCurrency, calculateSubtotal } from './helpers';
import { EMPTY_ITEM, type InvoiceFormValues } from './types';
import InvoiceTotals from './InvoiceTotals';

interface InvoiceItemsFormProps {
    variantLabels: Record<string, string>;
}

const InvoiceItemsForm: FunctionComponent<InvoiceItemsFormProps> = ({ variantLabels }) => {
    const { values } = useFormikContext<InvoiceFormValues>();

    return (
        <FieldArray name="items">
            {({ push, remove }) => (
                <div className="space-y-4">
                    <Button
                        type="button"
                        onClick={() => push({ ...EMPTY_ITEM })}
                        theme="primary"
                        layout="outline"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>

                    {values.items.length === 0 ? (
                        <Flex direction="column" align="center" justify="center" py="8">
                            <Package className="w-12 h-12 mb-2 opacity-50 text-gray-400" />
                            <Text size="2" color="gray">No items added yet</Text>
                            <Text size="1" color="gray" mt="1">
                                Link a PO above to auto-populate items, or add manually.
                            </Text>
                        </Flex>
                    ) : (
                        <div className="space-y-3">
                            {values.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                >
                                    <Flex justify="between" align="center" mb="3">
                                        <Text size="2" weight="medium" color="gray">
                                            Item #{index + 1}
                                        </Text>
                                        {values.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </Flex>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div className="md:col-span-2">
                                            <ProductSearchSelect
                                                name={`items.${index}.variantId`}
                                                label="Product Variant"
                                                required
                                                initialOption={
                                                    item.variantId && variantLabels[item.variantId]
                                                        ? { label: variantLabels[item.variantId], value: item.variantId }
                                                        : null
                                                }
                                            />
                                        </div>
                                        <FormInput
                                            label="Quantity"
                                            name={`items.${index}.quantity`}
                                            type="number"
                                            min="1"
                                            required
                                        />
                                        <FormInput
                                            label="Unit Price (MWK)"
                                            name={`items.${index}.unitPrice`}
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <Flex justify="end" mt="2">
                                        <Text size="2" color="gray">
                                            Subtotal:{' '}
                                            <Text as="span" weight="medium">
                                                {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                                            </Text>
                                        </Text>
                                    </Flex>
                                </div>
                            ))}
                        </div>
                    )}

                    {values.items.length > 0 && (
                        <InvoiceTotals
                            subtotal={calculateSubtotal(values.items)}
                            taxAmount={Number(values.taxAmount) || 0}
                            discountAmount={Number(values.discountAmount) || 0}
                            total={calculateSubtotal(values.items) + Number(values.taxAmount || 0) - Number(values.discountAmount || 0)}
                        />
                    )}
                </div>
            )}
        </FieldArray>
    );
};

export default InvoiceItemsForm;
