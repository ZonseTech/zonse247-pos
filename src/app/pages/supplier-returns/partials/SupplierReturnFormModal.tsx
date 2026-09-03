import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FunctionComponent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2 } from 'lucide-react';
import { Box, Flex, Button as RadixButton, Text } from '@radix-ui/themes';
import FormModal from '../../../components/FormModal';
import { FormFieldCard } from '../../../components';
import TextInput from '../../../components/TextInput';
import FormSearchableSelect from '../../../components/FormSearchableSelect';
import SupplierSearchSelect from '../../../components/SupplierSearchSelect';
import { useSupplierReturnForm } from './useSupplierReturnForm';
import { SupplierFieldWatcher, GRNFieldWatcher } from './FieldWatchers';
import ReturnStatusCard from './ReturnStatusCard';
import ReturnItemsView from './ReturnItemsView';
import CreditNotesView from './CreditNotesView';
import ReturnItemsForm from './ReturnItemsForm';
import { RETURN_REASONS } from './types';

const validationSchema = Yup.object().shape({
    supplierId: Yup.string().required('Supplier is required'),
    reason: Yup.string().max(500, 'Reason is too long'),
    notes: Yup.string().max(1000, 'Notes are too long'),
    items: Yup.array()
        .of(
            Yup.object().shape({
                variantId: Yup.string().required('Product variant is required'),
                returnQuantity: Yup.number()
                    .required('Return quantity is required')
                    .min(1, 'Quantity must be at least 1'),
                unitCost: Yup.number()
                    .required('Unit cost is required')
                    .min(0, 'Cost must be 0 or higher'),
            }),
        )
        .min(1, 'At least one item is required'),
});

interface SupplierReturnFormModalProps {
    returnId?: string;
    onClose: () => void;
    onSaved: () => void;
}

const SupplierReturnFormModal: FunctionComponent<
    SupplierReturnFormModalProps
> = ({ returnId, onClose, onSaved }) => {
    const {
        formMode,
        loading,
        returnData,
        selectedSupplierId,
        poOptions,
        grnOptions,
        initialValues,
        handleSubmit,
        handleSupplierChanged,
        handleGRNSelected,
        handleGRNCleared,
        handleApprove,
        handleShip,
        handleComplete,
        handleCancel,
        handleDelete,
    } = useSupplierReturnForm({
        returnId,
        onSaved: () => {
            onSaved();
            onClose();
        },
        onDeleted: () => {
            onSaved();
            onClose();
        },
    });

    const isView = formMode === 'view';
    const hasSupplier = !!selectedSupplierId;
    const title = isView
        ? `Return${returnData?.returnNumber ? ` — ${returnData.returnNumber}` : ''}`
        : 'New Supplier Return';

    if (loading && !returnData && returnId) {
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
                    <Text color="gray">Loading return details...</Text>
                </Flex>
            </FormModal>
        );
    }

    if (isView && returnData) {
        return (
            <FormModal
                open
                onOpenChange={(open) => {
                    if (!open) onClose();
                }}
                title={title}
                size="xl"
                footer={
                    <Flex justify="end">
                        <Dialog.Close asChild>
                            <RadixButton
                                type="button"
                                variant="soft"
                                color="gray"
                            >
                                Close
                            </RadixButton>
                        </Dialog.Close>
                    </Flex>
                }
            >
                <Flex direction="column" gap="4">
                    <ReturnStatusCard
                        returnData={returnData}
                        onApprove={handleApprove}
                        onShip={handleShip}
                        onComplete={handleComplete}
                        onCancel={handleCancel}
                        onDelete={handleDelete}
                    />
                    <ReturnItemsView
                        items={returnData.items || []}
                        totalAmount={returnData.totalAmount}
                    />
                    {returnData.creditNotes &&
                        returnData.creditNotes.length > 0 && (
                            <CreditNotesView
                                creditNotes={returnData.creditNotes}
                            />
                        )}
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
                                <RadixButton
                                    type="button"
                                    variant="soft"
                                    color="gray"
                                >
                                    Cancel
                                </RadixButton>
                            </Dialog.Close>
                            <RadixButton
                                type="submit"
                                form="supplier-return-form"
                                disabled={isSubmitting || loading}
                            >
                                {(isSubmitting || loading) && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Create Return (Draft)
                            </RadixButton>
                        </Flex>
                    }
                >
                    <Form id="supplier-return-form">
                        <SupplierFieldWatcher
                            onSupplierChanged={handleSupplierChanged}
                        />
                        <GRNFieldWatcher
                            onGRNSelected={handleGRNSelected}
                            onGRNCleared={handleGRNCleared}
                        />

                        <Flex direction="column" gap="4">
                            <FormFieldCard title="Supplier">
                                <Box p="5">
                                    <SupplierSearchSelect
                                        name="supplierId"
                                        required
                                    />
                                </Box>
                            </FormFieldCard>

                            <FormFieldCard title="Return Details">
                                <Box
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5"
                                    p="5"
                                >
                                    <FormSearchableSelect
                                        label="Goods Receipt (optional)"
                                        name="goodsReceiptId"
                                        options={grnOptions}
                                        placeholder={
                                            hasSupplier
                                                ? 'Link to GRN...'
                                                : 'Select a supplier first'
                                        }
                                        isClearable
                                        disabled={!hasSupplier}
                                    />
                                    <FormSearchableSelect
                                        label="Purchase Order (optional)"
                                        name="purchaseOrderId"
                                        options={poOptions}
                                        placeholder={
                                            hasSupplier
                                                ? 'Link to PO...'
                                                : 'Select a supplier first'
                                        }
                                        isClearable
                                        disabled={
                                            !hasSupplier ||
                                            !!values.goodsReceiptId
                                        }
                                    />
                                    <FormSearchableSelect
                                        label="Reason"
                                        name="reason"
                                        options={RETURN_REASONS}
                                        placeholder="Select reason..."
                                        isClearable
                                    />
                                    <Box className="sm:col-span-2">
                                        <TextInput
                                            label="Notes"
                                            name="notes"
                                            placeholder="Additional notes..."
                                        />
                                    </Box>
                                </Box>
                            </FormFieldCard>

                            <ReturnItemsForm />
                        </Flex>
                    </Form>
                </FormModal>
            )}
        </Formik>
    );
};

export default SupplierReturnFormModal;
