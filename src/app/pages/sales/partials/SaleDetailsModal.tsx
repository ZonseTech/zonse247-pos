import { formatCurrency, formatDate } from '../../../utils';
import { getPaymentMethodName } from '../../../utils/sale.helper';
import { Modal } from '../../../components';
import {
	type Dispatch,
	type FunctionComponent,
	type SetStateAction,
	useMemo,
	useCallback,
	useState,
	useRef
} from 'react';
import SaleHeader from './SaleHeader';
import SaleSummary from './SaleSummary';
import SaleItems from './SaleItems';
import InitiateReturnModal from '../../returns/partials/InitiateReturnModal';
import returnsService from '../../../services/returns.service';
import { useReceiptActions } from '../../../hooks/useReceiptActions';
import { useBranch } from '../../../context/BranchContext';
import { Flex, IconButton, Tooltip } from '@radix-ui/themes';
import { RotateCcw, Printer, X, Copy, CheckCircle, Share2, Download, Clock, XCircle, AlertCircle, Shield, ShieldCheck, ShieldX, ShieldAlert, ShieldOff } from 'lucide-react';
import { useIsEBN } from '../../../hooks/useMediaQuery';

interface Props {
	isOpenDetails: boolean;
	sale: Sale | Transaction | null;
	setIsOpenDetails: Dispatch<SetStateAction<boolean>>;
	isMraEnabled?: boolean;
	canInitiateReturn?: boolean;
	canExportReceipt?: boolean;
}

const mraStatusConfig: Record<Exclude<MraSaleStatus, 'NOT_APPLICABLE'>, { icon: typeof Shield; color: string; label: string }> = {
	PENDING: { icon: Clock, color: 'text-amber-500 dark:text-amber-400', label: 'Pending Verification' },
	SUBMITTED: { icon: Shield, color: 'text-blue-500 dark:text-blue-400', label: 'Submitted to MRA' },
	VERIFIED: { icon: ShieldCheck, color: 'text-green-500 dark:text-green-400', label: 'MRA Verified' },
	FAILED: { icon: ShieldAlert, color: 'text-red-500 dark:text-red-400', label: 'Submission Failed' },
	REJECTED: { icon: ShieldX, color: 'text-orange-500 dark:text-orange-400', label: 'Rejected by MRA' },
	CANCELLED: { icon: ShieldOff, color: 'text-gray-500 dark:text-gray-400', label: 'Cancelled' },
};

const statusStyles: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
	completed: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', label: 'Completed' },
	pending: { icon: Clock, color: 'text-amber-600 dark:text-amber-400', label: 'Pending' },
	cancelled: { icon: XCircle, color: 'text-red-600 dark:text-red-400', label: 'Cancelled' },
	refunded: { icon: RotateCcw, color: 'text-sky-600 dark:text-sky-400', label: 'Refunded' },
	returned: { icon: RotateCcw, color: 'text-sky-600 dark:text-sky-400', label: 'Returned' },
	failed: { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', label: 'Failed' },
	void: { icon: XCircle, color: 'text-gray-600 dark:text-gray-400', label: 'Void' },
	voided: { icon: XCircle, color: 'text-gray-600 dark:text-gray-400', label: 'Voided' },
};

const getStatusStyle = (status: string) =>
	statusStyles[status?.toLowerCase()] || { icon: AlertCircle, color: 'text-gray-500', label: status || 'Unknown' };

