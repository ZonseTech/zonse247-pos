import { FunctionComponent, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils';
import { getErrorMessage } from '../../utils/api-error-handler';
import { getSaleRef, getSaleDate, getPaymentMethodName } from '../../utils/sale.helper';
import saleService from '../../services/sale.service';
import printerService from '../../services/printer.service';
import { useAuth } from '../../context/AuthProvider';
import { useApp } from '../../context/AppProvider';
import { useBranch } from '../../context/BranchContext';
import { useMraCompliance } from '../../hooks/useMraCompliance';
import { useReceiptActions } from '../../hooks/useReceiptActions';
import returnsService from '../../services/returns.service';
import { Report } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import InitiateReturnModal from '../returns/partials/InitiateReturnModal';
import { ROUTES } from '../../utils/constants';
import {
    ReceiptStoreHeader,
    ReceiptTransactionInfo,
    ReceiptItemsList,
    ReceiptTotals,
    ReceiptPayment,
    ReceiptRefundInfo,
    ReceiptMraInfo,
    ReceiptFooter,
    ReceiptLoadingState,
    ReceiptErrorState,
} from './partials/receipt';
import { Flex, IconButton, Tooltip } from '@radix-ui/themes';
import { Printer, Copy, CheckCircle, RotateCcw, Download, Share2 } from 'lucide-react';

const SaleDetailsPage: FunctionComponent = () => {
    const { saleId } = useParams<{ saleId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { settings } = useApp();
    const { currentBranch } = useBranch();
    const { isMraEnabled } = useMraCompliance();
    const receiptRef = useRef<HTMLDivElement>(null);

    const [sale, setSale] = useState<Sale | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const { isSharing, copiedSaleId, handleCopyRef, handleShare, handleDownload } = useReceiptActions({
        receiptRef,
        storeName: currentBranch?.branchName,
    });

    const fetchSaleDetails = useCallback(async () => {
        if (!saleId || !user?.tenantId || !user?.branchId) {
            setError('Missing required parameters');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const response = await saleService.getSale(saleId, user.tenantId, user.branchId);
            setSale(response);
        } catch (err) {
            console.error('Failed to fetch sale details:', err);
            setError('Failed to load sale details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [saleId, user?.tenantId, user?.branchId]);

    useEffect(() => {
        fetchSaleDetails();
    }, [fetchSaleDetails]);

    const saleData = useMemo(() => {
        if (!sale) return null;

        return {
            refNumber: getSaleRef(sale),
            customerName: sale.customer?.name || 'Walk-in Customer',
            cashierName: sale.user?.fullname || sale.user?.username || 'Administrator',
            formattedDate: formatDate(getSaleDate(sale) as string),
            tillName: sale.terminal?.terminalLabel || sale.terminalId || 'Main Terminal',
            paymentMethodName: getPaymentMethodName(sale),
            hasItems: Array.isArray(sale.items) && sale.items.length > 0,
            hasTax: (sale.taxAmount || 0) > 0,
            hasDiscount: (sale.discountAmount || 0) > 0,
            canReturn: returnsService.canReturn(sale as unknown as Transaction),
            refundSummary: returnsService.getRefundSummary(sale as unknown as Transaction),
            status: sale.status?.toUpperCase() || 'COMPLETED',
        };
    }, [sale]);

    const handleBack = useCallback(() => navigate(ROUTES.SALES), [navigate]);

    const handlePrint = useCallback(async () => {
        if (!sale) return;

        setIsPrinting(true);
        try {
            const defaultPrinter = await printerService.getDefault('receipt');
            if (defaultPrinter) {
                await printerService.quickPrintReceipt(sale.id, 1);
                Report.success('Print Successful', `Receipt sent to ${defaultPrinter.printerName}`, 'OK');
            } else {
                Report.info('No Printer', 'No default receipt printer configured', 'OK');
            }
        } catch (err) {
            const actualError = (err as any)?.error || err;
            const errorMessage = getErrorMessage(actualError, 'Failed to print receipt');
            Report.failure('Print Failed', errorMessage, 'OK');
        } finally {
            setIsPrinting(false);
        }
    }, [sale]);

    const handleReturnSuccess = useCallback(() => {
        setIsReturnModalOpen(false);
        fetchSaleDetails();
    }, [fetchSaleDetails]);

    if (isLoading) {
        return <ReceiptLoadingState onBack={handleBack} />;
    }

    if (error || !sale || !saleData) {
        return <ReceiptErrorState error={error} onBack={handleBack} />;
    }

    return (
        <AppLayout>
            <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
                <PageHeader
                    title="Receipt"
                    description={`Reference: #${saleData.refNumber}`}
                    showBackButton
                    onBack={handleBack}
                    action={
                        <Flex gap="1" align="center">
                            <Tooltip content={copiedSaleId === sale.id ? 'Copied!' : 'Copy reference'}>
                                <IconButton
                                    variant="ghost"
                                    size="2"
                                    color={copiedSaleId === sale.id ? 'green' : 'gray'}
                                    onClick={() => handleCopyRef(sale)}
                                    aria-label="Copy reference"
                                >
                                    {copiedSaleId === sale.id ? <CheckCircle size={18} /> : <Copy size={18} />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip content="Share receipt">
                                <IconButton
                                    variant="ghost"
                                    size="2"
                                    color="cyan"
                                    onClick={() => handleShare(sale)}
                                    disabled={isSharing}
                                    aria-label="Share receipt"
                                    className={isSharing ? 'animate-pulse' : ''}
                                >
                                    <Share2 size={18} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip content="Download receipt">
                                <IconButton
                                    variant="ghost"
                                    size="2"
                                    color="cyan"
                                    onClick={() => handleDownload(sale)}
                                    aria-label="Download receipt"
                                >
                                    <Download size={18} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip content="Print receipt">
                                <IconButton
                                    variant="ghost"
                                    size="2"
                                    color="cyan"
                                    onClick={handlePrint}
                                    disabled={isPrinting}
                                    aria-label="Print receipt"
                                    className={isPrinting ? 'animate-pulse' : ''}
                                >
                                    <Printer size={18} />
                                </IconButton>
                            </Tooltip>
                            {saleData.canReturn && !saleData.refundSummary.isFullyRefunded && (
                                <Tooltip content="Initiate return">
                                    <IconButton
                                        variant="ghost"
                                        size="2"
                                        color="cyan"
                                        onClick={() => setIsReturnModalOpen(true)}
                                        aria-label="Initiate return"
                                    >
                                        <RotateCcw size={18} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Flex>
                    }
                />

                <div className="flex-1 overflow-y-auto pb-6 px-4 py-4">
                    <div
                        ref={receiptRef}
                        className="bg-white dark:bg-gray-800 rounded-sm shadow-sm mx-auto max-w-md font-mono text-xs text-gray-800 dark:text-gray-200"
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

                        <ReceiptMraInfo
                            mraSaleStatus={sale.mraSaleStatus}
                            mraFiscalCode={sale.mraFiscalCode}
                            mraInvoiceNumber={sale.mraInvoiceNumber}
                            mraVerificationUrl={sale.mraVerificationUrl}
                            isMraEnabled={isMraEnabled}
                        />

                        <ReceiptFooter footerMessage={settings?.receiptFooter} />
                    </div>
                </div>
            </div>

            {sale && (
                <InitiateReturnModal
                    isOpen={isReturnModalOpen}
                    onClose={() => setIsReturnModalOpen(false)}
                    sale={sale}
                    onSuccess={handleReturnSuccess}
                />
            )}
        </AppLayout>
    );
};

export default SaleDetailsPage;
