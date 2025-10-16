import * as Yup from 'yup';
import { Form, Formik, } from 'formik';
import EPayment from './EPayment';
import CashPayment from './CashPayment';
import BankTransfer from './BankTransfer';
import { FunctionComponent, useState, useEffect } from 'react';
import { useFocusManager } from '../../../hooks/useFocusManager';
import { useProducts } from '../../../hooks/useProducts';
import { useAuth } from '../../../context/AuthProvider';
import { useApp } from '../../../context/AppProvider';
import transactionService from '../../../services/transactions.service';
import { generateReferenceNumber } from '../../../utils';
import printerService from '../../../services/printer.service';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    focusManager: ReturnType<typeof useFocusManager>;
    paymentMethodUuid: typeof CHECKOUT[keyof typeof CHECKOUT];
}

export const CHECKOUT = {
    BANK_TRANSFER: 'bank-transfer',
    E_PAYMENT: 'e-payment',
    CASH: 'cash',
} as const;

export type PaymentMethod = typeof CHECKOUT[keyof typeof CHECKOUT];

export type ActiveInputType = 'phoneNumber' | 'referenceNo' | 'account' | null;

const CheckoutModal: FunctionComponent<CheckoutModalProps> = ({
    isOpen,
    onClose,
    paymentMethodUuid,
    focusManager
}) => {
    const {
        discount,
        tax,
        total,
        subtotal,
        cart,
        clearCart,
        reloadProducts,
        selectedCustomer,
    } = useProducts();

    const transactionValues: TransactionValues = {
        paymentMethodUuid,
        paymentServiceProviderUuid: '',
        transactionId: '',
        phoneNumber: '',
        cashTendered: '',
    };

    const { user } = useAuth()
    const { settings, printerOptions } = useApp()

    const [processing, setProcessing] = useState<boolean>(false);
    const [activeInput, setActiveInput] = useState<ActiveInputType>(null);

    const newTransactionValidationSchema = Yup.object({
        paymentMethodUuid: Yup.string().required('Payment method is required'),
        paymentServiceProviderUuid: Yup.string().when('paymentMethodUuid', {
            is: (value: string) => value !== CHECKOUT.CASH,
            then: () => Yup.string()
                .required('Service provider is required')
                .min(1, 'Please select a service provider'),
            otherwise: () => Yup.string().nullable(),
        }),
        transactionId: Yup.string().when('paymentMethodUuid', {
            is: (value: string) => value !== CHECKOUT.CASH,
            then: () => Yup.string()
                .required('Reference number is required')
                .min(5, 'Reference number must be at least 5 characters'),
            otherwise: () => Yup.string().nullable(),
        }),
        phoneNumber: Yup.string().when('paymentMethodUuid', {
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
    }, [isOpen, paymentMethodUuid, total, processing,]);

    const handleCompleteTransaction = async (values: TransactionValues) => {
        if (processing) return;

        try {
            const refNumber = generateReferenceNumber()

            const data: Transaction = {
                uuid: '',
                refNumber,
                discount,
                subtotal,
                tax,
                date: new Date().toJSON(),
                phoneNumber: values.phoneNumber,

                userUuid: user.uuid,
                tillUuid: settings?.uuid,
                transactionId: values?.transactionId,
                customerUuid: selectedCustomer.uuid,
                paymentMethodUuid: values.paymentMethodUuid,
                paymentServiceProviderUuid: values.paymentServiceProviderUuid,

                total,
                paid: values.cashTendered ? parseFloat(values.cashTendered) : total,
                changeAmount: values.cashTendered ? Math.max(0, parseFloat(values.cashTendered) - total) : 0,
                items: cart,
            }

            const transaction = await transactionService.store(data)

            // await printerService.print({
            //     transaction,
            //     options: {
            //         ...printerOptions,
            //     },
            //     settings,
            // });

            clearCart()
            reloadProducts()

            values.phoneNumber = ''
            values.paymentMethodUuid = ""
            values.cashTendered = ''
            values.transactionId = ''
            values.paymentServiceProviderUuid = ''

            onClose();
        } catch (error) {
            onClose();
        } finally {
            focusManager.clearFocus();
            setProcessing(false);
        }
    };

    const canProceed = (values: TransactionValues) => {
        if (processing) return false;

        switch (paymentMethodUuid) {
            case CHECKOUT.CASH:
                return parseFloat(values.cashTendered || '0') >= total;
            case CHECKOUT.E_PAYMENT:
                return values.phoneNumber.length >= 9 && values.transactionId.length >= 5;
            case CHECKOUT.BANK_TRANSFER:
                return values.transactionId.length > 0;
            default:
                return false;
        }
    };

    const getPaymentTitle = () => {
        switch (paymentMethodUuid) {
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
        switch (paymentMethodUuid) {
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 w-full max-w-6xl max-h-[90vh] flex flex-col">
                <div className="text-black p-4 border-b flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded flex items-center justify-center">
                            <span className="text-black dark:text-gray-200 font-bold">{getPaymentIcon()}</span>
                        </div>
                        <span className="text-black dark:text-gray-200 text-xl font-bold">{getPaymentTitle()}</span>
                    </div>
                </div>

                <Formik
                    onSubmit={handleCompleteTransaction}
                    initialValues={transactionValues}
                    validationSchema={newTransactionValidationSchema}
                    enableReinitialize={true}
                >
                    {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                        <Form className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 p-6 overflow-y-auto">
                                {paymentMethodUuid === CHECKOUT.CASH && (
                                    <CashPayment
                                        total={total}
                                        values={values}
                                        onValueChange={setFieldValue}
                                        focusManager={focusManager}
                                    />
                                )}

                                {paymentMethodUuid === CHECKOUT.E_PAYMENT && (
                                    <EPayment
                                        total={total}
                                        values={values}
                                        activeInput={activeInput}
                                        onValueChange={setFieldValue}
                                        onActiveInputChange={setActiveInput}
                                    />
                                )}

                                {paymentMethodUuid === CHECKOUT.BANK_TRANSFER && (
                                    <BankTransfer
                                        total={total}
                                        values={values}
                                        activeInput={activeInput}
                                        onValueChange={setFieldValue}
                                        onActiveInputChange={setActiveInput}
                                    />
                                )}
                            </div>

                            {processing && (
                                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                                        <span className="font-bold">Processing cash payment...</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-4 justify-center items-center border-t p-6 flex-shrink-0">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !canProceed(values)}
                                    className={`px-32 py-6 text-lg font-bold transition-colors rounded-none ${canProceed(values)
                                        ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                                        : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                        }`}
                                >
                                    {isSubmitting ? 'PROCESSING...' : 'PRINT RECEIPT'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="bg-red-500 text-white px-32 py-6 text-lg font-bold rounded-none hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CheckoutModal;