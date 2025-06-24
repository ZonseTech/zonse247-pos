import React, { useState, useRef, FunctionComponent } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlineCheckCircle, HiOutlineFolder, HiOutlineXCircle } from 'react-icons/hi2';
import { HiOutlineDatabase, HiOutlineExclamation, HiOutlineUpload, HiOutlineClock, HiOutlineChartBar } from 'react-icons/hi';
import { migrationService } from '../../services/migration.service';
import { FaSpinner } from 'react-icons/fa';
import { Input } from '../../components';

const Migrations: FunctionComponent = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [migrationProgress, setMigrationProgress] = useState<MigrationProgressItem[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isMigrating, setIsMigrating] = useState(false);
	const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
	const [migrationStats, setMigrationStats] = useState<MigrationStats | null>(null);
	const [tableName, setTableName] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);
	const tableNameInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setUploadStatus(null);
			setMigrationProgress([]);
			setMigrationStats(null);
		}
	};

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault();
	};

	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault();
		const file = event.dataTransfer.files[0];
		if (file) {
			setSelectedFile(file);
			setUploadStatus(null);
			setMigrationProgress([]);
			setMigrationStats(null);
		}
	};

	const handleOnTableNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setTableName(event.target.value);
	};

	const uploadFile = async () => {
		if (!selectedFile || !tableName) return;

		setIsUploading(true);
		setUploadStatus(null);

		try {
			const result = await migrationService.uploadFile(selectedFile, tableName);

			setUploadStatus({
				type: 'success',
				message: `File uploaded successfully. Found ${result.recordCount} records.`,
				data: result
			});
		} catch (error) {
			setUploadStatus({
				type: 'error',
				message: error instanceof Error ? error.message : 'Upload failed'
			});
		} finally {
			setIsUploading(false);
		}
	};

	const startMigration = async () => {
		if (!uploadStatus?.data || !selectedFile || !tableName) return;

		setIsMigrating(true);
		setMigrationProgress([]);
		setMigrationStats(null);

		try {
			await migrationService.startMigration(selectedFile.name, tableName);
			pollMigrationProgress();
		} catch (error) {
			setMigrationProgress([{
				table: 'Error',
				status: 'error',
				message: error instanceof Error ? error.message : 'Unknown error occurred',
				timestamp: new Date().toLocaleTimeString()
			}]);
			setIsMigrating(false);
		}
	};

	const pollMigrationProgress = async () => {
		const pollInterval = setInterval(async () => {
			try {
				const data = await migrationService.getMigrationProgress();

				setMigrationProgress(data.progress || []);
				setMigrationStats(data.stats);

				if (data.completed) {
					clearInterval(pollInterval);
					setIsMigrating(false);
				}
			} catch (error) {
				console.error('Error polling progress:', error);
				clearInterval(pollInterval);
				setIsMigrating(false);
			}
		}, 1000);

		setTimeout(() => {
			clearInterval(pollInterval);
			setIsMigrating(false);
		}, 300000);
	};

	const resetForm = () => {
		setSelectedFile(null);
		setMigrationProgress([]);
		setUploadStatus(null);
		setMigrationStats(null);
		setTableName('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'completed':
				return <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />;
			case 'error':
				return <HiOutlineXCircle className="w-5 h-5 text-red-500" />;
			case 'processing':
				return <FaSpinner className="w-5 h-5 text-blue-500 animate-spin" />;
			default:
				return <HiOutlineExclamation className="w-5 h-5 text-amber-500" />;
		}
	};

	const getProgressPercentage = () => {
		if (!migrationStats) return 0;
		return migrationStats.total > 0 ? Math.round((migrationStats.completed / migrationStats.total) * 100) : 0;
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<AppLayout>
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<div className="px-4 py-8 sm:px-6 lg:px-8">
					<div className="max-w-5xl mx-auto">
						<div className="mb-8">
							<div className="flex items-center space-x-3 mb-2">
								<div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
									<HiOutlineDatabase className="w-6 h-6 text-white" />
								</div>
								<div>
									<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
										Database Migration
									</h1>
									<p className="text-gray-600 dark:text-gray-300 mt-1">
										Upload and migrate your database files with real-time progress tracking
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
							<div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
								<div className="flex items-center space-x-3">
									<HiOutlineUpload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
									<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
										File Upload & Configuration
									</h2>
								</div>
							</div>

							<div className="p-6 space-y-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Target Table Name
									</label>
									<Input
										ref={tableNameInputRef}
										type="text"
										placeholder="Enter the destination table name"
										onChange={handleOnTableNameChange}
										value={tableName}
										className="w-full"
									/>
								</div>

								<div
									className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group ${selectedFile
										? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600'
										: 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
										}`}
									onDragOver={handleDragOver}
									onDrop={handleDrop}
									onClick={() => fileInputRef.current?.click()}
								>
									<input
										ref={fileInputRef}
										type="file"
										accept=".db,.json,.csv"
										onChange={handleFileSelect}
										className="hidden"
									/>

									{selectedFile ? (
										<div className="space-y-4">
											<div className="flex justify-center">
												<div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
													<HiOutlineFolder className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
												</div>
											</div>
											<div>
												<p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
													{selectedFile.name}
												</p>
												<p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
													{formatFileSize(selectedFile.size)}
												</p>
											</div>
											<div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
												Ready for upload
											</div>
										</div>
									) : (
										<div className="space-y-4">
											<div className="flex justify-center">
												<div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
													<HiOutlineUpload className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
												</div>
											</div>
											<div>
												<p className="text-lg font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
													Drop your database file here
												</p>
												<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
													or click to browse your files
												</p>
											</div>
											<div className="flex items-center justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
												<span>Supports:</span>
												<div className="flex space-x-2">
													<span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">.db</span>
													<span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">.json</span>
													<span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">.csv</span>
												</div>
											</div>
										</div>
									)}
								</div>

								{uploadStatus && (
									<div className={`rounded-lg p-4 border ${uploadStatus.type === 'success'
										? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
										: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
										}`}>
										<div className="flex items-start space-x-3">
											<div className="flex-shrink-0 mt-0.5">
												{uploadStatus.type === 'success' ? (
													<HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
												) : (
													<HiOutlineXCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
												)}
											</div>
											<div>
												<p className={`text-sm font-medium ${uploadStatus.type === 'success'
													? 'text-emerald-800 dark:text-emerald-300'
													: 'text-red-800 dark:text-red-300'
													}`}>
													{uploadStatus.message}
												</p>
											</div>
										</div>
									</div>
								)}

								<div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
									<button
										onClick={uploadFile}
										disabled={!selectedFile || isUploading || !tableName}
										className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
									>
										{isUploading ? (
											<>
												<FaSpinner className="w-4 h-4 mr-2 animate-spin" />
												Uploading...
											</>
										) : (
											<>
												<HiOutlineUpload className="w-4 h-4 mr-2" />
												Upload File
											</>
										)}
									</button>

									<button
										onClick={startMigration}
										disabled={!uploadStatus?.data || isMigrating || !tableName}
										className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
									>
										{isMigrating ? (
											<>
												<FaSpinner className="w-4 h-4 mr-2 animate-spin" />
												Migrating...
											</>
										) : (
											<>
												<HiOutlineDatabase className="w-4 h-4 mr-2" />
												Start Migration
											</>
										)}
									</button>

									<button
										onClick={resetForm}
										className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
									>
										Reset
									</button>
								</div>
							</div>
						</div>

						{migrationProgress.length > 0 && (
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
								<div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-3">
											<HiOutlineChartBar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
											<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
												Migration Progress
											</h2>
										</div>
										{isMigrating && (
											<div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
												<HiOutlineClock className="w-4 h-4" />
												<span>In Progress</span>
											</div>
										)}
									</div>
								</div>

								{migrationStats && (
									<div className="p-6 border-b border-gray-200 dark:border-gray-700">
										<div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
											<div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
												<p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
													{migrationStats.total}
												</p>
												<p className="text-sm font-medium text-blue-800 dark:text-blue-300 mt-1">
													Total Records
												</p>
											</div>
											<div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
												<p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
													{migrationStats.completed}
												</p>
												<p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mt-1">
													Completed
												</p>
											</div>
											<div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
												<p className="text-3xl font-bold text-red-600 dark:text-red-400">
													{migrationStats.errors}
												</p>
												<p className="text-sm font-medium text-red-800 dark:text-red-300 mt-1">
													Errors
												</p>
											</div>
											<div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
												<p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
													{getProgressPercentage()}%
												</p>
												<p className="text-sm font-medium text-purple-800 dark:text-purple-300 mt-1">
													Progress
												</p>
											</div>
										</div>

										{/* Progress Bar */}
										<div className="mt-6">
											<div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												<span>Migration Progress</span>
												<span>{getProgressPercentage()}%</span>
											</div>
											<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
												<div
													className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
													style={{ width: `${getProgressPercentage()}%` }}
												></div>
											</div>
										</div>
									</div>
								)}

								{/* Progress Log */}
								<div className="p-6">
									<div className="space-y-3 max-h-96 overflow-y-auto">
										{migrationProgress.map((item, index) => (
											<div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
												<div className="flex-shrink-0">
													{getStatusIcon(item.status)}
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
														{item.table || item.message}
													</p>
													{item.details && (
														<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
															{item.details}
														</p>
													)}
												</div>
												<div className="flex-shrink-0 text-right">
													<p className="text-xs text-gray-500 dark:text-gray-400">
														{item.timestamp}
													</p>
													{item.recordCount && (
														<p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
															{item.recordCount} records
														</p>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</AppLayout>
	);
};

export default Migrations;