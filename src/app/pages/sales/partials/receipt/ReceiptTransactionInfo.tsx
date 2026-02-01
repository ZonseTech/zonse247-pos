import { FunctionComponent } from 'react';
import { SolidDivider } from './ReceiptDividers';

interface ReceiptTransactionInfoProps {
    refNumber: string;
    formattedDate: string;
    cashierName: string;
    tillName: string;
    customerName: string;
}

const ReceiptTransactionInfo: FunctionComponent<ReceiptTransactionInfoProps> = ({
    refNumber,
    formattedDate,
    cashierName,
    tillName,
    customerName,
}) => {
    return (
        <>
            <div className="px-4 py-1 space-y-0.5">
                <div className="flex justify-between">
                    <span>Receipt #:</span>
                    <span className="font-semibold">{refNumber}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{cashierName}</span>
                </div>
                <div className="flex justify-between">
                    <span>Terminal:</span>
                    <span>{tillName}</span>
                </div>
                {customerName !== 'Walk-in Customer' && (
                    <div className="flex justify-between">
                        <span>Customer:</span>
                        <span>{customerName}</span>
                    </div>
                )}
            </div>

            <SolidDivider />
        </>
    );
};

export default ReceiptTransactionInfo;
