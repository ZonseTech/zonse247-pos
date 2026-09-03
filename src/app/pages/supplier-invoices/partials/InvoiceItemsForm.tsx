import { FunctionComponent } from 'react';
import { FieldArray, useFormikContext, useField } from 'formik';
import { Plus, Trash2, Package } from 'lucide-react';
import { Box, Button, Flex, IconButton, Table, Text, TextField, Tooltip } from '@radix-ui/themes';
import ProductSearchSelect from '../../../components/ProductSearchSelect';
import { TableEmptyState } from '../../../components';
import { formatCurrency, calculateSubtotal } from './helpers';
import { EMPTY_ITEM, type InvoiceFormValues } from './types';
import InvoiceTotals from './InvoiceTotals';

interface InvoiceItemsFormProps {
    variantLabels: Record<string, string>;
}

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
                min={step ? 0 : 1}
                step={step}
                color={hasError ? 'red' : undefined}
                size="2"
            />
            {hasError && <Text as="p" size="1" color="red" mt="1">{meta.error}</Text>}
        </Box>
    );
};

const InvoiceItemsForm: FunctionComponent<InvoiceItemsFormProps> = ({ variantLabels }) => {
    const { values } = useFormikContext<InvoiceFormValues>();

    return (
        <FieldArray name="items">
            {({ push, remove }) => (
                <Flex direction="column" gap="4">
                    <Box>
                        <Button type="button" variant="outline" onClick={() => push({ ...EMPTY_ITEM })}>
                            <Plus className="w-4 h-4" />
                            Add Item
                        </Button>
                    </Box>

                    {values.items.length === 0 ? (
                        <TableEmptyState
                            icon={<Package />}
                            title="No items added yet"
                            description="Link a PO above to auto-populate items, or add manually."
                        />
                    ) : (
                        <Table.Root variant="surface" layout="auto">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell>Item</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell width="110px">Quantity</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell width="140px">Unit Price</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell width="140px" justify="end">Subtotal</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell width="60px" justify="end">Action</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {values.items.map((item, index) => {
                                    const canRemove = values.items.length > 1;
                                    return (
                                        <Table.Row key={index} align="center">
                                            <Table.RowHeaderCell>
                                                <Box minWidth="220px">
                                                    <ProductSearchSelect
                                                        name={`items.${index}.variantId`}
                                                        label=""
                                                        required
                                                        initialOption={
                                                            item.variantId && variantLabels[item.variantId]
                                                                ? { label: variantLabels[item.variantId], value: item.variantId }
                                                                : null
                                                        }
                                                    />
                                                </Box>
                                            </Table.RowHeaderCell>
                                            <Table.Cell>
                                                <CellNumberInput name={`items.${index}.quantity`} />
                                            </Table.Cell>
                                            <Table.Cell>
                                                <CellNumberInput name={`items.${index}.unitPrice`} step="0.01" />
                                            </Table.Cell>
                                            <Table.Cell justify="end">
                                                <Text size="2" weight="medium">
                                                    {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
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

                    {values.items.length > 0 && (
                        <InvoiceTotals
                            subtotal={calculateSubtotal(values.items)}
                            taxAmount={Number(values.taxAmount) || 0}
                            discountAmount={Number(values.discountAmount) || 0}
                            total={calculateSubtotal(values.items) + Number(values.taxAmount || 0) - Number(values.discountAmount || 0)}
                        />
                    )}
                </Flex>
            )}
        </FieldArray>
    );
};

export default InvoiceItemsForm;
