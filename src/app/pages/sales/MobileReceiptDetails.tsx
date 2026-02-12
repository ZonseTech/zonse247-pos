import { FunctionComponent, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils';
import { decodeHtmlEntities } from '../../utils/text-encoding';
import saleService from '../../services/sale.service';
import printerService from '../../services/printer.service';
import { useAuth } from '../../context/AuthProvider';
import { useApp } from '../../context/AppProvider';
import { useBranch } from '../../context/BranchContext';
import InitiateReturnModal from '../returns/partials/InitiateReturnModal';
import returnsService from '../../services/returns.service';
import { Report } from 'notiflix';
import {
    ReceiptPageHeader,
    ReceiptStoreHeader,
    ReceiptTransactionInfo,
    ReceiptItemsList,
    ReceiptTotals,
    ReceiptPayment,
    ReceiptRefundInfo,
    ReceiptFooter,
    ReceiptLoadingState,
    ReceiptErrorState,
} from './partials/receipt';
import { CheckCircle, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

const getSaleRef = (sale: Sale | null): string => {
    if (!sale) return 'N/A';
    return sale.saleNumber || sale.id?.slice(-8) || 'N/A';
};

const getSaleDate = (sale: Sale | null): Date | string | undefined => {
    if (!sale) return undefined;
    return sale.saleDate || sale.createdAt;
};

const MobileReceiptDetails: FunctionComponent = () => {
    const { saleId } = useParams<{ saleId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { settings } = useApp();
    const { currentBranch } = useBranch();

    const [sale, setSale] = useState<Sale | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSaleDetails = async () => {
            if (!saleId || !user?.tenantId || !user?.branchId) {
                setError('Missing required parameters');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const response = await saleService.getReceipt(
                    saleId,
                    user.tenantId,
                    user.branchId
                );

                setSale(response);
            } catch (err) {
                console.error('Failed to fetch sale details:', err);
                setError('Failed to load receipt details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSaleDetails();
    }, [saleId, user?.tenantId, user?.branchId]);

    const saleData = useMemo(() => {
        if (!sale) return null;

        const paymentMethodName = sale.payments && sale.payments.length > 0
            ? sale.payments.map(p => p.paymentMethod?.name || p.paymentMethodId).join(', ')
            : sale.paymentMethod?.name || sale.paymentMethodId || 'Cash';

        return {
            refNumber: getSaleRef(sale),
            customerName: sale.customer?.name || 'Walk-in Customer',
            cashierName: sale.user?.fullname || sale.user?.username || 'Administrator',
            formattedDate: formatDate(getSaleDate(sale) as string),
            tillName: sale.terminal?.terminalLabel || sale.terminalId || 'Main Terminal',
            paymentMethodName,
            hasItems: Array.isArray(sale.items) && sale.items.length > 0,
            hasTax: (sale.taxAmount || 0) > 0,
            hasDiscount: (sale.discountAmount || 0) > 0,
            canReturn: returnsService.canReturn(sale as unknown as Transaction),
            refundSummary: returnsService.getRefundSummary(sale as unknown as Transaction),
            itemCount: sale.items?.length || 0,
            status: sale.status?.toUpperCase() || 'COMPLETED'
        };
    }, [sale]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleCopyRef = useCallback(async () => {
        const ref = getSaleRef(sale);
        if (ref === 'N/A') return;
        try {
            await navigator.clipboard.writeText(ref);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [sale]);

    const captureReceiptAsImage = async (): Promise<Blob | null> => {
        if (!receiptRef.current) return null;

        try {
            // Dynamically import html2canvas
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                logging: false,
            });

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png', 1.0);
            });
        } catch (error) {
            console.error('Failed to capture receipt:', error);
            return null;
        }
    };

    const handleShare = async () => {
        if (!sale || !saleData) return;

        setIsSharing(true);
        setIsMoreMenuOpen(false);

        try {
            // Try to capture receipt as image first
            const imageBlob = await captureReceiptAsImage();

            if (imageBlob) {
                // Convert blob to base64
                const reader = new FileReader();
                const base64Data = await new Promise<string>((resolve) => {
                    reader.onloadend = () => {
                        const base64 = reader.result as string;
                        resolve(base64.split(',')[1]); // Remove data:image/png;base64, prefix
                    };
                    reader.readAsDataURL(imageBlob);
                });

                // Check if running on native platform (Android/iOS)
                if (Capacitor.isNativePlatform()) {
                    const fileName = `receipt-${saleData.refNumber}.png`;

                    // Save file to cache directory first for sharing
                    const savedFile = await Filesystem.writeFile({
                        path: fileName,
                        data: base64Data,
                        directory: Directory.Cache,
                    });

                    // Use native share dialog
                    await Share.share({
                        title: `Receipt #${saleData.refNumber}`,
                        text: `Receipt from ${currentBranch?.branchName || 'Store'}\nTotal: ${formatCurrency(sale.totalAmount)}`,
                        files: [savedFile.uri],
                        dialogTitle: 'Share Receipt',
                    });

                    toast.success('Receipt shared successfully');
                    return;
                }

                // Web fallback - use Web Share API
                if (navigator.canShare) {
                    const file = new File([imageBlob], `receipt-${saleData.refNumber}.png`, { type: 'image/png' });

                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: `Receipt #${saleData.refNumber}`,
                            text: `Receipt from ${currentBranch?.branchName || 'Store'}\nTotal: ${formatCurrency(sale.totalAmount)}`,
                            files: [file],
                        });
                        toast.success('Receipt shared successfully');
                        return;
                    }
                }
            }

            // Fallback to text sharing
            const shareText = `📄 Receipt #${saleData.refNumber}\n\n📅 Date: ${saleData.formattedDate}\n👤 Customer: ${saleData.customerName}\n💰 Total: ${formatCurrency(sale.totalAmount)}\n💳 Payment: ${saleData.paymentMethodName}\n\n🏪 ${currentBranch?.branchName || 'Store'}`;

            if (Capacitor.isNativePlatform()) {
                await Share.share({
                    title: `Receipt #${saleData.refNumber}`,
                    text: shareText,
                    dialogTitle: 'Share Receipt',
                });
                toast.success('Receipt shared successfully');
            } else if (navigator.share) {
                await navigator.share({
                    title: `Receipt #${saleData.refNumber}`,
                    text: shareText,
                });
                toast.success('Receipt shared successfully');
            } else {
                // Final fallback - copy to clipboard
                await navigator.clipboard.writeText(shareText);
                toast.success('Receipt details copied to clipboard');
            }
        } catch (err: any) {
            if (err?.name !== 'AbortError') {
                console.error('Share failed:', err);
                // Try copying as last resort
                try {
                    const shareText = `Receipt #${saleData.refNumber}\nDate: ${saleData.formattedDate}\nTotal: ${formatCurrency(sale.totalAmount)}`;
                    await navigator.clipboard.writeText(shareText);
                    toast.info('Receipt details copied to clipboard');
                } catch {
                    toast.error('Unable to share receipt');
                }
            }
        } finally {
            setIsSharing(false);
        }
    };

    const handleDownload = async () => {
        if (!sale || !saleData) return;

        setIsMoreMenuOpen(false);

        try {
            // Try to download as image first
            const imageBlob = await captureReceiptAsImage();

            if (imageBlob) {
                const fileName = `receipt-${saleData.refNumber}.png`;

                // Check if running on native platform (Android/iOS)
                if (Capacitor.isNativePlatform()) {
                    // Convert blob to base64
                    const reader = new FileReader();
                    const base64Data = await new Promise<string>((resolve) => {
                        reader.onloadend = () => {
                            const base64 = reader.result as string;
                            resolve(base64.split(',')[1]); // Remove data:image/png;base64, prefix
                        };
                        reader.readAsDataURL(imageBlob);
                    });

                    // Save to Documents directory (accessible to user)
                    await Filesystem.writeFile({
                        path: `Downloads/${fileName}`,
                        data: base64Data,
                        directory: Directory.Documents,
                        recursive: true,
                    });

                    toast.success('Receipt saved to Downloads folder');
                    return;
                }

                // Web fallback - use download link
                const url = URL.createObjectURL(imageBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('Receipt downloaded as image');
                return;
            }

            // Fallback to text download
            const receiptContent = generateReceiptText();
            const fileName = `receipt-${saleData.refNumber}.txt`;

            if (Capacitor.isNativePlatform()) {
                // Save text file on native
                await Filesystem.writeFile({
                    path: `Downloads/${fileName}`,
                    data: receiptContent,
                    directory: Directory.Documents,
                    encoding: 'utf8' as any,
                    recursive: true,
                });
                toast.success('Receipt saved to Downloads folder');
            } else {
                // Web fallback
                const blob = new Blob([receiptContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('Receipt downloaded');
            }
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download receipt');
        }
    };

    const generateReceiptText = (): string => {
        if (!sale || !saleData) return '';

        const lines: string[] = [];
        const divider = '================================';

        lines.push(divider);
        lines.push('           RECEIPT');
        lines.push(divider);
        lines.push(`Receipt #: ${saleData.refNumber}`);
        lines.push(`Date: ${saleData.formattedDate}`);
        lines.push(`Customer: ${saleData.customerName}`);
        lines.push(`Cashier: ${saleData.cashierName}`);
        lines.push(`Terminal: ${saleData.tillName}`);
        lines.push(divider);
        lines.push('ITEMS');
        lines.push(divider);

        sale.items?.forEach(item => {
            const name = decodeHtmlEntities(item.product?.name) || 'Unknown Product';
            const qty = item.quantity;
            const price = formatCurrency(item.unitPrice);
            const total = formatCurrency(item.totalAmount);
            lines.push(`${name}`);
            lines.push(`  ${qty} x ${price} = ${total}`);
        });

        lines.push(divider);
        lines.push(`Subtotal: ${formatCurrency(sale.subtotal)}`);

        if (saleData.hasTax) {
            lines.push(`Tax: ${formatCurrency(sale.taxAmount)}`);
        }

        if (saleData.hasDiscount) {
            lines.push(`Discount: -${formatCurrency(sale.discountAmount)}`);
        }

        lines.push(divider);
        lines.push(`TOTAL: ${formatCurrency(sale.totalAmount)}`);
        lines.push(`Paid: ${formatCurrency(sale.amountPaid)}`);
        lines.push(`Change: ${formatCurrency(sale.changeAmount || 0)}`);
        lines.push(`Payment: ${saleData.paymentMethodName}`);
        lines.push(divider);
        lines.push('Thank you for your business!');
        lines.push(divider);

        return lines.join('\n');
    };

    const handlePrint = async () => {
        if (!sale) return;

        setIsPrinting(true);
        setIsMoreMenuOpen(false);

        try {
            await printerService.printReceipt({
                saleId: sale.id,
                transactionId: sale.saleNumber || sale.id,
                copies: settings?.receiptCopies || 1,
                includeHeader: true,
                includeFooter: true,
                includeLogo: settings?.showStoreLogo || false,
            });

            Report.success('Print Successful', 'Your receipt has been sent to the printer', 'OK');
        } catch (err) {
            console.error('Print failed:', err);
            Report.failure('Print Failed', 'Unable to print receipt. Please check your printer connection.', 'OK');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleInitiateReturn = () => {
        setIsMoreMenuOpen(false);
        setIsReturnModalOpen(true);
    };

    if (isLoading) {
        return <ReceiptLoadingState onBack={handleBack} />;
    }

    if (error || !sale || !saleData) {
        return <ReceiptErrorState error={error} onBack={handleBack} />;
    }

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
            <ReceiptPageHeader
                refNumber={saleData.refNumber}
                copied={copied}
                isPrinting={isPrinting}
                isSharing={isSharing}
                isMoreMenuOpen={isMoreMenuOpen}
                canReturn={saleData.canReturn}
                isFullyRefunded={saleData.refundSummary.isFullyRefunded}
                onBack={handleBack}
                onCopyRef={handleCopyRef}
                onShare={handleShare}
                onDownload={handleDownload}
                onPrint={handlePrint}
                onToggleMenu={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                onInitiateReturn={handleInitiateReturn}
            />

            <div className="flex-1 overflow-y-auto mt-[60px] pb-6 px-3">
                <div
                    ref={receiptRef}
                    className="bg-white dark:bg-gray-800 rounded-sm shadow-sm mx-auto max-w-sm font-mono text-xs text-gray-800 dark:text-gray-200"
                >
                    <ReceiptStoreHeader
                        storeName={currentBranch?.branchName || 'Store Name'}
                        addressLine1={currentBranch?.addressLine1}
                        phoneNumber={currentBranch?.phoneNumber}
                        showLogo={settings?.showStoreLogo}
                        logoUrl={settings?.logoUrl}
                        receiptHeader={settings?.receiptHeader}
                        status={saleData.status}
                    />

                    <ReceiptTransactionInfo
                        refNumber={saleData.refNumber}
                        formattedDate={saleData.formattedDate}
                        cashierName={saleData.cashierName}
                        tillName={saleData.tillName}
                        customerName={saleData.customerName}
                    />

                    <ReceiptItemsList items={sale.items || []} />

                    <ReceiptTotals
                        subtotal={sale.subtotal || 0}
                        taxAmount={sale.taxAmount || 0}
                        discountAmount={sale.discountAmount || 0}
                        totalAmount={sale.totalAmount || 0}
                        hasTax={saleData.hasTax}
                        hasDiscount={saleData.hasDiscount}
                    />

                    <ReceiptPayment
                        payments={sale.payments}
                        paymentMethodName={saleData.paymentMethodName}
                        amountPaid={sale.amountPaid || 0}
                        changeAmount={sale.changeAmount || 0}
                    />

                    <ReceiptRefundInfo refundSummary={saleData.refundSummary} />

                    <ReceiptFooter footerMessage={settings?.receiptFooter} />
                </div>
            </div>

            {sale && (
                <InitiateReturnModal
                    isOpen={isReturnModalOpen}
                    onClose={() => setIsReturnModalOpen(false)}
                    sale={sale}
                    onSuccess={() => {
                        setIsReturnModalOpen(false);
                        if (saleId && user?.tenantId && user?.branchId) {
                            saleService.getReceipt(saleId, user.tenantId, user.branchId)
                                .then(setSale)
                                .catch(console.error);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default MobileReceiptDetails;
