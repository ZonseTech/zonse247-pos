import { FunctionComponent } from 'react';
import { formatCurrency } from '../../../../utils';

interface ReceiptPaymentProps {
    payments?: SalePayment[];
    paymentMethodName: string;
    amountPaid: number;
    changeAmount: number;
}

const ReceiptPayment: FunctionComponent<ReceiptPaymentProps> = ({
    payments,
    paymentMethodName,
    amountPaid,
    changeAmount,
}) => {
    const hasMultiplePayments = payments && payments.length > 1;

    return (
        <div className="px-4 py-1 space-y-0.5">
            <div className="text-[10px] font-bold uppercase mb-1">Payment</div>
            {hasMultiplePayments ? (
                <>
                    {payments.map((payment, idx) => (
                        <div key={idx} className="flex justify-between">
                            <span>{payment.paymentMethod?.name || payment.paymentMethodId}:</span>
                            <span>{formatCurrency(payment.amount, true)}</span>
                        </div>
                    ))}
                </>
            ) : (
                <div className="flex justify-between">
                    <span>{paymentMethodName}:</span>
                    <span>{formatCurrency(amountPaid, true)}</span>
                </div>
            )}
            {changeAmount > 0 && (
                <div className="flex justify-between font-semibold">
                    <span>Change:</span>
                    <span>{formatCurrency(changeAmount, true)}</span>
                </div>
            )}
        </div>
    );
};

export default ReceiptPayment;
