import { FC, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notify } from 'notiflix';
import { Formik, Form, FieldArray, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { Plus, Trash2, ClipboardList, Package } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, FormFieldCard, FormInput, FormSearchableSelect } from '../../components';
import { formatCurrency } from '../../utils';
import { useServiceOrders } from '../../hooks/useServiceOrders';
import { useServices } from '../../hooks/useServices';
import { useStaff } from '../../hooks/useStaff';
import { useInventory } from '../../hooks/useInventory';
import CustomerSelector from '../customers/partials/CustomerSelector';
import { ROUTES } from '../../utils/constants';

// ─── Form types ──────────────────────────────────────────────────────────────

interface ItemForm {
    serviceId: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    taxAmount: number;
    notes: string;
    staffId: string;
}

interface OrderForm {
    customerId: string;
    notes: string;
    items: ItemForm[];
}

const emptyItem: ItemForm = {
    serviceId: '',
    quantity: 1,
    unitPrice: 0,
    discountAmount: 0,
    taxAmount: 0,
    notes: '',
    staffId: '',
};

const validationSchema = Yup.object({
    items: Yup.array()
        .of(
            Yup.object({
                serviceId: Yup.string().required('Select a service'),
                quantity: Yup.number().min(1).required(),
                unitPrice: Yup.number().min(0).required('Price is required'),
            }),
        )
        .min(1, 'At least one item is required'),
});

// ─── Auto-fill price/tax when service is selected ────────────────────────────

const ServiceItemEffect: FC<{ index: number; services: Service[] }> = ({ index, services }) => {
    const { values, setFieldValue } = useFormikContext<OrderForm>();
    const prevServiceId = useRef(values.items[index]?.serviceId);

    useEffect(() => {
        const current = values.items[index]?.serviceId;
        if (current && current !== prevServiceId.current) {
            const svc = services.find((s) => s.id === current);
            if (svc) {
                setFieldValue(`items.${index}.unitPrice`, svc.basePrice || 0);
                if (svc.isTaxable && svc.taxRate) {
                    setFieldValue(`items.${index}.taxAmount`, ((svc.basePrice || 0) * svc.taxRate) / 100);
                } else {
                    setFieldValue(`items.${index}.taxAmount`, 0);
                }
            }
        }
        prevServiceId.current = current;
    }, [values.items[index]?.serviceId, index, services, setFieldValue]);

    return null;
};

// ─── Sync Redux selectedCustomer → Formik customerId ─────────────────────────

const CustomerSyncEffect: FC = () => {
    const { setFieldValue } = useFormikContext<OrderForm>();
    const { selectedCustomer } = useInventory();

    useEffect(() => {
        if (selectedCustomer && !selectedCustomer.isDefault) {
            setFieldValue('customerId', selectedCustomer.customerId);
        } else {
            setFieldValue('customerId', '');
        }
    }, [selectedCustomer, setFieldValue]);

    return null;
};

// ─── Component ──────────────────────────────────────────────────────────────

