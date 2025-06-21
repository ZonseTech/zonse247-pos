import { formatCurrency, formatDate } from '../../../utils';
import { Modal } from '../../../components'
import { type Dispatch, Fragment, type FunctionComponent, type SetStateAction } from 'react'

type Props = {
	isOpenDetails: boolean;
	transaction: Transaction;
	setIsOpenDetails: Dispatch<SetStateAction<boolean>>;
}

const TransactionDetailsModal: FunctionComponent<Props> = ({ transaction, isOpenDetails, setIsOpenDetails }) => {
	return (
		<Fragment>
			<Modal
				isOpen={isOpenDetails}
				title="Transaction Details"
				onClose={() => setIsOpenDetails(false)}
				className='max-w-sm bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
			>
				<div className="p-0 max-h-[70vh] overflow-y-auto pr-2">
					<div className="border-b pb-4 mb-4">
						<p className="text-gray-600"><span className="inline-block w-28">Ref No</span>: {transaction.refNumber}</p>
						<p className="text-gray-600"><span className="inline-block w-28">Customer</span>: {transaction?.customer?.name as string || 'Walk in Customer'}</p>
						<p className="text-gray-600"><span className="inline-block w-28">Cashier</span>: Administrator</p>
						<p className="text-gray-600"><span className="inline-block w-28">Date</span>: {formatDate(transaction.date)}</p>
						{transaction.phoneNumber && (
							<p className="text-gray-600"><span className="inline-block w-28">Phone</span>: {transaction.phoneNumber}</p>
						)}
						<p className="text-gray-600"><span className="inline-block w-28">Till</span>: {transaction.till}</p>
					</div>

					<div className="mb-4">
						<div className="flex justify-between font-medium text-gray-600 mb-2">
							<div className="w-1/3">Item</div>
							<div className="w-1/3 text-center">Qty</div>
							<div className="w-1/3 text-right">Price</div>
						</div>

						{Array.isArray(transaction.items) && (
							transaction.items.map((item, index) => (
								<div key={index} className="flex justify-between text-gray-600 mb-2">
									<div className="w-1/3">{item.name}</div>
									<div className="w-1/3 text-center">{item.quantity}</div>
									<div className="w-1/3 text-right">{formatCurrency(item.sellPrice)}</div>
								</div>
							))
						)}
					</div>

					<div className="border-t pt-4">
						<div className="flex justify-between text-gray-600">
							<div>Subtotal</div>
							<div>{formatCurrency(transaction.subtotal)}</div>
						</div>
						{transaction.tax > 0 && (
							<div className="flex justify-between text-gray-600">
								<div>Tax</div>
								<div>{formatCurrency(transaction.tax)}</div>
							</div>
						)}
						<div className="flex justify-between text-gray-600">
							<div>Discount</div>
							<div>{formatCurrency(transaction.discount)}</div>
						</div>
						<div className="flex justify-between text-gray-600 font-medium">
							<div>Total</div>
							<div>{formatCurrency(transaction.total)}</div>
						</div>
						<div className="flex justify-between text-gray-600">
							<div>Paid</div>
							<div>{formatCurrency(transaction.paid)}</div>
						</div>
						<div className="flex justify-between text-gray-600">
							<div>Change</div>
							<div>{formatCurrency(transaction.changeAmount)}</div>
						</div>
						<div className="flex justify-between text-gray-600">
							<div>Method</div>
							<div>{transaction.paymentMethod?.name || 'Card'}</div>
						</div>
					</div>
				</div>
			</Modal>
		</Fragment>
	)
}

export default TransactionDetailsModal