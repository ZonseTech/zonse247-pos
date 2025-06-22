import { formatCurrency, formatDate } from '../../../utils';
import { Modal } from '../../../components';
import {
	type Dispatch,
	type FunctionComponent,
	type SetStateAction,
	useMemo,
	useCallback
} from 'react';

interface Props {
	isOpenDetails: boolean;
	transaction: Transaction | null;
	setIsOpenDetails: Dispatch<SetStateAction<boolean>>;
}

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
			tillName: transaction.workstation?.tillName || 'Main Till',
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
			className="max-w-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl transition-all transform duration-300"
			aria-labelledby="transaction-details-title"
			aria-describedby="transaction-details-content"
		>
			<div
				id="transaction-details-content"
				className="py-3 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
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

const getStatusColor = (status: string): string => {
	const statusColors: Record<string, string> = {
		completed: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900',
		pending: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900',
		cancelled: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900',
		refunded: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
	};
	return statusColors[status?.toLowerCase()] || 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
};

const TransactionHeader: FunctionComponent<{
	refNumber: string;
	customerName: string;
	cashierName: string;
	date: string;
	phoneNumber: string | null;
	tillName: string;
	status: string;
	statusColor: string;
}> = ({ refNumber, customerName, cashierName, date, phoneNumber, tillName, status, statusColor }) => (
	<div className="border-b border-gray-200 dark:border-gray-600 pb-6 mb-6">
		<div className="flex justify-between items-start mb-4">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
				#{refNumber}
			</h3>
			<span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor}`}>
				{status}
			</span>
		</div>

		<div className="grid grid-cols-1 gap-3 text-sm">
			<DetailRow label="Customer" value={customerName} />
			<DetailRow label="Cashier" value={cashierName} />
			<DetailRow label="Date" value={date} />
			{phoneNumber && <DetailRow label="Phone" value={phoneNumber} />}
			<DetailRow label="Till" value={tillName} />
		</div>
	</div>
);

const TransactionItems: FunctionComponent<{
	items: CartItem[];
	hasItems: boolean;
}> = ({ items, hasItems }) => (
	<div className="mb-6">
		<h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
			Items ({items.length})
		</h4>

		{hasItems ? (
			<div className="space-y-3">
				<div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
					<div className="col-span-6">Item</div>
					<div className="col-span-2 text-center">Qty</div>
					<div className="col-span-2 text-right">Price</div>
					<div className="col-span-2 text-right">Total</div>
				</div>

				<div className="space-y-2">
					{items.map((item, index) => (
						<ItemRow key={`${item.productUuid}-${index}`} item={item} />
					))}
				</div>
			</div>
		) : (
			<div className="text-center py-8 text-gray-500 dark:text-gray-400">
				<p>No items in this transaction</p>
			</div>
		)}
	</div>
);

const ItemRow: FunctionComponent<{ item: CartItem }> = ({ item }) => {
	const itemTotal = item.quantity * item.sellPrice;

	return (
		<div className="grid grid-cols-12 gap-2 py-2 border-b border-gray-100 dark:border-gray-700 text-sm">
			<div className="col-span-6">
				<div className="font-medium text-gray-900 dark:text-gray-100 truncate">
					{item.name}
				</div>
				{item.barcode && (
					<div className="text-xs text-gray-500 dark:text-gray-400">
						#{item.barcode}
					</div>
				)}
			</div>
			<div className="col-span-2 text-center text-gray-700 dark:text-gray-300">
				{item.quantity}
			</div>
			<div className="col-span-2 text-right text-gray-700 dark:text-gray-300">
				{formatCurrency(item.sellPrice)}
			</div>
			<div className="col-span-2 text-right font-medium text-gray-900 dark:text-gray-100">
				{formatCurrency(itemTotal)}
			</div>
		</div>
	);
};

const TransactionSummary: FunctionComponent<{
	subtotal: number;
	tax: number;
	discount: number;
	total: number;
	paid: number;
	changeAmount: number;
	paymentMethod: string;
	hasTax: boolean;
	hasDiscount: boolean;
}> = ({ subtotal, tax, discount, total, paid, changeAmount, paymentMethod, hasTax, hasDiscount }) => (
	<div className="border-t border-gray-200 dark:border-gray-600 pt-6">
		<h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
			Payment Summary
		</h4>

		<div className="space-y-3 text-sm">
			<SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />

			{hasTax && (
				<SummaryRow label="Tax" value={formatCurrency(tax)} />
			)}

			{hasDiscount && (
				<SummaryRow
					label="Discount"
					value={`-${formatCurrency(discount)}`}
					valueClassName="text-green-600 dark:text-green-400"
				/>
			)}

			<div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
				<SummaryRow
					label="Total"
					value={formatCurrency(total)}
					labelClassName="font-semibold text-base"
					valueClassName="font-semibold text-base"
				/>
			</div>

			<SummaryRow label="Amount Paid" value={formatCurrency(paid)} />

			{changeAmount > 0 && (
				<SummaryRow
					label="Change"
					value={formatCurrency(changeAmount)}
					valueClassName="text-blue-600 dark:text-blue-400"
				/>
			)}

			<SummaryRow label="Payment Method" value={paymentMethod} />
		</div>
	</div>
);

const DetailRow: FunctionComponent<{
	label: string;
	value: string;
}> = ({ label, value }) => (
	<div className="flex justify-between">
		<span className="text-gray-600 dark:text-gray-400 font-medium min-w-0 flex-shrink-0 w-24">
			{label}:
		</span>
		<span className="text-gray-900 dark:text-gray-100 font-medium truncate ml-2">
			{value}
		</span>
	</div>
);

const SummaryRow: FunctionComponent<{
	label: string;
	value: string;
	labelClassName?: string;
	valueClassName?: string;
}> = ({ label, value, labelClassName = '', valueClassName = '' }) => (
	<div className="flex justify-between items-center">
		<span className={`text-gray-600 dark:text-gray-400 ${labelClassName}`}>
			{label}
		</span>
		<span className={`text-gray-900 dark:text-gray-100 ${valueClassName}`}>
			{value}
		</span>
	</div>
);

export default TransactionDetailsModal;