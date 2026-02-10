import { FunctionComponent, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { Notify } from 'notiflix';
import { useInventory } from '../../../../hooks/useInventory';
import { useAuth } from '../../../../context/AuthProvider';
import { useApp } from '../../../../context/AppProvider';
import { useIsEBN } from '../../../../hooks/useMediaQuery';
import salesService from '../../../../services/sales.service';
import { generateReferenceNumber, formatCurrency } from '../../../../utils';
import { DEFAULT_SEED_KEY } from '../../../../constants';
import {
    MultiplePaymentModalProps,
    PaymentMethodType,
    usePayments,
    getPaymentMethodLabel,
    generatePaymentId,
    ModalHeader,
    ModalFooter,
    PaymentSummary,
    PaymentMethodButtons,
    PaymentEntriesList,
} from './index';
import TransactionCompleteModal from '../TransactionCompleteModal';

const MultiplePaymentModal: FunctionComponent<MultiplePaymentModalProps> = ({
    isOpen,
    onClose,
}) => {
    const {
        discount,
        tax,
        total,
        subtotal,
        cart,
        clearCart,
        reloadInventory,
        selectedCustomer,
    } = useInventory();
    const { user } = useAuth();
    const { settings } = useApp();
    const isEBN = useIsEBN();
    const [processing, setProcessing] = useState(false);
    const [completedSale, setCompletedSale] = useState<Sale | Transaction | null>(null);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const {
        payments,
        totalPaid,
        remaining,
        change,
        isFullyPaid,
        addPayment,
        removePayment,
        updatePayment,
        resetPayments,
    } = usePayments(total, isOpen);

    useEffect(() => {
        if (isOpen) {
            setProcessing(false);
            setCompletedSale(null);
            setShowCompleteModal(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen || processing) return;
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, processing, onClose]);

    const handleCompleteSale = async () => {
        if (!isFullyPaid || processing) return;

        const validPayments = payments.filter(p => parseFloat(p.amount) > 0);
        if (validPayments.length === 0) {
            Notify.failure('Please add at least one payment');
            return;
        }

        try {
            setProcessing(true);
            const refNumber = generateReferenceNumber();

            const paymentEntries: PaymentEntry[] = validPayments.map(p => ({
                paymentMethodId: p.paymentMethodId,
                amount: parseFloat(p.amount),
                reference: p.reference || undefined,
                providerId: p.providerId || undefined,
                phoneNumber: p.phoneNumber || undefined,
                notes: p.notes || undefined,
            }));

            const salePayload: CreateSalePayload = {
                tenantId: user.tenantId,
                branchId: user.branchId,
                userId: user.userId,
                terminalId: (settings as any)?.terminalId || 'default',
                customerId: selectedCustomer?.customerId !== 'walk-in' && selectedCustomer?.customerId !== DEFAULT_SEED_KEY
                    ? selectedCustomer?.customerId
                    : undefined,

                amountPaid: totalPaid,
                paymentMethodId: paymentEntries[0].paymentMethodId,

                payments: paymentEntries,

                subtotal,
                taxAmount: tax,
                discountAmount: discount,
                totalAmount: total,

                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.sellingPrice,
                    taxAmount: 0,
                    discountAmount: item.discount || 0,
                })),

                notes: paymentEntries.length > 1
                    ? `Split payment: ${paymentEntries.map(p => `${getPaymentMethodLabel(p.paymentMethodId as PaymentMethodType)}: ${formatCurrency(p.amount)}`).join(', ')}`
                    : paymentEntries[0].reference ? `Ref: ${paymentEntries[0].reference}` : undefined,
            };

            const sale = await salesService.store(salePayload);

            const saleDate = typeof sale.createdAt === 'string'
                ? sale.createdAt
                : sale.createdAt?.toISOString?.() || new Date().toISOString();

            const completedSaleData = {
                id: sale.id,
                refNumber: (sale as any).saleNumber || refNumber,
                transactionId: sale.id,
                total: (sale as any).totalAmount || total,
                paid: totalPaid,
                changeAmount: change,
                date: saleDate,
                discount,
                subtotal,
                tax,
                phoneNumber: paymentEntries.find(p => p.phoneNumber)?.phoneNumber || '',
                userId: user.userId,
                terminalId: (settings as any)?.terminalId || 'default',
                paymentMethodId: paymentEntries.length > 1 ? 'multiple' : paymentEntries[0].paymentMethodId,
                items: cart,
                user,
                customer: selectedCustomer,
                status: sale.status || 'COMPLETED',
                payments: paymentEntries.map(p => ({
                    id: generatePaymentId(),
                    saleId: sale.id,
                    paymentMethodId: p.paymentMethodId,
                    amount: p.amount,
                    reference: p.reference,
                    status: 'completed',
                    processedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                })),
            };

            setCompletedSale(completedSaleData);
            setShowCompleteModal(true);

        } catch (error) {
            console.error('Sale failed:', error);
            Notify.failure('Failed to process sale. Please try again.');
            setProcessing(false);
        }
    };

    const handleNewTransaction = () => {
        setShowCompleteModal(false);
        setCompletedSale(null);
        resetPayments();
        clearCart();
        reloadInventory();
        setProcessing(false);
        onClose();
    };

    const handleCloseCompleteModal = () => {
        setShowCompleteModal(false);
        setCompletedSale(null);
        setProcessing(false);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className={classNames(
            "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] transition-all",
            isEBN ? "p-1" : "p-0 sm:p-3 md:p-4"
        )}>
            <div className={classNames(
                "bg-white dark:bg-gray-900 w-full flex flex-col overflow-hidden shadow-2xl",
                isEBN
                    ? "max-w-4xl max-h-[98vh] rounded-lg"
                    : "h-[95vh] sm:h-auto sm:max-h-[92vh] md:max-h-[88vh] sm:max-w-5xl xl:max-w-6xl rounded-t-2xl sm:rounded-xl"
            )}>
                <ModalHeader
                    onClose={onClose}
                    processing={processing}
                    isEBN={isEBN}
                />

                <div className="sm:hidden">
                    <PaymentSummary
                        total={total}
                        totalPaid={totalPaid}
                        remaining={remaining}
                        change={change}
                        isFullyPaid={isFullyPaid}
                        isEBN={isEBN}
                        isMobile={true}
                    />
                </div>

                <div className={classNames(
                    "flex-1 overflow-y-auto overscroll-contain",
                    isEBN ? "p-2" : "p-3 sm:p-4 md:p-6"
                )}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        <div className="hidden sm:block lg:col-span-1">
                            <PaymentSummary
                                total={total}
                                totalPaid={totalPaid}
                                remaining={remaining}
                                change={change}
                                isFullyPaid={isFullyPaid}
                                isEBN={isEBN}
                                isMobile={false}
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <PaymentMethodButtons
                                onAddPayment={addPayment}
                                processing={processing}
                                isEBN={isEBN}
                            />
                            <PaymentEntriesList
                                payments={payments}
                                remaining={remaining}
                                processing={processing}
                                isEBN={isEBN}
                                onUpdate={updatePayment}
                                onRemove={removePayment}
                            />
                        </div>
                    </div>
                </div>

                <ModalFooter
                    onClose={onClose}
                    onCompleteSale={handleCompleteSale}
                    isFullyPaid={isFullyPaid}
                    processing={processing}
                    paymentsCount={payments.length}
                    isEBN={isEBN}
                    remaining={remaining}
                />
            </div>

            <TransactionCompleteModal
                isOpen={showCompleteModal}
                transaction={completedSale}
                onClose={handleCloseCompleteModal}
                onNewTransaction={handleNewTransaction}
            />
        </div>,
        document.body
    );
};

export default MultiplePaymentModal;
