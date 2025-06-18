import React, { useState, useRef, FunctionComponent } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlineCheckCircle, HiOutlineFolder, HiOutlineXCircle } from 'react-icons/hi2';
import { HiOutlineDatabase, HiOutlineExclamation, HiOutlineUpload } from 'react-icons/hi';
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
				return <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />;
			case 'error':
				return <HiOutlineXCircle className="w-5 h-5 text-red-500" />;
			case 'processing':
				return <FaSpinner className="w-5 h-5 text-blue-500 animate-spin" />;
			default:
				return <HiOutlineExclamation className="w-5 h-5 text-yellow-500" />;
		}
	};

	return (
		<AppLayout>
			<div className="p-6 min-h-screen max-w-full overflow-auto bg-gray-50">
				<div className="max-w-4xl mx-auto p-6 space-y-6 pb-36">
					<div className="bg-white dark:bg-gray-700 rounded-sm shadow-sm border p-6">
						<div className="flex items-center space-x-3 mb-4">
							<HiOutlineUpload className="w-6 h-6 text-blue-600" />
							<h2 className="text-lg font-semibold text-gray-900">Upload Migration File</h2>
						</div>

						<Input
							ref={tableNameInputRef}
							type="text"
							placeholder='Table name'
							onChange={handleOnTableNameChange}
							value={tableName}
							className="mb-4"
						/>

						<div
							className="border-2 border-dashed border-gray-300 rounded-sm p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
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
								<div className="space-y-2">
									<HiOutlineFolder className="w-12 h-12 text-green-600 mx-auto" />
									<p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
									<p className="text-xs text-gray-500">
										{(selectedFile.size / 1024).toFixed(1)} KB
									</p>
								</div>
							) : (
								<div className="space-y-2">
									<HiOutlineUpload className="w-12 h-12 text-gray-400 mx-auto" />
									<p className="text-sm text-gray-600">
										Drop your database file here or click to browse
									</p>
									<p className="text-xs text-gray-500">
										Supports .db, .json, .csv files
									</p>
								</div>
							)}
						</div>

						{uploadStatus && (
							<div className={`mt-4 p-4 rounded-sm ${uploadStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
								}`}>
								<div className="flex items-start space-x-2">
									{uploadStatus.type === 'success' ?
										<HiOutlineCheckCircle className="w-5 h-5 mt-0.5" /> :
										<HiOutlineXCircle className="w-5 h-5 mt-0.5" />
									}
									<p className="text-sm">{uploadStatus.message}</p>
								</div>
							</div>
						)}

						<div className="flex space-x-3 mt-6">
							<button
								onClick={uploadFile}
								disabled={!selectedFile || isUploading || !tableName}
								className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white dark:text-gray-100 rounded-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isUploading && <FaSpinner className="w-4 h-4 animate-spin" />}
								<span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
							</button>

							<button
								onClick={startMigration}
								disabled={!uploadStatus?.data || isMigrating || !tableName}
								className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white dark:text-gray-100 rounded-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isMigrating && <FaSpinner className="w-4 h-4 animate-spin" />}
								<HiOutlineDatabase className="w-4 h-4" />
								<span>{isMigrating ? 'Migrating...' : 'Start Migration'}</span>
							</button>

							<button
								onClick={resetForm}
								className="px-4 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50"
							>
								Reset
							</button>
						</div>
					</div>

					{migrationProgress.length > 0 && (
						<div className="bg-white dark:bg-gray-700 rounded-sm shadow-sm border p-6">
							<div className="flex items-center space-x-3 mb-4">
								<HiOutlineDatabase className="w-6 h-6 text-green-600" />
								<h2 className="text-lg font-semibold text-gray-900">Migration Progress</h2>
							</div>

							{migrationStats && (
								<div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-sm">
									<div className="text-center">
										<p className="text-2xl font-bold text-blue-600">{migrationStats.total}</p>
										<p className="text-sm text-gray-600">Total Records</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-green-600">{migrationStats.completed}</p>
										<p className="text-sm text-gray-600">Completed</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-red-600">{migrationStats.errors}</p>
										<p className="text-sm text-gray-600">Errors</p>
									</div>
								</div>
							)}

							<div className="space-y-3 min-h-screen max-w-full overflow-y-auto">
								{migrationProgress.map((item, index) => (
									<div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-sm">
										{getStatusIcon(item.status)}
										<div className="flex-1">
											<p className="text-sm font-medium text-gray-900">
												{item.table || item.message}
											</p>
											{item.details && (
												<p className="text-xs text-gray-500">{item.details}</p>
											)}
										</div>
										<div className="text-right">
											<p className="text-xs text-gray-500">{item.timestamp}</p>
											{item.recordCount && (
												<p className="text-xs text-blue-600">{item.recordCount} records</p>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</AppLayout>
	);
};

export default Migrations;