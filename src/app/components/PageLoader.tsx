import { Fragment, type FunctionComponent } from 'react'
import { FaPills } from 'react-icons/fa'

const PageLoader: FunctionComponent = () => {
	return (
		<Fragment>
			<div className="flex items-center justify-center h-96">
				<div className="flex flex-col items-center">
					<FaPills className="w-12 h-12 text-blue-500 animate-pulse" />
					<p className="mt-4 text-lg font-medium text-gray-600">Loading data...</p>
					<p>Vitality Health Services MIS</p>
				</div>
			</div>
		</Fragment>
	)
}

export default PageLoader