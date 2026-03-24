import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FunctionComponent, useCallback } from 'react';
import { FileText, Eye, Loader2, CheckCircle2 } from 'lucide-react';
import { Separator } from '@radix-ui/themes';
import { Flex } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import SupplierSearchSelect from '../../components/SupplierSearchSelect';
import FormSkeleton from '../../components/skeleton/FormSkeleton';
import { useSupplierInvoiceForm } from './partials/useSupplierInvoiceForm';
import { SupplierFieldWatcher, POFieldWatcher } from './partials/FieldWatchers';
import InvoiceStatusCard from './partials/InvoiceStatusCard';
import ThreeWayMatchPanel from './partials/ThreeWayMatchPanel';
import InvoiceItemsView from './partials/InvoiceItemsView';
import InvoiceItemsForm from './partials/InvoiceItemsForm';
import ApplyCreditModal from './partials/ApplyCreditModal';

// ─── Validation ─────────────────────────────────────────────────────────────

const validationSchema = Yup.object().shape({
    supplierId: Yup.string().required('Supplier is required'),
    invoiceNumber: Yup.string().required('Invoice number is required'),
    invoiceDate: Yup.string().required('Invoice date is required'),
    dueDate: Yup.string(),
    purchaseOrderId: Yup.string(),
    taxAmount: Yup.number().min(0, 'Tax must be 0 or higher'),
    discountAmount: Yup.number().min(0, 'Discount must be 0 or higher'),
    notes: Yup.string().max(1000, 'Notes are too long'),
    items: Yup.array()
        .of(
            Yup.object().shape({
                variantId: Yup.string().required('Product variant is required'),
                quantity: Yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1'),
                unitPrice: Yup.number().required('Unit price is required').min(0, 'Unit price must be 0 or higher'),
            }),
        )
        .min(1, 'At least one item is required'),
});

// ─── Component ──────────────────────────────────────────────────────────────

const SupplierInvoiceForm: FunctionComponent = () => {
    const {
        formMode,
        variantLabels,
        invoiceId,
        loading,
        loadingPO,
        invoice,
        matchData,
        showMatch,
        setShowMatch,
        poOptions,
        initialValues,

        showCreditModal,
        setShowCreditModal,
        pendingCreditNotes,
        loadingCredits,
        applyingCreditId,

        handleSubmit,
        handleSupplierChange,
        handlePOSelected,
        handleCancel,
        handleDispute,
        handleOpenCreditModal,
        handleApplyCreditNote,
    } = useSupplierInvoiceForm();

    const isView = formMode === 'view';

    const pageTitle = isView
        ? `Invoice${invoice?.invoiceNumber ? ` — ${invoice.invoiceNumber}` : ''}`
        : 'New Supplier Invoice';

    const pageIcon = isView
        ? <Eye className="w-8 h-8 text-indigo-500" />
        : <FileText className="w-8 h-8 text-indigo-500" />;

    // Wrap handlePOSelected so it captures setFieldValue from Formik render prop
    const makePOHandler = useCallback(
        (setFieldValue: (field: string, value: any) => void) =>
            (poId: string) => handlePOSelected(poId, setFieldValue),
        [handlePOSelected],
    );

    // ── Loading skeleton ──────────────────────────────────────────────────
    if (loading && !invoice && invoiceId) {
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
                    {({ isSubmitting, setFieldValue }) => (
                        <Form>
                            {/* Field watchers for cascading: supplier → POs → PO items */}
                            {!isView && (
                                <>
                                    <SupplierFieldWatcher onChange={handleSupplierChange} />
                                    <POFieldWatcher onPOSelected={makePOHandler(setFieldValue)} />
                                </>
                            )}

                            <PageHeader
                                title={pageTitle}
                                description={isView ? 'View invoice details' : 'Required fields are marked with an asterisk (*)'}
                                icon={pageIcon}
                                showBackButton
                            />

                            <div className="mt-6 space-y-6">
                                {/* ── Status & Info (View Mode) ──────────── */}
                                {isView && invoice && (
                                    <InvoiceStatusCard
                                        invoice={invoice}
                                        showMatch={showMatch}
                                        onToggleMatch={() => setShowMatch(!showMatch)}
                                        onDispute={handleDispute}
                                        onCancel={handleCancel}
                                        onApplyCredit={handleOpenCreditModal}
                                    />
                                )}

                                {/* ── 3-Way Match Panel ──────────────────── */}
                                {showMatch && <ThreeWayMatchPanel matchData={matchData} invoice={invoice} />}

                                {/* ── Invoice Details (Create Mode) ──────── */}
                                {!isView && (
                                    <FormFieldCard title="Invoice Details">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <SupplierSearchSelect name="supplierId" required />

                                            <FormSearchableSelect
                                                label="Link to Purchase Order"
                                                name="purchaseOrderId"
                                                options={poOptions}
                                                placeholder={loadingPO ? 'Loading PO details…' : 'Optional — select a PO...'}
                                                isClearable
                                                disabled={loadingPO}
                                            />

                                            <FormInput label="Invoice Number" name="invoiceNumber" placeholder="INV-001" required />
                                            <FormInput label="Invoice Date" name="invoiceDate" type="date" required />
                                            <FormInput label="Due Date" name="dueDate" type="date" />
                                            <FormInput label="Tax Amount (MWK)" name="taxAmount" type="number" step="0.01" min="0" />
                                            <FormInput label="Discount Amount (MWK)" name="discountAmount" type="number" step="0.01" min="0" />

                                            <div className="md:col-span-2">
                                                <FormInput label="Notes" name="notes" placeholder="Additional notes..." />
                                            </div>
                                        </div>
                                    </FormFieldCard>
                                )}

                                {/* ── Items ───────────────────────────────── */}
                                <FormFieldCard title={isView ? 'Invoice Items' : 'Items'}>
                                    {isView && invoice
                                        ? <InvoiceItemsView invoice={invoice} />
                                        : <InvoiceItemsForm variantLabels={variantLabels} />
                                    }
                                </FormFieldCard>

                                {/* ── Submit ──────────────────────────────── */}
                                {!isView && (
                                    <>
                                        <Separator size="4" />
                                        <Flex pt="4">
                                            <Button type="submit" theme="success" disabled={isSubmitting || loading}>
                                                {isSubmitting || loading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                        Create Invoice
                                                    </>
                                                )}
                                            </Button>
                                        </Flex>
                                    </>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>

            {/* ── Credit Note Modal ──────────────────────────── */}
            <ApplyCreditModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                invoice={invoice}
                creditNotes={pendingCreditNotes}
                loading={loadingCredits}
                applyingId={applyingCreditId}
                onApply={handleApplyCreditNote}
            />
        </AppLayout>
    );
};

export default SupplierInvoiceForm;
