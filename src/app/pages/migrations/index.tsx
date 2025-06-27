import React, { useState, useRef, FunctionComponent, Fragment } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import { HiOutlineDatabase, HiOutlineExclamation, HiOutlineUpload, HiOutlineClock, HiOutlineChartBar, HiOutlineCog, HiOutlineDocumentText } from 'react-icons/hi';
import { migrationService } from '../../services/migration.service';
import { FaSpinner } from 'react-icons/fa';
import { Input } from '../../components';
import { HeaderSection } from './partials/HeaderSection';
import { ProgressBar } from './partials/ProgressBar';
import MigrationStats from './partials/MigrationStats';
import { FileDropzone } from './partials/FileDropzone';

interface DBRecord {
	_id: string | number;
	name: string;
	createdAt?: any;
	updatedAt?: any;
	[key: string]: any;
}

interface ColumnMappingWithDB {
	sourceColumn: string;
	targetDbField: string;
	dbRecordId?: string | number;
}

const Migrations: FunctionComponent = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedDbFile, setSelectedDbFile] = useState<File | null>(null);
	const [dbRecords, setDbRecords] = useState<DBRecord[]>([]);
	const [migrationProgress, setMigrationProgress] = useState<MigrationProgressItem[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isMigrating, setIsMigrating] = useState(false);
	const [isLoadingDb, setIsLoadingDb] = useState(false);
	const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
	const [dbLoadStatus, setDbLoadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
	const [migrationStats, setMigrationStats] = useState<MigrationStats | null>(null);
	const [tableName, setTableName] = useState('');
	const [showColumnMapping, setShowColumnMapping] = useState(false);
	const [columnMappings, setColumnMappings] = useState<ColumnMappingWithDB[]>([]);
	const [outputFileName, setOutputFileName] = useState('');
	const [outputFormat, setOutputFormat] = useState<'json' | 'csv'>('json');
	const [isMappingData, setIsMappingData] = useState(false);
	const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const dbFileInputRef = useRef<HTMLInputElement>(null);
	const tableNameInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setUploadStatus(null);
			setMigrationProgress([]);
			setMigrationStats(null);
			setMappingResult(null);
		}
	};

	const handleDbFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && file.name.endsWith('.db')) {
			setSelectedDbFile(file);
			setDbLoadStatus(null);
			setDbRecords([]);
			setColumnMappings([]);
			setMappingResult(null);
			loadDbFile(file);
		} else {
			alert('Please select a .db file');
		}
	};

	const loadDbFile = async (file: File) => {
		setIsLoadingDb(true);
		setDbLoadStatus(null);

		try {
			const text = await file.text();
			const lines = text.split('\n').filter(line => line.trim());
			const records: DBRecord[] = [];

			lines.forEach(line => {
				try {
					const record = JSON.parse(line);
					records.push(record);
				} catch (error) {
					console.warn('Failed to parse line:', line);
				}
			});

			setDbRecords(records);
			setDbLoadStatus({
				type: 'success',
				message: `Successfully loaded ${records.length} records from database file`
			});
		} catch (error) {
			setDbLoadStatus({
				type: 'error',
				message: error instanceof Error ? error.message : 'Failed to load database file'
			});
		} finally {
			setIsLoadingDb(false);
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
			setMappingResult(null);
		}
	};

	const handleDbDragOver = (event: React.DragEvent) => {
		event.preventDefault();
	};

	const handleDbDrop = (event: React.DragEvent) => {
		event.preventDefault();
		const file = event.dataTransfer.files[0];
		if (file && file.name.endsWith('.db')) {
			setSelectedDbFile(file);
			setDbLoadStatus(null);
			setDbRecords([]);
			setColumnMappings([]);
			setMappingResult(null);
			loadDbFile(file);
		} else {
			alert('Please drop a .db file');
		}
	};

	const handleOnTableNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setTableName(event.target.value);
	};

	const addColumnMapping = () => {
		setColumnMappings([...columnMappings, { sourceColumn: '', targetDbField: '', dbRecordId: '' }]);
	};

	const removeColumnMapping = (index: number) => {
		setColumnMappings(columnMappings.filter((_, i) => i !== index));
	};

	const updateColumnMapping = (index: number, field: keyof ColumnMappingWithDB, value: string) => {
		const updatedMappings = columnMappings.map((mapping, i) => {
			if (i === index) {
				const updatedMapping = { ...mapping, [field]: value };

				// If updating dbRecordId, also update the targetDbField with the record name
				if (field === 'dbRecordId' && value) {
					const selectedRecord = dbRecords.find(record => record._id.toString() === value);
					if (selectedRecord) {
						updatedMapping.targetDbField = selectedRecord.name;
					}
				}

				return updatedMapping;
			}
			return mapping;
		});
		setColumnMappings(updatedMappings);
	};

	const startDataMapping = async () => {
		if (!columnMappings.length || !outputFileName || !selectedDbFile) {
			alert('Please provide column mappings, output file name, and database file');
			return;
		}

		const invalidMappings = columnMappings.filter(
			mapping => !mapping.sourceColumn.trim() || !mapping.targetDbField.trim() || !mapping.dbRecordId
		);

		if (invalidMappings.length > 0) {
			alert('All column mappings must have source column, target field, and selected database record');
			return;
		}

		setIsMappingData(true);
		setMappingResult(null);

		try {
			// const result = await migrationService.mapDataWithDb({
			// 	columnMappings,
			// 	outputFileName,
			// 	format: outputFormat,
			// 	dbRecords: dbRecords
			// });

			// setMappingResult({
			// 	success: true,
			// 	message: result.message,
			// 	outputFile: result.data?.outputFile,
			// 	recordCount: result.data?.recordCount
			// });
		} catch (error) {
			setMappingResult({
				success: false,
				message: error instanceof Error ? error.message : 'Data mapping failed'
			});
		} finally {
			setIsMappingData(false);
		}
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
		setSelectedDbFile(null);
		setDbRecords([]);
		setMigrationProgress([]);
		setUploadStatus(null);
		setDbLoadStatus(null);
		setMigrationStats(null);
		setTableName('');
		setColumnMappings([]);
		setOutputFileName('');
		setMappingResult(null);
		setShowColumnMapping(false);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		if (dbFileInputRef.current) {
			dbFileInputRef.current.value = '';
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
						<HeaderSection
							showColumnMapping={showColumnMapping}
							setShowColumnMapping={setShowColumnMapping}
						/>

						{!showColumnMapping ? (
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

									<FileDropzone
										selectedFile={selectedFile}
										onDrop={handleDrop}
										onDragOver={handleDragOver}
										onFileSelect={handleFileSelect}
										fileInputRef={fileInputRef}
									/>

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
												<Fragment>
													<FaSpinner className="w-4 h-4 mr-2 animate-spin" />
													Uploading...
												</Fragment>
											) : (
												<Fragment>
													<HiOutlineUpload className="w-4 h-4 mr-2" />
													Upload File
												</Fragment>
											)}
										</button>

										<button
											onClick={startMigration}
											disabled={!uploadStatus?.data || isMigrating || !tableName}
											className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
										>
											{isMigrating ? (
												<Fragment>
													<FaSpinner className="w-4 h-4 mr-2 animate-spin" />
													Migrating...
												</Fragment>
											) : (
												<Fragment>
													<HiOutlineDatabase className="w-4 h-4 mr-2" />
													Start Migration
												</Fragment>
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
						) : (
							<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
								<div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
									<div className="flex items-center space-x-3">
										<HiOutlineCog className="w-5 h-5 text-purple-600 dark:text-purple-400" />
										<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
											Column Mapping Configuration
										</h2>
									</div>
								</div>

								<div className="p-6 space-y-6">
									{/* Database File Upload Section */}
									<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
										<div className="flex items-center space-x-2 mb-3">
											<HiOutlineDocumentText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
											<h3 className="text-lg font-medium text-amber-900 dark:text-amber-200">
												Database File Required
											</h3>
										</div>
										<p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
											Please upload a .db file (like categories.db) to map your custom columns to database records.
										</p>

										<div
											className="border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-lg p-6 text-center hover:border-amber-400 dark:hover:border-amber-500 transition-colors cursor-pointer"
											onDrop={handleDbDrop}
											onDragOver={handleDbDragOver}
											onClick={() => dbFileInputRef.current?.click()}
										>
											<input
												ref={dbFileInputRef}
												type="file"
												accept=".db"
												onChange={handleDbFileSelect}
												className="hidden"
											/>

											{selectedDbFile ? (
												<div className="space-y-2">
													<HiOutlineCheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
													<div className="text-sm font-medium text-gray-900 dark:text-white">
														{selectedDbFile.name}
													</div>
													<div className="text-xs text-gray-500 dark:text-gray-400">
														{formatFileSize(selectedDbFile.size)}
													</div>
												</div>
											) : (
												<div className="space-y-2">
													<HiOutlineDatabase className="w-8 h-8 text-amber-400 dark:text-amber-500 mx-auto" />
													<div className="text-sm font-medium text-amber-900 dark:text-amber-200">
														Click to select or drag & drop .db file
													</div>
													<div className="text-xs text-amber-700 dark:text-amber-400">
														Supports .db files only
													</div>
												</div>
											)}

											{isLoadingDb && (
												<div className="flex items-center justify-center space-x-2 mt-3">
													<FaSpinner className="w-4 h-4 animate-spin text-amber-600" />
													<span className="text-sm text-amber-600 dark:text-amber-400">Loading database...</span>
												</div>
											)}
										</div>

										{dbLoadStatus && (
											<div className={`mt-4 rounded-lg p-3 border ${dbLoadStatus.type === 'success'
												? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
												: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
												}`}>
												<div className="flex items-start space-x-2">
													<div className="flex-shrink-0 mt-0.5">
														{dbLoadStatus.type === 'success' ? (
															<HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
														) : (
															<HiOutlineXCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
														)}
													</div>
													<p className={`text-sm ${dbLoadStatus.type === 'success'
														? 'text-emerald-800 dark:text-emerald-300'
														: 'text-red-800 dark:text-red-300'
														}`}>
														{dbLoadStatus.message}
													</p>
												</div>
											</div>
										)}
									</div>

									{/* Configuration Section - Only show if DB is loaded */}
									{dbRecords.length > 0 && (
										<>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
														Output File Name
													</label>
													<Input
														type="text"
														placeholder="mapped_data"
														value={outputFileName}
														onChange={(e) => setOutputFileName(e.target.value)}
														className="w-full"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
														Output Format
													</label>
													<select
														value={outputFormat}
														onChange={(e) => setOutputFormat(e.target.value as 'json' | 'csv')}
														className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
													>
														<option value="json">JSON</option>
														<option value="csv">CSV</option>
													</select>
												</div>
											</div>

											<div>
												<div className="flex items-center justify-between mb-4">
													<h3 className="text-lg font-medium text-gray-900 dark:text-white">
														Column Mappings to Database Records
													</h3>
													<button
														onClick={addColumnMapping}
														className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
													>
														Add Mapping
													</button>
												</div>

												<div className="space-y-4">
													{columnMappings.map((mapping, index) => (
														<div key={index} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
															<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
																<div>
																	<label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
																		Source Column
																	</label>
																	<Input
																		type="text"
																		placeholder="e.g., category_name"
																		value={mapping.sourceColumn}
																		onChange={(e) => updateColumnMapping(index, 'sourceColumn', e.target.value)}
																		className="w-full"
																	/>
																</div>

																<div>
																	<label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
																		Database Record
																	</label>
																	<select
																		value={mapping.dbRecordId || ''}
																		onChange={(e) => updateColumnMapping(index, 'dbRecordId', e.target.value)}
																		className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
																	>
																		<option value="">Select record...</option>
																		{dbRecords.map((record) => (
																			<option key={record?._id} value={record?._id?.toString()}>
																				{record?.name} (ID: {record?._id})
																			</option>
																		))}
																	</select>
																</div>

																<div className="flex items-end">
																	<div className="flex-1">
																		<label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
																			Target Field
																		</label>
																		<Input
																			type="text"
																			placeholder="Auto-filled from record"
																			value={mapping.targetDbField}
																			onChange={(e) => updateColumnMapping(index, 'targetDbField', e.target.value)}
																			className="w-full"
																			disabled
																		/>
																	</div>
																	<button
																		onClick={() => removeColumnMapping(index)}
																		className="ml-3 p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
																	>
																		<HiOutlineXCircle className="w-5 h-5" />
																	</button>
																</div>
															</div>

															{mapping.dbRecordId && (
																<div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
																	<div className="text-xs text-blue-800 dark:text-blue-300">
																		<strong>Preview:</strong> {mapping.sourceColumn} → {mapping.targetDbField}
																		{dbRecords.find(r => r._id.toString() === mapping.dbRecordId) && (
																			<span className="block mt-1">
																				Full record: {JSON.stringify(dbRecords.find(r => r._id.toString() === mapping.dbRecordId), null, 2)}
																			</span>
																		)}
																	</div>
																</div>
															)}
														</div>
													))}

													{columnMappings.length === 0 && (
														<div className="text-center py-8 text-gray-500 dark:text-gray-400">
															No column mappings defined. Click "Add Mapping" to get started.
														</div>
													)}
												</div>
											</div>

											{mappingResult && (
												<div className={`rounded-lg p-4 border ${mappingResult.success
													? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
													: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
													}`}>
													<div className="flex items-start space-x-3">
														<div className="flex-shrink-0 mt-0.5">
															{mappingResult.success ? (
																<HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
															) : (
																<HiOutlineXCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
															)}
														</div>
														<div>
															<p className={`text-sm font-medium ${mappingResult.success
																? 'text-emerald-800 dark:text-emerald-300'
																: 'text-red-800 dark:text-red-300'
																}`}>
																{mappingResult.message}
															</p>
															{mappingResult.success && mappingResult.outputFile && (
																<p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
																	Output file: {mappingResult.outputFile}
																	{mappingResult.recordCount && ` (${mappingResult.recordCount} records)`}
																</p>
															)}
														</div>
													</div>
												</div>
											)}

											<div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
												<button
													onClick={startDataMapping}
													disabled={!columnMappings.length || !outputFileName || isMappingData || !selectedDbFile}
													className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
												>
													{isMappingData ? (
														<Fragment>
															<FaSpinner className="w-4 h-4 mr-2 animate-spin" />
															Mapping Data...
														</Fragment>
													) : (
														<Fragment>
															<HiOutlineCog className="w-4 h-4 mr-2" />
															Start Mapping
														</Fragment>
													)}
												</button>

												<button
													onClick={resetForm}
													className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
												>
													Reset
												</button>
											</div>
										</>
									)}
								</div>
							</div>
						)}

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

								{migrationStats && (<MigrationStats
									migrationStats={migrationStats}
									getProgressPercentage={getProgressPercentage}
								/>)}

								<ProgressBar
									getStatusIcon={getStatusIcon}
									migrationProgress={migrationProgress}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</AppLayout>
	);
};

export default Migrations;