import React, { useState, useEffect } from 'react';
import { Key, Monitor, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface ActivationData {
	clientId: string;
	authToken: string;
	workstationName: string;
}

interface DeviceInfo {
	os: string;
	version: string;
	macAddress: string;
	hostname: string;
}

const WorkstationActivation: React.FC = () => {
	const [step, setStep] = useState<'input' | 'activating' | 'success' | 'error'>('input');
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [formData, setFormData] = useState<ActivationData>({
		clientId: '',
		authToken: '',
		workstationName: ''
	});
	const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		// Get device information
		const getDeviceInfo = async () => {
			try {
				// In Electron, you can access system info
				const info: DeviceInfo = {
					os: navigator.platform,
					version: navigator.appVersion,
					macAddress: await getMacAddress(), // Custom function
					hostname: await getHostname() // Custom function
				};
				setDeviceInfo(info);
			} catch (error) {
				console.error('Failed to get device info:', error);
			}
		};

		// Monitor online status
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		getDeviceInfo();

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	// Mock functions - replace with actual Electron API calls
	const getMacAddress = async (): Promise<string> => {
		// In real implementation, use Electron's main process to get MAC address
		return 'XX:XX:XX:XX:XX:XX';
	};

	const getHostname = async (): Promise<string> => {
		// In real implementation, use os.hostname() from Electron
		return 'WORKSTATION-001';
	};

	const handleInputChange = (field: keyof ActivationData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const validateCredentials = (): boolean => {
		if (!formData.clientId.trim()) {
			setErrorMessage('Client ID is required');
			return false;
		}
		if (!formData.authToken.trim()) {
			setErrorMessage('Auth Token is required');
			return false;
		}
		if (!formData.workstationName.trim()) {
			setErrorMessage('Workstation name is required');
			return false;
		}
		return true;
	};

	const handleActivation = async () => {
		if (!validateCredentials()) return;
		if (!isOnline) {
			setErrorMessage('Internet connection required for activation');
			return;
		}

		setStep('activating');
		setErrorMessage('');

		try {
			const activationData = {
				clientId: formData.clientId,
				authToken: formData.authToken,
				workstationName: formData.workstationName,
				deviceInfo
			};

			const response = await fetch('/api/workstations/activate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${formData.authToken}`
				},
				body: JSON.stringify(activationData)
			});

			if (response.ok) {
				const result = await response.json();

				// Store activation data locally
				localStorage.setItem('workstation_config', JSON.stringify({
					shopId: result.shopId,
					workstationId: result.workstationId,
					clientId: formData.clientId,
					isActivated: true,
					activatedAt: new Date().toISOString()
				}));

				// Download shop settings
				await downloadShopSettings(result.shopId, formData.authToken);

				setStep('success');
			} else {
				const error = await response.json();
				throw new Error(error.message || 'Activation failed');
			}
		} catch (error) {
			console.error('Activation error:', error);
			setErrorMessage(error instanceof Error ? error.message : 'Activation failed');
			setStep('error');
		}
	};

	const downloadShopSettings = async (shopId: string, token: string) => {
		try {
			const response = await fetch(`/api/shops/${shopId}/settings`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				const settings = await response.json();
				localStorage.setItem('shop_settings', JSON.stringify(settings));
			}
		} catch (error) {
			console.error('Failed to download shop settings:', error);
		}
	};

	const renderInputStep = () => (
		<div className="space-y-6">
			<div className="text-center mb-8">
				<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<Key className="w-8 h-8 text-blue-600" />
				</div>
				<h2 className="text-2xl font-bold text-gray-800 dark:text-gray-400">Activate Workstation</h2>
				<p className="text-gray-600 mt-2">
					Enter the credentials provided by your administrator
				</p>
			</div>

			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Client ID *
					</label>
					<input
						type="text"
						value={formData.clientId}
						onChange={(e) => handleInputChange('clientId', e.target.value)}
						placeholder="Enter client ID from email"
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Auth Token *
					</label>
					<textarea
						value={formData.authToken}
						onChange={(e) => handleInputChange('authToken', e.target.value)}
						placeholder="Paste auth token from email"
						rows={3}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Workstation Name *
					</label>
					<input
						type="text"
						value={formData.workstationName}
						onChange={(e) => handleInputChange('workstationName', e.target.value)}
						placeholder="e.g., Till-01, Counter-A"
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</div>

			{deviceInfo && (
				<div className="bg-gray-50 rounded-lg p-4">
					<h3 className="font-medium text-gray-800 dark:text-gray-400 mb-2 flex items-center">
						<Monitor className="w-4 h-4 mr-2" />
						Device Information
					</h3>
					<div className="text-sm text-gray-600 space-y-1">
						<div>OS: {deviceInfo.os}</div>
						<div>Hostname: {deviceInfo.hostname}</div>
						<div>MAC: {deviceInfo.macAddress}</div>
					</div>
				</div>
			)}

			<div className="flex items-center justify-between pt-4">
				<div className="flex items-center">
					{isOnline ? (
						<div className="flex items-center text-green-600">
							<Wifi className="w-4 h-4 mr-1" />
							<span className="text-sm">Online</span>
						</div>
					) : (
						<div className="flex items-center text-red-600">
							<WifiOff className="w-4 h-4 mr-1" />
							<span className="text-sm">Offline</span>
						</div>
					)}
				</div>

				<button
					onClick={handleActivation}
					disabled={!isOnline}
					className="px-6 py-3 bg-blue-600 text-white dark:text-gray-100 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					Activate Workstation
				</button>
			</div>

			{errorMessage && (
				<div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
					<AlertCircle className="w-5 h-5 text-red-600 mr-2" />
					<span className="text-red-700">{errorMessage}</span>
				</div>
			)}
		</div>
	);

	const renderActivatingStep = () => (
		<div className="text-center space-y-6">
			<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
			<div>
				<h2 className="text-2xl font-bold text-gray-800 dark:text-gray-400">Activating...</h2>
				<p className="text-gray-600 mt-2">
					Connecting to server and downloading shop settings
				</p>
			</div>
			<div className="bg-gray-50 rounded-lg p-4 text-left">
				<div className="space-y-2 text-sm text-gray-600">
					<div className="flex items-center">
						<div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
						Verifying credentials...
					</div>
					<div className="flex items-center">
						<div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
						Registering workstation...
					</div>
					<div className="flex items-center">
						<div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
						Downloading settings...
					</div>
				</div>
			</div>
		</div>
	);

	const renderSuccessStep = () => (
		<div className="text-center space-y-6">
			<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
				<CheckCircle className="w-8 h-8 text-green-600" />
			</div>
			<div>
				<h2 className="text-2xl font-bold text-gray-800 dark:text-gray-400">Activation Complete!</h2>
				<p className="text-gray-600 mt-2">
					Your workstation has been successfully activated and is ready to use.
				</p>
			</div>
			<div className="bg-green-50 border border-green-200 rounded-lg p-4">
				<h3 className="font-medium text-green-800 mb-2">What's Next?</h3>
				<ul className="text-sm text-green-700 space-y-1 text-left">
					<li>• Shop settings have been downloaded</li>
					<li>• Workstation is registered in the system</li>
					<li>• You can now create local users</li>
					<li>• Data will sync when online</li>
				</ul>
			</div>
			<button
				onClick={() => window.location.reload()}
				className="px-6 py-3 bg-green-600 text-white dark:text-gray-100 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
			>
				Continue to Dashboard
			</button>
		</div>
	);

	const renderErrorStep = () => (
		<div className="text-center space-y-6">
			<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
				<AlertCircle className="w-8 h-8 text-red-600" />
			</div>
			<div>
				<h2 className="text-2xl font-bold text-gray-800 dark:text-gray-400">Activation Failed</h2>
				<p className="text-gray-600 mt-2">
					There was an error activating your workstation.
				</p>
			</div>
			<div className="bg-red-50 border border-red-200 rounded-lg p-4">
				<p className="text-red-700">{errorMessage}</p>
			</div>
			<div className="space-y-3">
				<button
					onClick={() => setStep('input')}
					className="w-full px-6 py-3 bg-blue-600 text-white dark:text-gray-100 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
				>
					Try Again
				</button>
				<p className="text-sm text-gray-500">
					If the problem persists, contact your administrator
				</p>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
			<div className="bg-white dark:bg-gray-700 rounded-2xl shadow-2xl p-8 max-w-md w-full">
				{step === 'input' && renderInputStep()}
				{step === 'activating' && renderActivatingStep()}
				{step === 'success' && renderSuccessStep()}
				{step === 'error' && renderErrorStep()}
			</div>
		</div>
	);
};

export default WorkstationActivation;