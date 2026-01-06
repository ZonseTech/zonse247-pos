import { FunctionComponent, useState, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { syncService } from '../../services/sync.service';
import { toast } from 'react-toastify';

// Components
import SyncTableCard from './partials/SyncTableCard';
import SyncStatsCards from './partials/SyncStatsCards';
import SyncActionsBar from './partials/SyncActionsBar';
import ConfigureTableModal from './partials/ConfigureTableModal';
import ViewRecordsModal from './partials/ViewRecordsModal';

// Icons
import {
	HiOutlineRefresh,
	HiOutlineDatabase,
	HiOutlineSearch,
	HiOutlineFilter,
	HiOutlineViewGrid,
	HiOutlineViewList
} from 'react-icons/hi';
import {
	HiOutlineExclamationTriangle,
	HiOutlineCloudArrowUp,
	HiOutlineCloudArrowDown,
	HiOutlineArrowPath
} from 'react-icons/hi2';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | SyncStatus;

const SyncData: FunctionComponent = () => {
	// State
	const [tables, setTables] = useState<SyncTable[]>([]);
	const [filteredTables, setFilteredTables] = useState<SyncTable[]>([]);
	const [autoSyncStatus, setAutoSyncStatus] = useState<AutoSyncStatus | null>(null);
	const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// UI State
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [searchTerm, setSearchTerm] = useState('');
	const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

	// Modal State
	const [configureTable, setConfigureTable] = useState<SyncTable | null>(null);
	const [viewRecordsTable, setViewRecordsTable] = useState<string | null>(null);

	// Fetch tables
	const fetchTables = useCallback(async () => {
		try {
			setIsLoading(prev => ({ ...prev, refresh: true }));
			setError(null);

			const tablesData = await syncService.getTables();

			// Transform to new format if needed (backward compatibility)
			const transformedTables: SyncTable[] = tablesData.map((t: any) => ({
				id: t.id || t.name,
				name: t.name || t.id,
				displayName: t.displayName || t.name || t.id,
				description: t.description || '',
				recordCount: t.recordCount || t.syncedDocs || 0,
				syncedCount: t.syncedCount || t.syncedDocs || 0,
				pendingCount: t.pendingCount || 0,
				lastSyncAt: t.lastSyncAt || t.lastSync || null,
				status: t.status || 'idle',
				syncDirection: t.syncDirection || 'bidirectional',
				autoSyncEnabled: t.autoSyncEnabled || false,
				syncInterval: t.syncInterval || 30,
			}));

			setTables(transformedTables);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch tables');
			console.error('Error fetching tables:', err);
		} finally {
			setIsLoading(prev => ({ ...prev, refresh: false }));
			setIsInitialLoading(false);
		}
	}, []);

	// Fetch auto-sync status
	const fetchAutoSyncStatus = useCallback(async () => {
		try {
			const status = await syncService.getAutoSyncStatus();
			setAutoSyncStatus(status);
		} catch (err) {
			// If the endpoint doesn't exist or fails, set a default stopped status
			console.error('Error fetching auto-sync status:', err);
			setAutoSyncStatus({
				isRunning: false,
				startedAt: null,
				nextSyncAt: null,
				tablesInQueue: [],
				currentTable: null,
				progress: 0,
			});
		}
	}, []);

	// Initial load
	useEffect(() => {
		fetchTables();
		fetchAutoSyncStatus();
	}, [fetchTables, fetchAutoSyncStatus]);

	// Poll for auto-sync status when running
	useEffect(() => {
		if (autoSyncStatus?.isRunning) {
			const interval = setInterval(() => {
				fetchAutoSyncStatus();
				fetchTables(); // Also refresh tables to see progress
			}, 5000); // Poll every 5 seconds
			return () => clearInterval(interval);
		}
	}, [autoSyncStatus?.isRunning, fetchAutoSyncStatus, fetchTables]);

	// Filter tables
	useEffect(() => {
		let filtered = tables;

		if (searchTerm) {
			filtered = filtered.filter(t =>
				t.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				t.description.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		if (filterStatus !== 'all') {
			filtered = filtered.filter(t => t.status === filterStatus);
		}

		setFilteredTables(filtered);
	}, [tables, searchTerm, filterStatus]);

	// Sync handlers
	const handlePull = async (tableName: string) => {
		try {
			setIsLoading(prev => ({ ...prev, [`${tableName}-pull`]: true }));
			updateTableStatus(tableName, 'syncing');

			const response = await syncService.pullData(tableName);

			if (response.success) {
				updateTableStatus(tableName, 'synced', {
					syncedCount: response.syncedCount,
					lastSyncAt: response.timestamp,
				});
				toast.success(`Successfully pulled data for ${tableName}`);
			} else {
				updateTableStatus(tableName, 'error');
				toast.error(response.message || `Failed to pull data for ${tableName}`);
			}
		} catch (err) {
			updateTableStatus(tableName, 'error');
			toast.error(err instanceof Error ? err.message : 'Pull failed');
		} finally {
			setIsLoading(prev => ({ ...prev, [`${tableName}-pull`]: false }));
		}
	};

	const handlePush = async (tableName: string) => {
		try {
			setIsLoading(prev => ({ ...prev, [`${tableName}-push`]: true }));
			updateTableStatus(tableName, 'syncing');

			const response = await syncService.pushData(tableName);

			if (response.success) {
				updateTableStatus(tableName, 'synced', {
					syncedCount: response.syncedCount,
					lastSyncAt: response.timestamp,
				});
				toast.success(`Successfully pushed data for ${tableName}`);
			} else {
				updateTableStatus(tableName, 'error');
				toast.error(response.message || `Failed to push data for ${tableName}`);
			}
		} catch (err) {
			updateTableStatus(tableName, 'error');
			toast.error(err instanceof Error ? err.message : 'Push failed');
		} finally {
			setIsLoading(prev => ({ ...prev, [`${tableName}-push`]: false }));
		}
	};

	const handleBidirectional = async (tableName: string) => {
		try {
			setIsLoading(prev => ({ ...prev, [`${tableName}-bidirectional`]: true }));
			updateTableStatus(tableName, 'syncing');

			const response = await syncService.bidirectionalSync(tableName);

			if (response.success) {
				updateTableStatus(tableName, 'synced', {
					syncedCount: response.syncedCount,
					lastSyncAt: response.timestamp,
				});
				toast.success(`Successfully synced ${tableName}`);
			} else {
				updateTableStatus(tableName, 'error');
				toast.error(response.message || `Failed to sync ${tableName}`);
			}
		} catch (err) {
			updateTableStatus(tableName, 'error');
			toast.error(err instanceof Error ? err.message : 'Sync failed');
		} finally {
			setIsLoading(prev => ({ ...prev, [`${tableName}-bidirectional`]: false }));
		}
	};

	// Bulk sync handlers
	const handleBulkPull = async () => {
		try {
			setIsLoading(prev => ({ ...prev, 'bulk-pull': true }));
			const tableNames = tables.map(t => t.name);

			tables.forEach(t => updateTableStatus(t.name, 'syncing'));

			const response = await syncService.bulkSync(tableNames, 'pull');

			if (response.success) {
				response.results.forEach(result => {
					updateTableStatus(result.tableName, result.success ? 'synced' : 'error', {
						syncedCount: result.syncedCount,
					});
				});
				toast.success(`Bulk pull completed: ${response.totalSynced} records synced`);
			} else {
				toast.error(response.message || 'Bulk pull failed');
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Bulk pull failed');
		} finally {
			setIsLoading(prev => ({ ...prev, 'bulk-pull': false }));
			fetchTables();
		}
	};

	const handleBulkPush = async () => {
		try {
			setIsLoading(prev => ({ ...prev, 'bulk-push': true }));
			const tableNames = tables.map(t => t.name);

			tables.forEach(t => updateTableStatus(t.name, 'syncing'));

			const response = await syncService.bulkSync(tableNames, 'push');

			if (response.success) {
				response.results.forEach(result => {
					updateTableStatus(result.tableName, result.success ? 'synced' : 'error', {
						syncedCount: result.syncedCount,
					});
				});
				toast.success(`Bulk push completed: ${response.totalSynced} records synced`);
			} else {
				toast.error(response.message || 'Bulk push failed');
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Bulk push failed');
		} finally {
			setIsLoading(prev => ({ ...prev, 'bulk-push': false }));
			fetchTables();
		}
	};

	const handleBulkBidirectional = async () => {
		try {
			setIsLoading(prev => ({ ...prev, 'bulk-bidirectional': true }));
			const tableNames = tables.map(t => t.name);

			tables.forEach(t => updateTableStatus(t.name, 'syncing'));

			const response = await syncService.bulkSync(tableNames, 'bidirectional');

			if (response.success) {
				response.results.forEach(result => {
					updateTableStatus(result.tableName, result.success ? 'synced' : 'error', {
						syncedCount: result.syncedCount,
					});
				});
				toast.success(`Sync completed: ${response.totalSynced} records synced`);
			} else {
				toast.error(response.message || 'Sync failed');
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Sync failed');
		} finally {
			setIsLoading(prev => ({ ...prev, 'bulk-bidirectional': false }));
			fetchTables();
		}
	};

	// Auto-sync handlers
	const handleStartAutoSync = async () => {
		try {
			setIsLoading(prev => ({ ...prev, 'auto-sync-start': true }));
			const response = await syncService.startAutoSync();

			if (response.success) {
				setAutoSyncStatus(response.data || {
					isRunning: true,
					startedAt: new Date().toISOString(),
					nextSyncAt: null,
					tablesInQueue: tables.map(t => t.name),
					currentTable: null,
					progress: 0,
				});
				toast.success('Auto-sync started');
				// Refresh status after a short delay
				setTimeout(fetchAutoSyncStatus, 1000);
			} else {
				toast.error(response.message || 'Failed to start auto-sync');
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to start auto-sync');
		} finally {
			setIsLoading(prev => ({ ...prev, 'auto-sync-start': false }));
		}
	};

	const handleStopAutoSync = async () => {
		try {
			setIsLoading(prev => ({ ...prev, 'auto-sync-stop': true }));
			const response = await syncService.stopAutoSync();

			if (response.success) {
				setAutoSyncStatus({
					isRunning: false,
					startedAt: null,
					nextSyncAt: null,
					tablesInQueue: [],
					currentTable: null,
					progress: 0,
				});
				toast.success('Auto-sync stopped');
			} else {
				toast.error(response.message || 'Failed to stop auto-sync');
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to stop auto-sync');
		} finally {
			setIsLoading(prev => ({ ...prev, 'auto-sync-stop': false }));
		}
	};

	// Configure handler
	const handleConfigure = async (tableName: string, config: Partial<TableConfig>) => {
		try {
			setIsLoading(prev => ({ ...prev, 'configure': true }));
			const response = await syncService.configureTable(tableName, config);

			if (response.success) {
				toast.success(`Configuration saved for ${tableName}`);
				setConfigureTable(null);
				fetchTables();
			} else {
				toast.error(response.message || 'Failed to save configuration');
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to save configuration');
		} finally {
			setIsLoading(prev => ({ ...prev, 'configure': false }));
		}
	};

	// Helper to update table status
	const updateTableStatus = (tableName: string, status: SyncStatus, data?: Partial<SyncTable>) => {
		setTables(prev => prev.map(t =>
			t.name === tableName
				? { ...t, status, ...data }
				: t
		));
	};

	// Loading state
	if (isInitialLoading) {
		return (
			<AppLayout>
				<div className="min-h-[60vh] flex flex-col items-center justify-center">
					<div className="relative">
						<div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
						<div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
					</div>
					<p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Loading sync data...</p>
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout>
			<div className="space-y-6 pb-20">
				{/* Header */}
				<PageHeader
					title="Data Synchronization"
					description="Manage and sync your data between local and remote databases"
					icon={
						<div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
							<HiOutlineArrowPath className="w-6 h-6 text-white" />
						</div>
					}
					action={
						<div className="flex items-center gap-2">
							{/* View Mode Toggle */}
							<div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
								<button
									onClick={() => setViewMode('grid')}
									className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
										? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
										: 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
										}`}
								>
									<HiOutlineViewGrid className="w-5 h-5" />
								</button>
								<button
									onClick={() => setViewMode('list')}
									className={`p-2 rounded-md transition-colors ${viewMode === 'list'
										? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
										: 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
										}`}
								>
									<HiOutlineViewList className="w-5 h-5" />
								</button>
							</div>
						</div>
					}
				/>

				{/* Error Alert */}
				{error && (
					<div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
						<HiOutlineExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
						<p className="text-red-700 dark:text-red-300 flex-1">{error}</p>
						<button
							onClick={() => setError(null)}
							className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
						>
							×
						</button>
					</div>
				)}

				{/* Stats Cards */}
				<SyncStatsCards tables={tables} autoSyncStatus={autoSyncStatus} />

				{/* Actions Bar */}
				<SyncActionsBar
					tables={tables}
					autoSyncStatus={autoSyncStatus}
					onRefresh={fetchTables}
					onPullAll={handleBulkPull}
					onPushAll={handleBulkPush}
					onBidirectionalAll={handleBulkBidirectional}
					onStartAutoSync={handleStartAutoSync}
					onStopAutoSync={handleStopAutoSync}
					isLoading={isLoading}
				/>

				{/* Search and Filter */}
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
						<input
							type="text"
							placeholder="Search tables..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div className="relative">
						<HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
							className="pl-10 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[160px]"
						>
							<option value="all">All Status</option>
							<option value="synced">Synced</option>
							<option value="pending">Pending</option>
							<option value="syncing">Syncing</option>
							<option value="error">Error</option>
							<option value="idle">Idle</option>
						</select>
					</div>
				</div>

				{/* Tables Grid */}
				{filteredTables.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
						<HiOutlineDatabase className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
						<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
							No tables found
						</h3>
						<p className="text-slate-500 dark:text-slate-400 mb-4">
							{searchTerm || filterStatus !== 'all'
								? 'Try adjusting your search or filter'
								: 'No sync tables available'}
						</p>
						<button
							onClick={fetchTables}
							className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
						>
							<HiOutlineRefresh className="w-4 h-4" />
							Refresh
						</button>
					</div>
				) : (
					<div className={viewMode === 'grid'
						? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'
						: 'space-y-3'
					}>
						{filteredTables.map((table) => (
							<SyncTableCard
								key={table.id}
								table={table}
								onPull={handlePull}
								onPush={handlePush}
								onBidirectional={handleBidirectional}
								onConfigure={setConfigureTable}
								onViewRecords={setViewRecordsTable}
								isLoading={isLoading}
							/>
						))}
					</div>
				)}
			</div>

			{/* Modals */}
			<ConfigureTableModal
				table={configureTable}
				isOpen={!!configureTable}
				onClose={() => setConfigureTable(null)}
				onSave={handleConfigure}
				isLoading={isLoading['configure'] || false}
			/>

			<ViewRecordsModal
				tableName={viewRecordsTable}
				isOpen={!!viewRecordsTable}
				onClose={() => setViewRecordsTable(null)}
			/>
		</AppLayout>
	);
};

export default SyncData;