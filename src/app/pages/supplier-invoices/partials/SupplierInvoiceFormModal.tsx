import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FunctionComponent, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Flex, Button, Text } from '@radix-ui/themes';
import FormModal from '../../../components/FormModal';
import { FormFieldCard } from '../../../components';
import TextInput from '../../../components/TextInput';
import FormSearchableSelect from '../../../components/FormSearchableSelect';
import SupplierSearchSelect from '../../../components/SupplierSearchSelect';
import { useSupplierInvoiceForm } from './useSupplierInvoiceForm';
import { SupplierFieldWatcher, POFieldWatcher } from './FieldWatchers';
import InvoiceStatusCard from './InvoiceStatusCard';
import ThreeWayMatchPanel from './ThreeWayMatchPanel';
import InvoiceItemsView from './InvoiceItemsView';
import InvoiceItemsForm from './InvoiceItemsForm';
import ApplyCreditModal from './ApplyCreditModal';

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
                quantity: Yup.number()
                    .required('Quantity is required')
                    .min(1, 'Quantity must be at least 1'),
                unitPrice: Yup.number()
                    .required('Unit price is required')
                    .min(0, 'Unit price must be 0 or higher'),
            }),
        )
        .min(1, 'At least one item is required'),
});

interface SupplierInvoiceFormModalProps {
    invoiceId?: string;
    onClose: () => void;
    onSaved: () => void;
}

const SupplierInvoiceFormModal: FunctionComponent<
    SupplierInvoiceFormModalProps
> = ({ invoiceId, onClose, onSaved }) => {
    const {
        formMode,
        variantLabels,
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
    } = useSupplierInvoiceForm({
        invoiceId,
        onSaved: () => {
            onSaved();
            onClose();
        },
    });

    const isView = formMode === 'view';
    const title = isView
        ? `Invoice${invoice?.invoiceNumber ? ` — ${invoice.invoiceNumber}` : ''}`
        : 'New Supplier Invoice';

    const makePOHandler = useCallback(
        (setFieldValue: (field: string, value: any) => void) =>
            (poId: string) =>
                handlePOSelected(poId, setFieldValue),
        [handlePOSelected],
    );

    if (loading && !invoice && invoiceId) {
        return (
            <>
                <FormModal
                    open
                    onOpenChange={(open) => {
                        if (!open) onClose();
                    }}
                    title={title}
                    size="xl"
                >
                    <Flex align="center" justify="center" className="h-64">
                        <Text color="gray">Loading invoice details...</Text>
                    </Flex>
                </FormModal>
                <ApplyCreditModal
                    isOpen={showCreditModal}
                    onClose={() => setShowCreditModal(false)}
                    invoice={invoice}
                    creditNotes={pendingCreditNotes}
                    loading={loadingCredits}
                    applyingId={applyingCreditId}
                    onApply={handleApplyCreditNote}
                />
            </>
        );
    }

    return (
        <>
            <Formik
                onSubmit={handleSubmit}
                enableReinitialize
                initialValues={initialValues}
                validationSchema={!isView ? validationSchema : undefined}
            >
                {({ isSubmitting, setFieldValue }) => (
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
                                        {isView ? 'Close' : 'Cancel'}
                                    </Button>
                                </Dialog.Close>
                                {!isView && (
                                    <Button
                                        type="submit"
                                        form="supplier-invoice-form"
                                        disabled={isSubmitting || loading}
                                        loading={isSubmitting || loading}
                                    >
                                        Create Invoice
                                    </Button>
                                )}
                            </Flex>
                        }
                    >
                        <Form id="supplier-invoice-form">
                            {!isView && (
                                <>
                                    <SupplierFieldWatcher
                                        onChange={handleSupplierChange}
                                    />
                                    <POFieldWatcher
                                        onPOSelected={makePOHandler(
                                            setFieldValue,
                                        )}
                                    />
                                </>
                            )}

                            <Flex direction="column" gap="4">
                                {isView && invoice && (
                                    <InvoiceStatusCard
                                        invoice={invoice}
                                        showMatch={showMatch}
                                        onToggleMatch={() =>
                                            setShowMatch(!showMatch)
                                        }
                                        onDispute={handleDispute}
                                        onCancel={handleCancel}
                                        onApplyCredit={handleOpenCreditModal}
                                    />
                                )}

                                {showMatch && (
                                    <ThreeWayMatchPanel
                                        matchData={matchData}
                                        invoice={invoice}
                                    />
                                )}

                                {!isView && (
                                    <FormFieldCard title="Invoice Details">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <SupplierSearchSelect
                                                name="supplierId"
                                                required
                                            />
                                            <FormSearchableSelect
                                                label="Link to Purchase Order"
                                                name="purchaseOrderId"
                                                options={poOptions}
                                                placeholder={
                                                    loadingPO
                                                        ? 'Loading PO details…'
                                                        : 'Optional — select a PO...'
                                                }
                                                isClearable
                                                disabled={loadingPO}
                                            />
                                            <TextInput
                                                label="Invoice Number"
                                                name="invoiceNumber"
                                                placeholder="INV-001"
                                                required
                                            />
                                            <TextInput
                                                label="Invoice Date"
                                                name="invoiceDate"
                                                type="date"
                                                required
                                            />
                                            <TextInput
                                                label="Due Date"
                                                name="dueDate"
                                                type="date"
                                            />
                                            <TextInput
                                                label="Tax Amount (MWK)"
                                                name="taxAmount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                            />
                                            <TextInput
                                                label="Discount Amount (MWK)"
                                                name="discountAmount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                            />
                                            <div className="md:col-span-2">
                                                <TextInput
                                                    label="Notes"
                                                    name="notes"
                                                    placeholder="Additional notes..."
                                                />
                                            </div>
                                        </div>
                                    </FormFieldCard>
                                )}

                                <FormFieldCard
                                    title={isView ? 'Invoice Items' : 'Items'}
                                >
                                    {isView && invoice ? (
                                        <InvoiceItemsView invoice={invoice} />
                                    ) : (
                                        <InvoiceItemsForm
                                            variantLabels={variantLabels}
                                        />
                                    )}
                                </FormFieldCard>
                            </Flex>
                        </Form>
                    </FormModal>
                )}
            </Formik>

            <ApplyCreditModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                invoice={invoice}
                creditNotes={pendingCreditNotes}
                loading={loadingCredits}
                applyingId={applyingCreditId}
                onApply={handleApplyCreditNote}
            />
        </>
    );
};

export default SupplierInvoiceFormModal;
