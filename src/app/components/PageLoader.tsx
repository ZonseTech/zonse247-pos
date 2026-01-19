import { Fragment, type FunctionComponent } from 'react'
import { Logo } from '../assets/images'

const PageLoader: FunctionComponent = () => {
	return (
		<Fragment>
			<div className="flex min-h-screen items-center justify-center h-96 bg-gray-50 dark:bg-gray-600">
				<div className="flex flex-col items-center">
					<img src={Logo} alt="Loading" className="w-16 h-16 animate-pulse" />
					<p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">Loading data, please wait...</p>
				</div>
			</div>
		</Fragment>
	)
}

export default PageLoader