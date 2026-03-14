import { FunctionComponent } from 'react';
import { ShieldCheck, QrCode, ExternalLink } from 'lucide-react';
import { SolidDivider } from './ReceiptDividers';

interface ReceiptMraInfoProps {
    mraSaleStatus?: MraSaleStatus;
    mraFiscalCode?: string | null;
    mraInvoiceNumber?: string | null;
    mraVerificationUrl?: string | null;
    isMraEnabled?: boolean;
}

/**
 * MRA Fiscal Information Component for Receipts
 * 
 * Displays MRA compliance information on receipts including:
 * - Fiscal code
 * - Invoice number
 * - Verification status
 * - QR code link (if available)
 * 
 * Only renders when the tenant is MRA-compliant and sale has MRA data
 */
const ReceiptMraInfo: FunctionComponent<ReceiptMraInfoProps> = ({
    mraSaleStatus,
    mraFiscalCode,
    mraInvoiceNumber,
    mraVerificationUrl,
    isMraEnabled = false,
}) => {
    // Don't render if MRA is not enabled or status is not applicable
    if (!isMraEnabled || !mraSaleStatus || mraSaleStatus === 'NOT_APPLICABLE') {
        return null;
    }

    // Status display configurations
    const statusDisplay: Record<Exclude<MraSaleStatus, 'NOT_APPLICABLE'>, { label: string; color: string }> = {
        PENDING: { label: 'Pending Verification', color: 'text-amber-600 dark:text-amber-400' },
        SUBMITTED: { label: 'Submitted to MRA', color: 'text-blue-600 dark:text-blue-400' },
        VERIFIED: { label: 'MRA Verified', color: 'text-green-600 dark:text-green-400' },
        FAILED: { label: 'Verification Failed', color: 'text-red-600 dark:text-red-400' },
        REJECTED: { label: 'Rejected by MRA', color: 'text-orange-600 dark:text-orange-400' },
        CANCELLED: { label: 'Cancelled', color: 'text-gray-500 dark:text-gray-400' },
    };

    const currentStatus = statusDisplay[mraSaleStatus];
    if (!currentStatus) return null;

    return (
        <>
            <SolidDivider />
            <div className="px-4 py-2 space-y-1.5 bg-gray-50 dark:bg-gray-800/50">
                {/* MRA Header */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    <ShieldCheck className="w-3 h-3" />
                    <span>MRA Fiscal Invoice</span>
                </div>

                {/* Status */}
                <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`font-medium ${currentStatus.color}`}>
                        {currentStatus.label}
                    </span>
                </div>

                {/* Fiscal Code */}
                {mraFiscalCode && (
                    <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 dark:text-gray-400">Fiscal Code:</span>
                        <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                            {mraFiscalCode}
                        </span>
                    </div>
                )}

                {/* MRA Invoice Number */}
                {mraInvoiceNumber && (
                    <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 dark:text-gray-400">MRA Invoice #:</span>
                        <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                            {mraInvoiceNumber}
                        </span>
                    </div>
                )}

                {/* Verification URL Link */}
                {mraVerificationUrl && mraSaleStatus === 'VERIFIED' && (
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                        <a
                            href={mraVerificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[9px] text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            <QrCode className="w-3 h-3" />
                            <span>Verify Invoice</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>
                )}

                {/* Pending Message */}
                {mraSaleStatus === 'PENDING' && (
                    <p className="text-[9px] text-center text-gray-500 dark:text-gray-400 italic">
                        Invoice is being processed by MRA
                    </p>
                )}

                {/* Failed Message */}
                {mraSaleStatus === 'FAILED' && (
                    <p className="text-[9px] text-center text-red-500 dark:text-red-400 italic">
                        MRA submission failed. Please contact support.
                    </p>
                )}
            </div>
        </>
    );
};

export default ReceiptMraInfo;
