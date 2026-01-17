import { formatCurrency, formatDate } from '../../../utils';
import { Modal, Button } from '../../../components';
import {
	type Dispatch,
	type FunctionComponent,
	type SetStateAction,
	useMemo,
	useCallback,
	useState,
	useRef
} from 'react';
import TransactionHeader from './TransactionHeader';
import TransactionSummary from './TransactionSummary';
import TransactionItems from './TransactionItems';
import InitiateReturnModal from '../../returns/partials/InitiateReturnModal';
import returnsService from '../../../services/returns.service';
import { RotateCcw, Printer, X, Download, Copy, CheckCircle, Clock, XCircle, AlertCircle, Receipt } from 'lucide-react';
import { useIsEBN } from '../../../hooks/useMediaQuery';

interface Props {
	isOpenDetails: boolean;
	transaction: Transaction | null;
	setIsOpenDetails: Dispatch<SetStateAction<boolean>>;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bgColor: string; label: string }> = {
	completed: {
		icon: CheckCircle,
		color: 'text-emerald-600 dark:text-emerald-400',
		bgColor: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/50',
		label: 'Completed'
	},
	pending: {
		icon: Clock,
		color: 'text-amber-600 dark:text-amber-400',
		bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/50',
		label: 'Pending'
	},
	cancelled: {
		icon: XCircle,
		color: 'text-red-600 dark:text-red-400',
		bgColor: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/50',
		label: 'Cancelled'
	},
	refunded: {
		icon: RotateCcw,
		color: 'text-blue-600 dark:text-blue-400',
		bgColor: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/50',
		label: 'Refunded'
	},
	failed: {
		icon: AlertCircle,
		color: 'text-red-600 dark:text-red-400',
		bgColor: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/50',
		label: 'Failed'
	},
	void: {
		icon: XCircle,
		color: 'text-gray-600 dark:text-gray-400',
		bgColor: 'bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800/50',
		label: 'Void'
	}
};

const getStatusConfig = (status: string) => {
	return statusConfig[status?.toLowerCase()] || {
		icon: AlertCircle,
		color: 'text-slate-600 dark:text-slate-400',
		bgColor: 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/50',
		label: status || 'Unknown'
	};
};

