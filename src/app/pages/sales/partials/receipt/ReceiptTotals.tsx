import { FunctionComponent } from 'react';
import { formatCurrency } from '../../../../utils';
import { DashedDivider } from './ReceiptDividers';

interface ReceiptTotalsProps {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    hasTax: boolean;
    hasDiscount: boolean;
}

const ReceiptTotals: FunctionComponent<ReceiptTotalsProps> = ({
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    hasTax,
    hasDiscount,
}) => {
    return (
        <>
            {/* Subtotals */}
            <div className="px-4 py-1 space-y-0.5">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal, true)}</span>
                </div>
                {hasTax && (
                    <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(taxAmount, true)}</span>
                    </div>
                )}
                {hasDiscount && (
                    <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatCurrency(discountAmount, true)}</span>
                    </div>
                )}
            </div>

            <DashedDivider />

            {/* Grand Total */}
            <div className="px-4 py-2">
                <div className="flex justify-between text-sm font-bold">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(totalAmount, true)}</span>
                </div>
            </div>

            <DashedDivider />
        </>
    );
};

export default ReceiptTotals;
