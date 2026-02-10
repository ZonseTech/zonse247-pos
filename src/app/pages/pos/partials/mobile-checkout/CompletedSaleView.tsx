import { FunctionComponent } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../../../../utils';
import { CHECKOUT, PaymentMethod } from '../MobileCheckoutModal';
import { CheckCircle } from 'lucide-react';

interface CompletedSaleViewProps {
    completedSale: Sale | Transaction;
    total: number;
    changeAmount: number;
    paymentMethodId: PaymentMethod;
    onGetReceipt: () => void;
    onNewTransaction: () => void;
}

const CompletedSaleView: FunctionComponent<CompletedSaleViewProps> = ({
    completedSale,
    total,
    changeAmount,
    paymentMethodId,
    onGetReceipt,
    onNewTransaction,
}) => {
    return createPortal(
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[70] flex flex-col safe-area-top-android">
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-full border border-emerald-500 dark:border-emerald-700  flex items-center justify-center animate-scale-in">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse-once">
                            <CheckCircle className="w-14 h-14 text-emerald-500 animate-check-draw" strokeWidth={3} />
                        </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-300 dark:border-emerald-500 animate-ring-expand opacity-0" />
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-300 dark:border-emerald-500 animate-ring-expand-delay opacity-0" />
                </div>

                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Transaction #{(completedSale as Sale).saleNumber || (completedSale as Transaction).refNumber}
                </p>

                <div className="w-full max-w-sm bg-gray-50 dark:bg-gray-800 rounded-sm p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                        <span className="text-xl font-bold text-sky-900 dark:text-white">
                            {formatCurrency(total, true)}
                        </span>
                    </div>
                    {paymentMethodId === CHECKOUT.CASH && changeAmount > 0 && (
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Change</span>
                            <span className="text-xl font-bold text-emerald-500 dark:text-emerald-400">
                                {formatCurrency(changeAmount, true)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 space-y-3 safe-area-bottom">
                <button
                    onClick={onGetReceipt}
                    className="w-full flex items-center uppercase justify-center gap-3 py-4 px-6 bg-sky-500 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold rounded-sm transition-all"
                >
                    Get Receipt
                </button>
                <button
                    onClick={onNewTransaction}
                    className="w-full flex items-center uppercase justify-center gap-3 py-4 px-6 bg-emerald-500 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-sm transition-all"
                >
                    NEW SALE
                </button>
            </div>
        </div>,
        document.body
    );
};

export default CompletedSaleView;
