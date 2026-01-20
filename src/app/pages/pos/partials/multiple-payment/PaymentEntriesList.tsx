import { FunctionComponent } from 'react';
import { CreditCard, ArrowUp } from 'lucide-react';
import classNames from 'classnames';
import { PaymentEntriesListProps } from './types';
import PaymentEntryCard from './PaymentEntryCard';

const PaymentEntriesList: FunctionComponent<PaymentEntriesListProps> = ({
    payments,
    remaining,
    processing,
    isEBN,
    onUpdate,
    onRemove,
}) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className={classNames(
                        "font-semibold text-gray-700 dark:text-gray-300",
                        isEBN ? "text-sm" : "text-sm sm:text-base"
                    )}>
                        Payments
                    </h3>
                </div>
                {payments.length > 0 && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {payments.length} {payments.length === 1 ? 'entry' : 'entries'}
                    </span>
                )}
            </div>

            {payments.length === 0 ? (
                <div className={classNames(
                    "text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30",
                    isEBN ? "py-6" : "py-8 sm:py-10"
                )}>
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ArrowUp className="w-5 h-5 text-gray-400 dark:text-gray-500 animate-bounce" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                        No payments added yet
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs px-4">
                        Select a payment method above to begin
                    </p>
                </div>
            ) : (
                <div className="space-y-2 sm:space-y-3">
                    {payments.map((payment, index) => (
                        <PaymentEntryCard
                            key={payment.id}
                            payment={payment}
                            index={index}
                            remaining={remaining}
                            processing={processing}
                            isEBN={isEBN}
                            onUpdate={onUpdate}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentEntriesList;
