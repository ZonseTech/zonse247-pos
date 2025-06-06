import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import { Fragment, FunctionComponent } from 'react'
import {
	HiOutlineDatabase,
	HiOutlineDownload,
	HiOutlineUpload,
	HiOutlineRefresh,
	HiOutlineClock,
	HiOutlineCheck
} from 'react-icons/hi'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'
dayjs.extend(relativeTime);

interface SyncCardProps {
	table: {
		id: number | string;
		name: string;
		syncedDocs: number;
		lastSync: string;
		status: string;
		description: string;
	}
	loadingStates: Record<string, boolean>
	handleAction: (tableId: number | string, actionType: 'pull' | 'push') => void
}

const SyncCard: FunctionComponent<SyncCardProps> = ({
	table,
	loadingStates,
	handleAction
}) => {

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'synced':
				return <HiOutlineCheck className="w-4 h-4 text-green-500" />
			case 'pending':
				return <HiOutlineClock className="w-4 h-4 text-yellow-500" />
			case 'error':
				return <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500" />
			case 'syncing':
				return <HiOutlineRefresh className="w-4 h-4 text-sky-500 animate-spin" />
			default:
				return <HiOutlineDatabase className="w-4 h-4 text-gray-500" />
		}
	}

	const getStatusBadge = (status: string) => {
		const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
		switch (status) {
			case 'synced':
				return `${baseClasses} bg-green-100 text-green-800`
			case 'pending':
				return `${baseClasses} bg-yellow-100 text-yellow-800`
			case 'error':
				return `${baseClasses} bg-red-100 text-red-800`
			case 'syncing':
				return `${baseClasses} bg-sky-100 text-sky-800`
			default:
				return `${baseClasses} bg-gray-100 text-gray-800`
		}
	}

	return (
		<div
			key={table.id}
			className='bg-white rounded-sm shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200'>
			<div className='p-6'>
				<div className='flex items-start justify-between mb-4'>
					<div className='flex items-center'>
						<div className='p-2 bg-sky-50 rounded-sm'>
							<HiOutlineDatabase className='w-6 h-6 text-sky-600' />
						</div>
						<div className='ml-3'>
							<h3 className='text-lg font-semibold text-gray-900'>
								{table.name}
							</h3>
							<p className='text-sm text-gray-500'>
								{table.description}
							</p>
						</div>
					</div>
					<span className={getStatusBadge(table.status)}>
						{table.status}
					</span>
				</div>

				<div className='bg-gray-50 rounded-sm p-4 mb-4'>
					<div className='flex items-center justify-between mb-2'>
						<span className='text-sm font-medium text-gray-600'>
							Synced Documents
						</span>
						<span className='text-2xl font-bold text-gray-900'>
							{table.syncedDocs.toLocaleString()}
						</span>
					</div>
					<div className='flex items-center text-sm text-gray-500'>
						{getStatusIcon(table.status)}
						<span className='ml-2'>Last sync: {dayjs(table.lastSync).fromNow()}</span>
					</div>
				</div>

				<div className='flex space-x-3'>
					<button
						onClick={() => handleAction(table.id, 'pull')}
						disabled={loadingStates[`${table.id}-pull`]}
						className='flex-1 flex items-center justify-center p-2 bg-sky-400 hover:bg-sky-700 disabled:bg-sky-400 text-white text-sm font-medium rounded-sm transition-colors duration-200'>
						{loadingStates[`${table.id}-pull`] ? (
							<HiOutlineRefresh className='w-4 h-4 animate-spin' />
						) : (
							<Fragment>
								<HiOutlineDownload className='w-4 h-4 mr-2' />
								Pull Data
							</Fragment>
						)}
					</button>
					<button
						onClick={() => handleAction(table.id, 'push')}
						disabled={loadingStates[`${table.id}-push`]}
						className='flex-1 flex items-center justify-center p-2 bg-green-400 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-sm transition-colors duration-200'>
						{loadingStates[`${table.id}-push`] ? (
							<HiOutlineRefresh className='w-4 h-4 animate-spin' />
						) : (
							<Fragment>
								<HiOutlineUpload className='w-4 h-4 mr-2' />
								Push Data
							</Fragment>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}

export default SyncCard