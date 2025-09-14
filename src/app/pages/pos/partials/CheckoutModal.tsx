import EPayment from './EPayment';
import CashPayment from './CashPayment';
import BankTransfer from './BankTransfer';
import { FunctionComponent, useState, useEffect } from 'react';
import { useFocusManager } from '../../../hooks/useFocusManager';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    checkoutType: typeof CHECKOUT[keyof typeof CHECKOUT];
    onCompleteTransaction: (paymentMethod: string, cashTendered?: number) => void;
}

export const CHECKOUT = {
    BANK_TRANSFER: 'bank-transfer',
    E_PAYMENT: 'e-payment',
    CASH: 'cash',
} as const;

export type PaymentMethod = typeof CHECKOUT[keyof typeof CHECKOUT];


export type ActiveInputType = 'phone' | 'account' | null;

const CheckoutModal: FunctionComponent<CheckoutModalProps> = ({
    isOpen,
    onClose,
    total,
    onCompleteTransaction,
    checkoutType,
}) => {
    const focusManager = useFocusManager();
    const [cashTendered, setCashTendered] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [processing, setProcessing] = useState<boolean>(false);
    const [activeInput, setActiveInput] = useState<ActiveInputType>(null);

    useEffect(() => {
        if (isOpen) {
            setCashTendered('');
            setPhoneNumber('');
            setAccountNumber('');
            setProcessing(false);
            setActiveInput(null);
        }
    }, [isOpen, checkoutType, focusManager]);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen || processing) return;

        switch (event.key) {
            case 'Escape':
                onClose();
                break;
            case 'Enter':
                handleCompleteTransaction();
                break;
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, checkoutType, cashTendered, total, processing, phoneNumber, accountNumber]);

    const handleCompleteTransaction = async () => {
        if (processing) return;

        if (checkoutType === CHECKOUT.CASH) {
            const tendered = parseFloat(cashTendered) || 0;
            if (tendered >= total) {
                onCompleteTransaction(checkoutType, tendered);
            }
        } else if (checkoutType === CHECKOUT.E_PAYMENT) {
            setProcessing(true);
            setTimeout(() => {
                setProcessing(false);
                onCompleteTransaction(`${checkoutType}`, total);
            }, 2000);
        } else if (checkoutType === CHECKOUT.BANK_TRANSFER) {
            if (!accountNumber) return;

            setProcessing(true);
            setTimeout(() => {
                setProcessing(false);
                onCompleteTransaction(checkoutType, total);
            }, 2000);
        }
    };

    const canProceed = () => {
        if (processing) return false;

        switch (checkoutType) {
            case CHECKOUT.CASH:
                return parseFloat(cashTendered || '0') >= total;
            case CHECKOUT.E_PAYMENT:
                return true;
            case CHECKOUT.BANK_TRANSFER:
                return accountNumber.length > 0;
            default:
                return false;
        }
    };

    const getPaymentTitle = () => {
        switch (checkoutType) {
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
        switch (checkoutType) {
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
            <div className="bg-white dark:bg-gray-900 w-full max-w-6xl max-h-[150vh] overflow-hidden">
                <div className="text-black p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded flex items-center justify-center">
                            <span className="text-black font-bold">{getPaymentIcon()}</span>
                        </div>
                        <span className="text-xl font-bold">{getPaymentTitle()}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-black hover:text-gray-300 text-2xl font-bold"
                        disabled={processing}
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {checkoutType === CHECKOUT.CASH && (
                        <CashPayment
                            total={total}
                            onCashTenderedChange={setCashTendered}
                            focusManager={focusManager}
                            processing={processing}
                        />
                    )}

                    {checkoutType === CHECKOUT.E_PAYMENT && (
                        <EPayment
                            total={total}
                            phoneNumber={phoneNumber}
                            activeInput={activeInput}
                            processing={processing}
                            onPhoneChange={setPhoneNumber}
                        />
                    )}

                    {checkoutType === CHECKOUT.BANK_TRANSFER && (
                        <BankTransfer
                            total={total}
                            accountNumber={accountNumber}
                            activeInput={activeInput}
                            processing={processing}
                            onAccountChange={setAccountNumber}
                        />
                    )}

                    <div className="flex space-x-4 justify-center items-center border-t pt-8">
                        <button
                            onClick={handleCompleteTransaction}
                            disabled={!canProceed()}
                            className={`px-32 py-6 text-lg font-bold transition-colors rounded-none ${canProceed()
                                ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                }`}
                        >
                            {processing ? 'PROCESSING...' : 'PRINT RECEIPT'}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={processing}
                            className="bg-red-500 text-white px-32 py-6 text-lg font-bold rounded-none hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            CANCEL
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;