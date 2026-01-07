import * as Yup from 'yup';
import { Form, Formik, FieldArray } from 'formik';
import { FunctionComponent, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSelectBox from '../../components/FormSelectBox';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import { ROUTES } from '../../utils/constants';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useProducts } from '../../hooks/useProducts';

const PurchaseOrderForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { create, getById } = usePurchaseOrders();
    const { suppliers } = useSuppliers();
    const { products } = useProducts();

    const purchaseOrderId = (location.state as any)?.purchaseOrderId;
    const isEditMode = !!purchaseOrderId;

    const [loading, setLoading] = useState(false);
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);

    useEffect(() => {
        if (isEditMode) {
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

    const supplierOptions = suppliers.map(s => ({ label: s.name, value: s.id }));
    const productOptions = products.map(p => ({ label: `${p.name} (${p.sku})`, value: p.id }));

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
        setLoading(true);
        try {
            const payload = {
                ...values,
                items: values.items.map(item => ({
                    ...item,
                    orderedQuantity: Number(item.orderedQuantity),
                    unitPrice: Number(item.unitPrice),
                })),
            };

            if (isEditMode) {
                await create({ ...payload, id: purchaseOrderId } as any);
                Report.success('Success', 'Purchase order updated successfully', 'Okay', () => {
                    navigate(ROUTES.PURCHASE_ORDERS);
                });
            } else {
                await create(payload as any);
                Confirm.show(
                    'Purchase Order Saved',
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
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            const errorMessage = error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} purchase order`;
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !purchaseOrder && purchaseOrderId) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-600 dark:text-gray-400">Loading purchase order details...</div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className='sticky top-0 z-10 bg-white dark:bg-gray-800'>
                    <PageHeader
                        title={isEditMode ? 'Edit Purchase Order' : 'Add New Purchase Order'}
                        description={isEditMode ? 'Update purchase order information' : 'Required fields are marked with an asterisk (*)'}
                        icon={<ShoppingCart className="w-8 h-8 text-blue-600" />}
                    />
                </div>

                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialPOValues}
                    validationSchema={purchaseOrderValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form>
                            <FormWrapper>
                                <div className="py-6 relative">
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                            1
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Order Details
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                        <FormSelectBox
                                            label="Supplier"
                                            name="supplierId"
                                            options={supplierOptions}
                                            required
                                        />

                                        <FormInput
                                            label="Expected Delivery Date"
                                            name="expectedDeliveryDate"
                                            type="date"
                                        />

                                        <div className="md:col-span-2">
                                            <FormInput
                                                label="Notes"
                                                name="notes"
                                                placeholder="Additional order notes..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pb-8 relative">
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                            2
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Order Items
                                        </h3>
                                    </div>
                                    <div className="ml-11">
                                        <FieldArray name="items">
                                            {({ push, remove }) => (
                                                <div className="space-y-4">
                                                    <Button
                                                        type="button"
                                                        onClick={() => push({ productId: '', orderedQuantity: 1, unitPrice: 0 })}
                                                        theme="neutral"
                                                        layout="outline"
                                                        className="mb-4"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Item
                                                    </Button>

                                                    {values.items.map((item, index) => (
                                                        <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <span className="font-medium text-gray-900 dark:text-white">Item #{index + 1}</span>
                                                                {values.items.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => remove(index)}
                                                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <FormSearchableSelect
                                                                    label="Product"
                                                                    name={`items.${index}.productId`}
                                                                    options={productOptions}
                                                                    placeholder="Search for a product..."
                                                                    required
                                                                />
                                                                <FormInput
                                                                    label="Quantity"
                                                                    name={`items.${index}.orderedQuantity`}
                                                                    type="number"
                                                                    min="1"
                                                                    required
                                                                />
                                                                <FormInput
                                                                    label="Unit Cost"
                                                                    name={`items.${index}.unitPrice`}
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                                Subtotal: {new Intl.NumberFormat('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'MWK'
                                                                }).format((item.orderedQuantity || 0) * (item.unitPrice || 0))}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {values.items.length > 0 && (
                                                        <div className="border-t dark:border-gray-700 pt-4 mt-4">
                                                            <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                                                                <span>Total:</span>
                                                                <span>
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
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-300 dark:border-gray-600">
                                    <Button
                                        type="button"
                                        theme="neutral"
                                        onClick={() => navigate(ROUTES.PURCHASE_ORDERS)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        theme="primary"
                                        disabled={isSubmitting || loading}
                                    >
                                        {isSubmitting || loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            isEditMode ? 'Update Purchase Order' : 'Create Purchase Order'
                                        )}
                                    </Button>
                                </div>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppLayout>
    );
};

export default PurchaseOrderForm;
