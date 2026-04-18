import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Confirm, Notify } from 'notiflix';
import {
    ArrowLeft, Play, XCircle, CheckCircle, DollarSign,
    Clock, User, ClipboardList, Package,
} from 'lucide-react';
import { Box, Flex, Button, Badge, Select, Text } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { FormFieldCard } from '../../components';
import { ComponentLoader } from '../../components';
import { useServiceOrders } from '../../hooks/useServiceOrders';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { formatDate, formatCurrency } from '../../utils';
import { ROUTES } from '../../utils/constants';
import CompleteItemModal from './partials/CompleteItemModal';

// ─── Status badges ──────────────────────────────────────────────────────────

const orderStatusCls: Record<ServiceOrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    IN_PROGRESS: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    PARTIALLY_PAID: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const itemStatusCls: Record<ServiceItemStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    IN_PROGRESS: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const fmtMoney = (v: number) => formatCurrency(v);

// ─── Component ──────────────────────────────────────────────────────────────

const ServiceOrderDetail: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        getById, startOrder, cancelOrder, startItem, completeItem, cancelItem,
        recordPayment,
    } = useServiceOrders();
    const { paymentMethods } = usePaymentMethods();

    const [order, setOrder] = useState<ServiceOrderWithItems | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    // Payment form state
    const [showPayment, setShowPayment] = useState(false);
    const [payMethodId, setPayMethodId] = useState('');
    const [payAmount, setPayAmount] = useState('');
    const [payRef, setPayRef] = useState('');

    // Complete item modal state
    const [completingItem, setCompletingItem] = useState<ServiceOrderItemDetail | null>(null);

    const load = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        const data = await getById(id);
        setOrder(data);
        setIsLoading(false);
    }, [id, getById]);

    useEffect(() => {
        load();
    }, [load]);

    // Auto-open payment if navigated with state
    useEffect(() => {
        if ((location.state as any)?.openPayment) setShowPayment(true);
    }, [location.state]);

    // ─── Actions ──────────────────────────────────────────────────────────

    const wrap = useCallback(async (fn: () => Promise<ServiceOrderWithItems>) => {
        setBusy(true);
        try {
            const updated = fn();
            setOrder(await updated);
        } catch { /* hook already notifies */ }
        setBusy(false);
    }, []);

    const handleStartOrder = useCallback(() => {
        if (!id) return;
        Confirm.show('Start Order', 'Begin work on this order?', 'Start', 'Cancel', () => {
            wrap(() => startOrder(id));
        });
    }, [id, startOrder, wrap]);

    const handleCancelOrder = useCallback(() => {
        if (!id) return;
        Confirm.show('Cancel Order', 'Cancel this service order?', 'Yes', 'No', () => {
            wrap(() => cancelOrder(id));
        }, undefined, { okButtonBackground: '#ef4444', titleColor: '#ef4444' });
    }, [id, cancelOrder, wrap]);

    const handleStartItem = useCallback((itemId: string) => {
        if (!id) return;
        wrap(() => startItem(id, itemId));
    }, [id, startItem, wrap]);

    const handleCompleteItem = useCallback((itemId: string) => {
        if (!id) return;
        const item = order?.items.find((i) => i.id === itemId);
        if (item) setCompletingItem(item);
    }, [id, order?.items]);

    const handleConfirmComplete = useCallback(async (consumptions: ConsumptionInput[]) => {
        if (!id || !completingItem) return;
        setBusy(true);
        try {
            const data = consumptions.length > 0 ? { consumptions } : undefined;
            const updated = await completeItem(id, completingItem.id, data);
            setOrder(updated);
            setCompletingItem(null);
            Notify.success('Item completed');
        } catch { /* hook notifies */ }
        setBusy(false);
    }, [id, completingItem, completeItem]);

    const handleCancelItem = useCallback((itemId: string) => {
        if (!id) return;
        Confirm.show('Cancel Item', 'Cancel this item?', 'Yes', 'No', () => {
            wrap(() => cancelItem(id, itemId));
        }, undefined, { okButtonBackground: '#ef4444', titleColor: '#ef4444' });
    }, [id, cancelItem, wrap]);

    const handleRecordPayment = useCallback(async () => {
        if (!id || !payMethodId || !payAmount) {
            Notify.warning('Select a payment method and enter amount');
            return;
        }
        setBusy(true);
        try {
            const updated = await recordPayment(id, [{
                paymentMethodId: payMethodId,
                amount: parseFloat(payAmount),
                reference: payRef || undefined,
            }]);
            setOrder(updated);
            setShowPayment(false);
            setPayMethodId('');
            setPayAmount('');
            setPayRef('');
            Notify.success('Payment recorded');
        } catch { /* hook notifies */ }
        setBusy(false);
    }, [id, payMethodId, payAmount, payRef, recordPayment]);

    // ─── Derived ──────────────────────────────────────────────────────────

    const canStart = order?.status === 'PENDING';
    const canCancel = order?.status === 'PENDING' || order?.status === 'IN_PROGRESS';
    const canPay = order?.status === 'COMPLETED' || order?.status === 'PARTIALLY_PAID';

    // ─── Render ───────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <AppLayout>
                <ComponentLoader loading={true} />
            </AppLayout>
        );
    }

    if (!order) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-gray-500 mb-4">Service order not found.</p>
                    <Button variant="soft" onClick={() => navigate(ROUTES.SERVICE_ORDERS)}>
                        <ArrowLeft className="w-4 h-4" /> Back to Orders
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <PageHeader
                title={order.orderNumber}
                description="Service order details"
                icon={<ClipboardList className="w-8 h-8 text-sky-500" />}
                showBackButton
                onBack={() => navigate(ROUTES.SERVICE_ORDERS)}
                action={
                    <Flex gap="2">
                        {canStart && (
                            <Button size="2" color="green" disabled={busy} onClick={handleStartOrder}>
                                <Play className="w-4 h-4" /> Start
                            </Button>
                        )}
                        {canPay && (
                            <Button size="2" color="blue" disabled={busy} onClick={() => setShowPayment(true)}>
                                <DollarSign className="w-4 h-4" /> Pay
                            </Button>
                        )}
                        {canCancel && (
                            <Button size="2" color="red" variant="soft" disabled={busy} onClick={handleCancelOrder}>
                                <XCircle className="w-4 h-4" /> Cancel
                            </Button>
                        )}
                    </Flex>
                }
            />

            <div className="space-y-5 mt-4">
                {/* ─── Summary Card ─────────────────────────────────── */}
                <FormFieldCard title="Order Summary">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
                        <div>
                            <Text size="1" color="gray">Status</Text>
                            <div className="mt-1">
                                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${orderStatusCls[order.status]}`}>
                                    {order.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                        <div>
                            <Text size="1" color="gray">Customer</Text>
                            <div className="mt-1 flex items-center gap-1 text-sm">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                {order.customer?.name || 'Walk-in'}
                            </div>
                        </div>
                        <div>
                            <Text size="1" color="gray">Created</Text>
                            <div className="mt-1 flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {formatDate(String(order.createdAt))}
                            </div>
                        </div>

                    </div>
                </FormFieldCard>

                {/* ─── Financials ───────────────────────────────────── */}
                <FormFieldCard title="Financials">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 text-sm">
                        <div>
                            <Text size="1" color="gray">Subtotal</Text>
                            <p className="font-medium mt-1">{fmtMoney(order.subtotal)}</p>
                        </div>
                        <div>
                            <Text size="1" color="gray">Tax</Text>
                            <p className="font-medium mt-1">{fmtMoney(order.taxAmount)}</p>
                        </div>
                        <div>
                            <Text size="1" color="gray">Discount</Text>
                            <p className="font-medium mt-1">{fmtMoney(order.discountAmount)}</p>
                        </div>
                        <div>
                            <Text size="1" color="gray">Total</Text>
                            <p className="font-semibold mt-1 text-gray-900 dark:text-gray-100">{fmtMoney(order.totalAmount)}</p>
                        </div>
                        <div>
                            <Text size="1" color="gray">Balance Due</Text>
                            <p className={`font-semibold mt-1 ${order.balanceDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                {fmtMoney(order.balanceDue)}
                            </p>
                        </div>
                    </div>
                </FormFieldCard>

                {/* ─── Items ───────────────────────────────────────── */}
                <FormFieldCard title={`Items (${order.items.length})`}>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {order.items.map((item) => (
                            <div key={item.id} className="p-4">
                                <Flex justify="between" align="start" gap="3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                {item.service?.name || 'Service'}
                                            </h4>
                                            <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full ${itemStatusCls[item.status]}`}>
                                                {item.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-x-3">
                                            <span>Qty: {item.quantity}</span>
                                            <span>Unit: {fmtMoney(item.unitPrice)}</span>
                                            <span>Total: {fmtMoney(item.totalPrice)}</span>
                                        </div>
                                        {item.notes && (
                                            <p className="mt-1 text-xs text-gray-400 italic">{item.notes}</p>
                                        )}

                                        {/* Staff assignments */}
                                        {item.staffAssignments && item.staffAssignments.length > 0 && (
                                            <div className="mt-2">
                                                <Text size="1" color="gray">Staff:</Text>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {item.staffAssignments.map((sa) => (
                                                        <span key={sa.id} className="inline-flex items-center gap-1 text-[11px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                            <User className="w-3 h-3" />
                                                            {sa.staff?.user?.fullname || sa.staffId.slice(0, 8)}
                                                            {sa.role && ` (${sa.role})`}
                                                            {item.status === 'COMPLETED' && sa.commissionAmount > 0 && (
                                                                <span className="text-green-600 ml-1">{fmtMoney(sa.commissionAmount)}</span>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Consumptions */}
                                        {item.consumptions && item.consumptions.length > 0 && (
                                            <div className="mt-2">
                                                <Text size="1" color="gray">Consumptions:</Text>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {item.consumptions.map((c) => (
                                                        <span key={c.id} className="inline-flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                                            <Package className="w-3 h-3" />
                                                            {c.variant?.variantName || c.productVariantId.slice(0, 8)}
                                                            × {c.quantity} ({fmtMoney(c.totalCost)})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Item actions */}
                                    <Flex gap="1" className="shrink-0">
                                        {item.status === 'PENDING' && (
                                            <button onClick={() => handleStartItem(item.id)} disabled={busy}
                                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-green-600 transition-colors" title="Start">
                                                <Play className="w-4 h-4" />
                                            </button>
                                        )}
                                        {item.status === 'IN_PROGRESS' && (
                                            <button onClick={() => handleCompleteItem(item.id)} disabled={busy}
                                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-green-600 transition-colors" title="Complete">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        {(item.status === 'PENDING' || item.status === 'IN_PROGRESS') && (
                                            <button onClick={() => handleCancelItem(item.id)} disabled={busy}
                                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-600 transition-colors" title="Cancel">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                    </Flex>
                                </Flex>
                            </div>
                        ))}
                    </div>
                </FormFieldCard>

                {/* ─── Payments ─────────────────────────────────────── */}
                {order.payments && order.payments.length > 0 && (
                    <FormFieldCard title="Payments">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {order.payments.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                            {p.paymentMethod?.name || 'Payment'}
                                        </span>
                                        {p.reference && (
                                            <span className="ml-2 text-xs text-gray-400">Ref: {p.reference}</span>
                                        )}
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {fmtMoney(p.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </FormFieldCard>
                )}

                {/* ─── Payment Form ────────────────────────────────── */}
                {showPayment && canPay && (
                    <FormFieldCard title="Record Payment">
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Payment Method
                                    </label>
                                    <Select.Root value={payMethodId} onValueChange={setPayMethodId}>
                                        <Select.Trigger placeholder="Select method…" className="w-full" />
                                        <Select.Content>
                                            {paymentMethods.map((m) => (
                                                <Select.Item key={m.methodId} value={m.methodId}>
                                                    {m.name}
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Root>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={order.balanceDue}
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(e.target.value)}
                                        placeholder={`Balance: ${order.balanceDue.toFixed(2)}`}
                                        className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Reference (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={payRef}
                                        onChange={(e) => setPayRef(e.target.value)}
                                        placeholder="e.g. Receipt #"
                                        className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                    />
                                </div>
                            </div>
                            <Flex gap="2" justify="end">
                                <Button variant="soft" size="2" color="gray" onClick={() => setShowPayment(false)}>
                                    Cancel
                                </Button>
                                <Button size="2" disabled={busy || !payMethodId || !payAmount} onClick={handleRecordPayment}>
                                    <DollarSign className="w-4 h-4" /> Record Payment
                                </Button>
                            </Flex>
                        </div>
                    </FormFieldCard>
                )}

                {/* ─── Notes ───────────────────────────────────────── */}
                {order.notes && (
                    <FormFieldCard title="Notes">
                        <p className="p-4 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {order.notes}
                        </p>
                    </FormFieldCard>
                )}
            </div>

            {/* Complete item modal with consumables */}
            <CompleteItemModal
                open={!!completingItem}
                onOpenChange={(open) => { if (!open) setCompletingItem(null); }}
                itemName={completingItem?.service?.name || 'Service'}
                onConfirm={handleConfirmComplete}
                busy={busy}
            />
        </AppLayout>
    );
};

export default ServiceOrderDetail;
