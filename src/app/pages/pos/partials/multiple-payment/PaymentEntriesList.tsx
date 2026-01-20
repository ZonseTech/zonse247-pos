import { FunctionComponent } from 'react';
import { Plus } from 'lucide-react';
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
            <h3 className={classNames(
                "font-semibold text-gray-700 dark:text-gray-300 mb-3",
                isEBN ? "text-sm" : "text-base"
            )}>
                Payment Entries ({payments.length})
            </h3>

            {payments.length === 0 ? (
                <div className={classNames(
                    "text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-sm",
                    isEBN ? "py-6" : "py-12"
                )}>
                    <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                        Click a payment method above to add a payment
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
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
