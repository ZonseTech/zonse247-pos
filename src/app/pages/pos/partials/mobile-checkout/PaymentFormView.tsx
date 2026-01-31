import { FunctionComponent } from 'react';
import { createPortal } from 'react-dom';
import { Form, Formik } from 'formik';
import { ArrowLeft } from 'lucide-react';
import EPayment from '../EPayment';
import CashPayment from '../CashPayment';
import BankTransfer from '../BankTransfer';
import { formatCurrency } from '../../../../utils';
import { DEFAULT_SEED_KEY } from '../../../../constants';
import { useFocusManager } from '../../../../hooks/useFocusManager';
import { CHECKOUT, PaymentMethod, ActiveInputType, SaleFormValues } from '../MobileCheckoutModal';
import * as Yup from 'yup';

interface PaymentFormViewProps {
    paymentMethodId: PaymentMethod;
    total: number;
    processing: boolean;
    selectedCustomer: Customer | null;
    activeInput: ActiveInputType;
    focusManager: ReturnType<typeof useFocusManager>;
    initialValues: SaleFormValues;
    onClose: () => void;
    onSubmit: (values: SaleFormValues) => Promise<void>;
    onActiveInputChange: (input: ActiveInputType) => void;
}

const getPaymentTitle = (paymentMethodId: PaymentMethod) => {
    switch (paymentMethodId) {
        case CHECKOUT.CASH:
            return 'Cash Payment';
        case CHECKOUT.BANK_TRANSFER:
            return 'Bank Transfer';
        case CHECKOUT.E_PAYMENT:
            return 'E-Payment';
        default:
            return 'Payment';
    }
};

const PaymentFormView: FunctionComponent<PaymentFormViewProps> = ({
    paymentMethodId,
    total,
    processing,
    selectedCustomer,
    activeInput,
    focusManager,
    initialValues,
    onClose,
    onSubmit,
    onActiveInputChange,
}) => {
    const validationSchema = Yup.object({
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

    return createPortal(
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[70] flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 safe-area-top-android">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getPaymentTitle(paymentMethodId)}
                </h1>
            </div>

            <Formik
                onSubmit={onSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
                enableReinitialize={true}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 overflow-y-auto p-4">
                            {selectedCustomer && selectedCustomer.customerId !== DEFAULT_SEED_KEY && (
                                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">⭐</span>
                                        <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                            {selectedCustomer.name}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {paymentMethodId === CHECKOUT.CASH && (
                                <CashPayment
                                    compact={true}
                                    total={total}
                                    values={values}
                                    onValueChange={setFieldValue}
                                    focusManager={focusManager}
                                />
                            )}

                            {paymentMethodId === CHECKOUT.E_PAYMENT && (
                                <EPayment
                                    compact={true}
                                    total={total}
                                    values={values}
                                    activeInput={activeInput}
                                    onValueChange={setFieldValue}
                                    onActiveInputChange={onActiveInputChange}
                                />
                            )}

                            {paymentMethodId === CHECKOUT.BANK_TRANSFER && (
                                <BankTransfer
                                    compact={true}
                                    total={total}
                                    values={values}
                                    activeInput={activeInput}
                                    onValueChange={setFieldValue}
                                    onActiveInputChange={onActiveInputChange}
                                />
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 space-y-3 safe-area-bottom">
                            <button
                                type="submit"
                                disabled={isSubmitting || !canProceed(values) || processing}
                                className={`w-full py-4 rounded-sm font-bold text-lg transition-all ${canProceed(values) && !processing
                                    ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting || processing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting || processing}
                                className="w-full py-3 rounded-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>,
        document.body
    );
};

export default PaymentFormView;
