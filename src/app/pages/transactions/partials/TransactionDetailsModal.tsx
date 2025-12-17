import { formatCurrency, formatDate } from '../../../utils';
import { Modal } from '../../../components';
import {
	type Dispatch,
	type FunctionComponent,
	type SetStateAction,
	useMemo,
	useCallback
} from 'react';
import TransactionHeader from './TransactionHeader';
import TransactionSummary from './TransactionSummary';
import TransactionItems from './TransactionItems';

interface Props {
	isOpenDetails: boolean;
	transaction: Transaction | null;
	setIsOpenDetails: Dispatch<SetStateAction<boolean>>;
}

const getStatusColor = (status: string): string => {
	const statusColors: Record<string, string> = {
		completed: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800/50',
		pending: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-800/50',
		cancelled: 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/50 dark:border-red-800/50',
		refunded: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800/50'
	};
	return statusColors[status?.toLowerCase()] || 'text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-950/50 dark:border-slate-800/50';
};


const TransactionDetailsModal: FunctionComponent<Props> = ({
	transaction,
	isOpenDetails,
	setIsOpenDetails
}) => {
	const handleClose = useCallback(() => {
		setIsOpenDetails(false);
	}, [setIsOpenDetails]);

	const transactionData = useMemo(() => {
		if (!transaction) return null;

		return {
			refNumber: transaction.refNumber || 'N/A',
			customerName: transaction.customer?.name || 'Walk-in Customer',
			cashierName: transaction.user?.fullname || transaction.user?.username || 'Administrator',
			formattedDate: formatDate(transaction.date),
			phoneNumber: transaction.phoneNumber?.trim() || null,
			tillName: transaction.terminal?.tillName || 'Main Till',
			paymentMethodName: transaction.paymentMethod?.name || 'Cash',
			hasItems: Array.isArray(transaction.items) && transaction.items.length > 0,
			hasTax: transaction.tax > 0,
			hasDiscount: transaction.discount > 0,
			statusColor: getStatusColor(transaction.status)
		};
	}, [transaction]);

	if (!transaction || !transactionData) {
		return null;
	}

	return (
		<Modal
			isOpen={isOpenDetails}
			title="Transaction Details"
			onClose={handleClose}
			className="max-w-5xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm transition-all transform duration-300"
			aria-labelledby="transaction-details-title"
			aria-describedby="transaction-details-content"
		>
			<div
				id="transaction-details-content"
				className="py-6 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
			>
				<TransactionHeader
					refNumber={transactionData.refNumber}
					customerName={transactionData.customerName}
					cashierName={transactionData.cashierName}
					date={transactionData.formattedDate}
					phoneNumber={transactionData.phoneNumber}
					tillName={transactionData.tillName}
					status={transaction.status}
					statusColor={transactionData.statusColor}
				/>

				<TransactionItems
					items={transaction.items}
					hasItems={transactionData.hasItems}
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
				/>
			</div>
		</Modal>
	);
};

export default TransactionDetailsModal;