const TransactionDetailsModal: FunctionComponent<Props> = ({
	sale,
	isOpenDetails,
	setIsOpenDetails,
	isMraEnabled = false,
	canInitiateReturn = true,
	canExportReceipt = true,
}) => {
	const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
	const printRef = useRef<HTMLDivElement>(null);
	const isEBN = useIsEBN();
	const { currentBranch } = useBranch();

	const { isSharing, copiedSaleId, handleCopyRef, handleShare, handleDownload } = useReceiptActions({
		receiptRef: printRef,
		storeName: currentBranch?.branchName,
	});

	const getSaleRef = (s: Sale | Transaction | null): string => {
		if (!s) return 'N/A';
		return (s as Sale).saleNumber || (s as Transaction).refNumber || (s as Transaction).transactionId || s.id || 'N/A';
	};

	const getSaleDate = (s: Sale | Transaction | null): Date | string | undefined => {
		if (!s) return undefined;
		return (s as Sale).saleDate || (s as Transaction).date || s.createdAt;
	};

	const getSaleTotal = (s: Sale | Transaction | null): number => {
		if (!s) return 0;
		return (s as Sale).totalAmount || (s as Transaction).total || 0;
	};

	const getAmountPaid = (s: Sale | Transaction | null): number => {
		if (!s) return 0;
		return (s as Sale).amountPaid || (s as Transaction).paid || 0;
	};

	const getSubtotal = (s: Sale | Transaction | null): number => {
		if (!s) return 0;
		return s.subtotal || 0;
	};

	const getTaxAmount = (s: Sale | Transaction | null): number => {
		if (!s) return 0;
		return (s as Sale).taxAmount || (s as Transaction).tax || 0;
	};

	const getDiscountAmount = (s: Sale | Transaction | null): number => {
		if (!s) return 0;
		return (s as Sale).discountAmount || (s as Transaction).discount || 0;
	};

	const handleClose = useCallback(() => {
		setIsOpenDetails(false);
	}, [setIsOpenDetails]);

	const handleInitiateReturn = () => {
		setIsReturnModalOpen(true);
	};

	const handlePrint = useCallback(() => {
		if (!printRef.current) return;
		const printContent = printRef.current.innerHTML;
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;

		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>Receipt - ${getSaleRef(sale)}</title>
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
	}, [sale]);

	const saleData = useMemo(() => {
		if (!sale) return null;

		const statusInfo = getStatusStyle(sale.status || 'pending');
		const paymentMethodName = getPaymentMethodName(sale);

		const mraSaleStatus = (sale as Sale).mraSaleStatus;
		const mraStatusInfo = mraSaleStatus && mraSaleStatus !== 'NOT_APPLICABLE'
			? mraStatusConfig[mraSaleStatus]
			: null;

		return {
			refNumber: getSaleRef(sale),
			customerName: sale.customer?.name || 'Walk-in Customer',
			cashierName: sale.user?.fullname || sale.user?.username || 'Administrator',
			formattedDate: formatDate(getSaleDate(sale) as string),
			phoneNumber: (sale as unknown as Transaction).phoneNumber?.trim() || null,
			tillName: sale.terminal?.terminalLabel || sale.terminalId || 'Main Terminal',
			paymentMethodName,
			hasItems: Array.isArray(sale.items) && sale.items.length > 0,
			hasTax: getTaxAmount(sale) > 0,
			hasDiscount: getDiscountAmount(sale) > 0,
			statusInfo,
			canReturn: returnsService.canReturn(sale as unknown as Transaction),
			refundSummary: returnsService.getRefundSummary(sale as unknown as Transaction),
			mraSaleStatus,
			mraStatusInfo,
			mraFiscalCode: (sale as Sale).mraFiscalCode,
			mraInvoiceNumber: (sale as Sale).mraInvoiceNumber,
			mraVerificationUrl: (sale as Sale).mraVerificationUrl,
		};
	}, [sale]);

	if (!sale || !saleData) return null;

	const StatusIcon = saleData.statusInfo.icon;
	const c = isEBN;
	const isCopied = copiedSaleId === (sale.id || '');

	const modalHeader = (
		<div className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${c ? "py-2" : "py-2.5"}`}>
			<span className={`font-semibold text-gray-800 dark:text-gray-200 ${c ? "text-xs" : "text-sm"}`}>
				Sale Receipt
			</span>
			<div className="flex items-center gap-2">
				{canInitiateReturn && saleData.canReturn && !saleData.refundSummary.isFullyRefunded && (
					<Tooltip content="Initiate return">
						<IconButton variant="ghost" size="1" color="cyan" onClick={handleInitiateReturn} aria-label="Initiate return">
							<RotateCcw size={16} />
						</IconButton>
					</Tooltip>
				)}
				<Tooltip content={isCopied ? 'Copied!' : 'Copy reference'}>
					<IconButton variant="ghost" size="1" color={isCopied ? 'green' : 'gray'} onClick={() => handleCopyRef(sale as Sale)} aria-label="Copy reference">
						{isCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
					</IconButton>
				</Tooltip>
				{canExportReceipt && (
					<>
						<Tooltip content="Share receipt">
							<IconButton variant="ghost" size="1" color="cyan" onClick={() => handleShare(sale as Sale)} disabled={isSharing} aria-label="Share receipt" className={isSharing ? 'animate-pulse' : ''}>
								<Share2 size={16} />
							</IconButton>
						</Tooltip>
						<Tooltip content="Download receipt">
							<IconButton variant="ghost" size="1" color="cyan" onClick={() => handleDownload(sale as Sale)} aria-label="Download receipt">
								<Download size={16} />
							</IconButton>
						</Tooltip>
					</>
				)}
				<Tooltip content="Print receipt">
					<IconButton variant="ghost" size="1" color="cyan" onClick={handlePrint} aria-label="Print receipt">
						<Printer size={16} />
					</IconButton>
				</Tooltip>
				<div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
				<Tooltip content="Close">
					<IconButton variant="ghost" size="1" color="gray" onClick={handleClose} aria-label="Close">
						<X size={16} />
					</IconButton>
				</Tooltip>
			</div>
		</div>
	);

	return (
		<>
			<Modal
				isOpen={isOpenDetails}
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
								Sale Receipt
							</p>
							<div className={`flex items-center justify-center gap-2 ${c ? "mt-1" : "mt-1.5"}`}>
								<span className={`font-mono text-gray-500 dark:text-gray-400 ${c ? "text-[10px]" : "text-xs"}`}>
									#{saleData.refNumber}
								</span>

								<span className="text-gray-300 dark:text-gray-600">|</span>
								<span className={`inline-flex items-center gap-1 ${saleData.statusInfo.color} ${c ? "text-[10px]" : "text-xs"}`}>
									<StatusIcon className="w-3 h-3" />
									{saleData.statusInfo.label}
								</span>
							</div>
						</div>

						{/* Dashed divider */}
						<div className="border-t border-dashed border-gray-300 dark:border-gray-600" />

						{/* Transaction info */}
						<div className={c ? "py-2" : "py-3"}>
							<SaleHeader
								refNumber={saleData.refNumber}
								customerName={saleData.customerName}
								cashierName={saleData.cashierName}
								date={saleData.formattedDate}
								phoneNumber={saleData.phoneNumber}
								tillName={saleData.tillName}
								status={sale.status || 'pending'}
								statusColor=""
								compact={c}
							/>
						</div>

						{/* Refund notice */}
						{saleData.refundSummary.hasRefunds && (
							<>
								<div className="border-t border-dashed border-gray-300 dark:border-gray-600" />
								<div className={c ? "py-2" : "py-3"}>
									<div className="flex justify-between items-baseline">
										<span className={`text-sky-700 dark:text-sky-300 font-medium ${c ? "text-[10px]" : "text-xs"}`}>
											Refunded ({saleData.refundSummary.refundCount})
										</span>
										<span className={`font-bold text-sky-700 dark:text-sky-300 tabular-nums ${c ? "text-xs" : "text-sm"}`}>
											{formatCurrency(saleData.refundSummary.totalRefunded)}
										</span>
									</div>
									{!saleData.refundSummary.isFullyRefunded && (
										<div className="flex justify-between items-baseline mt-0.5">
											<span className={`text-gray-500 dark:text-gray-400 ${c ? "text-[10px]" : "text-xs"}`}>
												Remaining
											</span>
											<span className={`tabular-nums text-gray-700 dark:text-gray-300 ${c ? "text-[10px]" : "text-xs"}`}>
												{formatCurrency(saleData.refundSummary.remainingAmount)}
											</span>
										</div>
									)}
									{saleData.refundSummary.isFullyRefunded && (
										<div className={`flex items-center justify-center gap-1 mt-1 ${c ? "text-[10px]" : "text-xs"} text-sky-600 dark:text-sky-400`}>
											<CheckCircle className="w-3 h-3" />
											<span className="font-medium">Fully Refunded</span>
										</div>
									)}
								</div>
							</>
						)}

						{/* Line items */}
						<SaleItems
							items={sale.items || []}
							hasItems={saleData.hasItems}
							compact={c}
						/>

						{/* Totals & payment */}
						<SaleSummary
							subtotal={getSubtotal(sale)}
							tax={getTaxAmount(sale)}
							discount={getDiscountAmount(sale)}
							total={getSaleTotal(sale)}
							paid={getAmountPaid(sale)}
							changeAmount={sale.changeAmount || 0}
							paymentMethod={saleData.paymentMethodName}
							hasTax={saleData.hasTax}
							hasDiscount={saleData.hasDiscount}
							compact={c}
							payments={sale.payments}
						/>

						{/* MRA Fiscal Info */}
						{isMraEnabled && saleData.mraStatusInfo && (
							<>
								<div className={`border-t border-dashed border-gray-300 dark:border-gray-600 ${c ? "my-2" : "my-3"}`} />
								<div className={c ? "space-y-1" : "space-y-1.5"}>
									<div className="flex justify-between items-center">
										<div className="flex items-center gap-1.5">
											<saleData.mraStatusInfo.icon className={`w-3.5 h-3.5 ${saleData.mraStatusInfo.color}`} />
											<span className={`font-medium text-gray-700 dark:text-gray-300 ${c ? "text-[10px]" : "text-xs"}`}>
												MRA Fiscal Invoice
											</span>
										</div>
										<span className={`${saleData.mraStatusInfo.color} ${c ? "text-[10px]" : "text-xs"}`}>
											{saleData.mraStatusInfo.label}
										</span>
									</div>
									{saleData.mraFiscalCode && (
										<div className="flex justify-between items-baseline">
											<span className={`text-gray-500 dark:text-gray-400 ${c ? "text-[10px]" : "text-xs"}`}>Fiscal Code</span>
											<span className={`font-mono font-medium text-gray-900 dark:text-gray-100 ${c ? "text-[10px]" : "text-xs"}`}>
												{saleData.mraFiscalCode}
											</span>
										</div>
									)}
									{saleData.mraInvoiceNumber && (
										<div className="flex justify-between items-baseline">
											<span className={`text-gray-500 dark:text-gray-400 ${c ? "text-[10px]" : "text-xs"}`}>MRA Invoice #</span>
											<span className={`font-mono font-medium text-gray-800 dark:text-gray-200 ${c ? "text-[10px]" : "text-xs"}`}>
												{saleData.mraInvoiceNumber}
											</span>
										</div>
									)}
									{saleData.mraSaleStatus === 'VERIFIED' && saleData.mraVerificationUrl && (
										<a
											href={saleData.mraVerificationUrl}
											target="_blank"
											rel="noopener noreferrer"
											className={`inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline ${c ? "text-[10px]" : "text-xs"}`}
										>
											<ShieldCheck className="w-3 h-3" />
											Verify on MRA Portal
										</a>
									)}
								</div>
							</>
						)}

						{/* Receipt footer */}
						<div className={`border-t border-dashed border-gray-300 dark:border-gray-600 ${c ? "mt-3 pt-2" : "mt-4 pt-3"}`}>
							<p className={`text-center text-gray-400 dark:text-gray-500 ${c ? "text-[9px]" : "text-[10px]"}`}>
								Thank you for your purchase!
							</p>
						</div>

						{/* Print-only footer */}
						<div className="hidden print:block text-center mt-4 pt-2 border-t border-dashed border-gray-400 text-xs text-gray-500">
							<p>Printed: {new Date().toLocaleString()}</p>
						</div>
					</div>
				</div>
			</Modal>

			{canInitiateReturn && sale && (
				<InitiateReturnModal
					isOpen={isReturnModalOpen}
					onClose={() => setIsReturnModalOpen(false)}
					sale={sale as Sale}
					onSuccess={() => setIsReturnModalOpen(false)}
				/>
			)}
		</>
	);
};

export default TransactionDetailsModal;