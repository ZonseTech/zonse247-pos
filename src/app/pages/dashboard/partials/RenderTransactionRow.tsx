import dayjs from 'dayjs'
import { formatCurrency } from '../../../utils'
import type { Dispatch, FunctionComponent, ReactElement, SetStateAction } from 'react'
import { DEFAULT_SEED_KEY } from '../../../constants';

type Props = {
	trans: Transaction;
	setIsOpenDetails: Dispatch<SetStateAction<boolean>>
	setTransaction: Dispatch<SetStateAction<Transaction>>
}

const RenderTransactionRow: FunctionComponent<Props> = ({ trans, setIsOpenDetails, setTransaction }): ReactElement => {
	return (
		<tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
			<td className="px-6 py-4 whitespace-nowrap">
				<div
					className="text-sm font-medium text-green-600 dark:text-green-400 cursor-pointer hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-400/20 rounded-sm px-1 -mx-1"
					onClick={() => {
						setIsOpenDetails(prev => !prev)
						setTransaction(trans)
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							setIsOpenDetails(prev => !prev)
							setTransaction(trans)
						}
					}}
					tabIndex={0}
					role="button"
					aria-label={`View details for transaction ${trans.refNumber}`}
				>
					{trans.refNumber}
				</div>
			</td>
			<td className="px-6 py-4 whitespace-nowrap">
				<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-sm transition-colors duration-200
					${trans?.paymentMethod?.methodId === DEFAULT_SEED_KEY
						? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-1 dark:ring-blue-500/30'
						: 'bg-green-100 text-yellow-800 dark:bg-green-900/30 dark:text-green-300 dark:ring-1 dark:ring-green-500/30'
					}`}>
					{trans?.paymentMethod?.name}
				</span>
			</td>
			<td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium">
				{formatCurrency(trans.total)}
			</td>
			<td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
				{dayjs(trans.date).format("D-MM-YYYY")}
			</td>
		</tr>
	)
}

export default RenderTransactionRow