import * as Yup from 'yup';
import { Form, Formik, FieldArray } from 'formik';
import { FunctionComponent, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ClipboardList, Plus, Trash2, Eye, X, Loader2, CheckCircle2, Package } from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import { ROUTES } from '../../utils/constants';
import { usePurchaseRequisitions } from '../../hooks/usePurchaseRequisitions';
import { useProducts } from '../../hooks/useProducts';
import FormSkeleton from '../../components/skeleton/FormSkeleton';
import { getErrorMessage } from '../../utils/api-error-handler';

const PurchaseRequisitionForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { create, getById, updateRequisition } = usePurchaseRequisitions();
    const { products } = useProducts();

    const requisitionId = (location.state as any)?.requisitionId;
    const isEditMode = (location.state as any)?.edit === true;
    const isViewMode = !!requisitionId && !isEditMode;

    const [loading, setLoading] = useState(false);
    const [requisition, setRequisition] = useState<PurchaseRequisitionWithItems | null>(null);

    useEffect(() => {
        if (requisitionId) {
            loadRequisition();
        }
    }, [requisitionId]);

    const loadRequisition = async () => {
        if (!requisitionId) return;

        setLoading(true);
        try {
            const data = await getById(requisitionId);
            if (data) {
                setRequisition(data);
            }
        } catch (error: any) {
            console.error('Error fetching requisition:', error);
            Notify.failure(getErrorMessage(error, 'Failed to load requisition details'));
        } finally {
            setLoading(false);
        }
    };

    // Map products (which are flattened variants) to select options
    const variantOptions = useMemo(() =>
        products.map(p => ({
            label: `${p.name} - ${p.variantName} (${p.sku || 'No SKU'})`,
            value: p.id, // This is the variant ID
        })),
        [products]
    );

    const defaultValues = {
        notes: '',
        items: [{ variantId: '', requestedQuantity: 1, notes: '' }],
    };

    const initialValues = requisition ? {
        notes: requisition.notes || '',
        items: requisition.items.map(item => ({
            variantId: item.variantId,
            requestedQuantity: item.requestedQuantity,
            notes: item.notes || '',
        })),
    } : defaultValues;

    const validationSchema = Yup.object().shape({
        notes: Yup.string().max(1000, 'Notes are too long'),
        items: Yup.array()
            .of(
                Yup.object().shape({
                    variantId: Yup.string().required('Product/Variant is required'),
                    requestedQuantity: Yup.number()
                        .required('Quantity is required')
                        .min(1, 'Quantity must be at least 1'),
                    notes: Yup.string().max(500, 'Notes are too long'),
                })
            )
            .min(1, 'At least one item is required'),
    });

    const handleSubmit = async (values: typeof defaultValues, { resetForm }: any) => {
        if (isViewMode) return;

        setLoading(true);
        try {
            const payload: CreateRequisitionInput = {
                notes: values.notes || undefined,
                items: values.items.map(item => ({
                    variantId: item.variantId,
                    requestedQuantity: Number(item.requestedQuantity),
                    notes: item.notes || undefined,
                })),
            };

            if (isEditMode && requisitionId) {
                await updateRequisition(requisitionId, payload as UpdateRequisitionInput);
                Confirm.show(
                    'Requisition Updated',
                    'Requisition updated successfully. What would you like to do?',
                    'Continue Editing',
                    'Go to Requisitions',
                    () => { /* stay */ },
                    () => {
                        navigate(ROUTES.PURCHASE_REQUISITIONS);
                    }
                );
            } else {
                await create(payload);
                Confirm.show(
                    'Requisition Created',
                    'Purchase requisition created successfully. What would you like to do?',
                    'Add Another',
                    'Go to Requisitions',
                    () => {
                        resetForm();
                    },
                    () => {
                        navigate(ROUTES.PURCHASE_REQUISITIONS);
                    }
                );
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            const errorMessage = getErrorMessage(error, 'Failed to save requisition');
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    // Status badge for view mode
    const getStatusBadge = (status: RequisitionStatusType) => {
        const config: Record<RequisitionStatusType, { bg: string; text: string; label: string }> = {
            PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', label: 'Pending' },
            APPROVED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', label: 'Approved' },
            PARTIALLY_APPROVED: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-800 dark:text-sky-400', label: 'Partially Approved' },
            REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', label: 'Rejected' },
            CANCELLED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', label: 'Cancelled' },
        };
        const c = config[status] || config.PENDING;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text}`}>
                {c.label}
            </span>
        );
    };

    if (loading && !requisition && requisitionId) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <FormSkeleton sections={2} fieldsPerSection={3} />
                </div>
            </AppLayout>
        );
    }

    const canEdit = !requisitionId || (isEditMode && requisition?.status === 'PENDING');

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                >
                    {({ isSubmitting, values }) => (
                        <Form>
                            <PageHeader
                                title={
                                    isViewMode
                                        ? `Requisition${requisition?.requisitionNumber ? ` - ${requisition.requisitionNumber}` : ''}`
                                        : isEditMode
                                            ? `Edit Requisition${requisition?.requisitionNumber ? ` - ${requisition.requisitionNumber}` : ''}`
                                            : 'New Purchase Requisition'
                                }
                                description={
                                    isViewMode
                                        ? 'View requisition details (read-only)'
                                        : isEditMode
                                            ? 'Update requisition items and notes'
                                            : 'Required fields are marked with an asterisk (*)'
                                }
                                icon={isViewMode ? <Eye className="w-8 h-8 text-sky-500" /> : <ClipboardList className="w-8 h-8 text-sky-500" />}
                                showBackButton
                            />

                            <div className="mt-6 space-y-6">
                                {/* Status + Info Card (View Mode) */}
                                {isViewMode && requisition && (
                                    <FormFieldCard title="Requisition Info">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                                                {getStatusBadge(requisition.status)}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Requested By</label>
                                                <p className="text-gray-900 dark:text-gray-100">
                                                    {requisition.requestedByUser
                                                        ? requisition.requestedByUser.fullname
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created</label>
                                                <p className="text-gray-900 dark:text-gray-100">
                                                    {new Date(requisition.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            {requisition.approvedBy && requisition.approvedByUser && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Approved By</label>
                                                    <p className="text-gray-900 dark:text-gray-100">
                                                        {requisition.approvedByUser.fullname}
                                                    </p>
                                                </div>
                                            )}
                                            {requisition.rejectedReason && (
                                                <div className="md:col-span-3">
                                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Rejection Reason</label>
                                                    <p className="text-red-600 dark:text-red-400">{requisition.rejectedReason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </FormFieldCard>
                                )}

                                {/* Notes */}
                                <FormFieldCard title="Details">
                                    <div className="grid grid-cols-1 gap-4">
                                        <FormInput
                                            label="Notes"
                                            name="notes"
                                            placeholder="Reason for requisition, urgency notes, etc."
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </FormFieldCard>

                                {/* Items */}
                                <FormFieldCard title="Requisition Items">
                                    <FieldArray name="items">
                                        {({ push, remove }) => (
                                            <div className="space-y-4">
                                                {canEdit && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => push({ variantId: '', requestedQuantity: 1, notes: '' })}
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
                                                        {values.items.map((item, index) => {
                                                            // Get the matching requisition item for view mode (shows approved qty)
                                                            const reqItem = requisition?.items?.[index];

                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                                                >
                                                                    <div className="flex justify-between items-center mb-3">
                                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                            Item #{index + 1}
                                                                        </span>
                                                                        {canEdit && values.items.length > 1 && (
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
                                                                            label="Product / Variant"
                                                                            name={`items.${index}.variantId`}
                                                                            options={variantOptions}
                                                                            placeholder="Search product..."
                                                                            required
                                                                            disabled={!canEdit}
                                                                        />
                                                                        <FormInput
                                                                            label="Requested Qty"
                                                                            name={`items.${index}.requestedQuantity`}
                                                                            type="number"
                                                                            min="1"
                                                                            required
                                                                            disabled={!canEdit}
                                                                        />
                                                                        <FormInput
                                                                            label="Item Notes"
                                                                            name={`items.${index}.notes`}
                                                                            placeholder="Optional notes..."
                                                                            disabled={!canEdit}
                                                                        />
                                                                    </div>

                                                                    {/* Show approved quantity in view mode */}
                                                                    {isViewMode && reqItem && reqItem.approvedQuantity != null && (
                                                                        <div className="mt-2 text-sm">
                                                                            <span className="text-gray-500 dark:text-gray-400">Approved Qty: </span>
                                                                            <span className={`font-medium ${reqItem.approvedQuantity < reqItem.requestedQuantity
                                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                                : 'text-green-600 dark:text-green-400'
                                                                                }`}>
                                                                                {reqItem.approvedQuantity}
                                                                                {reqItem.approvedQuantity < reqItem.requestedQuantity && (
                                                                                    <span className="text-gray-400 ml-1">
                                                                                        (of {reqItem.requestedQuantity})
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Summary */}
                                                {values.items.length > 0 && (
                                                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                                                        <div className="text-lg">
                                                            <span className="text-gray-600 dark:text-gray-400">Total Items: </span>
                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                {values.items.length}
                                                            </span>
                                                            <span className="mx-3 text-gray-300 dark:text-gray-600">|</span>
                                                            <span className="text-gray-600 dark:text-gray-400">Total Qty: </span>
                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                {values.items.reduce((sum, item) => sum + (Number(item.requestedQuantity) || 0), 0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </FieldArray>
                                </FormFieldCard>

                                {/* Form Actions */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        theme={isViewMode ? "primary" : "danger"}
                                        onClick={() => navigate(ROUTES.PURCHASE_REQUISITIONS)}
                                        disabled={isSubmitting || loading}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        {isViewMode ? 'Back to List' : 'Cancel'}
                                    </Button>

                                    <div className="flex items-center gap-3">
                                        {/* Edit button in view mode for PENDING requisitions */}
                                        {isViewMode && requisition?.status === 'PENDING' && (
                                            <Button
                                                type="button"
                                                theme="primary"
                                                layout="outline"
                                                onClick={() => navigate(ROUTES.PURCHASE_REQUISITION_FORM, {
                                                    state: { requisitionId: requisition.id, edit: true }
                                                })}
                                            >
                                                Edit Requisition
                                            </Button>
                                        )}

                                        {canEdit && !isViewMode && (
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
                                                        {isEditMode ? 'Update Requisition' : 'Create Requisition'}
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppLayout>
    );
};

export default PurchaseRequisitionForm;
