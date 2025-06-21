import { formatCurrency } from '../../../utils'
import { Fragment, type FunctionComponent } from 'react'

type Props = {
	product: TopProduct
}

const RenderTopProductRow: FunctionComponent<Props> = ({ product }) => {
	return (
		<Fragment>
			<tr key={product.uuid}>
				<td className="px-6 py-4 whitespace-nowrap">
					<div className="text-sm font-medium text-gray-900">{product.name}</div>
				</td>
				<td className="px-6 py-4 whitespace-nowrap">
					<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-sm 
                ${product.categoryName === 'Consumables' ? 'bg-blue-100 text-blue-800' :
							'bg-green-100 text-yellow-800'
						}`}>
						{product.categoryName}
					</span>
				</td>
				<td className="px-6 py-4 text-sm text-right text-gray-500 whitespace-nowrap">
					{product.quantity}
				</td>
				<td className="px-6 py-4 text-sm text-right text-gray-500 whitespace-nowrap">
					{formatCurrency(product.summedSellPrice)}
				</td>
			</tr>
		</Fragment>
	)
}

export default RenderTopProductRow