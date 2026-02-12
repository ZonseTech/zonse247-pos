import { Report } from 'notiflix';
import { FunctionComponent, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useFocusManager } from '../../../hooks/useFocusManager';
import { useInventory } from '../../../hooks/useInventory';
import { useAuth } from '../../../context/AuthProvider';
import { useApp } from '../../../context/AppProvider';
import salesService from '../../../services/sales.service';
import printerService from '../../../services/printer.service';
import { generateReferenceNumber } from '../../../utils';
import { DEFAULT_SEED_KEY } from '../../../constants';
import { ROUTES } from '../../../utils/constants';
import { ProcessingStep } from './mobile-checkout/ProcessingStepIndicator';
import { ProcessingView, CompletedSaleView, PaymentFormView } from './mobile-checkout';

interface MobileCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    focusManager: ReturnType<typeof useFocusManager>;
    paymentMethodId: typeof CHECKOUT[keyof typeof CHECKOUT];
}

export const CHECKOUT = {
    BANK_TRANSFER: 'bank-transfer',
    E_PAYMENT: 'mobile-money',
    CASH: 'cash',
} as const;

export type PaymentMethod = typeof CHECKOUT[keyof typeof CHECKOUT];

export type ActiveInputType = 'phoneNumber' | 'referenceNo' | 'account' | null;

export interface SaleFormValues {
    paymentMethodId: string;
    paymentServiceProviderId: string;
    transactionId: string;
    phoneNumber: string;
    cashTendered: string;
    transferType?: string;
}

const MobileCheckoutModal: FunctionComponent<MobileCheckoutModalProps> = ({
    isOpen,
    onClose,
    paymentMethodId,
    focusManager
}) => {
    const navigate = useNavigate();
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

    const [processing, setProcessing] = useState<boolean>(false);
    const [processingStep, setProcessingStep] = useState<ProcessingStep | null>(null);
    const [activeInput, setActiveInput] = useState<ActiveInputType>(null);
    const [completedSale, setCompletedSale] = useState<Sale | Transaction | null>(null);
    const [changeAmount, setChangeAmount] = useState<number>(0);

    const initialFormValues: SaleFormValues = {
        paymentMethodId,
        paymentServiceProviderId: '',
        transactionId: '',
        phoneNumber: '',
        cashTendered: '',
        transferType: '',
    };

    useEffect(() => {
        if (isOpen) {
            setProcessing(false);
            setProcessingStep(null);
            setActiveInput(null);
            setCompletedSale(null);
            setChangeAmount(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen || processing) return;

            switch (event.key) {
                case 'Escape':
                    if (!completedSale) {
                        onClose();
                    }
                    break;
                case 'Enter':
                    event.preventDefault();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, processing, completedSale, onClose]);

    const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleCompleteSale = async (values: SaleFormValues) => {
        if (processing) return;

        try {
            setProcessing(true);

            setProcessingStep('validating');
            await simulateDelay(500);

            setProcessingStep('saving');

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

            const refNumber = generateReferenceNumber();
            const salePayload: CreateSalePayload = {
                tenantId: user.tenantId,
                branchId: user.branchId,
                userId: user.userId,
                terminalId: (settings as any)?.terminalId || 'default',
                customerId: selectedCustomer?.customerId !== 'walk-in' && selectedCustomer?.customerId !== DEFAULT_SEED_KEY
                    ? selectedCustomer?.customerId
                    : undefined,
                amountPaid: values.cashTendered ? parseFloat(values.cashTendered) : total,
                paymentMethodId: values.paymentMethodId,
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
                notes: values.transactionId ? `Ref: ${values.transactionId}` : undefined,
            };

            const sale = await salesService.store(salePayload);

            const saleDate = typeof sale.createdAt === 'string'
                ? sale.createdAt
                : sale.createdAt?.toISOString?.() || new Date().toISOString();

            const calculatedChange = values.cashTendered
                ? Math.max(0, parseFloat(values.cashTendered) - total)
                : 0;

            const completedSaleData = {
                id: sale.id,
                refNumber: (sale as any).saleNumber || refNumber,
                transactionId: sale.id,
                total: (sale as any).totalAmount || total,
                paid: (sale as any).amountPaid || (values.cashTendered ? parseFloat(values.cashTendered) : total),
                changeAmount: sale.changeAmount || calculatedChange,
                date: saleDate,
                discount,
                subtotal,
                tax,
                phoneNumber: values.phoneNumber,
                userId: user.userId,
                terminalId: (settings as any)?.terminalId || 'default',
                paymentMethodId: values.paymentMethodId,
                items: cart,
                user,
                customer: selectedCustomer,
                status: sale.status || 'COMPLETED',
            };

            setChangeAmount(calculatedChange);
            setCompletedSale(completedSaleData);

            setProcessingStep('printing');
            try {
                await printerService.printReceipt({
                    saleId: sale.id,
                    transactionId: sale.id,
                });
            } catch (printError) {
                Report.failure('Print Error', 'Failed to print receipt. Please try again.', 'OK');
            }

            setProcessingStep('completed');

        } catch (error: any) {
            setProcessing(false);
            setProcessingStep(null);

            const responseData = error?.error?.response?.data || error?.response?.data;
            const mainMessage = responseData?.message || 'Failed to complete sale';
            const detailedError = responseData?.error;
            const fieldErrors = responseData?.data;

            let fieldErrorsMessage = '';
            if (fieldErrors && typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
                fieldErrorsMessage = Object.entries(fieldErrors)
                    .map(([field, message]) => `• ${field}: ${message}`)
                    .join('\n');
            }

            let fullErrorMessage = mainMessage;
            if (detailedError) {
                fullErrorMessage += `:\n${detailedError}`;
            } else if (fieldErrorsMessage) {
                fullErrorMessage += `:\n${fieldErrorsMessage}`;
            } else if (!responseData) {
                fullErrorMessage = error?.message || 'An unknown error occurred';
            }

            Report.failure(
                'Transaction Failed',
                fullErrorMessage,
                'Okay'
            );
        }
    };

    const handleNewTransaction = () => {
        setCompletedSale(null);
        setProcessingStep(null);
        clearCart();
        reloadInventory();
        setProcessing(false);
        focusManager.clearFocus();
        onClose();
    };

    const handleGetReceipt = () => {
        if (!completedSale) return;

        const saleId = (completedSale as Transaction).transactionId ||
            (completedSale as Sale).id ||
            completedSale.id;

        handleNewTransaction()

        navigate(ROUTES.RECEIPT_DETAILS.replace(':saleId', saleId));
    };

    if (!isOpen) return null;

    if (processingStep === 'completed' && completedSale) {
        return (
            <CompletedSaleView
                completedSale={completedSale}
                total={total}
                changeAmount={changeAmount}
                paymentMethodId={paymentMethodId}
                onGetReceipt={handleGetReceipt}
                onNewTransaction={handleNewTransaction}
            />
        );
    }

    if (processing && processingStep && processingStep !== 'completed') {
        return <ProcessingView processingStep={processingStep} />;
    }

    return (
        <PaymentFormView
            paymentMethodId={paymentMethodId}
            total={total}
            processing={processing}
            selectedCustomer={selectedCustomer}
            activeInput={activeInput}
            focusManager={focusManager}
            initialValues={initialFormValues}
            onClose={onClose}
            onSubmit={handleCompleteSale}
            onActiveInputChange={setActiveInput}
        />
    );
};

export default MobileCheckoutModal;
