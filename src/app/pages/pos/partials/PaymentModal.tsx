import { Report } from 'notiflix';
import { HiOutlineCash } from 'react-icons/hi';
import { formatCurrency } from '../../../utils';
import { Button, Modal } from '../../../components';
import FormInput from '../../../components/FormInput';
import ConfirmPaymentModal from './ConfirmPaymentModal';
import FormSelectBox from '../../../components/FormSelectBox';
import { useProducts } from '../../../context/ProductsProvider';
import IconLabelButton from '../../../components/IconLabelButton';
import { Fragment, useState, useEffect, type FunctionComponent } from 'react';
import HoldPayment from './HoldPayment';
import { v4 as uuidv4 } from 'uuid';

const PaymentModal: FunctionComponent = () => {
    const serviceProviders: Array<PaymentMethod> = [
        { uuid: uuidv4(), name: 'Airtel Money' },
        { uuid: uuidv4(), name: 'TNM Mpamba' },
        { uuid: uuidv4(), name: 'National Bank' },
        { uuid: uuidv4(), name: 'FDH' },
        { uuid: uuidv4(), name: 'Standard Bank' },
    ];

    const { cart, total } = useProducts();
    const [price, setPrice] = useState<number>(0);
    const [changeAmount, setChange] = useState<number>(0);
    const [rawPayment, setRawPayment] = useState<number>(0);
    const [displayPayment, setDisplayPayment] = useState<string>('0.00');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
    const isPaymentSufficient = rawPayment >= price;

    useEffect(() => {
        setPrice(total);
    }, [total]);

    useEffect(() => {
        const changeAmount = rawPayment - price;
        setChange(changeAmount > 0 ? changeAmount : 0);
    }, [rawPayment, price]);

    const formatAndSetPayment = (value: string) => {
        const numeric = value.replace(/,/g, '');
        if (/^\d*\.?\d{0,2}$/.test(numeric)) {
            const num = parseFloat(numeric) || 0;
            setRawPayment(num);
            setDisplayPayment(
                num.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                })
            );
        }
    };

    const handleNumberInput = (num: number) => {
        const newValue = (rawPayment.toString() + num.toString()).replace(/^0+/, '');
        formatAndSetPayment(newValue);
    };

    const handleClear = () => {
        setRawPayment(0);
        setDisplayPayment('0.00');
    };

    const handleBackspace = () => {
        const numeric = displayPayment.replace(/,/g, '');
        const updated = numeric.slice(0, -1) || '0.00';
        formatAndSetPayment(updated);
    };

    const handleDecimalPoint = () => {
        if (!displayPayment.includes('.')) {
            formatAndSetPayment(displayPayment + '.');
        }
    };

    const handlePayment = () => {
        if (cart.length > 0) setIsPaymentModalOpen(!isPaymentModalOpen);
        else Report.warning("Oops!", "There is nothing to pay!", "Ok");
    };

    return (
        <Fragment>
            <HoldPayment />

            <IconLabelButton
                key={Math.random().toString()}
                color="bg-green-400"
                iconColor="bg-green-500"
                text="Pay"
                icon={<HiOutlineCash className="w-5 h-5" />}
                onClick={handlePayment}
            />

            <Modal
                title="Payment"
                isOpen={isPaymentModalOpen}
                onClose={handlePayment}
                className="max-w-lg bg-white text-gray-700 rounded shadow-lg"
            >
                <ConfirmPaymentModal
                    changeAmount={changeAmount}
                    totalAmountPaid={rawPayment}
                    isPaymentSufficient={isPaymentSufficient}
                    setIsPaymentModalOpen={setIsPaymentModalOpen}
                    setPaymentMethod={setPaymentMethod}
                    setDisplayPayment={handleClear}
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            {paymentMethod !== "Cash" && (
                                <Fragment>
                                    <FormSelectBox
                                        label='Service Provider'
                                        name='serviceProviderId'
                                        options={serviceProviders.map((provider: ServiceProvider) => ({
                                            value: provider.uuid.toString(),
                                            label: provider.name
                                        }))}
                                    />

                                    <FormInput
                                        label='Transaction ID'
                                        name="transactionId"
                                        type="text"
                                        required
                                        placeholder="Enter transaction ID"
                                        className='p-3'
                                    />

                                    <FormInput
                                        label='Phone Number'
                                        name="phoneNumber"
                                        type="text"
                                        inputMode='tel'
                                        required
                                        placeholder="Mobile phone number"
                                        className='p-3'
                                    />

                                </Fragment>
                            )}

                            <div className="bg-gray-100 rounded p-3 text-lg flex justify-between">
                                <span className="text-gray-600">Price</span>
                                <span>{formatCurrency(price)}</span>
                            </div>
                            <div className="bg-gray-100 rounded p-3 text-lg flex flex-col justify-between items-start">
                                <span className="text-gray-600">Payment</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={displayPayment}
                                    name='amountPaid'
                                    onChange={(e) => formatAndSetPayment(e.target.value)}
                                    className="flex w-full flex-1 bg-transparent text-right outline-none text-gray-800 text-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 'AC', 4, 5, 6, '←', 7, 8, 9, '.', '', 0, ''].map((key, idx) => {
                                if (key === '') return <div key={idx}></div>;

                                let onClick = () => {
                                    /* Handle on click */
                                };
                                let className = 'bg-green-400 hover:bg-green-500';

                                if (typeof key === 'number') {
                                    onClick = () => handleNumberInput(key);
                                } else if (key === 'AC') {
                                    onClick = handleClear;
                                    className = 'bg-red-400 hover:bg-red-500';
                                } else if (key === '←') {
                                    onClick = handleBackspace;
                                    className = 'bg-red-400 hover:bg-red-500';
                                } else if (key === '.') {
                                    onClick = handleDecimalPoint;
                                    className = 'bg-yellow-500 hover:bg-yellow-600';
                                }

                                return (
                                    <Button
                                        key={idx}
                                        onClick={onClick}
                                        type="button"
                                        className={`${className} block text-white text-2xl py-5 rounded`}
                                    >
                                        {key}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </ConfirmPaymentModal>

            </Modal>
        </Fragment>
    );
};

export default PaymentModal;
