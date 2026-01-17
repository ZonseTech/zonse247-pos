import * as Yup from 'yup';
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
import transactionService from '../../../services/transactions.service';
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

const CheckoutModal: FunctionComponent<CheckoutModalProps> = ({
    isOpen,
    onClose,
    paymentMethodId,
    focusManager
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

    const transactionValues: TransactionValues = {
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
    const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
    const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);

    const newTransactionValidationSchema = Yup.object({
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

    const handleCompleteTransaction = async (values: TransactionValues) => {
        if (processing) return;

        try {
            setProcessing(true);
            const refNumber = generateReferenceNumber()

            const data: Transaction = {
                refNumber,
                discount,
                subtotal,
                tax,
                date: new Date().toJSON(),
                phoneNumber: values.phoneNumber,

                userId: user.userId,
                terminalId: (settings as any)?.terminalId || 'default',
                transactionId: values?.transactionId || '',
                customerId: selectedCustomer?.customerId !== 'walk-in' ? selectedCustomer?.customerId : undefined,
                paymentMethodId: values.paymentMethodId,
                paymentServiceProviderId: values.paymentServiceProviderId,

                total,
                paid: values.cashTendered ? parseFloat(values.cashTendered) : total,
                changeAmount: values.cashTendered ? Math.max(0, parseFloat(values.cashTendered) - total) : 0,
                items: cart,
            }

            const transaction = await transactionService.store(data)

            // Set the completed transaction and show the completion modal
            setCompletedTransaction({
                ...transaction,
                items: cart,
                user,
                customer: selectedCustomer,
            });
            setShowCompleteModal(true);

        } catch (error) {
            console.error('Transaction failed:', error);
            setProcessing(false);
        }
    };

    const handleNewTransaction = () => {
        setShowCompleteModal(false);
        setCompletedTransaction(null);
        clearCart();
        reloadInventory();
        setProcessing(false);
        focusManager.clearFocus();
        onClose();
    };

    const handleCloseCompleteModal = () => {
        setShowCompleteModal(false);
        setCompletedTransaction(null);
        setProcessing(false);
    };

    const canProceed = (values: TransactionValues) => {
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
                                    ? 'text-blue-900 dark:text-blue-100'
                                    : 'text-emerald-900 dark:text-emerald-100'
                                    }`}>
                                    {selectedCustomer.name}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <Formik
                    onSubmit={handleCompleteTransaction}
                    initialValues={transactionValues}
                    validationSchema={newTransactionValidationSchema}
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
                                    "bg-blue-100 border border-blue-400 text-blue-700 rounded",
                                    isEBN ? "px-2 py-1.5 mx-2 mb-2" : "px-3 md:px-4 py-2 md:py-3 mx-3 md:mx-6 mb-3 md:mb-0"
                                )}>
                                    <div className="flex items-center gap-2">
                                        <div className={classNames(
                                            "animate-spin rounded-full border-b-2 border-blue-700",
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
                                        "bg-red-500 text-white font-bold rounded-none hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed",
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

            {/* Transaction Complete Modal with Print Options */}
            <TransactionCompleteModal
                isOpen={showCompleteModal}
                transaction={completedTransaction}
                onClose={handleCloseCompleteModal}
                onNewTransaction={handleNewTransaction}
            />
        </div>,
        document.body
    );
};

export default CheckoutModal;