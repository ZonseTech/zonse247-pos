import dayjs from 'dayjs'
import { formatCurrency } from '../../../utils'
import type { Dispatch, FunctionComponent, ReactElement, SetStateAction } from 'react'

type Props = {
	trans: Transaction;
	setIsOpenDetails: Dispatch<SetStateAction<boolean>>
	setTransaction: Dispatch<SetStateAction<Transaction>>
}

const RenderTransactionRow: FunctionComponent<Props> = ({ trans, setIsOpenDetails, setTransaction }): ReactElement => {
	return <tr key={trans.uuid}>
		<td className="px-6 py-4 whitespace-nowrap">
			<div
				className="text-sm font-medium text-green-500 cursor-pointer"
				onClick={() => {
					setIsOpenDetails(prev => !prev)
					setTransaction(trans)
				}}>
				{trans.refNumber}
			</div>
		</td>
		<td className="px-6 py-4 whitespace-nowrap">
			<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-sm
				${trans?.paymentMethod?.uuid === '1' ? 'bg-blue-100 text-blue-800' :
					'bg-green-100 text-yellow-800'
				}`}>
				{trans?.paymentMethod?.name}
			</span>
		</td>
		<td className="px-6 py-4 text-sm text-right text-gray-500 whitespace-nowrap">
			{formatCurrency(trans.total)}
		</td>
		<td className="px-6 py-4 text-sm text-right text-gray-500 whitespace-nowrap">
			{dayjs(trans.date).format("D-MM-YYYY")}
		</td>
	</tr>
}

export default RenderTransactionRow