const TransactionDetailsModal: FunctionComponent<Props> = ({
	transaction,
	isOpenDetails,
	setIsOpenDetails
}) => {
	const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const printRef = useRef<HTMLDivElement>(null);
	const isEBN = useIsEBN();

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
				<title>Transaction Receipt - ${transaction?.refNumber || 'N/A'}</title>
				<style>
					* { margin: 0; padding: 0; box-sizing: border-box; }
					body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px; color: #1f2937; }
					.print-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px dashed #e5e7eb; }
					.print-header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
					.print-header p { color: #6b7280; font-size: 14px; }
					.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
					.info-item { padding: 8px 12px; background: #f9fafb; border-radius: 6px; }
					.info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
					.info-value { font-size: 14px; font-weight: 600; }
					.items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
					.items-table th { text-align: left; padding: 10px 8px; background: #f3f4f6; font-size: 12px; text-transform: uppercase; color: #6b7280; }
					.items-table td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
					.items-table .text-right { text-align: right; }
					.items-table .text-center { text-align: center; }
					.summary-section { background: #f9fafb; padding: 16px; border-radius: 8px; }
					.summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
					.summary-row.total { font-size: 18px; font-weight: 700; padding-top: 12px; margin-top: 8px; border-top: 2px solid #e5e7eb; }
					.status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
					.footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 2px dashed #e5e7eb; color: #9ca3af; font-size: 12px; }
					@media print {
						body { padding: 0; }
						.no-print { display: none !important; }
					}
				</style>
			</head>
			<body>
				${printContent}
			</body>
			</html>
		`);
		printWindow.document.close();
		printWindow.focus();
		setTimeout(() => {
			printWindow.print();
			printWindow.close();
		}, 250);
	}, [transaction?.refNumber]);

	const handleCopyRef = useCallback(async () => {
		if (!transaction?.refNumber) return;
		try {
			await navigator.clipboard.writeText(transaction.refNumber);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}, [transaction?.refNumber]);

	const transactionData = useMemo(() => {
		if (!transaction) return null;

		const statusInfo = getStatusConfig(transaction.status || 'pending');

		return {
			refNumber: transaction.refNumber || 'N/A',
			customerName: transaction.customer?.name || 'Walk-in Customer',
			cashierName: transaction.user?.fullname || transaction.user?.username || 'Administrator',
			formattedDate: formatDate(transaction.date),
			phoneNumber: transaction.phoneNumber?.trim() || null,
			tillName: transaction?.user?.fullname || 'Main Till',
			paymentMethodName: transaction.paymentMethod?.name || 'Cash',
			hasItems: Array.isArray(transaction.items) && transaction.items.length > 0,
			hasTax: transaction.tax > 0,
			hasDiscount: transaction.discount > 0,
			statusInfo,
			canReturn: returnsService.canReturn(transaction),
			refundSummary: returnsService.getRefundSummary(transaction),
			itemCount: transaction.items?.length || 0
		};
	}, [transaction]);

	if (!transaction || !transactionData) {
		return null;
	}

	const StatusIcon = transactionData.statusInfo.icon;

	// Custom header with action buttons
	const modalHeader = (
		<div className={isEBN
			? "flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
			: "flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
		}>
			<div className={isEBN ? "flex items-center gap-2" : "flex items-center gap-4"}>
				<div className={isEBN ? "p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg" : "p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl"}>
					<Receipt className={isEBN ? "w-4 h-4 text-blue-600 dark:text-blue-400" : "w-6 h-6 text-blue-600 dark:text-blue-400"} />
				</div>
				<div>
					<div className="flex items-center gap-2">
						<h2 className={isEBN
							? "text-sm font-bold text-gray-900 dark:text-gray-100"
							: "text-xl font-bold text-gray-900 dark:text-gray-100"
						}>
							Transaction Details
						</h2>
						<div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${transactionData.statusInfo.bgColor}`}>
							<StatusIcon className={isEBN ? `w-2.5 h-2.5 ${transactionData.statusInfo.color}` : `w-3.5 h-3.5 ${transactionData.statusInfo.color}`} />
							<span className={isEBN
								? `text-[9px] font-semibold ${transactionData.statusInfo.color}`
								: `text-xs font-semibold ${transactionData.statusInfo.color}`
							}>
								{transactionData.statusInfo.label}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2 mt-0.5">
						<span className={isEBN
							? "text-[10px] text-gray-500 dark:text-gray-400 font-mono"
							: "text-sm text-gray-500 dark:text-gray-400 font-mono"
						}>
							#{transactionData.refNumber}
						</span>
						<button
							onClick={handleCopyRef}
							className={isEBN
								? "p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
								: "p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
							}
							title="Copy reference number"
						>
							{copied ? (
								<CheckCircle className={isEBN ? "w-2.5 h-2.5 text-green-500" : "w-3.5 h-3.5 text-green-500"} />
							) : (
								<Copy className={isEBN
									? "w-2.5 h-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
									: "w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
								} />
							)}
						</button>
					</div>
				</div>
			</div>

			<div className={isEBN ? "flex items-center gap-1" : "flex items-center gap-2"}>
				{transactionData.canReturn && !transactionData.refundSummary.isFullyRefunded && (
					<Button
						onClick={handleInitiateReturn}
						layout="outline"
						size={isEBN ? "smallest" : "small"}
						className="flex items-center gap-1"
						aria-label="Initiate return"
					>
						<RotateCcw className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
						<span className={isEBN ? "hidden" : "hidden sm:inline"}>Return</span>
					</Button>
				)}
				<Button
					onClick={handlePrint}
					layout="outline"
					size={isEBN ? "smallest" : "small"}
					className="flex items-center gap-1"
					aria-label="Print receipt"
				>
					<Printer className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
					<span className={isEBN ? "hidden" : "hidden sm:inline"}>Print</span>
				</Button>
				<button
					onClick={handleClose}
					className={isEBN
						? "p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
						: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
					}
					aria-label="Close modal"
				>
					<X className={isEBN ? "w-4 h-4 text-gray-500 dark:text-gray-400" : "w-5 h-5 text-gray-500 dark:text-gray-400"} />
				</button>
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
				className={isEBN ? "max-w-3xl" : "max-w-4xl"}
				aria-labelledby="transaction-details-title"
				aria-describedby="transaction-details-content"
			>
				<div
					id="transaction-details-content"
					className={isEBN ? "max-h-[65vh] overflow-y-auto pr-1" : "max-h-[75vh] overflow-y-auto pr-2"}
				>
					<div ref={printRef} className={isEBN ? "space-y-3" : "space-y-6"}>
						<div className="hidden print:block print-header">
							<h1>Transaction Receipt</h1>
							<p>Reference: #{transactionData.refNumber}</p>
						</div>

						<TransactionHeader
							refNumber={transactionData.refNumber}
							customerName={transactionData.customerName}
							cashierName={transactionData.cashierName}
							date={transactionData.formattedDate}
							phoneNumber={transactionData.phoneNumber}
							tillName={transactionData.tillName}
							status={transaction.status || 'pending'}
							statusColor={transactionData.statusInfo.bgColor}
							compact={isEBN}
						/>

						{transactionData.refundSummary.hasRefunds && (
							<div className={isEBN
								? "p-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
								: "p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
							}>
								<div className="flex items-start justify-between gap-2">
									<div className="flex items-start gap-2">
										<div className={isEBN ? "p-1 bg-blue-100 dark:bg-blue-800/50 rounded mt-0.5" : "p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg mt-0.5"}>
											<RotateCcw className={isEBN ? "w-3 h-3 text-blue-600 dark:text-blue-400" : "w-5 h-5 text-blue-600 dark:text-blue-400"} />
										</div>
										<div>
											<h4 className={isEBN
												? "text-xs font-semibold text-blue-900 dark:text-blue-100"
												: "font-semibold text-blue-900 dark:text-blue-100"
											}>
												Refund Information
											</h4>
											<p className={isEBN
												? "text-[10px] text-blue-700 dark:text-blue-300 mt-0.5"
												: "text-sm text-blue-700 dark:text-blue-300 mt-0.5"
											}>
												{transactionData.refundSummary.refundCount} refund{transactionData.refundSummary.refundCount !== 1 ? 's' : ''} processed
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className={isEBN
											? "text-[8px] text-blue-600 dark:text-blue-400 uppercase font-medium tracking-wider"
											: "text-xs text-blue-600 dark:text-blue-400 uppercase font-medium tracking-wider"
										}>
											Total Refunded
										</p>
										<p className={isEBN
											? "text-sm font-bold text-blue-900 dark:text-blue-100"
											: "text-2xl font-bold text-blue-900 dark:text-blue-100"
										}>
											{formatCurrency(transactionData.refundSummary.totalRefunded)}
										</p>
										{!transactionData.refundSummary.isFullyRefunded && (
											<p className={isEBN
												? "text-[10px] text-blue-600 dark:text-blue-400 mt-0.5"
												: "text-sm text-blue-600 dark:text-blue-400 mt-1"
											}>
												Remaining: {formatCurrency(transactionData.refundSummary.remainingAmount)}
											</p>
										)}
									</div>
								</div>
								{transactionData.refundSummary.isFullyRefunded && (
									<div className={isEBN
										? "mt-2 pt-2 border-t border-blue-200 dark:border-blue-700 flex items-center justify-center gap-1"
										: "mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 flex items-center justify-center gap-2"
									}>
										<CheckCircle className={isEBN ? "w-3 h-3 text-blue-600 dark:text-blue-400" : "w-4 h-4 text-blue-600 dark:text-blue-400"} />
										<span className={isEBN
											? "text-[10px] font-medium text-blue-800 dark:text-blue-200"
											: "text-sm font-medium text-blue-800 dark:text-blue-200"
										}>
											Fully Refunded
										</span>
									</div>
								)}
							</div>
						)}

						<TransactionItems
							items={transaction.items || []}
							hasItems={transactionData.hasItems}
							compact={isEBN}
						/>

						<TransactionSummary
							subtotal={transaction.subtotal}
							tax={transaction.tax}
							discount={transaction.discount}
							total={transaction.total}
							paid={transaction.paid}
							changeAmount={transaction.changeAmount}
							paymentMethod={transactionData.paymentMethodName}
							hasTax={transactionData.hasTax}
							hasDiscount={transactionData.hasDiscount}
							compact={isEBN}
						/>

						<div className="hidden print:block footer">
							<p>Thank you for your business!</p>
							<p>Printed on: {new Date().toLocaleString()}</p>
						</div>
					</div>
				</div>
			</Modal>

			{transaction && (
				<InitiateReturnModal
					isOpen={isReturnModalOpen}
					onClose={() => setIsReturnModalOpen(false)}
					transaction={transaction}
					onSuccess={() => {
						setIsReturnModalOpen(false);
					}}
				/>
			)}
		</>
	);
};

export default TransactionDetailsModal;