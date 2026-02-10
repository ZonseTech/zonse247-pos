import React, { useState, useEffect, FunctionComponent } from 'react';
import api from '../../services/http.service';
import { HiBellAlert, HiEye, HiOutlineSquaresPlus } from 'react-icons/hi2';
import { RiDatabase2Fill, RiDatabase2Line, RiDownload2Fill, RiDownloadCloud2Fill, RiFileTransferFill, RiSettings3Line } from 'react-icons/ri';
import { HiOutlineTrash } from 'react-icons/hi';
import { FaCheckSquare, FaEye, FaRegCheckSquare, FaSquareFull } from 'react-icons/fa';
import AppLayout from '../../layouts/AppLayout';

const DatabaseExportTool: FunctionComponent = () => {
	const [tables, setTables] = useState<string[]>([]);
	const [selectedTables, setSelectedTables] = useState<string[]>([]);
	const [tableStats, setTableStats] = useState<{ [key: string]: TableStats }>({});
	const [exportOptions, setExportOptions] = useState<ExportOptions>({
		format: 'json',
		includeMetadata: false
	});
	const [previewData, setPreviewData] = useState<ExportResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<'export' | 'preview' | 'settings'>('export');
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		loadTables();
	}, []);

	const showError = (message: string) => {
		setError(message);
		setTimeout(() => setError(null), 5000);
	};

	const showSuccess = (message: string) => {
		console.log('Success:', message);
	};

	const loadTables = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await api.get<ApiResponse<string[]>>('/export/tables');

			if (response.data.success) {
				setTables(response.data.data);
				response.data.data.forEach(async table => {
					await loadTableStats(table);
				});
			} else {
				showError(response.data.message || 'Failed to load tables');
			}
		} catch (error: any) {
			console.error('Failed to load tables:', error);
			showError(error.error?.message || 'Failed to load tables. Please check your connection.');
		} finally {
			setLoading(false);
		}
	};

	const loadTableStats = async (tableName: string) => {
		try {
			const response = await api.get<ApiResponse<TableStats>>(`/export/stats/${tableName}`);

			if (response.data.success) {
				setTableStats(prev => ({
					...prev,
					[tableName]: response.data.data
				}));
			}
		} catch (error: any) {
			console.error(`Failed to load stats for ${tableName}:`, error);
		}
	};

	const handleTableToggle = (tableName: string) => {
		setSelectedTables(prev =>
			prev.includes(tableName)
				? prev.filter(t => t !== tableName)
				: [...prev, tableName]
		);
	};

	const handleSelectAll = () => {
		setSelectedTables(selectedTables.length === tables.length ? [] : [...tables]);
	};

	const handlePreview = async (tableName: string) => {
		try {
			setLoading(true);
			setError(null);


			const previewOptions = { ...exportOptions, /* limit: 5 */ };
			const response = await api.post<any>('/export/preview', {
				tableName,
				options: previewOptions
			});

			if (response.data.success) {
				setPreviewData(response.data.data);
				setActiveTab('preview');
				showSuccess('Preview data loaded successfully');
			} else {
				showError(response.data.message || 'Failed to preview data');
			}
		} catch (error: any) {
			console.error('Failed to preview data:', error);
			showError(error.error?.message || 'Failed to preview data. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleExport = async () => {
		if (selectedTables.length === 0) {
			showError('Please select at least one table to export');
			return;
		}

		try {
			setLoading(true);
			setError(null);

			if (selectedTables.length === 1) {
				const response = await api.post<any>('/export/download', {
					tableName: selectedTables[0],
					options: exportOptions
				});

				if (response.data.success) {
					const downloadUrl = `/api/v1/export/download/${response.data.data.filename}`;

					const link = document.createElement('a');
					link.href = `http://localhost:3000${downloadUrl}`;
					link.download = response.data.data.filename;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);

					showSuccess(`Export completed: ${response.data.data.filename}`);
				} else {
					showError(response.data.message || 'Export failed');
				}
			} else {
				const response = await api.post<any>('/export/bulk', {
					tableNames: selectedTables,
					options: exportOptions
				});

				if (response.data.success) {
					showSuccess(`Bulk export completed for ${selectedTables.length} tables`);
				} else {
					showError(response.data.message || 'Bulk export failed');
				}
			}
		} catch (error: any) {
			console.error('Export failed:', error);
			showError(error.error?.message || 'Export failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleCleanupFiles = async () => {
		try {
			setLoading(true);
			const response = await api.delete<ApiResponse<{ deletedCount: number }>>('/export/cleanup');

			if (response.data.success) {
				showSuccess(`Cleaned up ${response.data.data.deletedCount} old export files`);
			} else {
				showError(response.data.message || 'Cleanup failed');
			}
		} catch (error: any) {
			console.error('Cleanup failed:', error);
			showError(error.error?.message || 'Cleanup failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'Never';
		return new Date(dateString).toLocaleDateString();
	};

	const formatNumber = (num: number) => {
		return num.toLocaleString();
	};

	return (
		<AppLayout>
			<div className="min-h-screen overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
				<div className="max-w-full mx-auto">
					{error && (
						<div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-sm p-4 flex items-center space-x-3">
							<HiBellAlert className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
							<p className="text-red-800 dark:text-red-200">{error}</p>
						</div>
					)}

					<div className="bg-white dark:bg-slate-800 rounded-xs p-6 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-900/20">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-sm">
									<RiDatabase2Line className="h-6 w-6 text-sky-500 dark:text-sky-400" />
								</div>
								<div>
									<h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Database Export Tool</h1>
									<p className="text-slate-600 dark:text-slate-400">Export your database records in JSON or CSV format</p>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								<span className="text-sm text-slate-500 dark:text-slate-400">{selectedTables.length} selected</span>
								<button
									onClick={handleCleanupFiles}
									disabled={loading}
									className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm transition-colors"
									title="Clean up old export files"
								>
									<HiOutlineTrash className="h-4 w-4" />
								</button>
								<button
									onClick={handleExport}
									disabled={loading || selectedTables.length === 0}
									className="flex items-center space-x-2 px-4 py-2 bg-sky-500 dark:bg-sky-700 text-white rounded-sm hover:bg-sky-700 dark:hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
								>
									<RiDownloadCloud2Fill className="h-4 w-4" />
									<span>Export Selected</span>
								</button>
							</div>
						</div>
					</div>

					<div className="pb-36 bg-white dark:bg-slate-800 rounded-xs mb-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-900/20">
						<div className="flex border-b border-slate-200 dark:border-slate-700">
							{[
								{ key: 'export', label: 'Export', icon: RiDownload2Fill },
								{ key: 'preview', label: 'Preview', icon: FaEye },
								{ key: 'settings', label: 'Settings', icon: RiSettings3Line }
							].map(({ key, label, icon: Icon }) => (
								<button
									key={key}
									onClick={() => setActiveTab(key as any)}
									className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === key
										? 'text-sky-500 dark:text-sky-400 border-b-2 border-sky-500 dark:border-sky-400'
										: 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
										}`}
								>
									<Icon className="h-4 w-4" />
									<span>{label}</span>
								</button>
							))}
						</div>

						<div className="p-6">
							{activeTab === 'export' && (
								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Select Tables to Export</h3>
										<button
											onClick={handleSelectAll}
											className="flex items-center space-x-2 text-sm text-sky-500 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
										>
											{selectedTables.length === tables.length ? (
												<FaRegCheckSquare className="h-4 w-4" />
											) : (
												<FaSquareFull className="h-4 w-4" />
											)}
											<span>{selectedTables.length === tables.length ? 'Deselect All' : 'Select All'}</span>
										</button>
									</div>

									{tables.length === 0 && !loading ? (
										<div className="text-center py-12">
											<RiDatabase2Fill className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
											<p className="text-slate-600 dark:text-slate-400">No tables available or failed to load</p>
											<button
												onClick={loadTables}
												className="mt-4 px-4 py-2 bg-sky-500 dark:bg-sky-700 text-white rounded-sm hover:bg-sky-700 dark:hover:bg-sky-500 transition-colors shadow-sm"
											>
												Retry
											</button>
										</div>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											{tables.map(tableName => {
												const stats = tableStats[tableName];
												const isSelected = selectedTables.includes(tableName);

												return (
													<div
														key={tableName}
														className={`border rounded-sm p-4 cursor-pointer transition-all shadow-sm ${isSelected
															? 'border-sky-500 dark:border-sky-400 bg-sky-50 dark:bg-sky-900/20'
															: 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:shadow-md dark:hover:shadow-slate-900/30'
															}`}
														onClick={() => handleTableToggle(tableName)}
													>
														<div className="flex items-center justify-between mb-3">
															<div className="flex items-center space-x-2">
																{isSelected ? (
																	<FaCheckSquare className="h-5 w-5 text-sky-500 dark:text-sky-400" />
																) : (
																	<HiOutlineSquaresPlus className="h-5 w-5 text-slate-400 dark:text-slate-500" />
																)}
																<h4 className="font-semibold text-slate-800 dark:text-slate-100 capitalize">{tableName}</h4>
															</div>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	handlePreview(tableName);
																}}
																className="p-1 text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
															>
																<HiEye className="h-4 w-4" />
															</button>
														</div>

														{stats ? (
															<div className="space-y-2">
																<div className="flex justify-between text-sm">
																	<span className="text-slate-600 dark:text-slate-400">Total Records:</span>
																	<span className="font-medium text-slate-800 dark:text-slate-200">{formatNumber(stats.totalRecords)}</span>
																</div>
																<div className="flex justify-between text-sm">
																	<span className="text-slate-600 dark:text-slate-400">Synced:</span>
																	<span className="font-medium text-green-500 dark:text-green-400">{formatNumber(stats.syncedRecords)}</span>
																</div>
																<div className="flex justify-between text-sm">
																	<span className="text-slate-600 dark:text-slate-400">Unsynced:</span>
																	<span className="font-medium text-orange-600 dark:text-orange-400">{formatNumber(stats.unsyncedRecords)}</span>
																</div>
																<div className="flex justify-between text-sm">
																	<span className="text-slate-600 dark:text-slate-400">Last Updated:</span>
																	<span className="font-medium text-slate-600 dark:text-slate-400">{formatDate(stats.lastUpdated)}</span>
																</div>
															</div>
														) : (
															<div className="animate-pulse space-y-2">
																<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
																<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
																<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
															</div>
														)}
													</div>
												);
											})}
										</div>
									)}
								</div>
							)}

							{activeTab === 'preview' && (
								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Data Preview</h3>
										{previewData && (
											<div className="text-sm text-slate-600 dark:text-slate-400">
												Showing {previewData.recordCount} records from {previewData.tableName}
											</div>
										)}
									</div>

									{previewData ? (
										<div className="bg-slate-50 dark:bg-slate-900/50 rounded-sm p-4 border border-slate-200 dark:border-slate-700">
											<div className="mb-4">
												<div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
													<span>Table: <strong className="text-slate-800 dark:text-slate-200">{previewData.tableName}</strong></span>
													<span>Records: <strong className="text-slate-800 dark:text-slate-200">{previewData.recordCount}</strong></span>
													<span>Format: <strong className="text-slate-800 dark:text-slate-200">{previewData.format.toUpperCase()}</strong></span>
												</div>
											</div>

											<div className="bg-white dark:bg-slate-800 rounded-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
												<div className="overflow-x-auto">
													<table className="w-full text-sm">
														<thead className="bg-slate-100 dark:bg-slate-700">
															<tr>
																{previewData.data.length > 0 && Object.keys(previewData.data[0]).map(key => (
																	<th key={key} className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 capitalize">
																		{key}
																	</th>
																))}
															</tr>
														</thead>
														<tbody>
															{previewData.data.map((record: any, index: number) => (
																<tr key={index} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
																	{Object.values(record).map((value: any, cellIndex: number) => (
																		<td key={cellIndex} className="px-4 py-3 text-slate-600 dark:text-slate-400">
																			{typeof value === 'object' ? JSON.stringify(value) : String(value)}
																		</td>
																	))}
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>

											<div className="mt-4">
												<details className="group">
													<summary className="cursor-pointer text-sm text-sky-500 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium">
														View Raw JSON
													</summary>
													<pre className="mt-2 p-4 bg-slate-800 dark:bg-slate-900 text-green-400 dark:text-green-300 rounded-sm text-xs overflow-x-auto border border-slate-600 dark:border-slate-700">
														{JSON.stringify(previewData, null, 2)}
													</pre>
												</details>
											</div>
										</div>
									) : (
										<div className="text-center py-12">
											<HiEye className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
											<p className="text-slate-600 dark:text-slate-400">Click the preview button on any table to see sample data</p>
										</div>
									)}
								</div>
							)}

							{activeTab === 'settings' && (
								<div className="space-y-6">
									<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Export Settings</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-3">
											<label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Export Format</label>
											<div className="space-y-2">
												{(['json', 'csv'] as const).map(format => (
													<label key={format} className="flex items-center space-x-3 cursor-pointer">
														<input
															type="radio"
															name="format"
															value={format}
															checked={exportOptions.format === format}
															onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'json' | 'csv' }))}
															className="text-sky-500 dark:text-sky-400 focus:ring-sky-500 dark:focus:ring-sky-400 dark:bg-slate-700 dark:border-slate-600"
														/>
														<span className="text-slate-700 dark:text-slate-300 uppercase">{format}</span>
													</label>
												))}
											</div>
										</div>

										<div className="space-y-3">
											<label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Options</label>
											<label className="flex items-center space-x-3 cursor-pointer">
												<input
													type="checkbox"
													checked={exportOptions.includeMetadata || false}
													onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
													className="text-sky-500 dark:text-sky-400 focus:ring-sky-500 dark:focus:ring-sky-400 rounded dark:bg-slate-700 dark:border-slate-600"
												/>
												<span className="text-slate-700 dark:text-slate-300">Include metadata (internal IDs, etc.)</span>
											</label>
										</div>
									</div>

									<div className="border-t border-slate-200 dark:border-slate-700 pt-6">
										<button
											onClick={() => setShowFilters(!showFilters)}
											className="flex items-center space-x-2 text-sm text-sky-500 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium"
										>
											<RiFileTransferFill className="h-4 w-4" />
											<span>Advanced Filters</span>
										</button>

										{showFilters && (
											<div className="mt-4 space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-sm border border-slate-200 dark:border-slate-700">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Record Limit</label>
														<input
															type="number"
															placeholder="Leave empty for all records"
															value={exportOptions.limit || ''}
															onChange={(e) => setExportOptions(prev => ({
																...prev,
																limit: e.target.value ? parseInt(e.target.value) : undefined
															}))}
															className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
														/>
													</div>

													<div>
														<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Skip Records</label>
														<input
															type="number"
															placeholder="0"
															value={exportOptions.offset || ''}
															onChange={(e) => setExportOptions(prev => ({
																...prev,
																offset: e.target.value ? parseInt(e.target.value) : undefined
															}))}
															className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
														/>
													</div>
												</div>

												<div className="border-t border-slate-300 dark:border-slate-600 pt-4">
													<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date Range Filter</label>
													<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
														<div>
															<label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Field</label>
															<select
																value={exportOptions.dateRange?.field || ''}
																onChange={(e) => setExportOptions(prev => ({
																	...prev,
																	dateRange: e.target.value ? {
																		...prev.dateRange,
																		field: e.target.value,
																		start: prev.dateRange?.start || '',
																		end: prev.dateRange?.end || ''
																	} : undefined
																}))}
																className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 text-sm dark:bg-slate-800 dark:text-slate-200"
															>
																<option value="">Select field</option>
																<option value="createdAt">Created At</option>
																<option value="updatedAt">Updated At</option>
															</select>
														</div>

														<div>
															<label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
															<input
																type="date"
																value={exportOptions.dateRange?.start || ''}
																onChange={(e) => setExportOptions(prev => ({
																	...prev,
																	dateRange: prev.dateRange ? {
																		...prev.dateRange,
																		start: e.target.value
																	} : undefined
																}))}
																className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 text-sm dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
															/>
														</div>

														<div>
															<label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">End Date</label>
															<input
																type="date"
																value={exportOptions.dateRange?.end || ''}
																onChange={(e) => setExportOptions(prev => ({
																	...prev,
																	dateRange: prev.dateRange ? {
																		...prev.dateRange,
																		end: e.target.value
																	} : undefined
																}))}
																className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 text-sm dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
															/>
														</div>
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					</div>

					{loading && (
						<div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
							<div className="bg-white dark:bg-slate-800 rounded-sm p-6 flex items-center space-x-3 shadow-xl border border-slate-200 dark:border-slate-700">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500 dark:border-sky-400" />
								<span className="text-slate-700 dark:text-slate-300">Processing...</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</AppLayout>
	);
};

export default DatabaseExportTool;