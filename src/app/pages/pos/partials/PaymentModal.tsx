import { Report } from 'notiflix';
import { HiOutlineCash } from 'react-icons/hi';
import { formatCurrency } from '../../../utils';
import { Modal } from '../../../components';
import FormInput from '../../../components/FormInput';
import ConfirmPaymentModal from './ConfirmPaymentModal';
import FormSelectBox from '../../../components/FormSelectBox';
import { useProducts } from '../../../context/ProductsProvider';
import { Fragment, useState, useEffect, type FunctionComponent } from 'react';

const PaymentModal: FunctionComponent = () => {
    const [price, setPrice] = useState<number>(0);
    const [changeAmount, setChange] = useState<number>(0);
    const { cart, total, paymentServiceProvider } = useProducts();
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
            <button
                onClick={handlePayment}
                className="group inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white
                        bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800
                        dark:from-emerald-500 dark:to-green-600 dark:hover:from-emerald-600 dark:hover:to-green-700
                        disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                        border border-emerald-600/20 dark:border-emerald-400/20 rounded-lg shadow-lg
                        hover:shadow-xl hover:shadow-emerald-500/25 disabled:shadow-none hover:scale-105 active:scale-95
                        disabled:transform-none disabled:hover:scale-100
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/50
                        disabled:focus:ring-gray-400/50
                        transition-all duration-200 ease-in-out"
                disabled={cart.length === 0}
            >
                <div className="w-8 h-8 flex items-center justify-center bg-emerald-400/30 dark:bg-emerald-300/20 group-disabled:bg-gray-400/30 backdrop-blur-sm rounded-full border border-white/30 group-disabled:border-gray-300/20">
                    <HiOutlineCash className="w-5 h-5 text-white group-disabled:text-gray-300" />
                </div>
                <span>Process Payment</span>
            </button>

            <Modal
                title="Payment Processing"
                isOpen={isPaymentModalOpen}
                onClose={handlePayment}
                className="max-w-4xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
            >
                <ConfirmPaymentModal
                    changeAmount={changeAmount}
                    totalAmountPaid={rawPayment}
                    isPaymentSufficient={isPaymentSufficient}
                    setIsPaymentModalOpen={setIsPaymentModalOpen}
                    setPaymentMethod={setPaymentMethod}
                    setDisplayPayment={handleClear}
                >
                    <div className="flex flex-col gap-6 p-2">
                        <div className="flex flex-col gap-4">
                            {paymentMethod !== "Cash" && (
                                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                                        Digital Payment Details
                                    </h3>
                                    <FormSelectBox
                                        label='Service Provider'
                                        name='serviceProviderId'
                                        options={paymentServiceProvider.map((provider: PaymentServiceProvider) => ({
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
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Amount</span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(price)}</span>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Payment Amount</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={displayPayment}
                                            name='amountPaid'
                                            onChange={(e) => formatAndSetPayment(e.target.value)}
                                            className="w-full bg-transparent text-right outline-none text-emerald-900 dark:text-emerald-100 
                                                     text-2xl font-bold placeholder-emerald-400 dark:placeholder-emerald-500
                                                     focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 rounded px-2 py-1"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {changeAmount > 0 && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Change Amount</span>
                                            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{formatCurrency(changeAmount)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment Keypad</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 'AC', 4, 5, 6, '←', 7, 8, 9, '.', '', 0, ''].map((key, idx) => {
                                    if (key === '') return <div key={idx}></div>;

                                    let onClick = () => {
                                        /* Handle on click */
                                    };
                                    let className = 'bg-gradient-to-b from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 border border-slate-300';
                                    let darkClassName = 'dark:from-slate-600 dark:to-slate-700 dark:hover:from-slate-500 dark:hover:to-slate-600 dark:text-slate-100 dark:border-slate-500';

                                    if (typeof key === 'number') {
                                        onClick = () => handleNumberInput(key);
                                    } else if (key === 'AC') {
                                        onClick = handleClear;
                                        className = 'bg-gradient-to-b from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white border-red-500';
                                        darkClassName = 'dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700';
                                    } else if (key === '←') {
                                        onClick = handleBackspace;
                                        className = 'bg-gradient-to-b from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white border-orange-500';
                                        darkClassName = 'dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700';
                                    } else if (key === '.') {
                                        onClick = handleDecimalPoint;
                                        className = 'bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white border-blue-500';
                                        darkClassName = 'dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700';
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={onClick}
                                            type="button"
                                            className={`${className} ${darkClassName} 
                                                      h-12 rounded-lg text-lg font-semibold shadow-sm
                                                      hover:shadow-md active:scale-95 
                                                      focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                                      transition-all duration-150 ease-in-out`}
                                        >
                                            {key}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </ConfirmPaymentModal>
            </Modal>
        </Fragment>
    );
};

export default PaymentModal;