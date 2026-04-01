import { FunctionComponent, useMemo, useCallback, useState, useRef } from 'react';
import { Modal } from '../../../components';
import { formatCurrency, formatDate } from '../../../utils';
import {
    RotateCcw, X, Copy, CheckCircle, Clock, AlertTriangle, Package, Printer,
    User, CreditCard, Calendar, Hash, ShoppingBag, AlertCircle
} from 'lucide-react';
import { useIsEBN } from '../../../hooks/useMediaQuery';

interface ReturnDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    returnDetails: ReturnDetails | null;
}

const restockStatusStyles: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-amber-600 dark:text-amber-400', label: 'Pending' },
    restocked: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', label: 'Restocked' },
    damaged: { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', label: 'Damaged' },
};

const conditionColors: Record<string, string> = {
    excellent: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30',
    good: 'text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-900/30',
    fair: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30',
    damaged: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/30',
    defective: 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30',
};

const getOverallRestockStatus = (items: ReturnItem[]) => {
    const allRestocked = items.every(i => i.restockStatus === 'restocked');
    const anyPending = items.some(i => i.restockStatus === 'pending');
    const anyDamaged = items.some(i => i.restockStatus === 'damaged');
    if (allRestocked) return restockStatusStyles.restocked;
    if (anyPending) return restockStatusStyles.pending;
    if (anyDamaged) return restockStatusStyles.damaged;
    return { icon: AlertCircle, color: 'text-gray-500', label: 'Unknown' };
};

const InfoLine: FunctionComponent<{
    label: string;
    value: string;
    compact?: boolean;
}> = ({ label, value, compact = false }) => (
    <div className="flex justify-between items-baseline">
        <span className={compact
            ? "text-[10px] text-gray-500 dark:text-gray-400"
            : "text-xs text-gray-500 dark:text-gray-400"
        }>
            {label}
        </span>
        <span className={compact
            ? "text-[10px] font-medium text-gray-900 dark:text-gray-100 text-right truncate ml-3 max-w-[60%]"
            : "text-sm font-medium text-gray-900 dark:text-gray-100 text-right truncate ml-4 max-w-[60%]"
        }>
            {value}
        </span>
    </div>
);

