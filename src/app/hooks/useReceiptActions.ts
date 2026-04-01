import { useState, useCallback, RefObject } from 'react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../utils';
import { getSaleRef, getPaymentMethodName, getSaleDate } from '../utils/sale.helper';
import { decodeHtmlEntities } from '../utils/text-encoding';
import { blobToBase64, triggerDownload } from '../utils/file';

interface UseReceiptActionsParams {
    receiptRef?: RefObject<HTMLDivElement | null>;
    storeName?: string;
}

const generateReceiptText = (sale: Sale, storeName: string): string => {
    const ref = getSaleRef(sale);
    const date = formatDate(getSaleDate(sale) as string);
    const customer = sale.customer?.name || 'Walk-in Customer';
    const cashier = sale.user?.fullname || sale.user?.username || 'Administrator';
    const terminal = sale.terminal?.terminalLabel || sale.terminalId || 'Main Terminal';
    const paymentMethod = getPaymentMethodName(sale);
    const d = '================================';

    const lines = [
        d, '           RECEIPT', d,
        `Receipt #: ${ref}`,
        `Date: ${date}`,
        `Customer: ${customer}`,
        `Cashier: ${cashier}`,
        `Terminal: ${terminal}`,
        d, 'ITEMS', d,
    ];

    sale.items?.forEach(item => {
        lines.push(decodeHtmlEntities(item.product?.name) || 'Unknown Product');
        lines.push(`  ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.totalAmount)}`);
    });

    lines.push(d);
    lines.push(`Subtotal: ${formatCurrency(sale.subtotal)}`);
    if ((sale.taxAmount || 0) > 0) lines.push(`Tax: ${formatCurrency(sale.taxAmount)}`);
    if ((sale.discountAmount || 0) > 0) lines.push(`Discount: -${formatCurrency(sale.discountAmount)}`);
    lines.push(d);
    lines.push(`TOTAL: ${formatCurrency(sale.totalAmount)}`);
    lines.push(`Paid: ${formatCurrency(sale.amountPaid)}`);
    if ((sale.changeAmount || 0) > 0) lines.push(`Change: ${formatCurrency(sale.changeAmount)}`);
    lines.push(`Payment: ${paymentMethod}`);
    lines.push(d, storeName, 'Thank you for your business!', d);

    return lines.join('\n');
};

const buildShareText = (sale: Sale, storeName: string): string => {
    const ref = getSaleRef(sale);
    const date = formatDate(getSaleDate(sale) as string);
    return `📄 Receipt #${ref}\n\n📅 ${date}\n👤 ${sale.customer?.name || 'Walk-in Customer'}\n💰 ${formatCurrency(sale.totalAmount)}\n💳 ${getPaymentMethodName(sale)}\n\n🏪 ${storeName}`;
};

export const useReceiptActions = ({ receiptRef, storeName = 'Store' }: UseReceiptActionsParams = {}) => {
    const [isSharing, setIsSharing] = useState(false);
    const [copiedSaleId, setCopiedSaleId] = useState<string | null>(null);

    const captureAsImage = useCallback(async (): Promise<Blob | null> => {
        if (!receiptRef?.current) return null;
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                logging: false,
            });
            return new Promise((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
            });
        } catch {
            return null;
        }
    }, [receiptRef]);

    const handleCopyRef = useCallback(async (sale: Sale) => {
        const ref = getSaleRef(sale);
        if (!ref || ref === 'N/A') return;
        try {
            await navigator.clipboard.writeText(ref);
            setCopiedSaleId(sale.id);
            setTimeout(() => setCopiedSaleId(null), 2000);
        } catch { /* silently fail */ }
    }, []);

    const handleShare = useCallback(async (sale: Sale) => {
        setIsSharing(true);

        const ref = getSaleRef(sale);
        const title = `Receipt #${ref}`;
        const text = `Receipt from ${storeName}\nTotal: ${formatCurrency(sale.totalAmount)}`;
        const fileName = `receipt-${ref}.png`;

        try {
            const imageBlob = await captureAsImage();

            if (imageBlob && Capacitor.isNativePlatform()) {
                const { uri } = await Filesystem.writeFile({ path: fileName, data: await blobToBase64(imageBlob), directory: Directory.Cache });
                await Share.share({ title, text, files: [uri], dialogTitle: 'Share Receipt' });
                toast.success('Receipt shared');
                return;
            }

            if (imageBlob && navigator.canShare) {
                const file = new File([imageBlob], fileName, { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({ title, text, files: [file] });
                    toast.success('Receipt shared');
                    return;
                }
            }

            const shareText = buildShareText(sale, storeName);
            if (Capacitor.isNativePlatform()) {
                await Share.share({ title, text: shareText, dialogTitle: 'Share Receipt' });
            } else if (navigator.share) {
                await navigator.share({ title, text: shareText });
            } else {
                await navigator.clipboard.writeText(shareText);
            }
            toast.success(navigator.share || Capacitor.isNativePlatform() ? 'Receipt shared' : 'Receipt copied to clipboard');
        } catch (err: any) {
            if (err?.name === 'AbortError') return;
            try {
                await navigator.clipboard.writeText(`${title} — ${formatCurrency(sale.totalAmount)}`);
                toast.info('Receipt copied to clipboard');
            } catch {
                toast.error('Unable to share receipt');
            }
        } finally {
            setIsSharing(false);
        }
    }, [storeName, captureAsImage]);

    const handleDownload = useCallback(async (sale: Sale) => {
        const ref = getSaleRef(sale);
        const baseName = `receipt-${ref}`;

        try {
            const imageBlob = await captureAsImage();

            if (imageBlob) {
                if (Capacitor.isNativePlatform()) {
                    await Filesystem.writeFile({ path: `Downloads/${baseName}.png`, data: await blobToBase64(imageBlob), directory: Directory.Documents, recursive: true });
                } else {
                    triggerDownload(imageBlob, `${baseName}.png`);
                }
                toast.success('Receipt downloaded');
                return;
            }

            const content = generateReceiptText(sale, storeName);
            if (Capacitor.isNativePlatform()) {
                await Filesystem.writeFile({ path: `Downloads/${baseName}.txt`, data: content, directory: Directory.Documents, encoding: 'utf8' as any, recursive: true });
            } else {
                triggerDownload(new Blob([content], { type: 'text/plain' }), `${baseName}.txt`);
            }
            toast.success('Receipt downloaded');
        } catch {
            toast.error('Failed to download receipt');
        }
    }, [storeName, captureAsImage]);

    return { isSharing, copiedSaleId, handleCopyRef, handleShare, handleDownload };
};
