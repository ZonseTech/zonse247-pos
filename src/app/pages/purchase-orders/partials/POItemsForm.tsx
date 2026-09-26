import { FunctionComponent } from 'react';
import { FieldArray, useField } from 'formik';
import { Plus, Trash2, Package } from 'lucide-react';
import { Button, Table, TextField, IconButton, Tooltip, Flex, Text, Box } from '@radix-ui/themes';
import ProductSearchSelect from '../../../components/ProductSearchSelect';
import TableEmptyState from '../../../components/TableEmptyState';
import { formatCurrency, calculateTotal } from './helpers';
import type { POFormItem, FormMode } from './types';

interface POItemsFormProps {
    items: POFormItem[];
    formMode: FormMode;
    /** Per variant, the approved quantity still to be ordered when creating from a requisition. */
    outstandingQtyMap: Map<string, number>;
    requisitionOptionMap: Map<string, { label: string; value: string }>;
}

const emptyItem: POFormItem = { variantId: '', orderedQuantity: 1, unitPrice: 0, notes: '' };

interface CellNumberInputProps {
    name: string;
    min?: number;
    max?: number;
    step?: string;
    disabled?: boolean;
}

/** Compact numeric input for a table cell — no own label, the column header labels it. */
const CellNumberInput: FunctionComponent<CellNumberInputProps> = ({ name, min, max, step, disabled }) => {
    const [field, meta] = useField({ name, type: 'number' });
    const hasError = meta.touched && !!meta.error;
    const displayValue = field.value === 0 || field.value === '0' ? '' : field.value ?? '';

    return (
        <Box>
            <TextField.Root
                {...field}
                value={displayValue}
                type="number"
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                color={hasError ? 'red' : undefined}
                size="2"
            />
            {hasError && (
                <Text as="p" size="1" color="red" mt="1">
                    {meta.error}
                </Text>
            )}
        </Box>
    );
};

const POItemsForm: FunctionComponent<POItemsFormProps> = ({
    items,
    formMode,
    outstandingQtyMap,
    requisitionOptionMap,
}) => (
    <FieldArray name="items">
        {({ push, remove }) => (
            <Flex direction="column" gap="4">
                <Box>
                    <Button
                        type="button"
                        onClick={() => push({ ...emptyItem })}
                        variant="outline"
                        disabled={formMode === 'create-from-requisition'}
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </Button>
                </Box>

                {items.length === 0 ? (
                    <TableEmptyState
                        icon={<Package />}
                        title="No items added yet"
                        description="Add an item to start building this purchase order."
                    />
                ) : (
                    <Table.Root variant="surface" layout="auto">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeaderCell>Item</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell width="120px">Quantity</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell width="160px">Unit Cost</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell width="140px">Line Total</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell width="60px" justify="end">Action</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {items.map((item, index) => {
                                const outstandingQty = outstandingQtyMap.get(item.variantId);
                                const canRemove = formMode === 'create-manual' && items.length > 1;

                                return (
                                    <Table.Row key={index} align="center">
                                        <Table.RowHeaderCell>
                                            <Box minWidth="260px">
                                                <ProductSearchSelect
                                                    name={`items.${index}.variantId`}
                                                    label=""
                                                    disabled={formMode === 'create-from-requisition'}
                                                    initialOption={requisitionOptionMap.get(item.variantId) ?? null}
                                                />
                                            </Box>
                                        </Table.RowHeaderCell>

                                        <Table.Cell>
                                            <CellNumberInput
                                                name={`items.${index}.orderedQuantity`}
                                                min={1}
                                                max={formMode === 'create-from-requisition' ? outstandingQty : undefined}
                                                disabled={formMode === 'create-from-requisition'}
                                            />
                                            {formMode === 'create-from-requisition' && outstandingQty !== undefined && (
                                                <Text as="p" size="1" color="iris" mt="1">
                                                    Outstanding: {outstandingQty}
                                                </Text>
                                            )}
                                        </Table.Cell>

                                        <Table.Cell>
                                            <CellNumberInput
                                                name={`items.${index}.unitPrice`}
                                                min={0}
                                                step="0.01"
                                            />
                                        </Table.Cell>

                                        <Table.Cell>
                                            <Text size="2" weight="medium">
                                                {formatCurrency((item.orderedQuantity || 0) * (item.unitPrice || 0))}
                                            </Text>
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
                )}

                {items.length > 0 && (
                    <Flex justify="end" pt="4" className="border-t border-gray-200 dark:border-gray-600">
                        <Text size="4">
                            <Text color="gray">Total: </Text>
                            <Text weight="bold">{formatCurrency(calculateTotal(items))}</Text>
                        </Text>
                    </Flex>
                )}
            </Flex>
        )}
    </FieldArray>
);

export default POItemsForm;
