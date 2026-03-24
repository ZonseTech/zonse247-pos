import { FunctionComponent } from 'react';
import { useFormikContext, FieldArray } from 'formik';
import { Box, Flex, Text, Button as RadixButton, IconButton } from '@radix-ui/themes';
import { Plus, Trash2 } from 'lucide-react';
import { FormFieldCard } from '../../../components';
import FormInput from '../../../components/FormInput';
import FormSearchableSelect from '../../../components/FormSearchableSelect';
import ProductSearchSelect from '../../../components/ProductSearchSelect';
import type { ReturnFormValues } from './types';
import { RETURN_REASONS, EMPTY_ITEM } from './types';
import { formatCurrency, calculateTotal } from './helpers';

const ReturnItemsForm: FunctionComponent = () => {
    const { values } = useFormikContext<ReturnFormValues>();

    return (
        <FormFieldCard title="Return Items">
            <Box p="5">
                <FieldArray name="items">
                    {({ push, remove }) => (
                        <Flex direction="column" gap="4">
                            {values.items.map((_item, index) => (
                                <Box
                                    key={index}
                                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
                                    p="4"
                                >
                                    <Box className="sm:col-span-4">
                                        <ProductSearchSelect
                                            name={`items.${index}.variantId`}
                                            label="Product Variant"
                                            required
                                        />
                                    </Box>
                                    <Box className="sm:col-span-2">
                                        <FormInput
                                            label="Return Qty"
                                            name={`items.${index}.returnQuantity`}
                                            type="number"
                                            placeholder="1"
                                            required
                                        />
                                    </Box>
                                    <Box className="sm:col-span-2">
                                        <FormInput
                                            label="Unit Cost"
                                            name={`items.${index}.unitCost`}
                                            type="number"
                                            placeholder="0.00"
                                            required
                                        />
                                    </Box>
                                    <Box className="sm:col-span-3">
                                        <FormSearchableSelect
                                            label="Reason"
                                            name={`items.${index}.reason`}
                                            options={RETURN_REASONS}
                                            placeholder="Reason..."
                                            isClearable
                                        />
                                    </Box>
                                    <Flex className="sm:col-span-1" align="end" justify="center" pb="1">
                                        {values.items.length > 1 && (
                                            <IconButton
                                                type="button"
                                                variant="ghost"
                                                color="red"
                                                size="2"
                                                onClick={() => remove(index)}
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </IconButton>
                                        )}
                                    </Flex>
                                </Box>
                            ))}

                            <RadixButton
                                type="button"
                                variant="outline"
                                color="orange"
                                size="2"
                                onClick={() => push({ ...EMPTY_ITEM })}
                                className="w-full border-dashed"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </RadixButton>
                        </Flex>
                    )}
                </FieldArray>

                {/* Total */}
                <Flex align="center" justify="between" mt="4" pt="4" className="border-t border-gray-200 dark:border-gray-700">
                    <Text size="2" color="gray">
                        {values.items.length} item(s)
                    </Text>
                    <Text size="4" weight="bold">
                        Total: {formatCurrency(calculateTotal(values.items))}
                    </Text>
                </Flex>
            </Box>
        </FormFieldCard>
    );
};

export default ReturnItemsForm;
