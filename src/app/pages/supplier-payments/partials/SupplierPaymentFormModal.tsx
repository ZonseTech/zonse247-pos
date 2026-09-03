import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { FunctionComponent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Flex, Text, Button } from '@radix-ui/themes';
import FormModal from '../../../components/FormModal';
import TextInput from '../../../components/TextInput';
import FormSearchableSelect from '../../../components/FormSearchableSelect';
import SupplierSearchSelect from '../../../components/SupplierSearchSelect';
import { FormFieldCard } from '../../../components';
import { useSupplierPaymentForm } from './useSupplierPaymentForm';
import { SupplierFieldWatcher } from './FieldWatchers';
import PaymentStatusCard from './PaymentStatusCard';
import PaymentAllocationsView from './PaymentAllocationsView';
import InvoiceAllocationsForm from './InvoiceAllocationsForm';

const validationSchema = Yup.object().shape({
    supplierId: Yup.string().required('Supplier is required'),
    paymentDate: Yup.string().required('Payment date is required'),
    amount: Yup.number()
        .required('Payment amount is required')
        .moreThan(0, 'Amount must be greater than 0'),
    paymentMethod: Yup.string(),
    reference: Yup.string(),
    notes: Yup.string().max(1000, 'Notes are too long'),
    allocations: Yup.array()
        .of(
            Yup.object().shape({
                invoiceId: Yup.string().required('Invoice is required'),
                allocatedAmount: Yup.number()
                    .required('Allocation amount is required')
                    .moreThan(0, 'Allocation amount must be greater than 0'),
            }),
        )
        .min(1, 'At least one invoice allocation is required'),
});

interface SupplierPaymentFormModalProps {
    paymentId?: string;
    preSupplierId?: string;
    preInvoiceId?: string;
    onClose: () => void;
    onSaved: () => void;
}

const SupplierPaymentFormModal: FunctionComponent<
    SupplierPaymentFormModalProps
> = ({ paymentId, preSupplierId, preInvoiceId, onClose, onSaved }) => {
    const {
        formMode,
        loading,
        payment,
        outstandingInvoices,
        loadingInvoices,
        paymentMethodOptions,
        initialValues,
        handleSubmit,
        handleSupplierSelected,
        handleVoid,
    } = useSupplierPaymentForm({
        paymentId,
        preSupplierId,
        preInvoiceId,
        onSaved: () => {
            onSaved();
            onClose();
        },
    });

    const isView = formMode === 'view';

    if (isView && payment) {
        return (
            <FormModal
                open
                onOpenChange={(open) => {
                    if (!open) onClose();
                }}
                title={`Payment${payment.paymentNumber ? ` — ${payment.paymentNumber}` : ''}`}
                size="lg"
                footer={
                    <Flex justify="end">
                        <Dialog.Close asChild>
                            <Button variant="soft" color="gray">
                                Close
                            </Button>
                        </Dialog.Close>
                    </Flex>
                }
            >
                <Flex direction="column" gap="4">
                    <PaymentStatusCard payment={payment} onVoid={handleVoid} />
                    <PaymentAllocationsView
                        allocations={payment.allocations || []}
                    />
                </Flex>
            </FormModal>
        );
    }

    if (isView) {
        return (
            <FormModal
                open
                onOpenChange={(open) => {
                    if (!open) onClose();
                }}
                title="Payment"
                size="lg"
            >
                <Flex align="center" justify="center" className="h-64">
                    <Text color="gray">Loading payment details...</Text>
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
                    title="Record Supplier Payment"
                    size="lg"
                    footer={
                        <Flex justify="end" gap="3" width="100%">
                            <Dialog.Close asChild>
                                <Button
                                    type="button"
                                    variant="soft"
                                    color="gray"
                                >
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button
                                type="submit"
                                form="supplier-payment-form"
                                disabled={
                                    isSubmitting ||
                                    loading ||
                                    values.allocations.length === 0
                                }
                                loading={isSubmitting || loading}
                            >
                                Record Payment
                            </Button>
                        </Flex>
                    }
                >
                    <Form id="supplier-payment-form">
                        <SupplierFieldWatcher
                            onSupplierSelected={handleSupplierSelected}
                        />

                        <Flex direction="column" gap="4">
                            <FormFieldCard title="Payment Details">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-5">
                                    <SupplierSearchSelect
                                        name="supplierId"
                                        required
                                    />
                                    <TextInput
                                        label="Payment Date"
                                        name="paymentDate"
                                        type="date"
                                        required
                                    />
                                    <TextInput
                                        label="Payment Amount (MWK)"
                                        name="amount"
                                        type="number"
                                        placeholder="0.00"
                                        required
                                    />
                                    <FormSearchableSelect
                                        label="Payment Method"
                                        name="paymentMethod"
                                        options={paymentMethodOptions}
                                        placeholder="Select method..."
                                        isClearable
                                    />
                                    <TextInput
                                        label="Reference / Cheque No."
                                        name="reference"
                                        placeholder="e.g. CHQ-00123"
                                    />
                                    <TextInput
                                        label="Notes"
                                        name="notes"
                                        placeholder="Optional notes..."
                                    />
                                </div>
                            </FormFieldCard>

                            <InvoiceAllocationsForm
                                outstandingInvoices={outstandingInvoices}
                                loadingInvoices={loadingInvoices}
                            />
                        </Flex>
                    </Form>
                </FormModal>
            )}
        </Formik>
    );
};

export default SupplierPaymentFormModal;
