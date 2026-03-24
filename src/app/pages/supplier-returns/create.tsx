import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FunctionComponent } from 'react';
import { RotateCcw, Eye, Loader2 } from 'lucide-react';
import { Box, Flex, Button as RadixButton } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import SupplierSearchSelect from '../../components/SupplierSearchSelect';
import FormSkeleton from '../../components/skeleton/FormSkeleton';
import { useSupplierReturnForm } from './partials/useSupplierReturnForm';
import { SupplierFieldWatcher, GRNFieldWatcher } from './partials/FieldWatchers';
import ReturnStatusCard from './partials/ReturnStatusCard';
import ReturnItemsView from './partials/ReturnItemsView';
import CreditNotesView from './partials/CreditNotesView';
import ReturnItemsForm from './partials/ReturnItemsForm';
import { RETURN_REASONS } from './partials/types';

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

const SupplierReturnForm: FunctionComponent = () => {
    const {
        formMode,
        returnId,
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
    } = useSupplierReturnForm();

    const isView = formMode === 'view';

    const pageTitle = isView
        ? `Return${returnData?.returnNumber ? ` — ${returnData.returnNumber}` : ''}`
        : 'New Supplier Return';

    const pageIcon = isView
        ? <Eye className="w-8 h-8 text-orange-500" />
        : <RotateCcw className="w-8 h-8 text-orange-500" />;

    const hasSupplier = !!selectedSupplierId;

    if (loading && !returnData && returnId) {
        return (
            <AppLayout>
                <Box className="max-w-4xl mx-auto" px={{ initial: '4', sm: '6', lg: '8' }} py="6">
                    <FormSkeleton sections={2} fieldsPerSection={4} />
                </Box>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Box className="max-w-4xl mx-auto" px={{ initial: '4', sm: '6', lg: '8' }} py="6">
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize
                    initialValues={initialValues}
                    validationSchema={!isView ? validationSchema : undefined}
                >
                    {({ isSubmitting, values }) => (
                        <Form>
                            {!isView && (
                                <>
                                    <SupplierFieldWatcher onSupplierChanged={handleSupplierChanged} />
                                    <GRNFieldWatcher
                                        onGRNSelected={handleGRNSelected}
                                        onGRNCleared={handleGRNCleared}
                                    />
                                </>
                            )}

                            <PageHeader
                                title={pageTitle}
                                description={
                                    isView
                                        ? 'View return details, items, and credit notes'
                                        : 'Required fields are marked with an asterisk (*)'
                                }
                                icon={pageIcon}
                                showBackButton
                            />

                            <Flex direction="column" gap="5" mt="6">
                                {isView && returnData && (
                                    <>
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
                                        {returnData.creditNotes && returnData.creditNotes.length > 0 && (
                                            <CreditNotesView creditNotes={returnData.creditNotes} />
                                        )}
                                    </>
                                )}

                                {!isView && (
                                    <>
                                        {/* ── Step 1: Select Supplier ── */}
                                        <FormFieldCard title="Supplier">
                                            <Box p="5">
                                                <SupplierSearchSelect name="supplierId" required />
                                            </Box>
                                        </FormFieldCard>

                                        {/* ── Step 2: Link to GRN / PO (only after supplier selected) ── */}
                                        <FormFieldCard title="Return Details">
                                            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5" p="5">
                                                <FormSearchableSelect
                                                    label="Goods Receipt (optional)"
                                                    name="goodsReceiptId"
                                                    options={grnOptions}
                                                    placeholder={hasSupplier ? 'Link to GRN...' : 'Select a supplier first'}
                                                    isClearable
                                                    disabled={!hasSupplier}
                                                />
                                                <FormSearchableSelect
                                                    label="Purchase Order (optional)"
                                                    name="purchaseOrderId"
                                                    options={poOptions}
                                                    placeholder={hasSupplier ? 'Link to PO...' : 'Select a supplier first'}
                                                    isClearable
                                                    disabled={!hasSupplier || !!values.goodsReceiptId}
                                                />
                                                <FormSearchableSelect
                                                    label="Reason"
                                                    name="reason"
                                                    options={RETURN_REASONS}
                                                    placeholder="Select reason..."
                                                    isClearable
                                                />
                                                <Box className="sm:col-span-2">
                                                    <FormInput label="Notes" name="notes" placeholder="Additional notes..." />
                                                </Box>
                                            </Box>
                                        </FormFieldCard>

                                        {/* ── Step 3: Return Items ── */}
                                        <ReturnItemsForm />

                                        <Flex justify="end" gap="3" pt="2">
                                            <RadixButton
                                                type="submit"
                                                size="2"
                                                disabled={isSubmitting || loading}
                                            >
                                                {(isSubmitting || loading) && (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                )}
                                                Create Return (Draft)
                                            </RadixButton>
                                        </Flex>
                                    </>
                                )}
                            </Flex>
                        </Form>
                    )}
                </Formik>
            </Box>
        </AppLayout>
    );
};

export default SupplierReturnForm;
