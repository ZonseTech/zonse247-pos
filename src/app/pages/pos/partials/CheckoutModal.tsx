import * as Yup from 'yup';
import { Report } from 'notiflix';
import { Form, Formik, } from 'formik';
import { createPortal } from 'react-dom';
import EPayment from './EPayment';
import CashPayment from './CashPayment';
import BankTransfer from './BankTransfer';
import TransactionCompleteModal from './TransactionCompleteModal';
import { FunctionComponent, useState, useEffect } from 'react';
import { useFocusManager } from '../../../hooks/useFocusManager';
import { useInventory } from '../../../hooks/useInventory';
import { useAuth } from '../../../context/AuthProvider';
import { useApp } from '../../../context/AppProvider';
import salesService from '../../../services/sales.service';
import { generateReferenceNumber } from '../../../utils';
import { DEFAULT_SEED_KEY } from '../../../constants';
import { useIsEBN } from '../../../hooks/useMediaQuery';
import classNames from 'classnames';

interface CheckoutModalProps {
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

interface SaleFormValues {
    paymentMethodId: string;
    paymentServiceProviderId: string;
    transactionId: string;
    phoneNumber: string;
    cashTendered: string;
    transferType?: string;
}

const CheckoutModal: FunctionComponent<CheckoutModalProps> = ({
    isOpen,
    onClose,
    paymentMethodId,
    focusManager
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

    const saleFormValues: SaleFormValues = {
        paymentMethodId,
        paymentServiceProviderId: '',
        transactionId: '',
        phoneNumber: '',
        cashTendered: '',
        transferType: '',
    };

    const { user } = useAuth()
    const { settings, printerOptions } = useApp()
    const isEBN = useIsEBN();

    const [processing, setProcessing] = useState<boolean>(false);
    const [activeInput, setActiveInput] = useState<ActiveInputType>(null);
    const [completedSale, setCompletedSale] = useState<Sale | Transaction | null>(null);
    const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);

    const newSaleValidationSchema = Yup.object({
        paymentMethodId: Yup.string().required('Payment method is required'),
        paymentServiceProviderId: Yup.string().when('paymentMethodId', {
            is: (value: string) => value !== CHECKOUT.CASH,
            then: () => Yup.string()
                .required('Service provider is required')
                .min(1, 'Please select a service provider'),
            otherwise: () => Yup.string().nullable(),
        }),
        transactionId: Yup.string().nullable(),
        phoneNumber: Yup.string().when('paymentMethodId', {
            is: (value: string) => value === CHECKOUT.E_PAYMENT,
            then: () => Yup.string()
                .required('Phone number is required')
                .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
            otherwise: () => Yup.string().nullable(),
        }),
    });

    useEffect(() => {
        if (isOpen) {
            setProcessing(false);
            setActiveInput(null);
        }
    }, []);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen || processing) return;

