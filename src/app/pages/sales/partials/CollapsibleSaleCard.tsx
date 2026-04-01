import { FunctionComponent } from 'react';
import { Eye, RotateCcw, Trash2, Share2, Printer, Copy, CheckCircle, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils';
import { Flex, Text, Button, Separator, IconButton, Badge } from '@radix-ui/themes';
import * as Collapsible from '@radix-ui/react-collapsible';
import dayjs from 'dayjs';

const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
};

interface CollapsibleSaleCardProps {
    sale: Sale;
    isExpanded: boolean;
    onToggle: () => void;
    onView?: (sale: Sale) => void;
    onReturn?: (sale: Sale) => void;
    onDelete?: (sale: Sale) => void;
    onShare?: (sale: Sale) => void;
    onPrint?: (sale: Sale) => void;
    onDownload?: (sale: Sale) => void;
    onCopyRef?: (sale: Sale) => void;
    showFullDate?: boolean;
    isPrinting?: boolean;
    isSharing?: boolean;
    copiedSaleId?: string | null;
    canReturn?: boolean;
    refundSummary?: {
        hasRefunds: boolean;
        totalRefunded: number;
        remainingAmount: number;
        refundCount: number;
        isFullyRefunded: boolean;
    };
}

const getPaymentName = (paymentMethodId?: string): string => {
    switch (paymentMethodId) {
        case 'cash':
            return 'Cash';
        case 'mobile-money':
            return 'Mobile Money';
        case 'bank-transfer':
            return 'Bank Transfer';
        default:
            return paymentMethodId || 'Cash';
    }
};

const STATUS_CONFIG: Record<string, { color: 'green' | 'orange' | 'red' | 'blue' | 'gray'; label: string }> = {
    COMPLETED: { color: 'green', label: 'Completed' },
    PENDING: { color: 'orange', label: 'Pending' },
    VOIDED: { color: 'red', label: 'Voided' },
    RETURNED: { color: 'blue', label: 'Returned' },
};

