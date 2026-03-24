import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FunctionComponent } from 'react';
import { Wallet, Eye, Loader2 } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import SupplierSearchSelect from '../../components/SupplierSearchSelect';
import FormSkeleton from '../../components/skeleton/FormSkeleton';
import { useSupplierPaymentForm } from './partials/useSupplierPaymentForm';
import { SupplierFieldWatcher } from './partials/FieldWatchers';
import PaymentStatusCard from './partials/PaymentStatusCard';
import PaymentAllocationsView from './partials/PaymentAllocationsView';
import InvoiceAllocationsForm from './partials/InvoiceAllocationsForm';

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

const SupplierPaymentForm: FunctionComponent = () => {
    const {
        formMode,
        paymentId,
        loading,
        payment,
        outstandingInvoices,
        loadingInvoices,
        paymentMethodOptions,
        initialValues,
        handleSubmit,
        handleSupplierSelected,
        handleVoid,
    } = useSupplierPaymentForm();

    const isView = formMode === 'view';

    const pageTitle = isView
        ? `Payment${payment?.paymentNumber ? ` — ${payment.paymentNumber}` : ''}`
        : 'Record Supplier Payment';

    const pageIcon = isView
        ? <Eye className="w-8 h-8 text-emerald-500" />
        : <Wallet className="w-8 h-8 text-emerald-500" />;

    if (loading && !payment && paymentId) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <FormSkeleton sections={2} fieldsPerSection={4} />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize
                    initialValues={initialValues}
                    validationSchema={!isView ? validationSchema : undefined}
                >
                    {({ isSubmitting, values }) => (
                        <Form>
                            {!isView && (
                                <SupplierFieldWatcher onSupplierSelected={handleSupplierSelected} />
                            )}

                            <PageHeader
                                title={pageTitle}
                                description={
                                    isView
                                        ? 'View payment details and allocations'
                                        : 'Required fields are marked with an asterisk (*)'
                                }
                                icon={pageIcon}
                                showBackButton
                            />

                            <div className="mt-6 space-y-6">
                                {isView && payment && (
                                    <>
                                        <PaymentStatusCard payment={payment} onVoid={handleVoid} />
                                        <PaymentAllocationsView allocations={payment.allocations || []} />
                                    </>
                                )}

                                {!isView && (
                                    <>
                                        <FormFieldCard title="Payment Details">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-5">
                                                <SupplierSearchSelect name="supplierId" required />
                                                <FormInput label="Payment Date" name="paymentDate" type="date" required />
                                                <FormInput label="Payment Amount (MWK)" name="amount" type="number" placeholder="0.00" required />
                                                <FormSearchableSelect
                                                    label="Payment Method"
                                                    name="paymentMethod"
                                                    options={paymentMethodOptions}
                                                    placeholder="Select method..."
                                                    isClearable
                                                />
                                                <FormInput label="Reference / Cheque No." name="reference" placeholder="e.g. CHQ-00123" />
                                                <FormInput label="Notes" name="notes" placeholder="Optional notes..." />
                                            </div>
                                        </FormFieldCard>

                                        <InvoiceAllocationsForm
                                            outstandingInvoices={outstandingInvoices}
                                            loadingInvoices={loadingInvoices}
                                        />

                                        <div className="flex items-center justify-end gap-3 pt-2">
                                            <Button
                                                type="submit"
                                                theme="primary"
                                                disabled={isSubmitting || loading || values.allocations.length === 0}
                                            >
                                                {(isSubmitting || loading) && (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                )}
                                                Record Payment
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppLayout>
    );
};

export default SupplierPaymentForm;