        switch (event.key) {
            case 'Escape':
                onClose();
                break;
            case 'Enter':
                event.preventDefault();
                break;
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, paymentMethodId, total, processing,]);

    const handleCompleteSale = async (values: SaleFormValues) => {
        if (processing) return;

        try {
            setProcessing(true);

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

            const refNumber = generateReferenceNumber()
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

            const completedSaleData: Transaction = {
                id: sale.id,
                refNumber: (sale as any).saleNumber || refNumber,
                transactionId: sale.id,
                total: (sale as any).totalAmount || total,
                paid: (sale as any).amountPaid || (values.cashTendered ? parseFloat(values.cashTendered) : total),
                changeAmount: sale.changeAmount || (values.cashTendered ? Math.max(0, parseFloat(values.cashTendered) - total) : 0),
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

            setCompletedSale(completedSaleData);
            setShowCompleteModal(true);

        } catch (error: any) {
            setProcessing(false);

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
        setShowCompleteModal(false);
        setCompletedSale(null);
        clearCart();
        reloadInventory();
        setProcessing(false);
        focusManager.clearFocus();
        onClose();
    };

    const handleCloseCompleteModal = () => {
        setShowCompleteModal(false);
        setCompletedSale(null);
        setProcessing(false);
    };

    const canProceed = (values: SaleFormValues) => {
        if (processing) return false;

        switch (paymentMethodId) {
            case CHECKOUT.CASH:
                return parseFloat(values.cashTendered || '0') >= total;
            case CHECKOUT.E_PAYMENT:
                return values.phoneNumber.length >= 9;
            case CHECKOUT.BANK_TRANSFER:
                return values.paymentServiceProviderId && values.paymentServiceProviderId.length > 0;
            default:
                return false;
        }
    };

    const getPaymentTitle = () => {
        switch (paymentMethodId) {
            case CHECKOUT.CASH:
                return 'CASH PAYMENT';
            case CHECKOUT.BANK_TRANSFER:
                return 'BANK TRANSFER';
            case CHECKOUT.E_PAYMENT:
                return 'E-PAYMENT';
            default:
                return 'PAYMENT';
        }
    };

    const getPaymentIcon = () => {
        switch (paymentMethodId) {
            case CHECKOUT.CASH:
                return '💵';
            case CHECKOUT.BANK_TRANSFER:
                return '🏦';
            case CHECKOUT.E_PAYMENT:
                return '📱';
            default:
                return '💳';
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className={classNames(
            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]",
            isEBN ? "p-1" : "p-2 md:p-4"
        )}>
            <div className={classNames(
                "bg-white dark:bg-gray-900 w-full flex flex-col rounded-lg md:rounded-none overflow-hidden",
                isEBN ? "max-w-3xl max-h-[98vh]" : "max-w-4xl xl:max-w-6xl h-auto max-h-[95vh] md:max-h-[90vh]"
            )}>
                <div className={classNames(
                    "text-black border-b flex items-center justify-between flex-shrink-0",
                    isEBN ? "p-2" : "p-3 md:p-4"
                )}>
                    <div className="flex items-center gap-2">
                        <div className={classNames(
                            "rounded flex items-center justify-center",
                            isEBN ? "w-5 h-5" : "w-6 h-6 md:w-8 md:h-8"
                        )}>
                            <span className={isEBN ? "text-base" : "text-lg md:text-2xl"}>{getPaymentIcon()}</span>
                        </div>
                        <span className={classNames(
                            "text-black dark:text-gray-200 font-bold",
                            isEBN ? "text-sm" : "text-base md:text-xl"
                        )}>{getPaymentTitle()}</span>
                    </div>

                    {selectedCustomer && (
                        <div className={isEBN ? "mb-1" : "mb-4"}>
                            <div className="flex items-center gap-2">
                                <span className={isEBN ? "text-base" : "text-xl"}>
                                    {selectedCustomer.customerId === DEFAULT_SEED_KEY ? '👤' : '⭐'}
                                </span>
                                <span className={`font-semibold ${selectedCustomer.customerId === DEFAULT_SEED_KEY
                                    ? 'text-sky-900 dark:text-sky-100'
                                    : 'text-emerald-900 dark:text-emerald-100'
                                    }`}>
                                    {selectedCustomer.name}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <Formik
                    onSubmit={handleCompleteSale}
                    initialValues={saleFormValues}
                    validationSchema={newSaleValidationSchema}
                    enableReinitialize={true}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form className="flex flex-col flex-1 min-h-0">
                            <div className={classNames(
                                "flex-1 overflow-y-auto",
                                isEBN ? "p-2" : "p-3 md:p-6"
                            )}>

                                {paymentMethodId === CHECKOUT.CASH && (
                                    <CashPayment
                                        compact={isEBN}
                                        total={total}
                                        values={values}
                                        onValueChange={setFieldValue}
                                        focusManager={focusManager}
                                    />
                                )}

                                {paymentMethodId === CHECKOUT.E_PAYMENT && (
                                    <EPayment
                                        compact={isEBN}
                                        total={total}
                                        values={values}
                                        activeInput={activeInput}
                                        onValueChange={setFieldValue}
                                        onActiveInputChange={setActiveInput}
                                    />
                                )}

                                {paymentMethodId === CHECKOUT.BANK_TRANSFER && (
                                    <BankTransfer
                                        compact={isEBN}
                                        total={total}
                                        values={values}
                                        activeInput={activeInput}
                                        onValueChange={setFieldValue}
                                        onActiveInputChange={setActiveInput}
                                    />
                                )}
                            </div>

                            {processing && (
                                <div className={classNames(
                                    "bg-sky-100 border border-sky-400 text-sky-700 rounded",
                                    isEBN ? "px-2 py-1.5 mx-2 mb-2" : "px-3 md:px-4 py-2 md:py-3 mx-3 md:mx-6 mb-3 md:mb-0"
                                )}>
                                    <div className="flex items-center gap-2">
                                        <div className={classNames(
                                            "animate-spin rounded-full border-b-2 border-sky-700",
                                            isEBN ? "h-3 w-3" : "h-4 w-4"
                                        )}></div>
                                        <span className={classNames(
                                            "font-bold",
                                            isEBN ? "text-xs" : "text-sm md:text-base"
                                        )}>Processing payment...</span>
                                    </div>
                                </div>
                            )}

                            <div className={classNames(
                                "flex flex-row justify-center items-center border-t flex-shrink-0",
                                isEBN ? "space-x-2 p-2" : "space-x-3 md:space-x-4 p-3 md:p-6"
                            )}>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !canProceed(values) || processing}
                                    className={classNames(
                                        "font-bold transition-colors rounded-none",
                                        isEBN ? "px-8 py-3 text-sm" : "px-6 md:px-32 py-4 md:py-6 text-base md:text-lg",
                                        canProceed(values) && !processing
                                            ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                                            : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                    )}
                                >
                                    {isSubmitting || processing ? 'PROCESSING...' : (isEBN ? 'COMPLETE' : 'COMPLETE TRANSACTION')}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting || processing}
                                    className={classNames(
                                        "bg-red-500 text-white font-bold rounded-none hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed",
                                        isEBN ? "px-8 py-3 text-sm" : "px-6 md:px-32 py-4 md:py-6 text-base md:text-lg"
                                    )}
                                >
                                    CANCEL
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
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

export default CheckoutModal;