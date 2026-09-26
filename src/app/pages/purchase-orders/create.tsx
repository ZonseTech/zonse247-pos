import { Form, Formik } from 'formik';
import { FunctionComponent } from 'react';
import { ShoppingCart, Eye, Loader2, CheckCircle2, ClipboardList } from 'lucide-react';
import { Separator } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { Button, FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import SupplierSearchSelect from '../../components/SupplierSearchSelect';
import FormSkeleton from '../../components/skeleton/FormSkeleton';
import ReceiveModal from './partials/ReceiveModal';
import { usePurchaseOrderForm } from '../../hooks/usePurchaseOrderForm';
import { useIsMobile } from '../../hooks/useMediaQuery';
import POStatusCard from './partials/POStatusCard';
import POViewItems from './partials/POViewItems';
import POItemsForm from './partials/POItemsForm';
import validationSchema from '../../schemas/purchase-order.schema';

const PurchaseOrderForm: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const {
        formMode,
        purchaseOrderId,
        requisitionIdFromState,
        loading,
        purchaseOrder,
        requisition,
        receivingPO,
        setReceivingPO,
        outstandingQtyMap,
        requisitionOptionMap,
        initialValues,
        supplierInitialOption,
        handleSubmit,
        handleSend,
        handleCancel,
        handleReceiveComplete,
        receivePurchaseOrder,
    } = usePurchaseOrderForm();

    const isView = formMode === 'view';

    const pageTitle = isView
        ? `Purchase Order${purchaseOrder?.poNumber ? ` — ${purchaseOrder.poNumber}` : ''}`
        : formMode === 'create-from-requisition'
            ? `New PO from Requisition${requisition?.requisitionNumber ? ` ${requisition.requisitionNumber}` : ''}`
            : 'New Purchase Order';

    const mobileTitle = isView
        ? purchaseOrder?.poNumber || 'Purchase Order'
        : formMode === 'create-from-requisition'
            ? 'PO from Requisition'
            : 'New Purchase Order';

    const pageIcon = isView
        ? <Eye className="w-8 h-8 text-sky-500" />
        : formMode === 'create-from-requisition'
            ? <ClipboardList className="w-8 h-8 text-indigo-500" />
            : <ShoppingCart className="w-8 h-8 text-sky-500" />;

    if (loading && !purchaseOrder && !requisition && (purchaseOrderId || requisitionIdFromState)) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                    <FormSkeleton sections={2} fieldsPerSection={3} />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Formik
                onSubmit={handleSubmit}
                enableReinitialize
                initialValues={initialValues}
                validationSchema={!isView ? validationSchema : undefined}
            >
                {({ isSubmitting, values }) => (
                    <Form className="flex flex-col h-full">
                        {isMobile ? (
                            <MobilePageHeader
                                title={mobileTitle}
                                rightContent={
                                    !isView ? (
                                        <Button
                                            type="submit"
                                            theme="success"
                                            disabled={isSubmitting || loading}
                                        >
                                            {(isSubmitting || loading)
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <CheckCircle2 className="w-4 h-4 mr-1" />
                                            }
                                            Save
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 w-full">
                                <PageHeader
                                    title={pageTitle}
                                    description={
                                        isView
                                            ? 'View purchase order details'
                                            : 'Required fields are marked with an asterisk (*)'
                                    }
                                    icon={pageIcon}
                                    showBackButton
                                />
                            </div>
                        )}

                        <div className="max-w-4xl mx-auto py-4 w-full space-y-3">
                            {isView && purchaseOrder && (
                                <POStatusCard
                                    purchaseOrder={purchaseOrder}
                                    onSend={handleSend}
                                    onReceive={() => setReceivingPO(purchaseOrder)}
                                    onCancel={handleCancel}
                                />
                            )}

                            {formMode === 'create-from-requisition' && requisition && (
                                <div className="flex items-center gap-3 p-3.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                    <ClipboardList className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                    <p className="text-sm text-indigo-800 dark:text-indigo-300">
                                        Creating PO from approved requisition{' '}
                                        <span className="font-semibold">{requisition.requisitionNumber}</span>.
                                        Items are pre-filled with approved quantities. Please select a supplier and set unit prices.
                                    </p>
                                </div>
                            )}

                            {!isView && (
                                <FormFieldCard title="Order Details">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                                        <SupplierSearchSelect
                                            name="supplierId"
                                            required
                                            disabled={isView}
                                            initialOption={supplierInitialOption}
                                        />
                                        <FormInput
                                            label="Expected Delivery Date"
                                            name="expectedDeliveryDate"
                                            type="date"
                                            disabled={isView}
                                        />
                                        <div className="sm:col-span-2">
                                            <FormInput
                                                label="Notes"
                                                name="notes"
                                                placeholder="Additional order notes..."
                                                disabled={isView}
                                            />
                                        </div>
                                    </div>
                                </FormFieldCard>
                            )}

                            <FormFieldCard title={isView ? 'Order Items' : 'Items'}>
                                {isView && purchaseOrder ? (
                                    <POViewItems purchaseOrder={purchaseOrder} values={values} />
                                ) : (
                                    <POItemsForm
                                        items={values.items}
                                        formMode={formMode}
                                        outstandingQtyMap={outstandingQtyMap}
                                        requisitionOptionMap={requisitionOptionMap}
                                    />
                                )}
                            </FormFieldCard>

                            {!isView && !isMobile && (
                                <>
                                    <Separator size="4" />
                                    <div className="flex items-center justify-end gap-3 pt-2 pb-4">
                                        <Button
                                            type="submit"
                                            theme="success"
                                            disabled={isSubmitting || loading}
                                        >
                                            {(isSubmitting || loading) ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Create Purchase Order
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </Form>
                )}
            </Formik>

            {receivingPO && (
                <ReceiveModal
                    purchaseOrder={receivingPO}
                    onClose={() => setReceivingPO(null)}
                    onReceive={async (poId, payload) => {
                        await receivePurchaseOrder(poId, payload);
                        await handleReceiveComplete();
                    }}
                />
            )}
        </AppLayout>
    );
};

export default PurchaseOrderForm;
