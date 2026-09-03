import * as Yup from 'yup';
import { Form, Formik, FieldArray, useField } from 'formik';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Trash2, Package } from 'lucide-react';
import { Notify, Report } from 'notiflix';
import {
    Badge,
    Box,
    Button,
    Flex,
    Table,
    Text,
    TextField,
    IconButton,
    Tooltip,
} from '@radix-ui/themes';
import FormModal from '../../../components/FormModal';
import TextInput from '../../../components/TextInput';
import ProductSearchSelect, {
    formatProductLabel,
} from '../../../components/ProductSearchSelect';
import SupplierSearchSelect, {
    formatSupplierLabel,
} from '../../../components/SupplierSearchSelect';
import { FormFieldCard, TableEmptyState } from '../../../components';
import { usePurchaseRequisitions } from '../../../hooks/usePurchaseRequisitions';
import { getErrorMessage } from '../../../utils/api-error-handler';

const statusBadgeColor: Record<
    RequisitionStatusType,
    'amber' | 'green' | 'sky' | 'red' | 'gray'
> = {
    PENDING: 'amber',
    APPROVED: 'green',
    PARTIALLY_APPROVED: 'sky',
    REJECTED: 'red',
    CANCELLED: 'gray',
};

const statusLabel: Record<RequisitionStatusType, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    PARTIALLY_APPROVED: 'Partially Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
};

const defaultValues = {
    supplierId: '',
    notes: '',
    items: [{ variantId: '', requestedQuantity: 1, notes: '' }],
};

const validationSchema = Yup.object().shape({
    notes: Yup.string().max(1000, 'Notes are too long'),
    items: Yup.array()
        .of(
            Yup.object().shape({
                variantId: Yup.string().required('Product/Variant is required'),
                requestedQuantity: Yup.number()
                    .required('Quantity is required')
                    .min(1, 'Quantity must be at least 1'),
                notes: Yup.string().max(500, 'Notes are too long'),
            }),
        )
        .min(1, 'At least one item is required'),
});

interface CellNumberInputProps {
    name: string;
    disabled?: boolean;
}

