import { type FunctionComponent } from 'react'
import { HiOutlineClock, HiOutlineExclamation } from 'react-icons/hi'
import { HiOutlineWrench } from 'react-icons/hi2'

const UnderConstruction: FunctionComponent = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/40">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<div className="mx-auto h-24 w-24 text-yellow-500 mb-4 flex justify-center">
						<HiOutlineExclamation className="h-24 w-24" />
					</div>
					<h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-400 sm:text-4xl">
						Under Construction
					</h1>
					<p className="mt-3 text-xl text-gray-400">
						This feature is currently being built
					</p>
				</div>

				<div className="bg-gray-50/50 shadow overflow-hidden rounded-sm divide-y divide-gray-300">
					<div className="px-6 py-5 flex items-center">
						<HiOutlineWrench className="h-6 w-6 text-green-500 mr-3" />
						<div className="text-lg font-medium text-gray-900">We're working on it</div>
					</div>
					<div className="px-6 py-5">
						<p className="text-gray-600">
							Our team is actively developing this feature to help you work with this feature more efficiently.
							We appreciate your patience.
						</p>
					</div>
					<div className="px-6 py-4 flex items-center">
						<HiOutlineClock className="h-5 w-5 text-green-500 mr-3" />
						<div className="text-sm text-gray-400">Estimated completion: Coming soon</div>
					</div>
				</div>

				<div className="text-center mt-8">
					<p className="text-sm text-gray-500">
						If you have any questions about this feature, please contact our support team.
					</p>
				</div>
			</div>
		</div>
	)
}

export default UnderConstruction