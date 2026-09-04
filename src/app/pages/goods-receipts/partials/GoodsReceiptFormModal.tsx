import * as Yup from 'yup';
import {
    Form,
    Formik,
    useFormikContext,
    useField,
    type FormikHelpers,
} from 'formik';
import {
    FunctionComponent,
    FC,
    useState,
    useEffect,
    useMemo,
    useCallback,
} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
    Package,
    Loader2,
    CheckCircle2,
    FileCheck,
    Ban,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import { Notify, Report } from 'notiflix';
import {
    Badge,
    Box,
    Button,
    Flex,
    Table,
    Text,
    TextField,
} from '@radix-ui/themes';
import FormModal from '../../../components/FormModal';
import TextInput from '../../../components/TextInput';
import FormSearchableSelect from '../../../components/FormSearchableSelect';
import SupplierSearchSelect from '../../../components/SupplierSearchSelect';
import { FormFieldCard, TableEmptyState } from '../../../components';
import { useGoodsReceipts } from '../../../hooks/useGoodsReceipts';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrders';
import { grnStatusConfig } from './GoodsReceiptTableColumns';
import { getErrorMessage } from '../../../utils/api-error-handler';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'MWK',
    }).format(value);

const formatDate = (d?: Date | string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

interface GRNFormItem {
    purchaseOrderItemId: string;
    variantId: string;
    displayName: string;
    sku: string;
    orderedQuantity: number;
    alreadyReceived: number;
    receivedQuantity: number;
    rejectedQuantity: number;
    rejectionReason: string;
    unitCost: number;
    notes: string;
}

interface GRNFormValues {
    purchaseOrderId: string;
    _supplierFilter: string;
    notes: string;
    items: GRNFormItem[];
}

const SupplierFieldWatcher: FC<{ onChange: (supplierId: string) => void }> = ({
    onChange,
}) => {
    const { values } = useFormikContext<GRNFormValues>();
    const [lastId, setLastId] = useState('');

    useEffect(() => {
        const id = values._supplierFilter || '';
        if (id !== lastId) {
            setLastId(id);
            onChange(id);
        }
    }, [values._supplierFilter]);

    return null;
};

const POFieldWatcher: FC<{
    onPOSelected: (poId: string) => void;
    currentPOId: string | null;
}> = ({ onPOSelected, currentPOId }) => {
    const { values } = useFormikContext<GRNFormValues>();
    const [lastId, setLastId] = useState('');

    useEffect(() => {
        if (values.purchaseOrderId && values.purchaseOrderId !== lastId) {
            setLastId(values.purchaseOrderId);
            if (values.purchaseOrderId !== currentPOId) {
                onPOSelected(values.purchaseOrderId);
            }
        }
    }, [values.purchaseOrderId]);

    return null;
};

interface CellNumberInputProps {
    name: string;
    min?: number;
    color?: 'red' | undefined;
}

const CellNumberInput: FunctionComponent<CellNumberInputProps> = ({
    name,
    min,
    color,
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
                min={min}
                step={min === undefined ? '0.01' : undefined}
                color={hasError ? 'red' : color}
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
    placeholder?: string;
}> = ({ name, placeholder }) => {
    const [field] = useField({ name });
    return (
        <TextField.Root
            {...field}
            value={field.value ?? ''}
            placeholder={placeholder}
            size="2"
        />
    );
};

const calculateTotalCost = (items: GRNFormItem[]) =>
    items.reduce((sum, item) => sum + item.receivedQuantity * item.unitCost, 0);

interface GoodsReceiptFormModalProps {
    goodsReceiptId?: string;
    preSelectedPOId?: string;
    onClose: () => void;
    onSaved: () => void;
}

const GoodsReceiptFormModal: FunctionComponent<GoodsReceiptFormModalProps> = ({
    goodsReceiptId,
    preSelectedPOId,
    onClose,
    onSaved,
}) => {
    const {
        createGoodsReceipt,
        verifyGoodsReceipt,
        postGoodsReceipt,
        cancelGoodsReceipt,
        getGoodsReceipt,
    } = useGoodsReceipts();
    const { purchaseOrders, getPurchaseOrder, setSupplierFilter, setPerPage } =
        usePurchaseOrders();

    const isViewMode = !!goodsReceiptId;

    const [loading, setLoading] = useState(false);
    const [goodsReceipt, setGoodsReceipt] =
        useState<GoodsReceiptWithItems | null>(null);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [loadingPO, setLoadingPO] = useState(false);

    useEffect(() => {
        if (!goodsReceiptId) return;
        setLoading(true);
        getGoodsReceipt(goodsReceiptId)
            .then((grn) => {
                if (grn) setGoodsReceipt(grn);
            })
            .catch((err) =>
                Notify.failure(
                    getErrorMessage(err, 'Failed to load goods receipt'),
                ),
            )
            .finally(() => setLoading(false));
    }, [goodsReceiptId]);

    useEffect(() => {
        setPerPage(100);
    }, []);

    const handlePOSelected = useCallback(
        async (poId: string) => {
            if (!poId) {
                setSelectedPO(null);
                return;
            }
            setLoadingPO(true);
            try {
                const po = await getPurchaseOrder(poId);
                if (po) setSelectedPO(po);
            } catch {
                Notify.failure('Failed to load purchase order details');
            } finally {
                setLoadingPO(false);
            }
        },
        [getPurchaseOrder],
    );

    useEffect(() => {
        if (preSelectedPOId && !isViewMode) handlePOSelected(preSelectedPOId);
    }, [preSelectedPOId]);

    const handleSupplierChange = useCallback(
        (supplierId: string) => {
            setSelectedSupplierId(supplierId);
            setSupplierFilter(supplierId);
            setSelectedPO(null);
        },
        [setSupplierFilter],
    );

    const poOptions = useMemo(
        () =>
            purchaseOrders
                .filter((po) =>
                    ['SENT', 'SHIPPED', 'PARTIALLY_RECEIVED'].includes(
                        po.status,
                    ),
                )
                .map((po) => ({
                    label: `${po.poNumber} — ${po.supplier?.name || 'Unknown Supplier'}`,
                    value: po.id,
                })),
        [purchaseOrders],
    );

    const buildItemsFromPO = useCallback(
        (po: PurchaseOrder): GRNFormItem[] =>
            po.items.map((item) => {
                const vName = item.variant?.variantName || '';
                const pName = item.variant?.product?.name || '';
                const displayName = pName
                    ? `${pName}${vName && vName !== 'Default' ? ` — ${vName}` : ''}`
                    : vName || item.product?.name || 'Unknown';
                const remaining = Math.max(
                    0,
                    item.orderedQuantity - (item.receivedQuantity || 0),
                );

                return {
                    purchaseOrderItemId: item.id,
                    variantId: item.variantId,
                    displayName,
                    sku: item.variant?.sku || item.product?.sku || '',
                    orderedQuantity: item.orderedQuantity,
                    alreadyReceived: item.receivedQuantity || 0,
                    receivedQuantity: remaining,
                    rejectedQuantity: 0,
                    rejectionReason: '',
                    unitCost: item.unitPrice,
                    notes: '',
                };
            }),
        [],
    );

    const defaultValues: GRNFormValues = {
        purchaseOrderId: preSelectedPOId || '',
        _supplierFilter: '',
        notes: '',
        items: [],
    };

    const initialValues: GRNFormValues = useMemo(() => {
        if (isViewMode && goodsReceipt) {
            return {
                purchaseOrderId: goodsReceipt.purchaseOrderId,
                _supplierFilter: selectedSupplierId,
                notes: goodsReceipt.notes || '',
                items: goodsReceipt.items.map((item) => {
                    const vName = item.variant?.variantName || '';
                    const pName = item.variant?.product?.name || '';
                    const displayName = pName
                        ? `${pName}${vName && vName !== 'Default' ? ` — ${vName}` : ''}`
                        : vName || 'Unknown';
                    return {
                        purchaseOrderItemId: item.purchaseOrderItemId,
                        variantId: item.variantId,
                        displayName,
                        sku: item.variant?.sku || '',
                        orderedQuantity:
                            item.purchaseOrderItem?.orderedQuantity || 0,
                        alreadyReceived: 0,
                        receivedQuantity: item.receivedQuantity,
                        rejectedQuantity: item.rejectedQuantity,
                        rejectionReason: item.rejectionReason || '',
                        unitCost: item.unitCost,
                        notes: item.notes || '',
                    };
                }),
            };
        }

        if (selectedPO) {
            return {
                purchaseOrderId: selectedPO.id,
                _supplierFilter: selectedSupplierId,
                notes: '',
                items: buildItemsFromPO(selectedPO),
            };
        }

        return defaultValues;
    }, [isViewMode, goodsReceipt, selectedPO, selectedSupplierId]);

    const validationSchema = Yup.object().shape({
        purchaseOrderId: Yup.string().required('Purchase order is required'),
        notes: Yup.string().max(1000, 'Notes are too long'),
        items: Yup.array()
            .of(
                Yup.object().shape({
                    receivedQuantity: Yup.number()
                        .required('Required')
                        .min(0, 'Cannot be negative'),
                    rejectedQuantity: Yup.number().min(0, 'Cannot be negative'),
                    unitCost: Yup.number()
                        .required('Required')
                        .min(0, 'Cannot be negative'),
                }),
            )
            .min(1, 'At least one item is required'),
    });

    const handleSubmit = async (
        values: GRNFormValues,
        { resetForm }: FormikHelpers<GRNFormValues>,
    ) => {
        if (isViewMode) return;
        setLoading(true);
        try {
            const payload: CreateGoodsReceiptInput = {
                purchaseOrderId: values.purchaseOrderId,
                notes: values.notes || undefined,
                items: values.items.map((item) => ({
                    purchaseOrderItemId: item.purchaseOrderItemId,
                    variantId: item.variantId,
                    receivedQuantity: Number(item.receivedQuantity),
                    rejectedQuantity: Number(item.rejectedQuantity) || 0,
                    rejectionReason: item.rejectionReason || undefined,
                    unitCost: Number(item.unitCost),
                    notes: item.notes || undefined,
                })),
            };

            const grn = await createGoodsReceipt(payload);
            Notify.success(
                `${grn?.receiptNumber || 'Goods receipt'} created in DRAFT status`,
            );
            resetForm();
            onSaved();
            onClose();
        } catch (error: any) {
            Report.failure(
                'Error',
                getErrorMessage(error, 'Failed to create goods receipt'),
                'Okay',
            );
        } finally {
            setLoading(false);
        }
    };

    const refreshGRN = async () => {
        if (!goodsReceipt) return;
        const grn = await getGoodsReceipt(goodsReceipt.id);
        if (grn) setGoodsReceipt(grn);
        onSaved();
    };

    const handleVerify = useCallback(() => {
        if (!goodsReceipt) return;
        Notify.info('Verifying...');
        verifyGoodsReceipt(goodsReceipt.id).then(refreshGRN);
    }, [goodsReceipt, verifyGoodsReceipt]);

    const handlePost = useCallback(() => {
        if (!goodsReceipt) return;
        postGoodsReceipt(goodsReceipt.id).then(refreshGRN);
    }, [goodsReceipt, postGoodsReceipt]);

    const handleCancelGRN = useCallback(() => {
        if (!goodsReceipt) return;
        cancelGoodsReceipt(goodsReceipt.id).then(refreshGRN);
    }, [goodsReceipt, cancelGoodsReceipt]);

    const statusCfg = goodsReceipt?.status
        ? grnStatusConfig[goodsReceipt.status]
        : null;
    const title = isViewMode
        ? `Goods Receipt${goodsReceipt?.receiptNumber ? ` — ${goodsReceipt.receiptNumber}` : ''}`
        : 'New Goods Receipt (GRN)';

    if (loading && !goodsReceipt && goodsReceiptId) {
        return (
            <FormModal
                open
                onOpenChange={(open) => {
                    if (!open) onClose();
                }}
                title={title}
                size="full"
            >
                <Flex align="center" justify="center" className="h-64">
                    <Text color="gray">Loading goods receipt...</Text>
                </Flex>
            </FormModal>
        );
    }

    return (
        <Formik
            onSubmit={handleSubmit}
            enableReinitialize
            initialValues={initialValues}
            validationSchema={!isViewMode ? validationSchema : undefined}
        >
            {({ isSubmitting, values }) => (
                <FormModal
                    open
                    onOpenChange={(open) => {
                        if (!open) onClose();
                    }}
                    title={title}
                    size="full"
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
                            {!isViewMode && (
                                <Button
                                    type="submit"
                                    form="grn-form"
                                    disabled={
                                        isSubmitting ||
                                        loading ||
                                        values.items.length === 0
                                    }
                                    loading={isSubmitting || loading}
                                >
                                    Create GRN
                                </Button>
                            )}
                        </Flex>
                    }
                >
                    <Form id="grn-form">
                        {!isViewMode && (
                            <SupplierFieldWatcher
                                onChange={handleSupplierChange}
                            />
                        )}
                        {!isViewMode && (
                            <POFieldWatcher
                                onPOSelected={handlePOSelected}
                                currentPOId={selectedPO?.id || null}
                            />
                        )}

                        <Flex direction="column" gap="4">
                            {isViewMode && goodsReceipt && (
                                <Box className="bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <Flex
                                        justify="between"
                                        align="center"
                                        wrap="wrap"
                                        gap="3"
                                    >
                                        <Flex align="center" gap="3">
                                            {statusCfg && (
                                                <Badge
                                                    variant="soft"
                                                    color={statusCfg.color}
                                                    radius="full"
                                                >
                                                    {statusCfg.label}
                                                </Badge>
                                            )}
                                            <Text size="2" color="gray">
                                                {goodsReceipt.receiptNumber}
                                            </Text>
                                        </Flex>
                                        <Flex gap="2" wrap="wrap">
                                            {goodsReceipt.status ===
                                                'DRAFT' && (
                                                <Button
                                                    type="button"
                                                    onClick={handleVerify}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Verify
                                                </Button>
                                            )}
                                            {goodsReceipt.status ===
                                                'VERIFIED' && (
                                                <Button
                                                    type="button"
                                                    color="green"
                                                    onClick={handlePost}
                                                >
                                                    <FileCheck className="w-4 h-4" />
                                                    Post (Update Stock)
                                                </Button>
                                            )}
                                            {['DRAFT', 'VERIFIED'].includes(
                                                goodsReceipt.status,
                                            ) && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    color="red"
                                                    onClick={handleCancelGRN}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                    Cancel
                                                </Button>
                                            )}
                                        </Flex>
                                    </Flex>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div>
                                            <Text as="p" size="1" color="gray">
                                                PO Reference
                                            </Text>
                                            <Text
                                                size="2"
                                                weight="medium"
                                                color="sky"
                                            >
                                                {goodsReceipt.purchaseOrder
                                                    ?.poNumber || '—'}
                                            </Text>
                                        </div>
                                        <div>
                                            <Text as="p" size="1" color="gray">
                                                Supplier
                                            </Text>
                                            <Text size="2" weight="medium">
                                                {goodsReceipt.purchaseOrder
                                                    ?.supplier?.name || '—'}
                                            </Text>
                                        </div>
                                        <div>
                                            <Text as="p" size="1" color="gray">
                                                Received At
                                            </Text>
                                            <Text size="2" weight="medium">
                                                {formatDate(
                                                    goodsReceipt.receivedAt,
                                                )}
                                            </Text>
                                        </div>
                                        <div>
                                            <Text as="p" size="1" color="gray">
                                                Total Cost
                                            </Text>
                                            <Text size="2" weight="bold">
                                                {formatCurrency(
                                                    calculateTotalCost(
                                                        values.items,
                                                    ),
                                                )}
                                            </Text>
                                        </div>
                                        {goodsReceipt.notes && (
                                            <div className="col-span-2 sm:col-span-4">
                                                <Text
                                                    as="p"
                                                    size="1"
                                                    color="gray"
                                                >
                                                    Notes
                                                </Text>
                                                <Text size="2">
                                                    {goodsReceipt.notes}
                                                </Text>
                                            </div>
                                        )}
                                    </div>

                                    {goodsReceipt.status === 'POSTED' && (
                                        <Flex
                                            align="center"
                                            gap="2"
                                            mt="3"
                                            p="3"
                                            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                            <Text
                                                size="2"
                                                className="text-emerald-700 dark:text-emerald-300"
                                            >
                                                This receipt has been posted.
                                                Inventory has been updated with
                                                the received quantities.
                                            </Text>
                                        </Flex>
                                    )}
                                </Box>
                            )}

                            {!isViewMode && (
                                <FormFieldCard title="Purchase Order">
                                    <div className="space-y-4">
                                        <SupplierSearchSelect
                                            name="_supplierFilter"
                                            label="Filter by Supplier"
                                            placeholder="Search supplier to filter POs..."
                                        />
                                        <FormSearchableSelect
                                            label="Select Purchase Order"
                                            name="purchaseOrderId"
                                            options={poOptions}
                                            placeholder={
                                                selectedSupplierId
                                                    ? 'Select a PO from this supplier...'
                                                    : 'Select a supplier first or search all POs...'
                                            }
                                            required
                                        />

                                        {loadingPO && (
                                            <Flex align="center" gap="2">
                                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                <Text size="2" color="gray">
                                                    Loading PO items...
                                                </Text>
                                            </Flex>
                                        )}

                                        {selectedPO && (
                                            <Flex
                                                align="center"
                                                gap="3"
                                                p="3"
                                                className="bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800"
                                            >
                                                <Package className="w-5 h-5 text-sky-500 flex-shrink-0" />
                                                <Text
                                                    size="2"
                                                    className="text-sky-800 dark:text-sky-300"
                                                >
                                                    <Text weight="bold">
                                                        {selectedPO.poNumber}
                                                    </Text>
                                                    {selectedPO.supplier
                                                        ?.name && (
                                                        <>
                                                            {' '}
                                                            from{' '}
                                                            <Text weight="medium">
                                                                {
                                                                    selectedPO
                                                                        .supplier
                                                                        .name
                                                                }
                                                            </Text>
                                                        </>
                                                    )}
                                                    {' — '}
                                                    {selectedPO.items?.length ||
                                                        0}{' '}
                                                    items
                                                </Text>
                                            </Flex>
                                        )}

                                        <TextInput
                                            label="Notes"
                                            name="notes"
                                            placeholder="Additional notes for this receipt..."
                                        />
                                    </div>
                                </FormFieldCard>
                            )}

                            {(values.items.length > 0 || isViewMode) && (
                                <FormFieldCard
                                    title={
                                        isViewMode
                                            ? 'Received Items'
                                            : 'Items — Enter Received Quantities'
                                    }
                                >
                                    {values.items.length === 0 ? (
                                        <TableEmptyState
                                            icon={<Package />}
                                            title="No items yet"
                                            description="Select a purchase order above to load items."
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
                                                    <Table.ColumnHeaderCell
                                                        width="100px"
                                                        justify="end"
                                                    >
                                                        Ordered
                                                    </Table.ColumnHeaderCell>
                                                    <Table.ColumnHeaderCell width="120px">
                                                        Received
                                                    </Table.ColumnHeaderCell>
                                                    <Table.ColumnHeaderCell width="120px">
                                                        Rejected
                                                    </Table.ColumnHeaderCell>
                                                    <Table.ColumnHeaderCell width="140px">
                                                        Unit Cost
                                                    </Table.ColumnHeaderCell>
                                                    {!isViewMode && (
                                                        <Table.ColumnHeaderCell width="160px">
                                                            Rejection Reason
                                                        </Table.ColumnHeaderCell>
                                                    )}
                                                    <Table.ColumnHeaderCell
                                                        width="140px"
                                                        justify="end"
                                                    >
                                                        Line Total
                                                    </Table.ColumnHeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {values.items.map(
                                                    (item, index) => (
                                                        <Table.Row
                                                            key={index}
                                                            align="center"
                                                        >
                                                            <Table.RowHeaderCell>
                                                                <Text size="2">
                                                                    {
                                                                        item.displayName
                                                                    }
                                                                </Text>
                                                                {item.sku && (
                                                                    <Text
                                                                        as="p"
                                                                        size="1"
                                                                        color="gray"
                                                                    >
                                                                        {
                                                                            item.sku
                                                                        }
                                                                    </Text>
                                                                )}
                                                                {!isViewMode &&
                                                                    item.alreadyReceived >
                                                                        0 && (
                                                                        <Text
                                                                            as="p"
                                                                            size="1"
                                                                            color="green"
                                                                        >
                                                                            Already
                                                                            received:{' '}
                                                                            {
                                                                                item.alreadyReceived
                                                                            }
                                                                        </Text>
                                                                    )}
                                                                {isViewMode &&
                                                                    item.rejectionReason && (
                                                                        <Flex
                                                                            align="center"
                                                                            gap="1"
                                                                            mt="1"
                                                                        >
                                                                            <AlertTriangle className="w-3 h-3 text-red-500" />
                                                                            <Text
                                                                                size="1"
                                                                                color="red"
                                                                            >
                                                                                {
                                                                                    item.rejectionReason
                                                                                }
                                                                            </Text>
                                                                        </Flex>
                                                                    )}
                                                            </Table.RowHeaderCell>
                                                            <Table.Cell justify="end">
                                                                <Text
                                                                    size="2"
                                                                    color="gray"
                                                                >
                                                                    {
                                                                        item.orderedQuantity
                                                                    }
                                                                </Text>
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                {isViewMode ? (
                                                                    <Text
                                                                        size="2"
                                                                        weight="medium"
                                                                        color="green"
                                                                    >
                                                                        {
                                                                            item.receivedQuantity
                                                                        }
                                                                    </Text>
                                                                ) : (
                                                                    <CellNumberInput
                                                                        name={`items.${index}.receivedQuantity`}
                                                                        min={0}
                                                                    />
                                                                )}
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                {isViewMode ? (
                                                                    <Text
                                                                        size="2"
                                                                        weight="medium"
                                                                        color={
                                                                            item.rejectedQuantity >
                                                                            0
                                                                                ? 'red'
                                                                                : 'gray'
                                                                        }
                                                                    >
                                                                        {
                                                                            item.rejectedQuantity
                                                                        }
                                                                    </Text>
                                                                ) : (
                                                                    <CellNumberInput
                                                                        name={`items.${index}.rejectedQuantity`}
                                                                        min={0}
                                                                    />
                                                                )}
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                {isViewMode ? (
                                                                    <Text size="2">
                                                                        {formatCurrency(
                                                                            item.unitCost,
                                                                        )}
                                                                    </Text>
                                                                ) : (
                                                                    <CellNumberInput
                                                                        name={`items.${index}.unitCost`}
                                                                        min={0}
                                                                    />
                                                                )}
                                                            </Table.Cell>
                                                            {!isViewMode && (
                                                                <Table.Cell>
                                                                    <CellTextInput
                                                                        name={`items.${index}.rejectionReason`}
                                                                        placeholder="If rejected..."
                                                                    />
                                                                </Table.Cell>
                                                            )}
                                                            <Table.Cell justify="end">
                                                                <Text
                                                                    size="2"
                                                                    weight="medium"
                                                                >
                                                                    {formatCurrency(
                                                                        (item.receivedQuantity ||
                                                                            0) *
                                                                            (item.unitCost ||
                                                                                0),
                                                                    )}
                                                                </Text>
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ),
                                                )}
                                            </Table.Body>
                                        </Table.Root>
                                    )}

                                    {values.items.length > 0 && (
                                        <Flex
                                            justify="end"
                                            pt="3"
                                            mt="3"
                                            className="border-t border-gray-200 dark:border-gray-600"
                                        >
                                            <Text size="4">
                                                <Text color="gray">
                                                    Total Cost:{' '}
                                                </Text>
                                                <Text weight="bold">
                                                    {formatCurrency(
                                                        calculateTotalCost(
                                                            values.items,
                                                        ),
                                                    )}
                                                </Text>
                                            </Text>
                                        </Flex>
                                    )}
                                </FormFieldCard>
                            )}
                        </Flex>
                    </Form>
                </FormModal>
            )}
        </Formik>
    );
};

export default GoodsReceiptFormModal;
