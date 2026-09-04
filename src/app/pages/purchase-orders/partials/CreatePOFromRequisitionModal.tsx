import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { ClipboardList } from 'lucide-react';
import { Flex, Text, Button } from '@radix-ui/themes';
import FormModal from '../../../components/FormModal';
import TextInput from '../../../components/TextInput';
import SupplierSearchSelect from '../../../components/SupplierSearchSelect';
import { formatSupplierLabel } from '../../../components/SupplierSearchSelect';
import { formatProductLabel } from '../../../components/ProductSearchSelect';
import POItemsForm from './POItemsForm';
import { calculateTotal, formatCurrency } from './helpers';
import validationSchema from '../../../schemas/purchase-order.schema';
import { usePurchaseRequisitions } from '../../../hooks/usePurchaseRequisitions';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrders';
import { getErrorMessage } from '../../../utils/api-error-handler';
import type { POFormValues } from './types';

interface CreatePOFromRequisitionModalProps {
    requisitionId: string;
    onClose: () => void;
    onSaved: () => void;
}

const CreatePOFromRequisitionModal: FunctionComponent<CreatePOFromRequisitionModalProps> = ({
    requisitionId,
    onClose,
    onSaved,
}) => {
    const { getById: getRequisition } = usePurchaseRequisitions();
    const { createFromRequisition } = usePurchaseOrders();

    const [loading, setLoading] = useState(true);
    const [requisition, setRequisition] = useState<PurchaseRequisitionWithItems | null>(null);

    useEffect(() => {
        setLoading(true);
        getRequisition(requisitionId)
            .then((req) => { if (req) setRequisition(req); })
            .finally(() => setLoading(false));
    }, [requisitionId]);

    const approvedQtyMap = useMemo(() => {
        if (!requisition) return new Map<string, number>();
        return new Map(
            requisition.items.map((item) => [
                item.variantId,
                item.approvedQuantity ?? item.requestedQuantity,
            ])
        );
    }, [requisition]);

    const requisitionOptionMap = useMemo(() => {
        if (!requisition) return new Map<string, { label: string; value: string }>();
        return new Map(
            requisition.items
                .filter((item) => item.variant)
                .map((item) => [
                    item.variantId,
                    {
                        label: formatProductLabel({
                            name: item.variant!.product?.name || 'Unknown',
                            variantName: item.variant!.variantName,
                            sku: item.variant!.sku,
                        }),
                        value: item.variantId,
                    },
                ])
        );
    }, [requisition]);

    const initialValues: POFormValues = useMemo(() => {
        if (!requisition) return { supplierId: '', expectedDeliveryDate: '', notes: '', items: [] };
        return {
            supplierId: requisition.supplierId || '',
            expectedDeliveryDate: '',
            notes: requisition.notes
                ? `From Requisition ${requisition.requisitionNumber}: ${requisition.notes}`
                : `From Requisition ${requisition.requisitionNumber}`,
            items: requisition.items.map((item) => ({
                variantId: item.variantId,
                orderedQuantity: item.approvedQuantity ?? item.requestedQuantity,
                unitPrice: 0,
                notes: item.notes || '',
            })),
        };
    }, [requisition]);

    const supplierInitialOption = requisition?.supplier
        ? { label: formatSupplierLabel(requisition.supplier), value: requisition.supplierId! }
        : null;

    const title = `New PO from Requisition${requisition?.requisitionNumber ? ` ${requisition.requisitionNumber}` : ''}`;

    const handleSubmit = async (values: POFormValues) => {
        try {
            const payload: CreatePOFromRequisitionInput = {
                requisitionId,
                supplierId: values.supplierId,
                itemPrices: values.items.map((item) => ({
                    variantId: item.variantId,
                    unitPrice: Number(item.unitPrice),
                })),
                expectedDeliveryDate: values.expectedDeliveryDate || undefined,
                notes: values.notes || undefined,
            };
            await createFromRequisition(payload);
            Notify.success('Purchase order created successfully');
            onSaved();
            onClose();
        } catch (error: any) {
            Report.failure('Error', getErrorMessage(error, 'Failed to create purchase order'), 'Okay');
        }
    };

    if (loading || !requisition) {
        return (
            <FormModal
                open
                onOpenChange={(open) => { if (!open) onClose(); }}
                title={title}
                icon={<ClipboardList className="w-5 h-5" />}
                size="xl"
            >
                <Flex align="center" justify="center" className="h-64">
                    <Text color="gray">Loading requisition...</Text>
                </Flex>
            </FormModal>
        );
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    await handleSubmit(values);
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ values, isSubmitting }) => (
                <FormModal
                    open
                    onOpenChange={(open) => { if (!open) onClose(); }}
                    title={title}
                    description="Items are pre-filled with approved quantities. Select a supplier and set unit prices."
                    icon={<ClipboardList className="w-5 h-5" />}
                    size="xl"
                    footer={
                        <Flex align="center" justify="between" width="100%">
                            <Text size="3" weight="medium">
                                Order value {formatCurrency(calculateTotal(values.items))}
                            </Text>
                            <Flex gap="3">
                                <Dialog.Close asChild>
                                    <Button type="button" variant="soft" color="gray">Cancel</Button>
                                </Dialog.Close>
                                <Button type="submit" form="po-from-requisition-form" disabled={isSubmitting} loading={isSubmitting}>
                                    Create Purchase Order
                                </Button>
                            </Flex>
                        </Flex>
                    }
                >
                    <Form id="po-from-requisition-form">
                        <Flex direction="column" gap="4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                                <SupplierSearchSelect name="supplierId" required initialOption={supplierInitialOption} />
                                <TextInput label="Expected Delivery Date" name="expectedDeliveryDate" type="date" />
                            </div>

                            <POItemsForm
                                items={values.items}
                                formMode="create-from-requisition"
                                approvedQtyMap={approvedQtyMap}
                                requisitionOptionMap={requisitionOptionMap}
                            />

                            <TextInput label="Note for the supplier" name="notes" placeholder="Deliver before midday" />
                        </Flex>
                    </Form>
                </FormModal>
            )}
        </Formik>
    );
};

export default CreatePOFromRequisitionModal;