const CollapsibleSaleCard: FunctionComponent<CollapsibleSaleCardProps> = ({
    sale,
    isExpanded,
    onToggle,
    onView,
    onReturn,
    onDelete,
    onShare,
    onPrint,
    onDownload,
    onCopyRef,
    showFullDate = false,
    isPrinting = false,
    isSharing = false,
    copiedSaleId = null,
    canReturn: canReturnSale = true,
    refundSummary,
}) => {
    const saleNumber = sale.saleNumber || sale.id?.slice(-8) || 'N/A';
    const itemCount = sale.items?.length || 0;
    const dateFormat = showFullDate ? 'MMM D, YYYY h:mm A' : 'h:mm A';
    const customerName = sale.customer?.name || 'Walk-in Customer';
    const paymentMethodName = sale.payments && sale.payments.length > 0
        ? sale.payments.map(p => p.paymentMethod?.name || p.paymentMethodId).join(', ')
        : getPaymentName(sale.paymentMethodId);
    const isCopied = copiedSaleId === sale.id;
    const status = sale.status?.toUpperCase() || 'COMPLETED';
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.COMPLETED;

    return (
        <Collapsible.Root open={isExpanded} onOpenChange={onToggle}>
            <div className="rounded-[var(--radius-2)] border border-[var(--gray-a6)] bg-[var(--color-surface)] overflow-hidden">
                <Collapsible.Trigger asChild>
                    <button className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--gray-a2)] transition-colors">
                        <div className="flex items-center gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Text as="p" size="2" weight="bold">
                                        {saleNumber}
                                    </Text>
                                    {status !== 'COMPLETED' && (
                                        <Badge size="1" color={statusConfig.color} variant="soft">
                                            {statusConfig.label}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Text as="span" size="1" color="gray">
                                        {dayjs(sale.createdAt).format(dateFormat)}
                                    </Text>
                                    <Text as="span" size="1" color="gray">•</Text>
                                    <Text as="span" size="1" color="gray">
                                        {paymentMethodName}
                                    </Text>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <Text as="p" size="2" weight="bold" color="grass">
                                {formatCurrency(sale.totalAmount, true)}
                            </Text>
                            <Text as="p" size="1" color="gray">
                                {itemCount} item{itemCount !== 1 ? 's' : ''}
                            </Text>
                        </div>
                    </button>
                </Collapsible.Trigger>

                <Collapsible.Content>
                    <div className="bg-[var(--gray-a2)]">
                        <Separator size="4" />

                        {/* Transaction summary */}
                        <div className="px-3 pt-3 pb-2 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Text size="1" color="gray">Customer</Text>
                                <Text size="1" weight="medium">{customerName}</Text>
                            </div>
                            <div className="flex items-center justify-between">
                                <Text size="1" color="gray">Payment</Text>
                                <Text size="1" weight="medium">{paymentMethodName}</Text>
                            </div>
                            {(sale.amountPaid || 0) > 0 && (
                                <div className="flex items-center justify-between">
                                    <Text size="1" color="gray">Paid</Text>
                                    <Text size="1" weight="medium">{formatCurrency(sale.amountPaid)}</Text>
                                </div>
                            )}
                            {(sale.changeAmount || 0) > 0 && (
                                <div className="flex items-center justify-between">
                                    <Text size="1" color="gray">Change</Text>
                                    <Text size="1" weight="medium">{formatCurrency(sale.changeAmount)}</Text>
                                </div>
                            )}
                        </div>

                        {/* Items list */}
                        {sale.items && sale.items.length > 0 && (
                            <>
                                <Separator size="4" />
                                <div className="p-3 space-y-1">
                                    {sale.items.map((item, index) => (
                                        <div
                                            key={item.id || index}
                                            className="flex items-center justify-between py-1.5 px-2 bg-[var(--color-background)] rounded-md"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <Text size="2" color="gray" className="truncate">
                                                    {decodeHtmlEntities(item.product?.name || 'Unknown Product')}
                                                </Text>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Text size="2" color="gray">x{item.quantity}</Text>
                                                <Text size="2" weight="medium" className="min-w-[80px] text-right">
                                                    {formatCurrency(item.quantity * item.unitPrice)}
                                                </Text>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="px-3 pb-2">
                                    <Separator size="4" mb="2" />
                                    {(sale.discountAmount || 0) > 0 && (
                                        <div className="flex items-center justify-between mb-1">
                                            <Text size="1" color="gray">Discount</Text>
                                            <Text size="1" color="red">-{formatCurrency(sale.discountAmount)}</Text>
                                        </div>
                                    )}
                                    {(sale.taxAmount || 0) > 0 && (
                                        <div className="flex items-center justify-between mb-1">
                                            <Text size="1" color="gray">Tax</Text>
                                            <Text size="1">{formatCurrency(sale.taxAmount)}</Text>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <Text size="2" weight="bold">Total</Text>
                                        <Text size="2" weight="bold" color="grass">
                                            {formatCurrency(sale.totalAmount, true)}
                                        </Text>
                                    </div>
                                </div>

                                {/* Refund info */}
                                {refundSummary?.hasRefunds && (
                                    <>
                                        <Separator size="4" />
                                        <div className="px-3 py-2">
                                            {refundSummary.isFullyRefunded ? (
                                                <Badge size="1" color="red" variant="soft" className="!w-full !justify-center !py-1">
                                                    FULLY REFUNDED
                                                </Badge>
                                            ) : (
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Text size="1" color="gray">
                                                            Refunded ({refundSummary.refundCount} return{refundSummary.refundCount !== 1 ? 's' : ''})
                                                        </Text>
                                                        <Text size="1" color="red" weight="medium">
                                                            -{formatCurrency(refundSummary.totalRefunded)}
                                                        </Text>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <Text size="1" color="gray">Refundable</Text>
                                                        <Text size="1" weight="medium">
                                                            {formatCurrency(refundSummary.remainingAmount)}
                                                        </Text>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Quick actions row */}
                        <Separator size="4" />
                        <div className="px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <IconButton
                                    variant="ghost"
                                    size="1"
                                    color="gray"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCopyRef?.(sale);
                                    }}
                                    aria-label="Copy reference"
                                >
                                    {isCopied
                                        ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        : <Copy className="w-4 h-4" />
                                    }
                                </IconButton>
                                <IconButton
                                    variant="ghost"
                                    size="1"
                                    color="gray"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onShare?.(sale);
                                    }}
                                    disabled={isSharing}
                                    aria-label="Share receipt"
                                    className={isSharing ? 'animate-pulse' : ''}
                                >
                                    <Share2 className="w-4 h-4" />
                                </IconButton>
                                <IconButton
                                    variant="ghost"
                                    size="1"
                                    color="gray"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPrint?.(sale);
                                    }}
                                    disabled={isPrinting}
                                    aria-label="Print receipt"
                                    className={isPrinting ? 'animate-pulse' : ''}
                                >
                                    <Printer className="w-4 h-4" />
                                </IconButton>
                                <IconButton
                                    variant="ghost"
                                    size="1"
                                    color="gray"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDownload?.(sale);
                                    }}
                                    aria-label="Download receipt"
                                >
                                    <Download className="w-4 h-4" />
                                </IconButton>
                            </div>

                            <Flex align="center" gap="1">
                                <Button
                                    variant="soft"
                                    size="1"
                                    radius="full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onView?.(sale);
                                    }}
                                    aria-label="View sale"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    View
                                </Button>
                                {canReturnSale && !refundSummary?.isFullyRefunded && (
                                    <Button
                                        variant="soft"
                                        color="orange"
                                        size="1"
                                        radius="full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onReturn?.(sale);
                                        }}
                                        aria-label="Return sale"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Return
                                    </Button>
                                )}
                                <Button
                                    variant="soft"
                                    color="red"
                                    size="1"
                                    radius="full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete?.(sale);
                                    }}
                                    aria-label="Delete sale"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </Button>
                            </Flex>
                        </div>
                    </div>
                </Collapsible.Content>
            </div>
        </Collapsible.Root>
    );
};

export default CollapsibleSaleCard;
