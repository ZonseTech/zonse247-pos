import * as Yup from 'yup';
import { Form, Formik, } from 'formik';
import { Button, Input } from '../../../components'
import { useApp } from '../../../context/AppProvider';
import { useAuth } from '../../../context/AuthProvider';
import PrinterPreviewModal from './PrinterPreviewModal';
import { useProducts } from '../../../context/ProductsProvider';
import { formatCurrency, generateReferenceNumber } from '../../../utils';
import { Fragment, type FunctionComponent, type PropsWithChildren, useState } from 'react'
import transactionService from '../../../services/transactions.service';
import { Report } from 'notiflix';

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
        paymentMethodId: "Cash",
        serviceProviderId: 0,
        transactionId: '',
        phoneNumber: '',
        amountPaid: 0,
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
        paymentMethodId: Yup.string().required('Payment method is required'),
        serviceProviderId: Yup.string().when('paymentMethodId', {
            is: (value: string) => value !== "Cash",
            then: () => Yup.string()
                .required('Service provider is required')
                .min(1, 'Please select a service provider'),
            otherwise: () => Yup.string().nullable(),
        }),
        transactionId: Yup.string().when('paymentMethodId', {
            is: (value: string) => value !== "Cash",
            then: () => Yup.string()
                .required('Transaction ID is required')
                .min(5, 'Transaction ID must be at least 5 characters'),
            otherwise: () => Yup.string().nullable(),
        }),
        phoneNumber: Yup.string().when('paymentMethodId', {
            is: (value: string) => value !== "Cash",
            then: () => Yup.string()
                .required('Phone number is required')
                .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
            otherwise: () => Yup.string().nullable(),
        }),
    });

    const handleConfirmPayment = async (values: TransactionValues) => {
        const refNumber = generateReferenceNumber()
        const paymentMethod = paymentMethods.find(method => method.name === values.paymentMethodId);

        const data: Transaction = {
            uuid: '',
            refNumber,
            discount,
            customer: selectedCustomer,
            subtotal,
            tax,
            date: new Date().toJSON(),
            paymentId: paymentMethod?.uuid as string,
            transactionId: values.transactionId,
            phoneNumber: values.phoneNumber as string,
            serviceProviderId: values.serviceProviderId as number,
            total,
            paid: totalAmountPaid,
            changeAmount,
            till: settings?.tillName as string,
            userId: user.uuid,
            items: cart,
        }

        setRequestBody(data)

        try {
            if (isPaymentSufficient) {
                await transactionService.store(data)
                clearCart()
                reloadProducts()

                values.amountPaid = 0
                values.phoneNumber = ''
                values.transactionId = ''
                values.paymentMethodId = "Cash"
                values.serviceProviderId = 0

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

    return (
        <Fragment>
            <Formik
                onSubmit={handleConfirmPayment}
                initialValues={transactionValues}
                validationSchema={newTransactionValidationSchema}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form className=''>
                        <div className="grid grid-cols-2 rounded overflow-hidden border border-gray-200 mb-4">
                            {paymentMethods.map(({ uuid, name }) => (
                                <label
                                    key={uuid}
                                    className={`py-3 text-lg font-normal transition flex items-center justify-center cursor-pointer ${values.paymentMethodId === name
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white text-gray-700'
                                        }`}
                                >
                                    <Input
                                        type="radio"
                                        name="paymentMethodId"
                                        value={name}
                                        checked={values.paymentMethodId === name}
                                        className="sr-only"
                                        onChange={() => {
                                            setPaymentMethod(name)
                                            setFieldValue('paymentMethodId', name);

                                            if (paymentMethods.some(condition => condition.name === name)) {
                                                setFieldValue('serviceProviderId', 0);
                                                setFieldValue('transactionId', '');
                                                setFieldValue('phoneNumber', '');
                                            }
                                        }}
                                    />
                                    {name}
                                </label>
                            ))}
                        </div>

                        <div className="max-h-[35rem] overflow-y-auto mb-4">
                            {children}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2">

                            <Button
                                type="button"
                                className="bg-sky-400 hover:bg-sky-500 text-white py-4 rounded text-lg">
                                Change {changeAmount > 0 ? formatCurrency(changeAmount) : '0.00'}
                            </Button>

                            <Button
                                type="submit"
                                disabled={!isPaymentSufficient}
                                loading={isSubmitting}
                                className={`${isPaymentSufficient ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'} text-white py-4 rounded text-lg`}
                            >
                                Confirm Payment
                            </Button>
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