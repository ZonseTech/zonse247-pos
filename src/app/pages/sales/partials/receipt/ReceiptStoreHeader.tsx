import { FunctionComponent } from 'react';
import { DashedDivider } from './ReceiptDividers';

interface ReceiptStoreHeaderProps {
    storeName: string;
    addressLine1?: string | null;
    phoneNumber?: string | null;
    showLogo?: boolean;
    logoUrl?: string;
    receiptHeader?: string;
    status: string;
}

const ReceiptStoreHeader: FunctionComponent<ReceiptStoreHeaderProps> = ({
    storeName,
    addressLine1,
    phoneNumber,
    showLogo,
    logoUrl,
    receiptHeader,
    status,
}) => {
    return (
        <>
            {/* Store Info */}
            <div className="text-center px-4 pt-4 pb-2">
                {showLogo && logoUrl && (
                    <img
                        src={logoUrl}
                        alt="Store Logo"
                        className="h-12 mx-auto mb-2 grayscale"
                    />
                )}
                <h2 className="text-sm font-bold uppercase tracking-wide">
                    {storeName}
                </h2>
                {addressLine1 && (
                    <p className="text-[10px] mt-0.5">{addressLine1}</p>
                )}
                {phoneNumber && (
                    <p className="text-[10px]">Tel: {phoneNumber}</p>
                )}
                {receiptHeader && (
                    <p className="text-[10px] mt-1">{receiptHeader}</p>
                )}
            </div>

            <DashedDivider />

            {/* Receipt Title */}
            <div className="text-center py-1">
                <p className="text-sm font-bold">SALES RECEIPT</p>
                {status === 'RETURNED' && (
                    <p className="text-[10px] font-bold">*** RETURNED ***</p>
                )}
                {status === 'VOIDED' && (
                    <p className="text-[10px] font-bold">*** VOIDED ***</p>
                )}
            </div>

            <DashedDivider />
        </>
    );
};

export default ReceiptStoreHeader;
