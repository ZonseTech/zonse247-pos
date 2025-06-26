import SyncCard from './partials/SyncCard';
import AppLayout from '../../layouts/AppLayout'
import { FunctionComponent, useState, useEffect, useCallback } from 'react'
import { HiOutlineDatabase, HiOutlineRefresh, } from 'react-icons/hi'
import { HiOutlineCheck, HiOutlineExclamationTriangle } from 'react-icons/hi2'
import { syncService } from '../../services/sync.service'

const SyncData: FunctionComponent = () => {
	const [tables, setTables] = useState<Table[]>([])
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({})
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [errors, setErrors] = useState<Array<string>>([])

	const fetchTables = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const tablesData = await syncService.getTables()
			setTables(tablesData)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch tables')
			console.error('Error fetching tables:', err)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchTables()
	}, [fetchTables])

	const handleAction = async (tableId: string | number, actionType: 'pull' | 'push') => {
		const loadingKey = `${tableId}-${actionType}`

		try {
			setLoadingStates(prev => ({ ...prev, [loadingKey]: true }))

			setTables(prev => prev.map(table =>
				table.id === tableId ? { ...table, status: 'syncing' } : table
			))

			const response = actionType === 'pull'
				? await syncService.pullData(tableId)
				: await syncService.pushData(tableId)

			if (response.success) {
				setTables(prev => prev.map(table =>
					table.id === tableId ? {
						...table,
						status: 'synced',
						syncedDocs: response.syncedDocs || table.syncedDocs,
						lastSync: response.lastSync || 'Just now'
					} : table
				))
			} else {
				setTables(prev => prev.map(table =>
					table.id === tableId ? { ...table, status: 'error' } : table
				))
				setError(response.message || `Failed to ${actionType} data`)
				setErrors(response.errors ? response.errors as any : [])

			}
		} catch (err) {
			setTables(prev => prev.map(table =>
				table.id === tableId ? { ...table, status: 'error' } : table
			))
			setErrors(err ? err.errors as any : [])
			setError(err instanceof Error ? err.message : `Failed to ${actionType} data`)

			console.log(errors);
			console.error(`Error ${actionType}ing data:`, err)
		} finally {
			setLoadingStates(prev => ({ ...prev, [loadingKey]: false }))
		}
	}

	const handleRefreshAll = async () => {
		await fetchTables()
	}

	const handleBulkSync = async (action: 'pull' | 'push') => {
		const syncableTables = tables.filter(t => t.status !== 'syncing')
		const tableIds = syncableTables.map(t => t.id)

		try {
			setTables(prev => prev.map(table =>
				tableIds.includes(table.id) ? { ...table, status: 'syncing' } : table
			))

			const results = await syncService.bulkSync(tableIds, action)

			results.forEach((result, index) => {
				const tableId = tableIds[index]
				setTables(prev => prev.map(table =>
					table.id === tableId ? {
						...table,
						status: result.success ? 'synced' : 'error',
						syncedDocs: result.syncedDocs || table.syncedDocs,
						lastSync: result.lastSync || (result.success ? 'Just now' : table.lastSync)
					} : table
				))
			})
		} catch (err) {
			setTables(prev => prev.map(table =>
				tableIds.includes(table.id) ? { ...table, status: 'error' } : table
			))
			setError(err instanceof Error ? err.message : `Failed to ${action} data`)
		}
	}

	if (isLoading) {
		return (
			<AppLayout>
				<div className='min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900'>
					<div className='flex items-center space-x-2'>
						<HiOutlineRefresh className='w-6 h-6 animate-spin text-blue-500' />
						<span className='text-gray-600 dark:text-gray-400'>Loading sync data...</span>
					</div>
				</div>
			</AppLayout>
		)
	}

	return (
		<AppLayout>
			{error && (
				<div className='mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
					<div className='flex items-center'>
						<HiOutlineExclamationTriangle className='w-5 h-5 text-red-500 dark:text-red-400 mr-2' />
						<span className='text-red-700 dark:text-red-300'>{error}</span>
						<button
							onClick={() => setError(null)}
							className='ml-auto text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
						>
							×
						</button>
					</div>

					{
						errors.length > 0 && (
							<ul className='mt-2 text-sm text-red-600 dark:text-red-400'>
								{errors.map((err, index) => (
									<li key={index} className='list-disc ml-4'>
										{err}
									</li>
								))}
							</ul>
						)
					}
				</div>
			)}

			<div className='mb-6 flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>Data Synchronization</h1>
				<div className='flex space-x-3'>
					<button
						onClick={handleRefreshAll}
						className='flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors'
					>
						<HiOutlineRefresh className='w-4 h-4 mr-2' />
						Refresh All
					</button>
					<button
						onClick={() => handleBulkSync('pull')}
						className='flex items-center px-4 py-2 border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
					>
						Pull All
					</button>
					<button
						onClick={() => handleBulkSync('push')}
						className='flex items-center px-4 py-2 border border-green-600 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors'
					>
						Push All
					</button>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
				<div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700'>
					<div className='flex items-center'>
						<HiOutlineDatabase className='w-8 h-8 text-blue-500' />
						<div className='ml-4'>
							<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
								Total Tables
							</p>
							<p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
								{tables.length}
							</p>
						</div>
					</div>
				</div>
				<div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700'>
					<div className='flex items-center'>
						<HiOutlineCheck className='w-8 h-8 text-green-500' />
						<div className='ml-4'>
							<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Synced</p>
							<p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
								{tables.filter((t) => t.status === 'synced').length}
							</p>
						</div>
					</div>
				</div>
				<div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700'>
					<div className='flex items-center'>
						<HiOutlineRefresh className='w-8 h-8 text-blue-500' />
						<div className='ml-4'>
							<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
								In Progress
							</p>
							<p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
								{
									tables.filter(
										(t) => t.status === 'syncing' || t.status === 'pending'
									).length
								}
							</p>
						</div>
					</div>
				</div>
				<div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700'>
					<div className='flex items-center'>
						<HiOutlineExclamationTriangle className='w-8 h-8 text-red-500' />
						<div className='ml-4'>
							<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Errors</p>
							<p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
								{tables.filter((t) => t.status === 'error').length}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-36'>
				{tables.map((table) => (
					<SyncCard
						key={table.id}
						table={table}
						loadingStates={loadingStates}
						handleAction={handleAction}
					/>
				))}
			</div>

			{tables.length === 0 && !isLoading && (
				<div className='text-center py-12'>
					<HiOutlineDatabase className='w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4' />
					<p className='text-gray-600 dark:text-gray-400'>No tables found</p>
					<button
						onClick={fetchTables}
						className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
					>
						Retry
					</button>
				</div>
			)}
		</AppLayout>
	)
}

export default SyncData