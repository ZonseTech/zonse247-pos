import { FunctionComponent, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { Notify } from 'notiflix';
import { useInventory } from '../../../../hooks/useInventory';
import { useAuth } from '../../../../context/AuthProvider';
import { useApp } from '../../../../context/AppProvider';
import { useIsEBN } from '../../../../hooks/useMediaQuery';
import salesService from '../../../../services/sales.service';
import printerService from '../../../../services/printer.service';
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
import { DesktopProcessingView, TransactionSuccessModal, ProcessingStep } from '../desktop-checkout';

const MultiplePaymentModal: FunctionComponent<MultiplePaymentModalProps> = ({
    isOpen,
    onClose,
}) => {
    const {
        discount,
        discountIsPercentage,
        tax,
        total,
        subtotal,
        cart,
        otherCharges,
        clearCart,
        reloadInventory,
        selectedCustomer,
    } = useInventory();
    const { user } = useAuth();
    const { settings } = useApp();
    const isEBN = useIsEBN();
    const [processing, setProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState<ProcessingStep | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState<{
        total: number;
        changeAmount: number;
        refNumber: string;
    } | null>(null);
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

    const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleCompleteSale = async () => {
        if (!isFullyPaid || processing) return;

        const validPayments = payments.filter(p => parseFloat(p.amount) > 0);
        if (validPayments.length === 0) {
            Notify.failure('Please add at least one payment');
            return;
        }

        try {
            setProcessing(true);

            // Step 1: Validating
            setProcessingStep('validating');
            await simulateDelay(500);

            // Step 2: Saving
            setProcessingStep('saving');

            const refNumber = generateReferenceNumber();

            // Calculate item-level discounts
            const totalItemDiscounts = cart.reduce((sum, item) => {
                const itemPrice = item.quantity === 0 ? item.sellingPrice : item.sellingPrice * item.quantity;
                const itemQty = item.quantity === 0 ? 1 : item.quantity;
                if (item.discountIsPercentage) {
                    return sum + (itemPrice * (item.discount || 0)) / 100;
                }
                return sum + (item.discount || 0) * itemQty;
            }, 0);

            // Calculate cart-level discount amount
            const cartDiscountAmount = discountIsPercentage
                ? (subtotal * discount) / 100
                : discount;

            // Total discount = item-level + cart-level
            const calculatedDiscountAmount = totalItemDiscounts + cartDiscountAmount;

            // Calculate tax amount (tax is always percentage, applied on discounted subtotal)
            const taxableAmount = subtotal - calculatedDiscountAmount;
            const calculatedTaxAmount = (taxableAmount * tax) / 100;

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
                taxAmount: calculatedTaxAmount,
                discountAmount: calculatedDiscountAmount,
                totalAmount: total,

                otherCharges: otherCharges.length > 0 ? otherCharges.map(charge => ({
                    type: charge.type,
                    label: charge.label,
                    value: charge.value,
                    isPercentage: charge.isPercentage,
                    amount: charge.isPercentage ? (subtotal * charge.value) / 100 : charge.value,
                })) : undefined,

                items: cart.map(item => {
                    const itemPrice = item.quantity === 0 ? item.sellingPrice : item.sellingPrice * item.quantity;
                    const itemQty = item.quantity === 0 ? 1 : item.quantity;
                    const itemDiscountAmount = item.discountIsPercentage
                        ? (itemPrice * (item.discount || 0)) / 100
                        : (item.discount || 0) * itemQty;
                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.sellingPrice,
                        taxAmount: 0,
                        discountAmount: itemDiscountAmount,
                    };
                }),

                notes: paymentEntries.length > 1
                    ? `Split payment: ${paymentEntries.map(p => `${getPaymentMethodLabel(p.paymentMethodId as PaymentMethodType)}: ${formatCurrency(p.amount)}`).join(', ')}`
                    : paymentEntries[0].reference ? `Ref: ${paymentEntries[0].reference}` : undefined,
            };

            const sale = await salesService.store(salePayload);

            const saleRefNumber = (sale as any).saleNumber || refNumber;
            const saleChangeAmount = change;

            // Step 3: Printing
            setProcessingStep('printing');
            try {
                await printerService.printReceipt({
                    saleId: sale.id,
                    transactionId: sale.id,
                    copies: settings?.receiptCopies || 1,
                    includeHeader: true,
                    includeFooter: true,
                    includeLogo: settings?.showStoreLogo || false,
                });
            } catch (printError) {
                console.error('Print failed:', printError);
                // Continue even if print fails - sale is already saved
            }

            // Step 4: Completed - Show success modal
            setProcessingStep('completed');
            await simulateDelay(300);

            setProcessingStep(null);
            setSuccessData({
                total: (sale as any).totalAmount || total,
                changeAmount: saleChangeAmount,
                refNumber: saleRefNumber,
            });
            setShowSuccessModal(true);

        } catch (error) {
            console.error('Sale failed:', error);
            Notify.failure('Failed to process sale. Please try again.');
            setProcessingStep(null);
            setProcessing(false);
        }
    };

    const handleTransactionComplete = () => {
        setShowSuccessModal(false);
        setSuccessData(null);
        resetPayments();
        clearCart();
        reloadInventory();
        setProcessing(false);
        onClose();
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

            {showSuccessModal && successData && (
                <TransactionSuccessModal
                    isOpen={showSuccessModal}
                    total={successData.total}
                    changeAmount={successData.changeAmount}
                    refNumber={successData.refNumber}
                    onComplete={handleTransactionComplete}
                    autoCloseDelay={3000}
                />
            )}

            {processingStep && (
                <DesktopProcessingView processingStep={processingStep} />
            )}
        </div>,
        document.body
    );
};

export default MultiplePaymentModal;