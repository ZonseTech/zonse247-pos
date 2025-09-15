import * as Yup from 'yup';
import { Report } from 'notiflix';
import { Form, Formik, } from 'formik';
import { Input } from '../../../components'
import { useApp } from '../../../context/AppProvider';
import { useAuth } from '../../../context/AuthProvider';
import PrinterPreviewModal from './PrinterPreviewModal';
import { useProducts } from '../../../context/ProductsProvider';
import { formatCurrency, generateReferenceNumber } from '../../../utils';
import { Fragment, type FunctionComponent, type PropsWithChildren, useState } from 'react'
import transactionService from '../../../services/transactions.service';
import { HiOutlineCash, HiOutlineCreditCard, HiOutlineRefresh, HiOutlineCheck } from 'react-icons/hi';

type Props = {
    changeAmount: number;
    totalAmountPaid: number;
    isPaymentSufficient: boolean;
    setIsPaymentModalOpen: (isOpen: boolean) => void;
    setPaymentMethod: (value: string) => void;
    setDisplayPayment: (value: string) => void;
}

const ConfirmPaymentModal: FunctionComponent<PropsWithChildren<Props>> = ({
    changeAmount,
    totalAmountPaid,
    isPaymentSufficient,
    setIsPaymentModalOpen,
    setPaymentMethod,
    setDisplayPayment,
    children
}) => {
    const transactionValues = {
        paymentMethodUuid: "1",
        paymentServiceProviderUuid: '',
        transactionId: '',
        phoneNumber: '',
    }

    const { user } = useAuth()
    const { settings } = useApp()
    const {
        discount,
        tax,
        total,
        subtotal,
        paymentMethods,
        selectedCustomer,
        cart,
        clearCart,
        reloadProducts
    } = useProducts()

    const [isProcessPaymentOpen, setPrintReceipt] = useState(false)
    const [requestBody, setRequestBody] = useState<Transaction>({} as Transaction)

    const newTransactionValidationSchema = Yup.object({
        paymentMethodUuid: Yup.string().required('Payment method is required'),
        paymentServiceProviderUuid: Yup.string().when('paymentMethodUuid', {
            is: (value: string) => value !== "1",
            then: () => Yup.string()
                .required('Service provider is required')
                .min(1, 'Please select a service provider'),
            otherwise: () => Yup.string().nullable(),
        }),
        transactionId: Yup.string().when('paymentMethodUuid', {
            is: (value: string) => value !== "1",
            then: () => Yup.string()
                .required('Transaction ID is required')
                .min(5, 'Transaction ID must be at least 5 characters'),
            otherwise: () => Yup.string().nullable(),
        }),
        phoneNumber: Yup.string().when('paymentMethodUuid', {
            is: (value: string) => value !== "1",
            then: () => Yup.string()
                .required('Phone number is required')
                .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
            otherwise: () => Yup.string().nullable(),
        }),
    });

    const handleConfirmPayment = async (values: TransactionValues) => {
        try {
            if (isPaymentSufficient) {
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
                    paid: totalAmountPaid,
                    changeAmount,
                    items: cart,
                }
                const transactionDetails = await transactionService.store(data)
                clearCart()
                reloadProducts()
                setRequestBody(transactionDetails)


                values.phoneNumber = ''
                values.paymentMethodUuid = "1"
                values.paymentServiceProviderUuid = ''

                setDisplayPayment('0.00')

                Report.success(
                    'Success',
                    'Payment processed successfully',
                    'Ok', () => setPrintReceipt(true)
                );

            } else {
                Report.failure("Error", "Insufficient payment amount", "Ok");
            }
        } catch (error) {
            Report.failure(
                'Print Error',
                'An error occurred while processing the payment.' + error,
                'OK'
            );
        }
    };

    const getPaymentIcon = (paymentMethod: string) => {
        switch (paymentMethod.toLowerCase()) {
            case 'cash':
                return <HiOutlineCash className="w-5 h-5" />;
            case 'card':
            case 'credit':
            case 'debit':
                return <HiOutlineCreditCard className="w-5 h-5" />;
            default:
                return <HiOutlineCreditCard className="w-5 h-5" />;
        }
    };

    return (
        <Fragment>
            <Formik
                onSubmit={handleConfirmPayment}
                initialValues={transactionValues}
                validationSchema={newTransactionValidationSchema}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                Select Payment Method
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                {paymentMethods.map(({ uuid, name }) => (
                                    <label
                                        key={uuid}
                                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${values.paymentMethodUuid === uuid
                                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        <Input
                                            type="radio"
                                            name="paymentMethodUuid"
                                            value={uuid}
                                            checked={values.paymentMethodUuid === uuid}
                                            className="sr-only"
                                            onChange={() => {
                                                setPaymentMethod(uuid)
                                                setFieldValue('paymentMethodUuid', uuid);

                                                if (paymentMethods.some(condition => condition.uuid === uuid)) {
                                                    setFieldValue('paymentServiceProviderUuid', '');
                                                    setFieldValue('transactionId', '');
                                                    setFieldValue('phoneNumber', '');
                                                }
                                            }}
                                        />

                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${values.paymentMethodUuid === uuid
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                                }`}>
                                                {getPaymentIcon(name)}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${values.paymentMethodUuid === uuid
                                                    ? 'text-blue-700 dark:text-blue-300'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {name}
                                                </p>
                                            </div>
                                            {values.paymentMethodUuid === uuid && (
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <HiOutlineCheck className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                            <div className="max-h-[35rem] overflow-y-auto">
                                {children}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-emerald-500 dark:bg-emerald-600 rounded-lg flex items-center justify-center">
                                        <HiOutlineRefresh className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Change Amount</p>
                                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {changeAmount > 0 ? formatCurrency(changeAmount) : '0.00'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!isPaymentSufficient || isSubmitting}
                                className={`p-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${isPaymentSufficient && !isSubmitting
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 focus:ring-blue-500/50'
                                    : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75 shadow-none'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <HiOutlineCheck className="w-5 h-5" />
                                        <span>Confirm Payment</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>

            <PrinterPreviewModal
                isOpen={isProcessPaymentOpen}
                setIsOpen={() => setPrintReceipt(false)}
                setIsPaymentModalOpen={() => setIsPaymentModalOpen(false)}
                title="Print Receipt"
                transaction={requestBody} />
        </Fragment>
    )
}

export default ConfirmPaymentModal