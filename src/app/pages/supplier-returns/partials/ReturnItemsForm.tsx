import { FunctionComponent } from 'react';
import { useFormikContext, FieldArray, useField } from 'formik';
import { Box, Flex, Text, Button as RadixButton, IconButton, Table, TextField, Tooltip } from '@radix-ui/themes';
import { Plus, Trash2 } from 'lucide-react';
import { FormFieldCard } from '../../../components';
import FormSearchableSelect from '../../../components/FormSearchableSelect';
import ProductSearchSelect from '../../../components/ProductSearchSelect';
import type { ReturnFormValues } from './types';
import { RETURN_REASONS, EMPTY_ITEM } from './types';
import { formatCurrency, calculateTotal } from './helpers';

const CellNumberInput: FunctionComponent<{ name: string; step?: string }> = ({ name, step }) => {
    const [field, meta] = useField({ name, type: 'number' });
    const hasError = meta.touched && !!meta.error;
    const displayValue = field.value === 0 || field.value === '0' ? '' : field.value ?? '';

    return (
        <Box>
            <TextField.Root
                {...field}
                value={displayValue}
                type="number"
                min={0}
                step={step}
                color={hasError ? 'red' : undefined}
                size="2"
            />
            {hasError && <Text as="p" size="1" color="red" mt="1">{meta.error}</Text>}
        </Box>
    );
};

const ReturnItemsForm: FunctionComponent = () => {
    const { values } = useFormikContext<ReturnFormValues>();

    return (
        <FormFieldCard title="Return Items">
            <Box p="5">
                <FieldArray name="items">
                    {({ push, remove }) => (
                        <Flex direction="column" gap="4">
                            <Table.Root variant="surface" layout="auto">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell width="110px">Return Qty</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell width="130px">Unit Cost</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell width="160px">Reason</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell width="60px" justify="end">Action</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {values.items.map((item, index) => {
                                        const canRemove = values.items.length > 1;
                                        return (
                                            <Table.Row key={`${index}-${item.variantId}`} align="center">
                                                <Table.RowHeaderCell>
                                                    <Box minWidth="220px">
                                                        <ProductSearchSelect
                                                            name={`items.${index}.variantId`}
                                                            label=""
                                                            required
                                                            initialOption={
                                                                item.variantId && item.displayName
                                                                    ? { label: item.displayName, value: item.variantId }
                                                                    : null
                                                            }
                                                        />
                                                    </Box>
                                                </Table.RowHeaderCell>
                                                <Table.Cell>
                                                    <CellNumberInput name={`items.${index}.returnQuantity`} />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <CellNumberInput name={`items.${index}.unitCost`} step="0.01" />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <FormSearchableSelect
                                                        label=""
                                                        name={`items.${index}.reason`}
                                                        options={RETURN_REASONS}
                                                        placeholder="Reason..."
                                                        isClearable
                                                    />
                                                </Table.Cell>
                                                <Table.Cell justify="end">
                                                    <Tooltip content={canRemove ? 'Remove item' : 'Cannot remove'}>
                                                        <IconButton
                                                            type="button"
                                                            variant="ghost"
                                                            color="red"
                                                            size="1"
                                                            disabled={!canRemove}
                                                            onClick={() => remove(index)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Table.Cell>
                                            </Table.Row>
                                        );
                                    })}
                                </Table.Body>
                            </Table.Root>

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