const CellNumberInput: FunctionComponent<CellNumberInputProps> = ({
    name,
    disabled,
}) => {
    const [field, meta] = useField({ name, type: 'number' });
    const hasError = meta.touched && !!meta.error;
    const displayValue =
        field.value === 0 || field.value === '0' ? '' : (field.value ?? '');

    return (
        <Box>
            <TextField.Root
                {...field}
                value={displayValue}
                type="number"
                min={1}
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

const CellTextInput: FunctionComponent<{
    name: string;
    disabled?: boolean;
    placeholder?: string;
}> = ({ name, disabled, placeholder }) => {
    const [field] = useField({ name });
    return (
        <TextField.Root
            {...field}
            value={field.value ?? ''}
            disabled={disabled}
            placeholder={placeholder}
            size="2"
        />
    );
};

interface RequisitionFormModalProps {
    requisitionId?: string;
    editMode?: boolean;
    onClose: () => void;
    onSaved: () => void;
}

const RequisitionFormModal: FunctionComponent<RequisitionFormModalProps> = ({
    requisitionId,
    editMode = false,
    onClose,
    onSaved,
}) => {
    const { create, updateRequisition, getById } = usePurchaseRequisitions();

    const [isEditing, setIsEditing] = useState(editMode);
    const isViewMode = !!requisitionId && !isEditing;

    const [loading, setLoading] = useState(false);
    const [requisition, setRequisition] =
        useState<PurchaseRequisitionWithItems | null>(null);

    useEffect(() => {
        if (!requisitionId) return;
        setLoading(true);
        getById(requisitionId)
            .then((data) => {
                if (data) setRequisition(data);
            })
            .catch((error) =>
                Notify.failure(
                    getErrorMessage(
                        error,
                        'Failed to load requisition details',
                    ),
                ),
            )
            .finally(() => setLoading(false));
    }, [requisitionId]);

    const getInitialOptionForItem = useCallback(
        (variantId: string) => {
            if (!requisition) return null;
            const reqItem = requisition.items.find(
                (i) => i.variantId === variantId,
            );
            if (!reqItem?.variant) return null;
            return {
                label: formatProductLabel({
                    name: reqItem.variant.product?.name || '',
                    variantName: reqItem.variant.variantName || '',
                    sku: reqItem.variant.sku,
                }),
                value: reqItem.variantId,
            };
        },
        [requisition],
    );

    const getInitialOptionForSupplier = useCallback(() => {
        if (!requisition?.supplier) return null;
        return {
            label: formatSupplierLabel(requisition.supplier),
            value: requisition.supplierId!,
        };
    }, [requisition]);

    const initialValues = requisition
        ? {
              supplierId: requisition.supplierId || '',
              notes: requisition.notes || '',
              items: requisition.items.map((item) => ({
                  variantId: item.variantId,
                  requestedQuantity: item.requestedQuantity,
                  notes: item.notes || '',
              })),
          }
        : defaultValues;

    const canEdit =
        !requisitionId || (isEditing && requisition?.status === 'PENDING');

    const handleSubmit = async (values: typeof defaultValues) => {
        if (isViewMode) return;

        setLoading(true);
        try {
            const payload: CreateRequisitionInput = {
                supplierId: values.supplierId || undefined,
                notes: values.notes || undefined,
                items: values.items.map((item) => ({
                    variantId: item.variantId,
                    requestedQuantity: Number(item.requestedQuantity),
                    notes: item.notes || undefined,
                })),
            };

            if (isEditing && requisitionId) {
                await updateRequisition(
                    requisitionId,
                    payload as UpdateRequisitionInput,
                );
                Notify.success('Requisition updated successfully');
            } else {
                await create(payload);
                Notify.success('Purchase requisition created successfully');
            }
            onSaved();
            onClose();
        } catch (error: any) {
            Report.failure(
                'Error',
                getErrorMessage(error, 'Failed to save requisition'),
                'Okay',
            );
        } finally {
            setLoading(false);
        }
    };

    const title = isViewMode
        ? `Requisition${requisition?.requisitionNumber ? ` — ${requisition.requisitionNumber}` : ''}`
        : isEditing
          ? `Edit Requisition${requisition?.requisitionNumber ? ` — ${requisition.requisitionNumber}` : ''}`
          : 'New Purchase Requisition';

    if (loading && !requisition && requisitionId) {
        return (
            <FormModal
                open
                onOpenChange={(open) => {
                    if (!open) onClose();
                }}
                title={title}
                size="xl"
            >
                <Flex align="center" justify="center" className="h-64">
                    <Text color="gray">Loading requisition details...</Text>
                </Flex>
            </FormModal>
        );
    }

    return (
        <Formik
            onSubmit={handleSubmit}
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
        >
            {({ isSubmitting, values }) => (
                <FormModal
                    open
                    onOpenChange={(open) => {
                        if (!open) onClose();
                    }}
                    title={title}
                    size="xl"
                    footer={
                        <Flex justify="end" gap="3" width="100%">
                            <Dialog.Close asChild>
                                <Button
                                    type="button"
                                    variant="soft"
                                    color="gray"
                                >
                                    {isViewMode ? 'Close' : 'Cancel'}
                                </Button>
                            </Dialog.Close>
                            {isViewMode &&
                                requisition?.status === 'PENDING' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Requisition
                                    </Button>
                                )}
                            {canEdit && !isViewMode && (
                                <Button
                                    type="submit"
                                    form="requisition-form"
                                    disabled={isSubmitting || loading}
                                    loading={isSubmitting || loading}
                                >
                                    {isEditing
                                        ? 'Update Requisition'
                                        : 'Create Requisition'}
                                </Button>
                            )}
                        </Flex>
                    }
                >
                    <Form id="requisition-form">
                        <Flex direction="column" gap="4">
                            {isViewMode && requisition && (
                                <FormFieldCard title="Requisition Info">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Text
                                                as="p"
                                                size="1"
                                                color="gray"
                                                mb="1"
                                            >
                                                Status
                                            </Text>
                                            <Badge
                                                variant="soft"
                                                color={
                                                    statusBadgeColor[
                                                        requisition.status
                                                    ]
                                                }
                                                radius="full"
                                            >
                                                {
                                                    statusLabel[
                                                        requisition.status
                                                    ]
                                                }
                                            </Badge>
                                        </div>
                                        <div>
                                            <Text
                                                as="p"
                                                size="1"
                                                color="gray"
                                                mb="1"
                                            >
                                                Requested By
                                            </Text>
                                            <Text size="2">
                                                {requisition.requestedByUser
                                                    ?.fullname || 'N/A'}
                                            </Text>
                                        </div>
                                        <div>
                                            <Text
                                                as="p"
                                                size="1"
                                                color="gray"
                                                mb="1"
                                            >
                                                Created
                                            </Text>
                                            <Text size="2">
                                                {new Date(
                                                    requisition.createdAt,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </Text>
                                        </div>
                                        {requisition.approvedBy &&
                                            requisition.approvedByUser && (
                                                <div>
                                                    <Text
                                                        as="p"
                                                        size="1"
                                                        color="gray"
                                                        mb="1"
                                                    >
                                                        Approved By
                                                    </Text>
                                                    <Text size="2">
                                                        {
                                                            requisition
                                                                .approvedByUser
                                                                .fullname
                                                        }
                                                    </Text>
                                                </div>
                                            )}
                                        {requisition.rejectedReason && (
                                            <div className="md:col-span-3">
                                                <Text
                                                    as="p"
                                                    size="1"
                                                    color="gray"
                                                    mb="1"
                                                >
                                                    Rejection Reason
                                                </Text>
                                                <Text size="2" color="red">
                                                    {requisition.rejectedReason}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </FormFieldCard>
                            )}

                            <FormFieldCard title="Details">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SupplierSearchSelect
                                        name="supplierId"
                                        label="Preferred Supplier"
                                        placeholder="Select a preferred supplier (optional)..."
                                        disabled={!canEdit}
                                        initialOption={getInitialOptionForSupplier()}
                                    />
                                    <TextInput
                                        label="Notes"
                                        name="notes"
                                        placeholder="Reason for requisition, urgency notes, etc."
                                        disabled={!canEdit}
                                    />
                                </div>
                            </FormFieldCard>

                            <FieldArray name="items">
                                {({ push, remove }) => (
                                    <Flex direction="column" gap="3">
                                        {canEdit && (
                                            <Box>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        push({
                                                            variantId: '',
                                                            requestedQuantity: 1,
                                                            notes: '',
                                                        })
                                                    }
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Item
                                                </Button>
                                            </Box>
                                        )}

                                        {values.items.length === 0 ? (
                                            <TableEmptyState
                                                icon={<Package />}
                                                title="No items added yet"
                                                description="Add an item to this requisition."
                                            />
                                        ) : (
                                            <Table.Root
                                                variant="surface"
                                                layout="auto"
                                            >
                                                <Table.Header>
                                                    <Table.Row>
                                                        <Table.ColumnHeaderCell>
                                                            Item
                                                        </Table.ColumnHeaderCell>
                                                        <Table.ColumnHeaderCell width="120px">
                                                            Requested Qty
                                                        </Table.ColumnHeaderCell>
                                                        {isViewMode && (
                                                            <Table.ColumnHeaderCell width="120px">
                                                                Approved Qty
                                                            </Table.ColumnHeaderCell>
                                                        )}
                                                        <Table.ColumnHeaderCell>
                                                            Notes
                                                        </Table.ColumnHeaderCell>
                                                        {canEdit && (
                                                            <Table.ColumnHeaderCell
                                                                width="60px"
                                                                justify="end"
                                                            >
                                                                Action
                                                            </Table.ColumnHeaderCell>
                                                        )}
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {values.items.map(
                                                        (item, index) => {
                                                            const reqItem =
                                                                requisition
                                                                    ?.items?.[
                                                                    index
                                                                ];
                                                            const canRemove =
                                                                canEdit &&
                                                                values.items
                                                                    .length > 1;

                                                            return (
                                                                <Table.Row
                                                                    key={index}
                                                                    align="center"
                                                                >
                                                                    <Table.RowHeaderCell>
                                                                        <Box minWidth="220px">
                                                                            <ProductSearchSelect
                                                                                name={`items.${index}.variantId`}
                                                                                label=""
                                                                                disabled={
                                                                                    !canEdit
                                                                                }
                                                                                initialOption={getInitialOptionForItem(
                                                                                    item.variantId,
                                                                                )}
                                                                            />
                                                                        </Box>
                                                                    </Table.RowHeaderCell>
                                                                    <Table.Cell>
                                                                        <CellNumberInput
                                                                            name={`items.${index}.requestedQuantity`}
                                                                            disabled={
                                                                                !canEdit
                                                                            }
                                                                        />
                                                                    </Table.Cell>
                                                                    {isViewMode && (
                                                                        <Table.Cell>
                                                                            {reqItem?.approvedQuantity !=
                                                                            null ? (
                                                                                <Text
                                                                                    size="2"
                                                                                    weight="medium"
                                                                                    color={
                                                                                        reqItem.approvedQuantity <
                                                                                        reqItem.requestedQuantity
                                                                                            ? 'amber'
                                                                                            : 'green'
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        reqItem.approvedQuantity
                                                                                    }
                                                                                    {reqItem.approvedQuantity <
                                                                                        reqItem.requestedQuantity && (
                                                                                        <Text color="gray">
                                                                                            {' '}
                                                                                            (of{' '}
                                                                                            {
                                                                                                reqItem.requestedQuantity
                                                                                            }
                                                                                            )
                                                                                        </Text>
                                                                                    )}
                                                                                </Text>
                                                                            ) : (
                                                                                <Text
                                                                                    size="2"
                                                                                    color="gray"
                                                                                >
                                                                                    —
                                                                                </Text>
                                                                            )}
                                                                        </Table.Cell>
                                                                    )}
                                                                    <Table.Cell>
                                                                        <CellTextInput
                                                                            name={`items.${index}.notes`}
                                                                            disabled={
                                                                                !canEdit
                                                                            }
                                                                            placeholder="Optional notes..."
                                                                        />
                                                                    </Table.Cell>
                                                                    {canEdit && (
                                                                        <Table.Cell justify="end">
                                                                            <Tooltip
                                                                                content={
                                                                                    canRemove
                                                                                        ? 'Remove item'
                                                                                        : 'Cannot remove'
                                                                                }
                                                                            >
                                                                                <IconButton
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    color="red"
                                                                                    size="1"
                                                                                    disabled={
                                                                                        !canRemove
                                                                                    }
                                                                                    onClick={() =>
                                                                                        remove(
                                                                                            index,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Table.Cell>
                                                                    )}
                                                                </Table.Row>
                                                            );
                                                        },
                                                    )}
                                                </Table.Body>
                                            </Table.Root>
                                        )}

                                        {values.items.length > 0 && (
                                            <Flex
                                                justify="end"
                                                pt="3"
                                                className="border-t border-gray-200 dark:border-gray-600"
                                            >
                                                <Text size="3">
                                                    <Text color="gray">
                                                        Total Items:{' '}
                                                    </Text>
                                                    <Text weight="bold">
                                                        {values.items.length}
                                                    </Text>
                                                    <Text color="gray" mx="3">
                                                        |
                                                    </Text>
                                                    <Text color="gray">
                                                        Total Qty:{' '}
                                                    </Text>
                                                    <Text weight="bold">
                                                        {values.items.reduce(
                                                            (sum, item) =>
                                                                sum +
                                                                (Number(
                                                                    item.requestedQuantity,
                                                                ) || 0),
                                                            0,
                                                        )}
                                                    </Text>
                                                </Text>
                                            </Flex>
                                        )}
                                    </Flex>
                                )}
                            </FieldArray>
                        </Flex>
                    </Form>
                </FormModal>
            )}
        </Formik>
    );
};

export default RequisitionFormModal;
