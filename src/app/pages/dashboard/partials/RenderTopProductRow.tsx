import { formatCurrency } from '../../../utils'
import { Fragment, type FunctionComponent } from 'react'

type Props = {
	product: Partial<TopProduct>
}

const RenderTopProductRow: FunctionComponent<Props> = ({ product }) => {
	return (
		<Fragment>
			<tr
				key={product.productId}
				className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
			>
				<td className="px-6 py-4 whitespace-nowrap">
					<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
						{product.name}
					</div>
				</td>
				<td className="px-6 py-4 whitespace-nowrap">
					<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-sm transition-colors duration-200
                ${product.categoryName === 'Consumables'
							? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-1 dark:ring-blue-500/30'
							: 'bg-green-100 text-yellow-800 dark:bg-green-900/30 dark:text-green-300 dark:ring-1 dark:ring-green-500/30'
						}`}>
						{product.categoryName}
					</span>
				</td>
				<td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
					{product.quantity}
				</td>
				<td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium">
					{formatCurrency(product.summedSellPrice)}
				</td>
			</tr>
		</Fragment>
	)
}
export default RenderTopProductRow