const ServiceOrderCreate: FC = () => {
    const navigate = useNavigate();
    const { createOrder } = useServiceOrders();

    const { services, isLoading: loadingServices } = useServices();
    const { staff, isLoading: loadingStaff } = useStaff();
    const { selectedCustomer } = useInventory();

    const serviceOptions = services.map((s) => ({
        value: s.id,
        label: `${s.name}${s.sku ? ` (${s.sku})` : ''}`,
    }));

    const staffOptions = staff.map((s) => ({
        value: s.staffId,
        label: s.user?.fullname || s.employeeCode || s.staffId,
    }));

    const handleSubmit = useCallback(async (values: OrderForm) => {
        try {
            const payload: CreateServiceOrderInput = {
                customerId: values.customerId || undefined,
                notes: values.notes || undefined,
                items: values.items.map((item) => ({
                    serviceId: item.serviceId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discountAmount: item.discountAmount || undefined,
                    taxAmount: item.taxAmount || undefined,
                    notes: item.notes || undefined,
                    staffAssignments: item.staffId
                        ? [{ staffId: item.staffId }]
                        : undefined,
                })),
            };
            const order = await createOrder(payload);
            Notify.success(`Service order ${order.orderNumber} created`);
            navigate(ROUTES.SERVICE_ORDERS + '/' + order.id);
        } catch {
            Notify.failure('Failed to create service order');
        }
    }, [createOrder, navigate]);

    const initialValues: OrderForm = {
        customerId: '',
        notes: '',
        items: [{ ...emptyItem }],
    };

    return (
        <AppLayout>
            <Formik<OrderForm>
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, isSubmitting, setFieldValue }) => (
                    <Form>
                        <PageHeader
                            title="New Service Order"
                            description="Create a service order for a customer"
                            icon={<ClipboardList className="w-8 h-8 text-sky-500" />}
                            showBackButton
                            onBack={() => navigate(ROUTES.SERVICE_ORDERS)}
                        />

                        <div className="max-w-4xl mx-auto space-y-6 mt-4">
                            {/* ── Order info ──────────────────── */}
                            <FormFieldCard title="Order Details">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Customer
                                        </label>
                                        <CustomerSelector />
                                        <CustomerSyncEffect />
                                        {selectedCustomer && !selectedCustomer.isDefault && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {selectedCustomer.phone || selectedCustomer.email || ''}
                                            </p>
                                        )}
                                    </div>
                                    <FormInput
                                        label="Notes"
                                        name="notes"
                                        placeholder="Optional order notes"
                                    />
                                </div>
                            </FormFieldCard>

                            {/* ── Items ───────────────────────── */}
                            <FormFieldCard title="Service Items">
                                <FieldArray name="items">
                                    {({ push, remove }) => (
                                        <div className="space-y-4">
                                            <Button
                                                type="button"
                                                theme="primary"
                                                layout="outline"
                                                onClick={() => push({ ...emptyItem })}
                                            >
                                                <Plus className="w-4 h-4 mr-2" /> Add Item
                                            </Button>

                                            {values.items.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                                    <Package className="w-12 h-12 mb-2 opacity-50" />
                                                    <p>No items added yet</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {values.items.map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                                                        >
                                                            <ServiceItemEffect index={idx} services={services} />
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="text-xs font-semibold text-gray-500">
                                                                    Item {idx + 1}
                                                                </span>
                                                                {values.items.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => remove(idx)}
                                                                        className="text-red-500 hover:text-red-700 p-1"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                <FormSearchableSelect
                                                                    label="Service"
                                                                    name={`items.${idx}.serviceId`}
                                                                    options={serviceOptions}
                                                                    placeholder="Select service…"
                                                                    isLoading={loadingServices}
                                                                    required
                                                                />
                                                                <FormInput
                                                                    label="Quantity"
                                                                    name={`items.${idx}.quantity`}
                                                                    type="number"
                                                                    step="1"
                                                                    required
                                                                />
                                                                <FormInput
                                                                    label="Unit Price"
                                                                    name={`items.${idx}.unitPrice`}
                                                                    type="number"
                                                                    step="0.01"
                                                                    required
                                                                />
                                                                <FormInput
                                                                    label="Discount"
                                                                    name={`items.${idx}.discountAmount`}
                                                                    type="number"
                                                                    step="0.01"
                                                                />
                                                                <FormInput
                                                                    label="Tax"
                                                                    name={`items.${idx}.taxAmount`}
                                                                    type="number"
                                                                    step="0.01"
                                                                />
                                                                <FormSearchableSelect
                                                                    label="Assign Staff"
                                                                    name={`items.${idx}.staffId`}
                                                                    options={staffOptions}
                                                                    placeholder="Optional"
                                                                    isClearable
                                                                    isLoading={loadingStaff}
                                                                />
                                                            </div>

                                                            <div className="mt-3">
                                                                <FormInput
                                                                    label="Item Notes"
                                                                    name={`items.${idx}.notes`}
                                                                    placeholder="Optional"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </FieldArray>
                            </FormFieldCard>

                            {/* ── Order total preview ─────────── */}
                            <FormFieldCard title="Total Preview">
                                <div className="text-sm">
                                    {(() => {
                                        let subtotal = 0;
                                        let tax = 0;
                                        let discount = 0;
                                        for (const it of values.items) {
                                            const qty = Number(it.quantity) || 0;
                                            const price = Number(it.unitPrice) || 0;
                                            subtotal += qty * price;
                                            tax += Number(it.taxAmount) || 0;
                                            discount += Number(it.discountAmount) || 0;
                                        }
                                        const total = subtotal + tax - discount;
                                        return (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                                    <p className="font-medium">{formatCurrency(subtotal)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Tax</span>
                                                    <p className="font-medium">{formatCurrency(tax)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Discount</span>
                                                    <p className="font-medium">{formatCurrency(discount)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Total</span>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(total)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </FormFieldCard>

                            <div className="flex justify-end pt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                                <Button type="submit" theme="success" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating…' : 'Create Order'}
                                </Button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </AppLayout>
    );
};

export default ServiceOrderCreate;
