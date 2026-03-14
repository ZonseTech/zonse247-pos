import * as Yup from 'yup';
import { Form, Formik, FieldArray } from 'formik';
import { FunctionComponent, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ShoppingCart, Plus, Trash2, Eye, X, Loader2, CheckCircle2, Package } from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import { ROUTES } from '../../utils/constants';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useProducts } from '../../hooks/useProducts';
import FormSkeleton from '../../components/skeleton/FormSkeleton';

const PurchaseOrderForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { create, getById } = usePurchaseOrders();
    const { suppliers } = useSuppliers();
    const { products } = useProducts();

    const purchaseOrderId = (location.state as any)?.purchaseOrderId;
    const isViewMode = !!purchaseOrderId; // View mode for existing POs (API doesn't support update)

    const [loading, setLoading] = useState(false);
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);

    useEffect(() => {
        if (isViewMode) {
            loadPurchaseOrder();
        }
    }, [purchaseOrderId]);

    const loadPurchaseOrder = async () => {
        if (!purchaseOrderId) return;

        setLoading(true);
        try {
            const poData = await getById(purchaseOrderId);
            if (poData) {
                setPurchaseOrder(poData);
            }
        } catch (error: any) {
            console.error('Error fetching purchase order:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load purchase order details';
            Notify.failure(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const supplierOptions = useMemo(() =>
        suppliers.map(s => ({ label: s.name, value: s.id })),
        [suppliers]
    );

    const productOptions = useMemo(() =>
        products.map(p => ({ label: `${p.name} (${p.sku})`, value: p.id })),
        [products]
    );

    const defaultPOValues = {
        supplierId: '',
        expectedDeliveryDate: '',
        notes: '',
        items: [{ productId: '', orderedQuantity: 1, unitPrice: 0 }],
    };

    const initialPOValues = purchaseOrder ? {
        supplierId: purchaseOrder.supplierId,
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate ?
            new Date(purchaseOrder.expectedDeliveryDate).toISOString().split('T')[0] : '',
        notes: purchaseOrder.notes || '',
        items: purchaseOrder.items.map(item => ({
            productId: item.productId,
            orderedQuantity: item.orderedQuantity,
            unitPrice: item.unitPrice,
        })),
    } : defaultPOValues;

    const purchaseOrderValidationSchema = Yup.object().shape({
        supplierId: Yup.string().required('Supplier is required'),
        expectedDeliveryDate: Yup.string(),
        notes: Yup.string().max(1000, 'Notes are too long'),
        items: Yup.array()
            .of(
                Yup.object().shape({
                    productId: Yup.string().required('Product is required'),
                    orderedQuantity: Yup.number()
                        .required('Quantity is required')
                        .min(1, 'Quantity must be at least 1'),
                    unitPrice: Yup.number()
                        .required('Unit price is required')
                        .min(0, 'Unit price must be 0 or higher'),
                })
            )
            .min(1, 'At least one item is required'),
    });

    const calculateTotal = (items: typeof defaultPOValues.items) => {
        return items.reduce((sum, item) => sum + (item.orderedQuantity * item.unitPrice), 0);
    };

    const handleSubmit = async (values: typeof defaultPOValues, { resetForm }: any) => {
        // Don't allow submit in view mode
        if (isViewMode) return;

        setLoading(true);
        try {
            const payload: CreatePurchaseOrderInput = {
                supplierId: values.supplierId,
                expectedDeliveryDate: values.expectedDeliveryDate || undefined,
                notes: values.notes || undefined,
                items: values.items.map(item => ({
                    productId: item.productId,
                    orderedQuantity: Number(item.orderedQuantity),
                    unitPrice: Number(item.unitPrice),
                })),
            };

            await create(payload);
            Confirm.show(
                'Purchase Order Created',
                'Purchase order created successfully. What would you like to do?',
                'Add Another',
                'Go to Purchase Orders',
                () => {
                    resetForm();
                },
                () => {
                    navigate(ROUTES.PURCHASE_ORDERS);
                }
            );
        } catch (error: any) {
            console.error('Submit error:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to create purchase order';
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !purchaseOrder && purchaseOrderId) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <FormSkeleton sections={2} fieldsPerSection={3} />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialPOValues}
                    validationSchema={purchaseOrderValidationSchema}
                >
                    {({ isSubmitting, values }) => (
                        <Form>
                            <PageHeader
                                title={isViewMode ? `View Purchase Order${purchaseOrder?.poNumber ? ` - ${purchaseOrder.poNumber}` : ''}` : 'Add New Purchase Order'}
                                description={isViewMode ? 'View purchase order details (read-only)' : 'Required fields are marked with an asterisk (*)'}
                                icon={isViewMode ? <Eye className="w-8 h-8 text-sky-500" /> : <ShoppingCart className="w-8 h-8 text-sky-500" />}
                                showBackButton
                            />

                            <div className="mt-6 space-y-6">
                                <FormFieldCard title="Order Details">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormSearchableSelect
                                            label="Supplier"
                                            name="supplierId"
                                            options={supplierOptions}
                                            placeholder="Search and select supplier..."
                                            required
                                            disabled={isViewMode}
                                        />

                                        <FormInput
                                            label="Expected Delivery Date"
                                            name="expectedDeliveryDate"
                                            type="date"
                                            disabled={isViewMode}
                                        />

                                        <div className="md:col-span-2">
                                            <FormInput
                                                label="Notes"
                                                name="notes"
                                                placeholder="Additional order notes..."
                                                disabled={isViewMode}
                                            />
                                        </div>
                                    </div>
                                </FormFieldCard>

                                <FormFieldCard title="Order Items">
                                    <FieldArray name="items">
                                        {({ push, remove }) => (
                                            <div className="space-y-4">
                                                {!isViewMode && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => push({ productId: '', orderedQuantity: 1, unitPrice: 0 })}
                                                        theme="primary"
                                                        layout="outline"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Item
                                                    </Button>
                                                )}

                                                {values.items.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                                        <Package className="w-12 h-12 mb-2 opacity-50" />
                                                        <p>No items added yet</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {values.items.map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                                            >
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        Item #{index + 1}
                                                                    </span>
                                                                    {!isViewMode && values.items.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => remove(index)}
                                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                            title="Remove item"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                    <FormSearchableSelect
                                                                        label="Product"
                                                                        name={`items.${index}.productId`}
                                                                        options={productOptions}
                                                                        placeholder="Search product..."
                                                                        required
                                                                        disabled={isViewMode}
                                                                    />
                                                                    <FormInput
                                                                        label="Quantity"
                                                                        name={`items.${index}.orderedQuantity`}
                                                                        type="number"
                                                                        min="1"
                                                                        required
                                                                        disabled={isViewMode}
                                                                    />
                                                                    <FormInput
                                                                        label="Unit Cost"
                                                                        name={`items.${index}.unitPrice`}
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        required
                                                                        disabled={isViewMode}
                                                                    />
                                                                </div>
                                                                <div className="mt-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                                                    Subtotal: <span className="font-medium text-gray-900 dark:text-white">
                                                                        {new Intl.NumberFormat('en-US', {
                                                                            style: 'currency',
                                                                            currency: 'MWK'
                                                                        }).format((item.orderedQuantity || 0) * (item.unitPrice || 0))}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {values.items.length > 0 && (
                                                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                                                        <div className="text-lg">
                                                            <span className="text-gray-600 dark:text-gray-400">Total: </span>
                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                {new Intl.NumberFormat('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'MWK'
                                                                }).format(calculateTotal(values.items))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </FieldArray>
                                </FormFieldCard>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        theme={isViewMode ? "primary" : "danger"}
                                        onClick={() => navigate(ROUTES.PURCHASE_ORDERS)}
                                        disabled={isSubmitting || loading}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        {isViewMode ? 'Back to List' : 'Cancel'}
                                    </Button>
                                    {!isViewMode && (
                                        <Button
                                            type="submit"
                                            theme="success"
                                            disabled={isSubmitting || loading}
                                        >
                                            {isSubmitting || loading ? (
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
                                    )}
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppLayout>
    );
};

export default PurchaseOrderForm;
