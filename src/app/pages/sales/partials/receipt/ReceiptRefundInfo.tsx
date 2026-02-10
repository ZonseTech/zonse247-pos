import { FunctionComponent } from 'react';
import { formatCurrency } from '../../../../utils';
import { DashedDivider } from './ReceiptDividers';

interface RefundSummary {
    hasRefunds: boolean;
    refundCount: number;
    totalRefunded: number;
    remainingAmount: number;
    isFullyRefunded: boolean;
}

interface ReceiptRefundInfoProps {
    refundSummary: RefundSummary;
}

const ReceiptRefundInfo: FunctionComponent<ReceiptRefundInfoProps> = ({ refundSummary }) => {
    if (!refundSummary.hasRefunds) return null;

    return (
        <>
            <DashedDivider />
            <div className="px-4 py-1 space-y-0.5">
                <div className="text-[10px] font-bold uppercase mb-1">Refund Info</div>
                <div className="flex justify-between">
                    <span>Refunds:</span>
                    <span>{refundSummary.refundCount}</span>
                </div>
                <div className="flex justify-between">
                    <span>Total Refunded:</span>
                    <span>{formatCurrency(refundSummary.totalRefunded, true)}</span>
                </div>
                {!refundSummary.isFullyRefunded && (
                    <div className="flex justify-between">
                        <span>Remaining:</span>
                        <span>{formatCurrency(refundSummary.remainingAmount, true)}</span>
                    </div>
                )}
                {refundSummary.isFullyRefunded && (
                    <div className="text-center text-[10px] font-bold mt-1">
                        *** FULLY REFUNDED ***
                    </div>
                )}
            </div>
        </>
    );
};

export default ReceiptRefundInfo;