const ReturnDetailsModal: FunctionComponent<ReturnDetailsModalProps> = ({
    isOpen,
    onClose,
    returnDetails,
}) => {
    const [copied, setCopied] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);
    const isEBN = useIsEBN();

    const parseNumber = (val: number | string | undefined): number => {
        if (val === undefined || val === null) return 0;
        return typeof val === 'string' ? parseFloat(val) || 0 : val;
    };

    const toDateString = (val: string | Date | undefined): string => {
        if (!val) return '';
        return typeof val === 'string' ? val : val.toISOString();
    };

    const getProductName = (item: ReturnItem): string => {
        if (item.product?.name) return item.product.name;
        const originalSale = returnDetails?.originalSale;
        if (originalSale?.items) {
            const saleItem = originalSale.items.find(
                (si: any) => si.id === item.originalOrderId || si.productId === item.productId
            );
            if (saleItem?.product?.name) return saleItem.product.name;
        }
        return `Product #${item.productId.slice(0, 8)}...`;
    };

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const handlePrint = useCallback(() => {
        if (!printRef.current || !returnDetails) return;
        const printContent = printRef.current.innerHTML;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const refNum = returnDetails.returnNumber || returnDetails.returnTransaction?.refNumber || '';
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Return Receipt - ${refNum}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Courier New', monospace; padding: 20px; color: #1f2937; max-width: 380px; margin: 0 auto; }
                    @media print { body { padding: 0; } .no-print { display: none !important; } }
                </style>
            </head>
            <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    }, [returnDetails]);

    const handleCopyRef = useCallback(async () => {
        const ref = returnDetails?.returnNumber || returnDetails?.returnTransaction?.refNumber;
        if (!ref) return;
        try {
            await navigator.clipboard.writeText(ref);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [returnDetails]);

    const returnData = useMemo(() => {
        if (!returnDetails) return null;

        const originalSale = returnDetails.originalSale;
        const returnTransaction = returnDetails.returnTransaction;
        const originalTransaction = returnDetails.originalTransaction;

        const statusInfo = getOverallRestockStatus(returnDetails.returnItems || []);

        return {
            returnRefNumber: returnDetails.returnNumber || returnTransaction?.refNumber || 'N/A',
            originalRefNumber: originalSale?.saleNumber || originalTransaction?.refNumber || 'N/A',
            customerName:
                originalSale?.customer?.name ||
                originalTransaction?.customer?.name ||
                'Walk-in Customer',
            cashierName:
                originalSale?.user?.fullname ||
                originalSale?.user?.username ||
                returnTransaction?.user?.fullname ||
                returnTransaction?.user?.username ||
                'Administrator',
            returnDate: formatDate(toDateString(returnDetails.createdAt || returnTransaction?.date)),
            originalDate: formatDate(toDateString(originalSale?.saleDate || originalTransaction?.date)),
            refundAmount: returnDetails.refundAmount || 0,
            paymentMethod: originalSale?.paymentMethod?.name || returnTransaction?.paymentMethod?.name || 'Original Method',
            hasItems: Array.isArray(returnDetails.returnItems) && returnDetails.returnItems.length > 0,
            statusInfo,
            totalQty: (returnDetails.returnItems || []).reduce(
                (sum, item) => sum + parseNumber(item.returnedQuantity), 0
            ),
        };
    }, [returnDetails]);

    if (!returnDetails || !returnData) return null;

    const StatusIcon = returnData.statusInfo.icon;
    const c = isEBN;

    const iconBtnClass = `p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors`;
    const iconSize = c ? "w-4 h-4" : "w-[18px] h-[18px]";

    const modalHeader = (
        <div className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${c ? "py-2" : "py-2.5"}`}>
            <span className={`font-semibold text-gray-800 dark:text-gray-200 ${c ? "text-xs" : "text-sm"}`}>
                Return Receipt
            </span>
            <div className="flex items-center gap-0.5">
                <button onClick={handlePrint} className={iconBtnClass} aria-label="Print receipt">
                    <Printer className={iconSize} />
                </button>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
                <button onClick={handleClose} className={iconBtnClass} aria-label="Close">
                    <X className={iconSize} />
                </button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            title=""
            onClose={handleClose}
            showCloseButton={false}
            header={modalHeader}
            size="full"
            className={c ? "max-w-xl" : "max-w-lg"}
        >
            <div className={`${c ? "max-h-[65vh] py-3" : "max-h-[75vh] py-4"} overflow-y-auto`}>
                <div ref={printRef}>
                    {/* Receipt header */}
                    <div className={`text-center ${c ? "mb-2" : "mb-3"}`}>
                        <p className={`font-bold tracking-wider text-gray-900 dark:text-gray-100 uppercase ${c ? "text-sm" : "text-base"}`}>
                            Return Receipt
                        </p>
                        <div className={`flex items-center justify-center gap-2 ${c ? "mt-1" : "mt-1.5"}`}>
                            <span className={`font-mono text-gray-500 dark:text-gray-400 ${c ? "text-[10px]" : "text-xs"}`}>
                                #{returnData.returnRefNumber}
                            </span>
                            <button
                                onClick={handleCopyRef}
                                className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Copy reference"
                            >
                                {copied
                                    ? <CheckCircle className="w-3 h-3 text-green-500" />
                                    : <Copy className="w-3 h-3 text-gray-400" />
                                }
                            </button>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span className={`inline-flex items-center gap-1 ${returnData.statusInfo.color} ${c ? "text-[10px]" : "text-xs"}`}>
                                <StatusIcon className="w-3 h-3" />
                                {returnData.statusInfo.label}
                            </span>
                        </div>
                    </div>

                    {/* Dashed divider */}
                    <div className="border-t border-dashed border-gray-300 dark:border-gray-600" />

                    {/* Transaction info */}
                    <div className={c ? "py-2" : "py-3"}>
                        <div className={c ? "space-y-1 px-1" : "space-y-1.5"}>
                            <InfoLine label="Customer" value={returnData.customerName} compact={c} />
                            <InfoLine label="Processed By" value={returnData.cashierName} compact={c} />
                            <InfoLine label="Return Date" value={returnData.returnDate} compact={c} />
                            <InfoLine label="Original Sale" value={returnData.originalRefNumber} compact={c} />
                            <InfoLine label="Original Date" value={returnData.originalDate} compact={c} />
                            <InfoLine label="Refund Method" value={returnData.paymentMethod} compact={c} />
                        </div>
                    </div>

                    {/* Returned items */}
                    <div>
                        {/* Dashed divider top */}
                        <div className={c ? "border-t border-dashed border-gray-300 dark:border-gray-600 my-2" : "border-t border-dashed border-gray-300 dark:border-gray-600 my-3"} />

                        {/* Table header */}
                        <div className={c
                            ? "flex justify-between text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-1"
                            : "flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-2"
                        }>
                            <span className="flex-1">Item</span>
                            <span className={c ? "w-10 text-center" : "w-12 text-center"}>Qty</span>
                            <span className={c ? "w-16 text-right" : "w-20 text-right"}>Price</span>
                            <span className={c ? "w-16 text-right" : "w-24 text-right"}>Amount</span>
                        </div>

                        <div className={c ? "border-t border-gray-200 dark:border-gray-700 mb-1" : "border-t border-gray-200 dark:border-gray-700 mb-1.5"} />

                        {returnData.hasItems ? (
                            <div>
                                {returnDetails.returnItems.map((item, index) => {
                                    const qty = parseNumber(item.returnedQuantity);
                                    const price = parseNumber(item.returnPrice);
                                    const total = qty * price;
                                    const restockStyle = restockStatusStyles[item.restockStatus] || restockStatusStyles.pending;
                                    const RestockIcon = restockStyle.icon;

                                    return (
                                        <div key={item.returnItemId || index}>
                                            <div className={c
                                                ? "flex justify-between items-start py-1 text-[10px]"
                                                : "flex justify-between items-start py-1.5 text-sm"
                                            }>
                                                <span className="flex-1 text-gray-900 dark:text-gray-100 pr-2 truncate">
                                                    {getProductName(item)}
                                                </span>
                                                <span className={`${c ? "w-10" : "w-12"} text-center text-gray-600 dark:text-gray-400 tabular-nums`}>
                                                    {qty}
                                                </span>
                                                <span className={`${c ? "w-16" : "w-20"} text-right text-gray-600 dark:text-gray-400 tabular-nums`}>
                                                    {formatCurrency(price)}
                                                </span>
                                                <span className={`${c ? "w-16" : "w-24"} text-right font-medium text-gray-900 dark:text-gray-100 tabular-nums`}>
                                                    {formatCurrency(total)}
                                                </span>
                                            </div>
                                            {/* Item meta: condition, restock status, reason */}
                                            <div className={`flex flex-wrap items-center gap-1.5 ${c ? "pb-1 pl-0.5" : "pb-1.5 pl-1"}`}>
                                                <span className={`px-1.5 py-0.5 rounded-full ${c ? "text-[8px]" : "text-[10px]"} font-medium ${conditionColors[item.condition] || conditionColors.good}`}>
                                                    {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                                                </span>
                                                <span className={`inline-flex items-center gap-0.5 ${c ? "text-[8px]" : "text-[10px]"} ${restockStyle.color}`}>
                                                    <RestockIcon className="w-2.5 h-2.5" />
                                                    {restockStyle.label}
                                                </span>
                                                <span className={`${c ? "text-[8px]" : "text-[10px]"} text-gray-400 dark:text-gray-500`}>
                                                    {item.returnReason.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={c ? "text-center py-6" : "text-center py-10"}>
                                <Package className={c ? "w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-1" : "w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2"} />
                                <p className={c
                                    ? "text-[10px] text-gray-400 dark:text-gray-500"
                                    : "text-sm text-gray-400 dark:text-gray-500"
                                }>No items</p>
                            </div>
                        )}

                        {/* Item count footer */}
                        {returnData.hasItems && (
                            <div className={c
                                ? "border-t border-gray-200 dark:border-gray-700 pt-1 mt-1 flex justify-between text-[9px] text-gray-500 dark:text-gray-400"
                                : "border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1.5 flex justify-between text-xs text-gray-500 dark:text-gray-400"
                            }>
                                <span>{returnDetails.returnItems.length} item{returnDetails.returnItems.length !== 1 ? 's' : ''}</span>
                                <span>{returnData.totalQty} unit{returnData.totalQty !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    {/* Refund Summary */}
                    <div>
                        {/* Dashed divider */}
                        <div className={c ? "border-t border-dashed border-gray-300 dark:border-gray-600 my-2" : "border-t border-dashed border-gray-300 dark:border-gray-600 my-3"} />

                        {/* Total - bold double-line style */}
                        <div className={c ? "border-t border-double border-gray-900 dark:border-gray-100 mt-2 pt-1.5" : "border-t-2 border-double border-gray-900 dark:border-gray-100 mt-3 pt-2"}>
                            <div className="flex justify-between items-baseline">
                                <span className={c
                                    ? "text-xs font-bold text-gray-900 dark:text-gray-100 uppercase"
                                    : "text-base font-bold text-gray-900 dark:text-gray-100 uppercase"
                                }>
                                    Total Refund
                                </span>
                                <span className={c
                                    ? "text-sm font-bold text-sky-600 dark:text-sky-400 tabular-nums"
                                    : "text-xl font-bold text-sky-600 dark:text-sky-400 tabular-nums"
                                }>
                                    {formatCurrency(returnData.refundAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Payment method */}
                        <div className={c ? "border-t border-dashed border-gray-300 dark:border-gray-600 mt-2 pt-2" : "border-t border-dashed border-gray-300 dark:border-gray-600 mt-3 pt-3"}>
                            <div className={c ? "flex justify-between items-baseline py-0.5" : "flex justify-between items-baseline py-1"}>
                                <span className={`${c ? "text-[10px]" : "text-sm"} text-gray-400 dark:text-gray-500`}>
                                    Refund Method
                                </span>
                                <span className={`tabular-nums ${c ? "text-[10px]" : "text-sm"} font-medium text-gray-900 dark:text-gray-100`}>
                                    {returnData.paymentMethod}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Receipt footer */}
                    <div className={`border-t border-dashed border-gray-300 dark:border-gray-600 ${c ? "mt-3 pt-2" : "mt-4 pt-3"}`}>
                        <p className={`text-center text-gray-400 dark:text-gray-500 ${c ? "text-[9px]" : "text-[10px]"}`}>
                            Return processed successfully
                        </p>
                    </div>

                    {/* Print-only footer */}
                    <div className="hidden print:block text-center mt-4 pt-2 border-t border-dashed border-gray-400 text-xs text-gray-500">
                        <p>Printed: {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ReturnDetailsModal;
